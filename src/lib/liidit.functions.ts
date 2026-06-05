import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LIIDI_KATEGORIAT } from "@/lib/liidit-kategoriat";
import { omistajanIlmoitus, lahetaEmail } from "@/lib/email.server";
import { paateleMaakunta, MAAKUNNAT } from "@/lib/maakunnat";

const kategoriaSchema = z.enum(LIIDI_KATEGORIAT as unknown as [string, ...string[]]);
const maakuntaSchema = z.enum(MAAKUNNAT as unknown as [string, ...string[]]);

const STATUS_VALUES = ["uusi", "kasittelyssa", "valitetty", "valmis", "peruutettu"] as const;
const statusSchema = z.enum(STATUS_VALUES);

const luoLiidiSchema = z.object({
  kiinteisto_id: z.string().uuid(),
  palvelu: z.enum(["kuntoarvio", "huolto", "tarjouspyynto"]),
  kategoria: kategoriaSchema,
  kuvaus: z.string().max(2000).optional().nullable(),
  nimi: z.string().trim().min(1).max(150),
  puhelin: z.string().trim().min(4).max(40),
  sahkoposti: z.string().trim().email().max(200),
  lisatieto: z.string().max(2000).optional().nullable(),
  pts_kohde: z.string().max(200).optional().nullable(),
});

async function vaadiAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Vain ylläpitäjä voi suorittaa tämän toiminnon");
}

// -------------------- Käyttäjän liidit --------------------

export const getOmatLiidit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("liidit")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

const TALON_TIEDOT_KENTAT = [
  "kiinteisto_id",
  "lammitysmuoto", "lammitys_asennettu_vuosi",
  "ilp_merkki", "ilp_malli", "ilp_asennettu_vuosi",
  "ilmanvaihto", "ilmanvaihto_vuosi", "iv_suodatintyyppi", "iv_suodatin_vaihdettu",
  "kattotyyppi", "kattomateriaali", "katto_uusittu_vuosi", "katto_pinta_ala",
  "raystaat_kunnostettu_vuosi", "kattoturvatuotteet",
  "putkimateriaali", "putket_uusittu_vuosi", "viemarimateriaali", "viemari_asennettu_vuosi",
  "sahkot_asennettu_vuosi", "paasulun_sijainti",
  "julkisivumateriaali", "julkisivu_maalattu_vuosi", "julkisivu_asennettu_vuosi",
  "ikkunat_tyyppi", "ikkunat_uusittu_vuosi",
  "terassi_materiaali", "terassi_rakennettu_vuosi", "terassi_lasitettu", "terassi_lasitus_vuosi", "terassi_kunnostettu_vuosi", "terassi_pinta_ala",
  "salaojat", "salaojat_tarkastettu", "kourun_materiaali", "kourun_pituus", "syoksytorvet", "sadevesikaivot",
  "kiukaan_vuosi", "nuohous_pvm", "hormit",
  "pihan_tyyppi", "nurmikon_pinta_ala", "tontin_pinta_ala",
  "pinta_ala",
].join(", ");

export const getOmatKiinteistot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: kt } = await supabase
      .from("kiinteistot")
      .select("id, nimi, osoite, postinumero, kaupunki, rakennusvuosi")
      .eq("user_id", userId)
      .eq("aktiivinen", true)
      .order("created_at", { ascending: true });
    const ids = (kt ?? []).map((k: any) => k.id);
    const talotByKt: Record<string, any> = {};
    if (ids.length > 0) {
      const { data: tt } = await supabase
        .from("talon_tiedot")
        .select(TALON_TIEDOT_KENTAT)
        .in("kiinteisto_id", ids);
      for (const t of (tt ?? []) as any[]) talotByKt[t.kiinteisto_id] = t;
    }
    const { data: prof } = await supabase.from("profiles").select("valittu_kiinteisto_id, nimi, email, puhelin").eq("id", userId).maybeSingle();
    return {
      kiinteistot: (kt ?? []).map((k: any) => ({
        ...k,
        lammitysmuoto: talotByKt[k.id]?.lammitysmuoto ?? null,
        talon_tiedot: talotByKt[k.id] ?? null,
      })),
      valittu_id: prof?.valittu_kiinteisto_id ?? (kt?.[0]?.id ?? null),
      profile: prof ?? null,
    };
  });

export const luoLiidi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => luoLiidiSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Varmista kiinteistön omistus
    const { data: kt, error: ktErr } = await supabase
      .from("kiinteistot")
      .select("id, osoite, postinumero, kaupunki, rakennusvuosi")
      .eq("id", data.kiinteisto_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (ktErr || !kt) throw new Error("Kiinteistöä ei löytynyt");

    const { data: tt } = await supabase
      .from("talon_tiedot")
      .select("lammitysmuoto")
      .eq("kiinteisto_id", kt.id)
      .maybeSingle();

    const osoiteRivi = [kt.osoite, [kt.postinumero, kt.kaupunki].filter(Boolean).join(" ")].filter(Boolean).join(", ") || null;

    const liidiRow: any = {
      user_id: userId,
      kiinteisto_id: kt.id,
      palvelu: data.palvelu,
      kategoria: data.kategoria,
      kuvaus: data.kuvaus ?? null,
      nimi: data.nimi,
      puhelin: data.puhelin,
      sahkoposti: data.sahkoposti,
      lisatieto: data.lisatieto ?? null,
      osoite: osoiteRivi,
      kaupunki: kt.kaupunki ?? null,
      rakennus_vuosi: kt.rakennusvuosi ?? null,
      lammitys: tt?.lammitysmuoto ?? null,
      pts_kohde: data.pts_kohde ?? null,
      status: "uusi",
    };

    const { data: inserted, error: insErr } = await supabase
      .from("liidit")
      .insert(liidiRow)
      .select("*")
      .single();
    if (insErr) throw insErr;

    // Lähetä ilmoitus omistajalle välittömästi
    const ownerEmail = process.env.OWNER_EMAIL;
    if (ownerEmail) {
      try {
        const adminUrl = process.env.PUBLIC_APP_URL
          ? `${process.env.PUBLIC_APP_URL.replace(/\/$/, "")}/admin`
          : "/admin";
        const msg = omistajanIlmoitus(liidiRow, { adminUrl });
        const tulos = await lahetaEmail({ to: ownerEmail, subject: msg.subject, html: msg.html });
        if (tulos.ok) {
          await supabase
            .from("liidit")
            .update({ lahetetty_at: new Date().toISOString() })
            .eq("id", inserted.id);
        }
      } catch (e) {
        console.error("Omistajan ilmoituksen lähetys epäonnistui", e);
      }
    } else {
      console.warn("OWNER_EMAIL puuttuu – omistajalle ei lähetetty ilmoitusta");
    }

    return { ok: true, id: inserted.id };
  });

// -------------------- Admin: liidit --------------------

export const onkoAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    return { admin: !!data };
  });

export const getAdminLiidit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("liidit")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getUusienLiidienMaara = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: roolit } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roolit) return { count: 0, admin: false };
    const { count } = await supabase
      .from("liidit")
      .select("id", { count: "exact", head: true })
      .eq("status", "uusi");
    return { count: count ?? 0, admin: true };
  });

export const paivitaLiidinStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    id: z.string().uuid(),
    status: statusSchema,
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { error } = await supabase.from("liidit").update({ status: data.status }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// -------------------- Admin: ammattilaiset --------------------

const ammSchema = z.object({
  kategoria: kategoriaSchema,
  yritys: z.string().trim().min(1).max(200),
  sahkoposti: z.string().trim().email().max(200),
  puhelin: z.string().trim().max(40).optional().nullable(),
  aktiivinen: z.boolean().default(true),
  prioriteetti: z.number().int().min(1).max(99).default(1),
});

export const getAmmattilaiset = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("ammattilaiset")
      .select("*")
      .order("kategoria")
      .order("prioriteetti");
    if (error) throw error;
    return data ?? [];
  });

export const lisaaAmmattilainen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => ammSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { error } = await supabase.from("ammattilaiset").insert(data);
    if (error) throw error;
    return { ok: true };
  });

export const paivitaAmmattilainen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).merge(ammSchema.partial()).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { id, ...patch } = data;
    const { error } = await supabase.from("ammattilaiset").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const poistaAmmattilainen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { error } = await supabase.from("ammattilaiset").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// -------------------- Admin: asetukset --------------------

export const getLiidiAsetukset = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { data, error } = await supabase.from("liidi_asetukset").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return data ?? { automaatio_paalla: false };
  });

export const paivitaLiidiAsetukset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ automaatio_paalla: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await vaadiAdmin(supabase, userId);
    const { data: olemassa } = await supabase.from("liidi_asetukset").select("id").limit(1).maybeSingle();
    if (olemassa?.id) {
      const { error } = await supabase.from("liidi_asetukset").update({ automaatio_paalla: data.automaatio_paalla }).eq("id", olemassa.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("liidi_asetukset").insert({ automaatio_paalla: data.automaatio_paalla });
      if (error) throw error;
    }
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generoiAutoRivit, getHuoltovali, laskeTila, type PtsRivi } from "./pts-saannot";

// ---------- Active kiinteistö ----------
async function getActiveKiinteisto(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("kiinteistot")
    .select("*")
    .eq("user_id", userId)
    .eq("aktiivinen", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ---------- Dashboard yhteenveto ----------
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const kiinteisto = await getActiveKiinteisto(supabase, userId);
    if (!kiinteisto) return { kiinteisto: null, talo: null, huollot: [], kulutSumma: 0, edistyminen: 0 };

    const [taloRes, huoltoRes, kuluRes, profRes] = await Promise.all([
      supabase.from("talon_tiedot").select("*").eq("kiinteisto_id", kiinteisto.id).maybeSingle(),
      supabase.from("huolto_historia").select("*").eq("kiinteisto_id", kiinteisto.id).order("pvm", { ascending: false }).limit(5),
      supabase.from("kulut").select("summa, pvm, kategoria").eq("kiinteisto_id", kiinteisto.id).gte("pvm", `${new Date().getFullYear()}-01-01`),
      supabase.from("profiles").select("nimi").eq("id", userId).maybeSingle(),
    ]);

    const talo = taloRes.data;
    const valmiit = Array.isArray(talo?.valmiit_osiot) ? talo.valmiit_osiot.length : 0;
    const edistyminen = Math.round((valmiit / 6) * 100);
    const kulutSumma = (kuluRes.data ?? []).reduce((a: number, r: any) => a + Number(r.summa || 0), 0);

    return {
      kiinteisto,
      talo,
      huollot: huoltoRes.data ?? [],
      kulut: kuluRes.data ?? [],
      kulutSumma,
      edistyminen,
      valmiitOsiot: valmiit,
      nimi: profRes.data?.nimi ?? null,
    };
  });

// ---------- Talon tiedot ----------
export const getTaloTiedot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { kiinteisto: null, talo: null, profile: null, dokumentit: [] };
    const [taloRes, profRes, dokRes] = await Promise.all([
      supabase.from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle(),
      supabase.from("profiles").select("nimi, email, puhelin").eq("id", userId).maybeSingle(),
      supabase.from("talo_dokumentit").select("*").eq("kiinteisto_id", k.id).order("created_at", { ascending: false }),
    ]);
    return { kiinteisto: k, talo: taloRes.data, profile: profRes.data, dokumentit: dokRes.data ?? [] };
  });

const taloSchema = z.object({
  profile: z.object({
    nimi: z.string().optional().nullable(),
    puhelin: z.string().optional().nullable(),
  }).optional(),
  kiinteisto: z.object({
    nimi: z.string().optional().nullable(),
    osoite: z.string().optional().nullable(),
    postinumero: z.string().optional().nullable(),
    kaupunki: z.string().optional().nullable(),
    rakennusvuosi: z.number().int().optional().nullable(),
    tyyppi: z.string().optional().nullable(),
    hankintatapa: z.string().optional().nullable(),
    hankinta_vuosi: z.number().int().optional().nullable(),
  }),
  talo: z.object({
    pinta_ala: z.number().optional().nullable(),
    kokonaispinta_ala: z.number().optional().nullable(),
    tilavuus: z.number().optional().nullable(),
    kerroksia: z.number().int().optional().nullable(),
    asukkaita: z.number().int().optional().nullable(),
    rakennustapa: z.string().optional().nullable(),
    julkisivumateriaali: z.string().optional().nullable(),
    julkisivu_maalattu_vuosi: z.number().int().optional().nullable(),
    perustus: z.string().optional().nullable(),
    eriste: z.string().optional().nullable(),
    rakennus_lisatieto: z.string().optional().nullable(),
    kattotyyppi: z.string().optional().nullable(),
    kattomateriaali: z.string().optional().nullable(),
    katto_uusittu_vuosi: z.number().int().optional().nullable(),
    katto_pinta_ala: z.number().optional().nullable(),
    raystaat_kunnostettu_vuosi: z.number().int().optional().nullable(),
    hormit: z.string().optional().nullable(),
    kattoturvatuotteet: z.string().optional().nullable(),
    kourun_pituus: z.number().optional().nullable(),
    kourun_materiaali: z.string().optional().nullable(),
    syoksytorvet: z.number().int().optional().nullable(),
    lammitysmuoto: z.string().optional().nullable(),
    lammitys_asennettu_vuosi: z.number().int().optional().nullable(),
    ilp_merkki: z.string().optional().nullable(),
    ilp_malli: z.string().optional().nullable(),
    ilp_asennettu_vuosi: z.number().int().optional().nullable(),
    ilmanvaihto: z.string().optional().nullable(),
    ilmanvaihto_vuosi: z.number().int().optional().nullable(),
    iv_suodatintyyppi: z.string().optional().nullable(),
    iv_suodatin_vaihdettu: z.string().optional().nullable(),
    putket_uusittu_vuosi: z.number().int().optional().nullable(),
    putkimateriaali: z.string().optional().nullable(),
    viemarimateriaali: z.string().optional().nullable(),
    viemari_asennettu_vuosi: z.number().int().optional().nullable(),
    paasulun_sijainti: z.string().optional().nullable(),
    sahkot_asennettu_vuosi: z.number().int().optional().nullable(),
    palovaroittimia: z.number().int().optional().nullable(),
    palovaroitin_paristot: z.string().optional().nullable(),
    kiukaan_vuosi: z.number().int().optional().nullable(),
    nuohous_pvm: z.string().optional().nullable(),
    tontin_pinta_ala: z.number().optional().nullable(),
    nurmikon_pinta_ala: z.number().optional().nullable(),
    sadevesikaivot: z.number().int().optional().nullable(),
    pihan_tyyppi: z.string().optional().nullable(),
    piha_lisatieto: z.string().optional().nullable(),
    terassi_materiaali: z.string().optional().nullable(),
    terassi_pinta_ala: z.number().optional().nullable(),
    terassi_rakennettu_vuosi: z.number().int().optional().nullable(),
    terassi_kunnostettu_vuosi: z.number().int().optional().nullable(),
    salaojat: z.boolean().optional().nullable(),
    salaojat_tarkastettu: z.string().optional().nullable(),
    lammitys_lisatieto: z.record(z.string(), z.any()).optional().nullable(),
    valmiit_osiot: z.array(z.string()).optional(),
  }),
});

export const saveTaloTiedot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => taloSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    if (data.profile) {
      const { error: pErr } = await supabase.from("profiles").update(data.profile).eq("id", userId);
      if (pErr) throw pErr;
    }
    const { error: kErr } = await supabase.from("kiinteistot").update(data.kiinteisto).eq("id", k.id);
    if (kErr) throw kErr;
    const { error: tErr } = await supabase.from("talon_tiedot").update(data.talo).eq("kiinteisto_id", k.id);
    if (tErr) throw tErr;
    return { ok: true };
  });

// ---------- Dokumentit ----------
const dokSchema = z.object({
  nimi: z.string().min(1).max(300),
  tyyppi: z.enum(["dokumentti", "takuu", "kuitti", "lasku"]).default("dokumentti"),
  tiedosto_polku: z.string().min(1).max(500),
  mime: z.string().max(150).optional().nullable(),
  koko_bytes: z.number().int().optional().nullable(),
  kuvaus: z.string().max(1000).optional().nullable(),
});

export const addDokumentti = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => dokSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase.from("talo_dokumentit").insert({ kiinteisto_id: k.id, ...data });
    if (error) throw error;
    return { ok: true };
  });

export const deleteDokumentti = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), tiedosto_polku: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await supabase.storage.from("talo-dokumentit").remove([data.tiedosto_polku]);
    const { error } = await supabase.from("talo_dokumentit").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const getDokumenttiUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ polku: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage.from("talo-dokumentit").createSignedUrl(data.polku, 300);
    if (error) throw error;
    return { url: signed.signedUrl };
  });

// ---------- Huoltohistoria ----------
export const getHuollot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return [];
    const { data: huollot } = await supabase
      .from("huolto_historia")
      .select("*")
      .eq("kiinteisto_id", k.id)
      .order("pvm", { ascending: false });
    const ids = (huollot ?? []).map((h: any) => h.id);
    let liiteByHuolto: Record<string, any[]> = {};
    if (ids.length > 0) {
      const { data: liitteet } = await supabase
        .from("talo_dokumentit")
        .select("*")
        .in("huolto_id", ids);
      for (const l of liitteet ?? []) {
        if (l.huolto_id) (liiteByHuolto[l.huolto_id as string] ||= []).push(l);
      }
    }
    return (huollot ?? []).map((h: any) => ({ ...h, liitteet: liiteByHuolto[h.id] ?? [] }));
  });

const liiteSchema = z.object({
  nimi: z.string().min(1).max(300),
  tiedosto_polku: z.string().min(1).max(500),
  mime: z.string().max(150).optional().nullable(),
  koko_bytes: z.number().int().optional().nullable(),
});

const huoltoSchema = z.object({
  tyyppi: z.string().min(1),
  kategoria: z.string().optional().nullable(),
  kohde: z.string().optional().nullable(),
  kuvaus: z.string().optional().nullable(),
  pvm: z.string().min(1),
  tekija: z.string().default("itse"),
  tekija_nimi: z.string().optional().nullable(),
  kustannus: z.number().default(0),
  takuu_vuotta: z.number().int().default(0),
  pts_siirto: z.number().int().min(0).max(50).default(0),
  liitteet: z.array(liiteSchema).optional().default([]),
});

async function insertLiitteet(supabase: any, kiinteistoId: string, huoltoId: string, liitteet: any[]) {
  if (!liitteet || liitteet.length === 0) return;
  const rows = liitteet.map((l) => ({
    kiinteisto_id: kiinteistoId,
    huolto_id: huoltoId,
    nimi: l.nimi,
    tiedosto_polku: l.tiedosto_polku,
    mime: l.mime ?? null,
    koko_bytes: l.koko_bytes ?? null,
    tyyppi: "kuitti",
  }));
  const { error } = await supabase.from("talo_dokumentit").insert(rows);
  if (error) throw error;
}

export const addHuolto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => huoltoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { liitteet, ...row } = data;
    const { data: inserted, error } = await supabase
      .from("huolto_historia")
      .insert({ kiinteisto_id: k.id, ...row })
      .select("id")
      .single();
    if (error) throw error;
    await insertLiitteet(supabase, k.id, inserted.id, liitteet);
    if (Number(data.kustannus) > 0) {
      await supabase.from("kulut").insert({
        kiinteisto_id: k.id,
        nimi: `${data.tyyppi}${data.kohde ? ` – ${data.kohde}` : ""}`,
        kategoria: "huolto",
        summa: data.kustannus,
        pvm: data.pvm,
      });
    }
    return { ok: true };
  });

const updateHuoltoSchema = huoltoSchema.partial().extend({ id: z.string().uuid() });

export const updateHuolto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateHuoltoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { id, liitteet, ...patch } = data;
    const { error } = await supabase.from("huolto_historia").update(patch).eq("id", id);
    if (error) throw error;
    await insertLiitteet(supabase, k.id, id, liitteet ?? []);
    return { ok: true };
  });

export const deleteHuolto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // Poista linkitetyt liitteet storagesta
    const { data: liitteet } = await supabase
      .from("talo_dokumentit")
      .select("tiedosto_polku")
      .eq("huolto_id", data.id);
    const paths = (liitteet ?? []).map((l: any) => l.tiedosto_polku);
    if (paths.length > 0) {
      await supabase.storage.from("talo-dokumentit").remove(paths);
    }
    const { error } = await supabase.from("huolto_historia").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteHuoltoLiite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), tiedosto_polku: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await supabase.storage.from("talo-dokumentit").remove([data.tiedosto_polku]);
    const { error } = await supabase.from("talo_dokumentit").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Vuosikello ----------
export const getKuitatut = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { kuitatut: [], talon_tiedot: null };
    const vuosi = new Date().getFullYear();
    const [kuitatutRes, talonRes] = await Promise.all([
      supabase.from("vk_kuitatut").select("*").eq("kiinteisto_id", k.id).eq("vuosi", vuosi),
      supabase.from("talon_tiedot").select("lammitysmuoto, ilp_merkki, ilmanvaihto, kattomateriaali, terassi_materiaali, julkisivumateriaali").eq("kiinteisto_id", k.id).maybeSingle(),
    ]);
    return { kuitatut: kuitatutRes.data ?? [], talon_tiedot: talonRes.data };
  });

const KAUSI_NIMI: Record<string, string> = {
  kevat: "Kevät", kesa: "Kesä", syksy: "Syksy", talvi: "Talvi", ympari_vuoden: "Ympäri vuoden",
};

const kuittausSchema = z.object({
  kausi_key: z.string().min(1).max(50),
  huolto_nimi: z.string().min(1).max(200),
  tekija: z.enum(["itse", "ammattilainen", "jatetaan"]).default("itse"),
  tekija_nimi: z.string().max(200).optional().nullable(),
  hinta: z.number().min(0).max(1000000).default(0),
});

export const kuittaaHuolto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => kuittausSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const vuosi = new Date().getFullYear();
    const pvm = new Date().toISOString().slice(0, 10);

    // Hae olemassa oleva kuittaus + linkitetty historiarivi
    const { data: existing } = await supabase
      .from("vk_kuitatut").select("id, historia_id")
      .eq("kiinteisto_id", k.id).eq("kausi_key", data.kausi_key)
      .eq("huolto_nimi", data.huolto_nimi).eq("vuosi", vuosi).maybeSingle();

    let historia_id: string | null = existing?.historia_id ?? null;

    if (data.tekija === "jatetaan") {
      // Poista linkitetty historia jos olemassa
      if (historia_id) {
        await supabase.from("huolto_historia").delete().eq("id", historia_id);
        historia_id = null;
      }
    } else {
      const huoltoRow = {
        kiinteisto_id: k.id,
        tyyppi: data.huolto_nimi,
        kategoria: KAUSI_NIMI[data.kausi_key] ?? "Vuosikello",
        kohde: "Vuosikello",
        pvm,
        tekija: data.tekija,
        tekija_nimi: data.tekija_nimi ?? null,
        kustannus: data.hinta,
      };
      if (historia_id) {
        const { error } = await supabase.from("huolto_historia").update(huoltoRow).eq("id", historia_id);
        if (error) throw error;
      } else {
        const { data: ins, error } = await supabase.from("huolto_historia").insert(huoltoRow).select("id").single();
        if (error) throw error;
        historia_id = ins.id;
      }
    }

    const { tekija_nimi: _tn, ...row } = data;
    const { error } = await supabase.from("vk_kuitatut").upsert({
      kiinteisto_id: k.id, vuosi, kuitattu_pvm: pvm, historia_id, ...row,
    }, { onConflict: "kiinteisto_id,kausi_key,huolto_nimi,vuosi" });
    if (error) throw error;

    return { ok: true };
  });

// ---------- Kulut ----------
export const getKulut = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { kulut: [], asetukset: null };
    const [kulutRes, asetuksetRes] = await Promise.all([
      supabase.from("kulut").select("*").eq("kiinteisto_id", k.id).order("pvm", { ascending: false }),
      supabase.from("kulu_asetukset").select("*").eq("kiinteisto_id", k.id).maybeSingle(),
    ]);
    return { kulut: kulutRes.data ?? [], asetukset: asetuksetRes.data };
  });

const kuluSchema = z.object({
  nimi: z.string().min(1),
  kategoria: z.string().default("muu"),
  summa: z.number().min(0),
  pvm: z.string().min(1),
  kwh: z.number().optional().nullable(),
  mittarilukema: z.number().optional().nullable(),
  kulutus_m3: z.number().optional().nullable(),
  kuvaus: z.string().optional().nullable(),
});

export const addKulu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => kuluSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase.from("kulut").insert({ kiinteisto_id: k.id, ...data });
    if (error) throw error;

    // Jos mittarilukema vesi → tallenna asetuksiin edelliseksi
    if (data.kategoria === "vesi" && data.mittarilukema != null) {
      await supabase.from("kulu_asetukset").update({ edellinen_mittarilukema: data.mittarilukema }).eq("kiinteisto_id", k.id);
    }
    return { ok: true };
  });

export const deleteKulu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("kulut").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const asetuksetSchema = z.object({
  sahko_energia_snt: z.number(),
  sahko_siirto_snt: z.number(),
  vesi_puhdas_eur_m3: z.number(),
  vesi_jatevesi_eur_m3: z.number(),
});

export const saveAsetukset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => asetuksetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase.from("kulu_asetukset").update(data).eq("kiinteisto_id", k.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- PTS-suunnitelma ----------
export const getPts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { rivit: [], talonTiedotPuuttuu: true };
    const [taloRes, huoltoRes, omatRes, kuitatutRes, lykkaysRes] = await Promise.all([
      supabase.from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle(),
      supabase.from("huolto_historia").select("kohde, pts_siirto").eq("kiinteisto_id", k.id),
      supabase.from("pts_rivit").select("*").eq("kiinteisto_id", k.id),
      supabase.from("pts_kuitatut").select("kohde").eq("kiinteisto_id", k.id),
      supabase.from("pts_lykkaykset").select("kohde, lykatty_vuoteen, peruste").eq("kiinteisto_id", k.id),
    ]);
    const talo = taloRes.data ? { ...taloRes.data, rakennusvuosi: k.rakennusvuosi } : null;
    const auto = generoiAutoRivit(talo, huoltoRes.data ?? [], kuitatutRes.data ?? [], 10, lykkaysRes.data ?? []);
    const nyt = new Date().getFullYear();
    const omat: PtsRivi[] = (omatRes.data ?? []).map((r: any) => {
      const jaljella = r.vuosi - nyt;
      return {
        id: r.id,
        lahde: "oma" as const,
        kohde: r.kohde,
        kategoria: "Oma",
        vuosi: r.vuosi,
        vuosiaJaljella: jaljella,
        tila: laskeTila(jaljella),
        kuvaus: r.kuvaus,
        huoltovali: 0,
      };
    });
    const rivit = [...auto, ...omat].sort((a, b) => a.vuosi - b.vuosi);
    const talonTiedotPuuttuu = !talo || (!talo.lammitysmuoto && !talo.kattomateriaali && !talo.rakennusvuosi);
    return { rivit, talonTiedotPuuttuu };
  });

const lykkaysSchema = z.object({
  kohde: z.string().min(1).max(200),
  lahde: z.enum(["auto", "oma"]),
  rivi_id: z.string().uuid().optional().nullable(),
  vuosia: z.number().int().min(1).max(30),
  peruste: z.string().max(1000).optional().nullable(),
});

export const lykkaaPtsRivi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => lykkaysSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const nyt = new Date().getFullYear();

    if (data.lahde === "oma") {
      if (!data.rivi_id) throw new Error("Rivin tunniste puuttuu");
      const { data: rivi, error: rErr } = await supabase
        .from("pts_rivit").select("vuosi").eq("id", data.rivi_id).maybeSingle();
      if (rErr) throw rErr;
      const uusiVuosi = Math.max(rivi?.vuosi ?? nyt, nyt) + data.vuosia;
      const lisays = data.peruste ? `\n[Siirretty ${data.vuosia} v eteenpäin: ${data.peruste}]` : `\n[Siirretty ${data.vuosia} v eteenpäin]`;
      const { error } = await supabase
        .from("pts_rivit")
        .update({ vuosi: uusiVuosi, kuvaus: lisays })
        .eq("id", data.rivi_id);
      if (error) throw error;
      return { ok: true };
    }

    // auto: päivitä tai luo lykkäys
    const { data: existing } = await supabase
      .from("pts_lykkaykset").select("lykatty_vuoteen")
      .eq("kiinteisto_id", k.id).eq("kohde", data.kohde).maybeSingle();
    const pohjaVuosi = Math.max(existing?.lykatty_vuoteen ?? nyt, nyt);
    const uusiVuosi = pohjaVuosi + data.vuosia;
    const { error } = await supabase
      .from("pts_lykkaykset")
      .upsert(
        { kiinteisto_id: k.id, kohde: data.kohde, lykatty_vuoteen: uusiVuosi, peruste: data.peruste ?? null },
        { onConflict: "kiinteisto_id,kohde" },
      );
    if (error) throw error;
    return { ok: true };
  });

export const peruLykkays = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ kohde: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase
      .from("pts_lykkaykset").delete()
      .eq("kiinteisto_id", k.id).eq("kohde", data.kohde);
    if (error) throw error;
    return { ok: true };
  });

const ptsRiviSchema = z.object({
  vuosi: z.number().int().min(2000).max(2100),
  kohde: z.string().min(1).max(200),
  kuvaus: z.string().max(2000).optional().nullable(),
});

export const addPtsRivi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ptsRiviSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase.from("pts_rivit").insert({ kiinteisto_id: k.id, ...data });
    if (error) throw error;
    return { ok: true };
  });

export const deletePtsRivi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pts_rivit").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const ptsKuittausSchema = z.object({
  kohde: z.string().min(1).max(200),
  lahde: z.enum(["auto", "oma"]),
  rivi_id: z.string().uuid().optional().nullable(),
  pvm: z.string().min(1),
  tekija: z.enum(["itse", "ammattilainen"]).default("itse"),
  tekija_nimi: z.string().max(200).optional().nullable(),
  kustannus: z.number().min(0).default(0),
  kuvaus: z.string().max(2000).optional().nullable(),
});

export const kuittaaPtsRivi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ptsKuittausSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const huoltovali = getHuoltovali(data.kohde);

    // Luo huoltohistoria-rivi
    const { data: hist, error: histErr } = await supabase
      .from("huolto_historia")
      .insert({
        kiinteisto_id: k.id,
        tyyppi: "huolto",
        kategoria: "PTS",
        kohde: data.kohde,
        pvm: data.pvm,
        tekija: data.tekija,
        tekija_nimi: data.tekija_nimi ?? null,
        kustannus: data.kustannus,
        kuvaus: data.kuvaus ?? null,
        pts_siirto: huoltovali,
      })
      .select("id")
      .single();
    if (histErr) throw histErr;

    // Kulu jos hinta
    if (Number(data.kustannus) > 0) {
      await supabase.from("kulut").insert({
        kiinteisto_id: k.id,
        nimi: `PTS – ${data.kohde}`,
        kategoria: "huolto",
        summa: data.kustannus,
        pvm: data.pvm,
      });
    }

    if (data.lahde === "oma" && data.rivi_id) {
      await supabase.from("pts_rivit").delete().eq("id", data.rivi_id);
    } else {
      await supabase.from("pts_kuitatut").upsert(
        { kiinteisto_id: k.id, kohde: data.kohde, historia_id: hist.id, kuitattu_pvm: data.pvm },
        { onConflict: "kiinteisto_id,kohde" },
      );
    }
    return { ok: true };
  });

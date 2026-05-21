import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    if (!k) return { kiinteisto: null, talo: null };
    const { data: talo } = await supabase.from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle();
    return { kiinteisto: k, talo };
  });

const taloSchema = z.object({
  kiinteisto: z.object({
    nimi: z.string().optional().nullable(),
    osoite: z.string().optional().nullable(),
    postinumero: z.string().optional().nullable(),
    kaupunki: z.string().optional().nullable(),
    rakennusvuosi: z.number().int().optional().nullable(),
    tyyppi: z.string().optional().nullable(),
  }),
  talo: z.object({
    pinta_ala: z.number().optional().nullable(),
    tilavuus: z.number().optional().nullable(),
    kerroksia: z.number().int().optional().nullable(),
    asukkaita: z.number().int().optional().nullable(),
    rakennustapa: z.string().optional().nullable(),
    julkisivumateriaali: z.string().optional().nullable(),
    julkisivu_maalattu_vuosi: z.number().int().optional().nullable(),
    kattotyyppi: z.string().optional().nullable(),
    kattomateriaali: z.string().optional().nullable(),
    katto_uusittu_vuosi: z.number().int().optional().nullable(),
    raystaat_kunnostettu_vuosi: z.number().int().optional().nullable(),
    lammitysmuoto: z.string().optional().nullable(),
    lammitys_asennettu_vuosi: z.number().int().optional().nullable(),
    ilp_merkki: z.string().optional().nullable(),
    ilp_malli: z.string().optional().nullable(),
    ilp_asennettu_vuosi: z.number().int().optional().nullable(),
    ilmanvaihto: z.string().optional().nullable(),
    ilmanvaihto_vuosi: z.number().int().optional().nullable(),
    putket_uusittu_vuosi: z.number().int().optional().nullable(),
    putkimateriaali: z.string().optional().nullable(),
    viemarimateriaali: z.string().optional().nullable(),
    viemari_asennettu_vuosi: z.number().int().optional().nullable(),
    sahkot_asennettu_vuosi: z.number().int().optional().nullable(),
    tontin_pinta_ala: z.number().optional().nullable(),
    pihan_tyyppi: z.string().optional().nullable(),
    piha_lisatieto: z.string().optional().nullable(),
    terassi_materiaali: z.string().optional().nullable(),
    terassi_kunnostettu_vuosi: z.number().int().optional().nullable(),
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
    const { error: kErr } = await supabase.from("kiinteistot").update(data.kiinteisto).eq("id", k.id);
    if (kErr) throw kErr;
    const { error: tErr } = await supabase.from("talon_tiedot").update(data.talo).eq("kiinteisto_id", k.id);
    if (tErr) throw tErr;
    return { ok: true };
  });

// ---------- Huoltohistoria ----------
export const getHuollot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return [];
    const { data } = await supabase.from("huolto_historia").select("*").eq("kiinteisto_id", k.id).order("pvm", { ascending: false });
    return data ?? [];
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
  pts_siirto: z.boolean().default(false),
});

export const addHuolto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => huoltoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase.from("huolto_historia").insert({ kiinteisto_id: k.id, ...data });
    if (error) throw error;
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

export const deleteHuolto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("huolto_historia").delete().eq("id", data.id);
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
    const { tekija_nimi, ...row } = data;
    const { error } = await supabase.from("vk_kuitatut").upsert({
      kiinteisto_id: k.id, vuosi, kuitattu_pvm: pvm, ...row,
    }, { onConflict: "kiinteisto_id,kausi_key,huolto_nimi,vuosi" });
    if (error) throw error;

    if (data.tekija === "ammattilainen" && data.hinta > 0) {
      await supabase.from("kulut").insert({
        kiinteisto_id: k.id,
        nimi: `Vuosikello – ${data.huolto_nimi}`,
        kategoria: "huolto",
        summa: data.hinta,
        kuvaus: data.tekija_nimi ?? null,
        pvm,
      });
    }
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

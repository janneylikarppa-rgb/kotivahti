import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PTS_KOHTEET, ptsKohdeAvaimella, paatteleKohdeAvain, laskeKiireellisyys } from "./pts-kohteet";
import { rakennaTaloPatch, tukeeLaitePaivitysta } from "./laite-paivitys";

// ---------- PTS-päivitys: yhteinen helper ----------
// Päivittää pts_suunnitelma-rivin kun huolto/remontti kirjataan.
async function paivitaPts(
  supabase: any,
  kiinteistoId: string,
  kohdeAvain: string | null | undefined,
  tyyppi: string,
  vuosi: number,
  ptsSiirto: number = 0,
) {
  if (!kohdeAvain) return;
  const { data: rivi } = await supabase
    .from("pts_suunnitelma")
    .select("*")
    .eq("kiinteisto_id", kiinteistoId)
    .eq("kohde_avain", kohdeAvain)
    .eq("oma_rivi", false)
    .maybeSingle();
  if (!rivi) return;

  const nyt = new Date().getFullYear();
  let toimenpide = rivi.toimenpide_vuosi as number;
  const patch: any = { paivitetty_at: new Date().toISOString() };
  const t = tyyppi.toLowerCase();

  if (t === "uusiminen" || t === "remontti") {
    const kayttoika = Number(rivi.kayttoika) || 0;
    toimenpide = vuosi + Math.max(kayttoika - 2, 1);
    patch.viimeisin_uusiminen_vuosi = vuosi;
    patch.lahde_vuosi = vuosi;
  } else if (t === "huolto" || t === "tarkastus" || t === "maalaus") {
    const huoltovali = Number(rivi.huoltovali) || 0;
    if (huoltovali > 0) {
      toimenpide = Math.max(toimenpide, vuosi + huoltovali);
    }
    patch.viimeisin_huolto_vuosi = vuosi;
  }
  if (ptsSiirto > 0) {
    toimenpide = (rivi.toimenpide_vuosi as number) + ptsSiirto;
  }
  patch.toimenpide_vuosi = toimenpide;
  patch.kiireellisyys = laskeKiireellisyys(toimenpide - nyt);

  await supabase.from("pts_suunnitelma").update(patch).eq("id", rivi.id);
}

// Seedaa puuttuvat autorivit pts_suunnitelmaan talon_tiedot-pohjalta
async function seedPts(supabase: any, kiinteistoId: string, talo: any) {
  if (!talo) return;
  const { data: olemassa } = await supabase
    .from("pts_suunnitelma")
    .select("kohde_avain")
    .eq("kiinteisto_id", kiinteistoId)
    .eq("oma_rivi", false);
  const olemassaSet = new Set((olemassa ?? []).map((r: any) => r.kohde_avain));
  const nyt = new Date().getFullYear();
  const lisattavat: any[] = [];
  for (const kohde of PTS_KOHTEET) {
    if (olemassaSet.has(kohde.avain)) continue;
    if (kohde.koskee && !kohde.koskee(talo)) continue;
    const lahde = kohde.lahdeVuosi(talo);
    if (lahde == null) continue;
    const toimenpide = Math.max(nyt, lahde + Math.max(kohde.kayttoika - 2, 1));
    lisattavat.push({
      kiinteisto_id: kiinteistoId,
      kohde_avain: kohde.avain,
      kohde_nimi: kohde.nimi,
      kategoria: kohde.kategoria,
      kayttoika: kohde.kayttoika,
      huoltovali: kohde.huoltovali,
      lahde_vuosi: lahde,
      toimenpide_vuosi: toimenpide,
      kiireellisyys: laskeKiireellisyys(toimenpide - nyt),
      oma_rivi: false,
    });
  }
  if (lisattavat.length > 0) {
    await supabase.from("pts_suunnitelma").insert(lisattavat);
  }
}

// ---------- Active kiinteistö ----------
async function getActiveKiinteisto(supabase: any, userId: string) {
  const { data: kaikki, error } = await supabase
    .from("kiinteistot")
    .select("*")
    .eq("user_id", userId)
    .eq("aktiivinen", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!kaikki || kaikki.length === 0) return null;

  const { data: prof } = await supabase
    .from("profiles")
    .select("valittu_kiinteisto_id")
    .eq("id", userId)
    .maybeSingle();
  const valittuId = prof?.valittu_kiinteisto_id as string | null | undefined;
  if (valittuId) {
    const match = kaikki.find((k: any) => k.id === valittuId);
    if (match) return match;
  }
  return kaikki[0];
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
    julkisivu_asennettu_vuosi: z.number().int().optional().nullable(),
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
    ikkunat_tyyppi: z.string().optional().nullable(),
    ikkunat_uusittu_vuosi: z.number().int().optional().nullable(),
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
  kohde_avain: z.string().optional().nullable(),
  kuvaus: z.string().optional().nullable(),
  pvm: z.string().min(1),
  tekija: z.string().default("itse"),
  tekija_nimi: z.string().optional().nullable(),
  kustannus: z.number().default(0),
  takuu_vuotta: z.number().int().default(0),
  pts_siirto: z.number().int().min(0).max(50).default(0),
  linkita_kulut: z.boolean().default(true),
  liitteet: z.array(liiteSchema).optional().default([]),
  laite_paivitys: z.object({
    merkki: z.string().optional().nullable(),
    malli: z.string().optional().nullable(),
    asennusvuosi: z.number().int().min(1900).max(2200).optional().nullable(),
    materiaali: z.string().max(150).optional().nullable(),
  }).optional().nullable(),
});

async function paivitaTaloLaitteella(
  supabase: any,
  kiinteistoId: string,
  kohde: string | null | undefined,
  lp: { merkki?: string | null; malli?: string | null; asennusvuosi?: number | null; materiaali?: string | null } | null | undefined,
) {
  if (!kohde || !lp || !tukeeLaitePaivitysta(kohde)) return;
  const onTyhja = !lp.merkki?.trim() && !lp.malli?.trim() && lp.asennusvuosi == null && !lp.materiaali?.trim();
  if (onTyhja) return;
  const { data: nykyinen } = await supabase
    .from("talon_tiedot")
    .select("lammitys_lisatieto")
    .eq("kiinteisto_id", kiinteistoId)
    .maybeSingle();
  const patch = rakennaTaloPatch(kohde, lp, (nykyinen?.lammitys_lisatieto ?? {}) as Record<string, any>);
  if (Object.keys(patch).length === 0) return;
  await supabase.from("talon_tiedot").update(patch).eq("kiinteisto_id", kiinteistoId);
}


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
    const { liitteet, laite_paivitys, linkita_kulut, ...row } = data;

    // Päättele kohde_avain jos käyttäjä ei antanut
    let kohdeAvain = row.kohde_avain ?? null;
    if (!kohdeAvain && row.kohde) {
      const { data: talo } = await supabase
        .from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle();
      kohdeAvain = paatteleKohdeAvain(row.kohde, talo);
    }

    const { data: inserted, error } = await supabase
      .from("huolto_historia")
      .insert({ kiinteisto_id: k.id, ...row, kohde_avain: kohdeAvain })
      .select("id")
      .single();
    if (error) throw error;
    await insertLiitteet(supabase, k.id, inserted.id, liitteet);

    // Linkitetty kulu jos toggle päällä ja kustannus > 0
    if (linkita_kulut && Number(data.kustannus) > 0) {
      const { data: kulu } = await supabase.from("kulut").insert({
        kiinteisto_id: k.id,
        nimi: `${data.tyyppi}${data.kohde ? ` – ${data.kohde}` : ""}`,
        kategoria: "huolto",
        summa: data.kustannus,
        pvm: data.pvm,
        huolto_id: inserted.id,
        kohde_avain: kohdeAvain,
      }).select("id").single();
      if (kulu?.id) {
        await supabase.from("huolto_historia").update({ kulu_id: kulu.id }).eq("id", inserted.id);
      }
    }
    await paivitaTaloLaitteella(supabase, k.id, data.kohde, laite_paivitys);

    // PTS-päivitys
    const vuosi = new Date(data.pvm).getFullYear();
    await paivitaPts(supabase, k.id, kohdeAvain, data.tyyppi, vuosi, data.pts_siirto ?? 0);

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
    const { id, liitteet, laite_paivitys, linkita_kulut: _lk, ...patch } = data;
    const { error } = await supabase.from("huolto_historia").update(patch).eq("id", id);
    if (error) throw error;
    await insertLiitteet(supabase, k.id, id, liitteet ?? []);
    await paivitaTaloLaitteella(supabase, k.id, data.kohde, laite_paivitys);
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
  sahko_perusmaksu_eur_kk: z.number().optional(),
  vesi_puhdas_eur_m3: z.number(),
  vesi_jatevesi_eur_m3: z.number(),
  vesi_perusmaksu_eur_kk: z.number().optional(),
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

// ---------- PTS-suunnitelma (pts_suunnitelma-taulu) ----------
export const getPts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { rivit: [], talonTiedotPuuttuu: true };
    const { data: taloRaw } = await supabase.from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle();
    const talo = taloRaw ? { ...taloRaw, rakennusvuosi: k.rakennusvuosi } : null;

    // Seedaa puuttuvat autorivit
    await seedPts(supabase, k.id, talo);

    const { data: rivitData } = await supabase
      .from("pts_suunnitelma").select("*").eq("kiinteisto_id", k.id);

    const nyt = new Date().getFullYear();
    const rivit = (rivitData ?? []).map((r: any) => {
      const jaljella = (r.toimenpide_vuosi as number) - nyt;
      const huoltoErapaiva = Number(r.huoltovali) > 0
        && (nyt - (Number(r.viimeisin_huolto_vuosi ?? r.lahde_vuosi ?? nyt))) >= Number(r.huoltovali);
      const paivitetty = r.paivitetty_at
        ? (Date.now() - new Date(r.paivitetty_at).getTime()) < 5000
        : false;
      return {
        id: r.id,
        lahde: r.oma_rivi ? "oma" : "auto",
        kohde: r.kohde_nimi,
        kohdeAvain: r.kohde_avain,
        kategoria: r.kategoria,
        vuosi: r.toimenpide_vuosi,
        vuosiaJaljella: jaljella,
        tila: huoltoErapaiva ? "kiireellinen" : r.kiireellisyys,
        kuvaus: r.kuvaus,
        huoltovali: r.huoltovali,
        viimeisinHuoltoVuosi: r.viimeisin_huolto_vuosi,
        huoltoErapaiva,
        paivitetty,
      };
    }).sort((a: any, b: any) => a.vuosi - b.vuosi);

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
    if (!data.rivi_id) throw new Error("Rivin tunniste puuttuu");
    const nyt = new Date().getFullYear();
    const { data: rivi } = await supabase
      .from("pts_suunnitelma").select("toimenpide_vuosi, kuvaus")
      .eq("id", data.rivi_id).maybeSingle();
    const pohja = Math.max(((rivi as any)?.toimenpide_vuosi as number) ?? nyt, nyt);
    const uusiVuosi = pohja + data.vuosia;
    const kuvausLisa = data.peruste
      ? `[Siirretty ${data.vuosia} v: ${data.peruste}]`
      : `[Siirretty ${data.vuosia} v]`;
    const { error } = await supabase
      .from("pts_suunnitelma")
      .update({
        toimenpide_vuosi: uusiVuosi,
        kiireellisyys: laskeKiireellisyys(uusiVuosi - nyt),
        kuvaus: kuvausLisa,
        paivitetty_at: new Date().toISOString(),
      })
      .eq("id", data.rivi_id);
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
    // Etsi autorivi kohde_nimellä ja resetoi lähdevuoteen
    const { data: rivi } = await supabase
      .from("pts_suunnitelma").select("*")
      .eq("kiinteisto_id", k.id).eq("kohde_nimi", data.kohde).eq("oma_rivi", false).maybeSingle();
    if (!rivi) return { ok: true };
    const r: any = rivi;
    const nyt = new Date().getFullYear();
    const lahde = r.lahde_vuosi ?? nyt;
    const toimenpide = Math.max(nyt, lahde + Math.max((r.kayttoika ?? 0) - 2, 1));
    await supabase.from("pts_suunnitelma").update({
      toimenpide_vuosi: toimenpide,
      kiireellisyys: laskeKiireellisyys(toimenpide - nyt),
      kuvaus: null,
      paivitetty_at: new Date().toISOString(),
    }).eq("id", r.id);
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
    const nyt = new Date().getFullYear();
    const { error } = await supabase.from("pts_suunnitelma").insert({
      kiinteisto_id: k.id,
      kohde_avain: `oma_${Date.now()}`,
      kohde_nimi: data.kohde,
      kategoria: "Muu",
      kayttoika: 0,
      huoltovali: 0,
      toimenpide_vuosi: data.vuosi,
      kiireellisyys: laskeKiireellisyys(data.vuosi - nyt),
      kuvaus: data.kuvaus ?? null,
      oma_rivi: true,
    });
    if (error) throw error;
    return { ok: true };
  });

export const deletePtsRivi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("pts_suunnitelma").delete().eq("id", data.id);
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

    // Hae PTS-rivi (oma tai auto)
    let kohdeAvain: string | null = null;
    if (data.rivi_id) {
      const { data: r } = await supabase
        .from("pts_suunnitelma").select("kohde_avain, oma_rivi")
        .eq("id", data.rivi_id).maybeSingle();
      kohdeAvain = (r as any)?.kohde_avain ?? null;
    }

    // Luo huoltohistoria-rivi
    const { data: hist, error: histErr } = await supabase
      .from("huolto_historia")
      .insert({
        kiinteisto_id: k.id,
        tyyppi: "huolto",
        kategoria: "PTS",
        kohde: data.kohde,
        kohde_avain: kohdeAvain,
        pvm: data.pvm,
        tekija: data.tekija,
        tekija_nimi: data.tekija_nimi ?? null,
        kustannus: data.kustannus,
        kuvaus: data.kuvaus ?? null,
      })
      .select("id")
      .single();
    if (histErr) throw histErr;

    // Kulu jos hinta
    let kuluId: string | null = null;
    if (Number(data.kustannus) > 0) {
      const { data: kulu } = await supabase.from("kulut").insert({
        kiinteisto_id: k.id,
        nimi: `PTS – ${data.kohde}`,
        kategoria: "huolto",
        summa: data.kustannus,
        pvm: data.pvm,
        huolto_id: hist.id,
        kohde_avain: kohdeAvain,
      }).select("id").single();
      kuluId = (kulu as any)?.id ?? null;
      if (kuluId) {
        await supabase.from("huolto_historia").update({ kulu_id: kuluId }).eq("id", hist.id);
      }
    }

    // PTS-päivitys
    const vuosi = new Date(data.pvm).getFullYear();
    if (data.lahde === "oma" && data.rivi_id) {
      await supabase.from("pts_suunnitelma").delete().eq("id", data.rivi_id);
    } else {
      await paivitaPts(supabase, k.id, kohdeAvain, "huolto", vuosi, 0);
    }
    return { ok: true };
  });



// ---------- Kiinteistöjen hallinta ----------
export const listKiinteistot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: kiinteistot, error }, { data: prof }] = await Promise.all([
      supabase
        .from("kiinteistot")
        .select("id, nimi, osoite, kaupunki, tyyppi, aktiivinen, created_at")
        .eq("user_id", userId)
        .eq("aktiivinen", true)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("valittu_kiinteisto_id").eq("id", userId).maybeSingle(),
    ]);
    if (error) throw error;
    const lista = kiinteistot ?? [];
    let valittuId: string | null = (prof?.valittu_kiinteisto_id as string | null) ?? null;
    if (!valittuId || !lista.find((k: any) => k.id === valittuId)) {
      valittuId = lista[0]?.id ?? null;
    }
    return { kiinteistot: lista, valittuId };
  });

export const setValittuKiinteisto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: omistus, error: oErr } = await supabase
      .from("kiinteistot")
      .select("id")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!omistus) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase
      .from("profiles")
      .update({ valittu_kiinteisto_id: data.id })
      .eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });

const lisaaKiinteistoSchema = z.object({
  nimi: z.string().min(1).max(120),
  tyyppi: z.string().min(1).max(50).default("omakotitalo"),
  osoite: z.string().max(200).optional().nullable(),
  kaupunki: z.string().max(120).optional().nullable(),
  rakennusvuosi: z.number().int().min(1700).max(2100).optional().nullable(),
});

export const addKiinteisto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => lisaaKiinteistoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: uusi, error } = await supabase
      .from("kiinteistot")
      .insert({
        user_id: userId,
        nimi: data.nimi,
        tyyppi: data.tyyppi,
        osoite: data.osoite ?? null,
        kaupunki: data.kaupunki ?? null,
        rakennusvuosi: data.rakennusvuosi ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    await supabase.from("talon_tiedot").insert({ kiinteisto_id: uusi.id });
    await supabase.from("kulu_asetukset").insert({ kiinteisto_id: uusi.id });
    await supabase.from("profiles").update({ valittu_kiinteisto_id: uusi.id }).eq("id", userId);
    return { ok: true, id: uusi.id };
  });


import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePreviewOrSupabaseAuth as requireSupabaseAuth } from "@/lib/preview-auth";
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

// Synkronoi pts_suunnitelman autorivit talon_tiedot-pohjaisten sääntöjen kanssa.
// - Poistaa autorivit, jotka eivät enää koske taloa (esim. kattomateriaali vaihtunut),
//   paitsi jos rivillä on huoltohistoriaa (silloin säilytetään ettei kirjattu data katoa).
// - Päivittää lahde_vuosi / kayttoika / huoltovali / toimenpide_vuosi / kuvaus jos talon
//   tiedot tai PTS_KOHTEET-säännöt ovat muuttuneet, paitsi jos käyttäjä on siirtänyt rivin
//   manuaalisesti (kuvauksessa "[Siirretty").
// - Lisää puuttuvat autorivit.
async function synkronoiPts(supabase: any, kiinteistoId: string, talo: any) {
  if (!talo) return;
  const { data: olemassa } = await supabase
    .from("pts_suunnitelma")
    .select("*")
    .eq("kiinteisto_id", kiinteistoId)
    .eq("oma_rivi", false);
  const nyt = new Date().getFullYear();
  const olemassaMap = new Map<string, any>();
  for (const r of (olemassa ?? [])) olemassaMap.set(r.kohde_avain as string, r);

  // 1) Poista ja päivitä olemassa olevat
  for (const rivi of (olemassa ?? [])) {
    const kohde = PTS_KOHTEET.find((k) => k.avain === rivi.kohde_avain);
    const onHistoriaa = rivi.viimeisin_huolto_vuosi != null || rivi.viimeisin_uusiminen_vuosi != null;
    const koskeeEdelleen = kohde && (!kohde.koskee || kohde.koskee(talo));
    const lahde = kohde?.lahdeVuosi(talo) ?? null;

    if (!kohde || (!koskeeEdelleen && !onHistoriaa) || (lahde == null && !onHistoriaa)) {
      if (!onHistoriaa) {
        await supabase.from("pts_suunnitelma").delete().eq("id", rivi.id);
      }
      continue;
    }
    if (!kohde) continue;

    const lykatty = typeof rivi.kuvaus === "string" && rivi.kuvaus.includes("[Siirretty");
    const patch: any = {};
    if (lahde != null && rivi.lahde_vuosi !== lahde) patch.lahde_vuosi = lahde;
    if (rivi.kayttoika !== kohde.kayttoika) patch.kayttoika = kohde.kayttoika;
    if (rivi.huoltovali !== kohde.huoltovali) patch.huoltovali = kohde.huoltovali;
    if (kohde.kuvaus && !rivi.kuvaus) patch.kuvaus = kohde.kuvaus;

    if (!lykatty && lahde != null) {
      const pohja = rivi.viimeisin_uusiminen_vuosi ?? lahde;
      const toimenpide = Math.max(nyt, pohja + Math.max(kohde.kayttoika - 2, 1));
      if (rivi.toimenpide_vuosi !== toimenpide) {
        patch.toimenpide_vuosi = toimenpide;
        patch.kiireellisyys = laskeKiireellisyys(toimenpide - nyt);
      }
    }
    if (Object.keys(patch).length > 0) {
      patch.paivitetty_at = new Date().toISOString();
      await supabase.from("pts_suunnitelma").update(patch).eq("id", rivi.id);
    }
  }

  // 2) Lisää puuttuvat
  const lisattavat: any[] = [];
  for (const kohde of PTS_KOHTEET) {
    if (olemassaMap.has(kohde.avain)) continue;
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
      kuvaus: kohde.kuvaus ?? null,
      oma_rivi: false,
    });
  }
  if (lisattavat.length > 0) {
    await supabase.from("pts_suunnitelma").insert(lisattavat);
  }
}

// Yhteensopivuusalias
const seedPts = synkronoiPts;

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

// ---------- Aurinkosähkö-suosituksen laskenta ----------
import { laskeAurinkoSuositus } from "./aurinkosahko";

async function tarkistaAurinkosahkoSoveltuvuus(
  supabase: any,
  kiinteistoId: string,
  aurinkopaneelit: boolean,
) {
  const [sahkoRes, kaikkiRes] = await Promise.all([
    supabase
      .from("kulut")
      .select("pvm, kwh")
      .eq("kiinteisto_id", kiinteistoId)
      .eq("kategoria", "sahko"),
    supabase
      .from("kulut")
      .select("pvm")
      .eq("kiinteisto_id", kiinteistoId),
  ]);

  return laskeAurinkoSuositus(
    (sahkoRes.data ?? []) as Array<{ pvm: string; kwh: number | null }>,
    (kaikkiRes.data ?? []) as Array<{ pvm: string }>,
    aurinkopaneelit,
  );
}

// Onko talossa jo aurinkopaneelit (tulee talon_tiedoista).
function onPaneelitAsennettu(talo: any): boolean {
  return Boolean(talo?.aurinkopaneelit);
}




// ---------- Dashboard yhteenveto ----------
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const kiinteisto = await getActiveKiinteisto(supabase, userId);
    if (!kiinteisto) return { kiinteisto: null, talo: null, huollot: [], kulutSumma: 0, edistyminen: 0, aurinko: null };

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

    const aurinko = await tarkistaAurinkosahkoSoveltuvuus(
      supabase,
      kiinteisto.id,
      onPaneelitAsennettu(talo),
    );

    return {
      kiinteisto,
      talo,
      huollot: huoltoRes.data ?? [],
      kulut: kuluRes.data ?? [],
      kulutSumma,
      edistyminen,
      valmiitOsiot: valmiit,
      nimi: profRes.data?.nimi ?? null,
      aurinko,
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
    hormityyppi: z.string().optional().nullable(),
    hormien_maara: z.number().int().optional().nullable(),
    kiuas_tyyppi: z.string().optional().nullable(),
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
    aurinkopaneelit: z.boolean().optional().nullable(),
    aurinko_asennus_vuosi: z.number().int().optional().nullable(),
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
    // Päivitä PTS-autorivit talon tietojen mukaisiksi
    const { data: taloRaw } = await supabase.from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle();
    const { data: kRow } = await supabase.from("kiinteistot").select("rakennusvuosi").eq("id", k.id).maybeSingle();
    const talo = taloRaw ? { ...taloRaw, rakennusvuosi: (kRow as any)?.rakennusvuosi } : null;
    await synkronoiPts(supabase, k.id, talo);
    // Metriikka: talon tiedot täytetty
    try {
      const { inkrementoiMetriikka } = await import("@/lib/palaute.functions");
      await inkrementoiMetriikka(userId, "talon_tiedot_taytetty", 1);
    } catch {}
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
  tyon_osuus: z.number().nullable().optional(),
  kotitalousvahennys_tyyppi: z.enum(["yritys", "palkka"]).nullable().optional(),
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

    // Metriikka: huolto kirjattu
    try {
      const { inkrementoiMetriikka } = await import("@/lib/palaute.functions");
      await inkrementoiMetriikka(userId, "huoltoja_kirjattu", 1);
    } catch {}

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
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), poista_myos_linkitetty: z.boolean().default(false) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // Hae linkitetty kulu_id ennen poistoa
    const { data: huolto } = await supabase
      .from("huolto_historia").select("kulu_id").eq("id", data.id).maybeSingle();
    const kuluId = (huolto as any)?.kulu_id ?? null;

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

    if (data.poista_myos_linkitetty && kuluId) {
      await supabase.from("kulut").delete().eq("id", kuluId);
    }
    return { ok: true, oli_linkitetty: !!kuluId };
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

    // Metriikka: vuosikellon kuittaus
    try {
      const { inkrementoiMetriikka } = await import("@/lib/palaute.functions");
      await inkrementoiMetriikka(userId, "vuosikelloa_kuitattu", 1);
    } catch {}

    return { ok: true };
  });

// ---------- Kulut ----------
async function materialisoiToistuvat(supabase: any, kiinteistoId: string) {
  const { data: toistuvat } = await supabase
    .from("toistuvat_kulut").select("*").eq("kiinteisto_id", kiinteistoId).eq("aktiivinen", true);
  if (!toistuvat || toistuvat.length === 0) return;
  const nykyinen = new Date().getFullYear();
  const avaimet = toistuvat.flatMap((t: any) => {
    const vuodet: number[] = [];
    for (let v = Math.max(2000, Number(t.alkuvuosi)); v <= nykyinen; v++) vuodet.push(v);
    return vuodet.map((v) => ({ t, v, avain: `toistuva:${t.id}:${v}` }));
  });
  if (avaimet.length === 0) return;
  const { data: olemassa } = await supabase
    .from("kulut").select("id, kohde_avain, summa, nimi, pvm")
    .eq("kiinteisto_id", kiinteistoId)
    .in("kohde_avain", avaimet.map((a: any) => a.avain));
  const mapByAvain = new Map<string, any>((olemassa ?? []).map((r: any) => [r.kohde_avain, r]));
  const insertit: any[] = [];
  for (const { t, v, avain } of avaimet) {
    const kk = String(t.eraantymiskuukausi).padStart(2, "0");
    const pvm = `${v}-${kk}-01`;
    const existing = mapByAvain.get(avain);
    if (!existing) {
      insertit.push({
        kiinteisto_id: kiinteistoId,
        nimi: t.nimi, kategoria: t.kategoria, summa: t.summa, pvm,
        kohde_avain: avain,
      });
    } else if (Number(existing.summa) !== Number(t.summa) || existing.nimi !== t.nimi) {
      await supabase.from("kulut").update({ summa: t.summa, nimi: t.nimi }).eq("id", existing.id);
    }
  }
  if (insertit.length > 0) {
    await supabase.from("kulut").insert(insertit);
  }
}

export const getKulut = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { kulut: [], asetukset: null, toistuvat: [] };
    await materialisoiToistuvat(supabase, k.id);
    const [kulutRes, asetuksetRes, toistuvatRes] = await Promise.all([
      supabase.from("kulut").select("*").eq("kiinteisto_id", k.id).order("pvm", { ascending: false }),
      supabase.from("kulu_asetukset").select("*").eq("kiinteisto_id", k.id).maybeSingle(),
      supabase.from("toistuvat_kulut").select("*").eq("kiinteisto_id", k.id).order("nimi"),
    ]);
    return { kulut: kulutRes.data ?? [], asetukset: asetuksetRes.data, toistuvat: toistuvatRes.data ?? [] };
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
  kohde_avain: z.string().optional().nullable(),
  // Huoltohistoria-linkitys kun kategoria = huolto
  linkita_huoltohistoriaan: z.boolean().default(false),
  huolto_kohde: z.string().optional().nullable(),
  huolto_tyyppi: z.string().optional().nullable(),
  huolto_tekija: z.enum(["itse", "ammattilainen"]).default("itse"),
  huolto_tekija_nimi: z.string().optional().nullable(),
  huolto_takuu_vuotta: z.number().int().min(0).max(50).default(0),
});

export const addKulu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => kuluSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const {
      linkita_huoltohistoriaan, huolto_kohde, huolto_tyyppi,
      huolto_tekija, huolto_tekija_nimi, huolto_takuu_vuotta,
      ...kuluRow
    } = data;

    // Päättele kohde_avain
    let kohdeAvain = kuluRow.kohde_avain ?? null;
    if (!kohdeAvain && (huolto_kohde || kuluRow.nimi)) {
      const { data: talo } = await supabase
        .from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle();
      kohdeAvain = paatteleKohdeAvain(huolto_kohde ?? kuluRow.nimi, talo);
    }

    const { data: kulu, error } = await supabase
      .from("kulut").insert({ kiinteisto_id: k.id, ...kuluRow, kohde_avain: kohdeAvain })
      .select("id").single();
    if (error) throw error;

    if (data.kategoria === "vesi" && data.mittarilukema != null) {
      await supabase.from("kulu_asetukset").update({ edellinen_mittarilukema: data.mittarilukema }).eq("kiinteisto_id", k.id);
    }

    // Linkitetty huoltohistoria-rivi
    if (linkita_huoltohistoriaan && data.kategoria === "huolto") {
      const tyyppi = huolto_tyyppi ?? "huolto";
      const { data: hist } = await supabase.from("huolto_historia").insert({
        kiinteisto_id: k.id,
        tyyppi,
        kategoria: "Kulut",
        kohde: huolto_kohde ?? null,
        kohde_avain: kohdeAvain,
        kuvaus: kuluRow.kuvaus ?? null,
        pvm: data.pvm,
        tekija: huolto_tekija,
        tekija_nimi: huolto_tekija_nimi ?? null,
        kustannus: data.summa,
        takuu_vuotta: huolto_takuu_vuotta,
        kulu_id: kulu.id,
      }).select("id").single();
      if (hist?.id) {
        await supabase.from("kulut").update({ huolto_id: hist.id }).eq("id", kulu.id);
      }
      // PTS-päivitys
      const vuosi = new Date(data.pvm).getFullYear();
      await paivitaPts(supabase, k.id, kohdeAvain, tyyppi, vuosi, 0);
    }
    return { ok: true };
  });

export const deleteKulu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), poista_myos_linkitetty: z.boolean().default(false) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: kulu } = await supabase
      .from("kulut").select("huolto_id").eq("id", data.id).maybeSingle();
    const huoltoId = (kulu as any)?.huolto_id ?? null;
    const { error } = await supabase.from("kulut").delete().eq("id", data.id);
    if (error) throw error;
    if (data.poista_myos_linkitetty && huoltoId) {
      await supabase.from("huolto_historia").delete().eq("id", huoltoId);
    }
    return { ok: true, oli_linkitetty: !!huoltoId };
  });

const asetuksetSchema = z.object({
  sahko_energia_snt: z.number(),
  sahko_siirto_snt: z.number(),
  sahko_perusmaksu_eur_kk: z.number().optional(),
  vesi_puhdas_eur_m3: z.number(),
  vesi_jatevesi_eur_m3: z.number(),
  vesi_perusmaksu_eur_kk: z.number().optional(),
  edellinen_mittarilukema: z.number().optional().nullable(),
  edellinen_sahkomittari: z.number().optional().nullable(),
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

// ---------- Toistuvat kulut ----------
const toistuvaSchema = z.object({
  nimi: z.string().min(1),
  kategoria: z.string().default("muu"),
  summa: z.number().min(0),
  eraantymiskuukausi: z.number().int().min(1).max(12).default(1),
  alkuvuosi: z.number().int().min(2000).max(2100),
  aktiivinen: z.boolean().default(true),
});

export const addToistuvaKulu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => toistuvaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { error } = await supabase.from("toistuvat_kulut").insert({ kiinteisto_id: k.id, ...data });
    if (error) throw error;
    await materialisoiToistuvat(supabase, k.id);
    return { ok: true };
  });

export const updateToistuvaKulu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => toistuvaSchema.partial().extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { id, ...patch } = data;
    const { error } = await supabase.from("toistuvat_kulut").update(patch).eq("id", id);
    if (error) throw error;
    await materialisoiToistuvat(supabase, k.id);
    return { ok: true };
  });

export const deleteToistuvaKulu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), poista_materialisoidut: z.boolean().default(true) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    if (data.poista_materialisoidut) {
      await supabase.from("kulut").delete().like("kohde_avain", `toistuva:${data.id}:%`);
    }
    const { error } = await supabase.from("toistuvat_kulut").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Kuukauden mittarilukema (sähkö + vesi automaattinen kululaskenta) ----------
const mittariSchema = z.object({
  vuosi: z.number().int().min(2000).max(2100),
  kuukausi: z.number().int().min(1).max(12),
  sahko_lukema: z.number().optional().nullable(),
  vesi_lukema: z.number().optional().nullable(),
});

export const tallennaKuukaudenMittari = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => mittariSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) throw new Error("Kiinteistöä ei löytynyt");
    const { data: a } = await supabase.from("kulu_asetukset").select("*").eq("kiinteisto_id", k.id).maybeSingle();
    if (!a) throw new Error("Kuluasetuksia ei löytynyt");
    const kk = String(data.kuukausi).padStart(2, "0");
    const pvm = `${data.vuosi}-${kk}-01`;
    const tulos: any = {};
    const asPatch: any = {};

    if (data.sahko_lukema != null) {
      const edellinen = Number(a.edellinen_sahkomittari || 0);
      const kulutus = Math.max(0, Number(data.sahko_lukema) - edellinen);
      const tariffi = Number(a.sahko_energia_snt || 0) + Number(a.sahko_siirto_snt || 0);
      const perus = Number(a.sahko_perusmaksu_eur_kk || 0);
      const summa = Number(((kulutus * tariffi) / 100 + perus).toFixed(2));
      const avain = `mittari:sahko:${data.vuosi}-${kk}`;
      const { data: existing } = await supabase
        .from("kulut").select("id").eq("kiinteisto_id", k.id).eq("kohde_avain", avain).maybeSingle();
      const row = {
        kiinteisto_id: k.id, nimi: `Sähkö ${data.vuosi}-${kk}`, kategoria: "sahko",
        summa, pvm, kwh: kulutus, mittarilukema: data.sahko_lukema, kohde_avain: avain,
      };
      if (existing?.id) await supabase.from("kulut").update(row).eq("id", existing.id);
      else await supabase.from("kulut").insert(row);
      asPatch.edellinen_sahkomittari = data.sahko_lukema;
      asPatch.edellinen_sahkomittari_pvm = pvm;
      tulos.sahko = { kulutus, summa };
    }

    if (data.vesi_lukema != null) {
      const edellinen = Number(a.edellinen_mittarilukema || 0);
      const kulutus = Math.max(0, Number(data.vesi_lukema) - edellinen);
      const tariffi = Number(a.vesi_puhdas_eur_m3 || 0) + Number(a.vesi_jatevesi_eur_m3 || 0);
      const perus = Number(a.vesi_perusmaksu_eur_kk || 0);
      const summa = Number((kulutus * tariffi + perus).toFixed(2));
      const avain = `mittari:vesi:${data.vuosi}-${kk}`;
      const { data: existing } = await supabase
        .from("kulut").select("id").eq("kiinteisto_id", k.id).eq("kohde_avain", avain).maybeSingle();
      const row = {
        kiinteisto_id: k.id, nimi: `Vesi ${data.vuosi}-${kk}`, kategoria: "vesi",
        summa, pvm, kulutus_m3: kulutus, mittarilukema: data.vesi_lukema, kohde_avain: avain,
      };
      if (existing?.id) await supabase.from("kulut").update(row).eq("id", existing.id);
      else await supabase.from("kulut").insert(row);
      asPatch.edellinen_mittarilukema = data.vesi_lukema;
      asPatch.edellinen_vesimittari_pvm = pvm;
      tulos.vesi = { kulutus, summa };
    }

    if (Object.keys(asPatch).length > 0) {
      await supabase.from("kulu_asetukset").update(asPatch).eq("kiinteisto_id", k.id);
    }
    return { ok: true, ...tulos };
  });

export const getPts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { rivit: [], talonTiedotPuuttuu: true, aurinko: null };
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
    const aurinko = await tarkistaAurinkosahkoSoveltuvuus(
      supabase,
      k.id,
      onPaneelitAsennettu(talo),
    );
    return { rivit, talonTiedotPuuttuu, aurinko };
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
  postinumero: z.string().max(10).optional().nullable(),
  rakennusvuosi: z.number().int().min(1700).max(2100).optional().nullable(),
  pinta_ala: z.number().optional().nullable(),
  kerroksia: z.number().int().optional().nullable(),
  lammitysmuoto: z.string().max(60).optional().nullable(),
  julkisivumateriaali: z.string().max(120).optional().nullable(),
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
        postinumero: data.postinumero ?? null,
        rakennusvuosi: data.rakennusvuosi ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    await supabase.from("talon_tiedot").upsert(
      {
        kiinteisto_id: uusi.id,
        pinta_ala: data.pinta_ala ?? null,
        kerroksia: data.kerroksia ?? null,
        lammitysmuoto: data.lammitysmuoto ?? null,
        julkisivumateriaali: data.julkisivumateriaali ?? null,
      },
      { onConflict: "kiinteisto_id" },
    );


    await supabase.from("kulu_asetukset").insert({ kiinteisto_id: uusi.id });
    await supabase.from("profiles").update({ valittu_kiinteisto_id: uusi.id }).eq("id", userId);
    return { ok: true, id: uusi.id };
  });

// ---------- Myyntiraportti ----------
export const getMyyntiraportti = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return null;

    const vuosi = new Date().getFullYear() - 1;
    const vuosiAlku = `${vuosi}-01-01`;
    const vuosiLoppu = `${vuosi}-12-31`;

    const [taloRes, huoltoRes, dokRes, kulutRes, toistuvatRes] = await Promise.all([
      supabase.from("talon_tiedot").select("*").eq("kiinteisto_id", k.id).maybeSingle(),
      supabase.from("huolto_historia").select("*").eq("kiinteisto_id", k.id).order("pvm", { ascending: true }),
      supabase.from("talo_dokumentit").select("*").eq("kiinteisto_id", k.id).neq("tyyppi", "kuva"),
      supabase
        .from("kulut")
        .select("*")
        .eq("kiinteisto_id", k.id)
        .in("kategoria", ["sahko", "lammitys", "vesi"])
        .gte("pvm", vuosiAlku)
        .lte("pvm", vuosiLoppu),
      supabase
        .from("toistuvat_kulut")
        .select("*")
        .eq("kiinteisto_id", k.id)
        .eq("aktiivinen", true)
        .in("kategoria", ["kiinteistovero", "muu"]),
    ]);

    // Signed URLs for documents
    const dokumentit = await Promise.all(
      (dokRes.data ?? []).map(async (d: any) => {
        let url: string | null = null;
        if (d.tiedosto_polku) {
          const { data: s } = await supabase.storage
            .from("talo-dokumentit")
            .createSignedUrl(d.tiedosto_polku, 3600);
          url = s?.signedUrl ?? null;
        }
        return { ...d, url };
      }),
    );

    return {
      kiinteisto: k,
      talo: taloRes.data ?? null,
      huollot: huoltoRes.data ?? [],
      dokumentit,
      kulutVuosi: vuosi,
      kulut: kulutRes.data ?? [],
      toistuvat: toistuvatRes.data ?? [],
    };
  });


// ---------- Kotitalousvähennys ----------
export const getKotitalousvahennys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ vuosi: z.number().int().min(2000).max(2100) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const k = await getActiveKiinteisto(supabase, userId);
    if (!k) return { vuosi: data.vuosi, kirjaukset: [] as any[] };
    const { data: rows, error } = await supabase
      .from("huolto_historia")
      .select("id, pvm, tyyppi, kohde, kuvaus, tekija, tekija_nimi, kustannus, tyon_osuus, kotitalousvahennys_tyyppi")
      .eq("kiinteisto_id", k.id)
      .not("kotitalousvahennys_tyyppi", "is", null)
      .gte("pvm", `${data.vuosi}-01-01`)
      .lte("pvm", `${data.vuosi}-12-31`)
      .order("pvm", { ascending: false });
    if (error) throw error;
    return { vuosi: data.vuosi, kirjaukset: rows ?? [] };
  });

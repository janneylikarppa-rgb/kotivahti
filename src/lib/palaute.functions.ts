// Palaute- ja mittausjärjestelmän server-funktiot.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePreviewOrSupabaseAuth as requireSupabaseAuth } from "@/lib/preview-auth";

// ----- Tyypit -----
export type KyselyTyyppi =
  | "onboarding" | "nps" | "churn"
  | "ydinprosessi_yhteydenotto" | "ydinprosessi_kaynnin_jalkeen" | "ydinprosessi_kokonaiskokemus"
  | "liidi_yhteydenotto" | "liidi_tulos" // legacy, säilyy historiana
  | "tyonlaatu"
  | "kausikirje_kevat" | "kausikirje_kesa" | "kausikirje_syksy" | "kausikirje_talvi";

export type AktiivinenKysely = {
  id: string;
  tyyppi: KyselyTyyppi;
  trigger_id: string | null;
  meta?: Record<string, any>;
} | null;

const ARKIPV_MS = 24 * 60 * 60 * 1000;

function paivaSitten(ts: string | Date, paivaa: number): boolean {
  const t = typeof ts === "string" ? new Date(ts).getTime() : ts.getTime();
  return Date.now() - t >= paivaa * ARKIPV_MS;
}

// Globaali in-app-kyselyiden cooldown — käyttäjälle korkeintaan yksi
// kortti per 7 kalenteripäivää (ydinprosessi-kyselyt poikkeuksena: ne
// ovat liidikohtaisia ja tärkeitä, joten ne ohittavat cooldownin).
const IN_APP_COOLDOWN_PV = 7;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

// ===========================================================
// Aktiivinen kysely (in-app kortti)
// ===========================================================
export const haeAktiivinenKysely = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AktiivinenKysely> => {
    const { supabase, userId } = context;
    const a = await admin();

    const { data: kyselyt } = await supabase
      .from("palaute_kyselyt")
      .select("id, tyyppi, trigger_id, lahetetty_at, vastattu_at, vastaukset")
      .eq("user_id", userId)
      .order("lahetetty_at", { ascending: false })
      .limit(200);
    const lista = kyselyt ?? [];

    // Avoin (lähetetty mutta ei vastattu, ei kausikirje)
    const avoin = lista.find((k: any) => !k.vastattu_at && !String(k.tyyppi).startsWith("kausikirje_"));
    if (avoin) {
      return { id: avoin.id, tyyppi: avoin.tyyppi as KyselyTyyppi, trigger_id: avoin.trigger_id ?? null };
    }

    const onkoLahetetty = (tyyppi: KyselyTyyppi, trigger_id?: string | null, paivaaSitten = 99999) =>
      lista.some((k: any) =>
        k.tyyppi === tyyppi &&
        (trigger_id ? k.trigger_id === trigger_id : true) &&
        Date.now() - new Date(k.lahetetty_at).getTime() < paivaaSitten * ARKIPV_MS
      );

    const luo = async (tyyppi: KyselyTyyppi, trigger_id: string | null = null): Promise<AktiivinenKysely> => {
      const { data, error } = await supabase
        .from("palaute_kyselyt")
        .insert({ user_id: userId, tyyppi, trigger_id })
        .select("id, tyyppi, trigger_id")
        .single();
      if (error) throw error;
      return { id: data.id, tyyppi: data.tyyppi as KyselyTyyppi, trigger_id: data.trigger_id ?? null };
    };

    const { data: m } = await a.from("kayttaja_metriikat").select("*").eq("user_id", userId).maybeSingle();

    // Hae liidit ydinprosessivaiheille
    const { data: liidit } = await supabase
      .from("liidit")
      .select("id, status, lahetetty_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    // VAIHE 1: ydinprosessi_yhteydenotto — 3 arkipäivää (≈ 5 kalenteripäivää) liidin välityksestä
    for (const l of liidit ?? []) {
      const ts = l.lahetetty_at ?? l.created_at;
      if (l.status !== "valitetty") continue;
      if (!paivaSitten(ts, 5)) continue;
      if (onkoLahetetty("ydinprosessi_yhteydenotto", l.id)) continue;
      return luo("ydinprosessi_yhteydenotto", l.id);
    }

    // VAIHE 2: 7 päivää vaiheen 1 vastauksesta jos "kyllä_*"
    for (const l of liidit ?? []) {
      if (onkoLahetetty("ydinprosessi_kaynnin_jalkeen", l.id)) continue;
      const v1 = lista.find((k: any) =>
        k.tyyppi === "ydinprosessi_yhteydenotto" && k.trigger_id === l.id && k.vastattu_at
      ) as any;
      if (!v1) continue;
      const ans = String(v1.vastaukset?.yhteydenotto ?? "");
      if (!ans.startsWith("kylla_")) continue;
      if (!paivaSitten(v1.vastattu_at, 7)) continue;
      return luo("ydinprosessi_kaynnin_jalkeen", l.id);
    }

    // VAIHE 3: lähetetään kaikille positiivisille K1-vastauksille
    //  - "kylla_kavi" → 5 päivän kuluttua (käynti tapahtunut)
    //  - "sovittu_ei_viela" → 14 päivän kuluttua (anna käynnin tapahtua)
    for (const l of liidit ?? []) {
      if (onkoLahetetty("ydinprosessi_kokonaiskokemus", l.id)) continue;
      const v2 = lista.find((k: any) =>
        k.tyyppi === "ydinprosessi_kaynnin_jalkeen" && k.trigger_id === l.id && k.vastattu_at
      ) as any;
      if (!v2) continue;
      const k1 = v2.vastaukset?.kavi;
      const odotus = k1 === "kylla_kavi" ? 5 : k1 === "sovittu_ei_viela" ? 14 : null;
      if (!odotus) continue;
      if (!paivaSitten(v2.vastattu_at, odotus)) continue;
      return luo("ydinprosessi_kokonaiskokemus", l.id);
    }

    // Globaali rate limit: ei näytetä yleisiä kyselyitä (tyonlaatu / onboarding /
    // nps / churn) jos käyttäjä on saanut minkään in-app-kyselyn viimeisen
    // 7 päivän aikana. Ydinprosessi-kyselyt yllä ohittavat tämän.
    const yleisetCooldownAktiivi = lista.some((k: any) =>
      !String(k.tyyppi).startsWith("kausikirje_") &&
      !String(k.tyyppi).startsWith("ydinprosessi_") &&
      Date.now() - new Date(k.lahetetty_at).getTime() < IN_APP_COOLDOWN_PV * ARKIPV_MS
    );
    if (yleisetCooldownAktiivi) return null;

    // Tyonlaatu (huoltohistoria)
    const { data: huollot } = await supabase
      .from("huolto_historia")
      .select("id, pvm, tekija, tekija_nimi, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    for (const h of huollot ?? []) {
      if (!h.tekija || h.tekija === "itse" || h.tekija === "jatetaan") continue;
      if (!h.tekija_nimi) continue;
      if (!paivaSitten(h.pvm ?? h.created_at, 5)) continue;
      if (onkoLahetetty("tyonlaatu", h.id)) continue;
      return luo("tyonlaatu", h.id);
    }

    if (!m) return null;

    if (paivaSitten(m.rekisteroity_at, 7) && !onkoLahetetty("onboarding")) {
      return luo("onboarding");
    }

    if (
      paivaSitten(m.rekisteroity_at, 30) &&
      (m.kirjautumisia ?? 0) >= 3 &&
      !onkoLahetetty("nps", null, 180)
    ) {
      return luo("nps");
    }

    const viim = m.viimeisin_kirjautuminen;
    if (
      viim && paivaSitten(viim, 14) &&
      paivaSitten(m.rekisteroity_at, 7) &&
      !onkoLahetetty("churn", null, 30)
    ) {
      return luo("churn");
    }

    return null;
  });

// ===========================================================
// Vastaa kyselyyn
// ===========================================================
export const vastaaKyselyyn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    id: z.string().uuid(),
    vastaukset: z.record(z.string().min(1).max(50), z.any()),
  }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const a = await admin();

    const { data: kysely, error: hErr } = await supabase
      .from("palaute_kyselyt")
      .select("id, tyyppi, trigger_id, user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (hErr || !kysely) throw new Error("Kyselyä ei löytynyt");

    const { error } = await supabase
      .from("palaute_kyselyt")
      .update({ vastattu_at: new Date().toISOString(), vastaukset: data.vastaukset })
      .eq("id", data.id);
    if (error) throw error;

    // NPS
    if (kysely.tyyppi === "nps" && typeof data.vastaukset.pisteet === "number") {
      await a.from("kayttaja_metriikat")
        .update({
          nps_pisteet: data.vastaukset.pisteet,
          nps_annettu_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    // Vaihe 2: kriittinen hälytys jos "ei käynyt eikä ilmoittanut"
    if (
      kysely.tyyppi === "ydinprosessi_kaynnin_jalkeen" &&
      data.vastaukset.kavi === "ei_kaynyt_ei_ilmoittanut" &&
      kysely.trigger_id
    ) {
      void lahetaKriittinenHalytys(kysely.trigger_id, "kriittinen_ei_kaynyt");
    }

    // Vaihe 3: päivitä ammattilaisen pisteet
    if (kysely.tyyppi === "ydinprosessi_kokonaiskokemus" && kysely.trigger_id) {
      try {
        const { data: l } = await a
          .from("liidit").select("ammattilainen_id").eq("id", kysely.trigger_id).maybeSingle();
        if (l?.ammattilainen_id) {
          await a.rpc("paivita_ammattilainen_pisteet", { _amm_id: l.ammattilainen_id });
        }
      } catch (e) {
        console.error("Ammattilaisen pisteytys epäonnistui", e);
      }
    }

    return { ok: true };
  });

async function lahetaKriittinenHalytys(liidiId: string, tyyppi: "kriittinen_ei_kaynyt") {
  try {
    const a = await admin();
    const [{ lahetaEmail }] = await Promise.all([import("@/lib/email.server")]);
    const { data: l } = await a
      .from("liidit")
      .select("nimi, puhelin, sahkoposti, kategoria, palvelu, kaupunki, ammattilainen_id, lahetetty_at, created_at")
      .eq("id", liidiId).maybeSingle();
    if (!l) return;
    const { data: amm } = l.ammattilainen_id
      ? await a.from("ammattilaiset").select("yritys, sahkoposti, puhelin").eq("id", l.ammattilainen_id).maybeSingle()
      : { data: null as any };
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) return;
    const subject = tyyppi === "kriittinen_ei_kaynyt"
      ? `🚨 KRIITTINEN – Ammattilainen ei käynyt eikä ilmoittanut – ${l.kategoria} – ${l.kaupunki ?? "—"}`
      : `⚠️ KIIREELLINEN – ${l.kategoria} – ${l.kaupunki ?? "—"}`;
    const html = `
      <h2>${subject}</h2>
      <p><strong>Asiakas:</strong> ${l.nimi} – ${l.puhelin} – ${l.sahkoposti}</p>
      <p><strong>Palvelu:</strong> ${l.palvelu} (${l.kategoria})</p>
      <p><strong>Kaupunki:</strong> ${l.kaupunki ?? "—"}</p>
      <p><strong>Ammattilainen:</strong> ${amm?.yritys ?? "—"}${amm?.sahkoposti ? ` (${amm.sahkoposti})` : ""}${amm?.puhelin ? `, ${amm.puhelin}` : ""}</p>
      <p><strong>Liidi luotu:</strong> ${new Date(l.lahetetty_at ?? l.created_at).toLocaleString("fi-FI")}</p>
    `;
    await lahetaEmail({ to: ownerEmail, subject, html });
  } catch (e) {
    console.error("Kriittinen hälytys epäonnistui", e);
  }
}

// ===========================================================
// Metriikka-päivitykset
// ===========================================================
export const paivitaKirjautuminen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const a = await admin();
    await a.rpc("inkrementoi_metriikka", { _user_id: context.userId, _kentta: "kirjautuminen", _maara: 1 });
    return { ok: true };
  });

export const merkitsePtsAvattu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await inkrementoiMetriikka(context.userId, "pts_avattu", 1);
    return { ok: true };
  });

export const paivitaMetriikka = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ kentta: z.string(), maara: z.number().default(1) }).parse(i))
  .handler(async ({ data, context }) => {
    await inkrementoiMetriikka(context.userId, data.kentta, data.maara);
    return { ok: true };
  });

export const paivitaKausikirjeSuostumus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ suostumus: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const a = await admin();
    await a.from("kayttaja_metriikat")
      .upsert({ user_id: context.userId, kausikirje_suostumus: data.suostumus }, { onConflict: "user_id" });
    return { ok: true };
  });

export const getOmaMetriikka = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const a = await admin();
    const { data } = await a.from("kayttaja_metriikat").select("*").eq("user_id", context.userId).maybeSingle();
    return data;
  });

// Server-only helper kutsuttavaksi muista serverFn:istä
export async function inkrementoiMetriikka(userId: string, kentta: string, maara = 1) {
  try {
    const a = await admin();
    await a.rpc("inkrementoi_metriikka", { _user_id: userId, _kentta: kentta, _maara: maara });
  } catch (e) {
    console.error("Metriikan päivitys epäonnistui", kentta, e);
  }
}

// ===========================================================
// ADMIN
// ===========================================================
async function vaadiAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Vain ylläpitäjä");
}

export const getPalauteYhteenveto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data: kaikki } = await a.from("palaute_kyselyt").select("tyyppi, vastattu_at, vastaukset, lahetetty_at");
    const lista = kaikki ?? [];

    const npsv = lista.filter((k: any) => k.tyyppi === "nps" && k.vastattu_at && typeof k.vastaukset?.pisteet === "number");
    const nps = npsv.length
      ? Math.round(
          (npsv.filter((k: any) => k.vastaukset.pisteet >= 9).length / npsv.length -
            npsv.filter((k: any) => k.vastaukset.pisteet <= 6).length / npsv.length) * 100,
        )
      : null;

    const kk = lista.filter((k: any) => String(k.tyyppi).startsWith("kausikirje_"));
    const kkVast = kk.filter((k: any) => k.vastattu_at);
    const kausiPros = kk.length ? Math.round((kkVast.length / kk.length) * 100) : null;

    // Reagoimattomat 7pv (vaihe 1 "ei_ollenkaan")
    const viikkoSitten = Date.now() - 7 * ARKIPV_MS;
    const reagoimattomat = lista.filter((k: any) =>
      k.tyyppi === "ydinprosessi_yhteydenotto" &&
      k.vastattu_at &&
      new Date(k.vastattu_at).getTime() >= viikkoSitten &&
      k.vastaukset?.yhteydenotto === "ei_ollenkaan",
    ).length;

    return { nps, kausiPros, reagoimattomat };
  });

// Ydinprosessin mittarit
export const getYdinprosessiMittarit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();

    const { data: vaiheet } = await a.from("palaute_kyselyt")
      .select("tyyppi, trigger_id, vastattu_at, vastaukset")
      .in("tyyppi", ["ydinprosessi_yhteydenotto", "ydinprosessi_kaynnin_jalkeen", "ydinprosessi_kokonaiskokemus"]);
    const v = vaiheet ?? [];

    const v1Vastatut = v.filter((k: any) => k.tyyppi === "ydinprosessi_yhteydenotto" && k.vastattu_at);
    const v1Kylla = v1Vastatut.filter((k: any) => String(k.vastaukset?.yhteydenotto ?? "").startsWith("kylla_"));
    const yhteydenottoPros = v1Vastatut.length ? Math.round((v1Kylla.length / v1Vastatut.length) * 100) : null;

    const v2Vastatut = v.filter((k: any) => k.tyyppi === "ydinprosessi_kaynnin_jalkeen" && k.vastattu_at);
    const v2Kavi = v2Vastatut.filter((k: any) => k.vastaukset?.kavi === "kylla_kavi");
    const kayntiPros = v2Vastatut.length ? Math.round((v2Kavi.length / v2Vastatut.length) * 100) : null;

    const v3Vastatut = v.filter((k: any) => k.tyyppi === "ydinprosessi_kokonaiskokemus" && k.vastattu_at);
    const v3Tyyt = v3Vastatut.filter((k: any) => k.vastaukset?.kokonaisuus === "taysin");
    const tyytyvaisyysPros = v3Vastatut.length ? Math.round((v3Tyyt.length / v3Vastatut.length) * 100) : null;

    return {
      yhteydenottoPros, kayntiPros, tyytyvaisyysPros,
      v1Vastauksia: v1Vastatut.length, v2Vastauksia: v2Vastatut.length, v3Vastauksia: v3Vastatut.length,
    };
  });

// Ammattilaisten ranking (uusi pisteytys)
export const getAmmattilaisRanking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data } = await a.from("ammattilaiset")
      .select("id, yritys, kategoria, keskiarvopisteet, arviomaara, viimeisin_arvio")
      .order("keskiarvopisteet", { ascending: false, nullsFirst: false });
    return data ?? [];
  });

// Liidi-statukset (V1/V2/V3) admin-liidit-listalle
export const getYdinprosessiLiidiStatukset = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data } = await a.from("palaute_kyselyt")
      .select("trigger_id, tyyppi, vastaukset, vastattu_at, lahetetty_at")
      .in("tyyppi", ["ydinprosessi_yhteydenotto", "ydinprosessi_kaynnin_jalkeen", "ydinprosessi_kokonaiskokemus"])
      .not("trigger_id", "is", null);
    const map: Record<string, { v1?: any; v2?: any; v3?: any }> = {};
    for (const k of data ?? []) {
      const id = k.trigger_id as string;
      if (!map[id]) map[id] = {};
      const v = { vastattu: !!k.vastattu_at, vastaukset: k.vastaukset, lahetetty_at: k.lahetetty_at };
      if (k.tyyppi === "ydinprosessi_yhteydenotto") map[id].v1 = v;
      else if (k.tyyppi === "ydinprosessi_kaynnin_jalkeen") map[id].v2 = v;
      else if (k.tyyppi === "ydinprosessi_kokonaiskokemus") map[id].v3 = v;
    }
    return map;
  });

export const getKonversioputki = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data: kaikki } = await a.from("kayttaja_metriikat").select("*");
    const list = kaikki ?? [];
    const rekisteroitynyt = list.length;
    const tiedotTaytetty = list.filter((m: any) => m.talon_tiedot_taytetty).length;
    const ptsAvattu = list.filter((m: any) => m.pts_avattu).length;
    const vuosikelloKuitattu = list.filter((m: any) => (m.vuosikelloa_kuitattu ?? 0) > 0).length;
    const liidiLahetetty = list.filter((m: any) => (m.liideja_lahetetty ?? 0) > 0).length;

    const { data: huollot } = await a.from("huolto_historia").select("kiinteisto_id, tekija, tekija_nimi").not("tekija", "in", '("itse","jatetaan")');
    const { data: kt } = await a.from("kiinteistot").select("id, user_id");
    const ktMap = new Map((kt ?? []).map((k: any) => [k.id, k.user_id]));
    const tyoTehnyt = new Set<string>();
    for (const h of huollot ?? []) {
      if (!h.tekija_nimi) continue;
      const u = ktMap.get(h.kiinteisto_id);
      if (u) tyoTehnyt.add(u as string);
    }

    return [
      { vaihe: "Rekisteröitynyt", lkm: rekisteroitynyt },
      { vaihe: "Tiedot täytetty", lkm: tiedotTaytetty },
      { vaihe: "PTS avattu", lkm: ptsAvattu },
      { vaihe: "Vuosikello kuitattu", lkm: vuosikelloKuitattu },
      { vaihe: "Liidi lähetetty", lkm: liidiLahetetty },
      { vaihe: "Työ tehty", lkm: tyoTehnyt.size },
    ];
  });

export const getKayttajaSegmentit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data } = await a.from("kayttaja_metriikat").select("*");
    const list = (data ?? []) as any[];
    const nyt = Date.now();
    const aktiiviset = list.filter((m) =>
      m.viimeisin_kirjautuminen && nyt - new Date(m.viimeisin_kirjautuminen).getTime() < 14 * ARKIPV_MS &&
      ((m.vuosikelloa_kuitattu ?? 0) > 0 || (m.liideja_lahetetty ?? 0) > 0)
    ).length;
    const passiiviset = list.filter((m) =>
      !m.viimeisin_kirjautuminen || nyt - new Date(m.viimeisin_kirjautuminen).getTime() >= 14 * ARKIPV_MS
    ).length;
    const liidiasiakkaat = list.filter((m) => (m.liideja_lahetetty ?? 0) >= 1).length;
    return { aktiiviset, passiiviset, liidiasiakkaat, yhteensa: list.length };
  });

export const getPalauteVastaukset = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data } = await a.from("palaute_kyselyt")
      .select("id, tyyppi, trigger_id, lahetetty_at, vastattu_at, vastaukset, user_id")
      .not("vastattu_at", "is", null)
      .order("vastattu_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const getAmmattilaisarviot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data: vast } = await a.from("palaute_kyselyt")
      .select("trigger_id, vastaukset")
      .eq("tyyppi", "tyonlaatu")
      .not("vastattu_at", "is", null);
    if (!vast?.length) return [];
    const ids = vast.map((v: any) => v.trigger_id).filter(Boolean);
    const { data: huollot } = await a.from("huolto_historia")
      .select("id, tekija_nimi")
      .in("id", ids);
    const hMap = new Map((huollot ?? []).map((h: any) => [h.id, h.tekija_nimi]));
    const agg: Record<string, { summa: number; lkm: number }> = {};
    for (const v of vast as any[]) {
      const nimi = hMap.get(v.trigger_id);
      const pisteet = Number(v.vastaukset?.laatu);
      if (!nimi || !pisteet) continue;
      if (!agg[nimi]) agg[nimi] = { summa: 0, lkm: 0 };
      agg[nimi].summa += pisteet;
      agg[nimi].lkm += 1;
    }
    return Object.entries(agg).map(([nimi, s]) => ({ nimi, keskiarvo: s.summa / s.lkm, lkm: s.lkm }))
      .sort((a, b) => b.keskiarvo - a.keskiarvo);
  });

export const getKausikirjeTilastot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data } = await a.from("palaute_kyselyt")
      .select("tyyppi, vastattu_at, vastaukset, lahetetty_at")
      .like("tyyppi", "kausikirje_%");
    const lista = (data ?? []) as any[];
    const nyt = Date.now();
    const tamaKausi = lista.filter((k) => nyt - new Date(k.lahetetty_at).getTime() < 100 * ARKIPV_MS);
    const lahetetty = tamaKausi.length;
    const vastattu = tamaKausi.filter((k) => k.vastattu_at).length;
    const jakauma: Record<string, number> = {};
    for (const k of tamaKausi) {
      const v = k.vastaukset?.vastaus;
      if (!v) continue;
      jakauma[v] = (jakauma[v] ?? 0) + 1;
    }
    return { lahetetty, vastattu, vastausProsentti: lahetetty ? Math.round((vastattu / lahetetty) * 100) : 0, jakauma };
  });

export const lahetaTestiKausikirje = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({
    kausi: z.enum(["kevat", "kesa", "syksy", "talvi"]),
  }).parse(i))
  .handler(async ({ data, context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();

    const { data: prof } = await a.from("profiles").select("email, nimi").eq("id", context.userId).maybeSingle();
    if (!prof?.email) throw new Error("Sähköpostia ei löytynyt profiilista");

    const [{ lahetaEmail }, { rakennaKausikirje }] = await Promise.all([
      import("@/lib/email.server"),
      import("@/lib/kausikirje.server"),
    ]);
    const baseUrl = process.env.PUBLIC_APP_URL ?? "https://kotiluotsi.fi";
    const etunimi = (prof.nimi ?? prof.email).split(" ")[0];

    const { data: kysely, error } = await a.from("palaute_kyselyt")
      .insert({ user_id: context.userId, tyyppi: `kausikirje_${data.kausi}` })
      .select("token")
      .single();
    if (error) throw error;

    const msg = rakennaKausikirje({
      etunimi, kausi: data.kausi, token: kysely.token, baseUrl, ptsHuomio: null,
    });
    msg.subject = `[TESTI] ${msg.subject}`;
    const r = await lahetaEmail({ to: prof.email, subject: msg.subject, html: msg.html });
    return r;
  });

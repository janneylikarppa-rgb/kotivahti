// Palaute- ja mittausjärjestelmän server-funktiot.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ----- Tyypit -----
export type KyselyTyyppi =
  | "onboarding" | "nps" | "churn"
  | "liidi_yhteydenotto" | "liidi_tulos"
  | "tyonlaatu"
  | "kausikirje_kevat" | "kausikirje_kesa" | "kausikirje_syksy" | "kausikirje_talvi";

export type AktiivinenKysely = {
  id: string;            // palaute_kyselyt.id
  tyyppi: KyselyTyyppi;
  trigger_id: string | null;
  meta?: Record<string, any>;
} | null;

const ARKIPV_MS = 24 * 60 * 60 * 1000;

function paivaSitten(ts: string | Date, paivaa: number): boolean {
  const t = typeof ts === "string" ? new Date(ts).getTime() : ts.getTime();
  return Date.now() - t >= paivaa * ARKIPV_MS;
}

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

    // Käyttäjän kaikki palautekyselyt (rajaa)
    const { data: kyselyt } = await supabase
      .from("palaute_kyselyt")
      .select("id, tyyppi, trigger_id, lahetetty_at, vastattu_at")
      .eq("user_id", userId)
      .order("lahetetty_at", { ascending: false })
      .limit(200);
    const lista = kyselyt ?? [];

    // Onko jo avoin (lähetetty mutta ei vastattu) → palauta se
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

    // Metriikat ja profiili
    const { data: m } = await a.from("kayttaja_metriikat").select("*").eq("user_id", userId).maybeSingle();

    // P1: Liidi yhteydenotto
    const { data: liidit } = await supabase
      .from("liidit")
      .select("id, status, lahetetty_at, created_at, nimi, puhelin, sahkoposti, kategoria, palvelu, kaupunki")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    for (const l of liidit ?? []) {
      const ts = l.lahetetty_at ?? l.created_at;
      if (l.status === "valitetty" && paivaSitten(ts, 3) && !onkoLahetetty("liidi_yhteydenotto", l.id)) {
        return luo("liidi_yhteydenotto", l.id);
      }
    }

    // P2: Liidi tulos
    for (const l of liidit ?? []) {
      if (onkoLahetetty("liidi_tulos", l.id)) continue;
      const yhKysely = lista.find((k: any) => k.tyyppi === "liidi_yhteydenotto" && k.trigger_id === l.id && k.vastattu_at);
      const yhVast = yhKysely as any;
      const ehto1 = yhVast && yhVast.vastattu_at && paivaSitten(yhVast.vastattu_at, 7);
      const ehto2 = paivaSitten(l.created_at, 14);
      if (ehto1 || ehto2) {
        return luo("liidi_tulos", l.id);
      }
    }

    // P3: Tyonlaatu
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

    // P4: Onboarding
    if (paivaSitten(m.rekisteroity_at, 7) && !onkoLahetetty("onboarding")) {
      return luo("onboarding");
    }

    // P5: NPS
    if (
      paivaSitten(m.rekisteroity_at, 30) &&
      (m.kirjautumisia ?? 0) >= 3 &&
      !onkoLahetetty("nps", null, 180)
    ) {
      return luo("nps");
    }

    // P6: Churn
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

    // NPS → metriikka
    if (kysely.tyyppi === "nps" && typeof data.vastaukset.pisteet === "number") {
      await a.from("kayttaja_metriikat")
        .update({
          nps_pisteet: data.vastaukset.pisteet,
          nps_annettu_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    }

    // Liidi yhteydenotto: "ei_ollenkaan" → omistajalle hälytys
    if (kysely.tyyppi === "liidi_yhteydenotto" && data.vastaukset.yhteydenotto === "ei_ollenkaan" && kysely.trigger_id) {
      try {
        const [{ lahetaEmail }, { rakennaOmistajaHalytys }] = await Promise.all([
          import("@/lib/email.server"),
          import("@/lib/kausikirje.server"),
        ]);
        const { data: l } = await a.from("liidit").select("*").eq("id", kysely.trigger_id).maybeSingle();
        const ownerEmail = process.env.OWNER_EMAIL;
        if (ownerEmail && l) {
          const msg = rakennaOmistajaHalytys({
            asiakas: l.nimi, puhelin: l.puhelin, kategoria: l.kategoria,
            palvelu: l.palvelu, kaupunki: l.kaupunki ?? "—",
            lahetetty: new Date(l.lahetetty_at ?? l.created_at).toLocaleString("fi-FI"),
          });
          await lahetaEmail({ to: ownerEmail, subject: msg.subject, html: msg.html });
        }
      } catch (e) {
        console.error("Omistajahälytys epäonnistui", e);
      }
    }

    return { ok: true };
  });

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
    const a = await admin();
    await a.rpc("inkrementoi_metriikka", { _user_id: context.userId, _kentta: "pts_avattu", _maara: 1 });
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

// Server-only helper kutsuttavaksi muista serverFn:istä:
export async function inkrementoiMetriikka(userId: string, kentta: string, maara = 1) {
  try {
    const a = await admin();
    await a.rpc("inkrementoi_metriikka", { _user_id: userId, _kentta: kentta, _maara: maara });
  } catch (e) {
    console.error("Metriikan päivitys epäonnistui", kentta, e);
  }
}

// ===========================================================
// ADMIN: yhteenvedot
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

    // NPS
    const npsv = lista.filter((k: any) => k.tyyppi === "nps" && k.vastattu_at && typeof k.vastaukset?.pisteet === "number");
    const nps = npsv.length
      ? Math.round(
          (npsv.filter((k: any) => k.vastaukset.pisteet >= 9).length / npsv.length -
            npsv.filter((k: any) => k.vastaukset.pisteet <= 6).length / npsv.length) * 100,
        )
      : null;

    // Kausikirje vastaus-%
    const kk = lista.filter((k: any) => String(k.tyyppi).startsWith("kausikirje_"));
    const kkVast = kk.filter((k: any) => k.vastattu_at);
    const kausiPros = kk.length ? Math.round((kkVast.length / kk.length) * 100) : null;

    // Liidi-tyytyväisyys
    const lt = lista.filter((k: any) => k.tyyppi === "liidi_tulos" && k.vastattu_at);
    const lTyyt = lt.filter((k: any) => k.vastaukset?.tarve === "taysin").length;
    const liidiPros = lt.length ? Math.round((lTyyt / lt.length) * 100) : null;

    // Reagoimattomat ammattilaiset viim. 7pv
    const viikkoSitten = Date.now() - 7 * ARKIPV_MS;
    const reagoimattomat = lista.filter((k: any) =>
      k.tyyppi === "liidi_yhteydenotto" &&
      k.vastattu_at &&
      new Date(k.vastattu_at).getTime() >= viikkoSitten &&
      k.vastaukset?.yhteydenotto === "ei_ollenkaan",
    ).length;

    return { nps, kausiPros, liidiPros, reagoimattomat };
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

    // Työ tehty: laskee uniikit user_id:t joilla on ammattilaisen tekemä huolto
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

export const getLiidiPalautteet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await vaadiAdmin(context.supabase, context.userId);
    const a = await admin();
    const { data } = await a.from("palaute_kyselyt")
      .select("trigger_id, tyyppi, vastaukset, vastattu_at")
      .in("tyyppi", ["liidi_yhteydenotto", "liidi_tulos"])
      .not("trigger_id", "is", null)
      .not("vastattu_at", "is", null);
    const map: Record<string, { v1?: any; v2?: any }> = {};
    for (const k of data ?? []) {
      const id = k.trigger_id as string;
      if (!map[id]) map[id] = {};
      if (k.tyyppi === "liidi_yhteydenotto") map[id].v1 = k.vastaukset;
      else map[id].v2 = k.vastaukset;
    }
    return map;
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
    const baseUrl = process.env.PUBLIC_APP_URL ?? "https://kotivahti.fi";
    const etunimi = (prof.nimi ?? prof.email).split(" ")[0];

    // Luo testirivi (token) ja lähetä
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

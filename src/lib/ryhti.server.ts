// Server-only helpers for Ryhti / address lookups.
// Kept out of *.functions.ts so the server-fn splitter doesn't lose them.
//
// Lähde: ympäristöministeriön avoin Ryhti-rakennustietovaranto (WFS, ei API-avainta)
//   ryhti_building:open_address  — koko Suomen osoiterekisteri (+ building_key)
//   ryhti_building:open_building — rakennusten ominaisuustiedot

export type RyhtiVirheKoodi =
  | "NO_ADDRESS"
  | "NO_BUILDING"
  | "TIMEOUT"
  | "UPSTREAM_ERROR";

export class RyhtiError extends Error {
  koodi: RyhtiVirheKoodi;
  constructor(koodi: RyhtiVirheKoodi, message?: string) {
    super(message ?? koodi);
    this.koodi = koodi;
    this.name = "RyhtiError";
  }
}

export type RyhtiTulos = {
  rakennusvuosi: number | null;
  pinta_ala: number | null;
  lammitysmuoto: string | null;
  julkisivumateriaali: string | null;
  kerroksia: number | null;
  lahde: "ryhti";
};

const TIMEOUT_MS = 12000;
const WFS_BASE = "https://paikkatiedot.ymparisto.fi/geoserver/ryhti_building/wfs";

export async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Kotiluotsi/1.0 (kiinteistonhuoltopalvelu)",
      },
    });
    if (!res.ok) {
      throw new RyhtiError("UPSTREAM_ERROR", `HTTP ${res.status} (${url})`);
    }
    return await res.json();
  } catch (e: any) {
    if (e instanceof RyhtiError) throw e;
    if (e?.name === "AbortError") throw new RyhtiError("TIMEOUT");
    throw new RyhtiError("UPSTREAM_ERROR", e?.message);
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* WFS                                                                 */
/* ------------------------------------------------------------------ */

function cqlEscape(s: string) {
  return s.replace(/'/g, "''");
}

async function wfsHae(typeName: string, cqlFilter: string, count: number): Promise<any[]> {
  const url =
    `${WFS_BASE}?service=WFS&version=2.0.0&request=GetFeature` +
    `&typeNames=${encodeURIComponent(typeName)}` +
    `&outputFormat=${encodeURIComponent("application/json")}` +
    `&srsName=EPSG:4326&count=${count}` +
    `&CQL_FILTER=${encodeURIComponent(cqlFilter)}`;
  const data = await fetchJson(url);
  const feats = data?.features;
  return Array.isArray(feats) ? feats : [];
}

/* ------------------------------------------------------------------ */
/* Koodistot (uri.suomi.fi -> suomenkielinen arvo)                     */
/* ------------------------------------------------------------------ */

function koodi(uri: any): string | null {
  if (typeof uri !== "string" || !uri) return null;
  const osa = uri.split("/").pop();
  return osa ? osa.trim() : null;
}

// rytj/lammitystapa
const LAMMITYSTAPA: Record<string, string> = {
  "01": "keskuslammitys", // vesikeskuslämmitys
  "02": "keskuslammitys", // ilmakeskuslämmitys
  "03": "sahkolammitys",
  "04": "muu", // uuni/takka/kamiina
  "05": "muu", // aurinkolämmitys
  "06": "ilmalampopumppu",
  "07": "muu",
  "99": "muu",
};

// rytj/lammitysenergianlahde — tarkempi, ohittaa lämmitystavan kun tunnistettu
const LAMMITYSLAHDE: Record<string, string> = {
  "01": "kaukolampo",
  "09": "maalampo",
  "1101": "maalampo",
  "1102": "ilmalampopumppu",
  "1104": "ilmavesilampo",
};

// rytj/julkisivunrakennusaine
const JULKISIVU_KOODI: Record<string, string> = {
  "01": "Kivi", // betoni
  "02": "Tiili",
  "03": "Pelti", // metallilevy
  "04": "Kivi",
  "05": "Puu (lautaverhous)",
  "06": "Lasi",
};

// rytj/avoin_rakennusluokitus — mitkä lasketaan asuinrakennukseksi
const ASUINLUOKAT = new Set(["01", "05", "06"]); // vapaa-ajan, pientalo, kerrostalo

/* ------------------------------------------------------------------ */
/* Osoitehaku                                                          */
/* ------------------------------------------------------------------ */

export type OsoiteEhdotus = {
  id: string;
  katuosoite: string;
  postinumero: string | null;
  kaupunki: string | null;
  lat: number;
  lon: number;
  rakennusAvain: string | null;
  label: string;
};

function siistiKaupunki(v: any): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  // Rekisterissä ISOILLA: HELSINKI -> Helsinki
  return s
    .toLocaleLowerCase("fi-FI")
    .split(/(\s|-)/)
    .map((o) => (o.length > 1 ? o[0].toLocaleUpperCase("fi-FI") + o.slice(1) : o))
    .join("");
}

/** Osoite-ehdotukset kirjoittamisen aikana suoraan Ryhti-osoiterekisteristä */
export async function haeOsoiteEhdotukset(teksti: string): Promise<OsoiteEhdotus[]> {
  const haku = teksti.trim().replace(/\s+/g, " ");
  if (haku.length < 3) return [];

  const suodatin = `address_fin ILIKE '${cqlEscape(haku)}%'`;
  const feats = await wfsHae("ryhti_building:open_address", suodatin, 300);

  const nahdyt = new Set<string>();
  const tulos: OsoiteEhdotus[] = [];
  for (const f of feats) {
    const p = f?.properties ?? {};
    const c = f?.geometry?.coordinates;
    const lon = Number(Array.isArray(c) ? c[0] : NaN);
    const lat = Number(Array.isArray(c) ? c[1] : NaN);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const katuosoite = String(p.address_fin ?? "").trim();
    if (!katuosoite) continue;
    const postinumero = p.postal_code ? String(p.postal_code).trim() : null;
    const kaupunki = siistiKaupunki(p.postal_office_fin);

    const avain = `${katuosoite.toLocaleLowerCase("fi-FI")}|${postinumero ?? ""}`;
    if (nahdyt.has(avain)) continue;
    nahdyt.add(avain);

    tulos.push({
      id: String(p.address_key ?? avain),
      katuosoite,
      postinumero,
      kaupunki,
      lat,
      lon,
      rakennusAvain: p.building_key ? String(p.building_key) : null,
      label: [katuosoite, [postinumero, kaupunki].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", "),
    });
  }

  // Lyhin (tarkin) osoite ensin, esim. "Kirkkokatu 5" ennen "Kirkkokatu 50"
  tulos.sort((a, b) => a.katuosoite.length - b.katuosoite.length);
  return tulos.slice(0, 7);
}

/** Osoite → koordinaatit (käytetään vain vanhan nappihaun kanssa) */
export async function geokoodaa(osoite: string, kaupunki?: string | null) {
  const ehdotukset = await haeOsoiteEhdotukset(osoite);
  const kohde = kaupunki?.trim()
    ? ehdotukset.find(
        (e) => e.kaupunki?.toLocaleLowerCase("fi-FI") === kaupunki.trim().toLocaleLowerCase("fi-FI"),
      ) ?? ehdotukset[0]
    : ehdotukset[0];
  if (!kohde) throw new RyhtiError("NO_ADDRESS");
  return { lat: kohde.lat, lon: kohde.lon, rakennusAvain: kohde.rakennusAvain };
}

/* ------------------------------------------------------------------ */
/* Rakennushaku                                                        */
/* ------------------------------------------------------------------ */

export async function haeRakennusAvaimella(rakennusAvain: string): Promise<any | null> {
  const feats = await wfsHae(
    "ryhti_building:open_building",
    `building_key='${cqlEscape(rakennusAvain)}'`,
    1,
  );
  return feats[0] ?? null;
}

/** Koordinaatit → lähialueen rakennukset (bbox ~ radius metriä) */
export async function haeRakennukset(lat: number, lon: number, radius = 60) {
  const dLat = radius / 111320;
  const dLon = radius / (111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  const suodatin =
    `BBOX(point_location_geometry_data, ${(lon - dLon).toFixed(7)}, ${(lat - dLat).toFixed(7)}, ` +
    `${(lon + dLon).toFixed(7)}, ${(lat + dLat).toFixed(7)}, 'EPSG:4326')`;
  return await wfsHae("ryhti_building:open_building", suodatin, 40);
}

function onAsuinrakennus(f: any): boolean {
  const k = koodi(f?.properties?.main_purpose);
  if (!k) return true;
  return ASUINLUOKAT.has(k);
}

function etaisyys(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function valitseLahin(rakennukset: any[], lat: number, lon: number): any | null {
  const asuin = rakennukset.filter(onAsuinrakennus);
  const ehdokkaat = asuin.length > 0 ? asuin : rakennukset;
  if (ehdokkaat.length === 0) return null;
  let paras = ehdokkaat[0];
  let parasEt = Infinity;
  for (const r of ehdokkaat) {
    const c = r?.geometry?.coordinates;
    const d =
      Array.isArray(c) && c.length >= 2
        ? etaisyys(lat, lon, Number(c[1]), Number(c[0]))
        : Infinity;
    if (d < parasEt) {
      parasEt = d;
      paras = r;
    }
  }
  return paras;
}

/* ------------------------------------------------------------------ */
/* Kenttien mappaus                                                    */
/* ------------------------------------------------------------------ */

export function mappaaLammitys(tapaUri: any, lahdeUri?: any): string | null {
  const lahde = koodi(lahdeUri);
  if (lahde && LAMMITYSLAHDE[lahde]) return LAMMITYSLAHDE[lahde];
  const tapa = koodi(tapaUri);
  if (tapa && LAMMITYSTAPA[tapa]) return LAMMITYSTAPA[tapa];
  return null;
}

export function mappaaJulkisivu(uri: any): string | null {
  const k = koodi(uri);
  if (!k) return null;
  return JULKISIVU_KOODI[k] ?? null;
}

function positiivinen(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function mappaaRakennus(f: any): RyhtiTulos {
  const p = f?.properties ?? f ?? {};

  const vuosi = Number(String(p.completion_date ?? "").slice(0, 4));
  const pinta_ala =
    positiivinen(p.total_area) ?? positiivinen(p.gross_floor_area) ?? positiivinen(p.floor_area);
  const kerroksia = positiivinen(p.number_of_storeys);

  return {
    rakennusvuosi: Number.isFinite(vuosi) && vuosi > 1500 ? vuosi : null,
    pinta_ala,
    lammitysmuoto: mappaaLammitys(p.heating_method, p.heating_energy_source),
    julkisivumateriaali: mappaaJulkisivu(p.facade_material),
    kerroksia: kerroksia ? Math.round(kerroksia) : null,
    lahde: "ryhti",
  };
}

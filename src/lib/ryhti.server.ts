// Server-only helpers for Ryhti / Digitransit lookups.
// Kept out of *.functions.ts so the server-fn splitter doesn't lose them.

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

const TIMEOUT_MS = 8000;

export async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Kotivahti/1.0 (kiinteistonhuoltopalvelu)",
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

function nominatimUrl(teksti: string, limit: number) {
  return (
    "https://nominatim.openstreetmap.org/search" +
    `?q=${encodeURIComponent(teksti)}` +
    `&countrycodes=fi&format=jsonv2&addressdetails=1&limit=${limit}`
  );
}

/** Vaihe 1: osoite → koordinaatit (OSM Nominatim, ei avainta) */
export async function geokoodaa(osoite: string, kaupunki?: string | null) {
  const teksti = [osoite.trim(), kaupunki?.trim()].filter(Boolean).join(", ");
  const data = await fetchJson(nominatimUrl(teksti, 1));
  const ensimmainen = Array.isArray(data) ? data[0] : null;
  const lat = Number(ensimmainen?.lat);
  const lon = Number(ensimmainen?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new RyhtiError("NO_ADDRESS");
  }
  return { lat, lon };
}


/** Vaihe 2: koordinaatit → rakennukset (Ryhti) */
export async function haeRakennukset(lat: number, lon: number) {
  const url =
    "https://api.ryhti.fi/koodistot/v1/rakennukset/haku" +
    `?lat=${lat}&lon=${lon}&radius=50`;
  const data = await fetchJson(url);
  const lista =
    (Array.isArray(data) && data) ||
    data?.rakennukset ||
    data?.results ||
    data?.features ||
    data?.items ||
    [];
  return Array.isArray(lista) ? lista : [];
}

function poimi(obj: any, avaimet: string[]): any {
  if (!obj || typeof obj !== "object") return undefined;
  const kohde = obj.properties && typeof obj.properties === "object" ? { ...obj.properties, ...obj } : obj;
  for (const a of avaimet) {
    const v = kohde[a];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function numero(v: any): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(typeof v === "string" ? v.replace(",", ".") : v);
  return Number.isFinite(n) ? n : null;
}

function teksti(v: any): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "object") {
    const s = v.fi ?? v.nimi ?? v.selite ?? v.kuvaus ?? v.label ?? v.value;
    return typeof s === "string" ? s.trim() || null : null;
  }
  return String(v);
}

const EI_ASUIN = /(autotall|talousrakennu|sauna|varasto|katos|kasvihuone|maatalous|teollisuu|liikerakennu|toimisto|navetta|grilli|vaja)/i;
const ASUIN = /(asuin|omakoti|paritalo|rivitalo|kerrostalo|pientalo|vapaa-ajan|loma)/i;

function onAsuinrakennus(r: any): boolean {
  const kt = teksti(poimi(r, ["kayttotarkoitus", "käyttötarkoitus", "kayttotarkoitusKoodi", "rakennuksenKayttotarkoitus"]));
  if (!kt) return true; // ei tietoa → ei suodateta pois
  if (EI_ASUIN.test(kt)) return false;
  if (ASUIN.test(kt)) return true;
  // Numeeriset RHR-koodit: 01x = asuinrakennukset
  const koodi = String(kt).replace(/\D/g, "");
  if (koodi.length >= 3) return koodi.startsWith("01");
  return true;
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

function koordinaatit(r: any): { lat: number; lon: number } | null {
  const c = r?.geometry?.coordinates;
  if (Array.isArray(c) && c.length >= 2 && Number.isFinite(Number(c[0]))) {
    return { lon: Number(c[0]), lat: Number(c[1]) };
  }
  const lat = numero(poimi(r, ["lat", "latitude", "pohjoiskoordinaatti"]));
  const lon = numero(poimi(r, ["lon", "lng", "longitude", "itakoordinaatti"]));
  if (lat != null && lon != null) return { lat, lon };
  return null;
}

export function valitseLahin(rakennukset: any[], lat: number, lon: number): any | null {
  const asuin = rakennukset.filter(onAsuinrakennus);
  if (asuin.length === 0) return null;
  let paras = asuin[0];
  let parasEt = Infinity;
  for (const r of asuin) {
    const c = koordinaatit(r);
    const d = c ? etaisyys(lat, lon, c.lat, c.lon) : Infinity;
    if (d < parasEt) {
      parasEt = d;
      paras = r;
    }
  }
  return paras;
}

const LAMMITYS_MAP: { re: RegExp; key: string }[] = [
  { re: /maal[äa]mp/i, key: "maalampo" },
  { re: /kaukol[äa]mp/i, key: "kaukolampo" },
  { re: /ilma-?vesi/i, key: "ilmavesilampo" },
  { re: /ilmal[äa]mp[öo]pump/i, key: "ilmalampopumppu" },
  { re: /s[äa]hk/i, key: "sahkolammitys" },
  { re: /(vesikesk|keskusl[äa]mmit|kattila|[öo]ljy|pelletti|puu)/i, key: "keskuslammitys" },
];

export function mappaaLammitys(arvo: string | null): string | null {
  if (!arvo) return null;
  for (const m of LAMMITYS_MAP) if (m.re.test(arvo)) return m.key;
  return "muu";
}

const JULKISIVU_MAP: { re: RegExp; arvo: string }[] = [
  { re: /hirsi/i, arvo: "Hirsi" },
  { re: /(puu|lauta)/i, arvo: "Puu (lautaverhous)" },
  { re: /tiili/i, arvo: "Tiili" },
  { re: /rappa/i, arvo: "Rappaus" },
  { re: /(pelti|metalli|teräs|teras)/i, arvo: "Pelti" },
  { re: /(kuitusementti|minerit)/i, arvo: "Kuitusementtilevy" },
  { re: /levy/i, arvo: "Levyverhous" },
  { re: /(kivi|betoni)/i, arvo: "Kivi" },
];

export function mappaaJulkisivu(arvo: string | null): string | null {
  if (!arvo) return null;
  for (const m of JULKISIVU_MAP) if (m.re.test(arvo)) return m.arvo;
  return arvo;
}

export function mappaaRakennus(r: any): RyhtiTulos {
  const rakennusvuosi = numero(
    poimi(r, ["rakennusvuosi", "valmistumisvuosi", "kayttoonottovuosi", "rakentamisvuosi"]),
  );
  const pinta_ala = numero(
    poimi(r, ["huoneistoala", "asuinpintaAla", "asuinpinta_ala", "huoneistoalaM2", "kerrosala"]),
  );
  const kerroksia = numero(
    poimi(r, ["kerrostenlkm", "kerrostenLkm", "kerrosluku", "kerroksia", "kerrostenLukumaara"]),
  );
  const lammitysRaaka = teksti(
    poimi(r, ["lammitystapa", "lämmitystapa", "lammitysmuoto", "lammonlahde", "lämmönlähde"]),
  );
  const julkisivuRaaka = teksti(
    poimi(r, ["julkisivumateriaali", "julkisivunMateriaali", "julkisivu"]),
  );

  return {
    rakennusvuosi: rakennusvuosi && rakennusvuosi > 1500 ? Math.round(rakennusvuosi) : null,
    pinta_ala: pinta_ala && pinta_ala > 0 ? pinta_ala : null,
    lammitysmuoto: mappaaLammitys(lammitysRaaka),
    julkisivumateriaali: mappaaJulkisivu(julkisivuRaaka),
    kerroksia: kerroksia && kerroksia > 0 ? Math.round(kerroksia) : null,
    lahde: "ryhti",
  };
}

export type OsoiteEhdotus = {
  id: string;
  katuosoite: string;
  postinumero: string | null;
  kaupunki: string | null;
  lat: number;
  lon: number;
  label: string;
};

/** Osoite-ehdotukset kirjoittamisen aikana (Digitransit autocomplete, ei avainta) */
export async function haeOsoiteEhdotukset(teksti: string): Promise<OsoiteEhdotus[]> {
  const data = await fetchJson(nominatimUrl(teksti.trim(), 20));
  const osumat = Array.isArray(data) ? data : [];
  const nahdyt = new Set<string>();
  const tulos: OsoiteEhdotus[] = [];
  for (const o of osumat) {
    const a = o?.address ?? {};
    const lat = Number(o?.lat);
    const lon = Number(o?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const katu = String(a.road ?? a.pedestrian ?? a.residential ?? "").trim();
    if (!katu) continue;
    const numero = a.house_number ? String(a.house_number).trim() : "";
    const katuosoite = [katu, numero].filter(Boolean).join(" ");
    const postinumero = a.postcode ? String(a.postcode).trim() : null;
    const kaupunki =
      (a.city && String(a.city).trim()) ||
      (a.town && String(a.town).trim()) ||
      (a.village && String(a.village).trim()) ||
      (a.municipality && String(a.municipality).trim()) ||
      null;
    const avain = `${katuosoite.toLowerCase()}|${postinumero ?? ""}|${(kaupunki ?? "").toLowerCase()}`;
    if (nahdyt.has(avain)) continue;
    nahdyt.add(avain);
    tulos.push({
      id: String(o?.place_id ?? avain),
      katuosoite,
      postinumero,
      kaupunki,
      lat,
      lon,
      label: [katuosoite, [postinumero, kaupunki].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    });
    if (tulos.length >= 7) break;
  }
  return tulos;
}


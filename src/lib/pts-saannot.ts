// PTS-säännöt: RT-kortiston käyttöiät ja toimenpidevuoden laskenta.
// Kaava: toimenpideVuosi = lähdevuosi + käyttöikä - 2 (ennakointi 2v etukäteen)
// Huoltohistorian pts_siirto-arvot lisätään toimenpidevuoteen.

export type PtsKohteenSaanto = {
  kohde: string;
  kategoria: string;
  kayttoika: number;
  huoltovali: number; // vuosina
  // lähdevuoden valinta talon_tiedoista
  lahdeVuosi: (talo: any) => number | null;
  // ehto: koskeeko tätä taloa
  koskee?: (talo: any) => boolean;
};

const ehkaInt = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 1900 && n < 2200 ? n : null;
};

const lammitysVuosi = (talo: any) => ehkaInt(talo?.lammitys_asennettu_vuosi);
const rakennusVuosi = (talo: any) =>
  ehkaInt(talo?.rakennusvuosi) ?? ehkaInt(talo?.kiinteisto?.rakennusvuosi);

// Lämmitysmuoto-tarkistus (sallii eri kirjoitusasut)
const onLammitys = (talo: any, ...nimet: string[]) => {
  const m = String(talo?.lammitysmuoto ?? "").toLowerCase();
  return nimet.some((n) => m.includes(n.toLowerCase()));
};

const onKattomateriaali = (talo: any, ...nimet: string[]) => {
  const m = String(talo?.kattomateriaali ?? "").toLowerCase();
  return nimet.some((n) => m.includes(n.toLowerCase()));
};

export const PTS_SAANNOT: PtsKohteenSaanto[] = [
  // Lämmitys
  { kohde: "Öljykattila", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 1,
    lahdeVuosi: lammitysVuosi, koskee: (t) => onLammitys(t, "öljy", "oljy") },
  { kohde: "Maalämpöpumppu", kategoria: "Lämmitys", kayttoika: 22, huoltovali: 3,
    lahdeVuosi: lammitysVuosi, koskee: (t) => onLammitys(t, "maalämpö", "maalampo") },
  { kohde: "Ilma-vesilämpöpumppu", kategoria: "Lämmitys", kayttoika: 18, huoltovali: 1,
    lahdeVuosi: lammitysVuosi, koskee: (t) => onLammitys(t, "ilma-vesi", "ilmavesi") },
  { kohde: "Kaukolämpövaihdin", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 7,
    lahdeVuosi: lammitysVuosi, koskee: (t) => onLammitys(t, "kauko") },
  { kohde: "Poistoilmalämpöpumppu", kategoria: "Lämmitys", kayttoika: 20, huoltovali: 2,
    lahdeVuosi: lammitysVuosi, koskee: (t) => onLammitys(t, "poistoilma", "pilp") },
  { kohde: "Sähkökattila", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 5,
    lahdeVuosi: lammitysVuosi, koskee: (t) => onLammitys(t, "sähkökattila", "sahkokattila") },
  { kohde: "Sähköpatterit", kategoria: "Lämmitys", kayttoika: 30, huoltovali: 5,
    lahdeVuosi: lammitysVuosi, koskee: (t) => onLammitys(t, "sähköpatter", "sahkopatter", "suora sähkö", "suora sahko") },
  { kohde: "Ilmalämpöpumppu", kategoria: "Lämmitys", kayttoika: 14, huoltovali: 1,
    lahdeVuosi: (t) => ehkaInt(t?.ilp_asennettu_vuosi),
    koskee: (t) => ehkaInt(t?.ilp_asennettu_vuosi) != null },
  // Talotekniikka
  { kohde: "Ilmanvaihtokone", kategoria: "Talotekniikka", kayttoika: 20, huoltovali: 5,
    lahdeVuosi: (t) => ehkaInt(t?.ilmanvaihto_vuosi),
    koskee: (t) => !String(t?.ilmanvaihto ?? "").toLowerCase().includes("painovoima") },
  { kohde: "Painovoimaisen ilmanvaihdon kartoitus", kategoria: "Talotekniikka", kayttoika: 20, huoltovali: 10,
    lahdeVuosi: (t) => rakennusVuosi(t),
    koskee: (t) => String(t?.ilmanvaihto ?? "").toLowerCase().includes("painovoima") },
  { kohde: "Käyttövesiputkisto", kategoria: "Talotekniikka", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: (t) => ehkaInt(t?.putket_uusittu_vuosi) ?? rakennusVuosi(t) },
  { kohde: "Viemäröinti", kategoria: "Talotekniikka", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: (t) => ehkaInt(t?.viemari_asennettu_vuosi) ?? rakennusVuosi(t) },
  // Rakenne
  { kohde: "Peltikatto", kategoria: "Rakenne", kayttoika: 40, huoltovali: 5,
    lahdeVuosi: (t) => ehkaInt(t?.katto_uusittu_vuosi) ?? rakennusVuosi(t),
    koskee: (t) => onKattomateriaali(t, "pelti") },
  { kohde: "Tiilikatto", kategoria: "Rakenne", kayttoika: 50, huoltovali: 5,
    lahdeVuosi: (t) => ehkaInt(t?.katto_uusittu_vuosi) ?? rakennusVuosi(t),
    koskee: (t) => onKattomateriaali(t, "tiili") },
  { kohde: "Bitumihuopa", kategoria: "Rakenne", kayttoika: 20, huoltovali: 3,
    lahdeVuosi: (t) => ehkaInt(t?.katto_uusittu_vuosi) ?? rakennusVuosi(t),
    koskee: (t) => onKattomateriaali(t, "huopa", "bitumi") },
  { kohde: "Puujulkisivun maalaus", kategoria: "Rakenne", kayttoika: 10, huoltovali: 10,
    lahdeVuosi: (t) => ehkaInt(t?.julkisivu_maalattu_vuosi),
    koskee: (t) => String(t?.julkisivumateriaali ?? "").toLowerCase().includes("puu") },
  { kohde: "Salaojat", kategoria: "Rakenne", kayttoika: 40, huoltovali: 5,
    lahdeVuosi: (t) => rakennusVuosi(t),
    koskee: (t) => t?.salaojat === true || rakennusVuosi(t) != null },
  { kohde: "Ikkunat", kategoria: "Rakenne", kayttoika: 30, huoltovali: 10,
    lahdeVuosi: (t) => ehkaInt(t?.ikkunat_uusittu_vuosi) ?? rakennusVuosi(t) },
  // Sisä
  { kohde: "Kylpyhuone / märkätila", kategoria: "Sisätilat", kayttoika: 25, huoltovali: 10,
    lahdeVuosi: (t) => rakennusVuosi(t) },
  // Piha
  { kohde: "Terassi (puu)", kategoria: "Piha", kayttoika: 20, huoltovali: 3,
    lahdeVuosi: (t) => ehkaInt(t?.terassi_rakennettu_vuosi),
    koskee: (t) => String(t?.terassi_materiaali ?? "").toLowerCase().includes("puu") || ehkaInt(t?.terassi_rakennettu_vuosi) != null },
  { kohde: "Terassin lasitus", kategoria: "Piha", kayttoika: 30, huoltovali: 2,
    lahdeVuosi: (t) => ehkaInt(t?.terassi_lasitus_vuosi) ?? ehkaInt(t?.terassi_rakennettu_vuosi),
    koskee: (t) => t?.terassi_lasitettu === true },
];

export type PtsTila = "kiireellinen" | "lahivuosina" | "seurannassa";

export type PtsRivi = {
  id: string; // synteettinen tai pts_rivit.id
  lahde: "auto" | "oma";
  kohde: string;
  kategoria: string;
  vuosi: number; // suositeltu toimenpidevuosi
  vuosiaJaljella: number;
  tila: PtsTila;
  kuvaus?: string | null;
  huoltovali: number; // 0 jos oma
  ylitettyVuosia?: number; // jos kohde on ylittänyt käyttöikänsä
  lykatty?: boolean; // käyttäjä on siirtänyt tätä riviä eteenpäin
  lykkaysPeruste?: string | null;
  alkuperainenVuosi?: number; // alkuperäinen suositusvuosi ennen lykkäystä
};

export function laskeTila(vuosiaJaljella: number): PtsTila {
  if (vuosiaJaljella < 5) return "kiireellinen";
  if (vuosiaJaljella <= 10) return "lahivuosina";
  return "seurannassa";
}

// Summaa pts_siirto-arvot tietylle kohteelle
function summaaSiirto(huollot: any[], kohde: string): number {
  return (huollot ?? [])
    .filter((h) => (h.kohde ?? "").toLowerCase() === kohde.toLowerCase())
    .reduce((s, h) => s + (Number(h.pts_siirto) || 0), 0);
}

export type Lykkays = { kohde: string; lykatty_vuoteen: number; peruste?: string | null };

export function generoiAutoRivit(
  talo: any,
  huollot: any[],
  kuitatut: { kohde: string }[],
  aikajanneVuotta = 10,
  lykkaykset: Lykkays[] = [],
): PtsRivi[] {
  if (!talo) return [];
  const nyt = new Date().getFullYear();
  const maxVuosi = nyt + aikajanneVuotta;
  const kuitatutSet = new Set(kuitatut.map((k) => k.kohde.toLowerCase()));
  const lykkaysMap = new Map(
    lykkaykset.map((l) => [l.kohde.toLowerCase(), l] as const),
  );

  const rivit: PtsRivi[] = [];
  for (const s of PTS_SAANNOT) {
    if (s.koskee && !s.koskee(talo)) continue;
    if (kuitatutSet.has(s.kohde.toLowerCase())) continue;
    const lahde = s.lahdeVuosi(talo);
    if (lahde == null) continue;
    const siirto = summaaSiirto(huollot, s.kohde);
    let toimenpide = lahde + s.kayttoika - 2 + siirto;
    const lyk = lykkaysMap.get(s.kohde.toLowerCase());
    const alkuperainen = toimenpide;
    let lykatty = false;
    if (lyk && lyk.lykatty_vuoteen > toimenpide) {
      toimenpide = lyk.lykatty_vuoteen;
      lykatty = true;
    }
    // jos jo ylitetty selvästi, päivitä "nyt"-vuoteen mutta merkitse ylitys
    const ylitetty = toimenpide < nyt ? nyt - toimenpide : 0;
    if (toimenpide < nyt) toimenpide = nyt;
    if (toimenpide > maxVuosi) continue;
    const vuosiaJaljella = toimenpide - nyt;
    rivit.push({
      id: `auto:${s.kohde}`,
      lahde: "auto",
      kohde: s.kohde,
      kategoria: s.kategoria,
      vuosi: toimenpide,
      vuosiaJaljella,
      tila: ylitetty > 0 ? "kiireellinen" : laskeTila(vuosiaJaljella),
      huoltovali: s.huoltovali,
      ylitettyVuosia: ylitetty || undefined,
      lykatty: lykatty || undefined,
      lykkaysPeruste: lykatty ? lyk?.peruste ?? null : undefined,
      alkuperainenVuosi: lykatty ? alkuperainen : undefined,
    });
  }
  return rivit;
}

export function getHuoltovali(kohde: string): number {
  const s = PTS_SAANNOT.find((x) => x.kohde.toLowerCase() === kohde.toLowerCase());
  return s?.huoltovali ?? 0;
}

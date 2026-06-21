// Yksi totuus PTS-kohteille. Käytetään sekä autorivien generointiin että
// huoltomerkintöjen yhdistämiseen oikeaan PTS-riviin.

export type PtsKohde = {
  avain: string;
  nimi: string;
  kategoria: "Lämmitys" | "Talotekniikka" | "Rakenne" | "Sisätilat" | "Piha";
  kayttoika: number;
  huoltovali: number;
  lahdeVuosi: (talo: any) => number | null;
  koskee?: (talo: any) => boolean;
  kuvaus?: string;
};

const i = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1800 && n < 2200 ? n : null;
};
const onLamm = (t: any, ...nimet: string[]) => {
  const m = String(t?.lammitysmuoto ?? "").toLowerCase();
  return nimet.some((n) => m.includes(n.toLowerCase()));
};
const onMat = (val: any, ...nimet: string[]) => {
  const m = String(val ?? "").toLowerCase();
  return nimet.some((n) => m.includes(n.toLowerCase()));
};
const rakV = (t: any) => i(t?.rakennusvuosi);
const lammV = (t: any) => i(t?.lammitys_asennettu_vuosi);
const lisa = (t: any) => (t?.lammitys_lisatieto && typeof t.lammitys_lisatieto === "object") ? t.lammitys_lisatieto : {};
const kattilaV = (t: any) => i(lisa(t).kattila_asennettu_vuosi) ?? lammV(t);
const putkiV = (t: any) => i(lisa(t).putki_asennettu_vuosi) ?? rakV(t);
const onKattila = (t: any, tyyppi: string) => String(lisa(t).kattila_tyyppi ?? "").toLowerCase() === tyyppi;
const onPutkiMat = (t: any, ...nimet: string[]) => {
  const m = String(lisa(t).putki_materiaali ?? "").toLowerCase();
  return nimet.some((n) => m.includes(n.toLowerCase()));
};
const onLammonjako = (t: any, ...nimet: string[]) => {
  const m = String(lisa(t).lammonjako ?? "").toLowerCase();
  return nimet.some((n) => m.includes(n.toLowerCase()));
};
const onVesikiertoinen = (t: any) =>
  onLamm(t, "keskuslämmitys", "keskuslammitys", "kauko", "maalämpö", "maalampo", "ilma-vesi", "ilmavesi");

export const PTS_KOHTEET: PtsKohde[] = [
  // Lämmitys – legacy (vanha lammitysmuoto-arvo)
  { avain: "lammitys_oljy", nimi: "Öljykattila", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 1,
    lahdeVuosi: lammV, koskee: (t) => onLamm(t, "öljy", "oljy") && !onLamm(t, "keskus") },
  { avain: "lammitys_maalampo", nimi: "Maalämpöpumppu", kategoria: "Lämmitys", kayttoika: 22, huoltovali: 3,
    lahdeVuosi: lammV, koskee: (t) => onLamm(t, "maalämpö", "maalampo") },
  { avain: "lammitys_ilmavesi", nimi: "Ilma-vesilämpöpumppu", kategoria: "Lämmitys", kayttoika: 18, huoltovali: 1,
    lahdeVuosi: lammV, koskee: (t) => onLamm(t, "ilma-vesi", "ilmavesi") },
  { avain: "lammitys_kauko", nimi: "Kaukolämpövaihdin", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 7,
    lahdeVuosi: lammV, koskee: (t) => onLamm(t, "kauko") },
  { avain: "lammitys_pilp", nimi: "Poistoilmalämpöpumppu", kategoria: "Lämmitys", kayttoika: 20, huoltovali: 2,
    lahdeVuosi: lammV, koskee: (t) => onLamm(t, "poistoilma", "pilp") },
  { avain: "lammitys_sahkokattila", nimi: "Sähkökattila", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 5,
    lahdeVuosi: lammV, koskee: (t) => onLamm(t, "sähkökattila", "sahkokattila") },
  { avain: "lammitys_sahkopatterit", nimi: "Sähköpatterit (suora sähkölämmitys)", kategoria: "Lämmitys", kayttoika: 30, huoltovali: 5,
    lahdeVuosi: (t) => i(lisa(t).sahkopatteri_asennettu_vuosi) ?? lammV(t),
    koskee: (t) => onLamm(t, "sähköpatter", "sahkopatter", "suora sähkö", "suora sahko", "sahkolammitys", "sähkölämmitys") },
  { avain: "lvv_suora", nimi: "Lämminvesivaraaja", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 5,
    lahdeVuosi: (t) => i(lisa(t).lvv_asennettu_vuosi),
    koskee: (t) => onLamm(t, "sahkolammitys", "sähkölämmitys", "suora sähkö") && i(lisa(t).lvv_asennettu_vuosi) != null },
  // Keskuslämmitys – kattilatyypit
  { avain: "keskus_kattila_puu", nimi: "Keskuslämmityskattila (puu)", kategoria: "Lämmitys", kayttoika: 30, huoltovali: 1,
    lahdeVuosi: kattilaV, koskee: (t) => onLamm(t, "keskus") && onKattila(t, "puu") },
  { avain: "keskus_kattila_oljy", nimi: "Keskuslämmityskattila (öljy)", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 1,
    lahdeVuosi: kattilaV, koskee: (t) => onLamm(t, "keskus") && onKattila(t, "oljy") },
  { avain: "keskus_kattila_pelletti", nimi: "Keskuslämmityskattila (pelletti)", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 1,
    lahdeVuosi: kattilaV, koskee: (t) => onLamm(t, "keskus") && onKattila(t, "pelletti") },
  { avain: "keskus_kattila_sahko", nimi: "Keskuslämmityskattila (sähkö)", kategoria: "Lämmitys", kayttoika: 25, huoltovali: 5,
    lahdeVuosi: kattilaV, koskee: (t) => onLamm(t, "keskus") && onKattila(t, "sahko") },
  // Lämmitysputkisto (vesikiertoinen) – materiaalikohtainen
  { avain: "lammitysputki_rauta", nimi: "Lämmitysputkisto (teräs/rauta)", kategoria: "Lämmitys", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: putkiV, koskee: (t) => onVesikiertoinen(t) && onPutkiMat(t, "rauta", "teräs", "teras") },
  { avain: "lammitysputki_kupari", nimi: "Lämmitysputkisto (kupari)", kategoria: "Lämmitys", kayttoika: 50, huoltovali: 10,
    lahdeVuosi: putkiV, koskee: (t) => onVesikiertoinen(t) && onPutkiMat(t, "kupari") },
  { avain: "lammitysputki_muovi", nimi: "Lämmitysputkisto (muovi)", kategoria: "Lämmitys", kayttoika: 50, huoltovali: 10,
    lahdeVuosi: putkiV, koskee: (t) => onVesikiertoinen(t) && onPutkiMat(t, "muovi") },
  { avain: "lammitysputki_komposiitti", nimi: "Lämmitysputkisto (komposiitti)", kategoria: "Lämmitys", kayttoika: 50, huoltovali: 10,
    lahdeVuosi: putkiV, koskee: (t) => onVesikiertoinen(t) && onPutkiMat(t, "komposiitti") },
  // Vesikiertoinen lattialämmitys
  { avain: "lattialammitys", nimi: "Vesikiertoinen lattialämmitys", kategoria: "Lämmitys", kayttoika: 50, huoltovali: 10,
    lahdeVuosi: putkiV, koskee: (t) => onVesikiertoinen(t) && onLammonjako(t, "lattia") },
  { avain: "ilp", nimi: "Ilmalämpöpumppu", kategoria: "Lämmitys", kayttoika: 15, huoltovali: 1,
    lahdeVuosi: (t) => i(t?.ilp_asennettu_vuosi), koskee: (t) => i(t?.ilp_asennettu_vuosi) != null,
    kuvaus: "Vuosittain: puhdista sisäyksikön suodattimet ja imuroi ulkoyksikön lamellit. Laitteen sisälle, kennoille, puhallinrullaan ja kondenssialtaaseen kertyy ajan mittaan likaa, pölyä ja mikrobeja, joita pelkkä imurointi ei tavoita – tämä näkyy heikentyneenä viilennystehona, korkeampana sähkölaskuna ja huonompana sisäilmana. Tilaa ammattilaisen pesu noin 3–5 vuoden välein. Laitteen suositeltu uusimisikä on n. 15 vuotta." },
  // Talotekniikka
  { avain: "iv_kone", nimi: "Ilmanvaihtokone", kategoria: "Talotekniikka", kayttoika: 20, huoltovali: 5,
    lahdeVuosi: (t) => i(t?.ilmanvaihto_vuosi),
    koskee: (t) => !String(t?.ilmanvaihto ?? "").toLowerCase().includes("painovoima") && i(t?.ilmanvaihto_vuosi) != null },
  { avain: "kayttovesi_putket", nimi: "Käyttövesiputkisto", kategoria: "Talotekniikka", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.putket_uusittu_vuosi) ?? rakV(t) },
  { avain: "viemari", nimi: "Viemäröinti", kategoria: "Talotekniikka", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.viemari_asennettu_vuosi) ?? rakV(t) },
  { avain: "sahko", nimi: "Sähköjärjestelmä", kategoria: "Talotekniikka", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.sahkot_asennettu_vuosi) ?? rakV(t) },
  // Rakenne – katto
  { avain: "katto_pelti", nimi: "Peltikatto", kategoria: "Rakenne", kayttoika: 40, huoltovali: 5,
    lahdeVuosi: (t) => i(t?.katto_uusittu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.kattomateriaali, "pelti") },
  { avain: "katto_tiili", nimi: "Tiilikatto", kategoria: "Rakenne", kayttoika: 50, huoltovali: 5,
    lahdeVuosi: (t) => i(t?.katto_uusittu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.kattomateriaali, "tiili") },
  { avain: "katto_huopa", nimi: "Bitumihuopakatto", kategoria: "Rakenne", kayttoika: 20, huoltovali: 3,
    lahdeVuosi: (t) => i(t?.katto_uusittu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.kattomateriaali, "huopa", "bitumi") },
  // Rakenne – julkisivu
  { avain: "julkisivu_puu_maalaus", nimi: "Puujulkisivun maalaus", kategoria: "Rakenne", kayttoika: 10, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.julkisivu_maalattu_vuosi) ?? i(t?.julkisivu_asennettu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.julkisivumateriaali, "puu", "hirsi") },
  { avain: "julkisivu_puu", nimi: "Puujulkisivun uusiminen", kategoria: "Rakenne", kayttoika: 50, huoltovali: 0,
    lahdeVuosi: (t) => i(t?.julkisivu_asennettu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.julkisivumateriaali, "puu") },
  { avain: "julkisivu_hirsi", nimi: "Hirsijulkisivun peruskorjaus", kategoria: "Rakenne", kayttoika: 80, huoltovali: 15,
    lahdeVuosi: (t) => i(t?.julkisivu_asennettu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.julkisivumateriaali, "hirsi") },
  { avain: "julkisivu_tiili", nimi: "Tiilijulkisivun saumaus", kategoria: "Rakenne", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.julkisivu_asennettu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.julkisivumateriaali, "tiili") },
  { avain: "julkisivu_rappaus", nimi: "Rapatun julkisivun huolto", kategoria: "Rakenne", kayttoika: 30, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.julkisivu_asennettu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.julkisivumateriaali, "rappau") },
  { avain: "julkisivu_levy", nimi: "Levyverhouksen uusiminen", kategoria: "Rakenne", kayttoika: 40, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.julkisivu_asennettu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.julkisivumateriaali, "levy", "kuitusement") },
  { avain: "julkisivu_pelti", nimi: "Peltijulkisivun maalaus", kategoria: "Rakenne", kayttoika: 20, huoltovali: 5,
    lahdeVuosi: (t) => i(t?.julkisivu_maalattu_vuosi) ?? i(t?.julkisivu_asennettu_vuosi) ?? rakV(t),
    koskee: (t) => onMat(t?.julkisivumateriaali, "pelti") },
  // Rakenne – muut
  { avain: "salaojat", nimi: "Salaojat", kategoria: "Rakenne", kayttoika: 40, huoltovali: 5,
    lahdeVuosi: (t) => rakV(t), koskee: (t) => t?.salaojat === true || rakV(t) != null },
  { avain: "ikkuna", nimi: "Ikkunat", kategoria: "Rakenne", kayttoika: 30, huoltovali: 10,
    lahdeVuosi: (t) => i(t?.ikkunat_uusittu_vuosi) ?? rakV(t) },
  // Sisä
  { avain: "kylpyhuone", nimi: "Kylpyhuone / märkätila", kategoria: "Sisätilat", kayttoika: 25, huoltovali: 5,
    lahdeVuosi: (t) => rakV(t) },
  // Piha
  { avain: "terassi_puu", nimi: "Terassi (puu)", kategoria: "Piha", kayttoika: 20, huoltovali: 3,
    lahdeVuosi: (t) => i(t?.terassi_rakennettu_vuosi),
    koskee: (t) => onMat(t?.terassi_materiaali, "puu") || i(t?.terassi_rakennettu_vuosi) != null },
  { avain: "terassi_lasitus", nimi: "Terassin lasitus", kategoria: "Piha", kayttoika: 30, huoltovali: 2,
    lahdeVuosi: (t) => i(t?.terassi_lasitus_vuosi) ?? i(t?.terassi_rakennettu_vuosi),
    koskee: (t) => t?.terassi_lasitettu === true },
];

// Hae kohde avaimella
export function ptsKohdeAvaimella(avain: string): PtsKohde | undefined {
  return PTS_KOHTEET.find((k) => k.avain === avain);
}

// Päättele kohde_avain UI:n kohdenimestä (HUOLTO_KOHDE_RYHMAT) + talon_tiedot.
// Käytetään kun käyttäjä kirjaa huollon ja PTS-rivi pitää tunnistaa.
export function paatteleKohdeAvain(kohdeNimi: string | null | undefined, talo: any): string | null {
  if (!kohdeNimi) return null;
  const k = kohdeNimi.trim().toLowerCase();

  // Suorat osumat PTS_KOHTEET-nimiin
  const suoraOsuma = PTS_KOHTEET.find((p) => p.nimi.toLowerCase() === k);
  if (suoraOsuma) return suoraOsuma.avain;

  // Useat huolto-kohteet mappautuvat materiaalin perusteella
  switch (k) {
    case "katto":
    case "katto, räystäät & kourut":
      if (onMat(talo?.kattomateriaali, "pelti")) return "katto_pelti";
      if (onMat(talo?.kattomateriaali, "tiili")) return "katto_tiili";
      if (onMat(talo?.kattomateriaali, "huopa", "bitumi")) return "katto_huopa";
      return "katto_pelti";
    case "julkisivu":
      if (onMat(talo?.julkisivumateriaali, "hirsi")) return "julkisivu_hirsi";
      if (onMat(talo?.julkisivumateriaali, "tiili")) return "julkisivu_tiili";
      if (onMat(talo?.julkisivumateriaali, "rappau")) return "julkisivu_rappaus";
      if (onMat(talo?.julkisivumateriaali, "levy", "kuitusement")) return "julkisivu_levy";
      if (onMat(talo?.julkisivumateriaali, "pelti")) return "julkisivu_pelti";
      if (onMat(talo?.julkisivumateriaali, "puu")) return "julkisivu_puu";
      return null;
    case "räystäät & kourut": return null;
    case "öljykattila": return "lammitys_oljy";
    case "maalämpöpumppu": return "lammitys_maalampo";
    case "ilma-vesilämpöpumppu": return "lammitys_ilmavesi";
    case "kaukolämpövaihdin": return "lammitys_kauko";
    case "poistoilmalämpöpumppu": return "lammitys_pilp";
    case "sähkökattila": return "lammitys_sahkokattila";
    case "sähköpatterit": return "lammitys_sahkopatterit";
    case "ilmalämpöpumppu": return "ilp";
    case "ilmanvaihtokone": return "iv_kone";
    case "käyttövesiputkisto": return "kayttovesi_putket";
    case "viemäröinti": return "viemari";
    case "sähköjärjestelmä": return "sahko";
    case "ikkunat": return "ikkuna";
    case "salaojat": return "salaojat";
    case "kylpyhuone / märkätila":
    case "kylpyhuone":
    case "märkätila": return "kylpyhuone";
    case "terassi": return "terassi_puu";
    default: return null;
  }
}

export function laskeKiireellisyys(vuosiaJaljella: number): "kiireellinen" | "lahivuosina" | "seurannassa" {
  if (vuosiaJaljella <= 0) return "kiireellinen";
  if (vuosiaJaljella <= 5) return "lahivuosina";
  return "seurannassa";
}

// Yksinkertainen luettelo UI-valikoita varten: kaikki PTS-kohteen nimet
// kategorian mukaan ryhmiteltynä
export function ptsKohteetRyhmittain() {
  const r: Record<string, PtsKohde[]> = {};
  for (const k of PTS_KOHTEET) {
    (r[k.kategoria] ||= []).push(k);
  }
  return r;
}

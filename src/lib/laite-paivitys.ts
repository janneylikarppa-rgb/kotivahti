// Mappays huoltokirjauksen "kohde" → talon_tiedot-päivitys, kun käyttäjä
// merkitsee asentaneensa uuden laitteen / tehneensä uusimisen.

export type LaitePaivitys = {
  merkki?: string | null;
  malli?: string | null;
  asennusvuosi?: number | null;
  materiaali?: string | null;
};

// Kohteet jotka koskevat päälämmitysjärjestelmää (lammitys_* + lisätieto)
const LAMMITYS_KOHTEET = new Set([
  "Öljykattila",
  "Maalämpöpumppu",
  "Ilma-vesilämpöpumppu",
  "Kaukolämpövaihdin",
  "Poistoilmalämpöpumppu",
  "Sähkökattila",
  "Pellettikattila",
  "Puukattila",
  "Lämminvesivaraaja",
]);

// Materiaali- / tyyppivaihtoehdot kohteen mukaan
// (sama lista kuin Talon tiedot -lomakkeella jotta valinnat täsmäävät)
export const MATERIAALI_OPTIOT: Record<string, string[]> = {
  Katto: [
    "Konesaumattu peltikatto",
    "Profiilipeltikatto",
    "Tiilikatto (savitiili)",
    "Betonitiili",
    "Huopakatto",
    "Kumibitumikermi",
    "Pärekatto",
  ],
  Julkisivu: [
    "Puu (lautaverhous)",
    "Tiili",
    "Rappaus",
    "Levyverhous",
    "Hirsi",
    "Pelti",
    "Kuitusementtilevy",
    "Kivi",
  ],
  Käyttövesiputkisto: [
    "Kupariputket",
    "Komposiittiputket (PEX-Al-PEX)",
    "Muoviputket (PEX)",
    "Galvanoitu teräs",
    "Valurauta",
    "Muu",
  ],
  Viemäröinti: [
    "Muovi (PVC/PP)",
    "Valurauta",
    "Betoni",
    "Keraaminen",
    "Lasikuitu",
    "Muu",
  ],
  Ikkunat: ["2-lasiset", "3-lasiset", "4-lasiset", "Sekoitus", "En tiedä"],
  Terassi: [
    "Painekyllästetty puu",
    "Lämpökäsitelty puu",
    "Komposiitti",
    "Kestopuu",
    "Tiili/laatta",
    "Muu",
  ],
};

export function materiaalivaihtoehdot(kohde?: string | null): string[] {
  if (!kohde) return [];
  return MATERIAALI_OPTIOT[kohde] ?? [];
}

// Kohteet joille tuetaan päivitys (UI näyttää lomakkeen vain näille)
export function tukeeLaitePaivitysta(kohde?: string | null): boolean {
  if (!kohde) return false;
  if (LAMMITYS_KOHTEET.has(kohde)) return true;
  return [
    "Ilmalämpöpumppu",
    "Ilmanvaihtokone",
    "Käyttövesiputkisto",
    "Viemäröinti",
    "Sähköjärjestelmä",
    "Katto",
    "Ikkunat",
    "Julkisivu",
    "Terassi",
  ].includes(kohde);
}

// Onko kohteella merkki/malli -kentät mielekkäitä (laitemainen kohde)
export function tukeeMerkkiMalli(kohde?: string | null): boolean {
  if (!kohde) return false;
  if (LAMMITYS_KOHTEET.has(kohde)) return true;
  return ["Ilmalämpöpumppu", "Ilmanvaihtokone"].includes(kohde);
}

// Palauttaa partial talon_tiedot patchin annetun kohteen ja laitteen pohjalta.
// Tarvitsee nykyisen `lammitys_lisatieto`-arvon jsonb-mergeä varten.
export function rakennaTaloPatch(
  kohde: string,
  lp: LaitePaivitys,
  nykyinenLammitysLisatieto: Record<string, any> = {},
): Record<string, any> {
  const patch: Record<string, any> = {};
  const v = lp.asennusvuosi ?? null;
  const merkki = lp.merkki?.trim() || null;
  const malli = lp.malli?.trim() || null;
  const mat = lp.materiaali?.trim() || null;

  if (LAMMITYS_KOHTEET.has(kohde)) {
    if (v != null) patch.lammitys_asennettu_vuosi = v;
    if (merkki || malli) {
      patch.lammitys_lisatieto = {
        ...(nykyinenLammitysLisatieto ?? {}),
        ...(merkki ? { merkki } : {}),
        ...(malli ? { malli } : {}),
      };
    }
    return patch;
  }

  switch (kohde) {
    case "Ilmalämpöpumppu":
      if (merkki) patch.ilp_merkki = merkki;
      if (malli) patch.ilp_malli = malli;
      if (v != null) patch.ilp_asennettu_vuosi = v;
      break;
    case "Ilmanvaihtokone":
      if (v != null) patch.ilmanvaihto_vuosi = v;
      break;
    case "Käyttövesiputkisto":
      if (v != null) patch.putket_uusittu_vuosi = v;
      if (mat) patch.putkimateriaali = mat;
      break;
    case "Viemäröinti":
      if (v != null) patch.viemari_asennettu_vuosi = v;
      if (mat) patch.viemarimateriaali = mat;
      break;
    case "Sähköjärjestelmä":
      if (v != null) patch.sahkot_asennettu_vuosi = v;
      break;
    case "Katto":
      if (v != null) patch.katto_uusittu_vuosi = v;
      if (mat) patch.kattomateriaali = mat;
      break;
    case "Ikkunat":
      if (v != null) patch.ikkunat_uusittu_vuosi = v;
      if (mat) patch.ikkunat_tyyppi = mat;
      break;
    case "Julkisivu":
      if (v != null) patch.julkisivu_maalattu_vuosi = v;
      if (mat) patch.julkisivumateriaali = mat;
      break;
    case "Terassi":
      if (v != null) patch.terassi_kunnostettu_vuosi = v;
      if (mat) patch.terassi_materiaali = mat;
      break;
  }
  return patch;
}

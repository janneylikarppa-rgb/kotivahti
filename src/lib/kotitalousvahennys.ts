// Kotitalousvähennyksen vahvistetut verotusluvut (vero.fi 2025–2026)

export const VAHENNYS_YRITYS = 0.35;
export const VAHENNYS_PALKKA = 0.13;
export const OMAVASTUU = 150; // € / henkilö / vuosi
export const ENIMMAISMAARA = 1600; // € / henkilö / vuosi
export const LAHDE = "vero.fi 2025–2026";

export type KtvTyyppi = "yritys" | "palkka";

export type KtvKirjaus = {
  id?: string;
  pvm: string;
  kuvaus?: string | null;
  tyyppi?: string | null;
  kohde?: string | null;
  tekija?: string | null;
  tekija_nimi?: string | null;
  tyon_osuus?: number | string | null;
  kotitalousvahennys_tyyppi?: KtvTyyppi | string | null;
};

export type KtvTulos = {
  yritysTyot: number;
  palkkaTyot: number;
  omavastuu: number;
  vahennysEnnenKattoa: number;
  vahennys: number;
  katto: number;
  tayttoaste: number; // 0..1
  kirjauksia: number;
};

function num(v: unknown): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Laskee arvioidun kotitalousvähennyksen.
 * - Yritykseltä ostettu työ: max(0, työn osuus − omavastuu) × 35 %
 * - Palkattu työntekijä (palkka + työnantajan sivukulut): × 13 %
 * - Katto: 1 600 € / henkilö
 */
export function laskeVahennys(kirjaukset: KtvKirjaus[], henkiloita = 1): KtvTulos {
  const hlo = henkiloita >= 2 ? 2 : 1;
  const rivit = (kirjaukset ?? []).filter(
    (k) => k.kotitalousvahennys_tyyppi === "yritys" || k.kotitalousvahennys_tyyppi === "palkka",
  );

  const yritysTyot = rivit
    .filter((k) => k.kotitalousvahennys_tyyppi === "yritys")
    .reduce((s, k) => s + num(k.tyon_osuus), 0);
  const palkkaTyot = rivit
    .filter((k) => k.kotitalousvahennys_tyyppi === "palkka")
    .reduce((s, k) => s + num(k.tyon_osuus), 0);

  const omavastuu = yritysTyot > 0 ? OMAVASTUU * hlo : 0;
  const yritysVahennys = Math.max(0, yritysTyot - omavastuu) * VAHENNYS_YRITYS;
  const palkkaVahennys = palkkaTyot * VAHENNYS_PALKKA;

  const vahennysEnnenKattoa = yritysVahennys + palkkaVahennys;
  const katto = ENIMMAISMAARA * hlo;
  const vahennys = Math.min(vahennysEnnenKattoa, katto);

  return {
    yritysTyot,
    palkkaTyot,
    omavastuu,
    vahennysEnnenKattoa,
    vahennys,
    katto,
    tayttoaste: katto > 0 ? Math.min(1, vahennys / katto) : 0,
    kirjauksia: rivit.length,
  };
}

export function vahennysVari(tayttoaste: number): "teal" | "oranssi" | "harmaa" {
  if (tayttoaste >= 1) return "harmaa";
  if (tayttoaste >= 0.8) return "oranssi";
  return "teal";
}

export function euro(n: number): string {
  return `${Math.round(n).toLocaleString("fi-FI")} €`;
}

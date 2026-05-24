// Säilytetty yhteensopivuuden vuoksi. Uusi PTS-malli on src/lib/pts-kohteet.ts
// ja src/lib/kotivahti.functions.ts (pts_suunnitelma-taulu).
// Tämä tiedosto tarjoaa vain tyypit ja apurit joita pts-sisaltotekstit.ts käyttää.

export type PtsTila = "kiireellinen" | "lahivuosina" | "seurannassa";

export type PtsRivi = {
  id: string;
  lahde: "auto" | "oma";
  kohde: string;
  kategoria: string;
  vuosi: number;
  vuosiaJaljella: number;
  tila: PtsTila;
  kuvaus?: string | null;
  huoltovali: number;
  ylitettyVuosia?: number;
  lykatty?: boolean;
  lykkaysPeruste?: string | null;
  alkuperainenVuosi?: number;
  huoltoErapaiva?: boolean;
  viimeisinHuoltoVuosi?: number | null;
  kohdeAvain?: string | null;
  paivitetty?: boolean;
};

export function laskeTila(vuosiaJaljella: number): PtsTila {
  if (vuosiaJaljella < 0) return "kiireellinen";
  if (vuosiaJaljella <= 5) return "lahivuosina";
  return "seurannassa";
}

/**
 * Aurinkosähkösuosituksen laskentalogiikka.
 *
 * Puhdas funktio ilman DB-riippuvuuksia jotta se on yksikkötestattavissa.
 */

export type KuluRivi = { pvm: string; kwh?: number | null };

export type AurinkoTulos = {
  suositus: boolean;
  aurinkokuukaudet_kk: number;
  aurinkokuukaudet_kwh: number;
  data_kuukausia: number;
  aurinkopaneelit: boolean;
};

/**
 * Laske aurinkosähkön kannattavuussuositus.
 *
 * @param sahkoRivit  Kaikki sähkökategorian kulukirjaukset (pvm + kwh)
 * @param kaikkiKuluRivit  Kaikki kulukirjaukset (pvm) — käytetään
 *                         data_kuukausia-laskuriin
 * @param aurinkopaneelit  Onko talossa jo aurinkopaneelit
 *
 * Suositus = true jos:
 *   - data_kuukausia >= 6 (kirjauksia vähintään kuudelta eri kuukaudelta)
 *   - aurinkokuukaudet_kwh >= 1500 (huhti-syyskuun sähkö yht. >= 1500 kWh)
 *   - aurinkopaneelit === false
 */
export function laskeAurinkoSuositus(
  sahkoRivit: ReadonlyArray<KuluRivi>,
  kaikkiKuluRivit: ReadonlyArray<Pick<KuluRivi, "pvm">>,
  aurinkopaneelit: boolean,
): AurinkoTulos {
  // Huhti–syyskuu (kk 4..9)
  const kesaKuukaudet = new Set<string>();
  let aurinkokuukaudet_kwh = 0;
  for (const r of sahkoRivit) {
    if (!r.pvm) continue;
    const d = new Date(r.pvm);
    if (isNaN(d.getTime())) continue;
    const kk = d.getMonth() + 1;
    if (kk >= 4 && kk <= 9) {
      kesaKuukaudet.add(`${d.getFullYear()}-${kk}`);
      aurinkokuukaudet_kwh += Number(r.kwh ?? 0);
    }
  }

  const kaikkiKuukaudet = new Set<string>();
  for (const r of kaikkiKuluRivit) {
    if (!r.pvm) continue;
    const d = new Date(r.pvm);
    if (isNaN(d.getTime())) continue;
    kaikkiKuukaudet.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
  }

  const data_kuukausia = kaikkiKuukaudet.size;
  const kwhPyoristetty = Math.round(aurinkokuukaudet_kwh);

  const suositus =
    data_kuukausia >= 6 &&
    aurinkokuukaudet_kwh >= 1500 &&
    !aurinkopaneelit;

  return {
    suositus,
    aurinkokuukaudet_kk: kesaKuukaudet.size,
    aurinkokuukaudet_kwh: kwhPyoristetty,
    data_kuukausia,
    aurinkopaneelit,
  };
}

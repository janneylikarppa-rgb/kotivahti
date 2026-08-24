# Oppaat-osion piilotus

Piilotetaan opassivut näkyvistä ilman että sisältöä poistetaan — sivut jäävät koodiin, mutta niihin ei enää ohjata kävijöitä eikä hakukoneita.

## Muutokset

1. **Etusivun alatunniste** — poistetaan "Oppaat"-linkki.
2. **UKK-sivu** — poistetaan viittaus Oppaat-osioon (jätetään lause ilman linkkiä).
3. **Sivukartta (sitemap.xml)** — poistetaan `/opas` ja kaikki kolme opassivua, jotta Google ei enää indeksoi niitä.
4. **Opassivut itse** — lisätään `noindex, nofollow` -metatieto, jotta jo indeksoidut sivut poistuvat hakutuloksista. Sivut säilyvät toimivina suoralla osoitteella, joten sisältö on helppo palauttaa myöhemmin.

## Tekniset yksityiskohdat

- `src/routes/index.tsx` (footer-linkki), `src/routes/ukk.tsx`, `src/routes/sitemap[.]xml.ts`
- `src/components/opas-layout.tsx`: `opasHead`-funktioon `{ name: "robots", content: "noindex, nofollow" }`; sisäiset "Oppaat"-murupolkulinkit voidaan jättää, koska ne näkyvät vain opassivuilla.
- Reittitiedostoja ei poisteta, joten `routeTree.gen.ts` pysyy ennallaan.

## Vaihtoehto

Jos haluat oppaat kokonaan pois (404), poistetaan `src/routes/opas/`-kansio ja `opas-layout.tsx`. Kerro, jos tämä on toivottu lopputulos.

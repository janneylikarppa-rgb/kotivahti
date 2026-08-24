# Oppaat-osion poisto

Poistetaan opassivut kokonaan sovelluksesta. Osio rakennetaan myöhemmin uudelleen tyhjältä pöydältä.

## Muutokset

1. **Opassivut poistetaan** — kaikki neljä sivua (oppaiden etusivu, nuohouksen hinta, IV-puhdistus, katon tarkastus) sekä niiden yhteinen layout-komponentti.
2. **Etusivun alatunniste** — "Oppaat"-linkki poistetaan.
3. **UKK-sivu** — poistetaan viittaus Oppaat-osioon; lause muotoillaan niin, ettei siinä ole rikkinäistä linkkiä.
4. **Sivukartta (sitemap.xml)** — poistetaan `/opas` ja kaikki opassivut, jotta hakukoneet lopettavat niiden indeksoinnin.

Poiston jälkeen osoitteet `/opas/...` palauttavat normaalin "sivua ei löydy" -näkymän.

## Tekniset yksityiskohdat

- Poistetaan `src/routes/opas/` (index, iv-puhdistus, katon-tarkastus, nuohous-hinta) ja `src/components/opas-layout.tsx`.
- Muokataan `src/routes/index.tsx` (footer-linkki), `src/routes/ukk.tsx` ja `src/routes/sitemap[.]xml.ts`.
- `src/routeTree.gen.ts` regeneroituu automaattisesti.
- Lopuksi varmistetaan onnistunut build, ei TypeScript-virheitä eikä konsolivirheitä.

# Etusivun Kuopio-viittausten päivitys

## Tavoite
Poista etusivulta (/) ylimääräiset paikkakuntaviittaukset esimerkeistä ja yksinkertaista alatunnisteen paikkatieto.

## Muutokset
Tiedosto: `src/routes/index.tsx`

1. **Hero-mockin osoite**
   - Vanha: `Koivutie 12 · Kuopio`
   - Uusi: `Koivutie 12`

2. **Feature-showcase: Talon tiedot -mockin osoite**
   - Vanha: `Koivutie 12 · Kuopio`
   - Uusi: `Koivutie 12`

3. **Feature-showcase: Tilaa palvelu -mocki**
   - Poista rivi `["Alue", "Kuopio"]` tai korvaa geneerisellä tekstillä.

4. **Kilpailutus-osio**
   - Vanha: `Paikalliset tarjoukset – Kuopio`
   - Uusi: `Paikalliset tarjoukset` (tai `Paikalliset tarjoukset – oma alueesi`)

5. **Alatunniste (footer)**
   - Vanha: `Kuopio, Suomi`
   - Uusi: `Suomi`

## Tarkistus
- `bun run build` ja tyyppitarkistus onnistuvat.
- Etusivun esikatselussa ei näy enää Kuopio-viittauksia osoite-esimerkeissä.
- Alatunnisteessa näkyy pelkkä "Suomi".

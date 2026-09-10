# "Talosi ansaitsee enemmän kuin muistilista" -osion korvaaminen Ajankohtaista-osiolla

## Tavoite
Poistetaan etusivun turhaksi koettu väliotsikko-osio ("Talosi ansaitsee enemmän kuin muistilista.") ja siirretään sen paikalle olemassa oleva Ajankohtaista (blogi-esittely) -osio.

## Muutokset (vain `src/routes/index.tsx`)

1. **Poistetaan sc-final-osio** – `<section className="sc-final">` (otsikko "Talosi ansaitsee enemmän kuin muistilista", teksti, "Luo ilmainen tili" -painike ja alapuolinen huomioteksti).

2. **Siirretään Ajankohtaista-osio sen paikalle** ennen Palveluiden kilpailutus -osiota. Sivun järjestys muuttuu muotoon:
   ```text
   Hero → Ominaisuudet → Showcase → Ajankohtaista (blogi) → Kilpailutus
   → Miksi Kotiluotsi → CTA (Avaa talokirja) → Footer
   ```
   - Blogi-esittely poistuu sivun alareunasta (footerin edestä), joten se näkyy vain kerran.
   - Blogi-osion sisältö ja tyylit säilyvät ennallaan (BLOG_POSTS-taulukko, kortit, "Lue artikkeli →" -linkki).
   - CTA-osio jää sivun loppuun viimeiseksi toiminnaksi kutsuvaksi osioksi.

3. **Poistetaan käyttämättömät sc-final-tyylit** `STYLES`-merkkijonosta (`.sc-final`, `.sc-final-inner`, `.sc-final h2`, `.sc-final p`, `.sc-final .sc-btn`, `.sc-final-small` ja vastaava mobiilisääntö). Blogi-osion tyylit jäävät ennalleen.

## Ei muita muutoksia
- Muita etusivun osioita, navigaatiota tai toiminnallisuutta ei muuteta.
- Blogireitti `/blogi/sahkoinen-talokirja` säilyy ennallaan.
- Ei uusia riippuvuuksia.

## Tarkistukset
- `bun run build` onnistuu.
- `tsgo` ei paljasta TypeScript-virheitä.
- Esikatselussa: "Talosi ansaitsee..." -tekstiä ei enää ole, Ajankohtaista näkyy showcase-osion jälkeen ennen Kilpailutusta, blogi ei toistu alareunassa, CTA jää loppuun.
- Selaimen konsolissa ei virheitä.

# Mobiilinavigaatio etusivulle

Tällä hetkellä alle 600 px leveydellä kaikki navigaatiolinkit (Ominaisuudet, Kilpailutus, Blogi) piilotetaan ja näkyviin jää vain "Aloita ilmaiseksi" -painike. Mobiilikäyttäjä ei siis pääse blogiin etusivulta.

## Ratkaisu

Lisätään navigaatiopalkkiin hampurilaisvalikko, joka näkyy vain mobiilissa.

- Palkissa mobiilissa: logo vasemmalla, "Aloita ilmaiseksi" -painike ja hampurilaisikoni oikealla.
- Ikonia painamalla aukeaa palkin alta pudotusvalikko, jossa linkit:
  - Ominaisuudet (vieritys sivulla)
  - Kilpailutus (vieritys sivulla)
  - Blogi → /blogi/sahkoinen-talokirja
  - Kirjaudu / Aloita ilmaiseksi
- Valikko sulkeutuu linkkiä painettaessa ja taustaa napauttaessa.
- Työpöytänäkymä säilyy täysin ennallaan.

## Tekninen toteutus

- Muokataan vain `src/routes/index.tsx`.
- Lisätään `useState`-tila valikon auki/kiinni-tilalle ja `<button className="nav-toggle">` (lucide-reactin Menu/X-ikoni) navigaatioon.
- Lisätään `STYLES`-merkkijonoon säännöt: `.nav-toggle { display: none }` työpöydällä, `@media (max-width: 600px)` -lohkossa toggle näkyviin ja avattava `.nav-mobile`-paneeli (sama kerma/kulta-tyyli kuin palkissa, blur-tausta, pehmeä varjo).
- Nykyinen `.nav-links a:not(.nav-cta) { display: none }` -sääntö säilyy, jolloin rivi pysyy siistinä.
- Saavutettavuus: `aria-label`, `aria-expanded` ja Esc-näppäin sulkee valikon.

## Hyväksymiskriteerit

- Mobiilissa (<600 px) navigaatiosta pääsee blogiin ja muihin osioihin.
- Työpöytänäkymä ei muutu.
- Build ja typecheck menevät läpi, ei console-virheitä.

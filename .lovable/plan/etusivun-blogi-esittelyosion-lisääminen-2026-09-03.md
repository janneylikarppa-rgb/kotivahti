# Etusivun blogi-esittelyosion lisääminen

## Tavoite
Lisätään Kotiluotsin etusivulle (`src/routes/index.tsx`) uusi "Ajankohtaista"-osio, joka esittelee blogiartikkelin ennen footeria.

## Mitä rakennetaan
- Uusi `<section>` ennen `<footer className="kv-footer">`.
- Otsikko: "Ajankohtaista" (`font-family: 'Playfair Display', serif`).
- Yksi kortti, jossa:
  - yläteksti "Artikkeli"
  - otsikko "Sähköinen talokirja – mitä, milloin ja kuka?"
  - ingressi 2 lausetta talotietojen hajallaan olemisesta
  - kultainen linkki "Lue artikkeli →" → `/blogi/sahkoinen-talokirja`
- Kortti käyttää samaa vaaleaa taustaa, reunusta ja hover-nostoa kuin muut etusivun kortit.
- Toteutus skaalautuva: tällä hetkellä yksi leveä/keskitetty kortti, myöhemmin max 3 rinnakkain.

## Tekninen toteutus
1. Lisätään CSS-luokat `STYLES`-merkkijonoon:
   - `.blog-preview` – vaalea tausta, padding
   - `.blog-preview-inner` – max-width 1200px, keskitys
   - `.blog-preview-head` – otsikon tyyli
   - `.blog-grid` – 1–3 sarakkeen ruudukko
   - `.blog-card` – valkoinen tausta, reunus, hover-nosto
   - `.blog-card .blog-link` – kultainen teksti, nuoli
2. Lisätään komponenttiin uusi `BLOG_POSTS`-taulukko, jossa yksi artikkeli.
3. Renderöidään osio juuri ennen footeria.
4. Ei muutoksia muihin osioihin, ei uusia riippuvuuksia.

## Tarkistus
- `bun run build` onnistuu.
- `tsgo` ei paljasta TypeScript-virheitä.
- Esikatselussa osio näkyy oikeassa kohdassa, linkki toimii ja tyylit ovat yhtenäiset.

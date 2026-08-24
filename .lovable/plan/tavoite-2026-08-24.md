Lisää blogisivu artikkelille "Sähköinen talokirja"

## Tavoite

Luoda julkinen blogisivu osoitteeseen `/blogi/sahkoinen-talokirja`, joka esittelee artikkelin "Sähköinen talokirja – mitä, milloin ja kuka?". Sivu noudattaa Kotiluotsin etusivun visuaalista ilmettä ja sisältää saman headerin, footerin sekä SEO-metadatan kuin muut julkiset sivut.

## Tekninen toteutus

### Uusi reitti

- Luo tiedosto `src/routes/blogi/sahkoinen-talokirja.tsx`.
- URL: `/blogi/sahkoinen-talokirja`.
- Sivu on julkinen, ei vaadi kirjautumista.

### Layout ja rakenne

- Käytä samaa navigaatiota ja footeria kuin `src/routes/index.tsx` (kiinteä header, logo, navilinkit, CTA-painike, footer-linkit UKK/Oppaat/Käyttöehdot/Tietosuoja).
- Rakenne:
  - Breadcrumb: `Kotiluotsi → Blogi → Sähköinen talokirja`.
  - Meta: `Elokuu 2026` ja `Lukuaika: ~4 min`.
  - Artikkeli `<article>`-tagin sisällä.
  - CTA-laatikko lopussa: "Valmis aloittamaan?" + linkki `/rekisteroidy`.

### Artikkelin sisältö

- H1: `Sähköinen talokirja – mitä, milloin ja kuka?`
- H2-otsikot ja teksti kuten käyttäjän antamassa materiaalissa:
  - Tuttu tilanne omakotitalossa
  - Mitä sähköinen talokirja tarkoittaa käytännössä?
  - Ennakoiva huolto säästää rahaa
  - (jatka artikkelin antamaa tekstiä loppuun)
- Sisällyslistat ja korostukset tyylitelty yhtenäisesti sivun teeman mukaisesti.

### SEO ja metadata

- `head()` sisältää ainakin:
  - title: `Sähköinen talokirja – mitä, milloin ja kuka? — Kotiluotsi`
  - description: lyhyt tiivistelmä artikkelista
  - og:title, og:description, og:type: `article`, og:url: `https://kotiluotsi.fi/blogi/sahkoinen-talokirja`
  - canonical-linkki
- Lisää URL sitemap-tiedostoon `src/routes/sitemap[.]xml.ts`.

### Tyyli

- Käytä Tailwind-luokkia ja projektin CSS-muuttujia (`--kulta`, `--vihrea`, `--kerma`, jne.).
- Vältä kovakoodattuja väriarveja; käytä semanttisia token-luokkia kuten `text-cream`, `bg-[color:var(--kulta)]` ja `font-serif`.
- Varusta CTA-painike kultaisella taustalla ja tummalla tekstillä, kuten muissa sivuissa.

### Linkitys

- Lisää footeriin linkki `Blogi` tai lisää oppaat-sivulle maininta blogista — jos käyttäjä haluaa. Tässä toteutuksessa riittää, että sivu on saavutettavissa suoralla URL:lla ja sitemapissa.

## Hyväksymiskriteerit

- Sivu `/blogi/sahkoinen-talokirja` renderöityy onnistuneesti esikatselussa.
- Header ja footer vastaavat etusivun ulkoasua.
- Artikkelin sisältö on täydellinen ja luettava.
- SEO-metadatat ja sitemap on päivitetty.
- Build ja typecheck menevät läpi ilman virheitä.

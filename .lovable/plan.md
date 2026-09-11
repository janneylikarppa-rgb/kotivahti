# PTS-artikkelin lisääminen blogiin

## Tavoite
Lisätään Kotiluotsin blogiin uusi julkinen artikkeli "Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa" omalle reitilleen, päivitetään etusivun Ajankohtaista-osio ja sivukerta.

## Mitä rakennetaan

### 1. Uusi blogisivu
- Tiedosto: `src/routes/blogi/pts-suunnitelma.tsx`
- URL: `/blogi/pts-suunnitelma`
- Julkinen sivu, ei vaadi kirjautumista.
- Sama rakenne kuin `src/routes/blogi/sahkoinen-talokirja.tsx`:
  - Vaalea tausta, Playfair Display -otsikot, Outfit/DM Sans -leipäteksti.
  - Navigaatio, breadcrumb, artikkelisisältö, CTA, "Lue myös" -osio ja footer.
  - SEO-meta, canonical, JSON-LD (Article + BreadcrumbList).

### 2. Artikkelin sisältö
- Breadcrumb: Kotiluotsi → Blogi → PTS-suunnitelma
- Meta: "Artikkeli · Syyskuu 2026 · Lukuaika ~5 min"
- H1: "Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa"
- Johdanto ja H2-osiot käyttäjän antamalla tekstillä.
- CTA: "Katso, miltä oman talosi seuraavat vuodet näyttävät →" → `/rekisteroidy`
- "Lue myös:" -linkki sähköiseen talokirjaan (`/blogi/sahkoinen-talokirja`).

### 3. Etusivun blogi-osio
- Lisätään `BLOG_POSTS`-taulukkoon `src/routes/index.tsx` toinen artikkeli:
  - tag: "Artikkeli"
  - title: "Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa"
  - excerpt: "Omakotitalossa on yllättävän paljon asioita, jotka pitäisi muistaa. PTS-suunnitelma auttaa ennakoimaan tulevat huollot ajoissa."
  - href: `/blogi/pts-suunnitelma`
- Säilytetään olemassa oleva korttityyli ja hover-efekti.
- Tarvittaessa päivitetään `.blog-grid` tukemaan kahden kortin rinnakkaista asettelua desktopilla (esim. `repeat(auto-fit, minmax(320px, 1fr))`), jotta kaksi korttia ei pakota päällekkäisyyttä.

### 4. Sivukerta
- Lisätään `/blogi/pts-suunnitelma` `src/routes/sitemap[.]xml.ts` -tiedoston `POLUT`-listaan.

## Tekninen toteutus
1. Luodaan `src/routes/blogi/pts-suunnitelma.tsx` olemassa olevan blogisivun pohjalta.
2. Päivitetään `src/routes/index.tsx`:
   - Lisätään uusi artikkeli `BLOG_POSTS`-taulukkoon.
   - Säädetään `.blog-grid` responsiiviseksi kahdelle kortille.
3. Päivitetään `src/routes/sitemap[.]xml.ts` uudella polulla.
4. Ei muita muutoksia sovellukseen.

## Tarkistus
- `bun run build` onnistuu.
- `tsgo` ei paljasta TypeScript-virheitä.
- Uusi sivu avautuu osoitteessa `/blogi/pts-suunnitelma`.
- Etusivun Ajankohtaista-osiossa on kaksi korttia ja linkit toimivat.
- Sivukerta sisältää uuden polun.

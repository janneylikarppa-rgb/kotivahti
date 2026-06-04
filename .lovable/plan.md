# Etusivun uudistus

Korvataan `src/routes/index.tsx` kokonaan uudella suomenkielisellä landing-page-rakenteella annetun promptin mukaisesti. Säilytetään olemassa oleva `beforeLoad`-redirect kirjautuneille käyttäjille (`/dashboard`).

## Tyyli ja design

- Värit inline-tyyleinä (kuten nykyisessä tiedostossa): `#1e3a2f` (tummavihreä), `#152a22` (hero-tausta), `#c8973a` (kulta), `#e4b96a` (kulta-vaalea), `#f5f0e8` (kerma), `#ece5d6` (kerma-dark).
- Fontit: Playfair Display (otsikot, kursiivi-aksentti kullassa) ja DM Sans (leipäteksti). Lisätään Google Fonts -linkki `index.html`:n head-osaan tai `__root.tsx`:n `head()`-funktioon — käytännössä lisätään `<link>` `__root.tsx`:n head-arrayyn jotta SSR toimii. (Playfair on jo käytössä `styles.css`-fonttistackissa; lisätään DM Sans erikseen ja sovelletaan inline-tyylinä otsikoihin/leipätekstiin promptin mukaan.)
- Pyöristys 12–16px, pehmeät varjot (`shadow-lg/xl`), pieni hover-nosto napeille (`translateY(-1px)`).
- Tailwind-luokat layoutiin (grid, flex, spacing). Värit inline `style={{...}}`-attribuutteina koska ne ovat tämän sivun erikoispaletti, ei globaaleja tokeneita.

## Sivun osiot (järjestys)

1. **Sticky-navi**: logo "Koti"+"vahti", linkit (Ominaisuudet, Kilpailutus = hash-anchorit `#ominaisuudet`, `#kilpailutus`), CTA-nappi `/rekisteroidy`. Tausta kerma + blur, vahvistuu scrollatessa. Mobiilivalikko hampurilainen.
2. **Hero** (`#152a22`, min-h-screen, 2-sarakkeinen): vasemmalla badge "✦ UUTTA · ILMAINEN TALOKIRJA", H1 Playfair (kursiivi rivi kullassa: *"koko talon hallinta"*), alaotsikko, kulta-CTA "Avaa talokirja ilmaiseksi →" → `/rekisteroidy`, luottamusrivi (3 kohtaa). Oikealla glassmorphism-mock-dashboard (Kotivahti / Koivutie 12, Kuopio · kevään tehtävät 2 ✓ + 2 ○ · vuosikulut 2 480 / 380 / 4 200 · PTS-toimenpide IV-kone · "Tilaa kuntoarvio" -kultanappi). EI kuntopiste-badgea.
3. **Luottamuskaista** (`#ece5d6`): 4 ikoni+teksti-kohtaa rivissä.
4. **Ominaisuudet** (`#f5f0e8`, `id="ominaisuudet"`): eyebrow "OMINAISUUDET", H2 "Kaikki mitä talo tarvitsee – yhdessä.", alaotsikko, 7 korttia 3-saraketta:lle (kortti 3 "Palveluiden kilpailutus" korostettu tummavihreällä taustalla + kulta-badge "Suosittu"). Tekstit promptin mukaan. Kortti 7 menee yksin tai täyttää viimeisen rivin.
5. **Palveluiden kilpailutus** (`#1e3a2f`, `id="kilpailutus"`, 2-sarakkeinen): vasemmalla eyebrow + H2 "Ammattilainen paikalle – ilman puheluita." + 4 numeroitua askelta (ympyrässä kulta-numero). Oikealla glassmorphism-mock "Tilaa palvelu" -kortti: 6 kategoriapainikketta 2 sarakkeessa (ensimmäinen aktiivinen kulta-reunuksella), erotinviiva, tuloskortti "PAIKALLISET TARJOUKSET – KUOPIO" (Yritys 1/2/3, tähdet, hinnat 1 200€ / 1 450€ / 980€).
6. **Miksi Kotivahti** (`#ece5d6`): eyebrow + H2 + 4 tilastokorttia (7+, 0€, 14+, 1min) valkoisilla taustoilla, isot luvut Playfairilla.
7. **CTA-osio** (`#1e3a2f`, keskitetty): eyebrow "ALOITA TÄNÄÄN", H2 "Avaa talokirja. Ilmaiseksi.", kuvaus, 3 checkmark-riviä, kulta-CTA → `/rekisteroidy`.
8. **Footer** (tumma `#152a22`, minimalistinen): "© 2026 Kotivahti · Talosi oma avustaja · Kuopio, Suomi".

## Tekniset yksityiskohdat

- Säilytetään `Route` + `beforeLoad`-redirect ja olemassa olevat importit (`Link`, `Button`, `lucide-react`-ikonit). Lisätään tarvittavat ikonit: `Check`, `ArrowRight`, `Menu`, `X`, plus mahdollisesti `Shield`, `Bell`, `FileText`, `Sparkles` luottamuskaistaan (tai käytetään emoji-merkkejä kuten promptissa).
- Mobiili: gridit putoavat 1 sarakkeeseen alle `md` breakpointin.
- Scroll-animaatiot: käytetään olemassa olevaa `animate-fade-in`-utilityä osioiden otsikoille. (Ei lisätä IntersectionObserveria — kevyt CSS-ratkaisu riittää.)
- Hover-tila napeille: Tailwind `transition` + inline `onMouseEnter/Leave` tai utility-luokka. Yksinkertaisinta on tehdä pieni `<a>`/`<button>` -komponentti CTA:lle tämän tiedoston sisällä.
- Hash-linkit (`#ominaisuudet`, `#kilpailutus`) toimivat tavallisilla `<a href>`-tageilla, koska sivu on yksisivuinen landing.
- Pidetään tiedosto itsenäisenä — ei lohkota uusiin komponentteihin tässä vaiheessa.

## Muutettavat tiedostot

- `src/routes/index.tsx` — kirjoitetaan uusi sisältö (korvaa nykyiset ~583 riviä).
- `src/routes/__root.tsx` — lisätään `<link>` Google Fonts -DM Sans -fonttiin (Playfair on jo `styles.css`:ssä). Jos sopiva paikka löytyy `head()`-arrayssa, lisätään sinne; muuten ohitetaan ja luotetaan `styles.css`-fonttilataukseen (Playfair riittää otsikoihin; leipäteksti käyttää Outfit-fonttia, joka on visuaalisesti riittävän lähellä DM Sansia). Tarkistetaan toteutuksen aikana.

## Mitä EI muuteta

- Reititystä, autentikaatiota, dashboardia, kirjautumis-/rekisteröitymissivuja, sisäisiä reittejä tai dataa.
- `styles.css`:n teema-tokeneita.

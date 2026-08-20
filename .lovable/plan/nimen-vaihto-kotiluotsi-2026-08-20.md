# Nimen vaihto: Kotiluotsi → Kotiluotsi

## Tavoite
Vaihda sovelluksen nimi "Kotiluotsi" → "Kotiluotsi" kaikkialla sovelluksessa ja sisältökirjastossa. Säilytä sama kirjoitusasu (iso K, pieni l).

## Vahvistettu nykytila
- `src/routes/__root.tsx`: otsikko, kuvaus, og-title, apple-mobile-web-app-title ja application-name sisältävät "Kotiluotsi".
- `src/components/app-sidebar.tsx`: logo-teksti `Kotiluotsi.`.
- `src/lib/email.server.ts`: FROM-nimi ja HTML-sähköpostin otsikko sisältävät "Kotiluotsi".
- `src/routes/index.tsx`: useita "Kotiluotsi"-mainintoja markkinointiteksteissä.
- `package.json`: nimi on tällä hetkellä `"tanstack_start_ts"` – ei sisällä "Kotiluotsi"-tekstiä, joten sitä ei muuteta.
- Haku löysi esiintymiä myös tiedostoissa:
  - `src/routes/ukk.tsx`, `src/routes/tietosuoja.tsx`, `src/routes/kayttoehdot.tsx`, `src/routes/opas/index.tsx`
  - `src/routes/vaihda-salasana.tsx`, `src/routes/unohtunut-salasana.tsx`, `src/routes/rekisteroidy.tsx`, `src/routes/login.tsx`
  - `src/routes/palaute.tsx`, `src/routes/_authenticated/myyntiraportti.tsx`, `src/routes/_authenticated.tsx`
  - `src/lib/kausikirje.server.ts`, `src/lib/ryhti.server.ts`, `src/lib/palaute.functions.ts`
  - `src/hooks/use-realtime-sync.ts`
  - `sisalto-kirjasto.md`, `README.md`
  - `vite.config.ts` (workbox-cache-nimet `kotiluotsi-*`)

## Tehtävälista
1. **Globaali tekstinvaihto**
   - Korvaa kaikki esiintymät tekstistä `"Kotiluotsi"` → `"Kotiluotsi"` ja `"kotiluotsi"` → `"kotiluotsi"` koko projektissa.
   - Huomioi myös tekniset tunnisteet: localStorage-avaimet, realtime-kanavan nimi, workbox-cache-nimet, User-Agent ja muut pienellä kirjoitetut `kotiluotsi`-viittaukset.

2. **Tarkistettavat avainkohdat**
   - `src/routes/__root.tsx`: `<title>`, description, og:title, apple-mobile-web-app-title, application-name.
   - `src/components/app-sidebar.tsx`: logo-teksti.
   - `src/lib/email.server.ts`: FROM-nimi ja sähköpostin HTML-otsikko.
   - `src/routes/index.tsx`: kaikki markkinointitekstit.

3. **URL-osoitteiden päivitys**
   - Vaihda viittaukset `https://kotiluotsi.fi` → `https://kotiluotsi.fi` (sitemap, UKK, opas, palaute.functions.ts).
   - Huomautus: uusi domain ei välttämättä ole vielä rekisteröity, joten linkit tulee päivittää myös julkaisuasetuksissa erikseen.

4. **Muutettavat tiedostot (ei kattava lista)**
   - `src/routes/__root.tsx`
   - `src/components/app-sidebar.tsx`
   - `src/lib/email.server.ts`
   - `src/routes/index.tsx`
   - `src/routes/ukk.tsx`
   - `src/routes/tietosuoja.tsx`
   - `src/routes/kayttoehdot.tsx`
   - `src/routes/opas/index.tsx`
   - `src/routes/vaihda-salasana.tsx`
   - `src/routes/unohtunut-salasana.tsx`
   - `src/routes/rekisteroidy.tsx`
   - `src/routes/login.tsx`
   - `src/routes/palaute.tsx`
   - `src/routes/_authenticated/myyntiraportti.tsx`
   - `src/routes/_authenticated.tsx`
   - `src/lib/kausikirje.server.ts`
   - `src/lib/ryhti.server.ts`
   - `src/lib/palaute.functions.ts`
   - `src/hooks/use-realtime-sync.ts`
   - `vite.config.ts`
   - `sisalto-kirjasto.md`
   - `README.md`

5. **Tarkistukset ennen valmista**
   - `npm run build` onnistuu ilman virheitä.
   - TypeScript-typecheck kulkee läpi.
   - Uusi haku projektista ei löydä enää "Kotiluotsi"-esiintymiä.
   - Sovellus renderöityy ilman `console.error`-viestejä.

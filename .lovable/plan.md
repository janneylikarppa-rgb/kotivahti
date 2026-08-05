# Paluulinkit UKK- ja opassivuille + arvio kielivalinnasta

## Osa 1 — Paluu etusivulle (tehdään nyt)

Lisätään yhtenäinen "← Takaisin etusivulle" -linkki kolmeen paikkaan:

- `src/routes/ukk.tsx` — linkki heti sivun alkuun (otsikon yläpuolelle) ja toinen sisällön loppuun.
- `src/routes/opas/index.tsx` — sama linkki oppaiden listasivun alkuun ja loppuun.
- `src/components/opas-layout.tsx` — yksittäisille opassivuille: yläreunaan nykyisen "Oppaat"-murupolun rinnalle (Etusivu › Oppaat) ja alalaitaan CTA-laatikon jälkeen paluulinkki.

Tyyli: sama hillitty kerma/kulta-linkki kuin lakisivujen alalaidassa (`legal-layout.tsx`), TanStack `<Link to="/">` eikä `<a>`. Ei muita sisältömuutoksia.

## Osa 2 — Kielivalinta (arvio, ei toteuteta vielä)

Kysyit onko iso työ. Lyhyt vastaus: **keskisuuri–iso**, koska sovelluksessa on satoja suomenkielisiä tekstejä hajallaan komponenteissa sekä sisältödataa (PTS-kohteet, vuosikello, huolto-infot, oppaat, sähköpostipohjat).

Karkea jako:

1. **Tekninen pohja (pieni)** — kevyt i18n-kerros (esim. `react-i18next` tai oma sanakirja + konteksti), kielivalitsin navigaatioon, valinnan tallennus profiiliin/localStorageen, oletus suomi.
2. **Käyttöliittymätekstit (keskisuuri)** — kaikki napit, otsikot, lomakekentät ja virheilmoitukset sanakirjaan. Tähän on jo iso etu: `sisalto-kirjasto.md` sisältää valtaosan teksteistä koottuna.
3. **Sisältödata (keskisuuri)** — PTS-kohteet, vuosikellon huoltorivit, huolto-infot ja liidikategoriat käännettävä; ne ovat rakenteista dataa, joten käännös on suoraviivainen mutta laaja.
4. **Markkinointisivut ja oppaat (iso, jos halutaan täysin)** — etusivu, UKK ja kolme opassivua ovat pitkiä tekstejä. SEO-mielessä nämä vaatisivat omat kieliversio-URLit (`/en/...`, `/sv/...`) ja hreflang-tagit.
5. **Sähköpostit ja lakitekstit (erikseen)** — kausikirjeet ja käyttöehdot/tietosuoja vaativat käännökset, lakitekstit mieluiten ihmisen tarkastamana.

Kevyempi välivaihe: käännetään vain sovelluksen sisäiset näkymät (kirjautuneen puoli) englanniksi/ruotsiksi ja pidetään markkinointisivut suomeksi. Se on selvästi pienempi urakka.

Kerro kumpi laajuus kiinnostaa, niin teen siitä oman suunnitelman paluulinkkien jälkeen.

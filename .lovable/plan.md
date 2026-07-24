## Tavoite

Seurata kotitalousvähennystä huoltokirjausten pohjalta: työn osuus talteen kirjattaessa, oma sivu laskelmalle, muistutus etusivulla ja merkintä huoltohistorialistassa.

## 1. Tietokanta (migraatio)

`huolto_historia`-tauluun kaksi uutta saraketta:
- `tyon_osuus` numeric, nullable
- `kotitalousvahennys_tyyppi` text, nullable (sallitut arvot `yritys` / `palkka` / tyhjä)

Olemassa olevat käyttöoikeudet ja tietoturvasäännöt riittävät (rivit ovat jo kiinteistön omistajan takana).

## 2. Verovakiot

Uusi tiedosto `src/lib/kotitalousvahennys.ts`:
- `VAHENNYS_YRITYS = 0.35`, `VAHENNYS_PALKKA = 0.13`
- `OMAVASTUU = 150` (€/henkilö/vuosi), `ENIMMAISMAARA = 1600` (€/henkilö/vuosi)
- `LAHDE = "vero.fi 2025–2026"`
- Laskentafunktio `laskeVahennys(kirjaukset, henkiloita)`:
  - yritystyö: `max(0, summa(tyon_osuus) − 150 × henkilöä) × 0,35`
  - palkkatyö: `summa(tyon_osuus) × 0,13`
  - yhteissumma katkaistaan katolla `1600 × henkilöä`
  - palauttaa myös erittelyn (yritys/palkka), katon ja täyttöasteen
- Yksikkötestit laskennalle.

## 3. Huoltokirjauslomake (`src/components/huolto-form.tsx`)

Kustannuskentän viereen:
- Radiovalinta: Ei vähennykseen / Vähennyskelpoinen (yritykseltä ostettu työ) / Vähennyskelpoinen (palkattu työntekijä)
- Jos vähennyskelpoinen: "Työn osuus (sis. alv)" €-kenttä + ohjeteksti materiaalien rajaamisesta
- Kentät mukaan tallennus- ja muokkauslogiikkaan (`addHuolto` / `updateHuolto` skeemat `src/lib/kotivahti.functions.ts`)

## 4. Uusi sivu `/kotitalousvahennys`

Reitti `src/routes/_authenticated/kotitalousvahennys.tsx`, oma head-metadata. Sivupalkkiin Receipt-ikoni ja teksti "Kotitalousvähennys" Kulut-linkin jälkeen.

Sisältö ylhäältä alas:
1. Kontrollit: vuosivalitsin (oletus kuluva vuosi) + 1/2 henkilöä -valinta
2. Verovähennyskortti: "Arvioitu verovähennys", summa isolla, selite henkilömäärän mukaan
3. Yksi edistymispalkki: X € / 1 600 € (tai 3 200 €), väri teal → oranssi (80 %) → harmaa (100 %)
4. Avattava "Miten vähennys lasketaan?" -osio esimerkkilaskelmineen
5. Tapahtumalista "Vähennyskelpoiset toimenpiteet", uusin ensin; tyhjänä ohjeteksti + "Lisää toimenpide" -nappi huoltohistoriaan
6. Vastuuvapauslauseke alareunassa

Data: uusi palvelinfunktio `getKotitalousvahennys` (vuosi parametrina) hakee valitun kiinteistön huoltokirjaukset, joissa `kotitalousvahennys_tyyppi` on asetettu.

## 5. Dashboard-kortti

Pieni kortti näkyy vain kun kuluvalta vuodelta löytyy vähintään yksi vähennyskelpoinen kirjaus: "💰 Kotitalousvähennys [vuosi]", "Käytetty: X € / 1 600 €", linkki sivulle.

## 6. Huoltohistorialistaus

Rivin perään pieni "ktv"-merkintä kun `kotitalousvahennys_tyyppi` ei ole tyhjä, ja kustannuksen perään työn osuus muodossa `450 € (työ 350 €)`.

## Tekninen huomio

Palkatun työntekijän kohdalla "työnantajan sivukulut" lisätään laskentaan siten, että ne sisällytetään ilmoitettuun työn osuuteen (kenttä ohjeistetaan: palkka + sivukulut). Erillistä sivukulukenttää ei lisätä, ellei toivot sitä.

## Tavoite

Kun käyttäjä tilaa palvelun, ammattilainen saa heti yhteyttä ottaessaan pohjatiedot kohteesta — eikä asiakkaan tarvitse itse kirjoittaa, mitä laitetta/materiaalia talossa on.

## Muutokset

### 1. Vuosikellon esitäyttö siistimmäksi
`src/routes/_authenticated/vuosikello.tsx` — pudotetaan `Vuosikello:`-etuliite. Kuvaukseen pelkkä asian ydin, esim. `Ilmalämpöpumpun vuosihuolto` (oli: `Vuosikello: Ilmalämpöpumpun vuosihuolto`).

### 2. Talon tietojen haku LiidiDialogiin
`src/lib/liidit.functions.ts` — laajennetaan `getOmatKiinteistot`-funktio palauttamaan myös valitun kiinteistön `talon_tiedot`-rivin relevantit kentät (lämmitys, IV, katto, putket, julkisivu, ikkunat, terassi, sähköt, hormit, salaojat jne.).

### 3. Kategoriakohtainen kuvauspohja
Uusi tiedosto `src/lib/liidi-kuvauspohja.ts`:
- Funktio `rakennaKuvausPohja(kategoria, talonTiedot)` → palauttaa lyhyen, valmiin tekstin, jonka käyttäjä voi muokata.
- Esim. kategorialla **Lämmitysjärjestelmä** + talossa ILP merkki "Mitsubishi" + vuosi 2018 → 
  > `Lämmitysjärjestelmä: ilmalämpöpumppu (Mitsubishi, asennettu 2018). Toivon huoltoa / tarjousta.`
- Kategorialla **Katto ja räystäät** + tiilikatto 2005 →
  > `Katto: tiilikatto, uusittu 2005. Pinta-ala n. 120 m². Toivon kuntoarviota.`
- Kategorialla **Ikkunat ja ovet** + 3k-ikkunat 2010 →
  > `Ikkunat: 3-kertaiset, uusittu 2010. Toivon tarjousta.`
- Jos tietoja ei ole, lyhyt geneerinen lause kategorian mukaan (esim. `Toivon tarjousta ikkunoiden uusimisesta.`).

Mapping kategoria → talon_tiedot-kentät (kaikki nykyiset 14 kategoriaa katetaan).

### 4. LiidiDialogin logiikka
`src/components/liidi-dialog.tsx`:
- Lisätään tila `kuvausMuokattu: boolean` — tosi heti kun käyttäjä koskee Textareaan.
- Kun `kategoria` tai `kiinteistoId` muuttuu **eikä** käyttäjä ole muokannut kenttää, päivitetään kuvaus pohjatekstillä `rakennaKuvausPohja(kategoria, talonTiedot)`.
- Vuosikellosta tuleva esitäytetty kuvaus (`liidiNimi`) yhdistetään pohjaan: `${liidiNimi}. ${pohja}` — käyttäjä näkee sekä työn nimen että talotietoihin perustuvan kontekstin.
- Placeholder pysyy ennallaan tyhjälle kentälle.

### 5. Sähköpostipohja
`src/lib/email.server.ts` ei vaadi muutoksia — kuvaus välittyy jo nykyisellään omistajan ilmoitukseen.

## Lopputulos
- Tyhjästä avattu lomake → kuvaus täydentyy kategoriavalinnan mukaan talon tiedoilla.
- Vuosikellon kautta avattu → kuvauksessa lukee suoraan työn nimi + talon laitteen tiedot.
- Käyttäjä voi aina muokata; muokkauksen jälkeen automaattinen päivitys lakkaa, jotta kirjoitettu teksti ei katoa.

Tehdäänkö näin?

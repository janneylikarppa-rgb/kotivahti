## 1. Liidi-dialogin kuvaus vaihtuu kategorian mukaan (bugikorjaus)

**Ongelma:** Kun "Tilaa nuohous" -napilla avattu lomake esitäyttää kuvaukseen "Nuohouksen tilaus" ja käyttäjä vaihtaa kategorian Lämmitysjärjestelmäksi, kuvauksessa lukee edelleen `Nuohouksen tilaus. Lämmitysmuoto: ...`. Esitäytetty teksti pitäisi kuulua vain alkuperäiseen kategoriaan.

**Korjaus `src/components/liidi-dialog.tsx`:**
- Tallennetaan `alkuKategoria`-ref dialogin avauksen yhteydessä (esitäytetyn kategorian arvo).
- Kuvauksen automaattipäivityksen logiikka muuttuu:
  - Jos `kategoria === alkuKategoria` ja `esitaytetty.kuvaus` on annettu → näytetään `${ydin}. ${pohja}` (kuten nyt).
  - Jos käyttäjä on vaihtanut kategoriaa → näytetään pelkkä `pohja` (kategoriakohtainen talotietoteksti), vuosikellon ydin pudotetaan kokonaan.
- Tämä toimii edelleen niin, että kun käyttäjä alkaa muokata kenttää käsin (`kuvausMuokattu = true`), automaattipäivitys lakkaa.

## 2. Etusivun yläpalkki: poistetaan "Ammattilaiset"

**`src/routes/index.tsx`:**
- Poistetaan navigaatiosta `Ammattilaiset`-linkki (sekä desktop- että mobiilivalikosta).
- Footeriin lisätään hienovarainen rivi: `Oletko ammattilainen? Ota yhteyttä: info@kotivahti.fi` (tai vastaava). Tyyli sopusoinnussa muun footerin kanssa, ei korostettu.
- Hero-osion ✓-listalta poistetaan `Tarkastetut paikalliset ammattilaiset` -rivi, koska se on ristiriidassa uuden viestin kanssa (ammattilaiskulma siirretään footerin sivumainintaan).
- CTA-osion `id="ammattilaiset"` poistetaan tarpeettomana (oli vain ankkurin kohde).

## 3. Etusivun "huikea päivitys" uusista ominaisuuksista

Tavoite: kävijä näkee heti yhdellä silmäyksellä, mitä kaikkea ilmainen Kotivahti tarjoaa.

**Lisätään HERO:n ja nykyisen OMINAISUUDET-osion väliin uusi tiivis "Mikä Kotivahti on" -ribbon** (`src/routes/index.tsx`):
- Tumma vihreä tausta `#0D1F14`, kultainen yläkulma-merkki: `UUTTA · ILMAINEN TALOKIRJA`.
- Otsikko: *"Yksi sovellus – koko talon hallinta."*
- Lyhyt alaotsikko, esim. *"Talokirja, vuosikello, kulujenseuranta, PTS-suunnitelma ja palveluiden kilpailutus – kaikki samassa paikassa. Aina ilmainen."*
- 6 kompaktia "pillin" muodossa olevaa ominaisuusmerkkiä (rivissä, wrappaa mobiilissa), kullakin ikoni + nimi:
  - 📒 Talokirja
  - 📅 Vuosikello
  - 💰 Kulujenseuranta
  - 📊 PTS-suunnitelma
  - 🛠 Huoltohistoria
  - 🤝 Palveluiden kilpailutus
- Alle pieni rivi: *"+ myyntiraportti, muistutukset ja tarkastettujen ammattilaisten verkosto."*

**Päivitetään olemassaoleva OMINAISUUDET-grid** vastaamaan tätä uutta sisältöä:
- Lisätään uusi kortti: **📒 Talokirja** – *"Talon perustiedot, laitteet, materiaalit ja vuosiluvut yhdessä paikassa. Päivitä kerran, käytä aina."*
- Muutetaan kortti `Tarkastetut ammattilaiset` muotoon **🤝 Palveluiden kilpailutus** – *"Tilaa kuntoarvio, huolto tai tarjouspyyntö suoraan sovelluksesta. Välitetään tarkastetuille paikallisille tekijöille."*
- Lopputuloksena 7 korttia (talokirja, vuosikello, PTS, kulujenseuranta, huoltohistoria, palveluiden kilpailutus, myyntiraportti). Grid säilyy `lg:grid-cols-3`.
- Yläotsikko muuttuu muotoon: *"Kaikki mitä talo tarvitsee — yhdessä."*  Alaotsikon "Kuusi toimintoa" → "Seitsemän toimintoa".

## Tekninen yhteenveto

| Tiedosto | Muutos |
|---|---|
| `src/components/liidi-dialog.tsx` | `alkuKategoria`-ref + ehdollinen `ydin`/`pohja` -yhdistely |
| `src/routes/index.tsx` | Nav-linkin poisto, uusi "Mikä Kotivahti on" -ribbon, ominaisuusgridin päivitys, footerin ammattilaismaininta |

Backend, sähköpostipohjat tai tietokanta eivät muutu.

Tehdäänkö näin?
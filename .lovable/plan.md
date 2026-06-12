# Suunnitelma

## 1. PTS päivittyy automaattisesti kun talon tiedot muuttuvat

**Ongelma:** Tällä hetkellä `seedPts` vain *lisää* puuttuvia autorivejä `pts_suunnitelma`-tauluun. Kun käyttäjä esim. vaihtaa kattomateriaalin pellistä tiileen tai päivittää rakennusvuoden, vanhat autorivit jäävät tauluun ja PTS näyttää vääriä suosituksia.

**Korjaus** `src/lib/kotivahti.functions.ts`:
- Laajennetaan `seedPts` → `synkronoiPts(supabase, kiinteistoId, talo)` joka:
  1. Lukee kaikki autorivit (oma_rivi = false).
  2. **Poistaa** autorivit, joiden `kohde.koskee(talo)` palauttaa false tai joiden `kohde.lahdeVuosi(talo)` on null. (Käyttäjän omat rivit, ja autorivit joilla on huoltohistoriaa = `viimeisin_huolto_vuosi`/`viimeisin_uusiminen_vuosi`, jätetään koskematta jotta kirjattu historia ei katoa.)
  3. **Päivittää** olemassa olevat autorivit, joiden `kayttoika`, `huoltovali` tai `lahde_vuosi` on muuttunut talon tietojen perusteella → laskee `toimenpide_vuosi`-arvon uudelleen vain jos käyttäjä ei ole sitä manuaalisesti siirtänyt (ei `kuvaus`-merkintää `[Siirretty …]`).
  4. **Lisää** puuttuvat autorivit (nykyinen logiikka).
- Kutsutaan `synkronoiPts` `saveTaloTiedot`-handlerin lopuksi (sen lisäksi että `getPts` kutsuu sitä). Näin PTS päivittyy heti kun talon tietoja muutetaan.
- Talon tiedot -sivulla `save.mutate` `onSuccess` invalidoi myös `["pts"]`-queryn jotta käyttäjän PTS-näkymä päivittyy ilman sivun latausta.

## 2. Ilmalämpöpumpun PTS-suositus

`src/lib/pts-kohteet.ts` `ilp`-kohde:
- `kayttoika`: 14 → **15** (keskimääräinen ILP:n uusimisikä).
- `huoltovali`: 1 (säilyy, imurointi vuosittain).
- Lisätään uusi valinnainen kenttä `kuvaus?: string` PTS_KOHTEET-tyyppiin ja kirjoitetaan se `pts_suunnitelma.kuvaus`-sarakkeeseen seedissä (vain jos sarake on tyhjä, ei ylikirjoiteta käyttäjän muistiinpanoja eikä `[Siirretty …]`-merkintöjä).
- ILP:n kuvaus:
  > Vuosittain: puhdista sisäyksikön suodattimet ja imuroi ulkoyksikön lamellit. Laitteen sisälle, kennoille, puhallinrullaan ja kondenssialtaaseen kertyy ajan mittaan likaa, pölyä ja mikrobeja, joita pelkkä imurointi ei tavoita – tämä näkyy heikentyneenä viilennystehona, korkeampana sähkölaskuna ja huonompana sisäilmana. Tilaa ammattilaisen pesu noin 3–5 vuoden välein. Laitteen suositeltu uusimisikä on n. 15 vuotta.

## 3. Vuosikello-viilaukset (`src/routes/_authenticated/vuosikello.tsx`, `src/lib/vuosikello-data.ts`)

- Poistetaan listanäkymästä rivin oikealta puolelta hinta-merkintä (`{Number(st.hinta).toFixed(0)} €`) ja "amm."-tunniste.
- Poistetaan "Märkätilojen silikonien tarkastus" -rivin pitkä `kuvaus` `PERUSHUOLLOT.talvi`-listasta, jotta se näkyy luettelossa samalla tavalla kuin muutkin rivit. Info on jo saatavilla **Info**-painikkeen takana (`haeHuoltoInfo` osuu `silikon|sauma`-regexiin).

## 4. Talon tiedot (`src/routes/_authenticated/talon-tiedot.tsx`)

- **Hormit**: vapaa teksti → `Select` (vaihtoehdot: *Ei hormia*, *Tiilihormi*, *Teräs- / moduulihormi*, *Muu*) + uusi numeerinen kenttä **Hormeja (kpl)** (sarake `hormien_maara`). Kpl-määrä esitäytetään `LiidiDialog`-nuohousliidin kuvaukseen muotoa "Nuohous, hormeja N kpl".
- **Räystäät asennettu (vuosi)**: muutetaan otsikko "Räystäät kunnostettu" → **"Räystäät asennettu"**, lisätään placeholder *"Jätä tyhjäksi jos alkuperäiset"*. Sarake `raystaat_kunnostettu_vuosi` säilyy nykyisellään (vain UI-tekstit muuttuvat).
- **IV-koneen asennusvuosi**: lisätään placeholder *"Jätä tyhjäksi jos alkuperäinen"*.
- **Lämpöpumppu (lisälaite)** osio: otsikko → **"Ilmalämpöpumppu (lisälaite)"**.
- **Kiuas**: uusi `Select` **"Kiuastyyppi"** (puu / sähkö) tallennetaan sarakkeeseen `kiuas_tyyppi`. Vaikutukset:
  - `vuosikello-data.ts`/`pts`: nuohous- ja hormi-ehdotukset näytetään vain jos `kiuas_tyyppi === "puu"` tai talon `lammitysmuoto` on puu/öljy/pelletti (eli oikeasti nuohottava hormi olemassa). Sähkökiukaalla näytetään sen sijaan vihje "Kiuaskivien tarkastus / vaihto" (jo olemassa).

## 5. Tietokantamuutokset

Yksi migraatio joka lisää sarakkeet `talon_tiedot`-tauluun:
- `hormien_maara` integer
- `kiuas_tyyppi` text (arvot 'puu' | 'sahko')
- `hormityyppi` text (vaihtoehtoarvot)

## 6. Muistilista todentamiseen

- Vaihda rakennusvuosi → autorivien `lahde_vuosi` ja `toimenpide_vuosi` päivittyvät.
- Vaihda kattomateriaali pelti → tiili: `katto_pelti`-rivi häviää, `katto_tiili` ilmestyy.
- Lisää ILP-asennusvuosi 2025 → PTS-rivi 2040 (15 v), kuvaus pesutiedolla.
- Vuosikellossa silikonirivi näkyy ilman pitkää tekstiä, Info-painike avaa dialogin.
- Hormit = 2 ja kiuas = puu → nuohousliidin kuvaus sisältää "2 kpl".

## Tiedostot

Muokattavat:
- `src/lib/kotivahti.functions.ts` (synkronoiPts + saveTaloTiedot)
- `src/lib/pts-kohteet.ts` (ILP, kuvaus-kenttä)
- `src/lib/vuosikello-data.ts` (silikoni-kuvaus pois, kiuas/hormi-ehto)
- `src/routes/_authenticated/vuosikello.tsx` (hinta & amm. pois listalta)
- `src/routes/_authenticated/talon-tiedot.tsx` (lomakemuutokset)
- Uusi migraatio `talon_tiedot`-sarakkeille

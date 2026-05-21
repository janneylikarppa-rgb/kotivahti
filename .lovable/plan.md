## Tavoite

Päivitetään huoltohistoria vastaamaan tuotedokumentin osio 4.3:a. Migration on jo ajettu (pts_siirto → integer, talo_dokumentit.huolto_id lisätty).

## 1. `src/lib/kotivahti.functions.ts`

- `huoltoSchema`:
  - `pts_siirto`: `z.number().int().min(0).max(50).default(0)` (boolean → vuotta)
  - Lisätään valinnainen `liitteet: z.array({ nimi, tiedosto_polku, mime?, koko_bytes? }).default([])`
- `addHuolto.handler`:
  - Insert palauttaa `id` (`.select("id").single()`)
  - Jos `liitteet.length > 0` → insert `talo_dokumentit`-tauluun jokainen liite: `{ kiinteisto_id, huolto_id: uusi id, nimi, tiedosto_polku, mime, koko_bytes, tyyppi: 'kuitti' }`
  - Säilytä nykyinen kytkentä `kulut`-tauluun (kustannus > 0)
- `updateHuolto.handler`:
  - Ota `liitteet` erikseen patchista, sama insert-logiikka olemassa olevalle `id`:lle (vain uudet liitteet — frontti lähettää vain uudet)
- Lisätään `deleteHuoltoLiite` server fn (`id`, `tiedosto_polku`) → poistaa storagesta ja `talo_dokumentit`-rivin
- `getHuollot`: liitetään liitteet (`talo_dokumentit` joissa `huolto_id IN (...)`) ja palautetaan jokaisella huollolla `liitteet`-array

## 2. `src/routes/_authenticated/huoltohistoria.tsx` – `HuoltoForm`

Korvataan kentät spek 4.3:n mukaan:

- **Tyyppi** – Select: `huolto`, `tarkastus`, `remontti`, `maalaus`, `uusiminen`
- **Kohde** – Select 20+ vaihtoehdolla (vakiolista `src/lib/huolto-kohteet.ts`):
  - Lämmitysjärjestelmät: Öljykattila, Maalämpöpumppu, Ilma-vesilämpöpumppu, Ilmalämpöpumppu, Kaukolämpö-vaihdin, Poistoilmalämpöpumppu, Sähkökattila, Sähköpatterit
  - Tekniikka: IV-kone, Käyttövesiputkisto, Viemäröinti, Sähköjärjestelmä, Lämminvesivaraaja
  - Rakenne: Katto, Räystäät & kourut, Julkisivu, Ikkunat, Salaojat, Perustukset
  - Sisätilat: Kylpyhuone/märkätila, Sauna & kiuas, Hormit & tulisijat
  - Piha: Terassi, Piha-alue
  - Muu (vapaa teksti)
- **Kuvaus** – Textarea (ennallaan)
- **Päivämäärä** – Date (ennallaan)
- **Tekijä** – Select Itse/Ammattilainen (ennallaan)
- **Tekijän nimi** – Text (ennallaan)
- **Kustannus €** – Number, lisätään aputeksti "Menee automaattisesti kulujenseurantaan"
- **Takuu (vuotta)** – Number (ennallaan)
- **PTS-siirto (vuotta)** – Number-input (0 = ei siirtoa). Checkbox tilalle. Aputeksti: "Kuinka monella vuodella tämä siirtää PTS-suositusta"
- **Liitteet** – uusi `<FileUpload>` -alue:
  - Multi-file input
  - Jokainen tiedosto ladataan `talo-dokumentit`-bucketiin polkuun `{user_id}/huolto/{timestamp}_{filename}` heti valittaessa
  - Lista valituista liitteistä (poistettavissa ennen tallennusta)
  - Editissä näytetään olemassa olevat liitteet `deleteHuoltoLiite`-painikkeella

Lomakkeen submit lähettää `liitteet`-arrayn vain uusista latauksista.

## 3. Tietokantakytkentä – jo tehty migraatiossa

- `huolto_historia.pts_siirto`: integer (default 0)
- `talo_dokumentit.huolto_id`: uuid (nullable, indeksoitu)

## 4. Mitä EI muuteta

- Vuosikellon kuittauslogiikka säilyy (luo `huolto_historia`-rivit pts_siirto = 0:lla)
- Olemassa olevat huoltomerkinnät säilyvät; vanhat `pts_siirto = true` -rivit muuntuivat arvoon `1` migraatiossa
- Talon tiedot -lomakkeen dokumenttiosio säilyy itsenäisenä (eri `huolto_id IS NULL` -filtteri)

## Tekninen huomio

- Uusi tiedosto: `src/lib/huolto-kohteet.ts` exportoi `HUOLTO_TYYPIT` ja `HUOLTO_KOHTEET` -taulukot
- `getTaloTiedot` dokumentit-lista rajataan `huolto_id IS NULL`:iin jotta huollon liitteet eivät tuplaannu Talon tiedot -sivulle (vai näytetäänkö siellä myös – tämä on speksin mukaan ok kun "menee dokumenttiarkistoon")

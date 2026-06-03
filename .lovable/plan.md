# Suunnitelma

## 1. Huoltohistoria: poista "Tilaa ammattilainen" -painike
`src/routes/_authenticated/huoltohistoria.tsx`:
- Poista `<Send>`-painike rivien lopusta.
- Poista `LiidiDialog`-importti ja `tilaaH`-tila.

## 2. Kategorian arvaus: "Nuohouksen tilaus" → Nuohous ja tulisijat
`src/lib/liidit-kategoriat.ts`:
- Muuta regex `nuohous` → `nuohou` (jotta "nuohouksen" osuu).

## 3. Lisätään "Siivouspalvelu" uudeksi kategoriaksi
`src/lib/liidit-kategoriat.ts`:
- Lisää `"Siivouspalvelu"` listaan `LIIDI_KATEGORIAT`.
- `arvaaKategoria`: lisää sääntö `/(ikkunoiden pesu|siivo|pesu)/` → `"Siivouspalvelu"` (ennen muita pesu-osumia, mutta katon/julkisivun pesun jälkeen).
- Lisää `liidi-kuvauspohja.ts`-tiedostoon pohja siivouspalvelulle.

## 4. Vuosikellon "Tilaa"-painikkeen hallinta + tekstimuutokset
`src/lib/vuosikello-data.ts`:
- Muutetaan `PERUSHUOLLOT`-tyyppi muotoon `Record<Kausi, { nimi: string; ammattilainen: boolean }[]>`.
- Muutetaan `dynamicHuollot` palauttamaan sama muoto.
- Muutetaan `kaikkiHuollot` käyttämään uutta muotoa.

### Kevät — `ammattilainen: false` näille:
6 Lattiakaivot, 8 Palovaroittimet, 9 Vikavirtasuoja, 10 Pyykinpesukoneen letkut, 12 Aurinkopaneelien puhdistus, 14 Lämmityksen kesäasetukset, 15 Ulkovesipisteen avaus.
11 (Ikkunoiden pesu): **säilyy** `ammattilainen: true` (avaa liidin, joka osuu kategoriaan "Siivouspalvelu").
Loput (1, 2, 3, 4, 5, 7, 13) säilyvät `true`.

### Kesä:
- 18 nimeksi **"Pihalaatoituksen tarkastus"** — `ammattilainen: true` (ei mainittu poistolistalla).
- 19 nimeksi **"Nuohouksen tilaus"** — `true`.
- 21 nimeksi **"Ulkovalaistuksen tarkastus"** — `false`.
- 20 Lämmitysjärjestelmän kesäkäynti — `false`.
- 22 Nurmikon ja istutusten hoito — `false`.
- 23 Lattiakaivojen puhdistus — `false`.
- 24 Aurinkopaneelien tuoton seuranta — `false`.
- 16, 17 säilyvät `true`.

### Syksy:
- **27 Salaojien tarkastus ennen routaa** — poistetaan kokonaan (jää vain kevään kohta 4 "Salaojien tarkastus ja huuhtelu", joka säilyy `true`).
- **29 Nuohouksen tarkistus** — poistetaan kokonaan (kesän 19 riittää muistutukseksi).
- 25 Lämmityksen käyttöönotto — `false`.
- 30 Käsisammuttimen tarkastus — `false`.
- 31 Palovaroittimet — `false`.
- 32 Vikavirtasuoja — `false`.
- 33 Pesukoneiden letkut — `false`.
- 34 Ulkovesipisteen talvisulku — `false`.
- 35 Ilmalämpöpumpun talvivalmistelu — `false`.
- 36 Öljysäiliön tilan tarkastus — `false`.
- 26, 28 säilyvät `true`.

### Talvi: kaikki 37–44 → `false`.

### Ympäri vuoden:
- 45, 46, 48, 49, 50, 51, 52, 53, 54 → `false`.
- 47 (Ilmalämpöpumpun suodattimet) säilyy `true`.

### Dynaamiset → `false`:
- 56 Öljysäiliön kunnon silmämääräinen tarkastus
- 58 Lämmönkeruupiirin paineen tarkastus
- 62 Pellettivaraston ja syötön puhdistus
- 64 Lämmönjakokeskuksen tarkastus
- 65 Sähkövaraajan vastusten ja anodin tarkastus

Muut dynaamiset säilyvät `true`.

## 5. Vuosikello-näkymän päivitys
`src/routes/_authenticated/vuosikello.tsx`:
- `HuoltoLista` ottaa nyt `nimet: { nimi: string; ammattilainen: boolean }[]`.
- Käytä `nimi.nimi` näytössä ja `nimi.ammattilainen`-ehtoa "Tilaa"-painikkeen renderöintiin.
- `statusOf`, `setLiidiNimi` ja `setValittu` saavat string-arvon `item.nimi`.

## 6. Verifiointi
- Tarkista että build menee läpi.
- Avaa vuosikello eri kausilla ja varmista että painike näkyy vain merkityissä kohteissa.
- Kuittaus toimii edelleen kaikilla riveillä.

## Yhteenveto poistetuista ja muutetuista
- Poistetut rivit: syksy 27, syksy 29.
- Uudelleennimetyt: kesä 18, 19, 21.
- Uusi kategoria: "Siivouspalvelu".
- "Tilaa"-painike piilotettu n. 30 riviltä, säilyy ammattilaisapua vaativissa töissä (kuten katto, julkisivu, salaojat, lämmityskattilat, IV-suodattimet, nuohous).

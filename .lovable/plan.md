# Talon tiedot omaksi (muokattavaksi) osioksi liidi-dialogiin

## Tavoite
Tilaa palvelu -dialogiin lisätään kuvauksen yläpuolelle oma "Talon tiedot" -kenttä, joka esitäytetään valitun kategorian tiedoilla talovahdista. Käyttäjä voi myös muokata tietoja käsin ennen lähetystä. Kuvaus-kenttä on puhtaasti käyttäjän vapaa pyyntö siitä, mitä hän haluaa tai tarvitsee.

## Muutos: `src/components/liidi-dialog.tsx`

### 1) Uusi "Talon tiedot" -kenttä (kuvauksen yläpuolelle)
- Uusi state `talonTiedot` + lippu `talonTiedotMuokattu`.
- `useEffect` täyttää `talonTiedot` arvolla `rakennaKuvausPohja(kategoria, valittuKt?.talon_tiedot)` aina kun kategoria tai kiinteistö vaihtuu — mutta vain jos käyttäjä ei ole vielä muokannut kenttää (`talonTiedotMuokattu === false`).
- Renderöidään `Textarea` (rows=3, maxLength 2000), label "Talon tiedot (kategorian mukaan)", apuviesti: "Esitäytetty talovahdistasi — voit muokata vapaasti."
- `onChange` asettaa lipun true, jotta automaattinen päivitys ei ylikirjoita.
- Kun dialog suljetaan, lippu nollautuu (yhdessä muiden olemassa olevien resettien kanssa).
- Jos talovahdissa ei ole kategorian tietoja, kenttä jää tyhjäksi ja placeholder ohjaa: "Lisää tai täydennä talon tietoja /talon-tiedot -sivulla."

### 2) Kuvaus-kenttä → puhtaasti käyttäjän syöte
- Poistetaan nykyinen automaatti, joka täyttää kuvauksen `rakennaKuvausPohja`-tekstillä, sekä `kuvausMuokattu`-lippu.
- Alkuarvo: `esitaytetty?.kuvaus ?? ""` (vuosikellon "ydin", esim. "Nuohouksen tilaus", säilyy alkuvinkkinä; muutoin tyhjä).
- Placeholder: "Kerro mitä haluat tai tarvitset".

### 3) Lähetettävä `kuvaus`
- Yhdistetään lähetyksessä:
  ```
  [talonTiedot, käyttäjän kuvaus]
    .map(s => s?.trim())
    .filter(Boolean)
    .join("\n\n— Asiakkaan pyyntö —\n")
  ```
- Jos kumpikaan ei ole tyhjä, käytetään yhdistettyä tekstiä; jos molemmat tyhjät → `null`.
- Backend, admin-näkymä ja sähköpostit pysyvät ennallaan, koska data kulkee yhden `kuvaus`-kentän kautta.

## Mitä EI muuteta
- `liidi-kuvauspohja.ts`, server-funktiot, tietokantarakenne, admin-näkymä tai vuosikello.
- Muut dialogin kentät (palvelu, kategoria, yhteystiedot, kiinteistö) ennallaan.

## Tarkistus
1. Vuosikellon "Tilaa palvelu" → talon tiedot -kenttä esitäytyy, kuvaus näyttää vuosikellon ytimen (esim. "Nuohouksen tilaus").
2. Kategorian tai kiinteistön vaihto päivittää talon tiedot -kentän — mutta vain jos käyttäjä ei ole muokannut sitä.
3. Käyttäjä muokkaa talon tietoja → muokkaukset säilyvät, vaikka kategoriaa vaihtaa.
4. Lähetys: admin näkee sekä esitäytetyt/muokatut tiedot että käyttäjän pyynnön erotettuna otsikolla "— Asiakkaan pyyntö —".

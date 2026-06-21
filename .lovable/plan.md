## Tavoite

1. Käyttäjä lisää **toistuvat vuosittaiset kiinteät kulut** (esim. kiinteistövero, kotivakuutus, maavuokra, jätehuolto, talvikunnossapito, nuohous-sopimus) → näkyvät automaattisesti joka vuoden Kulut-yhteenvedossa ja kaavioissa.
2. **Sähkö ja vesi** saadaan kuukausittain automaattisesti: käyttäjä syöttää vain mittarilukeman (esim. kuukauden 1. päivä), summa lasketaan asetuksissa olevista tariffeista (energia + siirto + perusmaksu / vesi €/m³ + jätevesi + perusmaksu). Ei enää tarvetta syöttää € erikseen.

## Käyttäjäkokemus

### A) Uusi välilehti "Toistuvat kulut"

Lista nykyisistä → nimi, kategoria, €/vuosi, erääntymiskuukausi, poista.

"Lisää toistuva kulu" -dialog, jossa pikamallit-rivi: **Kiinteistövero · Kotivakuutus · Maavuokra · Jätehuolto · Talvikunnossapito · Nuohous-sopimus**. Kentät: nimi, kategoria (vakuutus / kiinteistovero / muu), summa €/v, erääntymiskuukausi, alkuvuosi.

### B) Mittarilukema-pohjainen kuukausisyöttö

**Kulut-sivun ylälaitaan** uusi kortti "Kuukauden mittarilukemat":
- Kentät: kuukausi (oletus kuluva), Sähkömittari (kWh), Vesimittari (m³)
- Painike "Tallenna kuukauden mittari"
- Järjestelmä laskee:
  - Sähkö-kulutus = lukema − edellinen sähkölukema; summa = kulutus × (energia + siirto) / 100 + perusmaksu
  - Vesi-kulutus = lukema − edellinen vesilukema; summa = kulutus × (puhdas + jätevesi) + perusmaksu
- Luo kaksi `kulut`-riviä (kategoria sahko/vesi), kohde_avain `mittari:sahko:YYYY-MM` / `mittari:vesi:YYYY-MM` (idempotentti — saman kk:n uusi syöttö päivittää).
- Päivittää `kulu_asetukset.edellinen_mittarilukema` veteen + uusi sarake `edellinen_sahkomittari` sähkölle.

Nykyinen "Lisää kulu" -dialog jää ennalleen yksittäisiä/satunnaisia kuluja varten (esim. huolto, vakuutus-rivi käsin), mutta sähkö ja vesi tulevat ensisijaisesti mittarilukemista.

### C) Yhteenveto

Toistuvat kulut näkyvät automaattisesti Kiinteät-piirakassa heti lisäyksen jälkeen. Sähkö/vesi näkyvät Juoksevat-kuvaajassa heti mittarilukeman tallennuksen jälkeen.

## Tekninen toteutus

### 1. Migraatio

**Uusi taulu `toistuvat_kulut`**:
```
id uuid pk, kiinteisto_id uuid fk (cascade),
nimi text, kategoria text (vakuutus|kiinteistovero|muu),
summa numeric, erääntymiskuukausi smallint (1..12) default 1,
alkuvuosi int default extract(year from now()),
aktiivinen boolean default true,
created_at, updated_at timestamptz
```
RLS: omistajan luku/kirjoitus `omistaa_kiinteiston(kiinteisto_id)`. Grantit authenticated + service_role. `set_updated_at`-trigger.

**`kulu_asetukset`** lisäys:
- `edellinen_sahkomittari numeric default 0`
- `edellinen_vesimittari_pvm date` (valinnainen — viimeksi syötetty kk)
- `edellinen_sahkomittari_pvm date`

### 2. Server-funktiot `src/lib/kotivahti.functions.ts`

- `getToistuvatKulut()` — listaa
- `addToistuvaKulu / updateToistuvaKulu / deleteToistuvaKulu`
- `tallennaKuukaudenMittari({ vuosi, kuukausi, sahko_lukema?, vesi_lukema? })`
  - Lukee asetukset (tariffit + edelliset lukemat)
  - Laskee €, upsertaa `kulut`-rivin kohde_avaimella `mittari:sahko:YYYY-MM` / `mittari:vesi:YYYY-MM`
  - Päivittää `kulu_asetukset.edellinen_*mittari` + `_pvm`
  - Palauttaa lasketut summat käyttäjälle vahvistukseksi

### 3. `getKulut`-materialisointi

`getKulut`-funktiossa: hae aktiiviset toistuvat, ja jokaiselle (toistuva, vuosi alkuvuosi..kuluva) varmista `kulut`-rivi kohde_avaimella `toistuva:{id}:{vuosi}` (upsert). Olemassa olevan rivin summa/nimi/pvm päivitetään, jos toistuvaa on muokattu.

### 4. UI `src/routes/_authenticated/kulut.tsx`

- Uusi kortti "Kuukauden mittarilukemat" Yhteenveto-välilehden yläosaan (näyttää edellisen lukeman ja lasketun esikatselun reaaliajassa).
- Uusi välilehti `Toistuvat kulut` (lista + dialog + pikamallit).
- `Kaikki kulut`-listalla: 🔁 toistuville (`kohde_avain LIKE 'toistuva:%'`), 📊 mittareille (`kohde_avain LIKE 'mittari:%'`).
- Asetukset-välilehti pysyy (tariffit + perusmaksut säädetään täällä).

### 5. Yhteensopivuus

- Olemassaoleva "Lisää kulu" -dialog säilyy.
- Nykyinen `edellinen_mittarilukema` (vesi) migroidaan: arvo kopioidaan myös uuteen `edellinen_vesimittari`-sarakkeeseen tai pidetään käytössä — käytetään nykyistä saraketta ja lisätään vain `edellinen_sahkomittari` + päivämääräkentät, jotta vältetään koodin rikkoutuminen.

## Vaikutusalue

- DB: 1 uusi taulu + 3 saraketta `kulu_asetukset`-tauluun
- 5 uutta server-funktiota + `getKulut`-materialisointi
- UI: vain `kulut.tsx`

Dashboard, vuosikello ym. saavat sekä toistuvat että mittari-pohjaiset kulut "ilmaiseksi", koska kaikki päätyy `kulut`-tauluun.


# Myyntiraportti-sivu

Uusi reitti `/_authenticated/myyntiraportti` joka kokoaa kaiken kiinteistön datan tulostettavaan huoltokirjaan välittäjälle.

## 1. Backend – uusi server function

Lisätään `getMyyntiraportti` tiedostoon `src/lib/kotivahti.functions.ts` (käyttää `requireSupabaseAuth`-middleware kuten muutkin). Hakee aktiivisen kiinteistön ja palauttaa yhdellä kutsulla:

- `kiinteisto` – osoite, kaupunki, rakennusvuosi
- `talon_tiedot` – kaikki kentät (ml. `data` ja `lammitys_lisatieto` jsonb)
- `huolto_historia` – kaikki rivit järjestyksessä `pvm ASC`
- `talo_dokumentit` – kaikki paitsi `tyyppi = 'kuva'`; jokaiselle luodaan signed URL (`createSignedUrl`, 1h) `talo-dokumentit`-bucketista
- `kulut` – kategoriat `sahko`, `lammitys`, `vesi` viimeiseltä täydeltä kalenterivuodelta (= `EXTRACT(YEAR FROM now()) - 1`)
- `toistuvat_kulut` – `aktiivinen = true` ja `kategoria IN ('kiinteistovero','muu')` (vakuutukset pois)

## 2. Sivun rakenne

`src/routes/_authenticated/myyntiraportti.tsx`:

```text
┌─────────────────────────────────────┐
│ Validointipalkki (no-print)         │  ← sähkö / lämmitys / vesi kortit
├─────────────────────────────────────┤
│ Toimintonapit (no-print):           │
│   [Tulosta raportti]                │
│   [Muokkaa talon tietoja]           │
├─────────────────────────────────────┤
│ <article class="raportti">          │  ← sekä ruudulla että tulostuksessa
│   OSA 1 Kansilehti                  │
│   OSA 2 Perustiedot                 │
│   OSA 3 Talotekniikka               │
│   OSA 4 Energiankulutus             │
│   OSA 5 Kiinteät vuosikulut         │
│   OSA 6 Huollot/remontit            │
│   OSA 7 Liiteluettelo               │
│   OSA 8 Myyjän kommentti (textarea) │
│   OSA 9 Allekirjoitus               │
│ </article>                          │
└─────────────────────────────────────┘
```

State (vain client, ei tallenneta tietokantaan):
- `myyjanKommentti: string`
- `sisallytaKulutus: { sahko: boolean; lammitys: boolean; vesi: boolean }` – oletus `true` jos data löytyy, muuten `false`

## 3. Validointipalkki

Kullekin kulutustyypille kortti (`vihreä reunus = data löytyy`, `harmaa = ei dataa`). Kortissa:
- Toggle `Sisällytetään raporttiin` / `Jätetään tyhjäksi`
- `Lisää kulutus →`-nappi joka vie `/kulut`

Lämmityskortti renderöidään vain jos `lammitysmuoto ∈ {kaukolampo, oljy, puu, hake, pelletti}`. "Data löytyy" -tarkistus: viimeiseltä täydeltä vuodelta löytyy vähintään yksi rivi joka kategoriaan (sähkö `kwh > 0`, vesi `kulutus_m3 > 0`, lämmitys `kwh > 0` tai `summa > 0`).

## 4. Kenttäkartoitus (talon_tiedot)

Käyttäjän pyytämät nimet → todelliset sarakkeet:

| Pyydetty | Todellinen |
|---|---|
| pinta_ala | `pinta_ala` |
| kokonaispinta_ala | `kokonaispinta_ala` |
| kerrokset | `kerroksia` |
| kellari, kiinteistotunnus | luetaan `data` jsonb -kentästä jos olemassa, muuten jätetään pois |
| tontti | `tontin_pinta_ala` |
| kantava_rakenne | `rakennustapa` |
| julkisivu | `julkisivumateriaali` |
| katto_materiaali / katto_vuosi | `kattomateriaali` / `katto_uusittu_vuosi` |
| ikkuna_vuosi | `ikkunat_uusittu_vuosi` |
| lammitys_vuosi | `lammitys_asennettu_vuosi` |
| lammitys_malli | `lammitys_lisatieto.malli` (jsonb) |
| ilp_vuosi | `ilp_asennettu_vuosi` |
| iv_tyyppi / iv_vuosi | `ilmanvaihto` / `ilmanvaihto_vuosi` |
| putket_materiaali / putket_vuosi | `putkimateriaali` / `putket_uusittu_vuosi` |
| viemari_materiaali / viemari_vuosi | `viemarimateriaali` / `viemari_asennettu_vuosi` |
| laitteet | johdetaan totuusarvona kentistä: `kiukaan_vuosi`, `salaojat`, `terassi_lasitettu`, `palovaroittimia > 0`, ja jos `data.laitteet` jsonb-listassa on lippuja (aurinkopaneelit, lämminvesivaraaja, takka), näytetään ne |

Tyhjät kentät jätetään raportista kokonaan pois (`renderRivi(label, value)`-helper joka palauttaa `null` jos arvo on tyhjä).

## 5. Liitteet ja numerointi

- Suodatetaan `talo_dokumentit` jossa `tyyppi !== 'kuva'`
- Numerointi: kaikki dokumentit järjestetään ensin huoltoon liitettyihin (vanhimman huollon mukaan) + sitten irralliset. Annetaan juokseva `liite_nro` 1…N
- Huoltokirjauksessa renderöidään `→ ks. Liite [n]: <nimi>` per dokumentti
- Liiteluettelo ryhmittelee kategorian mukaan käyttäen huoltokirjauksen `kohde_avain`-kenttää (`katto_*`, `raystas` → katto/rakenteet; `kylpyhuone`, `viemari`, `kayttovesi` → märkätilat; `lammitys_*`, `iv_kone` → talotekniikka; muut → muut)
- Ruudulla: `Avaa ↗`-linkki avaa signed URLin uuteen välilehteen; tulostuksessa linkki piilotetaan (`.no-print`) ja vain nimi näkyy

## 6. Tulostustyyli

Lisätään `src/styles.css`-tiedoston loppuun `@media print`-osio:
- `@page { size: A4 portrait; margin: 20mm; }`
- Piilotetaan: `body > *:not(main)`, sidebar, header, `.no-print`, validointipalkki, napit, toast-juuri
- `.raportti` mustana valkoisella, kansilehden otsikko + kultainen viiva säilyy
- `.page-break` → `page-break-before: always` (OSA 1, 3, 6, 7 alkuun)
- Kulutustaulukko `font-size: 9pt`
- Sivunumerot: `@page { @bottom-right { content: "Sivu " counter(page) " / " counter(pages); } }`

## 7. Tulostuslogiikka

```ts
function handlePrint() {
  const togglePaalla = sisallytaKulutus.sahko || sisallytaKulutus.lammitys || sisallytaKulutus.vesi;
  const dataPuuttuu = (sisallytaKulutus.sahko && !kulutus.sahko) || ...;
  if (togglePaalla && dataPuuttuu) {
    // confirm-dialog: "Kulutusdata puutteellinen – haluatko tulostaa silti?"
  }
  window.print();
}
```

## 8. Navigaatio

- `src/components/app-sidebar.tsx`: lisätään `items`-listaan `Pyynnöt`-rivin jälkeen
  `{ title: "Myyntiraportti", url: "/myyntiraportti", icon: FileText }`
- `src/routes/_authenticated/dashboard.tsx`: lisätään uusi `gold-card` `Kuluerittely`-kortin viereen tai loppuun otsikolla "Myyntiraportti", kuvaus ja nappi `Avaa raportti →` → `/myyntiraportti`

## Tekninen yhteenveto

**Uudet tiedostot**
- `src/routes/_authenticated/myyntiraportti.tsx` – sivu + komponentti, kaikki UI ja state

**Muokattavat tiedostot**
- `src/lib/kotivahti.functions.ts` – uusi `getMyyntiraportti` server function (auth middleware, palauttaa serialisoitavan DTO:n)
- `src/components/app-sidebar.tsx` – uusi `FileText`-import ja menu-rivi
- `src/routes/_authenticated/dashboard.tsx` – uusi raportti-kortti
- `src/styles.css` – `@media print` -säännöt

Ei migraatioita, ei uusia tauluja. Käytetään olemassa olevia RLS-policyjä – `omistaa_kiinteiston(kiinteisto_id)` kattaa kaiken.

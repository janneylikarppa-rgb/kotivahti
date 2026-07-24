## Tavoite
Lisää talon-tiedot-sivulle "Hae Ryhti-rajapinnasta" -nappi, joka hakee osoitteen perusteella viralliset rakennustiedot ja esitäyttää lomakkeen kentät. Käyttäjä voi muokata arvoja normaalisti.

## Huomio arkkitehtuurista
Ohjeen mukainen "Supabase Edge Function" korvataan TanStack `createServerFn`:llä — projektissa ei luoda uusia Supabase Edge Functioneita. Ulkoiset API-kutsut (Digitransit + Ryhti) tehdään server functionissa, jotta CORS-ongelmia ei tule ja logiikka pysyy palvelinpuolella.

## Muutokset

**1. `src/lib/ryhti.functions.ts` (uusi)**
- `haeRyhtiTiedot` createServerFn (`POST`), input: `{ osoite: string, kaupunki?: string | null }`.
- Vaihe 1: Digitransit Geocoding
  `GET https://api.digitransit.fi/geocoding/v1/search?text=<osoite[, kaupunki]>&size=1&layers=address&boundary.country=FIN`
  → poimi `features[0].geometry.coordinates` = `[lon, lat]`.
- Vaihe 2: Ryhti
  `GET https://api.ryhti.fi/koodistot/v1/rakennukset/haku?lat=<lat>&lon=<lon>&radius=50`
  → suodata `kayttotarkoitus`-koodit vain asuinrakennuksiin (asuinpientalot / paritalot / rivitalot; ei autotalleja, saunoja, talousrakennuksia). Jos useita, valitse etäisyydeltään lähin koordinaatista (Haversine).
- Palauta normalisoitu DTO:
  ```
  { rakennusvuosi, pinta_ala, lammitysmuoto,
    julkisivumateriaali, kerroksia, lahde: "ryhti" }
  ```
- Timeout 8 s (`AbortController`) per API-kutsu. Palauta selkeät virhekoodit:
  - `NO_ADDRESS` — Digitransit ei löytänyt osoitetta
  - `NO_BUILDING` — Ryhti ei palauttanut asuinrakennusta
  - `TIMEOUT` / `UPSTREAM_ERROR`

**2. `src/routes/_authenticated/talon-tiedot.tsx`**
- Lisää osoitekentän alle:
  - Outline-nappi teal-värillä, katkoviivareunus: `[🔍 Hae talon tiedot Ryhti-rajapinnasta]`
  - Apuvirke: "Täyttää kodin viralliset perustiedot automaattisesti."
  - Linkki "Mikä Ryhti?" → shadcn `Dialog` info-modaali annetuilla teksteillä.
- Napin klikkaus:
  - Validoi osoite ei tyhjä → muuten `toast.error("Syötä ensin osoite")`.
  - Lataustila: nappi disabled, teksti `⏳ Haetaan tietoja...`, `Loader2` spinner.
  - Kutsu `haeRyhtiTiedot` `useServerFn`-käärittynä.
- Onnistuessa:
  - Esitäytä lomakkeen tila: `rakennusvuosi` (kiinteistöt), `pinta_ala`, `lammitysmuoto`, `julkisivumateriaali`, `kerroksia`. Käytetään vain kenttiä, joihin Ryhti palautti arvon; muihin ei kosketa.
  - Merkitse haetut kentät Setiin `ryhtiFilled: Set<string>`; kentän vieressä pieni vihreä `✓ Ryhti` -badge. Kenttä pysyy normaalisti muokattavana; jos käyttäjä muuttaa arvoa, badge poistuu.
  - `toast.success("✓ Talon tiedot haettu Ryhti-rajapinnasta. Tarkista ja täydennä tarvittaessa.")`
- Virheet:
  - `NO_ADDRESS` / `NO_BUILDING` → "Rakennusta ei löydy tällä osoitteella. Voit täyttää tiedot käsin."
  - `TIMEOUT` / `UPSTREAM_ERROR` → "Ryhti-palvelu ei vastaa juuri nyt. Yritä hetken kuluttua uudelleen tai täytä tiedot käsin."

**3. Kenttäkartoitus (talon_tiedot / kiinteistot -sarakkeisiin)**
| Ryhti | Kotivahti-sarake |
|---|---|
| rakennusvuosi | `kiinteistot.rakennusvuosi` |
| huoneistoala (m²) | `talon_tiedot.pinta_ala` |
| lammitystapa | `talon_tiedot.lammitysmuoto` |
| julkisivumateriaali | `talon_tiedot.julkisivumateriaali` |
| kerrostenlkm | `talon_tiedot.kerroksia` |

`rakennusvuosi` päivittyy jo olemassa olevan `updateKiinteisto`-flown kautta (tai laajennetaan tallennuspayloadia). Muut kentät ovat jo `talonTiedotSchema`ssa.

## Mitä ei muuteta
- Ei uutta migraatiota — kaikki tarvittavat sarakkeet ovat jo tauluissa.
- Ei muutoksia property-switcherin lisäysdialogiin.
- Kentät joita Ryhti ei täytä (katto, IV yms.) jäävät käyttäjän täytettäviksi kuten nyt.

## Riskit / avoimet kohdat
- Ryhti-rajapinnan tarkka URL/parametrit/vastausskeema saattavat poiketa ohjeen esimerkistä. Toteutan mappauksen puolustavasti (optional chaining, tyyppitarkistukset) ja lokitan palvelinpuolella tuntemattomat kenttärakenteet, jotta tarvittaessa hienosäätö on nopeaa.

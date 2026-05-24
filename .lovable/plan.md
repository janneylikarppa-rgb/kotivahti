# Kulut ↔ Huoltohistoria ↔ PTS – reaaliaikainen integraatio

## Yleiskuva

Rakennetaan kolmen näkymän kaksisuuntainen, reaaliaikainen integraatio. Yksi
kirjaus syntyy aina yhteen "primary"-tauluun (kulut TAI huolto_historia) ja
peili toiseen syntyy palvelimella saman kirjauksen yhteydessä. PTS lasketaan
uudesta `pts_suunnitelma`-taulusta, jota palvelin päivittää automaattisesti
joka huolto-/remonttimerkinnän kohdalla. Kaikkialla UI:ssa Supabase Realtime
kuuntelee kolmea taulua aktiivisen kiinteistön osalta ja invalidoi
TanStack Queryn cachen → näkymät päivittyvät ilman sivun latausta.

---

## 1. Tietokantamigraatio

### Uusi taulu `pts_suunnitelma`
- `id`, `kiinteisto_id`, `kohde_avain` (esim. `iv_kone`, `katto_tiili`)
- `kohde_nimi`, `kategoria`
- `kayttoika` (vuotta), `huoltovali` (vuotta), `lahde_vuosi`
- `toimenpide_vuosi` int
- `kiireellisyys` text — laskettu trigger/palvelimessa
- `viimeisin_huolto_vuosi` int null
- `viimeisin_uusiminen_vuosi` int null
- `paivitetty_at` timestamptz default now()
- `oma_rivi` boolean default false (käyttäjän lisäämä vs auto)
- `kuvaus` text null
- RLS: omistaa_kiinteiston(kiinteisto_id) — sama kuin muilla tauluilla
- Unique index `(kiinteisto_id, kohde_avain)` autoriveille

### Lisäkentät olemassa oleviin
- `huolto_historia`:
  - `kohde_avain` text null — yhdistää PTS-kohteeseen
  - `kulu_id` uuid null — peilattu kulu
- `kulut`:
  - `huolto_id` uuid null — peilattu huoltomerkintä
  - `kohde_avain` text null — käytetään PTS-päivitykseen

### Realtime
- `ALTER PUBLICATION supabase_realtime ADD TABLE pts_suunnitelma, huolto_historia, kulut;`
- `REPLICA IDENTITY FULL` näille kolmelle taululle

### Käytetään olemassa olevia
- `pts_rivit` (oma-kohteet) ja `pts_kuitatut` jäävät käyttöön sellaisinaan?
  → **EI**: korvataan nämä uudella `pts_suunnitelma`-taululla.
  Migraatio kopioi vanhat pts_rivit autorivien viereen oma_rivi=true, ja
  pts_kuitatut → asettaa `viimeisin_uusiminen_vuosi`.
- `pts_lykkaykset` poistetaan; lykkäys toteutetaan suoraan
  `toimenpide_vuosi`-arvon kasvatuksena + `kuvaus`-kenttään peruste.

---

## 2. PTS-avainluettelo (`src/lib/pts-kohteet.ts` — uusi)

Yksi totuus PTS-kohteista: avain, nimi, kategoria, käyttöikä, huoltoväli,
funktio `lahdeVuosi(talo)` ja `koskee(talo)`. Sisältää annetut 14 avainta:
`iv_kone, katto_tiili, katto_pelti, katto_huopa, kylpyhuone,
kayttovesi_putket, viemari, lammitys_oljy, lammitys_maalampo,
lammitys_ilmavesi, salaojat, julkisivu_puu, ikkuna, terassi_puu` plus
nykyiset lisät (sähköpatterit, ilp jne.) jotta data ei katoa.

`huolto_kohteet.ts`-kohde-nimet mäpätään `kohde_avain`-arvoon (esim.
"Ilmanvaihtokone" → `iv_kone`).

---

## 3. Server functions (`src/lib/kotivahti.functions.ts`)

### Uudet/päivittyvät:
- `getPts()` → palauttaa `pts_suunnitelma` rivit + täydentää puuttuvat
  autorivit lennossa (idempotentti seed jos talon_tiedot on muuttunut).
  Lasketaan `vuosiaJaljella` palvelimessa. Palauttaa myös
  `talonTiedotPuuttuu`.
- `addKulu()` laajennetaan: jos `linkita_huoltohistoriaan === true`,
  insertoidaan myös `huolto_historia` ja kirjoitetaan kummankin
  rivin viittaukset ristiin. Päivittää PTS:n.
- `addHuolto()` laajennetaan: jos `linkita_kulut === true` ja
  `kustannus > 0`, insertoidaan kulut-rivi ja ristiinviittaus.
  Päivittää PTS:n.
- `deleteHuolto()`/`deleteKulu()` saavat parametrin
  `poista_myos_linkitetty: boolean`. UI kysyy `confirm()`-dialogissa.
- `addPtsRivi()` → kirjoittaa `pts_suunnitelma`-tauluun
  `oma_rivi=true`.
- `lykkaaPtsRivi()` → vaihtaa `toimenpide_vuosi` ja kuvauksen.
- `kuittaaPtsRivi()` → luo huolto_historia (ja kulun jos kustannus > 0) +
  päivittää PTS-rivin viimeisin_uusiminen_vuosi/viimeisin_huolto_vuosi
  + laskee uuden `toimenpide_vuosi`.

### Yhteinen helper: `paivitaPts(supabase, kiinteistoId, kohdeAvain, tyyppi, vuosi, ptsSiirto)`
- nykyVuosi = uuden merkinnän vuosi
- tyyppi `uusiminen` → toimenpide_vuosi = vuosi + käyttöikä − 2,
  viimeisin_uusiminen_vuosi = vuosi
- tyyppi `huolto`/`tarkastus`/`maalaus` → toimenpide_vuosi = vuosi +
  huoltoväli, viimeisin_huolto_vuosi = vuosi (ei kosketa
  uusimissykliä jos vuosi < edellinen+huoltoväli)
- ptsSiirto > 0 → lisää vanhaan toimenpide_vuoteen
- kiireellisyys lasketaan: jäljellä ≤ 0 kiireellinen, ≤ 5 lahivuosina,
  muuten seurannassa.

---

## 4. UI-muutokset

### `src/routes/_authenticated/kulut.tsx`
- KuluLisaaDialog: kun `kategoria === "huolto"`:
  - Toggle "Lisää myös huoltohistoriaan" (oletus päällä)
  - Tyyppi-select (huolto/remontti/tarkastus/uusiminen)
  - Kohde-select (käyttää HUOLTO_KOHDE_RYHMAT)
  - Tekijä radio (itse/ammattilainen) + tekijän nimi + takuu (v)
- Kulut-listalla 🔧-merkki linkitetyille
- Poiston yhteydessä confirm jos `huolto_id` ei null

### `src/routes/_authenticated/huoltohistoria.tsx`
- HuoltoForm: kun kustannus > 0, toggle "Lisää myös kulujenseurantaan"
  (oletus päällä). Jo nykyään luo kulun – nyt riippuu togglesta ja
  tallentaa ristiviittauksen.
- Listalla 💰-summa-merkki (jo on) + indikaattori että linkki kuluun
  olemassa
- Poiston yhteydessä confirm jos `kulu_id` ei null

### `src/routes/_authenticated/pts.tsx`
- Lukee `getPts()`-datan uudesta taulusta, sama UI-skeleema
- Lisätään "Päivitetty juuri nyt" -merkki kortille jos
  `paivitetty_at` < 3s sitten (laskettu clientissä, häviää 3s timerillä)
- Vihreä pulse-animaatio kortin reunalle samalle ajanjaksolle

### Realtime hook (`src/hooks/use-realtime-sync.ts` — uusi)
- Käyttää aktiivisen kiinteistön id:tä (haetaan ensin profiles.valittu_kiinteisto_id tai active kiinteistö serverFn:llä)
- Tilaa 3 taulua filterillä `kiinteisto_id=eq.{id}`
- INSERT/UPDATE/DELETE → `qc.invalidateQueries` kohdistetusti
  (`["kulut"]`, `["huollot"]`, `["pts"]`, `["dashboard"]`)
- Renderöidään `_authenticated.tsx`-layoutissa kerran

---

## 5. Skenaariotestit (manuaaliset)

A. Lisää kulut-sivulla "IV-kanavoiden puhdistus 580€" kohde=Ilmanvaihtokone, tyyppi=huolto
   → huoltohistoriaan ilmestyy rivi; PTS:ssä iv_kone toimenpide_vuosi siirtyy +5v
B. Lisää huoltohistoriaan "Kylpyhuoneremontti 12500€" kohde=Kylpyhuone, tyyppi=uusiminen
   → kuluihin ilmestyy rivi kategoriassa Huolto; PTS:ssä kylpyhuone toimenpide_vuosi = nyt+23v
C. Poista huoltohistoriasta kirjaus jolla `kulu_id` → confirm avaa, valinta poistaa molemmat

---

## Tekniset huomiot

- **Pts_rivit + pts_kuitatut + pts_lykkaykset poistetaan migraatiossa**
  ja korvataan `pts_suunnitelma`-rakenteella. Migration script kopioi
  olemassa olevan datan parhaalla mahdollisella muunnoksella.
- Realtime hyödyntää publication-konfiguraatiota; client tilaa
  `postgres_changes` event="*" filterillä per taulu.
- `getPts()`-funktio ajaa "seed if missing" -logiikan joka kutsulla:
  jos `pts_suunnitelma` ei sisällä kaikkia talon_tiedoista johdettavia
  autoriviavaimia, ne UPSERTataan. Tämä pitää datan ajantasalla kun
  käyttäjä päivittää talon tiedot.
- pts-saannot.ts:n nykyiset auto-rivit ja huoltoErapaiva-logiikka
  korvautuu palvelinpuolen `paivitaPts` + `viimeisin_huolto_vuosi`
  -kentällä. UI:ssa "huoltoErapaiva" lasketaan
  `nyt - viimeisin_huolto_vuosi >= huoltovali`.
- Kategoriat (Lämmitys, Rakenne, Talotekniikka, Sisätilat, Piha)
  säilyvät.
- Vuosikello (`vuosikello.tsx`) käyttää edelleen `getKuitatut` /
  `kuittaaHuolto` -funktioita; nämä ohjataan kirjoittamaan myös
  pts_suunnitelma viimeisin_huolto_vuosi -kenttään.
- `pts-sisaltotekstit.ts` jää, mutta avaimet vaihdetaan
  `kohde_avain`-pohjaisiksi.

## Tiedostot joita muokataan

- **Uudet**: `src/lib/pts-kohteet.ts`, `src/hooks/use-realtime-sync.ts`
- **Migraatio**: 1 SQL-tiedosto
- **Muokattavat**: `src/lib/kotivahti.functions.ts` (server fns),
  `src/lib/pts-saannot.ts` (kevennetään tai poistetaan),
  `src/lib/pts-sisaltotekstit.ts` (avainmuutos),
  `src/routes/_authenticated/kulut.tsx`,
  `src/routes/_authenticated/huoltohistoria.tsx`,
  `src/routes/_authenticated/pts.tsx`,
  `src/routes/_authenticated.tsx` (realtime hook),
  `src/routes/_authenticated/vuosikello.tsx` (PTS-päivitys)
- **Poistetaan käytöstä**: `pts_rivit`, `pts_kuitatut`,
  `pts_lykkaykset` tietomalli (taulut tiputetaan migraatiossa)

## Riskit

- Vanhojen `pts_rivit`/`pts_kuitatut`/`pts_lykkaykset` taulujen
  datasiirto on parasta arvausta — testikäyttäjillä saattaa kadota
  vivahteita lykkäyksissä. Vaihtoehto: jätetään vanhat taulut
  paikalleen lukukelpoisina backupina.
- Aktiivisen kiinteistön vaihto (property-switcher) pitää uudelleentilata
  realtime-kanava — hookin dep-array tarvitsee kiinteisto_id:n.

Hyväksyntäsi jälkeen aloitan: 1) migraatio, 2) server functions,
3) UI-muutokset, 4) realtime-hook, 5) manuaaliset skenaariot.

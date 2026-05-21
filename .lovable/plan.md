## Tavoite

Laajenna `Talon tiedot` -lomake vastaamaan käyttäjän määrittelemää 6 osion rakennetta. Lisää puuttuvat kentät tietokantaan, päivitä lomake ja lisää dokumenttien/takuiden tallennus.

## 1. Tietokantamuutokset (uusi migration)

**`profiles`-tauluun:**
- `puhelin text` (omistajan puhelin)

**`kiinteistot`-tauluun:**
- `hankintatapa text` (ostettu / rakennettu)
- `hankinta_vuosi int`
- Päivitä tyyppi-valikko: lisää `erillistalo`

**`talon_tiedot`-tauluun, uudet sarakkeet:**
- Rakennus: `kokonaispinta_ala numeric`, `perustus text`, `eriste text`, `rakennus_lisatieto text`
- Katto: `katto_pinta_ala numeric`, `hormit text`, `kattoturvatuotteet text`, `kourun_pituus numeric`, `kourun_materiaali text`, `syoksytorvet int`
- Tekniset: `iv_suodatintyyppi text`, `iv_suodatin_vaihdettu date`, `paasulun_sijainti text`, `palovaroittimia int`, `palovaroitin_paristot date`, `kiukaan_vuosi int`, `nuohous_pvm date`
- Ulko: `nurmikon_pinta_ala numeric`, `sadevesikaivot int`, `terassi_pinta_ala numeric`, `terassi_rakennettu_vuosi int`, `salaojat boolean`, `salaojat_tarkastettu date`

**Uusi taulu `talo_dokumentit`:**
- `id uuid pk`, `kiinteisto_id uuid not null`, `nimi text`, `tyyppi text` (dokumentti / takuu / kuitti / lasku), `tiedosto_url text`, `mime text`, `koko_bytes int`, `lisatty_pvm date default current_date`, `kuvaus text`, `created_at`
- RLS: `omistaa_kiinteiston(kiinteisto_id)` kaikkiin operaatioihin

**Uusi storage bucket `talo-dokumentit`** (private) RLS-policyilla (käyttäjä saa kirjoittaa/lukea omiin kansioihinsa = `{kiinteisto_id}/...`).

## 2. Server-funktiot (`src/lib/kotivahti.functions.ts`)

- Laajenna `taloSchema` kaikilla uusilla kentillä (myös profiilin puhelin + hankintatiedot).
- Päivitä `saveTaloTiedot` tallentamaan `profiles.puhelin` ja uudet `kiinteistot`-kentät.
- Lisää: `listDokumentit`, `addDokumentti` (metadata storage-uploadin jälkeen), `deleteDokumentti`.

## 3. Lomake (`src/routes/_authenticated/talon-tiedot.tsx`)

Päivitä OSIOT kuusi väliotsikkoa käyttäjän rakenteen mukaan:

1. **Perustiedot** – sijainti, kiinteistön tyyppi (lisää erillistalo), omistajan nimi/puhelin/email (readonly), hankintatapa + vuosi.
2. **Rakennus** – rakennusvuosi, asuinpinta-ala, kokonaispinta-ala, kerrokset, kantava rakenne, julkisivu, perustus, eriste, lisätietoja.
3. **Katto ja räystäät** – kattotyyppi, materiaali, pinta-ala, asennusvuosi, hormit, kattoturvatuotteet, kourut (pituus/materiaali/syöksytorvet).
4. **Tekniset järjestelmät** – lämmitys (ennallaan) + ilmalämpöpumppu, IV (tyyppi/vuosi/suodatin/viim. vaihto), putket/viemärit + pääsulun sijainti, muut: palovaroittimet kpl + paristot vaihdettu, kiukaan vuosi, nuohous viimeksi, sähköt.
5. **Ulkoalueet** – tontti (pinta-ala, nurmikko, sadevesikaivot), terassi (pinta-ala, materiaali, rakennettu, käsitelty viimeksi), salaojat (kyllä/ei + tarkastettu).
6. **Dokumentit** – uploader (käyttää Lovable Cloud storagea), lista dokumenteista tyypeittäin (dokumentti/takuu/kuitti/lasku) + poisto.

## 4. Mitä EI muuteta

- Olemassa olevia kenttiä ei poisteta (yhteensopivuus huoltohistorian/vuosikellon datan kanssa).
- PTS-logiikka ja vuosikellon dynaamiset huollot säilyvät; uudet kentät voidaan ottaa myöhemmin käyttöön niissä.

## Tekninen huomio

Toteutus tehdään järjestyksessä: 1) migration (odota hyväksyntä), 2) storage bucket + policyt samassa migrationissa, 3) server-fn päivitys, 4) lomakkeen UI, 5) dokumenttien upload-komponentti.

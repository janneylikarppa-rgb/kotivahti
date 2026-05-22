## PTS-suunnitelma (tuotedokumentin osio 4.4)

Rakennetaan PTS-sivu, joka laskee automaattisesti talon tiedoista rakennusosien käyttöiät ja suosittelee toimenpiteitä RT-kortiston taulukoiden mukaan. Käyttäjä saa lisäarvoa kun ennakoivat huollot ja uusimiset nousevat näkyviin – ennen kuin tulee kalliita yllätyksiä.

### 4.4:n ydinlogiikka (suoraan tuotedokumentista)

**Kaava:** `toimenpideVuosi = asennusvuosi + käyttöikä − 2`
(−2 = aloitetaan ennakoiminen kaksi vuotta etukäteen)

**Huoltohistorian vaikutus:** jos kohteelle on huolto, jonka `pts_siirto > 0`, lisätään se vuosiin ennen seuraavaa toimenpidettä.

**Kolme tilaa:**
- 🟢 **Seurannassa** – yli 10 vuotta jäljellä toimenpidevuoteen
- 🟡 **Lähivuosina** – 5–10 vuotta jäljellä
- 🔴 **Kiireellinen** – alle 5 vuotta tai jo ylitetty

### Käyttöikätaulukko (tuotedoku 4.4)

| Kohde | Talon_tiedot-kenttä | Käyttöikä | Huoltoväli |
|---|---|---|---|
| Öljykattila | `lammitys_asennettu_vuosi` (jos `lammitysmuoto`="öljy") | 25 v | 1 v (lakisääteinen) |
| Maalämpöpumppu | `lammitys_asennettu_vuosi` (maalämpö) | 22 v | 2–3 v |
| Ilma-vesilämpöpumppu | `lammitys_asennettu_vuosi` (ilma-vesi) | 18 v | 1 v |
| Ilmalämpöpumppu | `ilp_asennettu_vuosi` | 14 v | 1 v |
| Kaukolämpövaihdin | `lammitys_asennettu_vuosi` (kaukolämpö) | 25 v | 5–10 v |
| Poistoilmalämpöpumppu | `lammitys_asennettu_vuosi` (PILP) | 20 v | 2 v |
| Sähkökattila | `lammitys_asennettu_vuosi` (sähkö) | 25 v | 5 v |
| Sähköpatterit | `lammitys_asennettu_vuosi` (sähköpatterit) | 30 v | tarkastus 5 v |
| IV-kone | `ilmanvaihto_vuosi` | 20 v | 5 v |
| Käyttövesiputkisto | `putket_uusittu_vuosi` | 40 v | 10 v |
| Viemäröinti | `viemari_asennettu_vuosi` | 40 v | 10 v |
| Kylpyhuone/märkätila | (uusi kenttä, alkuvaiheessa rakennusvuosi) | 25 v | 10 v |
| Peltikatto | `katto_uusittu_vuosi` (kattomateriaali=pelti) | 40 v | 5 v |
| Tiilikatto | `katto_uusittu_vuosi` (tiili) | 50 v | 5 v |
| Bitumihuopa | `katto_uusittu_vuosi` (huopa) | 20 v | 3 v |
| Salaojat | `salaojat_tarkastettu` tai rakennusvuosi | 40 v | 5 v |
| Puujulkisivu | `julkisivu_maalattu_vuosi` (puu) | 30 v (maalaus 8–10 v) | maalaus 8–10 v |
| Ikkunat | rakennusvuosi (uusi kenttä myöh.) | 30 v | 10 v |
| Terassi (puu) | `terassi_rakennettu_vuosi` | 20 v | 3 v |

Jos lähdevuotta ei ole, kohde merkitään "Tiedot puuttuvat – täydennä talon tiedot" -tilaan suoralla linkillä `/talon-tiedot`:iin.

### Sisältötekstit per kohde (4.4)

Jokaiselle PTS-kohteelle kolme viestiä, kierrätetään tilan mukaan (sama teksti ei toistu):
- **Viesti 0** (Seurannassa/Lähivuosina): Faktat ja ennaltaehkäisy
- **Viesti 1** (Kiireellinen, ei ylitetty): Riskit ja vakuutuksen rajoitukset
- **Viesti 2** (Pitkään ylitetty): Konkreettiset seuraukset

Tekstit perustuvat dokumentin tilastoihin: 60 000 vesivahinkoa/v, vakuutus ei korvaa pitkäaikaista kosteusvauriota, öljykattilan hajoaminen kovalla pakkasella jne. Tekstit `src/lib/pts-sisaltotekstit.ts`:ään – kategoriat dokumentin mukaan: käyttövesiputket, viemäri, kylpyhuone, öljykattila, maalämpö, ilma-vesilämpöpumppu, IV-kone, peltikatto, tiilikatto, bitumihuopa, julkisivu (puu), salaojat, ikkunat, räystäskourut. (15–20 lyhyttä asiantuntevaa kappaletta, kirjoitetaan ensimmäisessä toteutuksessa.)

### Käyttäjäkokemus

Uusi reitti `/pts` ja navigaatio "PTS-suunnitelma" (ikoni: `ClipboardList`) sivupalkkiin Huoltohistorian jälkeen. Sivun rakenne:

1. **Otsikko + selitysteksti** – "Pitkän tähtäimen suunnitelma seuraavalle 10 vuodelle. Perustuu talosi tietoihin ja RT-kortiston käyttöikätaulukoihin."
2. **Kolme ryhmäkorttia** (dokumentin mukainen ryhmittely): 🔴 Kiireellinen · 🟡 Lähivuosina · 🟢 Seurannassa. Lukumäärä kortin otsikossa.
3. **PTS-kohdekortti** kunkin ryhmän alla:
   - Kohteen nimi + ikoni
   - Suositeltu toimenpidevuosi (esim. "2028")
   - Tila-merkki värikoodilla
   - Sisältöteksti (kierrätetty viesti)
   - Toiminnot: **✓ Kuittaa tehdyksi** · **🔧 Tilaa ammattilainen** (placeholder Vaihe 2 -liidilomakkeelle; tässä vaiheessa avaa modaalin "Tulossa pian")
4. **+ Lisää oma PTS-rivi** – modaalilomake: vuosi (tämä vuosi … +20 v), kohde (Select samasta listasta kuin huoltohistoriassa), kuvaus.
5. **Tyhjä tila** – jos talon tietoja ei ole täytetty: "Täydennä talon tiedot saadaksesi PTS-ennusteet" + nappi `/talon-tiedot`:iin.

Aikajänne: 10 vuotta (käyttäjän valinta). Oletustila auki = Kiireellinen-ryhmä. Eurom­ää­räi­set arviot jätetään tästä vaiheesta pois.

### Kuittaus → huoltohistoria

Kun käyttäjä klikkaa "Kuittaa tehdyksi":
- Avautuu pikamodaali: pvm (oletus tänään), tekijä (Itse/Ammattilainen), tekijän nimi, kustannus (vapaaehtoinen), kuvaus
- Lähetys luo `huolto_historia`-rivin (tyyppi="huolto", kategoria="PTS", kohde, pvm, kustannus, kuvaus, **`pts_siirto` = kohteen huoltoväli vuosina** – siirtää automaattisesti seuraavan suosituksen)
- Auto-rivit kirjataan `pts_kuitatut`-tauluun jotta sama rivi ei näy enää
- Omat rivit poistetaan `pts_rivit`-taulusta
- Jos kustannus > 0, sama summa menee `kulut`-tauluun (kuten huoltohistoriassa)

### Tekninen toteutus

**Tietokantamuutos** (yksi migraatio):

```sql
-- Käyttäjän omat PTS-rivit
CREATE TABLE public.pts_rivit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiinteisto_id uuid NOT NULL,
  vuosi int NOT NULL,
  kohde text NOT NULL,
  kuvaus text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pts_rivit ENABLE ROW LEVEL SECURITY;
-- 4 policy: select/insert/update/delete USING omistaa_kiinteiston(kiinteisto_id)

-- Kuitatut auto-rivit (jottei toistu)
CREATE TABLE public.pts_kuitatut (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiinteisto_id uuid NOT NULL,
  kohde text NOT NULL,
  historia_id uuid,
  kuitattu_pvm date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (kiinteisto_id, kohde)
);
ALTER TABLE public.pts_kuitatut ENABLE ROW LEVEL SECURITY;
-- 4 policy samoin omistaa_kiinteiston-tarkistuksella

CREATE INDEX idx_pts_rivit_kiinteisto ON public.pts_rivit(kiinteisto_id);
CREATE INDEX idx_pts_kuitatut_kiinteisto ON public.pts_kuitatut(kiinteisto_id);
```

**Uudet tiedostot:**
- `src/lib/pts-saannot.ts` – käyttöikätaulukko + `generoiPtsRivit(talo, huollot, kuitatut)` -funktio. Kaava `vuosi + käyttöikä − 2`, pts_siirto yhteenlasku, suodatus 10 vuoden ikkunaan.
- `src/lib/pts-sisaltotekstit.ts` – kohdekohtaiset viestit (3 viestiä × ~15 kategoriaa).
- `src/routes/_authenticated/pts.tsx` – sivu (loader → `ensureQueryData`, gate `beforeLoad` Supabase-sessiolle).

**Päivitettävät tiedostot:**
- `src/lib/kotivahti.functions.ts` – uudet serverFn:t:
  - `getPts()` – palauttaa `{ ryhmat: { kiireellinen, lahivuosina, seurannassa }, talonTiedotPuuttuu }`. Hakee `talon_tiedot`, `huolto_historia`, `pts_rivit`, `pts_kuitatut`, generoi auto-rivit, yhdistää omat, suodattaa kuitatut, ryhmittelee tilan mukaan.
  - `addPtsRivi({ vuosi, kohde, kuvaus })`
  - `deletePtsRivi({ id })`
  - `kuittaaPtsRivi({ kohde, lahde, rivi_id?, pvm, tekija, tekija_nimi?, kustannus, kuvaus? })` – luo huolto_historia-rivin (pts_siirto = kohteen huoltoväli), kulut-rivin jos kustannus > 0, pts_kuitatut-merkinnän auto-riveille, poistaa pts_rivit-rivin omille.
- `src/components/app-sidebar.tsx` – lisää "PTS-suunnitelma" Huoltohistorian jälkeen.
- `src/routes/_authenticated/dashboard.tsx` – täydennetään "PTS-preview" -kortti (tuotedoku 4.1): 3 kiireisintä → klikkaus vie `/pts`:lle. (Tämä on luonnollinen jatko, mutta voidaan tehdä erillisenä kierroksena.)
- `.lovable/plan.md` – päivitetään PTS valmiina.

### Toteutusjärjestys

1. **Migraatio** – `pts_rivit` + `pts_kuitatut` + RLS-politiikat
2. **Logiikkamoduulit** – `pts-saannot.ts` (taulukko + generointi) ja `pts-sisaltotekstit.ts`
3. **ServerFn:t** – `getPts`, `addPtsRivi`, `deletePtsRivi`, `kuittaaPtsRivi`
4. **PTS-sivu** – `/pts` reitti, kolme ryhmäkorttia, kohdekortti, kuittausmodaali, lisäysmodaali
5. **Navigaatio** – sivupalkkiin uusi kohta
6. **Dashboard PTS-preview** (valinnainen tässä vaiheessa)

### Mitä jätetään pois tästä vaiheesta

- **Eurom­ää­räi­set arviot** – ei tässä iteraatiossa (käyttäjän valinta). Lisätään myöhemmin yhdessä Kulut-ennakointiosion kanssa (tuotedoku 4.5).
- **Liidilomake "Tilaa ammattilainen"** – placeholder-nappi, varsinainen lomake tulee Vaihe 2:ssa tuotedokun mukaan.
- **PDF-vienti / myyntiraportin PTS-osio** – kuuluu 4.8 Myyntiraporttiin, tehdään erikseen.
- **Useamman kiinteistön PTS-vertailu** – yksi kiinteistö kerrallaan riittää MVP:ssä.

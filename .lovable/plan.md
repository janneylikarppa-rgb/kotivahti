Yhdistetty suunnitelma: nykytilan tarkastus + ydinprosessin 3-vaiheinen palauteketju (korvaa entiset liidi-kyselyt P1 ja P2).

## OSA A — Nykytilan tarkastus

### 1. Tietokanta
**TEHTY** — `palaute_kyselyt` ja `kayttaja_metriikat` molemmat olemassa kaikilla suunnitelman kentillä. Ekstrana `kirjautumisia` ja `nps_annettu_at` (eivät häiritse).

### 2. Automaattiset metriikat — KRIITTINEN PUUTE
RPC `inkrementoi_metriikka` ja helper `inkrementoiMetriikka` ovat olemassa, mutta niitä ei kutsuta käytännössä mistään:

| Tapahtuma | Status |
|---|---|
| Kirjautuminen → `viimeisin_kirjautuminen` | TEHTY (`_authenticated.tsx`) |
| Talon tiedot → `talon_tiedot_taytetty` | **PUUTTUU** |
| PTS-sivu → `pts_avattu` (fn olemassa, ei kutsujaa) | **PUUTTUU** |
| Liidi → `liideja_lahetetty` | **PUUTTUU** |
| Huolto → `huoltoja_kirjattu` | **PUUTTUU** |
| Vuosikello → `vuosikelloa_kuitattu` | **PUUTTUU** |

Ilman näitä konversioputki, segmentit ja triggerit P3–P6 toimivat vajaasti.

### 3. In-app kysely-UI
- Kortin sijainti, sulje-nappi, värit (#142A1A + kulta), animaatio, yksi kerrallaan: TEHTY.
- Max-leveys 360 px (suunnitelma 340), border-radius 12 px OK: EROAA kosmeettisesti.
- "Kiitos palautteesta! 🙏" 2 s viive ennen sulkemista: EROAA — nyt toast + heti kiinni.

### 4. Kuusi kyselytyyppiä
- **P1 liidi_yhteydenotto** ja **P2 liidi_tulos** → poistetaan ja korvataan **ydinprosessin kolmella vaiheella** (OSA B). Vanhoja tyyppejä ei lähetetä enää uusille liideille.
- **P3 tyonlaatu** EROAA: suosittelu-kysymys puuttuu. Tämä jää käytöstä, koska ydinprosessin vaihe 3 kattaa saman.
- **P4 onboarding** EROAA: nyt yksi monivalinta, suunnitelmassa 3 kysymystä (helppous, ensivaikutelma-tähdet, vapaa toive).
- **P5 nps** EROAA: vapaa "miksi?"-textarea puuttuu.
- **P6 churn** EROAA: suunnitelma vaatii monivalinnan 5 vaihtoehtoa + "muu syy" textarea; nyt 3-valinta single choice.

### 5. Kausikirjeet
- Sisältö, ehdot, peruutuslinkki, token, anonyymi vastaus, kausikohtaiset kysymykset: TEHTY.
- pg_cron **EROAA**: kevät/kesä/syksy ajetaan kuukauden **15.** päivä — suunnitelma vaatii **1.** päivä. Talvi 1.12. on oikein.
- Follow-up "kesken" + 7pv: sähköpostipohja olemassa, **lähetyslogiikkaa ei ole** → PUUTTUU.

### 6. Käyttäjän asetukset
- Kausimuistutus-toggle olemassa talon-tiedot-sivulla, oletus päällä: TEHTY.

### 7. Admin – Palaute-välilehti
- Välilehti, NPS-kortit, segmentit, vastaukset-lista, ammattilaisten tähtikeskiarvot, kausikirje-tilastot + testilähetys: TEHTY backendissä. UI-renderöinti per kortti tarkistetaan korjausvaiheessa.

---

## OSA B — Ydinprosessin 3-vaiheinen palauteketju (uusi)

Korvaa entiset `liidi_yhteydenotto` ja `liidi_tulos`. Vanhat tyypit jäävät tauluun historiana mutta uusia ei luoda.

### B1. Tietokantamuutokset (yksi migraatio)
1. Lisää `ammattilaiset`-tauluun:
   - `keskiarvopisteet numeric(3,2)` nullable
   - `arviomaara integer not null default 0`
   - `viimeisin_arvio timestamptz` nullable
2. Lisää `liidit`-tauluun valinnaisesti `ammattilainen_id uuid` (FK `ammattilaiset.id`, nullable) — jos sitä ei ole jo, tämä tarvitaan ammattilaisen tunnistamiseen ranking-laskennassa ja omistajan hälytys-sähköpostissa.
3. Uusi tauluton funktio `paivita_ammattilainen_pisteet(_amm_id uuid)`: laskee painotetun pistemäärän vaiheen-3 vastauksista (vain jos ≥ 3 vastausta) ja päivittää `ammattilaiset`-rivin.

### B2. Uudet kyselytyypit `palaute_kyselyt.tyyppi`-kentässä
- `ydinprosessi_yhteydenotto`
- `ydinprosessi_kaynnin_jalkeen`
- `ydinprosessi_kokonaiskokemus`

`trigger_id` = `liidit.id`. Tyypit ovat kovakoodattu sovelluksessa, ei skeemamuutosta tarvita.

### B3. Vaiheen 1 trigger (vaihe 1: yhteydenotto)
Päivitä `haeAktiivinenKysely` luomaan rivi kun:
- `liidi.lahetetty_at <= now() - 3 arkipäivää`
- ei aikaisempaa `ydinprosessi_yhteydenotto`-riviä samalle liidille

Kysymys + 4 vaihtoehtoa kuten suunnitelmassa. Vastaus tallentuu `vastaukset.yhteydenotto`.

**Eskalaatio:** Jos vastaus on `ei_ollenkaan` tai `ei_viela`, ajastetaan 2 päivän tarkistus. Käytännössä:
- Vastauksen tallennushetkellä tallennetaan vastaus normaalisti.
- Päivittäinen cron `/api/public/hooks/ydinprosessi-eskalointi` etsii `ydinprosessi_yhteydenotto`-vastaukset joissa yhteydenotto ∈ {`ei_ollenkaan`,`ei_viela`}, vastattu yli 2 pv sitten, eikä uutta positiivista vastausta tullut → lähettää OWNER_EMAIL-hälytyksen "⚠️ KIIREELLINEN – Ammattilainen ei reagoinut – [kategoria] – [kaupunki]" sisältäen asiakkaan tiedot, ammattilaisen ja kuluneet päivät. Hälytyslippu tallennetaan `vastaukset.halytys_lahetetty_at` ettei lähde toista kertaa.

### B4. Vaiheen 2 trigger (käynti)
Luodaan kun:
- `ydinprosessi_yhteydenotto` vastattu, vastaus `kylla_*`
- vastattu yli 7 pv sitten
- vaihetta 2 ei vielä luotu samalle liidille

Kysymykset K1–K3 suunnitelman mukaan. Tähdet 1–5, vapaa textarea.

**Kriittinen hälytys:** Jos K1 = `ei_kaynyt_ei_ilmoittanut`, lähetä heti OWNER_EMAIL aiheella "🚨 KRIITTINEN – …" `lahetaKyselyVastaus`-handlerista (sama mekanismi kuin nyt P1:n hälytyksessä, eri otsikko).

### B5. Vaiheen 3 trigger (kokonaiskokemus)
Luodaan kun:
- `ydinprosessi_kaynnin_jalkeen` K1 = `kyllä_kävi_sovitusti`
- vastattu yli 5 pv sitten
- vaihetta 3 ei vielä luotu

Kysymykset K1–K7 suunnitelman mukaan (tähdet, monivalinnat, vapaa textarea).

**Pisteytyksen päivitys:** vastauksen tallennushetkellä haetaan `liidi.ammattilainen_id`. Jos olemassa, kutsutaan `paivita_ammattilainen_pisteet(amm_id)`. Painotettu kaava:
```
arvio = K1×0.40 + K5×0.30 + K2(=vaihe2 K2)×0.15 + K3×0.15
```
- K1 ja vaihe-2 K2 ovat suoraan 1–5.
- K5 (suosittelu, 5 vaihtoehtoa) mapataan 5→ehdottomasti, 4→todennäköisesti, 3→en osaa sanoa, 2→en todennäköisesti, 1→ei missään tapauksessa.
- K3 (aikataulu, 4 vaihtoehtoa) mapataan 5→täysin, 4→lähes, 2→merkittävä viive, 3→ei sovittu selkeää.

Päivitys vain jos vastauksia on ≥ 3 kpl.

### B6. UI – `palaute-kortti.tsx`
Lisää kolme uutta `KyselySisalto`-haaraa:
- `ydinprosessi_yhteydenotto` → 4-valintainen ChoiceKysely.
- `ydinprosessi_kaynnin_jalkeen` → erikoiskomponentti: yksi monivalinta + tähdet 1–5 + vapaa textarea.
- `ydinprosessi_kokonaiskokemus` → monisivuinen lomake (K1 tähdet, K2–K6 valinnat, K7 textarea). Tallennetaan yhtenä jsonb:nä, ei sivutusta — pelkkä pitkä lomake "Lähetä"-napilla. 

Vanhat `liidi_yhteydenotto`/`liidi_tulos`-haarat säilyvät renderöintiä varten historiarivien tapauksessa (tarvitaanko? — admin-vastaukset listaa vain dataa, ei renderöi näitä uudelleen kyselynä, joten haarat voi poistaa). 

### B7. Admin – Palaute-välilehden Ydinprosessi-osio
Uusi server-fn `getYdinprosessiMittarit` palauttaa:
- yhteydenottoprosentti = (vaihe1 vastattu "kyllä_*" / kaikki liidit joilla `lahetetty_at` ≥ 3 arkipäivää sitten)
- käyntiprosentti = (vaihe2 K1=`kylla_kavi` / vaihe1-kylläiset)
- tyytyväisyys = (vaihe3 K6=`taysin` / käyntien lkm)

Uusi server-fn `getAmmattilaisRanking` palauttaa: nimi, pisteet, arviomaara, trendi (= viim. 90pv keskiarvo vs. sitä edeltävät 90pv).

Admin-UI:hin lisätään:
- 3 mittarikorttia
- Ranking-taulukko, alle 3.0 pisteen rivit punaisella.
- Liidit-listan muutos: korvaa nykyiset V1/V2-sarakkeet kolmella V1/V2/V3-statussolulla. Värikoodaus:
  - Vihreä = positiivinen vastaus
  - Oranssi = kysely luotu mutta ei vastattu, tai vastaus "ei vielä"
  - Punainen = "ei ollenkaan" / "ei käynyt" / matalat tähdet / negatiiviset valinnat

### B8. Migraatiopolku vanhasta
- `getLiidiPalautteet` korvataan `getYdinprosessiLiidiStatukset`-funktiolla joka lukee uusia tyyppejä. Vanhat `liidi_yhteydenotto`/`liidi_tulos`-rivit voidaan UI:ssa näyttää historiana mutta admin-mittareihin lasketaan vain uudet ydinprosessi-tyypit. (Vaihtoehto: backfill skripti joka muuntaa vanhat → uusiin tyyppeihin; ohitetaan toistaiseksi, koska aktiivista käyttöä on vähän.)

---

## OSA C — Korjauslista prioriteettijärjestyksessä

1. **Migraatio:** ammattilaiset-pisteet-sarakkeet, mahdollinen `liidit.ammattilainen_id`, `paivita_ammattilainen_pisteet`-funktio.
2. **Metriikkakytkennät** (5 kohtaa: talon tiedot, pts-avaus, liidi, huolto, vk-kuittaus) — kutsu `inkrementoiMetriikka` jokaisessa relevantissa server-funktiossa.
3. **Kausikirjeiden cron** kevät/kesä/syksy → `0 9 1 4/6/9 *`.
4. **`haeAktiivinenKysely`-refaktorointi**: poista P1/P2-luonti, lisää kolme ydinprosessi-vaihetta.
5. **Vastaustenkäsittely** `lahetaKyselyVastaus`: vaihe 2 → kriittinen hälytys jos `ei_kaynyt_ei_ilmoittanut`; vaihe 3 → kutsu `paivita_ammattilainen_pisteet`.
6. **Cron `/api/public/hooks/ydinprosessi-eskalointi`** päivittäin: vaihe-1 ei-vastausten 2 pv tarkistus + hälytys.
7. **Cron `/api/public/hooks/kausikirje-followup`** päivittäin: "kesken"-vastausten 7 pv follow-up.
8. **`palaute-kortti.tsx`** kolme uutta kysely-UI:ta + onboardingin/NPS:n/churn-kysymysten korjaus suunnitelman mukaiseksi + "Kiitos palautteesta! 🙏" 2 s viiveellä.
9. **Admin-välilehti:** Ydinprosessi-osio (3 mittaria, ranking, V1/V2/V3-statussolut liideissä) + NPS-laskennan UI:n tarkistus + Vastaukset-modaali jossa vapaa sana näkyvissä.
10. Kosmetiikka: kortin max-leveys 340, omistajahälytys-sähköpostiin "Kenelle ammattilainen välitetty" -kenttä.

## Mitä EI tehdä
- Ei muuteta `palaute_kyselyt`-skeemaa eikä RLS:ää.
- Ei kosketa kausikirjeen HTML-pohjia (kohtien 1–7 ulkopuolella).
- Ei poisteta vanhoja `liidi_yhteydenotto`/`liidi_tulos`-rivejä — jäävät historiaan.
- Ei muutosta NPS-laskentakaavaan eikä suostumus-toggleen.

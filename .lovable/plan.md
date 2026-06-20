# Talon tietojen viilaus

Kolme erillistä parannusta `src/routes/_authenticated/talon-tiedot.tsx`:n ja PTS-katalogin alueella.

## 1. Yhdistetty tallennus (kaikki välilehdet kerralla)

Nykytilanne: jokainen välilehti pitää tallentaa erikseen "Tallenna ja merkitse valmiiksi" -napilla, ja "Tallenna tiedot" -nappi yläreunassa tallentaa vain aktiivisen välilehden kenttien tilan (koska `t`, `k`, `p` -state on jo kaikkien yhteinen — mutta `valmiit_osiot` ei päivity muille kuin aktiiviselle).

Muutos:
- `buildPayload` ottaa nykyisten kenttien lisäksi vapaaehtoisen `merkitseKaikkiValmiiksi`-lipun. Kun se on `true`, `valmiit_osiot` asetetaan kaikiksi `OSIOT.key`-arvoiksi paitsi `"dokumentit"` (dokumentit-välilehti ei ole "täytettävä").
- Autotallennus (60 s safety-net + blur) jatkaa nykyistä toimintaa — ei merkitse osioita valmiiksi, vain tallentaa kenttien arvot.
- Yläreunan "Tallenna tiedot" -nappi → kutsuu `save.mutate({ merkitseKaikkiValmiiksi: true })` ja antaa toastin "Kaikki välilehdet tallennettu". Nappi nimetään muotoon **"Tallenna kaikki välilehdet"**.
- Välilehden alalaidan "Tallenna ja merkitse valmiiksi" säilyy (merkitsee vain kyseisen osion). Tämä antaa edelleen mahdollisuuden tallentaa yksittäin haluttu osio jos käyttäjä haluaa edetä step-by-step.
- Autotallennus muuttuu vielä niin, että se tallentaa kaikkien välilehtien kenttäarvot (tämä jo tapahtuu, koska state on jaettu — mutta varmistetaan että `buildPayload()` ilman argumentteja sisällyttää kaikki).

## 2. Kiinteistön vaihto päivittää lomakkeen heti

Nykytilanne (rivi 110–127): `initDone.current` -lippu estää lomaketta uudelleenhydratoitumasta, kun `["talo"]`-query refetchaa kiinteistön vaihdon jälkeen. Käyttäjän on poistuttava sivulta ja palattava takaisin.

Muutos:
- Korvataan `initDone.current` -tarkistus vertailulla `data.kiinteisto?.id`:hen — talletetaan `useRef`-muuttujaan viimeksi hydratoitu kiinteistön id, ja jos uusi id eroaa, hydrataan uudelleen (resetoidaan `k`, `t`, `p`, `valmiit`, `active=0`, `hydrated.current=false` jne.).
- `hydrated.current` palautetaan asynkronisesti `setTimeout(50ms)`-blokin jälkeen, jotta heti hydraation jälkeen tapahtuva blur ei laukaise tarpeetonta tallennusta.
- Varmistetaan että ennen uuden kiinteistön hydraatiota pending-autotallennus ei kirjoita uuden kiinteistön päälle: peruutetaan `setInterval` ja flushataan vain jos `hydrated.current && lastHydratedId === current`.

## 3. Päälämmitysmuotojen laajennus + komponenttien käyttöiät

Nykyinen `LAMMITYS`-lista on litteä (maalämpö, ilmavesilämpö, ilmalämpöpumppu, kaukolämpö, öljy, pelletti, puu, sähkölämmitys, muu). Käyttäjän pyytämä rakenne tuo päälämmitysmuodon **alle** lämmönjakotavan ja komponenttien tiedot.

### 3a. Lämmitysmuotolista pidetään yhteensopivana, mutta lisätään tarkennukset
Säilytetään nykyiset `lammitysmuoto`-avaimet (yhteensopivuus PTS-katalogin ja `MERKIT`-mapin kanssa), ja lisätään `keskuslammitys`. Päälämmitysmuodot valintalistassa:
- `maalampo` — Maalämpö
- `kaukolampo` — Kaukolämpö
- `ilmavesilampo` — Ilma-vesilämpö
- `sahkolammitys` — Suora sähkölämmitys
- `keskuslammitys` — Keskuslämmitys (kattila + vesikiertoinen lämmönjako) **UUSI**
- `ilmalampopumppu` — Ilmalämpöpumppu (pää)
- `muu` — Muu

(`oljylammitys`, `pellettilammitys`, `puulammitys` poistetaan listasta päälämmitysmuotona — ne tulevat **keskuslämmityksen kattilatyypin** alta. Olemassa olevat rivit, joilla on `oljylammitys` ym., säilyvät tietokannassa eikä migraatiota ajeta — UI näyttää valitun arvon read-onlyna jos avain ei ole listassa.)

### 3b. Lämmönjako ja komponentit `lammitys_lisatieto`-JSONiin

Kenttä `lammitys_lisatieto` (jsonb) on jo olemassa ja siellä on `merkki` ja `malli`. Laajennetaan se sisältämään uudet alikentät — ei vaadi tietokantamigraatiota.

**Keskuslämmitykselle (`keskuslammitys`)** näytetään lisäkysymykset:
- Kattilatyyppi: puu, sähkö, pelletti, öljy → `lammitys_lisatieto.kattila_tyyppi`
- Kattilan merkki + malli → `lammitys_lisatieto.kattila_merkki / kattila_malli` (merkkilistat eri kattilatyypeille jo olemassa `MERKIT`-mapissa, hyödynnetään)
- Kattilan asennusvuosi → `lammitys_lisatieto.kattila_asennettu_vuosi`
- Lämmönjako: vesikiertoiset patterit / lattialämmitys / molemmat → `lammitys_lisatieto.lammonjako`
- Lämmitysputkiston materiaali: rauta / kupari / muovi (musta/harmaa/kirkas) / komposiitti → `lammitys_lisatieto.putki_materiaali`
- Putkiston asennusvuosi → `lammitys_lisatieto.putki_asennettu_vuosi`

**Kaukolämmölle, maalämmölle, ilma-vesilämmölle** näytetään (nykyisen merkki/malli lisäksi):
- Lämmönjako: vesikiertoiset patterit / lattialämmitys / molemmat → `lammitys_lisatieto.lammonjako`
- Lämmitysputkiston materiaali ja asennusvuosi (sama lista kuin yllä)

**Suoralle sähkölämmitykselle (`sahkolammitys`)** näytetään:
- Sähköpattereiden asennusvuosi → `lammitys_lisatieto.sahkopatteri_asennettu_vuosi`
- Lämminvesivaraajan merkki, malli, asennusvuosi → `lammitys_lisatieto.lvv_merkki / lvv_malli / lvv_asennettu_vuosi`

### 3c. PTS-kohteet uusille komponenteille (`src/lib/pts-kohteet.ts`)

Lisätään uudet rivit, jotka käyttävät `lammitys_lisatieto`-alikenttiä lähdevuotena. Käyttöiät vastaavat alan suosituksia (KH-kortit, Energiateollisuus, RT-ohjekortit, asennusliikkeiden suositukset). Lähdetään luonnollisista arvoista:

| Avain | Nimi | Käyttöikä | Huoltoväli | Lähdevuosi |
|---|---|---|---|---|
| `keskus_kattila_puu` | Keskuslämmityskattila (puu) | 30 | 1 | `lammitys_lisatieto.kattila_asennettu_vuosi` |
| `keskus_kattila_oljy` | Keskuslämmityskattila (öljy) | 25 | 1 | sama |
| `keskus_kattila_pelletti` | Keskuslämmityskattila (pelletti) | 25 | 1 | sama |
| `keskus_kattila_sahko` | Keskuslämmityskattila (sähkö) | 25 | 5 | sama |
| `lammitysputki_rauta` | Lämmitysputkisto (teräs/rauta) | 40 | 10 | `lammitys_lisatieto.putki_asennettu_vuosi` ?? rak.vuosi |
| `lammitysputki_kupari` | Lämmitysputkisto (kupari) | 50 | 10 | sama |
| `lammitysputki_muovi` | Lämmitysputkisto (muovi) | 50 | 10 | sama |
| `lammitysputki_komposiitti` | Lämmitysputkisto (komposiitti) | 50 | 10 | sama |
| `sahkopatterit_suora` | Sähköpatterit (suora sähkölämmitys) | 30 | 5 | `lammitys_lisatieto.sahkopatteri_asennettu_vuosi` |
| `lvv_suora` | Lämminvesivaraaja | 25 | 5 | `lammitys_lisatieto.lvv_asennettu_vuosi` |
| `lattialammitys` | Vesikiertoinen lattialämmitys | 50 | 10 | `lammitys_lisatieto.putki_asennettu_vuosi` ?? rak.vuosi (kun `lammonjako` sisältää "lattia") |

`koskee`-funktio tarkistaa: (a) onko `lammitysmuoto` oikea, (b) onko `lammitys_lisatieto`-alikenttä asetettu (esim. kattilatyyppi tai putkimateriaali sisältää oikean alimerkin).

Nykyiset `lammitys_sahkopatterit`-rivin ehto laajennetaan tunnistamaan myös `sahkolammitys`-päälämmitysmuoto.

### 3d. `huolto-infot.ts`-lisätiedot uusille PTS-kohteille
Lisätään `miksi / miten / milloin_ammattilainen / vinkki` -tekstit kaikille uusille riveille, samalla tyylillä kuin olemassa olevissa. Lähteet: KH-kortit, Energiateollisuus, valmistajien manuaalit.

## Tiedostotaulukko

| Tiedosto | Muutos |
|---|---|
| `src/routes/_authenticated/talon-tiedot.tsx` | (1) yhdistetty tallennus, (2) kiinteistön vaihdon reaktiivisuus, (3b) UI-lohkot keskuslämmitykselle, suoralle sähkölle ja lämmönjaolle/putkimateriaalille |
| `src/lib/pts-kohteet.ts` | Uudet PTS-rivit (3c) + `lammitys_sahkopatterit`-ehdon laajennus |
| `src/lib/huolto-infot.ts` | Lisätietopaketit uusille kohteille (3d) |

Ei tietokantamigraatiota — `lammitys_lisatieto` on jo `jsonb`. Olemassa olevat tiedot säilyvät.

## Tarkennukset (vahvistettavissa toteutuksen yhteydessä)

- Pidetäänkö `oljylammitys / pellettilammitys / puulammitys` -arvot vielä päälämmitysmuoto-listassa "legacy-yhteensopivuus"-otsikon alla, vai siirretäänkö ne automaattisesti keskuslämmitykselle, jos tietokannassa on vanha arvo? Ehdotus: näytetään valittuna read-onlyna ja kehotetaan käyttäjää siirtymään `keskuslammitys + kattila_tyyppi` -malliin (ei pakoteta).
- Lämmönjako-vaihtoehdot: "vesikiertoiset patterit / vesikiertoinen lattialämmitys / molemmat / muu"? Vahvistetaan toteutusvaiheessa.

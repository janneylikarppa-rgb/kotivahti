## Tavoite

Kriittiset korjaukset ydinprosessin palauteketjuun ja viimeistely ennen julkaisua. Käydään läpi nostamasi listat: KRIITTINEN → TÄRKEÄ → ENNEN JULKAISUA.

## KRIITTINEN (tehdään ensin)

### 1. `liidit.ammattilainen_id` – tila

Tarkastettu: kenttä **on jo olemassa** (uuid, lisättiin aiemman migraation yhteydessä). Funktio `paivita_ammattilainen_pisteet(_amm_id)` käyttää sitä. Ei muutoksia tarpeen tähän.

**Avoin asia:** kenttää ei tällä hetkellä täytetä mihinkään liidiä luotaessa — pisteytys ei käynnisty. Lisätään liidi-luontiin valinnainen `ammattilainen_id`-arvo, kun liidi välitetään valitulle ammattilaiselle (jos välityskohde on `ammattilaiset`-rivistä, asetetaan id; muutoin jätetään null ja vain pisteytys ohitetaan). Päivitetään `luoLiidi`/`valitaLiidi`-server-funktio kirjoittamaan `ammattilainen_id`.

### 2. K2-viittauksen selkeytys pisteytyksessä

Nykyinen `paivita_ammattilainen_pisteet`-SQL hakee `K2 = kommunikointi`-tähdet **vaiheen 2** vastauksesta (`ydinprosessi_kaynnin_jalkeen.vastaukset->>'kommunikointi'`) ja muut painot (K1 työn laatu, K5 suosittelu, K3 aikataulu) **vaiheen 3** vastauksesta. Tämä on suunnitelman mukainen, mutta funktion kommentit ovat sekaisin.

Korjaus: dokumentoidaan SQL-funktioon selkeästi:
- K1 = vaihe3 `tyo_laatu` (paino 0.40)
- K5 = vaihe3 `suosittelu` (paino 0.30)
- K2 = vaihe2 `kommunikointi` (paino 0.15)
- K3 = vaihe3 `aikataulu` (paino 0.15)

Ei loogista muutosta, vain kommentit + säilytetään nykyinen vaiheen 2 LATERAL-haku samalle liidille.

### 3. Vaiheen 3 trigger kaikille positiivisille K1-vastauksille

Nyt vaiheen 3 kysely lähetetään VAIN jos vaiheen 2 vastaus on `kavi === "kylla_kavi"`. Suunnitelma: lähetetään kaikille positiivisille K1:lle eli **myös** `sovittu_ei_viela`. Negatiiviset (`peruutettiin`, `ei_kaynyt_ei_ilmoittanut`) eivät triggeröi vaihetta 3.

Muutos `haeAktiivinenKysely`-funktiossa:
```
if (!["kylla_kavi","sovittu_ei_viela"].includes(v2.vastaukset?.kavi)) continue;
```
Lisäksi: kun K1 = `sovittu_ei_viela`, odotetaan **vaiheen 3 ajastusta** pidempään (esim. 14 päivää, jotta käynti on todennäköisesti tapahtunut). `kylla_kavi` → 5 pv (nykyinen).

## TÄRKEÄ

### 4. Arkipäivälaskenta → kalenteripäivät (4–5 pv)

Nykyinen `arkipaiviaSitten(ts, 3)` käyttää approksimaatiota `ceil(3 * 1.4) = 5` kalenteripäivää. Vaihdetaan suoraviivaiseksi: `paivaSitten(ts, 5)` ja poistetaan `arkipaiviaSitten`-helper. Vaiheen 1 kommentti: "3 arkipäivää (≈ 5 kalenteripäivää) liidin välityksestä".

Samoin `ydinprosessi-eskalointi`-hook käyttää tällä hetkellä 2 päivän ikkunaa — säilytetään 2 kalenteripäivänä vastauksen jälkeen, mutta kommentoidaan auki.

### 5. Kausikirjeen follow-up "kesken" + 7 pv

Lähetyslogiikka puuttuu. Tehdään:

- Uusi route `src/routes/api/public/hooks/kausikirje-followup.ts`
  - Hakee `palaute_kyselyt`-riveistä `kausikirje_*`-kyselyt joissa `vastaukset->>'tila' = 'kesken'` JA `vastattu_at <= now() - 7 days` JA `followup_lahetetty_at` (uusi kenttä `meta.followup_at`) tyhjä.
  - Lähettää sähköpostimuistutuksen (käyttää olemassa olevaa kausikirje-mailerin "kesken-muistutus"-pohjaa; lisätään pohja jos puuttuu).
  - Tallentaa `vastaukset->>'followup_at' = now()` ettei lähetetä uudestaan.
- Cron `cron.schedule('kausikirje-followup', '0 10 * * *', ...)` → POST `https://project--<id>.lovable.app/api/public/hooks/kausikirje-followup` `apikey`-headerillä.

### 6. Onboarding kolme kysymystä suunnitelman mukaan

Nykyinen `OnboardingKysely` sisältää: aloituksen helppous (3 vaihtoehtoa), ensivaikutelma (5★), vapaa toive. Suunnitelmassa **3 erillistä kysymystä**:

1. **Oliko aloittaminen helppoa?** (todella_helppo / melko_helppo / vaikeaa) — säilytetään
2. **Ensivaikutelma sovelluksesta** (1–5★) — säilytetään
3. **Mitä toivoisit lisää?** (textarea) — nyt valinnainen, tehdään pakolliseksi tai vähintään näkyväksi pää-kysymyksenä otsikolla

Muutos: nostetaan kolmas kysymys omaksi otsikoiduksi blokiksi ("Mitä toivoisit Kotivahdilta lisää?") ja pidetään valinnaisena. Lähetä-nappi aktiivinen kun kaksi ensimmäistä vastattu.

### 7. Churn — 5 vaihtoehtoa + "muu syy" textarea

Tarkistetaan `ChurnKysely` (rivit ~70–85 alueella). Tällä hetkellä 3-vaihtoehtoinen yksittäisvalinta. Päivitetään monivalinta-checkboxeiksi 5 vaihtoehdolla:
1. En ehdi käyttää
2. En ymmärtänyt hyötyä
3. Sovellus ei vastaa tarpeeseeni
4. Tekninen ongelma
5. Muu syy

Jos "Muu syy" valittu → näytä textarea "Kerro tarkemmin". Vastauksen muoto: `{ syyt: string[], muu?: string }`.

### 8. Token-vanhenemisen käsittely

Tarkistettu: `/api/public/palaute`-route tarkistaa `token_voimassa` ja palauttaa virheen jos vanhentunut. **Käyttäjälle näkyvä viesti puuttuu** `/palaute`-sivulla. Lisätään `routes/palaute.tsx`-virhetilaan tunnistettu "linkki_vanhentunut"-tila, jolloin näytetään ystävällinen viesti: "Tämä palautekutsu on vanhentunut. Kiitos kuitenkin kiinnostuksestasi — voit antaa palautetta sovelluksessa milloin tahansa."

API-puolella palautetaan `{ error: "token_expired" }` jotta frontend osaa erottaa virhetilan.

## ENNEN JULKAISUA

### 9. Cron kevät/kesä/syksy → 1. päivä

Tarkistettu: kaikki neljä kausikirje-cronia ovat jo `0 9 1 4/6/9/12 *` — **OK**, ei muutosta tarpeen.

### 10. Rate limiting kyselykortin näyttämiselle

Nykyinen suojaus: `sessionStorage`-pohjainen "ohitettu"-lista (yksi sessio). Ei riitä — käyttäjälle voi tulla uusi kysely heti seuraavalla kirjautumisella jos sulkee yhden.

Lisätään kerroksittainen rate limit:

- **Per käyttäjä, kaikki kyselyt**: enintään 1 in-app-kysely per 7 kalenteripäivää. `haeAktiivinenKysely` tarkistaa `palaute_kyselyt`-rivien `lahetetty_at`-arvon — jos viimeisin (mikä tahansa in-app-kysely paitsi suljettavissa olleet kausikirjeet) on alle 7 pv vanha JA vastattu/suljettu, palautetaan `null`.
- **Per kyselytyyppi cooldown**: ydinprosessi-kyselyt aina sallittu (liidikohtaiset), mutta `onboarding`/`nps`/`churn`/`tyonlaatu` rajataan minimivälillä (esim. NPS 180 pv on jo voimassa; lisätään `onboarding` kerran, `churn` 30 pv, `tyonlaatu` 14 pv per ammattilainen — viimeisin osa toteutus ohittaa duplikaatit).
- **Client-side**: `localStorage` (ei session) sulkemiselle, ettei sama kysely-id nouse uudelleen vaikka sessio vaihtuisi.

## Tekninen yhteenveto muutoksista

| Tiedosto | Muutos |
|---|---|
| `src/lib/palaute.functions.ts` | Poistetaan `arkipaiviaSitten`; vaihe 1 → 5 kalenteripv; vaihe 3 trigger laajenee `sovittu_ei_viela`:lle (14 pv); 7 pv globaali kysely-cooldown |
| `src/lib/liidit.functions.ts` | `luoLiidi`/välitys: kirjoitetaan `ammattilainen_id` jos valittu kohde tunnetaan |
| `src/components/palaute-kortti.tsx` | Onboarding 3 erillistä kysymystä; Churn 5-monivalinta + muu-textarea; `localStorage` sessionin sijaan |
| `src/routes/palaute.tsx` + `src/routes/api/public/palaute.ts` | `token_expired`-virhetila ja käyttäjäystävällinen viesti |
| `src/routes/api/public/hooks/kausikirje-followup.ts` (uusi) | Lähettää 7 pv:n "kesken"-muistutuksen |
| `supabase/migrations/<uusi>.sql` | `paivita_ammattilainen_pisteet`-funktion kommenttiselvennys (sama logiikka) |
| Cron-insert | Uusi `kausikirje-followup` (päivittäin klo 10) |

## Mitä EI tehdä

- Ei muuteta `palaute_kyselyt`-skeemaa
- Ei kosketa nykyisiä legacy-rivejä (`liidi_yhteydenotto`/`liidi_tulos`)
- Ei muuteta painokertoimia (0.40/0.30/0.15/0.15)
- Ei muuteta kausikirjeen cron-aikatauluja (jo oikein)

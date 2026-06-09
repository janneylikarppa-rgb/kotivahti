
# Palaute- ja mittausjärjestelmä

Iso kokonaisuus, joka koskettaa tietokantaa, palvelin­funktioita, sähköpostia (Resend), kirjautumis­flowta, dashboardia ja admin-näkymää. Toteutus tehdään yhdellä isolla erällä, mutta vaiheissa: ensin tietokanta, sitten serveri­logiikka, sitten UI ja lopuksi kausikirje + cron.

## 1. Tietokanta (yksi migraatio)

**`palaute_kyselyt`** — kysely-tapahtumat (in-app + kausikirjeet)
- `id`, `user_id` (nullable: kausikirjeen tokenivastaus ei vaadi kirjautumista, mutta sähköposti tunnistaa käyttäjän, joten tallennetaan), `tyyppi`, `trigger_id` (liidi/huolto), `token` (uuid, gen_random_uuid), `token_voimassa` (now()+30d), `lahetetty_at`, `vastattu_at`, `vastaukset` (jsonb)
- RLS: omistaja näkee/päivittää omat, service_role kaikkeen
- Token-pohjainen vastaus tapahtuu `/api/public/palaute` reitin kautta service rolella → ei tarvitse anon-policya
- Indeksit: `(user_id, tyyppi, lahetetty_at)`, `(token)` unique

**`kayttaja_metriikat`** — per käyttäjä
- Kentät kuvauksen mukaan, `user_id unique`
- RLS: omistaja luku, palvelin (service_role) kirjoitukset; UI-toggle (kausikirje_suostumus) sallitaan käyttäjälle
- Backfill rivit olemassa oleville käyttäjille migraatiossa

**Trigger `handle_new_user` -laajennus**: lisätään rivi `kayttaja_metriikat`-tauluun rekisteröinnin yhteydessä.

GRANT-lauseet jokaiselle taululle (authenticated + service_role) ja RLS päälle.

## 2. Automaattiset metriikat

Päivitykset tehdään palvelin­funktioissa, ei tietokantatriggereissä (selkeämpi virheenkäsittely ja vältetään cross-schema haasteet):

- `talon_tiedot_taytetty=true` → `talon-tiedot.tsx` save mutationin yhteydessä (serverFn `tallenaTalonTiedot`).
- `pts_avattu=true` → PTS-sivun loaderista server-fn `merkitsePtsAvattu`.
- `liideja_lahetetty + 1` → `luoLiidi` serverFn.
- `huoltoja_kirjattu + 1` → huollon tallennus.
- `vuosikelloa_kuitattu + 1` → vk-kuittaus.
- `viimeisin_kirjautuminen` → kirjautumisen jälkeen kerran per sessio kutsuttava `paivitaKirjautuminen` serverFn (kutsutaan `_authenticated`-layoutista, idempotent localStorage-päivän tarkistuksella).

Kaikki päivitykset käyttävät `upsert + increment`-RPC:tä (luodaan SECURITY DEFINER funktio `inkrementoi_metriikka(user_id, kentta, maara)`).

## 3. In-app kyselyt

**Komponentti**: `src/components/palaute-kortti.tsx`
- Kiinteä `position: fixed; bottom-4 right-4 z-50; max-w-[340px]`
- Värit: bg `var(--surface)` #142A1A, border #C9A84C, radius 12, pehmeä shadow
- Sulje-✕ oikeassa yläkulmassa → tallentaa "ohitettu" lokaalisti (sama kysely ei näy uudelleen sessiossa)
- Animaatio (slide+fade) auki/kiinni
- Tukee kaikkia 6 kyselytyyppiä yhden datadrivennin renderöijän kautta

**Server-fn**: `haeAktiivinenKysely()` — palauttaa korkeimman prioriteetin kyselyn jonka ehdot täyttyvät, luo `palaute_kyselyt`-rivin (status: lähetetty, vastattu_at null) jos sitä ei vielä ole. Logiikka:
1. Liidi yhteydenotto (3 arkipv + status valitetty)
2. Liidi tulos
3. Työn laatu (huolto + ammattilainen + 5pv)
4. Onboarding (rek + 7pv)
5. NPS (rek + 30pv, ≥3 kirjautumista, ei NPS 180pv:ssä)
6. Churn (viim. kirjautuminen +14pv, rek +7pv, ei churn 30pv:ssä)

**Server-fn**: `vastaaKyselyyn({ id, vastaukset })` — tallentaa, päivittää metriikat (NPS).

**Sijoitus**: `_authenticated`-layoutiin globaalisti.

**HUOM**: ammattilaisen tekemän huollon tunnistus → katsotaan onko olemassa `ammattilainen_id` huolto-rivillä (jos kenttä puuttuu, käytetään `tekija_tyyppi='ammattilainen'`-vastaavaa kenttää tai jätetään tämä tyyppi pois ja merkitään TODO — tarkistan koodista huolto_historia-skeeman migraation aikana).

## 4. Kausikirjeet (Resend)

**Server route**: `src/routes/api/public/hooks/laheta-kausikirje.ts`
- Tarkistaa `apikey`-headerin (anon key)
- Body: `{ kausi: "kevat"|"kesa"|"syksy"|"talvi" }`
- Hakee kaikki käyttäjät joilla `kausikirje_suostumus=true`, rek > 14pv, ei tälle kaudelle jo lähetetty rivi `palaute_kyselyt`-taulussa
- Luo per käyttäjä rivin (token) + lähettää Resendillä HTML-sähköpostin
- Henkilökohtainen PTS-huomio: hakee `pts_suunnitelma`-taulusta kiireellinen/lähivuosina-kohteen, käyttää `pts-sisaltotekstit.ts`:ää
- Painikkeet linkkaavat `https://<base>/palaute?token=...&vastaus=...&kausi=...`

**Public route**: `src/routes/api/public/palaute.ts` (GET ja POST) + UI-sivu `src/routes/palaute.tsx`
- UI lukee `?token=...&vastaus=...&kausi=...`, postaa apiin, näyttää kiitossivun

**Cron**: `supabase--insert`-työkalulla 4 cron-jobia (huhti/kesä/syys/joulu klo 09:00) jotka kutsuvat hookia anon-keylla. Tämä tehdään vasta migraation jälkeen.

## 5. Follow-upit

**Cron-hook** `/api/public/hooks/follow-up-kausikirje` ajetaan päivittäin: etsii kausikirjevastaukset "En vielä" / "En vielä – tilaan apua" joista 7pv ja lähettää muistutuksen. Merkitään follow-up lähetetyksi `vastaukset.followup_sent`-kentällä.

**Liidi-omistaja-hälytys**: integroidaan suoraan `vastaaKyselyyn`-funktioon: jos `tyyppi='liidi_yhteydenotto'` ja vastaus "Ei ollenkaan", lähetetään välittömästi sähköposti `OWNER_EMAIL`-osoitteeseen (Resend).

## 6. Profiili-asetus

Lisätään `talon-tiedot.tsx`:n loppuun (tai uusi pieni profiilikortti) toggle "Kausimuistutukset sähköpostiin" joka päivittää `kayttaja_metriikat.kausikirje_suostumus` serverFn:n kautta.

## 7. Admin – Palaute-välilehti

`src/routes/_authenticated/admin.tsx` saa uuden tab/sektion "Palaute":
- Yhteenvetokortit (NPS, vastaus-%, liidi-tyytyväisyys-%, reagoimattomat ammattilaiset)
- Konversioputki-kaavio (yksinkertainen pystypalkki/HTML-pohjainen)
- Käyttäjäsegmentit (kortit, joista voi avata listan)
- Vastaukset-lista taulukkona + dialog
- Liidi-listaan kaksi uutta saraketta (V1, V2); V1=="Ei ollenkaan" → oranssi badge
- Kausikirje-osio + testilähetysnappi (kutsuu hookin omalle sähköpostille)
- Ammattilaisten arviot (aggregoitu `tyonlaatu`-vastauksista)

Server-funktiot kaikkiin: `getPalauteYhteenveto`, `getKonversioputki`, `getKayttajaSegmentit`, `getPalauteVastaukset`, `getAmmattilaisarviot`, `lahetaTestiKausikirje`. Suojataan `requireSupabaseAuth` + admin-rolen tarkistuksella.

## 8. Tekninen järjestys

1. **Migraatio**: taulut, RLS, GRANT, RPC `inkrementoi_metriikka`, backfill, `handle_new_user`-päivitys.
2. **Server-fn -kirjastot**: `src/lib/palaute.functions.ts`, `src/lib/metriikat.functions.ts`, `src/lib/kausikirje.server.ts` (HTML-templatet).
3. **Metriikkojen integrointi** olemassa oleviin serverFn:iin (talonTiedot, liidit, huolto, vuosikello, pts-loader, kirjautuminen).
4. **UI**: `PalauteKortti` + mount `_authenticated`-layoutissa.
5. **Public-reitit**: `/api/public/palaute`, `/api/public/hooks/laheta-kausikirje`, `/api/public/hooks/follow-up-kausikirje`; UI-sivu `/palaute`.
6. **Profiili-toggle**.
7. **Admin-palaute-näkymä**.
8. **Cron-joborit** (supabase--insert) — 4 kausikirjettä + 1 päivittäinen follow-up.

## Vahvistettavat oletukset

- Kausikirjeet lähetetään `noreply@kotivahti.fi`-osoitteesta Resendillä — domainin tulee olla Resendissä verifioitu. Jos ei ole, käytän kehityksessä `onboarding@resend.dev` ja merkitsen TODO:n.
- "Ammattilaisen tekemä huolto" tunnistetaan `huolto_historia`-taulun olemassa olevasta kentästä (varmistan migraatiovaiheessa). Jos kenttää ei ole, jätetään `tyonlaatu`-kysely odottamaan.
- Admin-tarkistus käyttää olemassa olevaa `has_role(uid,'admin')`-funktiota.

OK lähteä toteuttamaan tällä rakenteella?

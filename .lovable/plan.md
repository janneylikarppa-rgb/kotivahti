# Liidikäsittelyagentti (Claude) + ilmoitukset

Uusi liidi analysoidaan automaattisesti Claudella, tulos tallennetaan liidiin, ja sinulle lähtee ilmoitus – päivällä heti, yöllä aamukoontina.

## Huomio toteutustavasta
Sovellus on TanStack Start -pohjainen, jossa palvelinlogiikka ajetaan server-funktioissa ja `/api/public/*`-reiteissä (ei Supabase Edge Functioneita). Toteutan agentin samalla mallilla kuin nykyiset kausikirje-ajastukset – toiminnallisuus on täsmälleen pyytämäsi, vain suorituspaikka on tämän projektin vakiotapa.

## 1. Tietokanta
Lisätään `liidit`-tauluun:
- `agentin_ehdotus` jsonb (nullable)
- `kasitelty_at` timestamptz (nullable)
- `lahetus_jonossa` boolean, oletus false

## 2. Agentti
Uusi palvelinmoduuli `src/lib/liidi-agentti.server.ts`:
- Kutsuu Anthropic Messages APIa `ANTHROPIC_API_KEY`-avaimella (`anthropic-version: 2023-06-01`), promptina pyytämäsi liidikäsittelykehote (kategoria, kaupunki, palvelu, kuvaus).
- Odottaa JSON-vastauksen: `kiireellisyys`, `ammattilaiset[3]` (nimi, puhelin, arvosana, arvostelut, perustelu), `valmis_viesti`. Vastaus parsitaan turvallisesti; virheellinen JSON ei kaada liidin luontia.
- Tallentaa `agentin_ehdotus` + `kasitelty_at` liidille.
- Käytetään Anthropicin ajantasaista Sonnet-mallitunnusta; jos annettu `claude-sonnet-4-6` ei ole voimassa, käytän uusinta vastaavaa Sonnet-mallia.

Kytkentä: kutsutaan liidin tallennuksen jälkeen olemassa olevassa `luoLiidi`-funktiossa (`src/lib/liidit.functions.ts`). Näin ei tarvita erillistä webhookia eikä liidi voi jäädä käsittelemättä.

## 3. Sähköposti-ilmoitus (Resend)
Vastaanottaja `janne.ylikarppa@gmail.com`, lähettäjä nykyinen `Kotiluotsi <noreply@kotiluotsi.fi>`.
- Kellonaika lasketaan Europe/Helsinki-ajassa.
- 08:00–18:00: lähetetään heti, aihe `🔔 Uusi liidi – [kategoria] – [kaupunki]`, sisältönä asiakas, kategoria, sijainti, kiireellisyys, agentin top 3 -suositus ja valmis yhteydenottoteksti + linkki https://kotiluotsi.fi/admin.
- 18:00–08:00: ei lähetystä, `lahetus_jonossa = true`.

Nykyinen ammattilaisille/omistajalle menevä ilmoitus säilyy ennallaan.

## 4. Aamukoonti
Uusi reitti `src/routes/api/public/hooks/liidi-aamukoonti.ts`:
- Hakee liidit joilla `lahetus_jonossa = true`.
- Lähettää koonnin aiheella `☀️ [X] uutta liidiä yön aikana`, rivit `• kategoria – kaupunki – klo aika`, linkki adminiin.
- Nollaa `lahetus_jonossa = false`.
- pg_cron-ajastus joka päivä klo 08:00 Europe/Helsinki (05:00 UTC talvella; ajastetaan Helsinki-ajassa cron-lausekkeessa).

## 5. Admin-paneeli
`src/routes/_authenticated/admin.tsx`: liidin avatussa näkymässä uusi kortti "🤖 Agentin suositus" – kolme ammattilaista (nimi, arvosana ⭐, puhelin, perustelu), valmis viesti ja "📋 Kopioi viesti" -painike (leikepöydälle + vahvistusilmoitus). Näytetään vain jos `agentin_ehdotus` on olemassa.

Muuhun sovellukseen ei koskettu.

## Tekniset yksityiskohdat
- Migraatio: 3 uutta saraketta, ei muutoksia RLS-politiikkoihin (admin-luku toimii jo `has_role`-pohjaisesti).
- Anthropic-kutsu tehdään vain palvelimella; avainta ei koskaan viedä selaimeen.
- Virhetilanteet (Anthropic 4xx/5xx, puuttuva avain) lokitetaan eivätkä estä liidin tallennusta tai perusilmoituksia.
- Cron-kutsu tehdään pg_netillä vakaaseen tuotanto-URLiin.

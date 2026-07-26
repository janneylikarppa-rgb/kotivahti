## Tavoite

Osoitekenttään kirjoittaessa haetaan automaattisesti osoite-ehdotuksia ja näytetään lista, jossa jokainen rivi kertoo kaupungin/postinumeron. Käyttäjä valitsee klikkaamalla oikean paikkakunnan → Ryhti-tiedot haetaan heti kyseisen osoitteen koordinaateilla. Jos ehdotuksia ei löydy, käyttäjä voi jatkaa käsin kuten nyt.

## Miten se toimii käyttäjälle

1. Käyttäjä kirjoittaa osoitteen (esim. "Kirkkokatu 5").
2. ~400 ms kirjoittamisen tauon jälkeen kentän alle avautuu 5–7 ehdotusta muodossa: **Kirkkokatu 5** · 90100 Oulu / 33200 Tampere jne.
3. Klikkaus valitsee rivin: osoite, postinumero ja kaupunki täyttyvät automaattisesti, ja Ryhti-haku käynnistyy samalla klikkauksella (spinner listan tilalla → "✓ Ryhti: rakennusvuosi 1987 · 142 m² …").
4. Jos haku ei tuota osumia tai palvelu ei vastaa: pieni harmaa teksti "Ei ehdotuksia – täytä tiedot käsin" ja kentät toimivat normaalisti. Nykyinen "Hae talon tiedot Ryhti-rajapinnasta" -painike jää käytettäväksi varmistuksena.
5. Sama toiminto sekä **Talon tiedot** -sivulla että **Lisää kiinteistö** -dialogissa.

## Tekninen toteutus

**1. `src/lib/ryhti.server.ts`**
- Uusi `haeOsoite-ehdotukset(teksti)`: Digitransit `/geocoding/v1/autocomplete?text=…&size=7&layers=address&boundary.country=FIN`.
- Palauttaa normalisoidun listan: `{ id, katuosoite, postinumero, kaupunki, lat, lon, label }` (properties: `name`, `postalcode`, `localadmin`/`locality`, coordinates).
- Duplikaattien suodatus katuosoite+postinumero -avaimella.
- Uusi `mappaaRakennusKoordinaateista(lat, lon)`-käyttö: nykyinen `haeRakennukset` + `valitseLahin` + `mappaaRakennus` uudelleenkäytetään sellaisenaan.

**2. `src/lib/ryhti.functions.ts`**
- `haeOsoiteEhdotukset` (POST, `z.object({ teksti: z.string().trim().min(3) })`) → `{ ok: true, ehdotukset: [...] }` tai `{ ok: false, koodi }`. Timeout-/virhekoodit samalla logiikalla kuin nyt.
- `haeRyhtiKoordinaateilla` (POST, `{ lat, lon }`) → sama palautusmuoto kuin `haeRyhtiTiedot` (`ok`, `tiedot`, `koodi`), mutta ohittaa geokoodauksen koska koordinaatit tulevat valitusta ehdotuksesta.
- `haeRyhtiTiedot` jää ennalleen (nappi + taaksepäinyhteensopivuus).

**3. Uusi komponentti `src/components/osoite-autocomplete.tsx`**
- Props: `arvo`, `onChangeTeksti`, `onValitse({ katuosoite, postinumero, kaupunki, lat, lon })`, `disabled`.
- Debounce 400 ms, minimipituus 3 merkkiä, `useQuery` (`queryKey: ["osoite-ehdotukset", teksti]`, `staleTime: 5 min`) + `enabled`-ehto.
- Lista renderöidään `Input`-kentän alle absoluuttisesti sijoitettuna paneelina (`gold-card`-tyyli, rounded-xl, max-h + scroll). Näppäimistötuki: ↑/↓, Enter valitsee, Esc sulkee; blur sulkee pienellä viiveellä.
- Ei näytetä listaa, jos käyttäjä on juuri valinnut rivin tai kenttä on tyhjä.

**4. `src/routes/_authenticated/talon-tiedot.tsx`**
- Osoite-`Input` korvataan `OsoiteAutocomplete`-komponentilla.
- `onValitse`: `setK({ ...k, osoite, postinumero, kaupunki })` ja käynnistää `ryhtiKoordinaattiHaku`-mutaation, joka täyttää rakennusvuoden, pinta-alan, kerrokset, lämmitysmuodon ja julkisivun sekä asettaa `ryhtiKentat`-merkinnät (sama `onSuccess`-logiikka kuin nykyisessä `ryhtiHaku`ssa → siirretään yhteiseen apufunktioon, ei kopioida).

**5. `src/components/property-switcher.tsx`**
- Osoitekenttä samaan `OsoiteAutocomplete`-komponenttiin; valinta täyttää `osoite` + `kaupunki` ja hakee `ryhtiTiedot` koordinaateilla (`lisaaMut` käyttää niitä jo).

## Rajoitteet

- Ehdotukset tulevat Digitransit-geokoodauksesta (kattaa Suomen osoitteet, ei vaadi API-avainta); Ryhti-rakennustiedot haetaan vasta valinnan jälkeen. Jos Ryhti ei tunne rakennusta valitussa pisteessä, näytetään nykyinen viesti "Rakennusta ei löydy tällä osoitteella. Voit täyttää tiedot käsin." eikä kenttiä ylikirjoiteta.
- Käsin kirjoittaminen ei koskaan esty: lista on pelkkä apu, ei pakollinen vaihe.

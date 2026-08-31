# Aikavyöhykkeen korjaus liidi-agenttiin

## Tavoite
Varmistaa, että päiväajan tarkistus `src/lib/liidi-agentti.server.ts` käyttää Europe/Helsinki-aikaa eikä UTC-aikaa, ja että logiikka testataan toimivaksi.

## Nykytila
Tiedostossa on jo `helsinkiTunti()`-apufunktio, joka käyttää `Intl.DateTimeFormat`a `Europe/Helsinki`-aikavyöhykkeellä. Käyttäjä haluaa kuitenkin nimenomaisen `toLocaleString`-pohjaisen toteutuksen ja varmistuksen, että kesäaika (UTC+3) huomioidaan.

## Muutokset

### 1. Päiväajan tarkistus (`helsinkiTunti`)
Korvataan `src/lib/liidi-agentti.server.ts` rivit 33-41 seuraavalla:

```text
function helsinkiTunti(): number {
  const nytHelsinki = new Date().toLocaleString("fi-FI", {
    timeZone: "Europe/Helsinki",
  });
  const tunti = new Date(nytHelsinki).getHours();
  return tunti;
}
```

Tämä laskee tunnin suoraan Europe/Helsinki-ajasta.

### 2. Päivä/ei-päivä -logiikka
`kasitteleLiidiAgentilla` säilyy muuten ennallaan, mutta päiväajan tarkistus muutetaan eksplisiittiseksi:

```text
const tunti = helsinkiTunti();
const onPaiva = tunti >= 8 && tunti < 18;
```

- Jos `onPaiva === true` → lähetä ilmoitus heti.
- Jos `onPaiva === false` → asetetaan `lahetus_jonossa = true`.

### 3. Testaus
Ajetaan paikallinen testiskripti, joka:
- Tulostaa nykyisen UTC-ajan.
- Tulostaa `new Date().toLocaleString("fi-FI", { timeZone: "Europe/Helsinki" })` -ajan.
- Tulostaa lasketun `helsinkiTunti()`-arvon.
- Varmistaa, että kesäaikaan (UTC+3) saadaan oikea Helsinki-tunti (esim. kun UTC on 05:00, Helsinki on 08:00 → `onPaiva === true`).

## Ei kosketa
- Anthropic-kutsua
- Sähköpostipohjia
- Admin-käyttöliittymää
- Muita tiedostoja

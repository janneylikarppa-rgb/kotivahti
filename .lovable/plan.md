## Tavoite
Talon tiedoissa vain **Aurinkopaneelit: Kyllä / Ei**, ja Kyllä-valinnalla **Asennusvuosi**. Poistetaan tyyppivalinta (paneelit/akusto/molemmat) ja akustoon liittyvä logiikka. PTS-suunnitelmaan generoidaan asennusvuoden perusteella vain paneelit ja invertteri.

## Muutokset

**1. `src/routes/_authenticated/talon-tiedot.tsx`**
- "Tekniset järjestelmät" -osioon:
  - "Onko talossa aurinkopaneelit?" → Kyllä / Ei
  - Jos Kyllä: "Asennusvuosi" (numerokenttä)
- Poistetaan "Mitä on asennettu?" (paneelit/akusto/molemmat) -kenttä sekä siihen liittyvät labelit.
- Skeema/payload: `aurinkopaneelit: boolean`, `aurinko_asennus_vuosi: number | null`. Poistetaan `aurinko_tyyppi` täysin.

**2. `src/lib/pts-kohteet.ts`**
Säilytetään ja yksinkertaistetaan:
- `aurinko_paneelit_huolto` — Aurinkopaneelien tarkastus ja puhdistus (2 v välein, käyttöikä 30 v). `koskee`: `t?.aurinkopaneelit === true && i(t?.aurinko_asennus_vuosi) != null`.
- `aurinko_invertteri` — Invertterin vaihto (n. 12 v). Sama `koskee`-ehto.
- `aurinko_paneelit_uusinta` — Aurinkopaneelien uusinta (25–30 v). Sama `koskee`-ehto.

Poistetaan:
- `aurinko_akusto` -kohde kokonaan.
- Kaikki viittaukset `aurinko_tyyppi`-kenttään (koskee-funktioista pois).

**3. `src/lib/kotivahti.functions.ts`**
- `talon_tiedot` upsert/päivitys: poistetaan `aurinko_tyyppi`-kentän luku/kirjoitus. `aurinkopaneelit` (boolean) ja `aurinko_asennus_vuosi` (number) säilyvät.
- Aurinkosähkösuosituksen esto-lippu käyttää edelleen `aurinkopaneelit`-boolia (ei muutosta logiikkaan).

**4. Tietokanta**
- Ei uutta migraatiota tarvita: `aurinkopaneelit` ja `aurinko_asennus_vuosi` -sarakkeet ovat jo olemassa `talon_tiedot`-taulussa. Aiemmin lisätty `aurinko_tyyppi`-sarake jää tauluun käyttämättömänä — ei haittaa, voidaan pudottaa myöhemmin erillisellä siivousmigraatiolla jos haluat.

## Mitä EI muuteta
- Aurinkosähkösuositus PTS:ssä (kiireellinen rivi + kuittaa/siirrä/tilaa kartoitus) toimii kuten nyt.
- `src/lib/aurinkosahko.ts` ja sen testit.
- Muut PTS-kohteet ja huoltohistorian mappaus.

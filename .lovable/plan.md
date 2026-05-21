# Talon tiedot -lomakkeen yksinkertaistus

## Muutokset

**1. Lämmitysosio (`talon-tiedot.tsx`)**
- Pidetään lämmityslaitteen kentistä vain: **Merkki**, **Mallimerkintä**, **Lämmitys asennettu (vuosi)**.
- Poistetaan: Teho (kW), Sarjanumero, Varaaja (litraa), Lämmönkeruu/ulkoyksikkö, Säiliön tilavuus.
- `lammitys_lisatieto` JSONB-sarakkeeseen tallennetaan jatkossa vain `{ merkki, malli }`. Sarake säilyy ennallaan – vanha data ei katoa, mutta sitä ei näytetä tai päivitetä lomakkeelta.

**2. Sähköt**
- Poistetaan "Sähköt uusittu (vuosi)" -kenttä lomakkeelta.
- Jätetään vain "Sähköt asennettu (vuosi)" → PTS-suositus tarkastukselle asennusvuoden perusteella.
- Pudotetaan `sahkot_uusittu_vuosi`-sarake migrationilla (käyttäjä vahvisti).

**3. Viemäri**
- Poistetaan "Viemäri uusittu/saneerattu (vuosi)" -kenttä lomakkeelta.
- Jätetään "Viemärimateriaali" + "Viemäri asennettu (vuosi)".
- Pudotetaan `viemari_uusittu_vuosi`-sarake migrationilla.

## Tekniset askeleet

1. **Migration**: `ALTER TABLE talon_tiedot DROP COLUMN sahkot_uusittu_vuosi, DROP COLUMN viemari_uusittu_vuosi;`
2. **`src/lib/kotivahti.functions.ts`**: poista `sahkot_uusittu_vuosi` ja `viemari_uusittu_vuosi` Zod-skeemasta ja upsertista.
3. **`src/routes/_authenticated/talon-tiedot.tsx`**:
   - Poista yo. kentät teknisten järjestelmien osiosta.
   - Yksinkertaista `LAITTEET`-renderöinti: vain merkki + malli (lämmitysmuotokohtaiset lisäkentät pois).
4. Tarkasta että `types.ts` päivittyy migrationin jälkeen automaattisesti.

## Huom tiedostosta

En pääse käsiksi `file:///C:/Users/...` -polkuun (paikallinen tiedosto omalla koneellasi). Jos kotivahti-tuotedokumentissa on lisäohjeita kenttiin, liitä sisältö chattiin niin saan ne sisällytettyä.

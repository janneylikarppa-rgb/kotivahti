# Varaajien yleisimmät mallit valittavaksi

Lämminvesivaraajan "Mallimerkintä" on nyt vapaa tekstikenttä. Muutetaan se valintalistaksi, joka näyttää valitun merkin yleisimmät mallit — ja säilyttää mahdollisuuden kirjoittaa oma malli.

## Miten se toimii

- Kun merkiksi on valittu Jäspi, Nibe tai Haato, mallimerkinnän kohdalla näkyy pudotusvalikko kyseisen merkin yleisimmistä varaajamalleista.
- Listan lopussa on aina "Muu / oma…", jolloin mallin voi kirjoittaa vapaasti kuten ennenkin.
- Muilla merkeillä (esim. Kaukora tai oma merkki) kenttä toimii kuten nyt: vapaa teksti.
- Aiemmin tallennettu vapaa teksti säilyy ja näkyy oikein.

## Mallilistat

- **Jäspi**: VLM, VLS, VLK, Ovali, Basic, Solar, Duplex, Muu / oma
- **Nibe**: Compact CU, Eminent, Mega W-E, VPB, Elk, Muu / oma
- **Haato**: HK, HM, HKS, HVS, Muu / oma

## Tekniset yksityiskohdat

- `src/routes/_authenticated/talon-tiedot.tsx`: lisätään vakio `LVV_MALLIT: Record<string, string[]>` (avaimet Jäspi / Nibe / Haato) `MERKIT`-listan viereen.
- Lämminvesivaraaja-lohkossa mallimerkinnän `Input` korvataan ehdollisesti olemassa olevalla `SelectOrOther`-komponentilla, kun valitulle merkille löytyy mallilista; muuten säilytetään nykyinen `Input`.
- Arvo luetaan ja kirjoitetaan edelleen kenttään `lvv_malli` (fallback `malli`), joten tietokantaan tai PTS-logiikkaan ei tule muutoksia.

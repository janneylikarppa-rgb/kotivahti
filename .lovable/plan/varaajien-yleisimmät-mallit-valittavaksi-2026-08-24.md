# Varaajien yleisimmät mallit valittavaksi

Lämminvesivaraajan "Mallimerkintä" on nyt vapaa tekstikenttä. Muutetaan se valintalistaksi, joka näyttää valitun merkin yleisimmät mallit — ja säilyttää mahdollisuuden kirjoittaa oma malli.

## Miten se toimii

- Kun merkiksi on valittu Jäspi, Nibe tai Haato, mallimerkinnän kohdalla näkyy pudotusvalikko kyseisen merkin yleisimmistä varaajamalleista.
- Listan lopussa on aina "Muu / oma…", jolloin mallin voi kirjoittaa vapaasti kuten ennenkin.
- Muilla merkeillä (esim. Kaukora tai oma merkki) kenttä toimii kuten nyt: vapaa teksti.
- Aiemmin tallennettu vapaa teksti säilyy ja näkyy oikein.

## Mallilistat (malli + kokoluokka litroina)

- **Jäspi**: VLM 100, VLM 150, VLM 200, VLM 300, VLS 200, VLS 300, VLK 15, VLK 35, VLK 100, VLK 300, Ovali 300, Basic 200, Solar 300, Muu / oma
- **Nibe**: Compact 100, Compact 150, Compact 200, Compact 300, Eminent 35, Eminent 55, Eminent 100, Mega W-E 300, VPB 200, VPB 300, Muu / oma
- **Haato**: HK 15, HK 30, HK 55, HK 80, HK 100, HM 150, HM 200, HM 300, HVS 300, Muu / oma


## Tekniset yksityiskohdat

- `src/routes/_authenticated/talon-tiedot.tsx`: lisätään vakio `LVV_MALLIT: Record<string, string[]>` (avaimet Jäspi / Nibe / Haato) `MERKIT`-listan viereen.
- Lämminvesivaraaja-lohkossa mallimerkinnän `Input` korvataan ehdollisesti olemassa olevalla `SelectOrOther`-komponentilla, kun valitulle merkille löytyy mallilista; muuten säilytetään nykyinen `Input`.
- Arvo luetaan ja kirjoitetaan edelleen kenttään `lvv_malli` (fallback `malli`), joten tietokantaan tai PTS-logiikkaan ei tule muutoksia.

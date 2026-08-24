# Suora sähkölämmitys: sähköpatterit ja lämminvesivaraaja erilleen

Kun päälämmitysmuodoksi valitaan "Suora sähkölämmitys", Talon tiedot -lomake näyttää tällä hetkellä kaksi päällekkäistä lämminvesivaraaja-kohtaa:

1. Yleinen laitelohko otsikolla "Lämminvesivaraaja" (merkki + malli)
2. Lohko "Sähköpatterit ja lämminvesivaraaja" (pattereiden asennusvuosi + LVV:n merkki, malli ja asennusvuosi)

## Mitä muutetaan

- Poistetaan yleinen laitelohko suoran sähkölämmityksen kohdalta, jotta LVV:n tiedot syötetään vain yhdessä paikassa.
- Jaetaan jäljelle jäävä lohko kahdeksi selkeäksi osioksi:
  - **Sähköpatterit**: asennusvuosi
  - **Lämminvesivaraaja**: merkki, mallimerkintä, asennusvuosi
- Jos taloon on aiemmin tallennettu varaajan merkki/malli vanhaan yleiseen kenttään, ne näytetään edelleen lämminvesivaraaja-osiossa, eikä vanhoja tietoja hukata.

## PTS ja muut näkymät

- PTS:ssä säilyy kaksi erillistä riviä: "Sähköpatterit (suora sähkölämmitys)" ja "Lämminvesivaraaja".
- Lämminvesivaraajan PTS-rivi näkyy jatkossa myös silloin, kun varaajan omaa asennusvuotta ei ole täytetty: silloin käytetään järjestelmän asennusvuotta, kuten muillakin lämmityslaitteilla.
- Huoltokirjaus, vuosikello ja huolto-infot käyttävät jo omia nimikkeitään "Sähköpatterit" ja "Lämminvesivaraaja", joten ne toimivat muutoksen jälkeen sellaisenaan. Tarkistetaan silti, että huollon kirjaaminen näille kohteille päivittyy oikeaan PTS-riviin.

## Tekniset yksityiskohdat

- `src/routes/_authenticated/talon-tiedot.tsx`: poistetaan `MERKIT.sahkolammitys`-pohjainen laitelohko sähkölämmitykseltä ja jaetaan nykyinen lohko kahteen; LVV:n merkki lukee arvon `lvv_merkki ?? merkki` (malli vastaavasti) ja kirjoittaa aina `lvv_*`-kenttiin.
- `src/lib/pts-kohteet.ts`: kohteen `lvv_suora` lähdevuodeksi `lvv_asennettu_vuosi ?? lammitys_asennettu_vuosi`, ja `koskee` ei enää vaadi erillistä LVV-vuotta.
- Ei tietokantamuutoksia; kaikki kentät ovat jo `lammitys_lisatieto`-JSONissa.

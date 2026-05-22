## Demo-datan täyttö: 2000-luvun alun talo + 5v aktiivista käyttöä

Täytetään tilisi (`janne.ylikarppa`) kiinteistö realistisilla esimerkkitiedoilla, jotta voit testata palvelua täydellä sisällöllä.

### 1. Kiinteistö
- nimi: "Esimerkkitalo"
- osoite: "Koivurinne 12, 90230 Oulu"
- tyyppi: omakotitalo, rakennusvuosi **2003**, hankintavuosi **2020**

### 2. Talon tiedot (talon_tiedot)
Tyypillinen 2000-luvun alun omakotitalo:
- Pinta-ala 145 m², tilavuus 380 m³, 2 kerrosta, 4 asukasta
- Rakennustapa: puurunko, eriste mineraalivilla, perustus betoniantura
- Julkisivu: puupaneeli, maalattu 2018
- Katto: harjakatto, peltikatto (asennettu 2003), räystäät kunnostettu 2019
- Lämmitys: maalämpö (asennettu 2015, ennen öljy)
- Ilmanvaihto: koneellinen tulo-poisto + LTO (2003), suodatin vaihdettu 2026-02
- Putket: kupari 2003, viemäri muovi 2003
- Sähköt: 2003
- Terassi: puu, rakennettu 2005, kunnostettu 2020, 24 m²
- Tontti 1100 m², nurmikko 600 m², salaojat kyllä (tarkastettu 2024)
- Sadevesikaivot 2, syöksytorvet 6
- Kiuas 2018, nuohous 2025-09
- Palovaroittimia 4, paristot vaihdettu 2026-01

### 3. Huoltohistoria (~25 riviä, 2021–2026)
Realistinen sekoitus säännöllisiä huoltoja ja korjauksia:
- **2021**: nuohous, ilmanvaihtosuodattimet, lämpöpumpun huolto, kourujen puhdistus
- **2022**: julkisivun pesu, terassin öljyäminen, nuohous, IV-suodattimet, sähköpääkeskuksen tarkastus
- **2023**: salaojien tarkastus (siirto +10v), nuohous, lämpöpumpun vuosihuolto, palovaroittimien paristot, ikkunoiden tiivisteet
- **2024**: kylpyhuoneen silikonien uusinta, nuohous, IV-koneen huolto, kourujen puhdistus, autotallin oven huolto
- **2025**: maalämpöpumpun huolto + kylmäaine, peltikaton ruosteenestomaalaus (siirto +5v), nuohous, terassin kantavien tarkastus
- **2026** (alkuvuosi): IV-suodattimet, palovaroittimien paristot, lumiesteiden tarkastus

### 4. Kulut (~60 riviä, 5 vuotta)
- **Sähkö**: kuukausittaiset mittarilukemat 2021–2026 (~18 000 kWh/v, lievä lasku maalämmön myötä)
- **Vesi**: 2x/v mittarilukemat (~140 m³/v)
- **Vakuutus, kiinteistövero, jätehuolto**: vuosittain
- **Huoltokuluja**: yhdistettynä huoltohistoriaan

### 5. Kuittaukset
- Muutama `vk_kuitatut`-rivi vuosikellosta viime kausilta
- 1–2 `pts_kuitatut`-riviä (esim. salaojatarkastus 2023)

### Toteutus
Yksi `supabase--insert`-kutsu joka:
1. UPDATE `kiinteistot` (nimi/osoite/vuosi)
2. UPDATE `talon_tiedot` (kaikki kentät)
3. INSERT `huolto_historia` (~25 riviä)
4. INSERT `kulut` (~60 riviä)
5. INSERT `vk_kuitatut` + `pts_kuitatut` (muutama rivi)

Ei koodimuutoksia — pelkkä datan täyttö. Voit milloin tahansa pyytää tyhjentämään tai täydentämään.

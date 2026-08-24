# Ilmalämpöpumpun mallilista

Sama toimenpide kuin lämminvesivaraajille: mallimerkintä valitaan listasta, kun merkki on tunnettu.

## Mitä tehdään

Talon tiedot -sivun "Ilmalämpöpumppu" -osiossa Mallimerkintä-kenttä muuttuu vapaasta tekstikentästä valintalistaksi, jossa on merkin yleisimmät mallit. "Muu / oma malli" -vaihtoehto säilyy, joten minkä tahansa mallin voi edelleen kirjoittaa käsin.

Mallit merkeittäin (yleisimmät ilma-ilmalämpöpumput Suomessa):
- Mitsubishi Electric: MSZ-LN25/35/50VG, MSZ-FT25/35/50, MSZ-AP25/35, MSZ-HR25/35, Kirigamine Zen
- Daikin: Perfera FTXM20/25/35/42, Ururu Sarara, Comfora FTXP25/35, Emura, Stylish
- Panasonic: Etherea Z25/Z35/Z50, HZ25/HZ35, Nordic NZ25/NZ35, TZ25/TZ35
- Toshiba: Daiseikai 9/10, Shorai Edge 25/35, Haori, Polar
- Fujitsu: LU25/LU35, LM25/LM35, Nocria X, ASYG09/12
- LG: Artcool, Standard Plus, ThermaV (ilma-ilma), H09/H12
- Samsung: Wind-Free Nordic 25/35, AR35, Cebu
- Sharp: AY-XP09/12, Plasmacluster

Jos merkiksi valitaan "Muu" tai jokin listan ulkopuolinen, mallimerkintä säilyy vapaana tekstikenttänä kuten nyt.

## Tekniset yksityiskohdat

- `src/routes/_authenticated/talon-tiedot.tsx`: uusi `ILP_MALLIT: Record<string, string[]>` -vakio `LVV_MALLIT`-vakion viereen.
- Rivin ~663 `Mallimerkintä`-kenttä: jos `ILP_MALLIT[t.ilp_merkki]` löytyy, renderöidään `SelectOrOther` (`key={t.ilp_merkki}` remounttausta varten), muuten nykyinen `Input`.
- Tallennuslogiikkaan, tietokantaan tai PTS:ään ei muutoksia — kenttä on edelleen sama `ilp_malli`-teksti.

## 1. Rakennusvuosi 1900 -bugi

`src/lib/pts-kohteet.ts` rivi 17:
```
n > 1900 && n < 2200  →  n >= 1900 && n < 2200
```
Validaattori `i()` palauttaa nyt `null` arvolle 1900, jolloin kaikki `rakV(t)`-pohjaiset PTS-rivit (julkisivu, katto, putket, viemäri, sähköt jne.) tippuvat pois "ei tietoa" -tilaan. Yläraja >= ja alaraja tarkistettava että 1900 on sallittu.

## 2. Öljysäiliön tarkastus vain öljylämmittäjille

`src/lib/vuosikello-data.ts`:
- Poistetaan rivi 55 `f("Öljysäiliön tilan tarkastus")` `STAATTISET.syksy`-listasta.
- `dynamicHuollot()`-funktion `case "oljylammitys"` -haaraan lisätään syksyyn `f("Öljysäiliön tilan tarkastus")` (kevätrivi pysyy).
- Lisäksi `lammitys_lisatieto.kattila_tyyppi === "oljy"` (uusi keskuslämmityskattilamalli) huomioidaan samalla logiikalla, ettei rivi katoa migroiduilta käyttäjiltä.

## 3. Kulut-näkymän uudistus

Korvataan nykyinen yksi `BarChart` (`perKk`, kaikki kategoriat yhteen pinkkaamattomaan palkkiin) `kulut.tsx`-tiedoston Yhteenveto-välilehdellä **kolmiosaisella näkymällä**, jossa kaikki saman vuoden data näkyy yhdellä silmäyksellä:

**A. Juoksevat kulut – Sähkö & Vesi (yhdistetty pylväs+viiva -kaavio)**
- `ComposedChart`: pylväät = €/kk (Sähkö kullanruskea, Vesi sininen), kaksi viivaa = kulutus (kWh, m³) toissijaisella Y-akselilla.
- Otsikko "Juoksevat kulut" + alle pieni info "Sähkö ja vesi kuukausittain – trendi näkyy viivasta."

**B. Huolto & korjaus -kulut (oma kaavio, eri väri)**
- Pylväät kuukausittain (`huolto`-kategoria), eri värisävy (esim. vihreä/oranssi) erottuakseen juoksevista. Yhteissumma vuodessa otsikon vieressä.

**C. Kiinteät kulut (vakuutus + kiinteistövero + muu)**
- Donitsi tai vaakapylväs: kategoriasummat vuodessa. Otsikko "Kiinteät kulut – vakuutukset, verot ja muut".

Stat-kortteihin yläosaan lisätään neljäs: "Huolto/korjaus" `summa` (`huolto`-kategoria).

`KAT_LABEL` ja `KATEGORIAT` pysyvät, vain ryhmittely:
```
JUOKSEVAT = ["sahko","vesi","lammitys"]
HUOLTO    = ["huolto"]
KIINTEAT  = ["vakuutus","kiinteistovero","muu"]
```

## 4. Poista "Yleiskuva"-eyebrow Dashboardista

`src/routes/_authenticated/dashboard.tsx` rivit 36–38: poistetaan `<p className="eyebrow">… Yleiskuva</p>` kokonaan. H1 ja kuvausteksti jäävät.

## 5. Tilaa palvelu -kortin teksti

`src/components/liidi-dialog.tsx` rivi 155–157 `DialogDescription`:
> Välitämme pyynnön tarkastetuille oman paikkakuntasi ammattilaiselle. Palvelu on maksuton, ja sen käyttämisestä voit itse päättää.

(Etusivun `kil-mock`-kortti `index.tsx`:ssä jätetään ennalleen – se on markkinointimockup, ei oikea kortti.)

## Tiedostot
- `src/lib/pts-kohteet.ts` (rivi 17)
- `src/lib/vuosikello-data.ts` (rivit 55, ~98)
- `src/routes/_authenticated/kulut.tsx` (Yhteenveto-välilehti)
- `src/routes/_authenticated/dashboard.tsx` (header)
- `src/components/liidi-dialog.tsx` (DialogDescription)

Ei tietokantamuutoksia. Recharts-komponentit (`ComposedChart`, `Line`, `Legend`) ovat jo `recharts`-paketissa.

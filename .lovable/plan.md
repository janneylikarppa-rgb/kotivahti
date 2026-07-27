## Vastaus kysymykseen: kyllä, sama syy

Molemmat oireet — "ei löydä taloja" ja "ei löydä osoitenumeroilla" — johtuvat samasta yhdestä asiasta: **käytössä oleva Ryhti-rajapinnan osoite ei ole olemassa.**

Todennettu tässä istunnossa:

- `api.ryhti.fi` → `Could not resolve host` (domainia ei ole; ei siis "palvelu alhaalla", vaan väärä osoite). Kaikki rakennushaut epäonnistuvat aina, riippumatta osoitteesta tai numerosta.
- Osoite-ehdotukset sen sijaan toimivat: haku "Kirkkokatu 5" palauttaa 20 osumaa, joissa talonumero mukana (Helsinki, Lahti, Oulu, Jyväskylä, Kotka, Joensuu, Lappeenranta…). Osoitepuoli ei siis ole vialla.

Eli: osoitteen valinta onnistuu, mutta sen jälkeinen talotietojen haku kaatuu joka kerta → sovellus näyttää pehmeän "täytä loput käsin" -viestin, mikä näyttää käyttäjälle siltä kuin taloja ei löytyisi numeroilla.

## Löysin oikean, toimivan rajapinnan

Ympäristöministeriön avoin Ryhti-rakennustietovaranto (ei API-avainta, todennettu toimivaksi juuri nyt):

- `ryhti_building:open_building` — 3 793 062 rakennusta. Kentät: valmistumispäivä, käyttötarkoitus, julkisivumateriaali, lämmitystapa, lämmitysenergianlähde, kerrosluku, kerrosala, kokonaisala, kantava rakenne.
- `ryhti_building:open_address` — koko Suomen osoiterekisteri: kadunnimi, talonumero, postinumero, postitoimipaikka ja **suora linkki rakennukseen** (`building_key`).

Tämä on selvästi parempi kuin nykyinen "geokoodaa ja arvaa lähin rakennus" -tapa: osoite osoittaa suoraan oikeaan rakennukseen.

## Mitä korjataan

**1. `src/lib/ryhti.server.ts` — rakennushaku oikeaan lähteeseen**
- Poistetaan olematon `api.ryhti.fi`-kutsu.
- Uusi haku: osoitteen `building_key` → `open_building`-rakennus. Varalle jää lähimmän rakennuksen haku koordinaateilla (koordinaatit muunnetaan EPSG:3067 ↔ WGS84).
- Koodistoarvot ovat URI-muodossa (esim. `.../lammitystapa/code/03`). Lisätään koodikartat suomenkielisiksi teksteiksi lämmitystavalle, julkisivumateriaalille ja käyttötarkoitukselle, ja kytketään ne olemassa oleviin `mappaaLammitys`/`mappaaJulkisivu`-funktioihin.
- Kenttäkartta: `completion_date` → rakennusvuosi, `total_area`/`gross_floor_area` → pinta-ala, `number_of_storeys` → kerrokset.

**2. Osoite-ehdotukset suoraan samasta rekisteristä**
- `haeOsoiteEhdotukset` hakee jatkossa `open_address`-tasolta (kadunnimi + talonumero + postinumero + postitoimipaikka). Näin ehdotuslistalla näkyvät vain oikeat, rekisterissä olevat osoitteet — ja jokainen valinta tuo mukanaan `building_key`:n, jolloin talotiedot löytyvät varmasti.
- Nominatim jää varalle, jos rekisteri ei vastaa.

**3. `src/lib/ryhti.functions.ts`**
- `haeRyhtiKoordinaateilla` laajennetaan ottamaan vastaan myös valitun osoitteen rakennustunnus (`building_key`), jolloin haku on tarkka eikä perustu etäisyysarvaukseen. Palautusmuoto ja virhekoodit pysyvät samoina.

**4. Käyttöliittymä**
- Ei rakenteellisia muutoksia: `OsoiteAutocomplete`, talon tiedot ja "Lisää kiinteistö" toimivat kuten nyt, mutta valinnan jälkeen kentät täyttyvät oikeasti.
- Pehmeä "täytä loput käsin" -viesti jää voimaan niitä tapauksia varten, joissa rekisteristä puuttuu tietoja.

## Tarkistus toteutuksen jälkeen

Ajetaan haku muutamalla oikealla osoitteella (mm. sama katuosoite eri paikkakunnilla) ja varmistetaan selaimessa, että rakennusvuosi, pinta-ala, kerrokset, lämmitys ja julkisivu täyttyvät.

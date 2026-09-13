# Palveluntarjoajan valinta + karttamodaali liidilomakkeeseen

## Mitä tehdään

### 1. Valintaosio lomakkeeseen
`src/components/liidi-dialog.tsx`: kuvaus-kentän jälkeen, ennen nimi-kenttää, uusi osio "Miten haluat valita palveluntarjoajan?" kahdella kortilla:

- **Kotiluotsi välittää pyynnön** — "Välitämme pyyntösi sopivalle palveluntarjoajalle alueeltasi"
- **Valitsen itse kartalta** — "Näet alueen yritykset kartalla ja valitset itse"

Ei oletusvalintaa; lähetys estetään kunnes valinta on tehty. Kartta-vaihtoehto avaa modaalin. Valinnan jälkeen osion alle tulee "✓ Valitsit: [yritys 1], [yritys 2]" ja linkki "Muuta valintaa →". Lähetysnappi säilyy: "Lähetä pyyntö".

### 2. Karttamodaali
Uusi komponentti `src/components/kartta-valinta.tsx`:
- Mapbox GL JS, tyyli `dark-v11`, zoom maakuntatasolle
- Kodin marker (valkoinen koti-ikoni, tooltip "Kotisi")
- Ammattilaisten markerit + popup: yrityksen nimi, ⭐ arvosana/5, arviomäärä
- Valinta: klikkaus korostaa kultaisella (#C9A84C), yläpalkki "+1 valittu (X/3)", uudelleenklikkaus poistaa, 3:n jälkeen muut harmaantuvat ("Maksimimäärä valittu")
- Alareuna: "Valittu: X/3" · [Peruuta] · [Valmis, palaa lomakkeelle →] (disabloitu kun 0)

### 3. Tietokantamuutokset
- `ammattilaiset`: `katuosoite`, `postinumero`, `kaupunki`, `lat`, `lng` (kaikki valinnaisia)
- `liidit`: `valinta_tapa` ("automaattinen"/"kartta"), `valitut_ammattilaiset` (uuid-lista)

### 4. Admin-lomake
Ammattilaislomakkeeseen osoitekentät (katuosoite, postinumero, kaupunki). Tallennuksen yhteydessä koordinaatit haetaan automaattisesti Mapbox Geocoding -rajapinnalla ja tallennetaan ammattilaiselle. Kartta lukee ammattilaiset suoraan tietokannasta, joten uudet yritykset näkyvät heti ilman erillistä päivitystä.

## Kaksi asiaa jotka poikkeavat pyynnöstä

1. **Kartan keskipiste.** Kiinteistöllä ei ole tallennettuja koordinaatteja tietokannassa — vain osoite, postinumero ja kaupunki. Geokoodaan kiinteistön osoitteen kartan avautuessa ja keskitän kartan siihen; jos osoite puuttuu, keskitän maakunnan mukaan.
2. **Ammattilaisen tila.** Taulussa ei ole `status`-saraketta vaan `aktiivinen` (kyllä/ei). Suodatan sillä.

## Tekniset yksityiskohdat

- Paketti: `mapbox-gl` + `@types/mapbox-gl`
- Mapbox-avain: käytetään Lovablen Mapbox-liitäntää (connector), joka tuo julkisen tokenin selaimeen (`VITE_LOVABLE_CONNECTOR_MAPBOX_PUBLIC_TOKEN`) ja salaisen tokenin palvelinpuolen geokoodaukseen gatewayn kautta. Tämä on turvallisempi kuin tokenin käsinlisäys; pyydän liitännän yhdistämistä työn alussa.
- Geokoodaus (osoite → lat/lng) tehdään palvelinfunktiossa `src/lib/liidit.functions.ts`, ei selaimessa.
- Kartta ladataan vain selaimessa (`ClientOnly` + dynaaminen import), koska sovellus renderöi palvelimella.
- Uusi julkinen-kirjautuneille palvelinfunktio: hae ammattilaiset kategorian + maakunnan mukaan (vain nimi, arvosana, arviomäärä, koordinaatit — ei sähköpostia tai puhelinta).
- `luoLiidi`-validointi laajenee: `valinta_tapa` ja `valitut_ammattilaiset` (max 3).

## Varmistus
- `bun run build` ja `tsgo` läpi
- Selaintarkistus: lomakkeen valintaosio, karttamodaalin avautuminen, valinnan maksimi 3, yhteenvetoteksti
- Ei konsolivirheitä

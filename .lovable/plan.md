## Tavoite
1. "Lisää kiinteistö" -dialogiin (yläpalkin kiinteistövalitsin) sama Ryhti-haku kuin Talon tiedot -sivulla.
2. Talon tiedot -sivulta poistetaan "Hankintatapa"-kenttä.

## 1. Ryhti-haku lisäysdialogiin

**`src/components/property-switcher.tsx`**
- Osoite/Kaupunki-kenttien alle sama outline-nappi kuin talon tiedoissa: katkoviivareunus, teal-sävy, `🔍 Hae talon tiedot Ryhti-rajapinnasta` / lataustilassa `Loader2` + "Haetaan tietoja...".
- Alle apuvirke "Täyttää kodin viralliset perustiedot automaattisesti." + "Mikä Ryhti?" -linkki, joka avaa saman info-tekstin (pieni sisäkkäinen selitelaatikko dialogin sisällä, ei uutta modaalia modaalin päälle).
- Nappi disabloitu jos osoite tyhjä. Kutsuu olemassa olevaa `haeRyhtiTiedot`-server functionia (`useServerFn`) osoitteella + kaupungilla.
- Onnistuessa haetut arvot tallennetaan dialogin paikalliseen tilaan `ryhtiTiedot` ja näytetään dialogissa pienenä yhteenvetona (esim. "✓ Ryhti: rakennusvuosi 1998 · 142 m² · 2 krs · maalämpö"), jotta käyttäjä näkee mitä tallennetaan. Toast: "✓ Talon tiedot haettu Ryhti-rajapinnasta."
- Virheet samoin viestein kuin talon tiedoissa (`NO_ADDRESS`/`NO_BUILDING` → "Rakennusta ei löydy tällä osoitteella…", `TIMEOUT`/`UPSTREAM_ERROR` → "Ryhti-palvelu ei vastaa juuri nyt…").
- Jos käyttäjä muuttaa osoitetta haun jälkeen, `ryhtiTiedot` nollataan.
- "Lisää"-napissa haetut arvot lähetetään `addKiinteisto`-kutsun mukana.

**`src/lib/kotivahti.functions.ts`**
- `lisaaKiinteistoSchema`: lisätään valinnaiset kentät `rakennusvuosi`, `pinta_ala`, `kerroksia`, `lammitysmuoto`, `julkisivumateriaali` (kaikki nullable/optional).
- `addKiinteisto`-handler: `rakennusvuosi` menee jo `kiinteistot`-riville; `talon_tiedot`-insertiin lisätään `pinta_ala`, `kerroksia`, `lammitysmuoto`, `julkisivumateriaali` niiltä osin kuin arvo on annettu.

Ei uutta migraatiota — kaikki sarakkeet ovat jo olemassa.

## 2. Hankintatapa pois

**`src/routes/_authenticated/talon-tiedot.tsx`**
- Poistetaan "Hankintatapa"-`Field` (Select) perustiedoista; "Ostettu / rakennettu (vuosi)" jää yksinään riville.
- Poistetaan `hankintatapa` tallennuspayloadista ja `HANKINTATAVAT`-import/lista jos se jää käyttämättömäksi.

**`src/lib/kotivahti.functions.ts`**
- Poistetaan `hankintatapa` tallennuksen skeemasta ja updatesta.

Tietokantasaraketta ei poisteta (ei tarpeen, ei riskiä).

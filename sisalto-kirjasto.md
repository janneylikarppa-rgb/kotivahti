# KOTILUOTSI – SISÄLTÖKIRJASTO

Päivitetty: 2026-06-21

Lähde: koodikannan automaattipoiminta + kuratoidut sisältötiedostot.

Käytetään referenssinä ja tekstipäivitysten pohjana.


---


## 1. PTS-SUUNNITELMA – sisältötekstit

**Lähde:** `src/lib/pts-sisaltotekstit.ts`

Jokaisella kohteella on kolme viestiä: (0) faktat/ennaltaehkäisy, (1) riskit kun lähestyy, (2) konkreettiset seuraukset kun ylitetty.


### Öljykattila
Käyttöikä / huoltoväli: 25 v
- **Viesti 1 (seurannassa/lähivuosina):** "Öljykattilan tekninen käyttöikä on tyypillisesti noin 25 vuotta. Vuosihuolto on lakisääteinen ja pitää hyötysuhteen kunnossa."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Kattilan ikääntyessä hajoamisriski kasvaa erityisesti kovilla pakkasilla, jolloin uutta laitetta ja asentajaa on vaikea saada nopeasti. Suunnittele lämmitysjärjestelmän uusiminen etukäteen."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä on selvästi ylitetty. Yllättävä hajoaminen pakkasella aiheuttaa lämmityskatkon ja kiireellisen vaihdon, joka on aina kalleimmasta päästä."

### Maalämpöpumppu
Käyttöikä / huoltoväli: 22 v
- **Viesti 1 (seurannassa/lähivuosina):** "Maalämpöpumpun käyttöikä on noin 22 vuotta. Vuosittainen huolto pidentää käyttöikää ja varmistaa hyötysuhteen."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Kompressorin vikaantuminen on yleisin syy uusimiseen. Vanhempi laite kannattaa huoltaa ja varata budjettia uusimiselle ennen yllätyksiä."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: kompressorivika voi tarkoittaa koko sisäyksikön uusimista. Ennakointi säästää tuhansia euroja."

### Ilma-vesilämpöpumppu
Käyttöikä / huoltoväli: 18 v
- **Viesti 1 (seurannassa/lähivuosina):** "Ilma-vesilämpöpumpun käyttöikä on noin 18 vuotta. Suodattimien puhdistus ja vuosihuolto ovat tärkeitä."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanha ulkoyksikkö menettää hyötysuhdettaan, mikä näkyy sähkölaskussa erityisesti pakkasella."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä on ylitetty. Hajoamisriski kasvaa ja varaosien saatavuus heikkenee – suunnittele uusiminen."

### Ilmalämpöpumppu
Käyttöikä / huoltoväli: 14 v
- **Viesti 1 (seurannassa/lähivuosina):** "Ilmalämpöpumpun käyttöikä on noin 14 vuotta. Suodattimien pesu pari kertaa vuodessa pidentää ikää."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanhentuva laite kuluttaa enemmän ja jäähdyttää heikommin. Vaihto uuteen maksaa itsensä takaisin energiansäästönä."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: hyötysuhde voi olla puolet uudesta. Uusiminen kannattaa pian."

### Kaukolämpövaihdin
Käyttöikä / huoltoväli: 25 v
- **Viesti 1 (seurannassa/lähivuosina):** "Kaukolämpövaihtimen käyttöikä on noin 25 vuotta. Tarkastus 5–10 vuoden välein pitää järjestelmän kunnossa."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vuotava vaihdin aiheuttaa vesivahingon ja lämmityskatkon. Ennakoiva uusiminen on huomattavasti edullisempi."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: vuotoriski on kasvanut merkittävästi. Suomessa tapahtuu vuosittain noin 60 000 vesivahinkoa – moni alkaa juuri vanhasta lämmönlähteestä."

### Poistoilmalämpöpumppu
Käyttöikä / huoltoväli: 20 v
- **Viesti 1 (seurannassa/lähivuosina):** "Poistoilmalämpöpumpun käyttöikä on noin 20 vuotta. Suodattimien vaihto ja huolto pari vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanha PILP heikentää ilmanvaihtoa ja kasvattaa sähkönkulutusta huomaamatta."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: uusi laite parantaa sekä ilmanlaatua että lämmityskustannuksia."

### Sähkökattila
Käyttöikä / huoltoväli: 25 v
- **Viesti 1 (seurannassa/lähivuosina):** "Sähkökattilan käyttöikä on noin 25 vuotta. Vastuselementtien tarkastus 5 vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanhentuva kattila voi vuotaa, ja sähköviat aiheuttavat tulipaloriskin. Suunnittele uusiminen."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: turvallisuus- ja vuotoriski on todellinen. Uusiminen on suositeltavaa."

### Sähköpatterit
Käyttöikä / huoltoväli: 30 v
- **Viesti 1 (seurannassa/lähivuosina):** "Suora sähkölämmitys kestää noin 30 vuotta. Tarkasta termostaattien toiminta ja patterien pinta säännöllisesti."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanhat patterit ja termostaatit kuluttavat enemmän. Uusiminen tai lämmitysmuodon vaihto tuo selvät säästöt."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: harkitse lämpöpumpun lisäämistä rinnalle – takaisinmaksuaika on usein lyhyt."

### Ilmanvaihtokone
Käyttöikä / huoltoväli: 20 v
- **Viesti 1 (seurannassa/lähivuosina):** "Ilmanvaihtokoneen käyttöikä on noin 20 vuotta. Suodattimet vaihdetaan 1–2 kertaa vuodessa ja kone huolletaan 5 vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanhentunut IV-kone heikentää sisäilmaa ja voi aiheuttaa kosteusongelmia rakenteissa."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: huono ilmanvaihto on yksi yleisimmistä syistä kosteusvaurioihin. Uusiminen on kannattavaa."

### Painovoimaisen ilmanvaihdon kartoitus
Käyttöikä / huoltoväli: 15–20 v
- **Viesti 1 (seurannassa/lähivuosina):** "Painovoimainen ilmanvaihto toimii ilman konetta – lämpötilaerojen ja tuulen avulla. Suositellaan ilmanvaihdon tilanteen kartoitusta noin 15–20 vuoden välein. Tyypillisiä puutteita: ilmanvaihto heikkenee talvella tuulettomilla keleillä, ei lämmöntalteenottoa (hukkaa 30–40 % lämmitysenergiasta), korvausilma tulee hallitsemattomasti rakenteiden raoista ja kosteus voi tiivistyä rakenteisiin. Hormien tukkeutuminen ja tiivistyneet ikkunat heikentävät toimintaa entisestään."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Painovoimaisen ilmanvaihdon riittävyys kannattaa tarkistuttaa: heikko ilmanvaihto kasvattaa kosteus- ja homevaurioiden riskiä sekä heikentää sisäilman laatua. Kartoituksessa selviää, riittääkö nykyinen järjestelmä vai tarvitaanko korvausilmaventtiilejä, hormien puhdistus tai koneellisen poiston/LTO:n lisäys."
- **Viesti 3 (pitkään ylitetty):** "Kartoitus on viivästynyt. Tilaa ilmanvaihdon kuntoarvio ammattilaiselta – painovoimaisen järjestelmän puutteet näkyvät usein vasta kosteusvaurioina tai sisäilmaoireiluna."

### Käyttövesiputkisto
Käyttöikä / huoltoväli: 40 v
- **Viesti 1 (seurannassa/lähivuosina):** "Käyttövesiputkien käyttöikä on noin 40 vuotta. Tarkasta liitokset säännöllisesti vuotojen varalta."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanhat putket vuotavat usein piilossa rakenteissa. Vesivahinko ei aina ole vakuutuksen korvattava, jos putkisto on selvästi yli iän."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: piilevän vuodon riski on suuri. Vakuutus ei korvaa pitkäaikaista kosteusvauriota – putkiremonttia kannattaa harkita."

### Viemäröinti
Käyttöikä / huoltoväli: 40 v
- **Viesti 1 (seurannassa/lähivuosina):** "Viemäreiden käyttöikä on noin 40 vuotta. Kuvaus 10 vuoden välein paljastaa alkavat ongelmat."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Tukkeumat ja juurivuodot ovat tavallisia vanhassa viemäristössä. Sukitus on pinnoittamista nopeampi ja edullisempi vaihtoehto uusimiselle."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: viemäririkko aiheuttaa hajuhaittoja ja kosteusvaurion alapohjaan. Kuvaus ja sukitus kannattaa tehdä pian."

### Peltikatto
Käyttöikä / huoltoväli: 40 v
- **Viesti 1 (seurannassa/lähivuosina):** "Peltikaton käyttöikä on noin 40 vuotta. Maalaus 10–15 vuoden välein pidentää käyttöikää."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Ruoste etenee piilossa. Vuotava katto kastelee yläpohjan eristeet, jotka kuivuvat hitaasti."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: katon uusiminen kannattaa ennen ensimmäistä vuotoa – yläpohjavaurio maksaa moninkertaisesti."

### Tiilikatto
Käyttöikä / huoltoväli: 50 v
- **Viesti 1 (seurannassa/lähivuosina):** "Tiilikaton käyttöikä on noin 50 vuotta. Tarkasta tiilien ehjyys ja aluskate säännöllisesti."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Rikkoutunut tiili tai vuotava aluskate aiheuttaa kosteusvaurion. Säännöllinen tarkastus on edullinen vakuutus."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: aluskate on todennäköisesti elinkaarensa päässä, vaikka tiilet näyttäisivät hyväkuntoisilta."

### Bitumihuopa
Käyttöikä / huoltoväli: 20 v
- **Viesti 1 (seurannassa/lähivuosina):** "Bitumihuopakatto kestää noin 20 vuotta. Tarkasta saumat ja läpiviennit vuosittain."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Halkeillut huopa vuotaa nopeasti. Uusiminen ennen vuotoa estää yläpohjavaurion."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: uusiminen on kiireellinen toimenpide. Bitumin haurastuminen lisää vuotoriskiä jokaisena talvena."

### Puujulkisivun maalaus
Käyttöikä / huoltoväli: 8–12 v
- **Viesti 1 (seurannassa/lähivuosina):** "Puujulkisivun maalaus tehdään 8–12 vuoden välein. Pesu ja huoltomaalaus pidentävät käsittelyn käyttöikää."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Hilseilevä maali altistaa puun säälle. Lahovaurio etenee pian, kun puu on suojaamattomana."
- **Viesti 3 (pitkään ylitetty):** "Maalauskäsittely on ohittanut käyttöikänsä. Lahovaurioiden riski kasvaa nopeasti – maalaus kannattaa tilata ensi kaudelle."

### Puujulkisivun uusiminen
Käyttöikä / huoltoväli: 50 v
- **Viesti 1 (seurannassa/lähivuosina):** "Puujulkisivun (lautaverhouksen) tekninen käyttöikä on noin 50 vuotta säännöllisellä huoltomaalauksella. Tarkkaile erityisesti sokkelin yläosaa, ikkunoiden ympäristöä ja räystäiden alaosia – niissä lahovauriot näkyvät ensin."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Lahonneet laudat kannattaa vaihtaa ajoissa. Jos vaurioita on laajemmin, koko verhouksen uusiminen tulee suunnitella – samalla voi parantaa lisäeristystä."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: verhouksen uusiminen on ajankohtaista. Piilevät lahovauriot voivat ulottua tuulensuojaan ja runkoon asti."

### Hirsijulkisivun peruskorjaus
Käyttöikä / huoltoväli: 80–100 v
- **Viesti 1 (seurannassa/lähivuosina):** "Hirsijulkisivu kestää oikein hoidettuna jopa 80–100 vuotta. Hirsien välien tilkkeet ja ulkopinnan käsittely tarkastetaan noin 15 vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vajonneet tilkkeet ja vaurioitunut pintakäsittely päästävät kosteuden hirteen. Tilkitse ja käsittele ajoissa."
- **Viesti 3 (pitkään ylitetty):** "Peruskorjaus on viivästynyt. Hirsien alaosat ja nurkat kannattaa tarkastuttaa – paikalliset vauriot voi vielä korjata ennen suurempaa työtä."

### Tiilijulkisivun saumaus
Käyttöikä / huoltoväli: 40 v
- **Viesti 1 (seurannassa/lähivuosina):** "Tiilijulkisivu kestää 100+ vuotta, mutta saumalaastit haurastuvat ja niiden uusiminen on tarpeen noin 40 vuoden välein. Pienet saumakorjaukset tehdään 10 vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Rapistuneet saumat päästävät kosteuden tiiliin – pakkasrapautuminen voi vaurioittaa tiiliä peruuttamattomasti."
- **Viesti 3 (pitkään ylitetty):** "Saumaus on viivästynyt: pakkasrapautumisriski on todellinen. Tarkastuta julkisivu ja saumaa kuluneet kohdat pian."

### Rapatun julkisivun huolto
Käyttöikä / huoltoväli: 30–50 v
- **Viesti 1 (seurannassa/lähivuosina):** "Rappauspinnan käyttöikä on noin 30–50 vuotta. Halkeamat ja irronneet kohdat kannattaa paikata 10 vuoden välein, ja pinta huoltomaalata noin 15–20 vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Halkeamat päästävät veden rappauksen taakse, jolloin pakkanen irrottaa pintoja laajemmalti. Paikkaa ja maalaa ajoissa."
- **Viesti 3 (pitkään ylitetty):** "Huoltoaika ylitetty: pakkasvaurioiden ja kosteusongelmien riski on suuri. Tilaa rappauksen kuntoarvio."

### Levyverhouksen uusiminen
Käyttöikä / huoltoväli: 40 v
- **Viesti 1 (seurannassa/lähivuosina):** "Levyverhouksen (kuitusementti, mineriittilevy yms.) käyttöikä on noin 40 vuotta. Saumat, kiinnikkeet ja tuuletusrako tarkastetaan 10 vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanhat levyt voivat sisältää asbestia – ennen 1988 asennettujen levyjen purkutyö vaatii asbestikartoituksen. Suunnittele uusiminen huolella."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: kiinnitysten ja tuuletuksen kunto on syytä tarkistuttaa. Uusimisen yhteydessä asbestin mahdollisuus huomioitava."

### Peltijulkisivun maalaus
Käyttöikä / huoltoväli: 20 v
- **Viesti 1 (seurannassa/lähivuosina):** "Peltijulkisivun maalipinta uusitaan noin 20 vuoden välein. Pinta pestään ja paikkamaalataan 5 vuoden välein."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Ruoste etenee maalipinnan rikkoutuessa nopeasti. Paikkamaalaus on edullinen tapa ehkäistä laajaa korroosiota."
- **Viesti 3 (pitkään ylitetty):** "Maalaus on viivästynyt: ruostevauriot voivat vaatia jo levyjen vaihtoa. Tilaa kuntoarvio."

### Salaojat
Käyttöikä / huoltoväli: 40 v
- **Viesti 1 (seurannassa/lähivuosina):** "Salaojien käyttöikä on noin 40 vuotta. Tarkastus 5 vuoden välein paljastaa tukkeumat."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Tukkeutuneet salaojat ohjaavat veden perustuksia vasten. Tämä on yleisin syy kellarin kosteusongelmiin."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: salaojien uusiminen on iso urakka mutta välttämätön. Routa- ja kosteusvauriot ovat moninkertaisesti kalliimpia korjata."

### Ikkunat
Käyttöikä / huoltoväli: 30 v
- **Viesti 1 (seurannassa/lähivuosina):** "Ikkunoiden käyttöikä on noin 30 vuotta. Tiivisteet ja heloitukset kannattaa huoltaa säännöllisesti."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Vanhat ikkunat vuotavat lämpöä ja vetoa. Uusiminen on iso investointi mutta tuo merkittävät energiasäästöt."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: ikkunoiden uusiminen on yleensä kannattavaa sekä energian että viihtyvyyden takia."

### Kylpyhuone / märkätila
Käyttöikä / huoltoväli: 3–5 v
- **Viesti 1 (seurannassa/lähivuosina):** "Kylpyhuoneen silikonisaumat kannattaa uusia 3–5 vuoden välein – se on edullisin tapa pidentää märkätilan käyttöikää ja estää kosteus rakenteisiin. Silikonin vanhetessa vesitiiveys ja homesuojaus heikkenevät huomaamattomasti. Tarkastus kerran vuodessa, uusiminen säännöllisesti."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Kylpyhuoneesi silikonisaumojen huolto on ajankohtainen. Ikääntynyt silikoni menettää elastisuutensa – kosteus pääsee rakenteisiin ennen kuin se näkyy pinnassa. Silikonien säännöllinen uusiminen on kustannustehokkain tapa estää kosteusvaurio ja pidentää kylpyhuoneen käyttöikää merkittävästi."
- **Viesti 3 (pitkään ylitetty):** "Kylpyhuoneesi on iässä jolloin vedeneristyksen kunto kannattaa selvittää kosteuskartoituksella. Pitkäaikaisesta kosteusvauriosta johtuva remontti maksaa tyypillisesti 15 000–40 000 euroa – ajoissa tehty kartoitus ja silikonien uusiminen murto-osan tästä. Vakuutus ei korvaa laiminlyötyä kunnossapitoa."

### Terassi (puu)
Käyttöikä / huoltoväli: 20 v
- **Viesti 1 (seurannassa/lähivuosina):** "Puuterassin käyttöikä on noin 20 vuotta. Öljyäminen joka 2–3 vuosi pidentää käyttöikää huomattavasti."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Lahonneet rakenteet ovat turvallisuusriski. Tarkasta erityisesti kantavat tolpat ja pintalaudat."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: rakenteiden uusiminen on suositeltavaa turvallisuussyistä."

### Terassin lasitus
Käyttöikä / huoltoväli: 25–30 v
- **Viesti 1 (seurannassa/lähivuosina):** "Terassilasituksen käyttöikä on noin 25–30 vuotta. Kiskot, rullat ja tiivisteet kannattaa tarkastaa ja puhdistaa noin 2 vuoden välein – jumiutuneet rullat aiheuttavat lasien rikkoutumisen."
- **Viesti 2 (kiireellinen / ei ylitetty):** "Tiivisteiden kovettuminen, kiskojen jumittuminen tai vesivuoto kiskoja pitkin viittaa huoltotarpeeseen. Tarkasta myös pulttien kireys ja lasien kiinnitys."
- **Viesti 3 (pitkään ylitetty):** "Käyttöikä ylitetty: tiivisteiden, kiskojen ja koneiston uusiminen tai koko järjestelmän vaihto kannattaa suunnitella – vesivuoto saattaa vaurioittaa terassirakennetta."

### Oletustekstit (jos kohdetta ei löydy)
- Viesti 1: "Suositeltu toimenpide lähestyy. Varaa aika asiantuntijalle hyvissä ajoin."
- Viesti 2: "Toimenpide kannattaa tehdä lähivuosina, jotta vältät kiireelliset ja kalliit korjaukset."
- Viesti 3: "Toimenpide on viivästynyt. Tilaa ammattilaisen arvio mahdollisimman pian."

---


## 2. VUOSIKELLO – huoltokohteet

**Lähde:** `src/lib/vuosikello-data.ts` (PERUSHUOLLOT + dynaamiset säännöt)


### Kevät (maalis–touko) 🌱
- IV-suodattimien vaihto / puhdistus (ammattilainen)
- Katon tarkastus lumen sulamisen jälkeen (ammattilainen)
- Räystäskourujen ja syöksytorvien puhdistus (ammattilainen)
- Salaojien tarkastus ja huuhtelu (ammattilainen)
- Sokkelin ja perustusten tarkastus (ammattilainen)
- Lattiakaivojen ja hajulukkojen puhdistus
- Ilmalämpöpumpun puhdistus ja suodattimet (ammattilainen)
- Palovaroittimien testaus ja paristot
- Vikavirtasuojan testaus
- Pyykinpesukoneen ja astianpesukoneen vesiletkujen tarkastus
- Ikkunoiden pesu ja tiivisteiden tarkastus (ammattilainen)
- Aurinkopaneelien puhdistus
- Nurmikon ja pensasaidan kevätkunnostus (ammattilainen)
- Lämmityksen kesäasetukset
- Ulkovesipisteen avaus

### Kesä (kesä–elo) ☀️
- Julkisivun tarkastus ja pesu (ammattilainen)
- Terassin hoito ja pintakäsittely (ammattilainen)
- Pihalaatoituksen tarkastus (ammattilainen)
- Lämmitysjärjestelmän kesäkäynti
- Ulkovalaistuksen tarkastus
- Nurmikon ja istutusten hoito
- Lattiakaivojen puhdistus
- Aurinkopaneelien tuoton seuranta

### Syksy (syys–marras) 🍂
- Lämmityksen käyttöönotto talvikaudeksi
- Ikkunoiden ja ovien tiivisteiden tarkastus (ammattilainen)
- Räystäskourujen tyhjennys lehdistä (ammattilainen)
- Käsisammuttimen tarkastus
- Palovaroittimien testaus ja paristot
- Vikavirtasuojan testaus
- Pesukoneiden vesiletkujen tarkastus
- Ulkovesipisteen talvisulku ja tyhjennys
- Ilmalämpöpumpun talvivalmistelu

### Talvi (joulu–helmi) ❄️
- Katon lumikuorman seuranta
- Putkien jäätymisriskin seuranta
- IV-suodattimien tarkastus
- Lumikinosten poisto seiniltä ja poistumisteiltä
- Kiukaan ja kiuaskivien tarkastus
- Märkätilojen silikonien tarkastus
- Lattiakaivojen puhdistus

### Ympäri vuoden 🔁
- Palovaroittimien kuukausitesti
- Vikavirtasuojan kuukausitesti
- Ilmalämpöpumpun suodattimien puhdistus (ammattilainen)
- Energiankulutuksen seuranta (mittarilukemat)
- Vesivuotojen tarkkailu (keittiö, kylpyhuone, kodinhoito)
- Lämminvesivaraajan toiminnan tarkkailu
- Patteriventtiilien toiminnan tarkastus
- Vesijohtoverkon painetason seuranta
- Liesituulettimen rasvasuodattimen puhdistus
- IV-venttiilien puhdistus

**Dynaamiset, talon tiedoista riippuvat huollot** (lisätään automaattisesti):
- Öljylämmitys → syksy: "Öljykattilan vuosihuolto (ammattilainen)" + "Öljysäiliön tilan tarkastus"; kevät: "Öljysäiliön kunnon silmämääräinen tarkastus"
- Maalämpö → kevät: "Maalämpöpumpun määräaikaishuolto (2–3 v välein)"; syksy: "Lämmönkeruupiirin paineen tarkastus"
- Ilma-vesilämpö → kevät/syksy: "Ilma-vesilämpöpumpun keväthuolto / syksyn tarkastus"
- Pellettilämmitys → syksy: "Pellettikattilan vuosihuolto"; kesä: "Pellettivaraston ja syötön puhdistus"
- Puulämmitys → kesä: "Puukattilan ja savuhormin nuohous / tarkastus"
- Kaukolämpö → syksy: "Lämmönjakokeskuksen tarkastus"
- Sähkölämmitys → kevät: "Sähkövaraajan vastusten ja anodin tarkastus"
- Ilmalämpöpumppu lisälaitteena → ympäri vuoden: suodattimien puhdistus; kevät: ulkoyksikön puhdistus
- LTO-ilmanvaihto → kevät+syksy: suodattimien vaihto; ympäri vuoden: lämmöntalteenoton tarkastus
- Koneellinen poisto → kevät: "Poistoilmapuhaltimen puhdistus"
- Peltikatto → kesä: "Peltikaton ruosteen ja maalipinnan tarkastus"
- Huopakatto → kesä: "Huopakaton saumojen ja pintakerroksen tarkastus"
- Puuterassi → kesä: "Terassilaudoituksen öljyäminen / käsittely"
- Lasitettu terassi → kevät: "Terassilasien pesu ja kiskojen puhdistus"; kesä: "Terassilasituksen tiivisteiden ja rullien tarkastus"
- Puujulkisivu → kesä: "Puujulkisivun maalipinnan tarkastus"
- Nuohousta vaativat hormit (puukiuas / poltto / hormillinen) → kesä: "Nuohouksen tilaus"


### Huolto-infopaketit (vuosikellon riveille)
**Lähde:** `src/lib/huolto-infot.ts` (avainsanasovitus rivin nimestä)

**Silikonit / saumat**
- *Miksi:* Märkätilojen silikonisaumat estävät veden pääsyn rakenteisiin. Jos saumat halkeavat tai irtoavat, kosteus voi päästä laatoituksen taakse ja aiheuttaa pahimmillaan vaurioita seinärakenteisiin.
- *Miten:* Tarkasta suihkun, kylpyammeen ja pesualtaiden silikonisaumat silmämääräisesti. Etsi halkeamia, tummumia, irtoamista tai homekasvustoa. Pienen, ehjän halkeaman voi tilkitä itse sanitaarisilikonilla.
- *Milloin ammattilainen:* Jos laattojen taakse epäillään päässeen vettä, sauma irtoaa laajalti tai vedeneristyksen kunto mietityttää, tilaa ammattilaisen tarkastus.
- *Vinkki:* Silikonisaumojen tyypillinen käyttöikä on 3–5 vuotta käytöstä riippuen.

**Palovaroitin**
- *Miksi:* Toimiva palovaroitin on lakisääteinen ja voi pelastaa hengen. Pariston tyhjenemiseen ei aina muista varautua.
- *Miten:* Paina varoittimen testinappia, kunnes kuulet hälytysäänen. Vaihda paristo vähintään kerran vuodessa tai aina kun varoitin piippaa muistutuksena.
- *Vinkki:* Asunnossa pitää olla vähintään yksi palovaroitin alkavaa 60 m² kohti, joka asuinkerroksessa.

**Vikavirtasuoja**
- *Miksi:* Vikavirtasuoja katkaisee sähkön sekunnin murto-osassa, jos virta vuotaa esim. ihmisen kautta. Testaamatta jättäminen voi tarkoittaa, ettei suoja oikeasti toimi hätätilanteessa.
- *Miten:* Paina sähkökeskuksen vikavirtasuojan T-painiketta. Suojan pitää lauetessaan napsauttaa pois päältä. Kytke sen jälkeen takaisin päälle.
- *Milloin ammattilainen:* Jos vikavirtasuoja ei laukea testissä tai sähköt menevät usein poikki ilman selvää syytä, tilaa sähköasentaja.

**IV-suodattimet**
- *Miksi:* Likainen suodatin heikentää ilmanvaihtoa ja kasvattaa sähkönkulutusta. Pahimmillaan epäpuhtaudet päätyvät hengitysilmaan.
- *Miten:* Avaa IV-koneen huoltoluukku, vedä vanhat suodattimet pois ja asenna uudet nuolen osoittamaan suuntaan. Merkitse vaihtopäivä muistiin.
- *Vinkki:* Tavalliset suodattimet vaihdetaan 2 kertaa vuodessa (kevät/syksy). Pölyisellä alueella useammin.

**Ilmalämpöpumpun suodattimet**
- *Miksi:* Tukkeutuneet sisäyksikön suodattimet alentavat lämmityksen hyötysuhdetta ja levittävät pölyä huoneilmaan.
- *Miten:* Avaa sisäyksikön etukansi, irrota suodattimet ja huuhtele ne haalealla vedellä. Anna kuivua kunnolla ennen takaisinpanoa.
- *Vinkki:* Puhdista suodattimet vähintään kerran kuukaudessa lämmityskauden aikana.

**Ilmalämpöpumpun ulkoyksikkö**
- *Miksi:* Pölyyntyneet lamellit estävät lämmönsiirtymistä ja heikentävät pumpun toimintaa erityisesti pakkasilla.
- *Miten:* Sammuta laite. Harjaa lamelleista varovasti pöly ja roskat. Voit huuhdella matalapaineisella vedellä – älä paineta painepesurilla.
- *Milloin ammattilainen:* Jos pumppu tipputtaa runsaasti vettä, jäätyy toistuvasti tai pitää epätavallista ääntä, tilaa ammattilaisen tarkastus.

**Räystäät / kourut / syöksyt**
- *Miksi:* Tukkeutuneet kourut ja syöksyt ohjaavat sadeveden seinärakenteisiin ja perustuksiin. Tämä on yksi yleisimmistä kosteusvaurioiden syistä.
- *Miten:* Käytä tukevia tikkaita ja varovaisuutta. Poista lehdet, neulaset ja muu liete kouruista työhön tarkoitetuilla välineillä. Huuhtele lopuksi vedellä – veden pitää virrata vapaasti syöksytorvesta ulos.
- *Milloin ammattilainen:* Ammattilainen tekee työn turvallisesti ja puhdistukseen tarkoitetuilla välineillä yleensä suoraan maasta käsin. Työ on nopea toimenpide, joten mikäli et ole varma mitä teet niin ammattilaisen apu on hyvä vaihtoehto.

**Salaojat**
- *Miksi:* Salaojat pitävät pohjaveden poissa perustuksista. Tukkiutuessaan ne aiheuttavat kosteusvaurioita kellariin ja perustuksiin.
- *Miten:* Avaa tarkastuskaivot ja tarkista, ettei pohjalla ole liettä tai juuria. Veden pitää virrata vapaasti.
- *Milloin ammattilainen:* Salaojien huuhtelu tehdään ammattilaisen painepesulaitteella – tämä ei ole DIY-työ.
- *Vinkki:* Salaojat suositellaan huuhdeltavaksi 5–10 vuoden välein.

**Lattiakaivot / hajulukot**
- *Miksi:* Lattiakaivoon kerääntyy nukkaa, hiuksia ja saippuajämiä, jotka tukkivat viemärin ja levittävät hajua.
- *Miten:* Irrota säleikkö ja vesilukon kuppi. Puhdista kaikki osat lämpimällä vedellä ja harjalla. Asenna takaisin niin, että vesilukko on paikoillaan.
- *Vinkki:* Puhdista vähintään 2 kertaa vuodessa – kylpyhuoneissa useammin.

**Pesukoneiden vesiletkut**
- *Miksi:* Vanhentuneet kumiletkut ovat yleisimpiä vuotojen aiheuttajia. Pieni vuoto voi aiheuttaa kymmenien tuhansien eurojen vahingot.
- *Miten:* Tarkista letkujen kunto: ei halkeamia, kovettumia tai kosteutta liitoksissa. Sulje vesi käytön jälkeen, jos mahdollista.
- *Vinkki:* Vaihda letkut 5–10 vuoden välein, vaikka ne näyttäisivät hyväkuntoisilta.

**Nuohous / hormi**
- *Miksi:* Nuohous on lakisääteinen ja ehkäisee hormipalon. Likainen piippu vetää huonosti ja kuluttaa enemmän polttopuita.
- *Miten:* Tilaa piirin nuohooja vuosittain. Nuohooja antaa kirjallisen pöytäkirjan.
- *Vinkki:* Vakituisesti asutun talon takka ja hormi on nuohottava vuosittain, vapaa-ajan asunnon harvemmin.

**Katon tarkastus / pelti / huopa**
- *Miksi:* Olosuhteet ja ikä aiheuttavat vuosittain vahinkoja kattomateriaaleihin. Pienet viat huomataan helposti, jos katto tarkastetaan säännöllisesti.
- *Miten:* Tarkista: irronneet pellit/tiilet, ruoste, halkeamat tai sammalkasvustot. Tarkista myös läpiviennit ja yläpohja mahdollisten vuotojen varalta.
- *Milloin ammattilainen:* Jyrkkä tai liukas katto on aina ammattilaisen työ – yleisesti on suositeltavaa antaa ammattilaisen tarkastaa katto ja siihen liittyvät rakenteet. Tarkastuksessa saat selkeän kuvan kattosi tilanteesta.

**Lumikuorma / jääpuikot**
- *Miksi:* Suuri lumikuorma voi vaurioittaa kattorakenteita. Jääpuikot voivat pudotessaan aiheuttaa vakavia tapaturmia.
- *Miten:* Seuraa lumikuorman määrää – yli 50 cm märkää lunta on jo paljon. Tilaa lumenpudotus ajoissa.
- *Milloin ammattilainen:* Aina – lumenpudotus on putoamissuojausta vaativaa työtä. Älä yritä itse.

**Ulkovesipiste / talvisulku**
- *Miksi:* Ulkovesipiste jäätyy ja voi rikkoutua talvella, jos sitä ei sulkea ja tyhjennetä.
- *Miten:* Sulje sulkuventtiili sisätiloista (yleensä kellarissa tai teknisessä tilassa) ja avaa ulkohana, jotta vesi valuu pois putkesta.
- *Vinkki:* Tee tämä ennen ensimmäisiä yöpakkasia.

**Julkisivun tarkastus / pesu / puujulkisivu**
- *Miksi:* Säännöllinen tarkastus paljastaa maalin lohkeilut, halkeamat ja kosteusvauriot ajoissa – ennen kuin korjauskustannukset kasvavat.
- *Miten:* Kierrä talo ja tarkista pinnoite, saumat sekä alapellitykset. Pese julkisivu tarvittaessa miedolla puhdistusaineella ja matalapaineisella vedellä.
- *Vinkki:* Puujulkisivun maalipinta uusitaan tyypillisesti 8–15 vuoden välein.

**Terassin öljyäminen / käsittely**
- *Miksi:* Käsittelemätön puuterassi harmaantuu ja halkeilee nopeasti. Säännöllinen öljyäminen pidentää käyttöikää vuosilla.
- *Miten:* Pese terassi puuterassiaineella, anna kuivua kunnolla ja levitä terassiöljy siveltimellä syiden suuntaisesti. Tee kuivalla, lämpimällä säällä.
- *Vinkki:* Käsittele vähintään joka 2. vuosi.

**Ikkunoiden tiivisteet**
- *Miksi:* Vanhentuneet tiivisteet päästävät vetoa ja nostavat lämmityskustannuksia. Niiden vaihto on pieni mutta tuntuva energiansäästötoimi.
- *Miten:* Tarkasta tiivisteet kosketuksella: kovettuneet, halkeilleet tai litistyneet tiivisteet vaihdetaan. Vaihtotiivisteet löytyvät rautakaupasta.
- *Milloin ammattilainen:* Ammattilainen tarkastaa ja arvioi ikkunoiden ja ovien kunnon, saat selkeän kuvan kunnosta ja huoltotarpeesta.
- *Vinkki:* Tarkasta erityisesti pohjoispuolen ja merituulen puoleiset ikkunat.

**Öljykattila / öljysäiliö**
- *Miksi:* Öljykattilan vuosihuolto pitää hyötysuhteen korkeana ja säästää polttoöljyä. Säiliön kuntotarkastus on lisäksi ympäristövastuukysymys.
- *Miten:* Tilaa vuosihuolto ammattilaiselta. Voit itse tarkastaa silmämääräisesti, onko säiliön ympärillä öljyhajua tai kosteutta.
- *Milloin ammattilainen:* Aina kattilan huolto ja säiliön tiiviystarkastus.

**Maalämpö**
- *Miksi:* Säännöllinen huolto varmistaa, ettei keruupiirin paine ole laskenut ja että pumppu toimii suunnitellulla hyötysuhteella.
- *Miten:* Tarkista paineenmittarin lukema (yleensä 0,5–2 bar). Kuuntele, kuuluuko pumpusta epätavallisia ääniä.
- *Milloin ammattilainen:* 2–3 vuoden välein tehtävän määräaikaishuollon tekee aina ammattilainen.

**Kiuas / kiuaskivet**
- *Miksi:* Halkeilleet tai murentuneet kiuaskivet heikentävät löylyä ja voivat aiheuttaa vastusten ylikuumenemista.
- *Miten:* Tyhjennä kivet, pudota irtoroskat pois ja lado kivet löysästi takaisin. Vaurioituneet kivet vaihdetaan uusiin.
- *Vinkki:* Kivien vaihtoväli on tyypillisesti 1–3 vuotta käytöstä riippuen.

**Energiankulutus / mittarilukemat**
- *Miksi:* Säännöllinen seuranta paljastaa nopeasti, jos jokin laite kuluttaa odottamattoman paljon energiaa tai vettä – usein piilevän vian merkki.
- *Miten:* Lue sähkö-, vesi- ja lämpömittarit kuukausittain ja merkitse muistiin (esim. taulukkoon).
- *Vinkki:* Vertaa lukemia edellisvuoden vastaavaan kuukauteen – iso muutos kannattaa selvittää.

**LTO / lämmöntalteenotto**
- *Miksi:* LTO-kennon likaantuminen pudottaa hyötysuhdetta nopeasti ja kasvattaa lämmityslaskua.
- *Miten:* Tarkista kennon kunto huoltoluukun kautta. Jos koneessa on irrotettava kenno, pese se valmistajan ohjeen mukaan.
- *Milloin ammattilainen:* Kondenssivesiviemärin tukos ja sähköiset viat vaativat ammattilaisen.

**Keskuslämmityskattila (puu)**
- *Miksi:* Puukattilan hyötysuhde laskee, jos savukanavat ja tulipesä nokeentuvat. Lika kasvattaa polttoaineenkulutusta ja paloturvallisuusriskiä.
- *Miten:* Tyhjennä tuhka, harjaa savukanavat ja tarkista tiivisteet vähintään kerran lämmityskaudessa. Pidä varaajan paineet ja anodi tarkkailussa.
- *Milloin ammattilainen:* Nuohous ja varaajan tarkistus tehdään ammattilaisen toimesta vuosittain. Kattilan käyttöikä on tyypillisesti 25–30 vuotta.

**Keskuslämmityskattila (öljy)**
- *Miksi:* Öljypoltin ja sen suuttimet likaantuvat käytössä, jolloin palaminen heikkenee ja polttoainekulutus nousee. Säännöllinen huolto on myös vakuutusehto monissa kotivakuutuksissa.
- *Miten:* Tarkkaile poltinta ja kattilan painemittareita. Ilmoita poikkeavista äänistä tai noesta huoltoliikkeelle.
- *Milloin ammattilainen:* Ammattihuolto vuosittain: suuttimen, suodattimen ja palotilan puhdistus. Käyttöikä 20–25 v.

**Keskuslämmityskattila (pelletti)**
- *Miksi:* Pellettipolttimen palopää ja kattilan konvektio-osa likaantuvat tuhkasta ja saostumista. Tukkeumat heikentävät hyötysuhdetta ja voivat sammuttaa kattilan.
- *Miten:* Tyhjennä tuhkalaatikko viikoittain käyttökaudella, harjaa palopää ja kattilan pinnat ohjeen mukaan.
- *Milloin ammattilainen:* Vuosittainen ammattihuolto suositellaan. Käyttöikä 20–25 v.

**Keskuslämmityskattila (sähkö)**
- *Miksi:* Sähkökattilan vastukset ja anodi kuluvat, ja varaajassa voi kertyä sakkaa. Anodin uusiminen suojaa säiliötä korroosiolta.
- *Miten:* Tarkista paisuntasäiliön paine ja varoventtiilin toiminta. Anodi tarkistetaan ammattilaisen toimesta 5 v välein.
- *Milloin ammattilainen:* Vastusten vaihto ja anodin uusinta ovat ammattilaisen töitä. Käyttöikä n. 25 v.

**Lämmitysputkisto (rauta/teräs)**
- *Miksi:* Vanhat teräsputket korrodoituvat sisältä ja voivat alkaa vuotaa lähestyessään käyttöiän loppua (n. 40 v). Vuodot rakenteissa aiheuttavat usein laajoja kosteusvaurioita.
- *Miten:* Seuraa pattereiden ja liitosten ympäristöä silmämääräisesti — ruosteenvärjäykset, kosteat tahrat tai painumat ovat varoitusmerkkejä.
- *Milloin ammattilainen:* Putkiston kuntoarvio ennen 40 v ikää. Uusiminen aina ammattilaisen työ.

**Lämmitysputkisto (kupari/muovi/komposiitti)**
- *Miksi:* Kupari- ja muovipohjaiset lämmitysputket kestävät tyypillisesti 50 v. Liitokset ja jakotukit ovat heikoin lenkki — niitä kannattaa tarkkailla erityisesti.
- *Miten:* Tarkkaile jakotukkien ympäristöä vuosittain. Pidä lukuja patterien menoveden lämpötilasta — selittämätön muutos voi viitata tukkeumaan.
- *Milloin ammattilainen:* Liitosvuodot ja jakotukin huolto kuuluvat LVI-asentajalle.

**Vesikiertoinen lattialämmitys**
- *Miksi:* Lattialämmityksen putkisto on yleensä valettu betoniin — sen käyttöikä on pitkä (n. 50 v), mutta jakotukin huolto ja veden laatu vaikuttavat kestoon.
- *Miten:* Tasapainota piirit jakotukista vuosittain ja varmista paineen riittävyys. Tarkkaile lattian pintalämpöjä — kylmät kohdat voivat viitata ilmaa piirissä tai tukokseen.
- *Milloin ammattilainen:* Piirien huuhtelu ja tasapainotus 10 v välein ammattilaisen toimesta.

**Sähköpatterit / suora sähkölämmitys**
- *Miksi:* Sähköpatterien termostaatit kuluvat ja imevät pölyä, mikä laskee säätötarkkuutta ja kasvattaa kulutusta. Käyttöikä n. 30 v.
- *Miten:* Imuroi patterit kerran vuodessa ja testaa termostaatin reagointi. Vaihda yksittäiset viallisia.
- *Milloin ammattilainen:* Patterin vaihto ja kiinteät asennukset aina sähköasentajalle.

**Lämminvesivaraaja**
- *Miksi:* Lämminvesivaraajan anodi suojaa säiliötä korroosiolta — kun anodi on syöpynyt loppuun, säiliö alkaa ruostua. Vastuksiin kertyy kalkkia, mikä kasvattaa sähkölaskua.
- *Miten:* Tarkasta varoventtiilin toiminta vuosittain (nostamalla vipua hetkeksi). Kuuntele kalkkikiviloksahdusta lämmityksen aikana.
- *Milloin ammattilainen:* Anodi tarkistetaan ja vaihdetaan 3–5 v välein. Vastusten kalkin poisto ja anodinvaihto ovat ammattilaisen töitä. Käyttöikä n. 25 v.

---


## 3. LIIDILOMAKE – tekstit

**Lähde:** `src/lib/liidit-kategoriat.ts`, `src/components/liidi-dialog.tsx`, `src/lib/liidi-kuvauspohja.ts`


### Palvelutyypit
- **Kuntoarvio** (`kuntoarvio`) — Ammattilainen käy arvioimassa tilanteen
- **Huolto** (`huolto`) — Toistuva tai kertaluonteinen huoltotyö
- **Tarjouspyyntö** (`tarjouspyynto`) — Kilpailuta työ useammalta tekijältä

### Kategoriat (16 kpl)
- Ilmanvaihto ja IV-kone
- Katto ja räystäät
- LVI ja putket
- Sähköjärjestelmä
- Kylpyhuone ja märkätilat
- Lämmitysjärjestelmä
- Ilmalämpöpumppu
- Salaojat ja sadevesijärjestelmä
- Julkisivu ja maalaus
- Ikkunat ja ovet
- Terassi ja puurakenteet
- Kosteus ja sisäilma
- Nuohous ja tulisijat
- Piha ja maanrakennus
- Siivouspalvelu
- Muu / yleinen

### Statukset
- **Uusi** (`uusi`)
- **Käsittelyssä** (`kasittelyssa`)
- **Välitetty** (`valitetty`)
- **Valmis** (`valmis`)
- **Peruutettu** (`peruutettu`)

### Liidi-dialogi (komponentin tekstit)
**Lähde:** `src/components/liidi-dialog.tsx`
- "Muu / yleinen"
- "Lähetys epäonnistui"
- "Valitse kiinteistö"
- "Esitäytetään talovahdistasi — voit muokata vapaasti. Täydennä talon tietoja sivulla /talon-tiedot."
- "Kerro mitä haluat tai tarvitset"
- "Kiinteistö"
- "Lähetetään..."
- "Lähetä pyyntö"
- "— Asiakkaan pyyntö —\n${ku}"
- "– ${k.osoite}"
- "(esitaytetty?.palvelu ?? "huolto"); const [kategoria, setKategoria] = useState"
- "(esitaytetty?.kategoria ?? "Muu / yleinen"); const [alkuKategoria, setAlkuKategoria] = useState"
- "(esitaytetty?.kategoria ?? null); const [kuvaus, setKuvaus] = useState(esitaytetty?.kuvaus ?? ""); const [talonTiedot, setTalonTiedot] = useState(""); const [talonTiedotMuokattu, setTalonTiedotMuokattu] = useState(false); const [nimi, setNimi] = useState(""); const [puhelin, setPuhelin] = useState(""); const [sahkoposti, setSahkoposti] = useState(""); const [kiinteistoId, setKiinteistoId] = useState"
- "Pyyntösi on vastaanotettu."
- "Olemme sinuun yhteydessä 1–3 arkipäivän sisällä."
- "Tilaa palvelu"
- "Välitämme pyynnön tarkastetuille oman paikkakuntasi ammattilaiselle. Palvelu on maksuton, ja sen käyttämisestä voit itse päättää."
- "Palvelun tyyppi"
- "Kohde / kategoria"
- "Talon tiedot (kategorian mukaan)"
- "Esitäytetty talovahdistasi — voit muokata vapaasti."
- "Kuvaus"
- "Nimi"
- "Puhelinnumero"
- "Sähköposti"
- "Peruuta"

### Kategoriakohtaiset kuvauspohjat (esitäyttö talon tiedoista)
**Lähde:** `src/lib/liidi-kuvauspohja.ts`
Pohja täyttää kategoriaan sopivat talon tiedot kuvaukseen, esim:
- *Lämmitysjärjestelmä:* "Lämmitysmuoto: {muoto} (asennettu {vuosi}). Ilmalämpöpumppu: {merkki/malli}, asennettu {vuosi}."
- *Ilmanvaihto:* "Ilmanvaihto: {iv} ({vuosi}). Suodatintyyppi {x}, viimeksi vaihdettu {pvm}."
- *Katto:* "Katto: {tyyppi}, {materiaali}, uusittu {vuosi}. Pinta-ala n. {ala} m². Räystäät kunnostettu {vuosi}. Kattoturvatuotteet: {turva}."
- *LVI ja putket:* "Käyttövesiputket: {materiaali}, uusittu {vuosi}. Viemäri: {materiaali}, asennettu {vuosi}."
- *Sähköjärjestelmä:* "Sähköt asennettu {vuosi}. Pääsulun sijainti: {paikka}."
- *Julkisivu:* "Julkisivu: {mat}, asennettu {vuosi}. Viimeksi maalattu {vuosi}."
- *Ikkunat ja ovet:* "Ikkunat: {tyyppi}, uusittu {vuosi}."
- *Terassi:* "Terassi: {mat}, rakennettu {vuosi}, n. {ala} m². Lasitettu {vuosi}. Kunnostettu {vuosi}."
- *Salaojat / sadevesi:* "Salaojat on/ei (tarkastettu {pvm}). Kourut: {mat}, {pituus} m. Syöksytorvia {n} kpl. Sadevesikaivoja {n} kpl."
- *Nuohous / tulisijat:* "Hormit: {x}. Kiuas asennettu {vuosi}. Edellinen nuohous {pvm}."
- *Piha:* "Pihan tyyppi: {x}. Nurmikkoa n. {y} m². Tontin pinta-ala n. {z} m²."
- *Kylpyhuone ja märkätilat:* "Toivon kylpyhuoneeseen tai märkätiloihin liittyvää palvelua."
- *Kosteus ja sisäilma:* "Toivon kosteus- tai sisäilmakartoitusta."
- *Siivouspalvelu:* "Toivon siivouspalvelua (esim. ikkunanpesu, suursiivous)."

---


## 4. SÄHKÖPOSTIPOHJAT

**Lähde:** `src/lib/email.server.ts`, `src/lib/kausikirje.server.ts`


### 4.1 Omistajan ilmoitus uudesta liidistä
**Aihe:** `🔔 Uusi liidi – {kategoria} – {kaupunki}`
**Sisältö (HTML):** Otsikko "UUSI LIIDI – KOTILUOTSI", vastaanottoaika, sekä taulukot:
- *Pyyntö:* Palvelu (Kuntoarvio / Huolto / Tarjouspyyntö), Kategoria
- *Asiakas:* Nimi, Puhelin (tel-linkki), Sähköposti (mailto)
- *Kiinteistö:* Osoite, Kaupunki, Rakennusvuosi, Lämmitys (jos annettu)
- *Kuvaus:* käyttäjän vapaateksti tai "Ei kuvausta"
- *Lisätieto:* käyttäjän vapaateksti (jos annettu)
- CTA-nappi: "Hallinnoi pyyntöä admin-paneelissa →"

### 4.2 Kausikirje – Kevät 🌱
**Aihe:** `🌱 Kotiluotsi – kevään huoltomuistutus`
**Otsikko:** "Kevään huoltomuistutus"
**Avaus:** "Hei {etunimi}, tässä kevään tärkeimmät huoltotoimenpiteet omakotitaloasi varten."
**Kauden tärkeimmät huollot:**
- **IV-suodattimet** – Vaihda ennen kesää – kerää siitepölyä ja katkaisee virtaukset.
- **Räystäskourut** – Tarkista talven jälkeen – tyhjennä lehdet ja roskat.
- **Katon tarkastus** – Halkeamat ja läpiviennit pintaan ennen sateita.
- **Vikavirtasuojan testaus** – Paina testinappia – pitää laueta välittömästi.
- **Salaojat** – Tarkista kevätsulannan jälkeen toimivuus ja kaivot.
**Kysymys:** "Oletko tehnyt kauden huoltoja?"
**Napit:** "✓ Kyllä, tehty" · "⏳ Vielä kesken" · "✗ En vielä – tilaan apua"
**CTA:** "Avaa Kotiluotsi →"
**Alaviite:** "Et halua kausimuistutuksia? Peruuta tilaus →"

### 4.3 Kausikirje – Kesä ☀️
**Aihe:** `☀️ Kotiluotsi – kesän huoltomuistutus`
**Otsikko:** "Kesän huoltomuistutus"
**Kauden tärkeimmät huollot:**
- **Julkisivun kuntokierros** – Halkeamat, maalikalvon kunto, lahot puuosat.
- **Terassin hoito ja tarkastus** – Puhdista, käsittele öljyllä tai kuultolla.
- **Nuohous** – Paras aika kesällä – varaa nuohooja ajoissa.
- **Lattiakaivot** – Kesäpuhdistus – nosta kaivon kansi ja huuhtele.
**Kysymys:** "Miten Kotiluotsi on palvellut tähän mennessä?"
**Napit:** ⭐ / ⭐⭐ / ⭐⭐⭐ / ⭐⭐⭐⭐ / ⭐⭐⭐⭐⭐

### 4.4 Kausikirje – Syksy 🍂
**Aihe:** `🍂 Kotiluotsi – syksyn huoltomuistutus`
**Otsikko:** "Syksyn huoltomuistutus"
**Kauden tärkeimmät huollot:**
- **Lämmityksen käynnistys ja patterit** – Ilmaa patterit ja tarkista toiminta.
- **Räystäskourut** – Puhdista ennen sateita – lehdet tukkivat.
- **Vikavirtasuoja ja palovaroittimet** – Testit + paristot uusiksi.
- **Alkusammutin** – Vuositarkastus – varmista voimassaolo.
- **Ulkovesipisteen talvisulku** – Tyhjennä putket ja sulje sulkuventtiili.
**Kysymys:** "Oletko tehnyt kauden huoltoja?"
**Napit:** "✓ Kyllä, tehty" · "⏳ Vielä kesken" · "✗ En vielä – tilaan apua"

### 4.5 Kausikirje – Talvi ❄️
**Aihe:** `❄️ Kotiluotsi – talven huoltomuistutus`
**Otsikko:** "Talven huoltomuistutus"
**Kauden tärkeimmät huollot:**
- **Lumikuorma katolla** – Seuraa kertymää ja pudota tarvittaessa.
- **Märkätilojen silikonit** – Tarkasta saumat – uusi tarvittaessa.
- **IV-suodattimet** – Talvivaihto – sisäilman laatu kuntoon.
- **Vesiputkien jäätymisriski** – Tarkista eristykset ja kylmät kohdat.
**Kysymys:** "Onko talossa huoltoasioita joihin kaipaat apua?"
**Napit:** "Kyllä, tilaan apua" · "Ei, kaikki hyvin"

### 4.6 Kausikirjeen PTS-huomio-lohko (jos käyttäjällä ajankohtainen PTS-kohde)
"📊 Talosi PTS-suunnitelmasta: **{kohde}** on ajankohtainen – {teksti}"  →  "Katso PTS-suunnitelma →"

### 4.7 Follow-up – kesken-vastauksen jälkeen
**Aihe:** "Kauden huollot vielä kesken? Me autamme"
**Sisältö:** "Hei {etunimi}, Viikko sitten kerroit että {kauden} huollot ovat vielä tekemättä. Kotiluotsin tarkastetut ammattilaiset hoitavat – pyydä tarjous suoraan palvelusta."
**CTA:** "Tilaa ammattilainen →"

### 4.8 Omistajan hälytys – ammattilainen ei reagoinut
**Aihe:** `⚠️ Ammattilainen ei reagoinut – {kategoria} – {kaupunki}`
**Otsikko:** "⚠️ AMMATTILAINEN EI REAGOINUT"
**Sisältö:** "Asiakas ilmoittaa ettei ammattilainen ole ottanut yhteyttä 3 arkipäivään." + taulukko (Asiakas/Puhelin, Kategoria, Palvelu, Kaupunki, Lähetetty)

### 4.9 Sähköpostin teknisiä viestejä (logia)
- "RESEND_API_KEY puuttuu – sähköpostia ei lähetetä" (vain serverilogi)

---


## 5. ADMIN-PANEELI – tekstit

**Lähde:** `src/routes/_authenticated/admin.tsx`
- "Päivitetty"
- "Kaikki"
- "Uusi"
- "Käsittelyssä"
- "Välitetty"
- "Valmis"
- "Lisätty"
- "Poistettu"
- "Koko Suomi"
- "Tallenna"
- "Tallennettu"
- "Testikirje lähetetty"
- "Lähetys epäonnistui"
- "NPS"
- "Kausikirje vastaus-%"
- "Liidi-tyytyväisyys"
- "Reagoimattomat (7pv)"
- "Aktiiviset"
- "Passiiviset"
- "Liidiasiakkaat"
- "Yhteensä"
- "Lähetetään..."
- "Lähetä omaan sähköpostiin"
- "· ${a.puhelin}"
- "${(v.lkm / maxLkm) * 100}%"
- "${((n as number) / (kk.data?.lahetetty || 1)) * 100}%"
- "Tarkistetaan oikeuksia..."
- "Ei käyttöoikeuksia"
- "Vain ylläpitäjät pääsevät tälle sivulle."
- "Admin"
- "Liidien"
- "Liidit"
- "Palaute"
- "Ammattilaiset"
- "Asetukset"
- "x.arvo === s); return ("
- "("kaikki"); const [avoinId, setAvoinId] = useState"
- "Ei liidejä valitulla suodattimella."
- "Aika"
- "Kategoria"
- "Palvelu"
- "Nimi"
- "Puhelin"
- "Osoite"
- "Maakunta"
- "Status"
- "Asiakas"
- "Sähköposti:"
- "Kiinteistö"
- "Lämmitys:"
- "Asiakkaan kuvaus"
- "Lisätieto"
- "Tila"
- "Lisää ammattilainen"
- "Ei ammattilaisia rekisterissä."
- "Aktiivinen"
- "(LIIDI_KATEGORIAT[0]); const [prioriteetti, setPrioriteetti] = useState(1); const [toimialueet, setToimialueet] = useState"
- "Yritys"
- "Sähköposti"
- "Prioriteetti (1 = ylin)"
- "Toimialue (valitse yksi tai useampi)"
- "Tyhjä = koko Suomi. Liidi reititetään vain valituille alueille."
- "Sähköpostiautomaatio ammattilaisille"
- "Tämä asetus on varattu tulevaa automaattista välitystä varten. Omistajan ilmoitukset uusista liideistä lähtevät aina automaattisesti."
- "v.lkm) ?? [1])); return ("
- "Konversioputki"
- "Kausikirje"
- "Lähetetty"
- "Vastausprosentti"
- "Vastattuja"
- "Testikirje"
- "Kevät"
- "Kesä"
- "Syksy"
- "Talvi"
- "Ammattilaisten arviot"
- "Ei vielä arvioita."
- "Viimeisimmät vastaukset"
- "Ei vielä vastauksia."
- "Tyyppi"
- "Vastaus"

### Käyttäjän tilatut pyynnöt (`pyynnot.tsx`)
- "x.arvo === s); return ("
- "Pyynnöt"
- "Tilatut"
- "Lähettämäsi kartoitus-, huolto- ja tarjouspyynnöt."
- "Tilaa palvelu"
- ") : (data as any[]).length === 0 ? ("
- "Et ole vielä tilannut palveluita."
- "Voit pyytää kuntoarvion, huollon tai tarjouksen suoraan ammattilaisverkostostamme."
- "Tilaa ensimmäinen palvelu"

---


## 6. YLEISET UI-TEKSTIT (sivut ja komponentit)


### Yleiskuva / Kojelauta
**[src/routes/_authenticated/dashboard.tsx]**
- "Tam"
- "Hel"
- "Maa"
- "Huh"
- "Tou"
- "Kes"
- "Hei"
- "Elo"
- "Syy"
- "Lok"
- "Mar"
- "Jou"
- "} – <em className="
- "color-mix(in oklab, var(--gold) 8%, transparent)"
- ", ${data.nimi}"
- ", ${data.kiinteisto.kaupunki}"
- "talosi tänään"
- "Talon tietojen edistyminen"
- "Täydennä"
- "Viimeisimmät huollot"
- "Ei vielä kirjattuja huoltoja."
- "Kaikki huollot →"
- "Kulut tänä vuonna"
- "Avaa kulut →"
- "Vuosikello"
- "Tarkista kauden työt ja kuittaa tehdyt."
- "Avaa vuosikello →"
- "Kuluerittely kuukausittain"

### Huoltohistoria
**[src/routes/_authenticated/huoltohistoria.tsx]**
- "Huolto lisätty"
- "Päivitetty"
- "Tähän huoltoon on linkitetty kulu. Poistetaanko myös kulu?"
- "Poistettu"
- "Vuosikello"
- "Tein itse"
- "Ammattilainen"
- "Linkitetty kuluihin"
- "Muokkaa"
- "Poistetaanko huoltomerkintä?"
- "Poista"
- "Tallenna muutokset"
- "Number(b) - Number(a)); return ("
- "Huoltohistoria"
- "Tehdyt"
- "Lisää huolto"
- "Lisää huoltomerkintä"
- ": vuodet.length === 0 ? ("
- "Ei vielä yhtään huoltomerkintää."
- "Aloita lisäämällä ensimmäinen merkintä tai kuittaamalla vuosikellosta."
- "Muokkaa huoltoa"

### Kulut
**[src/routes/_authenticated/kulut.tsx]**
- "Tam"
- "Hel"
- "Maa"
- "Huh"
- "Tou"
- "Kes"
- "Hei"
- "Elo"
- "Syy"
- "Lok"
- "Mar"
- "Jou"
- "Tammikuu"
- "Helmikuu"
- "Maaliskuu"
- "Huhtikuu"
- "Toukokuu"
- "Kesäkuu"
- "Heinäkuu"
- "Elokuu"
- "Syyskuu"
- "Lokakuu"
- "Marraskuu"
- "Joulukuu"
- "Sähkö"
- "Vesi"
- "Lämmitys"
- "Huolto"
- "Vakuutus"
- "Kiinteistövero"
- "Muu"
- "Kotivakuutus"
- "Maavuokra"
- "Jätehuolto"
- "Talvikunnossapito"
- "Nuohous-sopimus"
- "Kulu lisätty"
- "Tähän kuluun on linkitetty huoltohistorian merkintä. Poistetaanko myös huoltomerkintä?"
- "Asetukset tallennettu"
- "Toistuva kulu lisätty"
- "Toistuva kulu poistettu"
- "Mittarilukema tallennettu"
- "Yhteensä"
- "Huolto / korjaus"
- "eyebrow mb-1"
- "color-mix(in oklab, var(--gold) 8%, transparent)"
- "Sähkö €"
- "Vesi €"
- "Sähkö kWh"
- "Vesi m³"
- "color-mix(in oklab, #8b6f47 12%, transparent)"
- "Huolto €"
- "Linkitetty huoltohistoriaan"
- "}{k.kulutus_m3 ? ` · ${k.kulutus_m3} m³` : "
- "Anna ainakin yksi mittarilukema"
- "); setVesi("
- "Tallenna"
- "Poistetaanko myös aiemmin luodut vuosittaiset rivit?"
- "Anna nimi ja summa"
- "); setSumma("
- "Anna summa tai mittarilukema/kulutus"
- "); setKwh("
- "); setMittari("
- " value={kwh} onChange={(e) => setKwh(e.target.value)} placeholder="
- " value={summa} onChange={(e) => setSumma(e.target.value)} placeholder={sahkoHintaLaskettu > 0 ? sahkoHintaLaskettu.toFixed(2) : "
- "Voit antaa kulutuksen, summan tai molemmat. Aseta hinnat asetuksissa automaattilaskentaa varten."
- " value={mittari} onChange={(e) => setMittari(e.target.value)} placeholder="
- " value={summa} onChange={(e) => setSumma(e.target.value)} placeholder={vesiHintaLaskettu > 0 ? vesiHintaLaskettu.toFixed(2) : "
- "Tallenna asetukset"
- "Sähkö ${r.sahko.kulutus.toFixed(0)} kWh · ${r.sahko.summa.toFixed(2)} €"
- "Vesi ${r.vesi.kulutus.toFixed(2)} m³ · ${r.vesi.summa.toFixed(2)} €"
- "${summa.toFixed(0)} €"
- "${perKategoria.find((p) => p.kat === "Sähkö")!.summa.toFixed(0)} €"
- "${perKategoria.find((p) => p.kat === "Vesi")!.summa.toFixed(0)} €"
- "${huoltoSumma.toFixed(0)} €"
- "${Number(v).toFixed(0)} €"
- "· ${k.kwh} kWh"
- "· ${k.kulutus_m3} m³"
- "ed. ${edSahko}"
- "ed. ${edVesi}"
- "· Edellinen lukema: ${edellinen}"
- "; const kulut = data?.kulut ?? []; const asetukset = data?.asetukset; const toistuvat = data?.toistuvat ?? []; const nykyinen = new Date().getFullYear(); const vuodetSaatavilla = Array.from(new Set"
- "s + r.summa, 0); const KIINTEAT_VARIT = ["#c9a961", "#7a8b99", "#8b6f47", "#5a6b7a"]; return ("
- "Kulujenseuranta"
- "Talon"
- "Yhteenveto"
- "Kaikki kulut"
- "Toistuvat kulut"
- "Asetukset"
- "Juoksevat kulut"
- "Sähkö ja vesi kuukausittain — kulutuksen trendi näkyy viivasta."
- "Huolto & korjaus"
- "Suunnitellut ja akuutit huoltokulut kuukausittain."
- "Kiinteät kulut"
- "Vakuutukset, verot, lämmitys ja muut vuosittaiset."
- "Ei vielä kiinteitä kuluja tälle vuodelle."
- "Ei vielä kuluja."
- "Kuukauden mittarilukemat"
- "Syötä mittarilukema kerran kuussa — €-summa lasketaan automaattisesti asetusten tariffeista."
- "Kuukausi"
- "Vuosi"
- "Sähkömittari (kWh)"
- "Vesimittari (m³)"
- "Sähkö:"
- "Lisää vuosittain toistuvat kiinteät kulut — ne ilmestyvät automaattisesti Kulut-yhteenvetoon joka vuodelle alkuvuodesta nykyhetkeen."
- "Ei vielä toistuvia kuluja."
- "Lisää toistuva"
- "Toistuva vuosikulu"
- "Nimi"
- "Kategoria"
- "Summa (€/v)"
- "Erääntymiskuukausi"
- "Alkuvuosi"
- "Lisää kulu"
- "Uusi kulu"
- "Päivämäärä"
- "Kulutus (kWh)"
- "Laskun summa (€)"
- "Jos jätät summan tyhjäksi, lasketaan kulutuksesta:"
- ") : kat === "vesi" ? ("
- "Mittarilukema (m³)"
- "Summa (€)"
- "Energia (snt/kWh)"
- "Siirto (snt/kWh)"
- "Perusmaksu (€/kk)"
- "Puhdas vesi (€/m³)"
- "Jätevesi (€/m³)"
- "Edelliset mittarilukemat"
- "Käytetään lähtöarvona kun syötät seuraavan kuukauden lukeman. Päivittyy automaattisesti jokaisen tallennuksen jälkeen."

### PTS-suunnitelma
**[src/routes/_authenticated/pts.tsx]**
- "Kiireellinen"
- "Lähivuosina"
- "Seurannassa"
- "PTS-rivi lisätty"
- "Poistettu"
- "Merkitty tehdyksi – kirjattu huoltohistoriaan"
- "Siirretty eteenpäin – palaa näkyviin sovittuna vuonna"
- "Siirto peruttu"
- "🔴 Kiireellinen"
- "Ei kiireellisiä toimenpiteitä – hienoa työtä!"
- "🟡 Lähivuosina"
- "Ei toimenpiteitä lähivuosille."
- "🟢 Seurannassa"
- "Ei seurattavia kohteita 10 vuoden ikkunassa."
- "PTS"
- "Kuittaa tehdyksi"
- " Huoltohistoriasta ei löydy aiempaa merkintää."
- "Valitse kohde"
- "Esim. terassi maalataan ja korjataan tolpat"
- "Esim. tarkastettu, ei tarvetta vielä – katsotaan uudestaan parin vuoden päästä"
- "PTS-suunnitelma suosittelee kuntoarviota: ${liidiRivi.kohde}, arvioitu toimenpidevuosi ${liidiRivi.vuosi}."
- "(alkuperäinen suositus ${rivi.alkuperainenVuosi})"
- "– ${rivi.lykkaysPeruste}"
- "Viimeisin huoltomerkintä vuodelta ${rivi.viimeisinHuoltoVuosi}."
- "(null); const [lykkaa, setLykkaa] = useState"
- "(null); const [liidiRivi, setLiidiRivi] = useState"
- "4.4 PTS-suunnitelma"
- "Pitkän tähtäimen suunnitelma"
- "Seuraavan 10 vuoden suositellut toimenpiteet. Perustuu talosi tietoihin ja RT-kortiston käyttöikätaulukoihin – sekä omiin lisäyksiisi."
- "Täydennä talon tiedot"
- "PTS-ennusteet tarkentuvat kun täytät lämmitysmuodon, kattomateriaalin ja muut perustiedot."
- "Talon tiedot"
- "Lisää oma PTS-rivi"
- "2; const teksti = ylitetty ? getYlitetytTeksti(rivi.kohde) : rivi.kuvaus || getSisaltoteksti(rivi.kohde, rivi.tila); return ("
- "Peru siirto"
- "Siirrä eteenpäin"
- "Pyydä kuntoarviota"
- "Poista"
- "Vuosi"
- "Kohde"
- "Kuvaus (vapaaehtoinen)"
- "Tallenna"
- "Toimenpide piilotetaan listalta ja palaa automaattisesti näkyviin valitun vuosimäärän kuluttua."
- "Kuinka monta vuotta eteenpäin?"
- "Uusi suositusvuosi:"
- "Perustelu (vapaaehtoinen)"
- "Siirrä"

### Talon tiedot
**[src/routes/_authenticated/talon-tiedot.tsx]**
- "Perustiedot"
- "Rakennus"
- "Katto ja räystäät"
- "Tekniset järjestelmät"
- "Ulkoalueet"
- "Dokumentit"
- "Omakotitalo"
- "Paritalo"
- "Rivitalo"
- "Erillistalo"
- "Mökki"
- "Ostettu"
- "Rakennettu"
- "Peritty / lahjoitettu"
- "Mitsubishi"
- "Daikin"
- "Panasonic"
- "Toshiba"
- "Fujitsu"
- "Samsung"
- "Sharp"
- "Muu"
- "Puurunko"
- "Hirsi"
- "Tiili"
- "Kevytsoraharkko (Leca)"
- "Betoniharkko"
- "Kevytbetoni (Siporex)"
- "Betonielementti"
- "Teräsrunko"
- "Puu (lautaverhous)"
- "Rappaus"
- "Levyverhous"
- "Pelti"
- "Kuitusementtilevy"
- "Kivi"
- "Betonivalu (maanvarainen laatta)"
- "Harkkoperustus"
- "Tuulettuva alapohja (rossi)"
- "Kellari"
- "Pilariperustus"
- "Pohjalaatta + sokkeli"
- "Maanvarainen laatta"
- "Mineraalivilla"
- "Lasivilla"
- "Selluvilla (puhallusvilla)"
- "Polyuretaani (PUR/PIR)"
- "EPS-styrox"
- "Sahanpuru"
- "Ekovilla"
- "Hamppu"
- "Harjakatto"
- "Pulpettikatto"
- "Aumakatto"
- "Mansardikatto"
- "Tasakatto"
- "Kaarikatto"
- "Konesaumattu peltikatto"
- "Profiilipeltikatto"
- "Tiilikatto (savitiili)"
- "Betonitiili"
- "Huopakatto"
- "Kumibitumikermi"
- "Pärekatto"
- "Ei hormia"
- "Tiilihormi"
- "Teräs-/moduulihormi"
- "Puukiuas"
- "Sähkökiuas"
- "Maalattu teräs"
- "Sinkitty teräs"
- "Kupari"
- "Alumiini"
- "Muovi"
- "Maalämpö"
- "Kaukolämpö"
- "Ilma-vesilämpö"
- "Suora sähkölämmitys"
- "Keskuslämmitys (kattila + vesikierto)"
- "Ilmalämpöpumppu"
- "Öljylämmitys (vanha — siirrä keskuslämmitykseen)"
- "Pellettilämmitys (vanha — siirrä keskuslämmitykseen)"
- "Puulämmitys (vanha — siirrä keskuslämmitykseen)"
- "Maalämpöpumppu"
- "Nibe"
- "IVT"
- "Thermia"
- "Bosch"
- "Gebwell"
- "Stiebel Eltron"
- "Oilon"
- "Ilma-vesilämpöpumppu"
- "Öljykattila"
- "Jämä"
- "Kaukora"
- "Högfors"
- "Viessmann"
- "Buderus"
- "Pellettikattila"
- "Ariterm"
- "Biotech"
- "ÖkoFEN"
- "Puukattila"
- "Lämmönjakokeskus"
- "Alfa Laval"
- "Danfoss"
- "Cetetherm"
- "Lämminvesivaraaja"
- "Jäspi"
- "Haato"
- "Sähkökattila"
- "Vesikiertoiset patterit"
- "Vesikiertoinen lattialämmitys"
- "Molemmat (patterit + lattialämmitys)"
- "Rauta / teräs"
- "Muovi (musta)"
- "Muovi (harmaa)"
- "Muovi (kirkas)"
- "Komposiitti"
- "Painovoimainen"
- "Koneellinen poisto"
- "Koneellinen tulo- ja poistoilmanvaihto (LTO)"
- "Hybridi"
- "Sekoitus"
- "En tiedä"
- "F7 (vakio)"
- "Aktiivihiili"
- "Kupariputket"
- "Komposiittiputket (PEX-Al-PEX)"
- "Muoviputket (PEX)"
- "Galvanoitu teräs"
- "Valurauta"
- "Muovi (PVC/PP)"
- "Betoni"
- "Keraaminen"
- "Lasikuitu"
- "Nurmi"
- "Sora"
- "Kiveys"
- "Asfaltti"
- "Laatoitus"
- "Luonnonniitty"
- "Painekyllästetty puu"
- "Lämpökäsitelty puu"
- "Kestopuu (siperianlehtikuusi)"
- "Ei terassia"
- "Dokumentti"
- "Takuu"
- "Kuitti"
- "Lasku"
- "Kaikki välilehdet tallennettu"
- "Tallennettu"
- "INPUT"
- "TEXTAREA"
- "✓ Tallennettu"
- "Automaattitallennus"
- "Osoite"
- "Postinumero"
- "Kaupunki"
- "Tyyppi"
- "Valitse"
- "Omistajan nimi"
- "Puhelinnumero"
- "} onChange={(e) => setP({ ...p, puhelin: e.target.value })} placeholder="
- "Sähköposti"
- "} disabled className="
- "Hankintatapa"
- "Ostettu / rakennettu (vuosi)"
- "Talon nimi (näytetään etusivulla)"
- "Asukkaita"
- "Kerroksia"
- "Rakennusvuosi"
- "Kerrosten määrä"
- "Asuinpinta-ala (m²)"
- "Kokonaispinta-ala (m²)"
- "Kantava rakenne"
- "Julkisivumateriaali"
- "Perustus"
- "Eristemateriaali"
- "Julkisivun asennusvuosi"
- "} onChange={(e) => setT({ ...t, julkisivu_asennettu_vuosi: e.target.value })} placeholder="
- "Julkisivu maalattu / huollettu (vuosi)"
- "} onChange={(e) => setT({ ...t, julkisivu_maalattu_vuosi: e.target.value })} placeholder="
- "Lisätietoja rakennuksesta"
- "Kattotyyppi"
- "Kattomateriaali"
- "Katon pinta-ala (m²)"
- "Katon asennusvuosi"
- "} onChange={(e) => setT({ ...t, katto_uusittu_vuosi: e.target.value })} placeholder="
- "Hormityyppi"
- "Hormeja (kpl)"
- " value={t.hormien_maara ?? "
- "} onChange={(e) => setT({ ...t, hormien_maara: e.target.value })} disabled={t.hormityyppi === "
- "Kattoturvatuotteet"
- "} onChange={(e) => setT({ ...t, kattoturvatuotteet: e.target.value })} placeholder="
- "Kourujen pituus (jm)"
- "Kourun materiaali"
- "Syöksytorvet (kpl)"
- "Räystäät asennettu (vuosi)"
- "} onChange={(e) => setT({ ...t, raystaat_kunnostettu_vuosi: e.target.value })} placeholder="
- "Päälämmitysmuoto"
- "Järjestelmän asennusvuosi"
- "Merkki"
- "Mallimerkintä"
- "} onChange={(e) => setLisa({ malli: e.target.value })} placeholder="
- "Kattilatyyppi"
- "Kattilan asennusvuosi"
- "Kattilan merkki"
- "Lämmönjako"
- "Putkiston asennusvuosi"
- "} onChange={(e) => setLisa({ putki_asennettu_vuosi: e.target.value })} placeholder="
- "Lämmitysputkiston materiaali"
- "Sähköpattereiden asennusvuosi"
- "Lämminvesivaraajan merkki"
- "LVV:n mallimerkintä"
- "LVV:n asennusvuosi"
- "} onChange={(e) => setT({ ...t, ilp_malli: e.target.value })} placeholder="
- "LP:n asennusvuosi"
- "IV-tyyppi"
- "IV-koneen asennusvuosi"
- "} onChange={(e) => setT({ ...t, ilmanvaihto_vuosi: e.target.value })} placeholder="
- "Suodatintyyppi"
- "Suodatin vaihdettu viimeksi"
- "Käyttövesiputket"
- "Putkien asennusvuosi"
- "} onChange={(e) => setT({ ...t, putket_uusittu_vuosi: e.target.value })} placeholder="
- "Viemärien materiaali"
- "Viemärien asennusvuosi"
- "} onChange={(e) => setT({ ...t, viemari_asennettu_vuosi: e.target.value })} placeholder="
- "Pääsulun sijainti"
- "} onChange={(e) => setT({ ...t, paasulun_sijainti: e.target.value })} placeholder="
- "Ikkunatyyppi"
- "Ikkunoiden asennusvuosi"
- "} onChange={(e) => setT({ ...t, ikkunat_uusittu_vuosi: e.target.value })} placeholder="
- "Palovaroittimia (kpl)"
- "Paristot vaihdettu"
- "Kiukaan asennusvuosi"
- "Kiuastyyppi"
- "Nuohous viimeksi"
- "Sähköjärjestelmän asennusvuosi"
- "} onChange={(e) => setT({ ...t, sahkot_asennettu_vuosi: e.target.value })} placeholder="
- "Tontin pinta-ala (m²)"
- "Nurmikon pinta-ala (m²)"
- "Pihan tyyppi"
- "Sadevesikaivot (kpl)"
- "Terassin pinta-ala (m²)"
- "Terassin materiaali"
- "Rakennettu vuonna"
- "Käsitelty / maalattu viimeksi"
- "Lasitus"
- " : String(t.terassi_lasitettu)} onValueChange={(v) => setT({ ...t, terassi_lasitettu: v === "
- "Lasitus asennettu vuonna"
- "Salaojat"
- " : String(t.salaojat)} onValueChange={(v) => setT({ ...t, salaojat: v === "
- "Tarkastettu viimeksi"
- "Lisätietoa pihasta"
- "Tallenna ja merkitse valmiiksi"
- "Tiedosto lisätty"
- "Poistettu"
- "Tiedosto"
- "Kuvaus (vapaaehtoinen)"
- "Esim. katon takuupaperit 2022"
- "Lataa"
- "Kirjoita oma"
- "${kiinteistoId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}"
- "· ${(d.koko_bytes / 1024).toFixed(0)} kB"
- "([]); const hydrated = useRef(false); const hydratedKiinteistoId = useRef"
- "(null); const [autoStatus, setAutoStatus] = useState"
- "; const edistyminen = Math.round((valmiit.length / OSIOT.length) * 100); return ("
- "Talon tiedot"
- "Rakennuksen"
- "Tallenna kaikki välilehdet"
- "1. Perustiedot"
- "Aloitetaan perusteista. Näiden tietojen perusteella rakennamme henkilökohtaisen huoltosuunnitelman."
- "Sijainti"
- "Kiinteistön tyyppi"
- "Omistajan tiedot"
- "2. Rakennus"
- "Rakennusvuosi ja materiaalit kertovat paljon tulevan huollon tarpeesta."
- "Koko ja ikä"
- "Rakennusmateriaalit"
- "3. Katto ja räystäät"
- "Katto on yksi talon tärkeimmistä rakenteista. Tiedot auttavat ennakoimaan huolto- ja uusimistarpeita."
- "Katon perustiedot"
- "Räystäskourut"
- "4. Tekniset järjestelmät"
- "Talotekniikalla on suositeltu käyttöikä – autamme seuraamaan milloin huolto tai uusinta on ajankohtainen."
- "Lämmitysjärjestelmä"
- "Kattila"
- "Lämmönjako ja lämmitysputkisto"
- "Sähköpatterit ja lämminvesivaraaja"
- "Ilmalämpöpumppu (lisälaite)"
- "Ilmanvaihto"
- "Vesiputket ja viemärit"
- "Ikkunat"
- "Muut laitteet"
- "5. Ulkoalueet ja piha"
- "Piha-alueiden tiedot auttavat muistuttamaan kausihuolloista ja ennakoimaan kunnossapitoa."
- "Tontti"
- "Terassi"
- "Kyllä, lasitettu"
- "Ei lasitusta"
- "Kyllä"
- "Edellinen"
- "Seuraava"
- "(null); const [tyyppi, setTyyppi] = useState"
- "6. Dokumentit ja takuut"
- "Lisää taloosi liittyvät dokumentit, takuut, kuitit ja laskut. Kaikki on turvallisesti tallessa ja helposti löydettävissä."
- "Lisää uusi"
- "Ei dokumentteja vielä."
- "Muu / oma…"

### Vuosikello
**[src/routes/_authenticated/vuosikello.tsx]**
- "Kuitattu"
- " · ei aiempaa merkintää"
- "Perushuollot"
- "Talon tietoihin perustuvat"
- "Kuittaa"
- "Avaa infopaketti"
- "· viimeksi ${r.viimeisinHuoltoVuosi}"
- "${liidiNimi}, hormeja ${(talon as any).hormien_maara} kpl${(talon as any)?.hormityyppi ?"
- "r.huoltoErapaiva); const [kausi, setKausi] = useState"
- "(autoKausi()); const [valittu, setValittu] = useState"
- "(null); const [liidiNimi, setLiidiNimi] = useState"
- "(null); const [infoNimi, setInfoNimi] = useState"
- "k.kausi_key === kausi && k.huolto_nimi === nimi); return ("
- "Kauden"
- "työt"
- "Kuittaa tehdyt huollot. Kuittaukset nollautuvat vuodenvaihteessa."
- "Huoltoväli täynnä"
- "Seuraaville kohteille suositeltu huoltoväli on tullut täyteen. Varaa aika tai kuittaa tehdyksi."
- "Avaa PTS"
- "x.kausi_key === k.key).length; return ("
- "Ei huoltokohteita."
- "Kuittaa tehdyksi"
- "Miksi tämä tehdään"
- "Miten toimit"
- "Milloin tilaa ammattilainen"
- "Tälle toimenpiteelle ei ole vielä tarkempaa infopakettia. Lisäämme niitä jatkuvasti."
- ") : skipped ? ("
- "Info"
- "Tilaa"
- "("itse"); const [tekijaNimi, setTekijaNimi] = useState(""); const [hinta, setHinta] = useState(""); return ("
- "Kuka teki?"
- "Tein itse"
- "Ammattilainen teki"
- "Jätetään tekemättä"
- "Tekijä / yritys"
- "Kustannus (€)"

### Oppaat – etusivu
**[src/routes/opas/index.tsx]**
- "Nuohouksen hinta ja oikea ajankohta"
- "Mitä nuohous maksaa, kuinka usein se on tehtävä ja milloin kannattaa varata aika — kevät vai syksy?"
- "Ilmanvaihdon puhdistus ja IV-suodattimet"
- "Milloin ilmanvaihtokanavat pitää puhdistaa, kuinka usein suodattimet vaihdetaan ja mikä on hinta-arvio."
- "Katon tarkastus — mitä, miten ja milloin"
- "Säännöllinen katon tarkastus säästää tuhansia. Mitä ammattilainen tarkistaa ja kuinka usein."
- "Talon huolto-oppaat — Kotiluotsi"
- "Konkreettisia oppaita omakotitalon vuosihuoltoihin: nuohous, ilmanvaihto, katon tarkastus ja paljon muuta."
- "Konkreettisia oppaita omakotitalon vuosihuoltoihin."
- "eyebrow mb-3"
- "Oppaat"
- "Talon huolto-oppaat"
- "Konkreettisia oppaita omakotitalon vuosihuoltoihin — mitä tehdään itse, milloin tarvitaan ammattilainen ja mihin hinta perustuu."
- "Lue opas →"

### Opas: IV-puhdistus
**[src/routes/opas/iv-puhdistus.tsx]**
- "Ilmanvaihdon puhdistus ja IV-suodattimet"
- "Milloin ilmanvaihtokanavat pitää puhdistaa, kuinka usein suodattimet vaihdetaan ja mikä on hinta-arvio omakotitalossa."
- "IV-suodattimet — vaihtoväli ja itsetehtävät"
- "Kanavien puhdistus — milloin ja paljonko maksaa"
- "Mistä tunnistat puhdistustarpeen"
- "Painovoimainen ilmanvaihto — eri tilanne"
- "Kuinka usein IV-suodattimet vaihdetaan?"
- "Kaksi kertaa vuodessa — keväällä ja syksyllä. Pölyisellä alueella useammin. Vaihto kestää 5 minuuttia."
- "Kuinka usein ilmanvaihtokanavat pitää puhdistaa?"
- "5–10 vuoden välein. Nykyään kanaviston nuohous ei ole lakisääteinen, mutta puhdistus on voimakkaasti suositeltu sisäilman ja energian kannalta."
- "Mitä IV-kanaviston puhdistus maksaa?"
- "Omakotitalossa tyypillisesti 400–900 € sis. ALV. Hinta riippuu kanaviston koosta ja likaisuudesta. Useimmiten samassa käynnissä tarkistetaan LTO-kennon kunto."
- "Voinko vaihtaa IV-suodattimet itse?"
- "Kyllä, vaihto on yksinkertainen huoltoluukun avaamisesta. Tärkeintä on asentaa suodatin nuolen osoittamaan suuntaan ja muistaa merkitä vaihtopäivä muistiin."
- "Ilmanvaihto on sisäilman ja energiankulutuksen kannalta talon tärkeimpiä järjestelmiä — ja samalla yksi laiminlyödyimpiä. Tämä opas kertoo milloin huoltoa tarvitaan, mitä voit tehdä itse ja mitä työ ammattilaiselta maksaa."
- "Tavalliset IV-koneen suodattimet vaihdetaan"
- "kahdesti vuodessa"
- "— keväällä siitepöly- kauden jälkeen ja syksyllä ennen lämmityskauden alkua. Pölyisellä alueella tai vilkasliikenteisen tien varrella useammin."
- "Vaihto on yksinkertainen: avaa huoltoluukku, vedä vanhat suodattimet pois ja asenna uudet nuolen osoittamaan suuntaan. Suodattimet maksavat 20–60 € parilta, riippuen suodatinluokasta."
- "Ilmanvaihtokanavat suositellaan puhdistettaviksi"
- "5–10 vuoden välein"
- ". Aikaisemmin kanaviston nuohous oli pakollinen 10 vuoden välein — nykylainsäädäntö perustuu kiinteistön omistajan vastuuseen, mutta puhdistus on edelleen voimakkaasti suositeltava."
- "Omakotitalon kanaviston puhdistus maksaa tyypillisesti 400–900 € sisältäen ALV:n. Hinta nousee jos kanavisto on monimutkainen tai kanavat ovat poikkeuksellisen likaiset. Samassa käynnissä tarkistetaan usein LTO-kennon kunto."
- "Tunkkainen sisäilma, hajut eivät poistu"
- "Pölyyntyvät pinnat normaalia nopeammin"
- "IV-koneen ääni on muuttunut tai virtaus tuntuu heikolta"
- "Yli 10 vuotta edellisestä puhdistuksesta"
- "Vanhemmissa taloissa ilmanvaihto toimii ilman konetta, lämpötilaeron ja tuulen avulla. Tällöin suodattimia ei ole, mutta hormien kunto ja korvausilman riittävyys on syytä tarkastuttaa noin 15–20 vuoden välein. Tukkeutunut painovoimainen ilmanvaihto on yleinen syy sisäilmaongelmiin."

### Opas: Katon tarkastus
**[src/routes/opas/katon-tarkastus.tsx]**
- "Katon tarkastus — mitä, miten ja milloin"
- "Säännöllinen katon tarkastus säästää tuhansia. Tästä oppaasta opit mitä ammattilainen tarkistaa ja kuinka usein tarkastus kannattaa tilata."
- "Kuinka usein katto kannattaa tarkastaa?"
- "Mitä ammattilainen tarkistaa"
- "Mitä tarkastus maksaa?"
- "Mitä voit tarkastaa itse"
- "Kuinka usein katto pitää tarkastaa?"
- "Silmämääräinen tarkastus joka kevät ja syksy. Ammattilaisen perusteellinen tarkastus 3–5 vuoden välein. Iän loppupäässä useammin."
- "Mitä katon ammattilaistarkastus maksaa?"
- "Tyypillisesti 150–400 € sis. ALV omakotitalossa. Hinta riippuu rakennuksen koosta ja siitä, sisältyykö kirjallinen raportti."
- "Kuinka kauan peltikatto kestää?"
- "Oikein huollettuna noin 40 vuotta. Maalauskäsittely uusitaan 10–15 vuoden välein. Tiilikatto kestää 50+ vuotta, bitumihuopa noin 20 vuotta."
- "Voinko itse tarkastaa katon?"
- "Voit tarkastaa kiikareilla ja yläpohjasta sisäpuolelta. Itse katolle nouseminen on putoamissuojaustyötä — jyrkkä tai liukas katto on aina ammattilaisen työ."
- "Katto on yksi talon kalleimmista rakenneosista, ja yläpohjan kosteusvaurio on yksi kalleimmista korjauksista. Säännöllinen tarkastus paljastaa pienet viat ennen kuin niistä tulee suuria."
- "Kattomateriaalista riippumatta suositus on"
- "silmämääräinen tarkastus joka kevät"
- "talven jälkeen ja syksyllä ennen sateita. Ammattilaisen perusteellisempi tarkastus tehdään tyypillisesti 3–5 vuoden välein."
- "Peltikatto kestää oikein huollettuna 40 vuotta, tiilikatto 50+ vuotta ja bitumihuopa noin 20 vuotta. Iän loppupäässä tarkastusväliä lyhennetään."
- "Pellit, tiilet ja huopa — irronneet, halkeilleet tai ruostuneet kohdat"
- "Läpiviennit (savupiippu, IV-piipput, antennit) ja niiden tiivistykset"
- "Räystäskourut ja syöksyt — kiinnitykset, kallistus, tukkeumat"
- "Aluskate yläpohjasta käsin — vuotojäljet, irtoamiset"
- "Sammal-, jäkälä- ja kasvuston määrä"
- "Kattoturvatuotteet — talikoukut, lapetikkaat, kattosillat"
- "Tarkastuksen tuloksena saat kirjallisen raportin ja toimenpide-ehdotukset hintoineen — voit verrata tarjouksia tai tehdä työn omaan tahtiisi."
- "Omakotitalon katon ammattilaistarkastus maksaa tyypillisesti 150–400 € sis. ALV. Hinta riippuu rakennuksen koosta, katon jyrkkyydestä ja siitä, sisältyykö raportti. Drone-kuvaus voi nostaa hintaa, mutta vähentää kattoturvallisuusriskiä."
- "Kiipeämättä katolle voit kiikareilla tai jopa puhelimen zoomilla:"
- "Tarkistaa sammaloituminen ja näkyvät irrotukset"
- "Tarkkailla räystäiltä jääpuikkojen kertymistä talvella (merkki yläpohjan eristevuodosta)"
- "Tarkastaa yläpohja sisäpuolelta — kosteusjäljet, valuvedet, hajut"
- "Jyrkkä tai liukas katto on aina ammattilaisen työ — putoamissuojaus vaaditaan jo 2 metrin putoamiskorkeudelta."

### Opas: Nuohouksen hinta
**[src/routes/opas/nuohous-hinta.tsx]**
- "Nuohouksen hinta ja oikea ajankohta"
- "Mitä nuohous maksaa, kuinka usein se on tehtävä ja milloin kannattaa varata aika. Käytännön opas omakotitaloasujalle."
- "Mitä nuohous maksaa?"
- "Kuinka usein nuohous on tehtävä?"
- "Milloin nuohous kannattaa tilata?"
- "Mitä voit tarkastaa itse"
- "Kuinka paljon nuohous maksaa Suomessa 2026?"
- "Tyypillinen hinta on 80–150 € sisältäen arvonlisäveron, yhdestä hormista. Useammasta hormista hinta nousee porrastetusti. Lisätyöt veloitetaan erikseen."
- "Vakituisessa asunnossa vähintään kerran vuodessa, vapaa-ajan asunnossa joka kolmas vuosi. Velvollisuus koskee kaikkia puuta polttavia tulisijoja ja hormeja."
- "Onko nuohous pakollista?"
- "Kyllä, pelastuslaki velvoittaa nuohouksen vakituisesti asutuissa pientaloissa kerran vuodessa. Pelastuslaitos valvoo."
- "Milloin nuohous kannattaa tilata — kevät vai syksy?"
- "Kevät on parempi. Lämmityskausi on käytössä joten noki irtoaa paremmin, ja nuohoojilla on saatavuutta. Syksy on perinteisesti kiireisin sesonki."
- "Saako nuohouksen tehdä itse?"
- "Ei. Työn saa tehdä vain nuohoojan ammattitutkinnon suorittanut henkilö. Voit kuitenkin itse tarkastaa silmämääräisesti hormin kunnon ja vedon."
- "Nuohous on lakisääteinen vähintään kerran vuodessa vakituisesti asutuissa pientaloissa. Tämä opas kertoo mitä se maksaa, milloin se kannattaa tilata ja mitä voit itse tarkastaa."
- "Tyypillinen hinta omakotitalon vuosinuohouksesta on 80–150 € (sis. ALV) yhdestä hormista. Hinta vaihtelee paikkakunnan, hormien määrän ja tulisijatyypin mukaan. Lisätyöt — kuten nuohousluukun uusiminen tai laajempi hormikuvaus — laskutetaan erikseen."
- "Nuohousala on vapautunut alueellisesta sääntelystä, joten kilpailutus kannattaa: muutaman tarjouksen vertailulla erotat tyypillisen tason poikkeuksellisen kalliista."
- "Vakituisessa asunnossa puuta polttava tulisija ja hormi on nuohottava"
- "vähintään kerran vuodessa"
- ". Vapaa-ajan asunnoilla väli on kolme vuotta. Velvollisuus koskee taloyhtiön omistajaa tai asukasta — valvonta on pelastuslaitoksilla."
- "Paras ajankohta on kevät"
- "(helmi–huhtikuu): lämmityskausi on käytössä, joten noki ei ole ehtinyt pinttyä ja hormi vetää hyvin — työ on tehokkaampaa ja perusteellisempaa. Lisäksi nuohoojilla on keväällä paremmin aikaa, joten oman aikataulun mukaisen ajan saa helpommin."
- "Syksy on perinteisesti kiireisin sesonki. Jos varaat ajan loka–marraskuussa, varaudu jonotukseen ja siihen että parhaat aikaikkunat ovat jo menneet."
- "Onko nuohousluukussa tai hormin ympärillä näkyviä halkeamia?"
- "Vetääkö tulisija normaalisti vai tulvahteleeko savua sisään?"
- "Onko nokimäärä kasvanut edellisestä vuodesta?"
- "Itse nuohousta ei kuitenkaan saa tehdä — laki edellyttää, että työn suorittaa nuohoojan ammattitutkinnon suorittanut henkilö."

### Sivunavigaatio (AppSidebar)
**[src/components/app-sidebar.tsx]**
- "Yleiskuva"
- "Talon tiedot"
- "Huoltohistoria"
- "PTS-suunnitelma"
- "Vuosikello"
- "Kulut"
- "Pyynnöt"
- "Admin"
- "Kirjaudu ulos"
- "Kotiluotsi"
- "Navigaatio"
- "0; return ("

### Huoltolomake (HuoltoForm)
**[src/components/huolto-form.tsx]**
- "Tallenna huolto"
- ", malli: "
- ", asennusvuosi: "
- ", materiaali: "
- "Ei kirjautunutta käyttäjää"
- "Valitse kohde"
- "} onChange={(e) => handleChange("
- ", e.target.value)} disabled={form.tekija === "
- "Esim. Nibe"
- "Esim. S1255-12"
- "Valitse"
- "Asennusvuosi"
- "Uusittu vuosi"
- "Lisää liitteitä"
- "Poistetaanko liite ${l.nimi}?"
- "Asennusvuosi (ja tarvittaessa merkki/malli) tallennetaan kohteelle "${form.kohde}". Tieto päivittää myös PTS-suosituksen huolto- ja uusimissyklin."
- "Uusi materiaali ja vuosi tallennetaan kohteelle "${form.kohde}". Tieto päivittää myös PTS-suosituksen huolto- ja uusimissyklin."
- "([]); const [vanhat, setVanhat] = useState"
- "Tyyppi *"
- "Päivämäärä *"
- "Kohde"
- "Kuvaus / lisätiedot"
- "Tekijä"
- "Tein itse"
- "Ammattilainen"
- "Tekijän nimi"
- "Kustannus (€)"
- "Siirtyy kulujenseurantaan"
- "Takuu (v)"
- "PTS-siirto (v)"
- "Siirtää suositusta vuosilla"
- "Päivitä talon tiedot tämän remontin perusteella"
- "Merkki"
- "Malli"
- "Materiaali / tyyppi"
- "Liitteet (kuitit, tarjoukset, valokuvat)"

### Kausikirje-asetus (toggle)
**[src/components/kausikirje-toggle.tsx]**
- "Asetus tallennettu"
- "Kausimuistutukset sähköpostiin"
- "Saat 4× vuodessa kauden tärkeimmät huoltovinkit sähköpostiisi."

### Lakisivujen pohja (LegalLayout)
**[src/components/legal-layout.tsx]**
- "eyebrow mb-3"
- "Kotiluotsi"
- "Käyttöehdot"
- "Tietosuoja"
- "Kirjaudu"
- "Lakitekstit"
- "← Takaisin etusivulle"

### Oppaiden pohja (OpasLayout)
**[src/components/opas-layout.tsx]**
- "Article"
- "Organization"
- "Kotiluotsi"
- "FAQPage"
- "Question"
- "Answer"
- "eyebrow mb-3"
- "${o.title} — Kotiluotsi"
- "Oppaat"
- "Usein kysytyt kysymykset"
- "Kotiluotsi pitää talosi huoltohistorian, kulut ja PTS-suunnitelman yhdessä paikassa — ja muistuttaa oikealla hetkellä."
- "Aloita maksutta"

### Palautekortti
**[src/components/palaute-kortti.tsx]**
- "Kiitos palautteestasi!"
- "Sulje"
- "Mikä Kotiluotsissa toimi parhaiten?"
- "Sain talosta yleiskuvan"
- "Huoltomuistutukset"
- "Tilasin kuntoarvion"
- "Muu"
- "Et ole käynyt vähään aikaan – mitä jäit kaipaamaan?"
- "Ei tarvetta juuri nyt"
- "Liian monimutkainen"
- "Muu – kerro mikä"
- "Onko ammattilainen ottanut sinuun yhteyttä?"
- "Kyllä, nopeasti"
- "Kyllä, mutta vasta myöhemmin"
- "Ei ollenkaan"
- "Vastasiko palvelu tarpeeseesi?"
- "Kyllä, täysin"
- "Osittain"
- "Työ ei vielä tehty"
- "Halutessasi kerro lisää..."
- "Lähetetään..."
- "Lähetä"
- "Halutessasi kerro tarkemmin..."
- "; onVastaa: (v: Record"
- "; case "nps": return"
- "; case "churn": return"
- "; case "liidi_yhteydenotto": return"
- "; case "liidi_tulos": return"
- "; case "tyonlaatu": return"
- "(null); const [kommentti, setKommentti] = useState(""); return ("
- "(null); return ("
- "Suosittelisitko Kotiluotsia tutullesi?"
- "0 = en lainkaan, 10 = ehdottomasti"
- "Miten ammattilaisen työ sujui?"

### Kiinteistön valitsin
**[src/components/property-switcher.tsx]**
- "Vaihto epäonnistui"
- "Kiinteistö lisätty"
- "Lisäys epäonnistui"
- "Ei kiinteistöä"
- "Esim. Mökki, Saimaa"
- "Lisätään…"
- "Lisää"
- ", ${k.kaupunki}"
- "k.id === valittuId) ?? kiinteistot[0]; return ("
- "Kiinteistöt"
- "Lisää kiinteistö"
- "Esim. mökki tai toinen koti. Voit vaihtaa aktiivista kiinteistöä yläpalkista."
- "Nimi"
- "Tyyppi"
- "Omakotitalo"
- "Paritalo"
- "Rivitalo"
- "Mökki / vapaa-ajan asunto"
- "Muu"
- "Osoite"
- "Kaupunki"
- "Peruuta"

### Etusivu / Landing (index.tsx)
**Lähde:** `src/routes/index.tsx`
- Navigaatio: "Koti**vahti**", "Ominaisuudet", "Kilpailutus", CTA "Aloita ilmaiseksi"
- Hero-badge: "Uutta · Ilmainen talokirja"
- Hero-otsikko: "Yksi sovellus – *koko talon hallinta.*"
- **Ominaisuus-kortit (`FEATURES`):**
  - 📋 **Talokirja** – Talon perustiedot, laitteet, materiaalit ja vuosiluvut yhdessä paikassa. Päivitä kerran, käytä aina.
  - 📅 **Vuosikello** – Kausihuollot listattuna. Kuittaa tehdyksi – menee automaattisesti huoltohistoriaan.
  - 🤝 **Palveluiden kilpailutus** – Tilaa kuntoarvio, huolto tai tarjouspyyntö suoraan sovelluksesta. Välitetään tarkastettuille paikallisille tekijöille – sinä valitset parhaan. ⭐ Suosittu
  - 📊 **PTS-suunnitelma** – Ennakoi milloin rakennusosat tarvitsevat toimenpiteitä. Ei yllätyksiä.
  - 💰 **Kulujenseuranta** – Sähkö ja vesi kulutuspohjaisesti. Ennakointilaskelma tuleville vuosille.
  - 🔧 **Huoltohistoria** – Kaikki dokumentoitu. Kuitit, kuvat, tekijät – löydät aina kun tarvitset.
  - 📄 **Myyntiraportti** – Tulostettava raportti välittäjälle. Yksi nappi, kaikki tallessa.
- **Vaiheet (`STEPS`):**
  - **1. Valitse palvelu** – Katto, LVI, sähkö, ilmanvaihto, nuohous – 14 kategoriaa suoraan sovelluksessa.
  - **2. Lähetä pyyntö** – Talon tiedot täyttyvät automaattisesti talokirjastasi. Yksi nappi.
  - **3. Saat tarjoukset** – Tarkastetut paikalliset yritykset ottavat yhteyttä. Sinä valitset.
  - **4. Tallenna huoltokirjaan** – Työn jälkeen syötät tehdyn työn tiedot ja dokumentit itse huoltokirjaan – kaikki tallessa yhdessä paikassa.
- Esimerkkikategoriat (CATS): 🏠 Katto & vesikatto · 🔧 LVI & putket · ⚡ Sähkötyöt · 🌬️ Ilmanvaihto & IV-huolto · 🔥 Nuohous & tulisijat · 🌿 Piha & salaojat

### 404-virhesivu (__root.tsx)
- Eyebrow: "404 · Sivua ei löytynyt"
- Otsikko: "Hukassa metsässä"
- Teksti: "Etsimääsi sivua ei ole olemassa tai se on siirretty."
- Nappi: "Takaisin etusivulle"

### Yleinen virhesivu (__root.tsx errorComponent)
- Eyebrow: "Virhe"
- Otsikko: "Sivua ei voitu ladata"
- Nappi: "Yritä uudelleen"

### Palaute-vastaussivu (palaute.tsx)
- Latausvaihe: "Käsitellään vastausta…" / "Hetki"
- Onnistuminen: "Kiitos!" / "Vastauksesi on tallennettu" / "Pidämme sinut tulevana kautena ajan tasalla." / nappi "Avaa Kotiluotsi"
- Virhe: "Hups" / "Vastausta ei voitu tallentaa" / "Linkki on puutteellinen." / nappi "Avaa Kotiluotsi"

### UKK-sivu (ukk.tsx)
- Otsikko: "UKK — Kotiluotsi"
- Johdanto: "Tältä sivulta löydät vastaukset Kotiluotsi-palvelua koskeviin yleisimpiin kysymyksiin. Talon huoltoon ja vuosihuoltojen ajoitukseen liittyvät oppaat löydät Oppaat-osiosta."
- **Kysymykset & vastaukset:**
  - **Q:** Mikä Kotiluotsi on ja onko se ilmainen?
    **A:** Kotiluotsi on omakotitaloasujille tarkoitettu talokirja: tallennat talon tiedot, huoltohistorian, kulut ja saat automaattisen PTS-suunnitelman (pitkän tähtäimen huoltosuunnitelma). Peruskäyttö on maksutonta — tarjoamme lisäksi kilpailutusta ammattilaisten huoltotöistä, mikä on käyttäjälle veloituksetonta.
  - **Q:** Miten talokirja toimii?
    **A:** Kun täytät talon perustiedot (rakennusvuosi, lämmitysmuoto, kattomateriaali, ikkunoiden uusimisvuosi yms.), Kotiluotsi laskee RT-kortiston käyttöikien ja huoltovälien perusteella mitä toimenpiteitä on luvassa lähivuosina. Kirjaat tehdyt huollot ja kulut samaan paikkaan, ja saat kausimuistutuksia (kevät/kesä/syksy/talvi).
  - **Q:** Miten ammattilaisten kilpailutus toimii?
    **A:** Kun tarvitset esimerkiksi nuohouksen, IV-puhdistuksen tai katon tarkastuksen, voit pyytää Kotiluotsin kautta kuntoarvion tai tarjouksen. Pyyntö välitetään alueesi tarkastetuille ammattilaisille, jotka ottavat yhteyttä suoraan sinuun. Sinulla ei ole velvollisuutta hyväksyä mitään tarjousta.
  - **Q:** Onko pyyntö sitova? Pitääkö antaa luottokortti?
    **A:** Pyyntö ei ole sitova. Et anna maksutietoja Kotiluotsille — sovit hinnasta ja työstä suoraan valitsemasi ammattilaisen kanssa.
  - **Q:** Onko Kotiluotsin listaamat ammattilaiset tarkastettu?
    **A:** Kyllä. Tarkistamme verkostoomme liittyvät ammattilaiset: Y-tunnus, ennakkoperintärekisteri ja toimialakohtaiset luvat (esim. sähkö- ja LVI-pätevyydet). Käyttäjäpalaute vaikuttaa siihen, ketkä pysyvät verkostossa.
  - **Q:** Miten tietoturva on hoidettu?
    **A:** Talon tiedot, huoltohistoria ja kulut tallennetaan EU-alueen palvelimille. Vain sinä näet oman talosi tiedot — emme myy tai luovuta tietoja ulkopuolisille. Voit poistaa tilisi ja kaikki tietosi milloin tahansa.
- Alalaatikko: "Aloita Kotiluotsin käyttö maksutta — talokirja, PTS ja kausimuistutukset." + nappi "Rekisteröidy"

### Tietosuojaseloste & Käyttöehdot
**Lähde:** `src/routes/tietosuoja.tsx`, `src/routes/kayttoehdot.tsx`
Sisältävät vakio-osiot: rekisterinpitäjä, käsiteltävät tiedot, käyttötarkoitukset, vastaanottajat, säilytysajat, rekisteröidyn oikeudet, tietoturva, evästeet, yhteydenotot, ehtojen muuttaminen. Otsikot:
- "Tietosuojaseloste" (päivitetty Toukokuu 2026)
- "Käyttöehdot" (päivitetty Toukokuu 2026)

---


## 7. REKISTERÖINTI JA KIRJAUTUMINEN


### Kirjautuminen (`src/routes/login.tsx`)
- Logo-linkki: "Kotiluotsi."
- Takaisin-linkki: "← Etusivulle"
- Eyebrow: "Kirjaudu"
- Otsikko: "Tervetuloa *takaisin*"
- Alaotsikko: "Ei vielä tiliä? Luo tili"
- Kentät: "Sähköposti", "Salasana"
- Linkki: "Unohditko salasanan?"
- Nappi: "Kirjaudu sisään" (lataus: "Kirjaudutaan...")
- Vahvistusilmoitus: "Sähköpostiosi ei ole vielä vahvistettu. Tarkista postilaatikko ja roskaposti."
- Nappi: "Lähetä vahvistuslinkki uudelleen"
- Erotin: "tai"
- Google-nappi: "Jatka Googlella"
- Alaviite: "Käyttöehdot · Tietosuoja"
- Virheviestit / toastit:
  - "Vahvista sähköpostisi ensin – tarkista postilaatikkosi."
  - "Anna sähköpostiosoite"
  - "Vahvistuslinkki lähetetty uudelleen."
  - "Kirjautuminen epäonnistui"
  - Backendista tuleva error.message

### Rekisteröinti (`src/routes/rekisteroidy.tsx`)
- Eyebrow: "Luo tili"
- Otsikko: "Aloita talosi *huoltokirja*"
- Alaotsikko: "Onko sinulla jo tili? Kirjaudu sisään"
- Kentät: "Sähköposti", "Salasana" (vihje "Vähintään 8 merkkiä"), "Vahvista salasana"
- Suostumus: "Hyväksyn käyttöehdot ja tietosuojaselosteen."
- Nappi: "Luo tili" (lataus: "Luodaan...")
- Google-nappi: "Jatka Googlella"
- Alaviite: "Jatkamalla hyväksyt käyttöehdot ja tietosuojaselosteen."
- Onnistumisnäkymä (vahvistusviesti lähetetty):
  - Eyebrow: "Vahvista sähköposti"
  - Otsikko: "Tarkista *sähköpostisi*"
  - Teksti: "Lähetimme vahvistuslinkin osoitteeseen {email}. Klikkaa linkkiä, niin pääset kirjautumaan sisään. Tarkista myös roskaposti."
  - Nappi: "Takaisin kirjautumiseen"
- Virheviestit:
  - "Salasanan tulee olla vähintään 8 merkkiä"
  - "Salasanat eivät täsmää"
  - "Hyväksy käyttöehdot ja tietosuojaseloste"
  - "Hyväksy käyttöehdot ja tietosuojaseloste ennen jatkamista"
  - "Rekisteröinti epäonnistui"

### Unohtunut salasana (`src/routes/unohtunut-salasana.tsx`)
- Takaisin-linkki: "← Kirjautumiseen"
- Eyebrow: "Palauta"
- Otsikko: "Nollaa *salasana*"
- Ohje: "Syötä sähköpostiosoitteesi – lähetämme sinulle linkin salasanan vaihtamiseen."
- Kenttä: "Sähköpostiosoite"
- Nappi: "Lähetä palautuslinkki" (lataus: "Lähetetään...")
- Onnistumisviesti: "✓ Linkki lähetetty. Tarkasta sähköpostisi – linkki on voimassa tunnin."

### Salasanan vaihto (`src/routes/vaihda-salasana.tsx`)
- Eyebrow: "Salasana"
- Otsikko: "Aseta uusi *salasana*"
- Kentät: "Uusi salasana" (vihje "Vähintään 8 merkkiä"), "Vahvista uusi salasana"
- Nappi: "Tallenna uusi salasana" (lataus: "Tallennetaan...")
- Onnistumisviesti: "✓ Salasana vaihdettu onnistuneesti. Sinut ohjataan kojelaudalle..."
- Virheviestit: "Salasanan tulee olla vähintään 8 merkkiä", "Salasanat eivät täsmää"

---


## Liitteet / Tekninen referenssi

- Kausi-määritykset: kevät 🌱 (maalis–touko), kesä ☀️ (kesä–elo), syksy 🍂 (syys–marras), talvi ❄️ (joulu–helmi), ympäri vuoden 🔁
- Huoltotyypit (lomakkeessa): Huolto / Tarkastus / Remontti / Maalaus / Uusiminen
- Huoltokohde-ryhmät: Lämmitysjärjestelmät, Talotekniikka, Rakenne, Sisätilat, Piha, Muu

*Tiedoston rakenteen voi syöttää suoraan Lovablelle tekstipäivitysten yhteydessä.*

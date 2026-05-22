// PTS-kohteiden sisältötekstit. Kolme viestiä per kohde, valitaan tilan mukaan.
// Viesti 0: faktat ja ennaltaehkäisy (Seurannassa / Lähivuosina)
// Viesti 1: riskit ja vakuutus (Kiireellinen, ei ylitetty)
// Viesti 2: pitkään ylitetty – konkreettiset seuraukset

import type { PtsTila } from "./pts-saannot";

type Viestit = [string, string, string];

const TEKSTIT: Record<string, Viestit> = {
  "Öljykattila": [
    "Öljykattilan tekninen käyttöikä on tyypillisesti noin 25 vuotta. Vuosihuolto on lakisääteinen ja pitää hyötysuhteen kunnossa.",
    "Kattilan ikääntyessä hajoamisriski kasvaa erityisesti kovilla pakkasilla, jolloin uutta laitetta ja asentajaa on vaikea saada nopeasti. Suunnittele lämmitysjärjestelmän uusiminen etukäteen.",
    "Käyttöikä on selvästi ylitetty. Yllättävä hajoaminen pakkasella aiheuttaa lämmityskatkon ja kiireellisen vaihdon, joka on aina kalleimmasta päästä.",
  ],
  "Maalämpöpumppu": [
    "Maalämpöpumpun käyttöikä on noin 22 vuotta. Vuosittainen huolto pidentää käyttöikää ja varmistaa hyötysuhteen.",
    "Kompressorin vikaantuminen on yleisin syy uusimiseen. Vanhempi laite kannattaa huoltaa ja varata budjettia uusimiselle ennen yllätyksiä.",
    "Käyttöikä ylitetty: kompressorivika voi tarkoittaa koko sisäyksikön uusimista. Ennakointi säästää tuhansia euroja.",
  ],
  "Ilma-vesilämpöpumppu": [
    "Ilma-vesilämpöpumpun käyttöikä on noin 18 vuotta. Suodattimien puhdistus ja vuosihuolto ovat tärkeitä.",
    "Vanha ulkoyksikkö menettää hyötysuhdettaan, mikä näkyy sähkölaskussa erityisesti pakkasella.",
    "Käyttöikä on ylitetty. Hajoamisriski kasvaa ja varaosien saatavuus heikkenee – suunnittele uusiminen.",
  ],
  "Ilmalämpöpumppu": [
    "Ilmalämpöpumpun käyttöikä on noin 14 vuotta. Suodattimien pesu pari kertaa vuodessa pidentää ikää.",
    "Vanhentuva laite kuluttaa enemmän ja jäähdyttää heikommin. Vaihto uuteen maksaa itsensä takaisin energiansäästönä.",
    "Käyttöikä ylitetty: hyötysuhde voi olla puolet uudesta. Uusiminen kannattaa pian.",
  ],
  "Kaukolämpövaihdin": [
    "Kaukolämpövaihtimen käyttöikä on noin 25 vuotta. Tarkastus 5–10 vuoden välein pitää järjestelmän kunnossa.",
    "Vuotava vaihdin aiheuttaa vesivahingon ja lämmityskatkon. Ennakoiva uusiminen on huomattavasti edullisempi.",
    "Käyttöikä ylitetty: vuotoriski on kasvanut merkittävästi. Suomessa tapahtuu vuosittain noin 60 000 vesivahinkoa – moni alkaa juuri vanhasta lämmönlähteestä.",
  ],
  "Poistoilmalämpöpumppu": [
    "Poistoilmalämpöpumpun käyttöikä on noin 20 vuotta. Suodattimien vaihto ja huolto pari vuoden välein.",
    "Vanha PILP heikentää ilmanvaihtoa ja kasvattaa sähkönkulutusta huomaamatta.",
    "Käyttöikä ylitetty: uusi laite parantaa sekä ilmanlaatua että lämmityskustannuksia.",
  ],
  "Sähkökattila": [
    "Sähkökattilan käyttöikä on noin 25 vuotta. Vastuselementtien tarkastus 5 vuoden välein.",
    "Vanhentuva kattila voi vuotaa, ja sähköviat aiheuttavat tulipaloriskin. Suunnittele uusiminen.",
    "Käyttöikä ylitetty: turvallisuus- ja vuotoriski on todellinen. Uusiminen on suositeltavaa.",
  ],
  "Sähköpatterit": [
    "Suora sähkölämmitys kestää noin 30 vuotta. Tarkasta termostaattien toiminta ja patterien pinta säännöllisesti.",
    "Vanhat patterit ja termostaatit kuluttavat enemmän. Uusiminen tai lämmitysmuodon vaihto tuo selvät säästöt.",
    "Käyttöikä ylitetty: harkitse lämpöpumpun lisäämistä rinnalle – takaisinmaksuaika on usein lyhyt.",
  ],
  "Ilmanvaihtokone": [
    "Ilmanvaihtokoneen käyttöikä on noin 20 vuotta. Suodattimet vaihdetaan 1–2 kertaa vuodessa ja kone huolletaan 5 vuoden välein.",
    "Vanhentunut IV-kone heikentää sisäilmaa ja voi aiheuttaa kosteusongelmia rakenteissa.",
    "Käyttöikä ylitetty: huono ilmanvaihto on yksi yleisimmistä syistä kosteusvaurioihin. Uusiminen on kannattavaa.",
  ],
  "Painovoimaisen ilmanvaihdon kartoitus": [
    "Painovoimainen ilmanvaihto toimii ilman konetta – lämpötilaerojen ja tuulen avulla. Suositellaan ilmanvaihdon tilanteen kartoitusta noin 15–20 vuoden välein. Tyypillisiä puutteita: ilmanvaihto heikkenee talvella tuulettomilla keleillä, ei lämmöntalteenottoa (hukkaa 30–40 % lämmitysenergiasta), korvausilma tulee hallitsemattomasti rakenteiden raoista ja kosteus voi tiivistyä rakenteisiin. Hormien tukkeutuminen ja tiivistyneet ikkunat heikentävät toimintaa entisestään.",
    "Painovoimaisen ilmanvaihdon riittävyys kannattaa tarkistuttaa: heikko ilmanvaihto kasvattaa kosteus- ja homevaurioiden riskiä sekä heikentää sisäilman laatua. Kartoituksessa selviää, riittääkö nykyinen järjestelmä vai tarvitaanko korvausilmaventtiilejä, hormien puhdistus tai koneellisen poiston/LTO:n lisäys.",
    "Kartoitus on viivästynyt. Tilaa ilmanvaihdon kuntoarvio ammattilaiselta – painovoimaisen järjestelmän puutteet näkyvät usein vasta kosteusvaurioina tai sisäilmaoireiluna.",
  ],
  "Käyttövesiputkisto": [
    "Käyttövesiputkien käyttöikä on noin 40 vuotta. Tarkasta liitokset säännöllisesti vuotojen varalta.",
    "Vanhat putket vuotavat usein piilossa rakenteissa. Vesivahinko ei aina ole vakuutuksen korvattava, jos putkisto on selvästi yli iän.",
    "Käyttöikä ylitetty: piilevän vuodon riski on suuri. Vakuutus ei korvaa pitkäaikaista kosteusvauriota – putkiremonttia kannattaa harkita.",
  ],
  "Viemäröinti": [
    "Viemäreiden käyttöikä on noin 40 vuotta. Kuvaus 10 vuoden välein paljastaa alkavat ongelmat.",
    "Tukkeumat ja juurivuodot ovat tavallisia vanhassa viemäristössä. Sukitus on pinnoittamista nopeampi ja edullisempi vaihtoehto uusimiselle.",
    "Käyttöikä ylitetty: viemäririkko aiheuttaa hajuhaittoja ja kosteusvaurion alapohjaan. Kuvaus ja sukitus kannattaa tehdä pian.",
  ],
  "Peltikatto": [
    "Peltikaton käyttöikä on noin 40 vuotta. Maalaus 10–15 vuoden välein pidentää käyttöikää.",
    "Ruoste etenee piilossa. Vuotava katto kastelee yläpohjan eristeet, jotka kuivuvat hitaasti.",
    "Käyttöikä ylitetty: katon uusiminen kannattaa ennen ensimmäistä vuotoa – yläpohjavaurio maksaa moninkertaisesti.",
  ],
  "Tiilikatto": [
    "Tiilikaton käyttöikä on noin 50 vuotta. Tarkasta tiilien ehjyys ja aluskate säännöllisesti.",
    "Rikkoutunut tiili tai vuotava aluskate aiheuttaa kosteusvaurion. Säännöllinen tarkastus on edullinen vakuutus.",
    "Käyttöikä ylitetty: aluskate on todennäköisesti elinkaarensa päässä, vaikka tiilet näyttäisivät hyväkuntoisilta.",
  ],
  "Bitumihuopa": [
    "Bitumihuopakatto kestää noin 20 vuotta. Tarkasta saumat ja läpiviennit vuosittain.",
    "Halkeillut huopa vuotaa nopeasti. Uusiminen ennen vuotoa estää yläpohjavaurion.",
    "Käyttöikä ylitetty: uusiminen on kiireellinen toimenpide. Bitumin haurastuminen lisää vuotoriskiä jokaisena talvena.",
  ],
  "Puujulkisivun maalaus": [
    "Puujulkisivun maalaus tehdään 8–12 vuoden välein. Pesu ja huoltomaalaus pidentävät käsittelyn käyttöikää.",
    "Hilseilevä maali altistaa puun säälle. Lahovaurio etenee pian, kun puu on suojaamattomana.",
    "Maalauskäsittely on ohittanut käyttöikänsä. Lahovaurioiden riski kasvaa nopeasti – maalaus kannattaa tilata ensi kaudelle.",
  ],
  "Puujulkisivun uusiminen": [
    "Puujulkisivun (lautaverhouksen) tekninen käyttöikä on noin 50 vuotta säännöllisellä huoltomaalauksella. Tarkkaile erityisesti sokkelin yläosaa, ikkunoiden ympäristöä ja räystäiden alaosia – niissä lahovauriot näkyvät ensin.",
    "Lahonneet laudat kannattaa vaihtaa ajoissa. Jos vaurioita on laajemmin, koko verhouksen uusiminen tulee suunnitella – samalla voi parantaa lisäeristystä.",
    "Käyttöikä ylitetty: verhouksen uusiminen on ajankohtaista. Piilevät lahovauriot voivat ulottua tuulensuojaan ja runkoon asti.",
  ],
  "Hirsijulkisivun peruskorjaus": [
    "Hirsijulkisivu kestää oikein hoidettuna jopa 80–100 vuotta. Hirsien välien tilkkeet ja ulkopinnan käsittely tarkastetaan noin 15 vuoden välein.",
    "Vajonneet tilkkeet ja vaurioitunut pintakäsittely päästävät kosteuden hirteen. Tilkitse ja käsittele ajoissa.",
    "Peruskorjaus on viivästynyt. Hirsien alaosat ja nurkat kannattaa tarkastuttaa – paikalliset vauriot voi vielä korjata ennen suurempaa työtä.",
  ],
  "Tiilijulkisivun saumaus": [
    "Tiilijulkisivu kestää 100+ vuotta, mutta saumalaastit haurastuvat ja niiden uusiminen on tarpeen noin 40 vuoden välein. Pienet saumakorjaukset tehdään 10 vuoden välein.",
    "Rapistuneet saumat päästävät kosteuden tiiliin – pakkasrapautuminen voi vaurioittaa tiiliä peruuttamattomasti.",
    "Saumaus on viivästynyt: pakkasrapautumisriski on todellinen. Tarkastuta julkisivu ja saumaa kuluneet kohdat pian.",
  ],
  "Rapatun julkisivun huolto": [
    "Rappauspinnan käyttöikä on noin 30–50 vuotta. Halkeamat ja irronneet kohdat kannattaa paikata 10 vuoden välein, ja pinta huoltomaalata noin 15–20 vuoden välein.",
    "Halkeamat päästävät veden rappauksen taakse, jolloin pakkanen irrottaa pintoja laajemmalti. Paikkaa ja maalaa ajoissa.",
    "Huoltoaika ylitetty: pakkasvaurioiden ja kosteusongelmien riski on suuri. Tilaa rappauksen kuntoarvio.",
  ],
  "Levyverhouksen uusiminen": [
    "Levyverhouksen (kuitusementti, mineriittilevy yms.) käyttöikä on noin 40 vuotta. Saumat, kiinnikkeet ja tuuletusrako tarkastetaan 10 vuoden välein.",
    "Vanhat levyt voivat sisältää asbestia – ennen 1988 asennettujen levyjen purkutyö vaatii asbestikartoituksen. Suunnittele uusiminen huolella.",
    "Käyttöikä ylitetty: kiinnitysten ja tuuletuksen kunto on syytä tarkistuttaa. Uusimisen yhteydessä asbestin mahdollisuus huomioitava.",
  ],
  "Peltijulkisivun maalaus": [
    "Peltijulkisivun maalipinta uusitaan noin 20 vuoden välein. Pinta pestään ja paikkamaalataan 5 vuoden välein.",
    "Ruoste etenee maalipinnan rikkoutuessa nopeasti. Paikkamaalaus on edullinen tapa ehkäistä laajaa korroosiota.",
    "Maalaus on viivästynyt: ruostevauriot voivat vaatia jo levyjen vaihtoa. Tilaa kuntoarvio.",
  ],
  "Salaojat": [
    "Salaojien käyttöikä on noin 40 vuotta. Tarkastus 5 vuoden välein paljastaa tukkeumat.",
    "Tukkeutuneet salaojat ohjaavat veden perustuksia vasten. Tämä on yleisin syy kellarin kosteusongelmiin.",
    "Käyttöikä ylitetty: salaojien uusiminen on iso urakka mutta välttämätön. Routa- ja kosteusvauriot ovat moninkertaisesti kalliimpia korjata.",
  ],
  "Ikkunat": [
    "Ikkunoiden käyttöikä on noin 30 vuotta. Tiivisteet ja heloitukset kannattaa huoltaa säännöllisesti.",
    "Vanhat ikkunat vuotavat lämpöä ja vetoa. Uusiminen on iso investointi mutta tuo merkittävät energiasäästöt.",
    "Käyttöikä ylitetty: ikkunoiden uusiminen on yleensä kannattavaa sekä energian että viihtyvyyden takia.",
  ],
  "Kylpyhuone / märkätila": [
    "Kylpyhuoneen pintojen käyttöikä on noin 25 vuotta. Vedeneristyksen kunto on kriittisin asia. Suositellaan myös tarkastamaan silikonisaumat sekä laattojen saumat säännöllisesti – haljennut silikoni tai irtoava sauma päästää vettä rakenteisiin pitkään huomaamatta.",
    "Vanhentunut vedeneristys vuotaa hiljalleen. Vakuutus ei korvaa vauriota, jos rakenne on ylittänyt iän selvästi. Tarkasta erityisesti suihkunurkan, kylpyammeen reunan ja lattiakaivon silikonit sekä saumat – uusi tarvittaessa.",
    "Käyttöikä ylitetty: kosteusvaurion riski on suuri. Märkätilaremontti kannattaa suunnitella pian – piilevä vaurio on kallein. Halkeilleet silikonit ja saumat ovat usein ensimmäinen merkki alkavasta vauriosta.",
  ],
  "Terassi (puu)": [
    "Puuterassin käyttöikä on noin 20 vuotta. Öljyäminen joka 2–3 vuosi pidentää käyttöikää huomattavasti.",
    "Lahonneet rakenteet ovat turvallisuusriski. Tarkasta erityisesti kantavat tolpat ja pintalaudat.",
    "Käyttöikä ylitetty: rakenteiden uusiminen on suositeltavaa turvallisuussyistä.",
  ],
  "Terassin lasitus": [
    "Terassilasituksen käyttöikä on noin 25–30 vuotta. Kiskot, rullat ja tiivisteet kannattaa tarkastaa ja puhdistaa noin 2 vuoden välein – jumiutuneet rullat aiheuttavat lasien rikkoutumisen.",
    "Tiivisteiden kovettuminen, kiskojen jumittuminen tai vesivuoto kiskoja pitkin viittaa huoltotarpeeseen. Tarkasta myös pulttien kireys ja lasien kiinnitys.",
    "Käyttöikä ylitetty: tiivisteiden, kiskojen ja koneiston uusiminen tai koko järjestelmän vaihto kannattaa suunnitella – vesivuoto saattaa vaurioittaa terassirakennetta.",
  ],
};

const OLETUS: Viestit = [
  "Suositeltu toimenpide lähestyy. Varaa aika asiantuntijalle hyvissä ajoin.",
  "Toimenpide kannattaa tehdä lähivuosina, jotta vältät kiireelliset ja kalliit korjaukset.",
  "Toimenpide on viivästynyt. Tilaa ammattilaisen arvio mahdollisimman pian.",
];

export function getSisaltoteksti(kohde: string, tila: PtsTila): string {
  const tekstit = TEKSTIT[kohde] ?? OLETUS;
  if (tila === "kiireellinen") return tekstit[1];
  if (tila === "lahivuosina") return tekstit[0];
  return tekstit[0];
}

export function getYlitetytTeksti(kohde: string): string {
  return (TEKSTIT[kohde] ?? OLETUS)[2];
}

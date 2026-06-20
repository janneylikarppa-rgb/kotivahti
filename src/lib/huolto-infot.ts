// Infopaketit vuosikellon huoltotoimille.
// Tarkoitettu erityisesti omakotitalon huoltoon vähemmän perehtyneille:
// kerrotaan lyhyesti miksi toimi tehdään, miten edetään ja milloin
// kannattaa kutsua ammattilainen.

export type HuoltoInfo = {
  miksi: string;
  miten?: string;
  milloinAmmattilainen?: string;
  vinkki?: string;
};

// Avainsanasovitus: ensimmäinen osuma voittaa.
const SAANTOJA: { avain: RegExp; info: HuoltoInfo }[] = [
  {
    avain: /silikon|sauma/,
    info: {
      miksi: "Märkätilojen silikonisaumat estävät veden pääsyn rakenteisiin. Jos saumat halkeavat tai irtoavat, kosteus voi päästä laatoituksen taakse ja aiheuttaa pahimmillaan vaurioita seinärakenteisiin.",
      miten: "Tarkasta suihkun, kylpyammeen ja pesualtaiden silikonisaumat silmämääräisesti. Etsi halkeamia, tummumia, irtoamista tai homekasvustoa. Pienen, ehjän halkeaman voi tilkitä itse sanitaarisilikonilla.",
      milloinAmmattilainen: "Jos laattojen taakse epäillään päässeen vettä, sauma irtoaa laajalti tai vedeneristyksen kunto mietityttää, tilaa ammattilaisen tarkastus.",
      vinkki: "Silikonisaumojen tyypillinen käyttöikä on 3–5 vuotta käytöstä riippuen.",
    },
  },
  {
    avain: /palovaroit/,
    info: {
      miksi: "Toimiva palovaroitin on lakisääteinen ja voi pelastaa hengen. Pariston tyhjenemiseen ei aina muista varautua.",
      miten: "Paina varoittimen testinappia, kunnes kuulet hälytysäänen. Vaihda paristo vähintään kerran vuodessa tai aina kun varoitin piippaa muistutuksena.",
      vinkki: "Asunnossa pitää olla vähintään yksi palovaroitin alkavaa 60 m² kohti, joka asuinkerroksessa.",
    },
  },
  {
    avain: /vikavirtasu/,
    info: {
      miksi: "Vikavirtasuoja katkaisee sähkön sekunnin murto-osassa, jos virta vuotaa esim. ihmisen kautta. Testaamatta jättäminen voi tarkoittaa, ettei suoja oikeasti toimi hätätilanteessa.",
      miten: "Paina sähkökeskuksen vikavirtasuojan T-painiketta. Suojan pitää lauetessaan napsauttaa pois päältä. Kytke sen jälkeen takaisin päälle.",
      milloinAmmattilainen: "Jos vikavirtasuoja ei laukea testissä tai sähköt menevät usein poikki ilman selvää syytä, tilaa sähköasentaja.",
    },
  },
  {
    avain: /iv-suodat|suodatti.*vaiht|suodattim/,
    info: {
      miksi: "Likainen suodatin heikentää ilmanvaihtoa ja kasvattaa sähkönkulutusta. Pahimmillaan epäpuhtaudet päätyvät hengitysilmaan.",
      miten: "Avaa IV-koneen huoltoluukku, vedä vanhat suodattimet pois ja asenna uudet nuolen osoittamaan suuntaan. Merkitse vaihtopäivä muistiin.",
      vinkki: "Tavalliset suodattimet vaihdetaan 2 kertaa vuodessa (kevät/syksy). Pölyisellä alueella useammin.",
    },
  },
  {
    avain: /ilmaläm.*suodat|ilmaläm.*puhdist|ilp.*suodat/,
    info: {
      miksi: "Tukkeutuneet sisäyksikön suodattimet alentavat lämmityksen hyötysuhdetta ja levittävät pölyä huoneilmaan.",
      miten: "Avaa sisäyksikön etukansi, irrota suodattimet ja huuhtele ne haalealla vedellä. Anna kuivua kunnolla ennen takaisinpanoa.",
      vinkki: "Puhdista suodattimet vähintään kerran kuukaudessa lämmityskauden aikana.",
    },
  },
  {
    avain: /ilmaläm.*ulko|ilp.*ulko|ulkoyks/,
    info: {
      miksi: "Pölyyntyneet lamellit estävät lämmönsiirtymistä ja heikentävät pumpun toimintaa erityisesti pakkasilla.",
      miten: "Sammuta laite. Harjaa lamelleista varovasti pöly ja roskat. Voit huuhdella matalapaineisella vedellä – älä paineta painepesurilla.",
      milloinAmmattilainen: "Jos pumppu tipputtaa runsaasti vettä, jäätyy toistuvasti tai pitää epätavallista ääntä, tilaa ammattilaisen tarkastus.",
    },
  },
  {
    avain: /rästäs|räyst|kourujen tyhj|kourujen puhdist|syöksy/,
    info: {
      miksi: "Tukkeutuneet kourut ja syöksyt ohjaavat sadeveden seinärakenteisiin ja perustuksiin. Tämä on yksi yleisimmistä kosteusvaurioiden syistä.",
      miten: "Käytä tukevia tikkaita ja varovaisuutta. Poista lehdet, neulaset ja muu liete kouruista työhön tarkoitetuilla välineillä. Huuhtele lopuksi vedellä – veden pitää virrata vapaasti syöksytorvesta ulos.",
      milloinAmmattilainen: "Ammattilainen tekee työn turvallisesti ja puhdistukseen tarkoitetuilla välineillä yleensä suoraan maasta käsin. Työ on nopea toimenpide, joten mikäli et ole varma mitä teet niin ammattilaisen apu on hyvä vaihtoehto.",
    },
  },
  {
    avain: /salaoj/,
    info: {
      miksi: "Salaojat pitävät pohjaveden poissa perustuksista. Tukkiutuessaan ne aiheuttavat kosteusvaurioita kellariin ja perustuksiin.",
      miten: "Avaa tarkastuskaivot ja tarkista, ettei pohjalla ole liettä tai juuria. Veden pitää virrata vapaasti.",
      milloinAmmattilainen: "Salaojien huuhtelu tehdään ammattilaisen painepesulaitteella – tämä ei ole DIY-työ.",
      vinkki: "Salaojat suositellaan huuhdeltavaksi 5–10 vuoden välein.",
    },
  },
  {
    avain: /lattiakaiv|hajulukk/,
    info: {
      miksi: "Lattiakaivoon kerääntyy nukkaa, hiuksia ja saippuajämiä, jotka tukkivat viemärin ja levittävät hajua.",
      miten: "Irrota säleikkö ja vesilukon kuppi. Puhdista kaikki osat lämpimällä vedellä ja harjalla. Asenna takaisin niin, että vesilukko on paikoillaan.",
      vinkki: "Puhdista vähintään 2 kertaa vuodessa – kylpyhuoneissa useammin.",
    },
  },
  {
    avain: /pesukon.*letk|vesiletk/,
    info: {
      miksi: "Vanhentuneet kumiletkut ovat yleisimpiä vuotojen aiheuttajia. Pieni vuoto voi aiheuttaa kymmenien tuhansien eurojen vahingot.",
      miten: "Tarkista letkujen kunto: ei halkeamia, kovettumia tai kosteutta liitoksissa. Sulje vesi käytön jälkeen, jos mahdollista.",
      vinkki: "Vaihda letkut 5–10 vuoden välein, vaikka ne näyttäisivät hyväkuntoisilta.",
    },
  },
  {
    avain: /nuohou|hormi|piipu/,
    info: {
      miksi: "Nuohous on lakisääteinen ja ehkäisee hormipalon. Likainen piippu vetää huonosti ja kuluttaa enemmän polttopuita.",
      miten: "Tilaa piirin nuohooja vuosittain. Nuohooja antaa kirjallisen pöytäkirjan.",
      vinkki: "Vakituisesti asutun talon takka ja hormi on nuohottava vuosittain, vapaa-ajan asunnon harvemmin.",
    },
  },
  {
    avain: /katto.*tarkast|peltikat|huopakat|tarkasta katto/,
    info: {
      miksi: "Olosuhteet ja ikä aiheuttavat vuosittain vahinkoja kattomateriaaleihin. Pienet viat huomataan helposti, jos katto tarkastetaan säännöllisesti.",
      miten: "Tarkista: irronneet pellit/tiilet, ruoste, halkeamat tai sammalkasvustot. Tarkista myös läpiviennit ja yläpohja mahdollisten vuotojen varalta.",
      milloinAmmattilainen: "Jyrkkä tai liukas katto on aina ammattilaisen työ – yleisesti on suositeltavaa antaa ammattilaisen tarkastaa katto ja siihen liittyvät rakenteet. Tarkastuksessa saat selkeän kuvan kattosi tilanteesta.",
    },
  },
  {
    avain: /lumikuorm|lumi.*katto|jääpuikko/,
    info: {
      miksi: "Suuri lumikuorma voi vaurioittaa kattorakenteita. Jääpuikot voivat pudotessaan aiheuttaa vakavia tapaturmia.",
      miten: "Seuraa lumikuorman määrää – yli 50 cm märkää lunta on jo paljon. Tilaa lumenpudotus ajoissa.",
      milloinAmmattilainen: "Aina – lumenpudotus on putoamissuojausta vaativaa työtä. Älä yritä itse.",
    },
  },
  {
    avain: /ulkovesipist|talvisul/,
    info: {
      miksi: "Ulkovesipiste jäätyy ja voi rikkoutua talvella, jos sitä ei sulkea ja tyhjennetä.",
      miten: "Sulje sulkuventtiili sisätiloista (yleensä kellarissa tai teknisessä tilassa) ja avaa ulkohana, jotta vesi valuu pois putkesta.",
      vinkki: "Tee tämä ennen ensimmäisiä yöpakkasia.",
    },
  },
  {
    avain: /julkisivu.*tarkast|julkisivu.*pesu|puujulkisivu/,
    info: {
      miksi: "Säännöllinen tarkastus paljastaa maalin lohkeilut, halkeamat ja kosteusvauriot ajoissa – ennen kuin korjauskustannukset kasvavat.",
      miten: "Kierrä talo ja tarkista pinnoite, saumat sekä alapellitykset. Pese julkisivu tarvittaessa miedolla puhdistusaineella ja matalapaineisella vedellä.",
      vinkki: "Puujulkisivun maalipinta uusitaan tyypillisesti 8–15 vuoden välein.",
    },
  },
  {
    avain: /terass.*öljy|terass.*käsit|terass.*hoito|terassilaud/,
    info: {
      miksi: "Käsittelemätön puuterassi harmaantuu ja halkeilee nopeasti. Säännöllinen öljyäminen pidentää käyttöikää vuosilla.",
      miten: "Pese terassi puuterassiaineella, anna kuivua kunnolla ja levitä terassiöljy siveltimellä syiden suuntaisesti. Tee kuivalla, lämpimällä säällä.",
      vinkki: "Käsittele vähintään joka 2. vuosi.",
    },
  },
  {
    avain: /ikkun.*tiivist|tiivisteid/,
    info: {
      miksi: "Vanhentuneet tiivisteet päästävät vetoa ja nostavat lämmityskustannuksia. Niiden vaihto on pieni mutta tuntuva energiansäästötoimi.",
      miten: "Tarkasta tiivisteet kosketuksella: kovettuneet, halkeilleet tai litistyneet tiivisteet vaihdetaan. Vaihtotiivisteet löytyvät rautakaupasta.",
      milloinAmmattilainen: "Ammattilainen tarkastaa ja arvioi ikkunoiden ja ovien kunnon, saat selkeän kuvan kunnosta ja huoltotarpeesta.",
      vinkki: "Tarkasta erityisesti pohjoispuolen ja merituulen puoleiset ikkunat.",
    },
  },
  {
    avain: /öljykattil|öljysäil/,
    info: {
      miksi: "Öljykattilan vuosihuolto pitää hyötysuhteen korkeana ja säästää polttoöljyä. Säiliön kuntotarkastus on lisäksi ympäristövastuukysymys.",
      miten: "Tilaa vuosihuolto ammattilaiselta. Voit itse tarkastaa silmämääräisesti, onko säiliön ympärillä öljyhajua tai kosteutta.",
      milloinAmmattilainen: "Aina kattilan huolto ja säiliön tiiviystarkastus.",
    },
  },
  {
    avain: /maaläm/,
    info: {
      miksi: "Säännöllinen huolto varmistaa, ettei keruupiirin paine ole laskenut ja että pumppu toimii suunnitellulla hyötysuhteella.",
      miten: "Tarkista paineenmittarin lukema (yleensä 0,5–2 bar). Kuuntele, kuuluuko pumpusta epätavallisia ääniä.",
      milloinAmmattilainen: "2–3 vuoden välein tehtävän määräaikaishuollon tekee aina ammattilainen.",
    },
  },
  {
    avain: /kiuk|kiua/,
    info: {
      miksi: "Halkeilleet tai murentuneet kiuaskivet heikentävät löylyä ja voivat aiheuttaa vastusten ylikuumenemista.",
      miten: "Tyhjennä kivet, pudota irtoroskat pois ja lado kivet löysästi takaisin. Vaurioituneet kivet vaihdetaan uusiin.",
      vinkki: "Kivien vaihtoväli on tyypillisesti 1–3 vuotta käytöstä riippuen.",
    },
  },
  {
    avain: /energi|mittarilukem|kulut.*seur/,
    info: {
      miksi: "Säännöllinen seuranta paljastaa nopeasti, jos jokin laite kuluttaa odottamattoman paljon energiaa tai vettä – usein piilevän vian merkki.",
      miten: "Lue sähkö-, vesi- ja lämpömittarit kuukausittain ja merkitse muistiin (esim. taulukkoon).",
      vinkki: "Vertaa lukemia edellisvuoden vastaavaan kuukauteen – iso muutos kannattaa selvittää.",
    },
  },
  {
    avain: /lto|lämmöntalt/,
    info: {
      miksi: "LTO-kennon likaantuminen pudottaa hyötysuhdetta nopeasti ja kasvattaa lämmityslaskua.",
      miten: "Tarkista kennon kunto huoltoluukun kautta. Jos koneessa on irrotettava kenno, pese se valmistajan ohjeen mukaan.",
      milloinAmmattilainen: "Kondenssivesiviemärin tukos ja sähköiset viat vaativat ammattilaisen.",
    },
  {
    avain: /keskuslämmityskattila \(puu\)|kattila.*puu/,
    info: {
      miksi: "Puukattilan hyötysuhde laskee, jos savukanavat ja tulipesä nokeentuvat. Lika kasvattaa polttoaineenkulutusta ja paloturvallisuusriskiä.",
      miten: "Tyhjennä tuhka, harjaa savukanavat ja tarkista tiivisteet vähintään kerran lämmityskaudessa. Pidä varaajan paineet ja anodi tarkkailussa.",
      milloinAmmattilainen: "Nuohous ja varaajan tarkistus tehdään ammattilaisen toimesta vuosittain. Kattilan käyttöikä on tyypillisesti 25–30 vuotta.",
    },
  },
  {
    avain: /keskuslämmityskattila \(öljy\)|öljykattila/,
    info: {
      miksi: "Öljypoltin ja sen suuttimet likaantuvat käytössä, jolloin palaminen heikkenee ja polttoainekulutus nousee. Säännöllinen huolto on myös vakuutusehto monissa kotivakuutuksissa.",
      miten: "Tarkkaile poltinta ja kattilan painemittareita. Ilmoita poikkeavista äänistä tai noesta huoltoliikkeelle.",
      milloinAmmattilainen: "Ammattihuolto vuosittain: suuttimen, suodattimen ja palotilan puhdistus. Käyttöikä 20–25 v.",
    },
  },
  {
    avain: /keskuslämmityskattila \(pelletti\)|pellettikattila/,
    info: {
      miksi: "Pellettipolttimen palopää ja kattilan konvektio-osa likaantuvat tuhkasta ja saostumista. Tukkeumat heikentävät hyötysuhdetta ja voivat sammuttaa kattilan.",
      miten: "Tyhjennä tuhkalaatikko viikoittain käyttökaudella, harjaa palopää ja kattilan pinnat ohjeen mukaan.",
      milloinAmmattilainen: "Vuosittainen ammattihuolto suositellaan. Käyttöikä 20–25 v.",
    },
  },
  {
    avain: /keskuslämmityskattila \(sähkö\)|sähkökattila/,
    info: {
      miksi: "Sähkökattilan vastukset ja anodi kuluvat, ja varaajassa voi kertyä sakkaa. Anodin uusiminen suojaa säiliötä korroosiolta.",
      miten: "Tarkista paisuntasäiliön paine ja varoventtiilin toiminta. Anodi tarkistetaan ammattilaisen toimesta 5 v välein.",
      milloinAmmattilainen: "Vastusten vaihto ja anodin uusinta ovat ammattilaisen töitä. Käyttöikä n. 25 v.",
    },
  },
  {
    avain: /lämmitysputkisto.*(rauta|teräs)/,
    info: {
      miksi: "Vanhat teräsputket korrodoituvat sisältä ja voivat alkaa vuotaa lähestyessään käyttöiän loppua (n. 40 v). Vuodot rakenteissa aiheuttavat usein laajoja kosteusvaurioita.",
      miten: "Seuraa pattereiden ja liitosten ympäristöä silmämääräisesti — ruosteenvärjäykset, kosteat tahrat tai painumat ovat varoitusmerkkejä.",
      milloinAmmattilainen: "Putkiston kuntoarvio ennen 40 v ikää. Uusiminen aina ammattilaisen työ.",
    },
  },
  {
    avain: /lämmitysputkisto.*(kupari|muovi|komposiitti)/,
    info: {
      miksi: "Kupari- ja muovipohjaiset lämmitysputket kestävät tyypillisesti 50 v. Liitokset ja jakotukit ovat heikoin lenkki — niitä kannattaa tarkkailla erityisesti.",
      miten: "Tarkkaile jakotukkien ympäristöä vuosittain. Pidä lukuja patterien menoveden lämpötilasta — selittämätön muutos voi viitata tukkeumaan.",
      milloinAmmattilainen: "Liitosvuodot ja jakotukin huolto kuuluvat LVI-asentajalle.",
    },
  },
  {
    avain: /vesikiertoinen lattialämmitys|lattialämmitys/,
    info: {
      miksi: "Lattialämmityksen putkisto on yleensä valettu betoniin — sen käyttöikä on pitkä (n. 50 v), mutta jakotukin huolto ja veden laatu vaikuttavat kestoon.",
      miten: "Tasapainota piirit jakotukista vuosittain ja varmista paineen riittävyys. Tarkkaile lattian pintalämpöjä — kylmät kohdat voivat viitata ilmaa piirissä tai tukokseen.",
      milloinAmmattilainen: "Piirien huuhtelu ja tasapainotus 10 v välein ammattilaisen toimesta.",
    },
  },
  {
    avain: /sähköpatter|suora sähkölämmit/,
    info: {
      miksi: "Sähköpatterien termostaatit kuluvat ja imevät pölyä, mikä laskee säätötarkkuutta ja kasvattaa kulutusta. Käyttöikä n. 30 v.",
      miten: "Imuroi patterit kerran vuodessa ja testaa termostaatin reagointi. Vaihda yksittäiset viallisia.",
      milloinAmmattilainen: "Patterin vaihto ja kiinteät asennukset aina sähköasentajalle.",
    },
  },
  {
    avain: /lämminvesivaraaja|lvv\b|varaaja/,
    info: {
      miksi: "Lämminvesivaraajan anodi suojaa säiliötä korroosiolta — kun anodi on syöpynyt loppuun, säiliö alkaa ruostua. Vastuksiin kertyy kalkkia, mikä kasvattaa sähkölaskua.",
      miten: "Tarkasta varoventtiilin toiminta vuosittain (nostamalla vipua hetkeksi). Kuuntele kalkkikiviloksahdusta lämmityksen aikana.",
      milloinAmmattilainen: "Anodi tarkistetaan ja vaihdetaan 3–5 v välein. Vastusten kalkin poisto ja anodinvaihto ovat ammattilaisen töitä. Käyttöikä n. 25 v.",
    },
  },
];

export function haeHuoltoInfo(nimi: string): HuoltoInfo | null {
  const n = nimi.toLowerCase();
  for (const s of SAANTOJA) if (s.avain.test(n)) return s.info;
  return null;
}

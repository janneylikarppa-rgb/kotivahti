export type Kausi = "kevat" | "kesa" | "syksy" | "talvi" | "ympari_vuoden";

export const KAUDET: { key: Kausi; nimi: string; ikoni: string }[] = [
  { key: "kevat", nimi: "Kevät", ikoni: "🌱" },
  { key: "kesa", nimi: "Kesä", ikoni: "☀️" },
  { key: "syksy", nimi: "Syksy", ikoni: "🍂" },
  { key: "talvi", nimi: "Talvi", ikoni: "❄️" },
  { key: "ympari_vuoden", nimi: "Ympäri vuoden", ikoni: "🔁" },
];

export const PERUSHUOLLOT: Record<Kausi, string[]> = {
  kevat: [
    "Tarkista katto ja räystäskourut lumen sulamisen jälkeen",
    "Puhdista syöksytorvet ja sadevesikaivot",
    "Tarkasta julkisivu halkeamien varalta",
    "Avaa kesävesijärjestelmä",
    "Tarkasta ja puhdista ilmanvaihtosuodattimet",
  ],
  kesa: [
    "Tarkasta ja huolla terassit ja ulkopinnat",
    "Tarkista salaojat ja perustusten kuivatus",
    "Testaa palovaroittimet",
    "Pesu- ja maalauskausi: julkisivu",
    "Tarkista nurmikko, pensaat ja puut",
  ],
  syksy: [
    "Tyhjennä räystäskourut lehdistä",
    "Sulje ulkohanat ja tyhjennä putket",
    "Tarkista lämmitysjärjestelmä ennen kylmiä",
    "Tarkasta ikkunoiden ja ovien tiivisteet",
    "Vaihda ilmanvaihtosuodattimet",
  ],
  talvi: [
    "Pudota katolta vaaralliset lumet ja jäät",
    "Tarkkaile sisäilman kosteutta ja lämpötilaa",
    "Varmista lumitilan ja kulkureittien turvallisuus",
    "Tarkasta höyrysulun ja eristyksen toimivuus",
  ],
  ympari_vuoden: [
    "Lue sähkö- ja vesimittarit",
    "Testaa palovaroittimet kuukausittain",
    "Tarkasta vesivuotojen varalta keittiö ja kylpyhuone",
    "Käytä ja huolla ilmanvaihtoa säännöllisesti",
  ],
};

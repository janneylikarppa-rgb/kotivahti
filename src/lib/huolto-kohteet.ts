export const HUOLTO_TYYPIT = [
  { value: "huolto", label: "Huolto" },
  { value: "tarkastus", label: "Tarkastus" },
  { value: "remontti", label: "Remontti" },
  { value: "maalaus", label: "Maalaus" },
  { value: "uusiminen", label: "Uusiminen" },
] as const;

export const HUOLTO_KOHDE_RYHMAT: { ryhma: string; kohteet: string[] }[] = [
  {
    ryhma: "Lämmitysjärjestelmät",
    kohteet: [
      "Öljykattila",
      "Maalämpöpumppu",
      "Ilma-vesilämpöpumppu",
      "Ilmalämpöpumppu",
      "Kaukolämpövaihdin",
      "Poistoilmalämpöpumppu",
      "Sähkökattila",
      "Sähköpatterit",
      "Lämminvesivaraaja",
    ],
  },
  {
    ryhma: "Talotekniikka",
    kohteet: [
      "Ilmanvaihtokone",
      "IV-suodattimet",
      "Käyttövesiputkisto",
      "Viemäröinti",
      "Sähköjärjestelmä",
    ],
  },
  {
    ryhma: "Rakenne",
    kohteet: [
      "Katto",
      "Räystäät & kourut",
      "Julkisivu",
      "Ikkunat",
      "Ovet",
      "Salaojat",
      "Perustukset",
    ],
  },
  {
    ryhma: "Sisätilat",
    kohteet: [
      "Kylpyhuone / märkätila",
      "Sauna & kiuas",
      "Hormit & tulisijat",
      "Keittiö",
    ],
  },
  {
    ryhma: "Piha",
    kohteet: ["Terassi", "Piha-alue", "Aita & portit"],
  },
  {
    ryhma: "Muu",
    kohteet: ["Muu"],
  },
];

export const HUOLTO_KOHTEET = HUOLTO_KOHDE_RYHMAT.flatMap((r) => r.kohteet);

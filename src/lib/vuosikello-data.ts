export type Kausi = "kevat" | "kesa" | "syksy" | "talvi" | "ympari_vuoden";

export const KAUDET: { key: Kausi; nimi: string; ikoni: string; kuukaudet: string }[] = [
  { key: "kevat", nimi: "Kevät", ikoni: "🌱", kuukaudet: "maalis–touko" },
  { key: "kesa", nimi: "Kesä", ikoni: "☀️", kuukaudet: "kesä–elo" },
  { key: "syksy", nimi: "Syksy", ikoni: "🍂", kuukaudet: "syys–marras" },
  { key: "talvi", nimi: "Talvi", ikoni: "❄️", kuukaudet: "joulu–helmi" },
  { key: "ympari_vuoden", nimi: "Ympäri vuoden", ikoni: "🔁", kuukaudet: "" },
];

export const PERUSHUOLLOT: Record<Kausi, string[]> = {
  kevat: [
    "IV-suodattimien vaihto / puhdistus",
    "Katon tarkastus lumen sulamisen jälkeen",
    "Räystäskourujen ja syöksytorvien puhdistus",
    "Salaojien tarkastus ja huuhtelu",
    "Sokkelin ja perustusten tarkastus",
    "Lattiakaivojen ja hajulukkojen puhdistus",
    "Ilmalämpöpumpun puhdistus ja suodattimet",
    "Palovaroittimien testaus ja paristot",
    "Vikavirtasuojan testaus",
    "Pyykinpesukoneen ja astianpesukoneen vesiletkujen tarkastus",
    "Ikkunoiden pesu ja tiivisteiden tarkastus",
    "Aurinkopaneelien puhdistus",
    "Nurmikon ja pensasaidan kevätkunnostus",
    "Lämmityksen kesäasetukset",
    "Ulkovesipisteen avaus",
  ],
  kesa: [
    "Julkisivun tarkastus ja pesu",
    "Terassin hoito ja pintakäsittely",
    "Pihalaatoituksen tarkastus ja saumaus",
    "Nuohouksen tilaus / varmistus",
    "Lämmitysjärjestelmän kesäkäynti",
    "Ulkovalaistuksen tarkastus ja huolto",
    "Nurmikon ja istutusten hoito",
    "Lattiakaivojen puhdistus",
    "Aurinkopaneelien tuoton seuranta",
  ],
  syksy: [
    "Lämmityksen käyttöönotto talvikaudeksi",
    "Ikkunoiden ja ovien tiivisteiden tarkastus",
    "Salaojien tarkastus ennen routaa",
    "Räystäskourujen tyhjennys lehdistä",
    "Nuohouksen tarkistus",
    "Käsisammuttimen tarkastus",
    "Palovaroittimien testaus ja paristot",
    "Vikavirtasuojan testaus",
    "Pesukoneiden vesiletkujen tarkastus",
    "Ulkovesipisteen talvisulku ja tyhjennys",
    "Ilmalämpöpumpun talvivalmistelu",
    "Öljysäiliön tilan tarkastus",
  ],
  talvi: [
    "Katon lumikuorman seuranta",
    "Jääpuikkojen poisto räystäiltä",
    "Putkien jäätymisriskin seuranta",
    "IV-suodattimien tarkastus",
    "Lumikinosten poisto seiniltä ja poistumisteiltä",
    "Kiukaan ja kiuaskivien tarkastus",
    "Märkätilojen saumausten tarkastus",
    "Lattiakaivojen puhdistus",
  ],
  ympari_vuoden: [
    "Palovaroittimien kuukausitesti",
    "Vikavirtasuojan kuukausitesti",
    "Ilmalämpöpumpun suodattimien puhdistus",
    "Energiankulutuksen seuranta (mittarilukemat)",
    "Vesivuotojen tarkkailu (keittiö, kylpyhuone, kodinhoito)",
    "Lämminvesivaraajan toiminnan tarkkailu",
    "Patteriventtiilien toiminnan tarkastus",
    "Vesijohtoverkon painetason seuranta",
    "Liesituulettimen rasvasuodattimen puhdistus",
    "IV-venttiilien puhdistus",
  ],
};

// ---------- Dynaaminen sisältö talon_tiedoista ----------
export type TalonTiedotLite = {
  lammitysmuoto?: string | null;
  ilp_merkki?: string | null;
  ilmanvaihto?: string | null;
  kattomateriaali?: string | null;
  terassi_materiaali?: string | null;
  julkisivumateriaali?: string | null;
};

export function dynamicHuollot(t: TalonTiedotLite | null | undefined): Partial<Record<Kausi, string[]>> {
  const out: Record<Kausi, string[]> = { kevat: [], kesa: [], syksy: [], talvi: [], ympari_vuoden: [] };
  if (!t) return out;

  switch (t.lammitysmuoto) {
    case "oljylammitys":
      out.syksy.push("Öljykattilan vuosihuolto (ammattilainen)");
      out.kevat.push("Öljysäiliön kunnon silmämääräinen tarkastus");
      break;
    case "maalampo":
      out.kevat.push("Maalämpöpumpun määräaikaishuolto (2–3 v välein)");
      out.syksy.push("Lämmönkeruupiirin paineen tarkastus");
      break;
    case "ilmavesilampo":
      out.kevat.push("Ilma-vesilämpöpumpun keväthuolto");
      out.syksy.push("Ilma-vesilämpöpumpun syksyn tarkastus");
      break;
    case "pellettilammitys":
      out.syksy.push("Pellettikattilan vuosihuolto");
      out.kesa.push("Pellettivaraston ja syötön puhdistus");
      break;
    case "puulammitys":
      out.kesa.push("Puukattilan ja savuhormin nuohous / tarkastus");
      break;
    case "kaukolampo":
      out.syksy.push("Lämmönjakokeskuksen tarkastus");
      break;
    case "sahkolammitys":
      out.kevat.push("Sähkövaraajan vastusten ja anodin tarkastus");
      break;
  }

  if (t.ilp_merkki) {
    out.ympari_vuoden.push("Ilmalämpöpumpun (lisälaite) suodattimien puhdistus");
    out.kevat.push("Ilmalämpöpumpun (lisälaite) ulkoyksikön puhdistus");
  }

  if (t.ilmanvaihto === "Koneellinen tulo- ja poistoilmanvaihto (LTO)") {
    out.kevat.push("LTO-koneen suodattimien vaihto");
    out.syksy.push("LTO-koneen suodattimien vaihto");
    out.ympari_vuoden.push("LTO-koneen lämmöntalteenoton tarkastus");
  } else if (t.ilmanvaihto === "Koneellinen poisto") {
    out.kevat.push("Poistoilmapuhaltimen puhdistus");
  }

  if (t.kattomateriaali?.toLowerCase().includes("pelti")) {
    out.kesa.push("Peltikaton ruosteen ja maalipinnan tarkastus");
  }
  if (t.kattomateriaali?.toLowerCase().includes("huopa")) {
    out.kesa.push("Huopakaton saumojen ja pintakerroksen tarkastus");
  }

  if (t.terassi_materiaali?.toLowerCase().includes("puu")) {
    out.kesa.push("Terassilaudoituksen öljyäminen / käsittely");
  }

  if (t.julkisivumateriaali?.toLowerCase().includes("puu")) {
    out.kesa.push("Puujulkisivun maalipinnan tarkastus");
  }

  return out;
}

export function kaikkiHuollot(kausi: Kausi, t: TalonTiedotLite | null | undefined): string[] {
  const dyn = dynamicHuollot(t)[kausi] ?? [];
  return [...PERUSHUOLLOT[kausi], ...dyn];
}

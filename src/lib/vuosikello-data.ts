export type Kausi = "kevat" | "kesa" | "syksy" | "talvi" | "ympari_vuoden";

export const KAUDET: { key: Kausi; nimi: string; ikoni: string; kuukaudet: string }[] = [
  { key: "kevat", nimi: "Kevät", ikoni: "🌱", kuukaudet: "maalis–touko" },
  { key: "kesa", nimi: "Kesä", ikoni: "☀️", kuukaudet: "kesä–elo" },
  { key: "syksy", nimi: "Syksy", ikoni: "🍂", kuukaudet: "syys–marras" },
  { key: "talvi", nimi: "Talvi", ikoni: "❄️", kuukaudet: "joulu–helmi" },
  { key: "ympari_vuoden", nimi: "Ympäri vuoden", ikoni: "🔁", kuukaudet: "" },
];

export type HuoltoRivi = { nimi: string; ammattilainen: boolean; kuvaus?: string };

const t = (nimi: string, kuvaus?: string): HuoltoRivi => ({ nimi, ammattilainen: true, kuvaus });
const f = (nimi: string, kuvaus?: string): HuoltoRivi => ({ nimi, ammattilainen: false, kuvaus });

export const PERUSHUOLLOT: Record<Kausi, HuoltoRivi[]> = {
  kevat: [
    t("IV-suodattimien vaihto / puhdistus"),
    t("Katon tarkastus lumen sulamisen jälkeen"),
    t("Räystäskourujen ja syöksytorvien puhdistus"),
    t("Salaojien tarkastus ja huuhtelu"),
    t("Sokkelin ja perustusten tarkastus"),
    f("Lattiakaivojen ja hajulukkojen puhdistus"),
    t("Ilmalämpöpumpun puhdistus ja suodattimet"),
    f("Palovaroittimien testaus ja paristot"),
    f("Vikavirtasuojan testaus"),
    f("Pyykinpesukoneen ja astianpesukoneen vesiletkujen tarkastus"),
    t("Ikkunoiden pesu ja tiivisteiden tarkastus"),
    f("Aurinkopaneelien puhdistus"),
    t("Nurmikon ja pensasaidan kevätkunnostus"),
    f("Lämmityksen kesäasetukset"),
    f("Ulkovesipisteen avaus"),
  ],
  kesa: [
    t("Julkisivun tarkastus ja pesu"),
    t("Terassin hoito ja pintakäsittely"),
    t("Pihalaatoituksen tarkastus"),
    
    f("Lämmitysjärjestelmän kesäkäynti"),
    f("Ulkovalaistuksen tarkastus"),
    f("Nurmikon ja istutusten hoito"),
    f("Lattiakaivojen puhdistus"),
    f("Aurinkopaneelien tuoton seuranta"),
  ],
  syksy: [
    f("Lämmityksen käyttöönotto talvikaudeksi"),
    t("Ikkunoiden ja ovien tiivisteiden tarkastus"),
    t("Räystäskourujen tyhjennys lehdistä"),
    f("Käsisammuttimen tarkastus"),
    f("Palovaroittimien testaus ja paristot"),
    f("Vikavirtasuojan testaus"),
    f("Pesukoneiden vesiletkujen tarkastus"),
    f("Ulkovesipisteen talvisulku ja tyhjennys"),
    f("Ilmalämpöpumpun talvivalmistelu"),
    f("Öljysäiliön tilan tarkastus"),
  ],
  talvi: [
    f("Katon lumikuorman seuranta"),
    f("Jääpuikkojen poisto räystäiltä"),
    f("Putkien jäätymisriskin seuranta"),
    f("IV-suodattimien tarkastus"),
    f("Lumikinosten poisto seiniltä ja poistumisteiltä"),
    f("Kiukaan ja kiuaskivien tarkastus"),
    f("Märkätilojen silikonien tarkastus"),
    f("Lattiakaivojen puhdistus"),
  ],
  ympari_vuoden: [
    f("Palovaroittimien kuukausitesti"),
    f("Vikavirtasuojan kuukausitesti"),
    t("Ilmalämpöpumpun suodattimien puhdistus"),
    f("Energiankulutuksen seuranta (mittarilukemat)"),
    f("Vesivuotojen tarkkailu (keittiö, kylpyhuone, kodinhoito)"),
    f("Lämminvesivaraajan toiminnan tarkkailu"),
    f("Patteriventtiilien toiminnan tarkastus"),
    f("Vesijohtoverkon painetason seuranta"),
    f("Liesituulettimen rasvasuodattimen puhdistus"),
    f("IV-venttiilien puhdistus"),
  ],
};

// ---------- Dynaaminen sisältö talon_tiedoista ----------
export type TalonTiedotLite = {
  lammitysmuoto?: string | null;
  ilp_merkki?: string | null;
  ilmanvaihto?: string | null;
  kattomateriaali?: string | null;
  terassi_materiaali?: string | null;
  terassi_lasitettu?: boolean | null;
  julkisivumateriaali?: string | null;
  kiuas_tyyppi?: string | null;
  hormityyppi?: string | null;
};

export function dynamicHuollot(tt: TalonTiedotLite | null | undefined): Partial<Record<Kausi, HuoltoRivi[]>> {
  const out: Record<Kausi, HuoltoRivi[]> = { kevat: [], kesa: [], syksy: [], talvi: [], ympari_vuoden: [] };
  if (!tt) return out;

  switch (tt.lammitysmuoto) {
    case "oljylammitys":
      out.syksy.push(t("Öljykattilan vuosihuolto (ammattilainen)"));
      out.kevat.push(f("Öljysäiliön kunnon silmämääräinen tarkastus"));
      break;
    case "maalampo":
      out.kevat.push(t("Maalämpöpumpun määräaikaishuolto (2–3 v välein)"));
      out.syksy.push(f("Lämmönkeruupiirin paineen tarkastus"));
      break;
    case "ilmavesilampo":
      out.kevat.push(t("Ilma-vesilämpöpumpun keväthuolto"));
      out.syksy.push(t("Ilma-vesilämpöpumpun syksyn tarkastus"));
      break;
    case "pellettilammitys":
      out.syksy.push(t("Pellettikattilan vuosihuolto"));
      out.kesa.push(f("Pellettivaraston ja syötön puhdistus"));
      break;
    case "puulammitys":
      out.kesa.push(t("Puukattilan ja savuhormin nuohous / tarkastus"));
      break;
    case "kaukolampo":
      out.syksy.push(f("Lämmönjakokeskuksen tarkastus"));
      break;
    case "sahkolammitys":
      out.kevat.push(f("Sähkövaraajan vastusten ja anodin tarkastus"));
      break;
  }

  if (tt.ilp_merkki) {
    out.ympari_vuoden.push(t("Ilmalämpöpumpun (lisälaite) suodattimien puhdistus"));
    out.kevat.push(t("Ilmalämpöpumpun (lisälaite) ulkoyksikön puhdistus"));
  }

  if (tt.ilmanvaihto === "Koneellinen tulo- ja poistoilmanvaihto (LTO)") {
    out.kevat.push(t("LTO-koneen suodattimien vaihto"));
    out.syksy.push(t("LTO-koneen suodattimien vaihto"));
    out.ympari_vuoden.push(t("LTO-koneen lämmöntalteenoton tarkastus"));
  } else if (tt.ilmanvaihto === "Koneellinen poisto") {
    out.kevat.push(t("Poistoilmapuhaltimen puhdistus"));
  }

  if (tt.kattomateriaali?.toLowerCase().includes("pelti")) {
    out.kesa.push(t("Peltikaton ruosteen ja maalipinnan tarkastus"));
  }
  if (tt.kattomateriaali?.toLowerCase().includes("huopa")) {
    out.kesa.push(t("Huopakaton saumojen ja pintakerroksen tarkastus"));
  }

  if (tt.terassi_materiaali?.toLowerCase().includes("puu")) {
    out.kesa.push(t("Terassilaudoituksen öljyäminen / käsittely"));
  }

  if (tt.terassi_lasitettu === true) {
    out.kevat.push(t("Terassilasien pesu ja kiskojen puhdistus"));
    out.kesa.push(t("Terassilasituksen tiivisteiden ja rullien tarkastus"));
  }

  if (tt.julkisivumateriaali?.toLowerCase().includes("puu")) {
    out.kesa.push(t("Puujulkisivun maalipinnan tarkastus"));
  }

  return out;
}

export function kaikkiHuollot(kausi: Kausi, tt: TalonTiedotLite | null | undefined): HuoltoRivi[] {
  const dyn = dynamicHuollot(tt)[kausi] ?? [];
  return [...PERUSHUOLLOT[kausi], ...dyn];
}

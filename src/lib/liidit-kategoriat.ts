// Yhteinen lista palveluiden kategorioista. Jaetaan client + server.

export const LIIDI_KATEGORIAT = [
  "Ilmanvaihto ja IV-kone",
  "Katto ja räystäät",
  "LVI ja putket",
  "Sähköjärjestelmä",
  "Kylpyhuone ja märkätilat",
  "Lämmitysjärjestelmä",
  "Ilmalämpöpumppu",
  "Salaojat ja sadevesijärjestelmä",
  "Julkisivu ja maalaus",
  "Ikkunat ja ovet",
  "Terassi ja puurakenteet",
  "Kosteus ja sisäilma",
  "Nuohous ja tulisijat",
  "Piha ja maanrakennus",
  "Siivouspalvelu",
  "Muu / yleinen",
] as const;

export type LiidiKategoria = (typeof LIIDI_KATEGORIAT)[number];

export const LIIDI_PALVELUT = [
  { arvo: "kuntoarvio", nimi: "Kuntoarvio", kuvaus: "Ammattilainen käy arvioimassa tilanteen" },
  { arvo: "huolto", nimi: "Huolto", kuvaus: "Toistuva tai kertaluonteinen huoltotyö" },
  { arvo: "tarjouspyynto", nimi: "Tarjouspyyntö", kuvaus: "Kilpailuta työ useammalta tekijältä" },
] as const;

export const LIIDI_STATUKSET = [
  { arvo: "uusi", nimi: "Uusi", vari: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { arvo: "kasittelyssa", nimi: "Käsittelyssä", vari: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { arvo: "valitetty", nimi: "Välitetty", vari: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  { arvo: "valmis", nimi: "Valmis", vari: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { arvo: "peruutettu", nimi: "Peruutettu", vari: "bg-red-500/15 text-red-300 border-red-500/30" },
] as const;

export type LiidiStatus = (typeof LIIDI_STATUKSET)[number]["arvo"];

/** Päättele kategoria huoltorivin nimestä. */
export function arvaaKategoria(nimi: string): LiidiKategoria {
  const n = nimi.toLowerCase();
  if (/(ikkunoiden pesu|siivou)/.test(n)) return "Siivouspalvelu";
  if (/(nuohou|hormi|tulisij|kiuk|takka|piipu|savupiip)/.test(n)) return "Nuohous ja tulisijat";
  if (/(kouru|syöksy|sadevesi|salaoj)/.test(n)) return "Salaojat ja sadevesijärjestelmä";
  if (/(katto|räyst|peltikat|huopa)/.test(n)) return "Katto ja räystäät";
  if (/(iv-|ilmanvaiht|lto|suodatin)/.test(n)) return "Ilmanvaihto ja IV-kone";
  if (/(ilmaläm|ilmalämpöpump|ilp\b)/.test(n)) return "Ilmalämpöpumppu";
  if (/(öljy|maaläm|kattil|lämmit|patteri|varaaja|kaukoläm|pelletti|lämpöpump)/.test(n)) return "Lämmitysjärjestelmä";
  if (/(putk|viemär|vesi|lattiakaivo|hajulukko|painet)/.test(n)) return "LVI ja putket";
  if (/(sähk|vikavirta|sulak)/.test(n)) return "Sähköjärjestelmä";
  if (/(märkätil|kylpy|saumau)/.test(n)) return "Kylpyhuone ja märkätilat";
  if (/(julkisivu|maalau)/.test(n)) return "Julkisivu ja maalaus";
  if (/(ikkun|ovi|tiiviste)/.test(n)) return "Ikkunat ja ovet";
  if (/(teras|puu)/.test(n)) return "Terassi ja puurakenteet";
  if (/(sisäilm|kosteus|home)/.test(n)) return "Kosteus ja sisäilma";
  if (/(piha|nurmik|istutu|aurink|aita)/.test(n)) return "Piha ja maanrakennus";
  return "Muu / yleinen";
}

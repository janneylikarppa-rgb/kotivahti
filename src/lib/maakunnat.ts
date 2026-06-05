export const KAUPUNKI_MAAKUNTA: Record<string, string> = {
  // Pohjois-Savo
  "Kuopio": "Pohjois-Savo",
  "Siilinjärvi": "Pohjois-Savo",
  "Iisalmi": "Pohjois-Savo",
  "Varkaus": "Pohjois-Savo",
  "Suonenjoki": "Pohjois-Savo",
  "Leppävirta": "Pohjois-Savo",
  "Sonkajärvi": "Pohjois-Savo",
  "Kiuruvesi": "Pohjois-Savo",
  "Nilsiä": "Pohjois-Savo",
  "Pielavesi": "Pohjois-Savo",
  "Rautalampi": "Pohjois-Savo",
  "Vesanto": "Pohjois-Savo",
  "Tuusniemi": "Pohjois-Savo",
  "Rautavaara": "Pohjois-Savo",
  "Lapinlahti": "Pohjois-Savo",
  "Kaavi": "Pohjois-Savo",
  // Uusimaa ja muut keskukset
  "Helsinki": "Uusimaa",
  "Espoo": "Uusimaa",
  "Vantaa": "Uusimaa",
  "Tampere": "Pirkanmaa",
  "Oulu": "Pohjois-Pohjanmaa",
  "Turku": "Varsinais-Suomi",
  "Jyväskylä": "Keski-Suomi",
  "Lahti": "Päijät-Häme",
  "Joensuu": "Pohjois-Karjala",
  "Rovaniemi": "Lappi",
  "Mikkeli": "Etelä-Savo",
  "Savonlinna": "Etelä-Savo",
  "Kouvola": "Kymenlaakso",
  "Lappeenranta": "Etelä-Karjala",
  "Vaasa": "Pohjanmaa",
  "Seinäjoki": "Etelä-Pohjanmaa",
  "Hämeenlinna": "Kanta-Häme",
  "Kokkola": "Keski-Pohjanmaa",
  "Pori": "Satakunta",
  "Kajaani": "Kainuu",
};

export const MAAKUNNAT = [
  "Uusimaa", "Varsinais-Suomi", "Satakunta", "Kanta-Häme",
  "Pirkanmaa", "Päijät-Häme", "Kymenlaakso", "Etelä-Karjala",
  "Etelä-Savo", "Pohjois-Savo", "Pohjois-Karjala", "Keski-Suomi",
  "Etelä-Pohjanmaa", "Pohjanmaa", "Keski-Pohjanmaa",
  "Pohjois-Pohjanmaa", "Kainuu", "Lappi", "Ahvenanmaa",
] as const;

export type Maakunta = typeof MAAKUNNAT[number];

export function paateleMaakunta(kaupunki: string | null | undefined): string | null {
  if (!kaupunki) return null;
  const suora = KAUPUNKI_MAAKUNTA[kaupunki];
  if (suora) return suora;
  const t = kaupunki.trim();
  if (!t) return null;
  const norm = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  return KAUPUNKI_MAAKUNTA[norm] ?? null;
}

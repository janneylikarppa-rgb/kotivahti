# Palautekortin kontrastin parantaminen

## Ongelma
Kirjautuneen käyttäjän näkymässä näkyvä `PalauteKortti`-popup (`src/components/palaute-kortti.tsx`) käyttää tällä hetkellä kovakoodattua tummanvihreää taustaa (`bg-[#142A1A]`) ja sovelluksen vaaleassa teemassa `text-cream` renderöityy tummanvihreänä. Lopputulos on huono kontrasti: vihreä laatikko ja tumma teksti eivät erotu taustasta eikä tekstiä ole helppo lukea.

## Muutokset
1. **Kortin tausta ja reunus**
   - Vaihda `bg-[#142A1A]` sovelluksen teeman korttipintaan (`bg-card`).
   - Käytä reunuksena `border-gold/30` tai `border-primary/40` niin, että kortti erottuu selkeästi sivun taustasta.
   - Säilytä `shadow-2xl`, `rounded-xl`, sijainti ja animaatio.

2. **Tekstien värit**
   - Otsikot: `text-card-foreground` (tumma metsänvihreä) vaalealla pohjalla.
   - Pienet ohje- ja metatekstit: säilytä `text-muted-foreground`, joka on vaaleassa teemassa harmaa ja luettava.
   - Kiitosnäkymä: sama `text-card-foreground` otsikolle.

3. **Vastausvaihtoehtojen napit**
   - Valitsemattomana: `bg-secondary` / `border-border` ja `text-secondary-foreground`.
   - Valittuna: `bg-primary/15` / `border-primary` ja `text-foreground` (tai `text-primary`), jotta valinta erottuu.
   - Hover: säilytä kevyt korostus.

4. **Tekstialue ja lähetysnappi**
   - `Textarea` ja `Button` käyttävät jo teematokeneita, mutta varmistetaan, että ne eivät peri tumman taustan värejä kortista.
   - Tarvittaessa lisätään kortin sisälle `text-card-foreground`, joka pakottaa oletusvärit oikeiksi.

5. **Sulkuristi**
   - Vaihda `text-muted-foreground hover:text-foreground` tai `hover:text-destructive`, jotta se erottuu vaalealla pohjalla.

## Tiedostot
- `src/components/palaute-kortti.tsx` — ainoa muokattava tiedosto.

## Tarkistukset
- `bun run build` menee läpi.
- `bunx tsgo --noEmit` ei paljasta TypeScript-virheitä.
- Selainkuvassa palautekortin teksti on luettavaa, otsikot erottuvat ja valinta-/lähetysnapit ovat selkeitä.

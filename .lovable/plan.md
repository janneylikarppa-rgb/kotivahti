Lisää Blogi-linkki etusivun navigaatioon

## Tavoite

Lisätä etusivun kiinteään navigaatiopalkkiin linkki, joka vie käyttäjät uudelle blogisivulle `/blogi/sahkoinen-talokirja`.

## Tekninen toteutus

- Muokkaa tiedostoa `src/routes/index.tsx`.
- Lisää navigaatiolinkkien (`nav-links`) joukkoon uusi `<Link>`- tai `<a>`-elementti ennen CTA-painiketta.
- Linkin teksti: "Blogi".
- Kohde: `/blogi` (myöhemmin, kun blogi-index luodaan) tai suoraan `/blogi/sahkoinen-talokirja`.
- Käytä TanStack Routerin `<Link>`-komponenttia, jotta reititys pysyy type-safe ja preload toimii.

## Tyyli

- Linkki käyttää samaa tyyliä kuin muut navigaatiolinkit (`color: var(--harmaa)`, hover `var(--vihrea)`).
- Ei erityistä korostusta, jotta CTA-painike säilyy ensisijaisena.

## Hyväksymiskriteerit

- Etusivun navigaatiopalkissa näkyy "Blogi"-linkki.
- Linkki vie `/blogi/sahkoinen-talokirja`-sivulle.
- Build ja typecheck menevät läpi.

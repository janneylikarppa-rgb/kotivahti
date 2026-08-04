# Poista "Tietosi suojattu" -merkki CTA:n alta

## Muutos

Etusivun hero-osiossa CTA-painikkeen alla on vielä yksi luottamusmerkki:

```text
🔒 Tietosi suojattu
```

Poistetaan tämä viimeinen merkki, jolloin CTA-alue jää puhtaammaksi.

## Tekniset yksityiskohdat

- `src/routes/index.tsx`, rivit 266–268: poistetaan `<div className="hero-trust">` ja sen sisältämä `trust-item`.
- CTA-painike ja muu hero-osion sisältö säilytetään ennallaan. `hero-trust` CSS voi jäädä tyyliarkistoon, koska se on geneerinen ja voi tulla myöhemmin tarpeeseen.

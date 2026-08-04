# Poista "Ei luottokorttia" -merkki etusivun herosta

## Muutos

Etusivun hero-osion luottamusrivillä on kolme merkkiä:

```text
✓ Tarkastetut ammattilaiset   🔒 Tietosi suojattu   ✦ Ei luottokorttia
```

Poistetaan kolmas kohta, jolloin riville jää kaksi merkkiä:

```text
✓ Tarkastetut ammattilaiset   🔒 Tietosi suojattu
```

## Tekniset yksityiskohdat

- `src/routes/index.tsx`, rivi 269: poistetaan `<div className="trust-item"><span>✦</span> Ei luottokorttia</div>`.
- Muut hero-elementit (otsikko, kuvausteksti, CTA-painike) säilyvät ennallaan. Tyylit ovat jaettuja `trust-item`-luokkia, joten CSS:ään ei tarvita muutoksia.

## Tavoite

Saadaan rekisteröinti lainmukaiseen kuntoon ennen julkaisua. Kaksi pakollista asiaa:
1. **Suostumusruksit** rekisteröintilomakkeeseen (käyttöehdot + tietosuojaseloste)
2. **Sähköpostin vahvistus** päälle ennen kuin tiliä voi käyttää

Lisäksi tarvitaan minimitoteutus juridisille sivuille, jotta suostumusten linkit toimivat.

---

## Mitä tehdään

### 1. Käyttöehdot- ja tietosuojasivut (`/kayttoehdot`, `/tietosuoja`)

Luodaan kaksi uutta julkista reittiä:
- `src/routes/kayttoehdot.tsx`
- `src/routes/tietosuoja.tsx`

Sisältönä aiemmin keskustellut tekstit **placeholdereilla merkittyinä** (`[Yrityksen nimi]`, `[Y-tunnus]`, `[Osoite]`, `[sähköposti]`) – täytät ne kun yritystiedot ovat valmiit. Sivuille tulee:
- Sama header/footer-tyyli kuin muulla sivustolla
- Selkeä otsikkohierarkia (h1/h2)
- "Päivitetty" -päivämäärä
- Linkit ristiin (käyttöehdoista tietosuojaan ja päinvastoin)
- Linkki takaisin etusivulle / kirjautumiseen

### 2. Suostumusruksit rekisteröintilomakkeeseen

Päivitetään `src/routes/rekisteroidy.tsx`:
- Lisätään **yksi pakollinen checkbox**: "Hyväksyn [käyttöehdot](/kayttoehdot) ja [tietosuojaselosteen](/tietosuoja)"
  - Yhdistetty yhteen ruksiin koska molemmat pakollisia palvelun käyttöön → ei vapaaehtoinen valinta
- Lomakkeen lähetys estetään jos checkbox ei valittu (`required` + client-side validaatio)
- Tallennetaan **suostumuksen aikaleima** Supabasen `auth.users.user_metadata`-kenttään (`tos_accepted_at`, `privacy_accepted_at`) signUp-kutsun `options.data`-kohdassa → todistettavissa myöhemmin
- Google-kirjautumiseen lisätään lyhyt teksti napin yläpuolelle: "Jatkamalla hyväksyt käyttöehdot ja tietosuojaselosteen" (OAuth-flowssa ei voi vaatia checkboxia ennen redirectia, joten käytetään yleistä alaa kuten Spotify/Notion tekevät)

### 3. Sähköpostin vahvistus päälle

- Varmistetaan että Supabase auto-confirm on **OFF** (käyttäjä joutuu klikkaamaan vahvistuslinkkiä ennen sisäänkirjautumista)
- `src/routes/rekisteroidy.tsx`: lähetyksen jälkeen näytetään selkeämpi viesti ("Lähetimme vahvistuslinkin osoitteeseen X – klikkaa se ennen kirjautumista") ja ohjataan kiitos-näkymään `/login` sijaan
- `src/routes/login.tsx`: jos kirjautuminen epäonnistuu syyllä "Email not confirmed", näytetään selkokielinen virhe + "Lähetä vahvistuslinkki uudelleen" -nappi (`supabase.auth.resend`)

### 4. Linkit footeriin / kirjautumissivulle

- Lisätään linkit käyttöehtoihin ja tietosuojaan myös:
  - Kirjautumissivun alle
  - Liidi-dialogin pieneksi disclaimer-tekstiksi ("Lähettämällä pyynnön hyväksyt että tietosi välitetään ammattilaiselle – ks. [tietosuojaseloste](/tietosuoja)")

---

## Mitä EI tehdä nyt (jää myöhemmäksi liiketoimintapäätöksinä)

- Resend API-avain / sähköpostiautomaatio
- Oma sähköpostidomain (notify.kotivahti.fi)
- Yritystietojen täyttö placeholdereihin
- Maksullisuus, hinnoittelu, tilausehdot
- Lakimiehen tarkistus
- Vastuukatto-euromäärä käyttöehtoihin
- Custom domain + julkaisu

---

## Tekniset yksityiskohdat

- Käytetään olemassa olevia shadcn-komponentteja: `Checkbox`, `Button`, `Label`
- Reitit ovat julkisia (ei `_authenticated`-alla)
- Ei tarvita Supabase-migraatiota – suostumusaikaleimat menevät `user_metadata`an
- Ei tarvita uusia secretsiä
- `supabase.auth.signUp`-kutsuun säilyy `emailRedirectTo: window.location.origin` jotta vahvistuslinkki ohjaa takaisin sovellukseen

---

## Lopputulos hyväksynnän jälkeen

Sovellus täyttää GDPR:n suostumusvaatimukset ja tilien luonti vaatii sähköpostin vahvistuksen. Voit lähettää linkin testikäyttäjille, ja kun yritystiedot ja sähköpostidomain ovat valmiit, viimeistellään loput julkaisua varten.

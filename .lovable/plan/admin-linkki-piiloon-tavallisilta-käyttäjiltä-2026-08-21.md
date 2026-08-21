# Admin-linkki piiloon tavallisilta käyttäjiltä

## Mitä tehdään

Sivupalkin **Admin**-linkki näytetään vain käyttäjille, joilla on admin-rooli. Muille se ei näy lainkaan.

Sovelluksessa on jo valmis, turvallinen roolijärjestelmä (erillinen rooli­taulu + palvelinpuolen tarkistus), joten pyynnössä ehdotettua `profiles.role`-saraketta ei kannata lisätä — se olisi tietoturvariski (käyttäjä voisi muokata omaa profiiliaan). Käytetään olemassa olevaa tarkistusta.

## Muutos

`src/components/app-sidebar.tsx`:
- Haetaan admin-tila olemassa olevalla `onkoAdmin`-palvelinfunktiolla (`src/lib/liidit.functions.ts`) React Queryllä, samaan tapaan kuin nykyinen liidilaskuri.
- Suodatetaan Admin-rivi pois valikosta, kun käyttäjä ei ole admin. Muu navigaatio pysyy ennallaan.

## Suojaus suoralla URL-osoitteella

`/admin`-sivu tarkistaa jo palvelinpuolella admin-roolin ja näyttää "Ei käyttöoikeuksia" muille; kaikki admin-datan haut on suojattu palvelimella. Tähän ei tarvita muutoksia, eikä tietokantamigraatiota tarvita.

## Tekniset yksityiskohdat

- `useServerFn(onkoAdmin)` + `useQuery({ queryKey: ["onko-admin"] })`, sama avain kuin admin-sivulla → yksi haku, jaettu välimuisti.
- `items.filter((i) => i.url !== "/admin" || isAdmin)` ennen renderöintiä; badge-logiikka säilyy.

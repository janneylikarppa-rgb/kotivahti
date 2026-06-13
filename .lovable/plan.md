# Korjaus: kirjautuminen ei toimi puhelimella

## Oire
Puhelimella "Jatka Googlella" käy Google-vahvistuksen ja palaa sovellukseen, mutta käyttäjä päätyy aina etusivulle eikä pääse sisään. Työpöydällä toimii.

## Juurisyy
`src/routes/login.tsx` ja `src/routes/rekisteroidy.tsx` käyttävät:
```ts
lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })
```
- Työpöydällä broker palauttaa tokenit suoraan saman sivun JS-koodille (lovable-moduuli on jo ladattu /login-sivulla) → sessio asetetaan, `navigate({ to: "/dashboard" })` ajetaan.
- Mobiilissa kulku menee full-page redirectillä takaisin `redirect_uri`:iin eli `/`. Etusivu ei importoi `@/integrations/lovable`-moduulia, joten broker ei käsittele URL:n tokeneita → sessio jää syntymättä → `beforeLoad` ei ohjaa dashboardille, käyttäjä näkee landingin.

## Korjaus
Ohjataan callback aina sellaiselle reitille, joka lataa lovable-moduulin ja jonka `beforeLoad` osaa siirtää sisäänkirjautuneen käyttäjän eteenpäin.

### Muutos 1 — `src/routes/login.tsx` `handleGoogle`
```ts
redirect_uri: `${window.location.origin}/login`
```
Login-sivun `beforeLoad` tarkistaa session ja heittää `redirect({ to: search.redirect || "/dashboard" })`, joten sisäänkirjautunut käyttäjä siirtyy automaattisesti dashboardille (tai alkuperäiselle suojatulle reitille).

### Muutos 2 — `src/routes/rekisteroidy.tsx` Google-painike
Sama korjaus: `redirect_uri: ${window.location.origin}/login`.

## Tarkistus
1. Avaa preview puhelimella, paina "Jatka Googlella" → palaa `/login`-osoitteeseen, joka ohjaa dashboardille.
2. Työpöydällä toiminta ennallaan (pop-up flow toimii edelleen, koska se ei käytä redirect_uri:a samalla tavalla).
3. Tarkista että `auth_logs` näyttää onnistuneen kirjautumisen ja että dashboard latautuu mobiilissa.

## Pieni huomio
Konsolissa näkyy myös hydration mismatch `__gcrremoteframetoken` — tulee Google-selainlaajennuksesta (Chrome Remote Frame), ei sovelluskoodista. Ei vaadi korjausta.

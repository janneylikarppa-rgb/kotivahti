# Supabase Auth -sähköpostipohjien päivitys

## Tavoite
Päivittää rekisteröitymisen vahvistussähköpostin (Confirm signup) sisältö ja ulkoasu Kotiluotsin brändin mukaiseksi.

## Huomio käyttöoikeuksista
Lovable Cloud -projekteissa ei ole pääsyä Supabase Dashboardiin, joten sähköpostipohjia ei voi muokata suoraan siellä. Sen sijaan käytetään Lovablen hallinnoimaa sähköposti-infrastruktuuria, joka luo auth-sähköpostipohjat ja webhook-reitin sovellukseen.

## Edeltävä vaatimus: lähettäjädomain
Mukautettujen auth-sähköpostien lähettämiseen tarvitaan oma domain (esim. kotiluotsi.fi). Projektilla ei tällä hetkellä ole sähköpostidomainia konfiguroituna.

## Vaiheet

### 1. Sähköpostidomainin konfigurointi
- Avaa Lovablen sähköpostidomainin asetusdialogi.
- Käytä domainina `kotiluotsi.fi` (tai muuta omistamaasi domainia).
- DNS-vahvistusta ei tarvita pohjien luomiseen, mutta se vaaditaan ennen kuin sähköpostit lähtevät oikeasti liikkeelle.

### 2. Auth-sähköpostipohjien luonti
- Kutsu `email_domain--scaffold_auth_email_templates` domainin asennuksen jälkeen.
- Tämä luo kaikki kuusi auth-pohjaa (signup, magic-link, recovery, invite, email-change, reauthentication) ja tarvittavan reitin sovellukseen.

### 3. Confirm signup -pohjan muokkaus
- Muokkaa luotua signup-vahvistuspohjaa seuraavasti:
  - **Subject:** `Vahvista rekisteröitymisesi – Kotiluotsi`
  - **Body:**
    ```html
    <h2>Tervetuloa Kotiluotsiin!</h2>
    <p>Vahvista sähköpostiosoitteesi painamalla alla olevaa painiketta.</p>
    <a href="{{ .ConfirmationURL }}">Vahvista rekisteröityminen</a>
    <p>Kotiluotsi – kotiluotsi.fi</p>
    ```
- Varmista, että muut auth-pohjat säilyvät toimivina (magic link, password reset, jne.).

### 4. Brändin mukainen ulkoasu
- Sovella Kotiluotsin värimaailmaa (tumma metsänvihreä #0D1F14, kulta #C9A84C, kerma #f5f0e8) ja typografiaa (Playfair Display / DM Sans / Outfit) kaikkiin auth-pohjiin.
- Pidä sähköpostin päätausta valkoisena (#ffffff) luettavuuden vuoksi.

### 5. Reitin ja funktion julkaisu
- Julkaise `auth-email-hook`-reitti/funktio, jotta Supabase Auth -tapahtumat ohjautuvat mukautettuihin pohjiin.
- Sovelluksen uudelleenjulkaisu aktivoi reitin tuotantoon.

### 6. Tarkistus
- Varmista, että build onnistuu eikä tule TypeScript-virheitä.
- Ohjeista käyttäjä seuraamaan `Cloud → Emails` -näkymää DNS-vahvistuksen etenemistä varten.

## Toimitus
Auth-sähköpostipohjat ovat käytössä heti, kun DNS-vahvistus on valmis. Ennen sitä lähtevät oletus-Lovable-pohjat.

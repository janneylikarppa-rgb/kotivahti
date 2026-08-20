# Supabase Auth -sähköpostipohjien päivitys

## Tavoite
Kaikki auth-sähköpostit suomeksi ja Kotiluotsin brändin mukaisina. Lähettäjänimi "Kotiluotsi", ei teknisiä nimiä (esim. "Home-Maintenance-Hub").

## Huomio käyttöoikeuksista
Lovable Cloud -projekteissa ei ole pääsyä Supabase Dashboardiin, joten pohjia ei voi muokata siellä. Sen sijaan käytetään Lovablen hallinnoimaa sähköposti-infrastruktuuria, joka tuo pohjat suoraan projektin koodiin muokattavaksi.

## Edeltävä vaatimus: lähettäjädomain
Mukautettujen auth-sähköpostien lähettämiseen tarvitaan oma domain. Projektilla ei ole vielä sähköpostidomainia konfiguroituna. Käytetään omistamaasi `kotiluotsi.fi`-domainia.

## Vaiheet

### 1. Sähköpostidomainin konfigurointi
- Avaa sähköpostidomainin asetusdialogi ja vie `kotiluotsi.fi` läpi.
- DNS-vahvistus ei ole edellytys pohjien luomiselle, mutta vaaditaan ennen kuin viestit lähtevät oikeasti.

### 2. Sähköposti-infrastruktuurin ja pohjien luonti
- Luodaan jonot, lokitus ja lähetysreitit.
- Luodaan kaikki kuusi auth-pohjaa: rekisteröinnin vahvistus, magic link, salasanan palautus, kutsu, sähköpostin vaihto ja uudelleentunnistautuminen.

### 3. Lähettäjätiedot
- Lähettäjän nimi kaikissa viesteissä: **Kotiluotsi**
- Lähettäjän osoite: `noreply@kotiluotsi.fi` (tai domainin vahvistettu lähetysalidomain)
- Poistetaan kaikki tekniset nimet (esim. "Home-Maintenance-Hub", projektitunnukset) otsikoista, rungoista ja lähettäjätiedoista.

### 4. Pohjien suomenkieliset sisällöt

**Rekisteröitymisen vahvistus (signup)**
- Otsikko: `Vahvista rekisteröitymisesi – Kotiluotsi`
- Sisältö: "Tervetuloa Kotiluotsiin!" + "Vahvista sähköpostiosoitteesi painamalla alla olevaa painiketta." + painike "Vahvista rekisteröityminen" + alatunniste "Kotiluotsi – kotiluotsi.fi"

**Salasanan palautus (recovery)**
- Otsikko: `Nollaa salasanasi – Kotiluotsi`
- Sisältö: "Olet pyytänyt salasanan nollausta. Paina alla olevaa painiketta asettaaksesi uuden salasanan. Jos et pyytänyt tätä, jätä viesti huomiotta."
- Painike: "Aseta uusi salasana"

**Magic link**
- Otsikko: `Kirjautumislinkki – Kotiluotsi`
- Sisältö: "Paina alla olevaa painiketta kirjautuaksesi Kotiluotsiin. Linkki on voimassa rajoitetun ajan."
- Painike: "Kirjaudu sisään"

**Sähköpostin vaihto (email change)**
- Otsikko: `Vahvista uusi sähköposti – Kotiluotsi`
- Sisältö: "Olet pyytänyt sähköpostiosoitteesi vaihtoa. Vahvista uusi osoite painamalla alla olevaa painiketta."
- Painike: "Vahvista uusi sähköposti"

**Kutsu (invite)**
- Otsikko: `Kutsu Kotiluotsiin`
- Sisältö: "Sinut on kutsuttu Kotiluotsiin. Luo tili painamalla alla olevaa painiketta."

**Uudelleentunnistautuminen (reauthentication)**
- Otsikko: `Vahvistuskoodi – Kotiluotsi`
- Sisältö: "Vahvistuskoodisi on: [koodi]. Älä jaa koodia kenellekään."

Kaikkiin pohjiin yhtenäinen alatunniste: "Kotiluotsi – kotiluotsi.fi".

### 5. Brändin mukainen ulkoasu
- Värit: tumma metsänvihreä `#0D1F14`, kulta `#C9A84C`, kerma `#f5f0e8`.
- Otsikkotypografia Playfair Display -tyylinen serif, leipäteksti sans-serif.
- Sähköpostin päätausta pysyy valkoisena (`#ffffff`) luettavuuden ja sähköpostiohjelmien yhteensopivuuden vuoksi.
- Painikkeet: tumma vihreä tausta, kultainen teksti, pyöristetyt kulmat.

### 6. Julkaisu ja tarkistus
- Auth-sähköpostireitti julkaistaan sovelluksen mukana.
- Tarkistetaan että build onnistuu eikä TypeScript-virheitä tule.
- Käydään läpi kaikki pohjat: ei englanninkielisiä jäänteitä eikä teknisiä nimiä.

## Toimitus
Mukautetut suomenkieliset auth-sähköpostit aktivoituvat heti kun DNS-vahvistus on valmis. Sitä ennen lähtevät oletuspohjat. Etenemistä voi seurata Cloud → Emails -näkymästä.

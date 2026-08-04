# Feature showcase etusivulle

Lisätään etusivulle uusi laaja ominaisuuksien esittelyosio, johon navin "Ominaisuudet"-painike vie.

## Navigointi

Pidetään nykyinen ankkuri-skrollaus (ei modaalia) — se sopii pitkään yksisivuiseen layoutiin parhaiten. `#ominaisuudet` osoittaa jatkossa uuteen showcase-osioon, joka sijoitetaan heti nykyisen korttiruudukon jälkeen. Lisätään pehmeä skrollaus.

## Showcase-rakenne

Uusi `<section className="showcase">` seitsemällä alaosiolla, sama järjestys kuin nykyiset kortit:

1. Talokirja — "Kaikki talosi tiedot yhdessä paikassa"
2. Vuosikello — "Oikea huolto oikeaan aikaan – automaattisesti"
3. Palveluiden kilpailutus — "Löydä oikea tekijä – ilman etsimistä"
4. PTS-suunnitelma — "Tiedät jo tänään mitä talossa tapahtuu 10 vuoden päästä"
5. Kulujenseuranta — "Näe mihin energia kuluu ja ennakoi tulevat kulut"
6. Huoltohistoria — "Dokumentoitu historia on talon arvokkain asiakirja"
7. Myyntiraportti — "Myyntitilanteessa kaikki on jo valmiina"

Jokaisessa osiossa käyttäjän antamat tekstit sellaisenaan, ikoni + otsikko, kappaleet, CTA-nappi "Aloita ilmaiseksi →" (vie /rekisteroidy) ja sen alla pieni teksti "Käyttö on maksutonta. Käyttöönotto vie muutaman minuutin."

Asettelu: desktopilla kaksi palstaa, joka toisessa osiossa mockup vasemmalla (parilliset) ja teksti oikealla. Mobiililla aina teksti ensin, mockup alla. Osioiden välissä ohut kultainen erotinviiva, ei väliotsikoita. Osiot käyttävät olemassa olevaa `animate-on-scroll`-efektiä.

## Puhelinmockupit

Yksi jaettu mockup-komponentti: tumma runko (tummanvihreä), pyöristetyt kulmat, kevyt varjo, max 320px desktopilla, 100% mobiililla. Näytön sisältö rakennetaan kevyenä HTML/CSS-jäljitelmänä kustakin sovellusnäkymästä (talon tiedot, vuosikello kevät, liidilomake IV-kategorialla, PTS-lista, kulut/sähkötaulukko, huoltohistoria, myyntiraportti) — projektissa ei ole valmiita screenshot-tiedostoja, ja koodattu mockup pysyy tarkkana ja nopeana. Halutessasi vaihdamme myöhemmin oikeisiin kuvakaappauksiin.

## Loppu-CTA

Showcase-osion jälkeen iso loppukutsu: serif-otsikko "Talosi ansaitsee enemmän kuin muistilista.", kuvausteksti, iso kultainen nappi "Luo ilmainen tili →" ja pieni teksti "Ei luottokorttia. Ei määräaikaa. Vain selkeämpi kuva talostasi."

## Tekniset yksityiskohdat

- Kaikki muutokset vain `src/routes/index.tsx`: uusi `SHOWCASE`-data-array, `PhoneMock`-apukomponentti ja uudet tyylisäännöt olemassa olevaan `STYLES`-merkkijonoon (samat CSS-muuttujat: `--vihrea`, `--kulta`, `--kerma`).
- Nykyinen korttiruudukko, kilpailutus-, proof- ja cta-osiot säilyvät ennallaan.
- Ei muutoksia backendiin, reitteihin tai muihin sivuihin.

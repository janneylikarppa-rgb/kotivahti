# Capacitor-valmistelu mobiilisovellusta varten

Tehdään sovellukseen kaikki se, mikä on mahdollista tehdä täällä: asetukset,
komennot, kuvakkeet ja mobiiliapurit. Varsinaiset iOS- ja Android-projektit
luodaan myöhemmin omalla koneella Xcodella ja Android Studiolla.

## 1. Capacitor-paketit

Asennetaan: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`,
`@capacitor/android`, `@capacitor/app`, `@capacitor/haptics`,
`@capacitor/keyboard`, `@capacitor/status-bar` ja kehityspakettina
`@capacitor/assets`.

## 2. capacitor.config.ts projektin juureen

- appId: `fi.kotiluotsi.app`
- appName: `Kotiluotsi`
- webDir: `dist`
- StatusBar tumma, taustaväri `#0D1F14`
- Keyboard: `resize: body`, tumma tyyli

Lisäksi kommentoitu `server.url`-lohko valmiina: Kotiluotsi tarvitsee
palvelimen (kirjautuminen, tietokanta), joten sovellus ei voi toimia pelkällä
`dist`-kansiolla. Kun kauppajulkaisu on ajankohtainen, `server.url` osoitetaan
osoitteeseen `https://kotiluotsi.fi`. Tämä valinta tehdään myöhemmin.

## 3. Komennot package.json:iin

`cap:build`, `cap:sync`, `cap:ios`, `cap:android` pyynnön mukaisesti.

## 4. Kuvake ja aloitusruutu

Luodaan `assets/icon.png` (1024x1024) ja `assets/splash.png` (2732x2732):
tumma metsänvihreä tausta `#0D1F14`, kultainen `#C9A84C` K-kirjain ja
Kotiluotsin ilme. Kuvakkeiden generointi (`npx capacitor-assets generate`)
ajetaan vasta kun natiiviprojektit on luotu.

## 5. Mobiiliapurit

Uusi `src/hooks/useMobile.ts`:

- `isNative` ja `platform` Capacitorin kautta
- turvallinen web-fallback, jotta nykyinen selainversio ja palvelinrenderöinti
  toimivat entiseen tapaan

Lisäksi iOS:n lovilaitteita varten turva-alueen täyte (`safe-area-inset`)
sovelluksen ylä- ja alareunaan vain kun sovellus ajetaan natiivina. Selainversion
ulkoasu ei muutu.

## 6. Ohje jatkoa varten

`README.md`:ään lyhyt osio: miten projekti siirretään omalle koneelle, miten
`npx cap add ios` ja `npx cap add android` ajetaan siellä, mitkä tiedot
Info.plistiin ja AndroidManifestiin lisätään (näyttönimi, tunniste, kamera- ja
kuvakirjastoluvat, internet-oikeus) sekä miten kuvakkeet generoidaan.

## Tekniset huomiot

- Projekti on TanStack Start -SSR-sovellus (Cloudflare Worker). `vite build` ei
  tuota staattista `dist`-kansiota, jonka Capacitor voisi paketoida sellaisenaan.
  Siksi `webDir: dist` jää paikoilleen konfiguraatiossa, mutta toimiva
  julkaisumalli on natiivikuori, joka lataa julkaistun osoitteen.
- `npx cap add ios/android`, `npx cap sync` ja kauppakäännökset vaativat
  Xcoden/Android Studion; niitä ei ajeta tässä ympäristössä.
- Tarkistukset ennen valmiiksi ilmoittamista: `bun run build` onnistuu,
  ei tyyppivirheitä, ei konsolivirheitä, PWA ja nykyinen selainversio
  toimivat ennallaan.

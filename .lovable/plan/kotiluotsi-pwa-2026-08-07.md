# Kotivahti PWA

Tehdään sovelluksesta asennettava ja perustoiminnoiltaan offline-kelpoinen.

## 1. Sovelluskuvake

Projektissa ei ole vielä logotiedostoa (ei `public/`-kansiota lainkaan). Luodaan
Kotivahti-brändin mukainen neliömäinen tunnus (tumma metsänvihreä tausta
`#0D1F14`, kultainen talo/kilpi-symboli) ja tallennetaan:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/apple-touch-icon.png` (180x180)
- `public/favicon.png` + favicon-viittaus juurireitissä

## 2. Manifest

`public/manifest.webmanifest`:

```text
name: Kotivahti
short_name: Kotivahti
display: standalone
start_url: /
background_color: #0D1F14
theme_color: #0D1F14
icons: 192 + 512 (any + maskable)
```

## 3. Head-tagit (`src/routes/__root.tsx`)

- `link rel="manifest"`
- `meta name="theme-color" content="#0D1F14"`
- `meta name="apple-mobile-web-app-capable" content="yes"`
- `meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"`
- `meta name="apple-mobile-web-app-title" content="Kotivahti"`
- `link rel="apple-touch-icon"`

## 4. Offline-tuki (service worker)

Käytetään `vite-plugin-pwa`:n generoitua service workeria (`generateSW`), ei
käsin kirjoitettua workeria:

- HTML-navigoinnit: `NetworkFirst` — sivut toimivat offline viimeisimmästä
  välimuistista, mutta verkossa saadaan aina tuore versio.
- Käännetyt JS/CSS/fontti/kuva-assetit: `CacheFirst`.
- Backend-kutsut jätetään välimuistin ulkopuolelle, jotta dataa ei näytetä
  vanhentuneena; offline-tilassa näkyy sovelluskehys ja välimuistissa oleva sivu.
- `/~oauth` suljetaan pois navigointifallbackista.
- Rekisteröinti tapahtuu vain julkaistussa sovelluksessa: oma wrapper-moduuli,
  joka kieltäytyy rekisteröimästä dev-tilassa, iframe-esikatselussa ja Lovable
  preview -domaineilla, ja purkaa vanhan rekisteröinnin sekä tukee `?sw=off`
  -hätäkytkintä.

Huom: offline-toiminta näkyy vasta julkaistussa osoitteessa, ei editorin
esikatselussa.

## 5. "Lisää kotinäytölle" -banner

Uusi komponentti `src/components/asenna-banner.tsx`, renderöidään juuressa:

- Kuuntelee `beforeinstallprompt`-tapahtumaa (Chrome/Edge/Android) ja näyttää
  alalaidan bannerin: "Lisää Kotivahti kotinäytölle" + Asenna / Ei nyt.
- iOS/Safari: ei `beforeinstallprompt`-tukea, joten näytetään ohjebanner
  ("Jaa → Lisää Koti-valikkoon") vain, jos selain on iOS-Safari eikä sovellus jo
  ole standalone-tilassa.
- Näytetään ensimmäisellä käynnillä; sulkeminen tai asennus tallennetaan
  `localStorage`-avaimeen, jolloin banneria ei näytetä uudelleen.
- Tyyli sovelluksen tokeneilla (tumma kortti, kultainen painike), ei kovakoodattuja värejä.

## Tekniset yksityiskohdat

- Lisätään `vite-plugin-pwa` riippuvuudeksi ja konfiguroidaan
  `vite.config.ts`:ssä (`injectRegister: null`, `devOptions.enabled: false`,
  `registerType: "autoUpdate"`, `filename: sw.js`).
- Rekisteröintiwrapper `src/lib/pwa.ts`, kutsutaan kertaalleen juurikomponentin
  `useEffect`:ssä.

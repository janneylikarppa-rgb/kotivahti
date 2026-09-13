# Kotiluotsi App Storeen ja Google Playyn – valmistelu ja julkaisuohje

## Tärkeä ymmärtää aluksi

Itse kauppajulkaisua (App Store / Google Play) ei voi tehdä suoraan Lovable-ympäristöstä, koska:

- **App Store**: natiivipaketin kääntäminen vaatii Mac-tietokoneen ja Applen kehittäjätilin (99 $/vuosi).
- **Google Play**: vaatii Google Play Console -tilin (25 $ kertamaksu) ja allekirjoitetun Android-paketin.

Mitä minä voin tehdä nyt: valmistella koko koodipuolen Capacitorilla niin, että sovellus on valmis käännettäväksi ja ladattavaksi kauppoihin — ja toimittaa tarkan askel askeleelta -ohjeen loppujulkaisuun.

## Mitä rakennetaan

### 1. Capacitor-asennus ja konfiguraatio
- Asennetaan paketit: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android` sekä pluginit `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar`.
- Luodaan `capacitor.config.ts`:
  - `appId: 'fi.kotiluotsi.app'`, `appName: 'Kotiluotsi'`
  - StatusBar ja Keyboard -asetukset (tumma tyyli, tausta `#0D1F14`)

### 2. Ratkaistaan webDir-kysymys
TanStack Start -sovellus ei tuota pelkkää staattista `dist`-kansiota, joten:
- Capacitor ohjataan lataamaan sovellus julkaistusta osoitteesta (`server.url: 'https://kotiluotsi.fi'`) — näin natiivisovellus toimii kuorena, joka avaa aina tuotantoversion. Tämä on suositeltu tapa SSR-sovelluksille ja päivitykset tulevat automaattisesti ilman kaupan hyväksyntää.

### 3. Natiiviprojektien alustusohje
- Lisätään `package.json`-skriptit: `cap:sync`, `cap:ios`, `cap:android`.
- Huom: `npx cap add ios/android` ajetaan käyttäjän omalla koneella (vaatii Xcode/Android Studio -asennukset).

### 4. Julkaisuopas `docs/KAUPPAJULKAISU.md`
Suomenkielinen ohje, joka sisältää:
1. Tilien perustaminen (Apple Developer, Google Play Console)
2. `npm run build` → `npx cap sync` → Xcode/Android Studio -vaiheet
3. Kauppasivujen tekstit: sovelluksen nimi, kuvaus (fi), avainsanat, kategoria
4. Kuvakaappauslista kauppojen vaatimuksiin
5. Yksityisyyden seloste -linkki (https://kotiluotsi.fi/tietosuoja) — molemmat kaupat vaativat
6. Hyväksyntäprosessin aikataulut ja yleisimmät hylkäyssyyt

### 5. Kauppasivujen valmiit tekstit
- Sovelluksen kuvaus App Storeen ja Google Playyn suomeksi valmiina ohjetiedostoon.

## Varmistus
- Build ja TypeScript-tarkistus menestyvät
- Web-sovelluksen toiminta ei muutu millään tavalla (Capacitor on pelkkä lisäys)

## Mitä eteen jää käyttäjälle (ei voi automatisoida)
- Kehittäjätilien perustaminen ja maksut
- iOS-buildin kääntäminen Macilla + TestFlight/App Store -lähetys
- Android-paketin allekirjoitus ja Play Console -lähetys

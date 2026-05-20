## Kotivahti – Vaihe 1 (MVP + vuosikello & kulut)

Suomenkielinen huoltokirja-sovellus omakotitaloasujille. **Ensimmäinen vaihe**: MVP-ydin + vuosikello + kulut. PTS-laskenta, dokumenttiarkisto, myyntiraportti, liidit ja useat kiinteistöt tehdään seuraavissa kierroksissa.

### Visuaalinen suunta: "Vaihtoehto A – Metsäinen ammattilainen"

Tumma, arvokas, kultainen. Tämä on koko sovelluksen pohja (ei vain marketing).

**Paletti** (oklch-muotoon `src/styles.css`):
- Tausta: syvä metsänvihreä `#0D1F14`
- Pinta: `#142A1A` / `#1C3522`
- Kulta (primary): `#C9A84C`, vaalea `#E8C876`
- Kerma (teksti): `#F5EDD8` / `#EDE8DC`
- Sammal (muted): `#7A9E82`
- Reunaviivat: kullan läpinäkyvä `rgba(201,168,76,0.15)`

**Typografia**:
- Otsikot: Playfair Display (serif, kursiivi aksentteina kullalla)
- UI/leipäteksti: Outfit (300–600)
- Pienet eyebrow-tekstit: uppercase, 0.22em letter-spacing, kulta

**Komponenttityyli**:
- Kortit: tumma surface, kullan reunahohto-gradientti (`linear-gradient(135deg, rgba(201,168,76,0.2), transparent 50%)`)
- Painikkeet: kulta tausta + tumma teksti, uppercase, hover → vaaleampi kulta
- Statukset: kulta korostuksiin, sammaleenvihreä tukikomponentteihin, lämmin punainen kiireellisille
- Reunaviivat aina läpinäkyviä kullan sävyjä

### Mitä rakennetaan tässä vaiheessa

**Kirjautuminen ja käyttäjä**
- Lovable Cloud + sähköposti/salasana + Google
- Profiilin auto-luonti triggerillä, oletuskiinteistö rekisteröitymisen yhteydessä
- `_authenticated`-layout suojaa kaikki sisäiset reitit

**Talon tiedot (6-osainen lomake)**
1. Perustiedot · 2. Rakennuksen tiedot · 3. Katto ja räystäät
4. Tekniset järjestelmät (dynaaminen lämmitysmuoto-pohjaisesti, 9 tyyppiä)
5. Ulkoalueet · 6. Dokumentit (placeholder)

Edistymispalkki näyttää 0–6 osiota täytetty.

**Huoltohistoria**
- Lomake: tyyppi, kohde, kuvaus, pvm, tekijä, hinta, takuu, pts-siirto
- Vuosittain ryhmitelty lista
- Hinta → automaattisesti kuluihin kategoriaan "huolto"

**Vuosikello**
- Kausivälilehdet kevät/kesä/syksy/talvi + "ympäri vuoden"
- Staattiset perushuoltolistat + dynaamiset talon tietojen perusteella
- Kuittausmodaali: "tein itse / ammattilainen teki / jätetään", hinta + tekijä
- Kuitatut nollautuvat vuoden vaihteessa

**Kulujenseuranta**
- Välilehdet: Yhteenveto, Kaikki kulut, Asetukset
- Yleinen kulu: kategoria, summa, pvm
- Sähkö: kerran asetetaan c/kWh → syötetään kWh → hinta lasketaan
- Vesi: kerran asetetaan €/m³ → mittarilukema → kulutus = ero edelliseen
- Yhteenveto: 5 korttia + recharts-pylväskaavio kullan sävyissä

**Dashboard (etusivu)**
- Tervehdys (Playfair Display, kursiivilla kultainen aksentti) + edistymispalkki
- 3 ajankohtaista huoltoa (värikoodi: punainen/kulta/sammal)
- Kulujen miniyhteenveto + pylväskaavio
- "PTS tulossa" -placeholderkortti

### Tietokanta (Lovable Cloud)

- `profiles` (id → auth.users, nimi, email)
- `kiinteistot` (id, user_id, osoite, kaupunki, tyyppi, rakennusvuosi, aktiivinen)
- `talon_tiedot` (id, kiinteisto_id, lammitys, lammitys_vuosi, katto_*, putket_*, viemari_*, data jsonb)
- `huolto_historia` (id, kiinteisto_id, tyyppi, kategoria, kuvaus, pvm, tekija, tekija_nimi, kustannus, takuu_vuotta, pts_siirto)
- `kulut` (id, kiinteisto_id, nimi, summa, pvm, kategoria, kwh, mittarilukema, kuvaus)
- `kulu_asetukset` (id, kiinteisto_id, sahko_energia_snt, sahko_siirto_snt, vesi_puhdas_eur_m3, vesi_jatevesi_eur_m3)
- `vk_kuitatut` (id, kiinteisto_id, kausi_key, huolto_nimi, vuosi, tekija, hinta)

**RLS**: kaikki suodatetaan `kiinteistot.user_id = auth.uid()` -ehdolla.

### Sivurakenne (TanStack Start)

```text
src/routes/
  __root.tsx
  index.tsx              → / (ohjaa /login tai /dashboard)
  login.tsx
  rekisteroidy.tsx
  _authenticated.tsx     → reittisuoja
  _authenticated/
    dashboard.tsx
    talon-tiedot.tsx
    huoltohistoria.tsx
    vuosikello.tsx
    kulut.tsx
```

### Tekniikka

- Lovable Cloud auki ensin → Supabase-clientit generoituvat
- Server functions (`*.functions.ts` `src/lib/`-kansiossa) + `requireSupabaseAuth`
- `onAuthStateChange` rootissa → invalidoi router + query cache
- Lomakkeet: react-hook-form + zod
- Kaaviot: recharts (kullan sävyt)
- shadcn-komponentit teemoitettuna design-tokeneilla

### Mitä EI tässä vaiheessa

PTS-laskenta, dokumenttiarkisto (Storage), myyntiraportti-PDF, liidilomake + sähköpostiautomaatio, useat kiinteistöt -kytkin UI:ssa, hallintapaneeli.

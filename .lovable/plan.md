
# Suunnitelma: PTS-viestit, nuohousmuistutus ja SEO-sivut (päivitetty)

## 1. Nuohousmuistutukset (kevät 1.3. + syksy 1.8.)

**Kohderyhmä:** käyttäjät joiden talon tiedoissa `kiuas_tyyppi = "puu"` tai `hormityyppi ≠ "Ei hormia"`. Logiikka on **kausipohjainen, ei PTS-käyttöikäkaavaan perustuva** — nuohous on aina vuosittainen.

**Sävy:** Faktat edellä, ei pelottelua, ei kiireellisyyttä myyntikeinona. Noudattaa kirjaston viestiperiaatetta.

### Reitti
- `src/routes/api/public/hooks/nuohous-muistutus.ts`
- Tukee query-parametria `?kausi=kevat|syksy` (cron määrittää)
- Hakee `talon_tiedot` + omistajan email (`profiles`)
- Resend-lähetys (sama tyyli kuin `kausikirje.server.ts`)
- Linkki PTS-näkymään (`/pts`)

### Kevätmuistutus — 1.3. klo 08

**Cron:** `0 8 1 3 *` body `{"kausi":"kevat"}`
**Lähetetään:** kaikille kohderyhmän käyttäjille riippumatta nuohousmerkinnöistä.

**Otsikko:** Nuohous kannattaa tilata nyt — ei syksyllä

**Runko:**
> Lämmityskausi lähenee loppuaan, ja se on paras hetki tilata vuoden nuohous.
>
> Nuohous on lakisääteinen velvollisuus vähintään kerran vuodessa. Suurin osa tilaa sen perinteisesti syksyllä, jolloin nuohoojien jonot venyvät ja oman aikataulun mukaisen ajan saaminen vaikeutuu. Keväällä tilanne on toinen: tulisijaa on käytetty aktiivisesti koko talven, joten noki ei ole ehtinyt pinttyä tai kerätä kosteutta — se irtoaa tehokkaammin ja hormin veto on parempi, mikä tekee työstä sekä nopeampaa että perusteellisempaa.
>
> **Mitä voit tarkastaa itse:** onko hormin ympärillä tai nuohousluukussa näkyviä halkeamia, ja vetääkö tulisija normaalisti.
>
> **Milloin ammattilainen:** nuohous on aina ammattilaisen työ, ja samalla käynnillä voidaan tarkastaa hormin yleiskunto ja paloturvallisuus.

**CTA:** Varaa nuohous nyt, vältä syksyn ruuhka → `/pts`

### Syysmuistutus — 1.8. klo 08

**Cron:** `0 8 1 8 *` body `{"kausi":"syksy"}`
**Lähetetään:** vain käyttäjille joilla ei ole `huolto_historia`-merkintää kategoriassa `nuohous` kuluvalta kalenterivuodelta.

**Otsikko:** Nuohous on vielä tekemättä tältä vuodelta

**Runko:**
> Tämän vuoden nuohous on vielä kirjaamatta talokirjassasi.
>
> Lakisääteinen määräaika lähestyy, ja syksy on perinteisesti nuohoojien kiireisintä aikaa — mitä aiemmin varaat ajan, sitä todennäköisemmin saat sen ennen lämmityskauden alkua. Talvella tehty nuohous viime hetkellä tarkoittaa usein pidempää odotusta ja vähemmän valinnanvaraa tekijän suhteen.
>
> **Mitä voit tarkastaa itse:** kertyikö viime talvena nokea tavallista enemmän, tai onko vedossa ollut muutoksia.
>
> **Milloin ammattilainen:** jos lämmityskausi on jo alkamassa eikä nuohousta ole tehty, kannattaa varata aika mahdollisimman pian.

**CTA:** Varaa nuohous ennen syksyn ruuhkaa → `/pts`

### Faktatausta (talletetaan kommenttina lähdekoodiin)
Kesäkuu 2026 -faktatarkistus 5 alan toimijaa vasten (NuohousMarkku, Markku.fi, Nalas, HSY Ilmastoinfo, Iloasua.fi): 4/5 vahvistaa kevään (helmi–huhtikuu) parhaaksi ajankohdaksi. Maaliskuu osuu suositellun ikkunan keskelle.

## 2. Kolmiportaiset PTS-viestit

`PTS_KOHTEET` (`src/lib/pts-kohteet.ts`): `ptsHuomio` → `{ kiireellinen, lahivuosina, seurannassa }`, 14 × 3 tekstiä.
- PTS-näkymä valitsee tekstin `laskeKiireellisyys()`-tuloksen mukaan, värikoodaus design-tokeneilla
- Kausikirje (`kausikirje.server.ts`) käyttää samaa katalogia
- Fallback vanhalle `string`-muodolle

## 3. Kategoriakohtainen viestikatalogi

`src/lib/huolto-infot.ts` laajenee kattamaan kaikki 14 PTS-kategoriaa: `{ miksi, miten, milloin_ammattilainen, vinkki }`. PTS-näkymässä "Lisätietoja"-paneeli, sama katalogi kausikirjeen riviselitteissä.

## 4. SEO-sivut — eriytetty palvelu vs. talohuolto

### `/ukk` — vain Kotivahti-palvelusta
`src/routes/ukk.tsx`, JSON-LD `@type: FAQPage`:
- Mikä Kotivahti on ja onko ilmainen
- Miten talokirja toimii
- Miten kilpailutus toimii
- Sitovuus, luottokortti
- Ammattilaisten tarkastus
- Tietoturva

### `/opas/*` — talon huoltoa
Jokainen aihesivu: `@type: Article` + aiheeseen sopiva `FAQPage`-osio.
- `src/routes/opas/index.tsx` — oppaiden listaus
- `src/routes/opas/nuohous-hinta.tsx` (sis. "kuinka usein nuohous" FAQ:ssa)
- `src/routes/opas/iv-puhdistus.tsx`
- `src/routes/opas/katon-tarkastus.tsx`

Sisällöt `huolto-infot.ts`-katalogista. CTA → rekisteröidy. Footteriin diskreetit linkit (UKK + Oppaat). Jokainen reitti määrittää oman `head()`:n (title, description, og:*, canonical).

## Sitemap

`src/routes/sitemap[.]xml.ts`: lisätään `/ukk`, `/opas`, `/opas/nuohous-hinta`, `/opas/iv-puhdistus`, `/opas/katon-tarkastus`.

## Tiedostotaulukko

| Tiedosto | Muutos |
|---|---|
| `src/routes/api/public/hooks/nuohous-muistutus.ts` | UUSI — `?kausi=kevat|syksy`, Resend |
| pg_cron (insert tool) | 2 ajastusta: 1.3. (`{"kausi":"kevat"}`) + 1.8. (`{"kausi":"syksy"}`) |
| `src/lib/pts-kohteet.ts` | `ptsHuomio` → 3-portainen, 14 × 3 tekstiä |
| `src/lib/huolto-infot.ts` | PTS-kategorioiden info-paketit |
| `src/routes/pts.tsx` | Värikoodatut viestit + lisätietopaneeli |
| `src/lib/kausikirje.server.ts` | Käyttää uutta katalogia |
| `src/routes/ukk.tsx` | MUUTETTU — vain Kotivahti-palvelua koskevat kysymykset |
| `src/routes/opas/index.tsx` | UUSI — oppaiden listaus |
| `src/routes/opas/nuohous-hinta.tsx` | UUSI |
| `src/routes/opas/iv-puhdistus.tsx` | UUSI |
| `src/routes/opas/katon-tarkastus.tsx` | UUSI |
| `src/routes/sitemap[.]xml.ts` | Lisätään `/ukk` + `/opas/*` |

Käyttöikätaulukkoa ei muuteta.

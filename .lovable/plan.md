## Yleiskuva

Rakennetaan **liidi-j\u00e4rjestelm\u00e4** jossa k\u00e4ytt\u00e4j\u00e4 voi tilata kuntoarvion, huollon tai tarjouspyynn\u00f6n. Liidit tallennetaan kantaan, vahvistuss\u00e4hk\u00f6posti l\u00e4htee asiakkaalle ja kategoria-kohtainen liidi-s\u00e4hk\u00f6posti ammattilaisverkostolle (Resend). Admin hallinnoi ammattilaisia ja liidej\u00e4 erillisess\u00e4 /admin-n\u00e4kym\u00e4ss\u00e4.

## 1. Tietokantamuutokset (migraatio)

**`liidit`** \u2014 asiakkaan l\u00e4hett\u00e4m\u00e4t pyynn\u00f6t
- `id, kiinteisto_id, user_id, palvelu` (kuntoarvio/huolto/tarjouspyynto)
- `kategoria, kuvaus, nimi, puhelin, sahkoposti, ajoitus, lisatieto`
- `rakennus_vuosi, lammitys, osoite` (snapshot talon tiedoista)
- `pts_kohde` (jos avattu PTS:st\u00e4)
- `status` (odottaa/lahetetty/kaynnissa/valmis), `lahetetty_at, created_at, updated_at`
- RLS: k\u00e4ytt\u00e4j\u00e4 n\u00e4kee/luo omat; admin n\u00e4kee kaikki

**`ammattilaiset`** \u2014 verkoston rekisteri
- `id, kategoria, yritys, sahkoposti, puhelin, aktiivinen, prioriteetti`
- RLS: vain admin lukee/muokkaa; SECURITY DEFINER -funktio kategorian aktiivisten s\u00e4hk\u00f6postien hakuun palvelinpuolen automaatiota varten

**`liidi_asetukset`** \u2014 globaali config (yksi rivi)
- `id, automaatio_paalla boolean, paivitetty_at`
- RLS: vain admin

**`user_roles`** + `app_role` enum (admin) + `has_role()` SECURITY DEFINER -funktio (oppaan mukainen kuvio)
- Yksi admin-rivi sy\u00f6tet\u00e4\u00e4n erikseen sen j\u00e4lkeen kun k\u00e4ytt\u00e4j\u00e4 kertoo, kuka on admin

## 2. Server-funktiot (`src/lib/liidit.functions.ts`)

Kaikki `createServerFn` + `requireSupabaseAuth`:

- `getLiidit()` \u2014 oman k\u00e4ytt\u00e4j\u00e4n pyynn\u00f6t
- `luoLiidi(input)` \u2014 validoi Zodilla, snapshotoi talon tiedot, INSERT `liidit`, k\u00e4ynnist\u00e4\u00e4 s\u00e4hk\u00f6postit jos `automaatio_paalla=true`
- `getAdminLiidit()` \u2014 admin: kaikki liidit; tarkistaa `has_role(uid,'admin')`
- `paivitaLiidinStatus(id, status)` \u2014 admin
- `getAmmattilaiset()` / `lisaaAmmattilainen` / `paivitaAmmattilainen` / `poistaAmmattilainen` \u2014 admin
- `getLiidiAsetukset()` / `paivitaLiidiAsetukset(automaatio_paalla)` \u2014 admin
- `getOmatKiinteistot()` \u2014 dropdownia varten

S\u00e4hk\u00f6postin l\u00e4hetys palvelinpuolella (server-helper, ei edge functionia): `src/lib/email.server.ts` kutsuu Resend-APIa suoraan `RESEND_API_KEY`-secretill\u00e4. L\u00e4hett\u00e4j\u00e4 toistaiseksi `onboarding@resend.dev`; kun k\u00e4ytt\u00e4j\u00e4 vahvistaa oman domainin, vaihdetaan siihen.

## 3. Liidilomake-komponentti (`src/components/liidi-dialog.tsx`)

Yhteinen modaali jota k\u00e4ytt\u00e4v\u00e4t kaikki avauspaikat. Propsit:
- `open, onOpenChange`
- `esitaytetty?: { palvelu?, kategoria?, kuvaus?, lukitseKategoria?, lukitsePalvelu?, ptsKohde? }`

Kent\u00e4t spesifikaation mukaan: palvelutyyppi (radio), kategoria (Select \u2014 14 kpl), kuvaus, nimi, puhelin, s\u00e4hk\u00f6posti (esit\u00e4yt. auth-sessionista), kiinteist\u00f6-dropdown (esit\u00e4yt. aktiivinen; jos useita), ajoitus (radio), lis\u00e4tieto. Luottamuselementti ennen l\u00e4hetysnappia.

Onnistunut l\u00e4hetys \u2192 toast + sulje + `qc.invalidateQueries({queryKey:["liidit"]})`.

## 4. Avauspaikat

- **`vuosikello.tsx`**: jokaisen huoltorivin oikealle "Tilaa huolto" -nappi. Kategoria p\u00e4\u00e4tell\u00e4\u00e4n huollon nimest\u00e4 yksinkertaisella mapilla (nuohous\u2192Nuohous; kouru/sy\u00f6ksy\u2192Salaojat ja sadevesij; IV\u2192Ilmanvaihto; jne.). Kuvaus = "Vuosikello: [nimi]".
- **`pts.tsx`**: rivin viereen "Pyyd\u00e4 kuntoarviota". Palvelu+kategoria lukittuna. Kuvaus = "PTS-suunnitelma suosittelee kuntoarviota: [kohde], arvioitu toimenpidevuosi [vuosi]".
- **`huoltohistoria.tsx`**: "Tilaa ammattilainen" -nappi listan yl\u00e4puolelle.
- **Navigaatio** (`app-sidebar.tsx`): linkki "Tilaa palvelu" joka avaa tyhj\u00e4n lomakkeen + uusi reitti **`/pyynnot`** k\u00e4ytt\u00e4j\u00e4n omien pyynt\u00f6jen listalle.

## 5. Pyynn\u00f6t-sivu (`src/routes/_authenticated/pyynnot.tsx`)

Lista k\u00e4ytt\u00e4j\u00e4n liideist\u00e4: p\u00e4iv\u00e4m\u00e4\u00e4r\u00e4, palvelu+kategoria, status-badge (Odottaa/K\u00e4ynniss\u00e4/Valmis), osoite. Tyhj\u00e4 tila + "Tilaa palvelu" CTA.

## 6. Admin-paneeli (`src/routes/_authenticated/admin.tsx`)

`beforeLoad` heitt\u00e4\u00e4 redirectin /dashboardiin jos ei admin. Kolme v\u00e4lilehte\u00e4 (Tabs):

1. **Liidit** \u2014 taulukko (pvm, asiakas, puhelin, osoite, kategoria, status-dropdown, toiminnot)
2. **Ammattilaiset** \u2014 kategoriat ryhmiteltyn\u00e4; "Lis\u00e4\u00e4 ammattilainen" per kategoria; muokkaus/poisto-modaalit; aktiivinen-toggle
3. **Asetukset** \u2014 automaatio-master switch (off = tallennetaan mutta ei l\u00e4het\u00e4 s\u00e4hk\u00f6posteja)

## 7. S\u00e4hk\u00f6postiautomaatio

Server-funktion `luoLiidi` lopussa:
```
if (asetukset.automaatio_paalla) {
  await sendAsiakkaalle(liidi)
  const vastaanottajat = await haeAmmattilaiset(liidi.kategoria) // aktiiviset
  if (vastaanottajat.length) await sendAmmattilaisille(liidi, vastaanottajat)
}
```
Molemmat viestit speksin mukaisilla teksteill\u00e4. Virheet logitetaan mutta eiv\u00e4t kaada l\u00e4hetyst\u00e4 (liidi tallentuu silti, status j\u00e4\u00e4 "odottaa").

**Vaaditaan secret**: `RESEND_API_KEY`. Pyyt\u00e4\u00e4n k\u00e4ytt\u00e4j\u00e4lt\u00e4 `add_secret`-ty\u00f6kalulla ennen koodin kirjoittamista.

## 8. Avoimet kohdat (vahvistettava ennen toteutusta)

1. **Admin-k\u00e4ytt\u00e4j\u00e4**: kenen s\u00e4hk\u00f6postin annan admin-roolin? (esim. sinun oman tunnuksesi)
2. **L\u00e4hett\u00e4j\u00e4n osoite**: aluksi `onboarding@resend.dev` riitt\u00e4\u00e4 testaukseen, vai onko jo verifioitu Resend-domain k\u00e4yt\u00f6ss\u00e4?
3. **Resend API key**: tarvitaan `add_secret`-pyynt\u00f6n\u00e4 ennen automaation aktivointia. Sopiiko?
4. Pyynn\u00f6t-listan paikka: oma reitti `/pyynnot` sivupalkissa vai huoltohistorian alle samaan n\u00e4kym\u00e4\u00e4n? (Speksiss\u00e4 ehdotetaan kumpaakin.) Oletan oma reitti = selke\u00e4mpi.

## Verifiointi

A. PTS \u2192 "Pyyd\u00e4 kuntoarviota" \u2192 lomake esit\u00e4ytettyn\u00e4 ja kategoria lukittu \u2192 l\u00e4het\u00e4 \u2192 n\u00e4kyy /pyynnot \u2192 n\u00e4kyy adminissa \u2192 vahvistuss\u00e4hk\u00f6posti saapuu testiosoitteeseen.
B. Vuosikello "Nuohous" \u2192 "Tilaa huolto" \u2192 kategoria = Nuohous esit\u00e4ytettyn\u00e4 \u2192 sama ketju.
C. Admin kytkee automaation OFF \u2192 uusi liidi tallentuu mutta s\u00e4hk\u00f6postia ei l\u00e4hde (palvelinlogiin merkint\u00e4 "automaatio off").

## Tekniset huomiot

- Ei k\u00e4ytet\u00e4 Supabase Edge Functioneita; kaikki TanStack server-funktioissa.
- Resend-kutsut suoraan `fetch`-API:lla (ei SDK:ta) jotta toimii Worker-runtimessa.
- Liidi-snapshot: tallennetaan osoite/rakennusvuosi/l\u00e4mmitys rivin luonnin yhteydess\u00e4 \u2014 liidi ei muutu jos talon tietoja my\u00f6hemmin p\u00e4ivitet\u00e4\u00e4n.
- `vuosikello-data.ts`: lis\u00e4t\u00e4\u00e4n `huoltoKategoriaksi(nimi)` -apuri kategorian arvaamiseen.

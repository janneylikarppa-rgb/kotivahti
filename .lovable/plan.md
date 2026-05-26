## Diagnoosi

**1. PTS-sivu ei aukene + sivujen välillä välähtää (React-virhe #418 = hydraation epäonnistuminen)**

`src/routes/_authenticated/pts.tsx` sisältää oman `beforeLoad`-suojan:

```ts
beforeLoad: async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw redirect({ to: "/login" });
}
```

Tämä ajetaan **myös SSR-prerenderissä**, jolloin selaimen Supabase-clientilla ei ole sessiota → heittää redirectin `/login`-osoitteeseen. Selaimessa käyttäjä on kirjautunut, joten Tanstack mount\:aa `/pts`-puun – tuloksena hydraatiomismatch (`Minified React error #418 args[]=HTML`) ja näkymä jää tyhjäksi / vilkkuu.

Sama vika on miksi sivujen välillä välähtää: jokainen client-side -navigointi yrittää ensin matchata SSR-puuhun josta osa reiteistä on redirectoitu /login\:iin.

Parent-reitti `src/routes/_authenticated.tsx` hoitaa jo autentikoinnin oikein (`if (typeof window === "undefined") return;` + client-side redirect), joten lapsi-reitin oma tarkistus on sekä turha että haitallinen.

**2. Pienet siisteyskorjaukset samalla**

- `huoltohistoria.tsx:213` käyttää myös `supabase.auth.getUser()`-kutsua komponentin sisällä – ei aiheuta hydraatiovirhettä, mutta tarkistetaan ettei se ole `beforeLoad`/`loader`-tasolla.
- Lisätään `defaultPendingComponent` routeriin: kun lapsi-loaderi käy, näytetään pehmeä tausta sen sijaan että edellinen sivu jää näkyviin (tämä on aiemmin koettu "Päivitetään sovellusta" -tyyppisenä välähdyksenä yhdessä chunk-reloadin kanssa).

## Muutokset

### `src/routes/_authenticated/pts.tsx`
- Poista koko `beforeLoad`-blokki ja `redirect`/`supabase`-importit jotka liittyvät pelkästään siihen.
- Loader pysyy ennallaan (`typeof window === "undefined"` -guard ja `ensureQueryData`).

### `src/router.tsx`
- Lisää `defaultPendingComponent` joka renderöi vain tumman `bg-background`-divin (ei tekstiä, ei "Päivitetään"). Tämä estää välähdyksen kun reittikohtainen loader käy.
- Säilytä muut asetukset (`defaultPreloadStaleTime: 0`, `defaultPreload: "intent"`).

## Verifiointi
- Navigoi sidebarista `/pts`-sivulle → ei redirectiä, lista renderöityy.
- Navigoi `/dashboard` ↔ `/pts` ↔ `/huoltohistoria` → ei valkoista välähdystä eikä hydraatiovirheitä konsolissa.
- Tarkista että React-virhe #418 katoaa preview-konsolista.

## Mitä EI muuteta
- Ei kosketa server-funktioihin (`getPts`, `seedPts` ym.) – ne toimivat.
- Ei muuteta tietokantaa tai realtime-tilauksia.
- Ei muuteta UI-rakennetta tai tyylejä.

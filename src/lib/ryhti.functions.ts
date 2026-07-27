import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const syote = z.object({
  osoite: z.string().trim().min(2, "Syötä ensin osoite"),
  kaupunki: z.string().trim().nullish(),
});

export const haeRyhtiTiedot = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => syote.parse(data))
  .handler(async ({ data }) => {
    const {
      RyhtiError,
      geokoodaa,
      haeRakennusAvaimella,
      haeRakennukset,
      valitseLahin,
      mappaaRakennus,
    } = await import("./ryhti.server");

    try {
      const { lat, lon, rakennusAvain } = await geokoodaa(data.osoite, data.kaupunki ?? null);
      let rakennus = rakennusAvain ? await haeRakennusAvaimella(rakennusAvain) : null;
      if (!rakennus) {
        rakennus = valitseLahin(await haeRakennukset(lat, lon), lat, lon);
      }
      if (!rakennus) {
        return { ok: false as const, koodi: "NO_BUILDING" as const };
      }
      const tulos = mappaaRakennus(rakennus);
      const onkoDataa =
        tulos.rakennusvuosi != null ||
        tulos.pinta_ala != null ||
        tulos.kerroksia != null ||
        tulos.lammitysmuoto != null ||
        tulos.julkisivumateriaali != null;
      if (!onkoDataa) {
        return { ok: false as const, koodi: "NO_BUILDING" as const };
      }
      return { ok: true as const, tiedot: tulos };
    } catch (e: any) {
      if (e instanceof RyhtiError) {
        console.error("[ryhti]", e.koodi, e.message);
        return { ok: false as const, koodi: e.koodi };
      }
      console.error("[ryhti] odottamaton virhe", e?.message ?? e);
      return { ok: false as const, koodi: "UPSTREAM_ERROR" as const };
    }
  });


const ehdotusSyote = z.object({ teksti: z.string().trim().min(3) });

export const haeOsoiteEhdotukset = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ehdotusSyote.parse(data))
  .handler(async ({ data }) => {
    const { RyhtiError, haeOsoiteEhdotukset: hae } = await import("./ryhti.server");
    try {
      return { ok: true as const, ehdotukset: await hae(data.teksti) };
    } catch (e: any) {
      if (e instanceof RyhtiError) return { ok: false as const, koodi: e.koodi };
      return { ok: false as const, koodi: "UPSTREAM_ERROR" as const };
    }
  });

const koordinaattiSyote = z.object({
  lat: z.number().finite(),
  lon: z.number().finite(),
  rakennusAvain: z.string().trim().min(1).nullish(),
});

export const haeRyhtiKoordinaateilla = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => koordinaattiSyote.parse(data))
  .handler(async ({ data }) => {
    const { RyhtiError, haeRakennusAvaimella, haeRakennukset, valitseLahin, mappaaRakennus } =
      await import("./ryhti.server");
    try {
      let rakennus = data.rakennusAvain ? await haeRakennusAvaimella(data.rakennusAvain) : null;
      if (!rakennus) {
        rakennus = valitseLahin(await haeRakennukset(data.lat, data.lon), data.lat, data.lon);
      }
      if (!rakennus) return { ok: false as const, koodi: "NO_BUILDING" as const };

      const tulos = mappaaRakennus(rakennus);
      const onkoDataa =
        tulos.rakennusvuosi != null ||
        tulos.pinta_ala != null ||
        tulos.kerroksia != null ||
        tulos.lammitysmuoto != null ||
        tulos.julkisivumateriaali != null;
      if (!onkoDataa) return { ok: false as const, koodi: "NO_BUILDING" as const };
      return { ok: true as const, tiedot: tulos };
    } catch (e: any) {
      if (e instanceof RyhtiError) return { ok: false as const, koodi: e.koodi };
      return { ok: false as const, koodi: "UPSTREAM_ERROR" as const };
    }
  });

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
      haeRakennukset,
      valitseLahin,
      mappaaRakennus,
    } = await import("./ryhti.server");

    try {
      const { lat, lon } = await geokoodaa(data.osoite, data.kaupunki ?? null);
      const rakennukset = await haeRakennukset(lat, lon);
      const rakennus = valitseLahin(rakennukset, lat, lon);
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
        console.warn("[ryhti] tuntematon vastausrakenne:", JSON.stringify(rakennus).slice(0, 800));
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

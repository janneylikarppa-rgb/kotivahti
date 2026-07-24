import { describe, it, expect } from "vitest";
import { laskeVahennys, vahennysVari, ENIMMAISMAARA } from "./kotitalousvahennys";

const yritys = (tyon_osuus: number) => ({ pvm: "2026-01-01", tyon_osuus, kotitalousvahennys_tyyppi: "yritys" });
const palkka = (tyon_osuus: number) => ({ pvm: "2026-01-01", tyon_osuus, kotitalousvahennys_tyyppi: "palkka" });

describe("laskeVahennys", () => {
  it("tyhjä lista → 0", () => {
    expect(laskeVahennys([], 1).vahennys).toBe(0);
  });

  it("yritystyö 800 € → 227,50 € (800−150) × 35 %", () => {
    expect(laskeVahennys([yritys(800)], 1).vahennys).toBeCloseTo(227.5, 2);
  });

  it("omavastuu vähennetään vain kerran koko vuodelta", () => {
    const t = laskeVahennys([yritys(400), yritys(400)], 1);
    expect(t.yritysTyot).toBe(800);
    expect(t.vahennys).toBeCloseTo(227.5, 2);
  });

  it("alle omavastuun → 0", () => {
    expect(laskeVahennys([yritys(120)], 1).vahennys).toBe(0);
  });

  it("palkkatyö 1000 € → 130 €", () => {
    expect(laskeVahennys([palkka(1000)], 1).vahennys).toBeCloseTo(130, 2);
  });

  it("palkkatyössä ei omavastuuta", () => {
    expect(laskeVahennys([palkka(100)], 1).vahennys).toBeCloseTo(13, 2);
  });

  it("kahdelle henkilölle kaksinkertainen omavastuu", () => {
    const t = laskeVahennys([yritys(1000)], 2);
    expect(t.omavastuu).toBe(300);
    expect(t.vahennys).toBeCloseTo(245, 2);
  });

  it("katto 1 600 € yhdelle henkilölle", () => {
    expect(laskeVahennys([yritys(100000)], 1).vahennys).toBe(ENIMMAISMAARA);
  });

  it("katto 3 200 € kahdelle henkilölle", () => {
    expect(laskeVahennys([yritys(100000)], 2).vahennys).toBe(3200);
  });

  it("yritys + palkka lasketaan yhteen", () => {
    const t = laskeVahennys([yritys(800), palkka(1000)], 1);
    expect(t.vahennys).toBeCloseTo(357.5, 2);
  });

  it("ei-vähennyskelpoiset rivit ohitetaan", () => {
    const t = laskeVahennys([{ pvm: "2026-01-01", tyon_osuus: 900, kotitalousvahennys_tyyppi: null }], 1);
    expect(t.kirjauksia).toBe(0);
    expect(t.vahennys).toBe(0);
  });

  it("täyttöaste lasketaan katosta", () => {
    expect(laskeVahennys([yritys(800)], 1).tayttoaste).toBeCloseTo(227.5 / 1600, 4);
  });

  it("merkkijonoarvot toimivat", () => {
    const t = laskeVahennys([{ pvm: "2026-01-01", tyon_osuus: "800", kotitalousvahennys_tyyppi: "yritys" }], 1);
    expect(t.vahennys).toBeCloseTo(227.5, 2);
  });

  it("kirjausten määrä lasketaan", () => {
    expect(laskeVahennys([yritys(100), palkka(100)], 1).kirjauksia).toBe(2);
  });

  it("värikoodi vaihtuu täyttöasteen mukaan", () => {
    expect(vahennysVari(0.5)).toBe("teal");
    expect(vahennysVari(0.85)).toBe("oranssi");
    expect(vahennysVari(1)).toBe("harmaa");
  });
});

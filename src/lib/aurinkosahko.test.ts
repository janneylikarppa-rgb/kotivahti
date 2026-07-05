import { describe, it, expect } from "vitest";
import { laskeAurinkoSuositus, type KuluRivi } from "./aurinkosahko";

/** Apuri: luo sähkörivi. */
const s = (pvm: string, kwh: number): KuluRivi => ({ pvm, kwh });

/** Yleinen kaikkiKulut: kuusi eri kuukautta 2024. */
const KUUSI_KUUKAUTTA = [
  { pvm: "2024-01-15" },
  { pvm: "2024-02-15" },
  { pvm: "2024-03-15" },
  { pvm: "2024-04-15" },
  { pvm: "2024-05-15" },
  { pvm: "2024-06-15" },
];

describe("laskeAurinkoSuositus", () => {
  describe("aurinkokuukaudet_kwh (huhti–syyskuu)", () => {
    it("laskee vain kuukaudet 4–9 yhteen", () => {
      const sahko: KuluRivi[] = [
        s("2024-03-15", 500), // maalis — pois
        s("2024-04-15", 400), // huhti — mukaan
        s("2024-09-15", 300), // syys — mukaan
        s("2024-10-15", 500), // loka — pois
      ];
      const t = laskeAurinkoSuositus(sahko, sahko, false);
      expect(t.aurinkokuukaudet_kwh).toBe(700);
      expect(t.aurinkokuukaudet_kk).toBe(2);
    });

    it("laskee saman kuukauden useat rivit oikein", () => {
      const sahko: KuluRivi[] = [
        s("2024-06-01", 200),
        s("2024-06-20", 300),
        s("2024-07-01", 400),
      ];
      const t = laskeAurinkoSuositus(sahko, sahko, false);
      expect(t.aurinkokuukaudet_kwh).toBe(900);
      expect(t.aurinkokuukaudet_kk).toBe(2); // kesä + heinä
    });
  });

  describe("raja kwh >= 1500", () => {
    it("ei suositusta jos kwh = 1499", () => {
      const sahko: KuluRivi[] = [
        s("2024-04-15", 300),
        s("2024-05-15", 300),
        s("2024-06-15", 300),
        s("2024-07-15", 300),
        s("2024-08-15", 299),
        s("2024-09-15", 0),
      ];
      const t = laskeAurinkoSuositus(sahko, KUUSI_KUUKAUTTA, false);
      expect(t.aurinkokuukaudet_kwh).toBe(1499);
      expect(t.suositus).toBe(false);
    });

    it("suositus kun kwh = 1500 (rajatapaus)", () => {
      const sahko: KuluRivi[] = [
        s("2024-04-15", 300),
        s("2024-05-15", 300),
        s("2024-06-15", 300),
        s("2024-07-15", 300),
        s("2024-08-15", 300),
        s("2024-09-15", 0),
      ];
      const t = laskeAurinkoSuositus(sahko, KUUSI_KUUKAUTTA, false);
      expect(t.aurinkokuukaudet_kwh).toBe(1500);
      expect(t.suositus).toBe(true);
    });

    it("suositus kun kwh selvästi yli 1500", () => {
      const sahko: KuluRivi[] = [
        s("2024-04-15", 500),
        s("2024-05-15", 500),
        s("2024-06-15", 500),
        s("2024-07-15", 500),
        s("2024-08-15", 500),
        s("2024-09-15", 500),
      ];
      const t = laskeAurinkoSuositus(sahko, KUUSI_KUUKAUTTA, false);
      expect(t.aurinkokuukaudet_kwh).toBe(3000);
      expect(t.suositus).toBe(true);
    });
  });

  describe("raja data_kuukausia >= 6", () => {
    it("ei suositusta jos data vain 5 eri kuukautta", () => {
      const sahko: KuluRivi[] = [
        s("2024-04-15", 500),
        s("2024-05-15", 500),
        s("2024-06-15", 500),
        s("2024-07-15", 500),
        s("2024-08-15", 500),
      ];
      const viisi = [
        { pvm: "2024-04-15" },
        { pvm: "2024-05-15" },
        { pvm: "2024-06-15" },
        { pvm: "2024-07-15" },
        { pvm: "2024-08-15" },
      ];
      const t = laskeAurinkoSuositus(sahko, viisi, false);
      expect(t.data_kuukausia).toBe(5);
      expect(t.aurinkokuukaudet_kwh).toBe(2500);
      expect(t.suositus).toBe(false);
    });

    it("suositus kun data täsmälleen 6 eri kuukautta (rajatapaus)", () => {
      const sahko: KuluRivi[] = [
        s("2024-04-15", 500),
        s("2024-05-15", 500),
        s("2024-06-15", 500),
      ];
      const t = laskeAurinkoSuositus(sahko, KUUSI_KUUKAUTTA, false);
      expect(t.data_kuukausia).toBe(6);
      expect(t.suositus).toBe(true);
    });

    it("laskee saman kuukauden vain kerran", () => {
      const kulut = [
        { pvm: "2024-01-01" },
        { pvm: "2024-01-15" },
        { pvm: "2024-01-31" },
      ];
      const t = laskeAurinkoSuositus([], kulut, false);
      expect(t.data_kuukausia).toBe(1);
    });

    it("erottelee saman kuukauden eri vuosina", () => {
      const kulut = [
        { pvm: "2023-06-15" },
        { pvm: "2024-06-15" },
      ];
      const t = laskeAurinkoSuositus([], kulut, false);
      expect(t.data_kuukausia).toBe(2);
    });
  });

  describe("aurinkopaneelit-lippu", () => {
    const riittavaSahko: KuluRivi[] = [
      s("2024-04-15", 500),
      s("2024-05-15", 500),
      s("2024-06-15", 500),
    ];

    it("ei suositusta kun paneelit on jo asennettu", () => {
      const t = laskeAurinkoSuositus(riittavaSahko, KUUSI_KUUKAUTTA, true);
      expect(t.aurinkopaneelit).toBe(true);
      expect(t.suositus).toBe(false);
    });

    it("suositus kun paneeleita ei ole ja muut ehdot täyttyvät", () => {
      const t = laskeAurinkoSuositus(riittavaSahko, KUUSI_KUUKAUTTA, false);
      expect(t.aurinkopaneelit).toBe(false);
      expect(t.suositus).toBe(true);
    });
  });

  describe("reunatapaukset", () => {
    it("tyhjä data → ei suositusta, nollat", () => {
      const t = laskeAurinkoSuositus([], [], false);
      expect(t).toEqual({
        suositus: false,
        aurinkokuukaudet_kk: 0,
        aurinkokuukaudet_kwh: 0,
        data_kuukausia: 0,
        aurinkopaneelit: false,
      });
    });

    it("ohittaa rivit joilla ei pvm:ää tai virheellinen pvm", () => {
      const sahko: KuluRivi[] = [
        { pvm: "", kwh: 999 },
        { pvm: "ei-paiva", kwh: 999 },
        s("2024-06-15", 500),
      ];
      const t = laskeAurinkoSuositus(sahko, sahko, false);
      expect(t.aurinkokuukaudet_kwh).toBe(500);
      expect(t.data_kuukausia).toBe(1);
    });

    it("käsittelee null-kwh nollaksi", () => {
      const sahko: KuluRivi[] = [
        { pvm: "2024-06-15", kwh: null },
        s("2024-07-15", 100),
      ];
      const t = laskeAurinkoSuositus(sahko, sahko, false);
      expect(t.aurinkokuukaudet_kwh).toBe(100);
    });

    it("pyöristää kwh-summan lähimpään kokonaislukuun", () => {
      const sahko: KuluRivi[] = [
        s("2024-06-15", 100.7),
        s("2024-07-15", 200.2),
      ];
      const t = laskeAurinkoSuositus(sahko, sahko, false);
      expect(t.aurinkokuukaudet_kwh).toBe(301);
    });
  });
});

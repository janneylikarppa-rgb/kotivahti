// Rakentaa kategoriakohtaisen valmiin kuvauspohjan talon tiedoista.
// Käyttäjä voi vapaasti muokata lopputulosta liidi-lomakkeessa.

import type { LiidiKategoria } from "./liidit-kategoriat";

type TalonTiedot = Record<string, any> | null | undefined;

function v(x: any): string | null {
  if (x === null || x === undefined) return null;
  const s = String(x).trim();
  return s.length > 0 ? s : null;
}

function osat(parts: (string | null | undefined)[]): string {
  return parts.filter((p) => p && String(p).trim().length > 0).join(", ");
}

export function rakennaKuvausPohja(kategoria: LiidiKategoria, t: TalonTiedot): string {
  const tt = t ?? {};

  switch (kategoria) {
    case "Lämmitysjärjestelmä": {
      const muoto = v(tt.lammitysmuoto);
      const ilp = osat([v(tt.ilp_merkki), v(tt.ilp_malli)]);
      const ilpVuosi = v(tt.ilp_asennettu_vuosi);
      const lamVuosi = v(tt.lammitys_asennettu_vuosi);
      const kuvaukset: string[] = [];
      if (muoto) kuvaukset.push(`Lämmitysmuoto: ${muoto}${lamVuosi ? ` (asennettu ${lamVuosi})` : ""}.`);
      if (ilp) kuvaukset.push(`Ilmalämpöpumppu: ${ilp}${ilpVuosi ? `, asennettu ${ilpVuosi}` : ""}.`);
      if (kuvaukset.length === 0) return "Toivon yhteydenottoa lämmitysjärjestelmään liittyen.";
      return kuvaukset.join(" ");
    }

    case "Ilmanvaihto ja IV-kone": {
      const iv = v(tt.ilmanvaihto);
      const vuosi = v(tt.ilmanvaihto_vuosi);
      const suod = v(tt.iv_suodatintyyppi);
      const vaihd = v(tt.iv_suodatin_vaihdettu);
      const osa: string[] = [];
      if (iv) osa.push(`Ilmanvaihto: ${iv}${vuosi ? ` (${vuosi})` : ""}.`);
      if (suod) osa.push(`Suodatintyyppi ${suod}${vaihd ? `, viimeksi vaihdettu ${vaihd}` : ""}.`);
      return osa.length ? osa.join(" ") : "Toivon ilmanvaihtoon liittyvää palvelua.";
    }

    case "Katto ja räystäät": {
      const tyyppi = v(tt.kattotyyppi);
      const mat = v(tt.kattomateriaali);
      const uusi = v(tt.katto_uusittu_vuosi);
      const ala = v(tt.katto_pinta_ala);
      const raystas = v(tt.raystaat_kunnostettu_vuosi);
      const turva = v(tt.kattoturvatuotteet);
      const otsikko = osat([tyyppi, mat]);
      const osa: string[] = [];
      if (otsikko) osa.push(`Katto: ${otsikko}${uusi ? `, uusittu ${uusi}` : ""}.`);
      if (ala) osa.push(`Pinta-ala n. ${ala} m².`);
      if (raystas) osa.push(`Räystäät kunnostettu ${raystas}.`);
      if (turva) osa.push(`Kattoturvatuotteet: ${turva}.`);
      return osa.length ? osa.join(" ") : "Toivon kattoon tai räystäisiin liittyvää palvelua.";
    }

    case "LVI ja putket": {
      const mat = v(tt.putkimateriaali);
      const vuosi = v(tt.putket_uusittu_vuosi);
      const vmat = v(tt.viemarimateriaali);
      const vvuosi = v(tt.viemari_asennettu_vuosi);
      const osa: string[] = [];
      if (mat || vuosi) osa.push(`Käyttövesiputket: ${mat ?? "tuntematon materiaali"}${vuosi ? `, uusittu ${vuosi}` : ""}.`);
      if (vmat || vvuosi) osa.push(`Viemäri: ${vmat ?? "tuntematon materiaali"}${vvuosi ? `, asennettu ${vvuosi}` : ""}.`);
      return osa.length ? osa.join(" ") : "Toivon LVI-palvelua tai tarjousta putkitöistä.";
    }

    case "Sähköjärjestelmä": {
      const vuosi = v(tt.sahkot_asennettu_vuosi);
      const paasul = v(tt.paasulun_sijainti);
      const osa: string[] = [];
      if (vuosi) osa.push(`Sähköt asennettu ${vuosi}.`);
      if (paasul) osa.push(`Pääsulun sijainti: ${paasul}.`);
      return osa.length ? osa.join(" ") : "Toivon sähköjärjestelmään liittyvää palvelua.";
    }

    case "Julkisivu ja maalaus": {
      const mat = v(tt.julkisivumateriaali);
      const asen = v(tt.julkisivu_asennettu_vuosi);
      const maal = v(tt.julkisivu_maalattu_vuosi);
      const osa: string[] = [];
      if (mat) osa.push(`Julkisivu: ${mat}${asen ? `, asennettu ${asen}` : ""}.`);
      if (maal) osa.push(`Viimeksi maalattu ${maal}.`);
      return osa.length ? osa.join(" ") : "Toivon julkisivuun tai maalaukseen liittyvää tarjousta.";
    }

    case "Ikkunat ja ovet": {
      const tyyppi = v(tt.ikkunat_tyyppi);
      const uusi = v(tt.ikkunat_uusittu_vuosi);
      if (tyyppi || uusi) return `Ikkunat: ${tyyppi ?? "tyyppi tuntematon"}${uusi ? `, uusittu ${uusi}` : ""}.`;
      return "Toivon ikkunoihin tai oviin liittyvää tarjousta.";
    }

    case "Terassi ja puurakenteet": {
      const mat = v(tt.terassi_materiaali);
      const rak = v(tt.terassi_rakennettu_vuosi);
      const ala = v(tt.terassi_pinta_ala);
      const lasit = tt.terassi_lasitettu === true ? "lasitettu" : null;
      const lasVuosi = v(tt.terassi_lasitus_vuosi);
      const kunn = v(tt.terassi_kunnostettu_vuosi);
      const osa: string[] = [];
      if (mat || rak) osa.push(`Terassi: ${mat ?? "puurakenne"}${rak ? `, rakennettu ${rak}` : ""}${ala ? `, n. ${ala} m²` : ""}.`);
      if (lasit) osa.push(`Lasitettu${lasVuosi ? ` ${lasVuosi}` : ""}.`);
      if (kunn) osa.push(`Kunnostettu ${kunn}.`);
      return osa.length ? osa.join(" ") : "Toivon terassiin tai puurakenteisiin liittyvää tarjousta.";
    }

    case "Salaojat ja sadevesijärjestelmä": {
      const salaoja = tt.salaojat === true ? "on" : tt.salaojat === false ? "ei ole" : null;
      const tark = v(tt.salaojat_tarkastettu);
      const kourMat = v(tt.kourun_materiaali);
      const kourPit = v(tt.kourun_pituus);
      const syoks = v(tt.syoksytorvet);
      const sade = v(tt.sadevesikaivot);
      const osa: string[] = [];
      if (salaoja) osa.push(`Salaojat ${salaoja}${tark ? ` (tarkastettu ${tark})` : ""}.`);
      if (kourMat || kourPit) osa.push(`Kourut: ${kourMat ?? "materiaali tuntematon"}${kourPit ? `, ${kourPit} m` : ""}.`);
      if (syoks) osa.push(`Syöksytorvia ${syoks} kpl.`);
      if (sade) osa.push(`Sadevesikaivoja ${sade} kpl.`);
      return osa.length ? osa.join(" ") : "Toivon salaojiin tai sadevesijärjestelmään liittyvää palvelua.";
    }

    case "Nuohous ja tulisijat": {
      const kiuas = v(tt.kiukaan_vuosi);
      const nuoh = v(tt.nuohous_pvm);
      const horm = v(tt.hormit);
      const osa: string[] = [];
      if (horm) osa.push(`Hormit: ${horm}.`);
      if (kiuas) osa.push(`Kiuas asennettu ${kiuas}.`);
      if (nuoh) osa.push(`Edellinen nuohous ${nuoh}.`);
      return osa.length ? osa.join(" ") : "Toivon nuohousta tai tulisijaan liittyvää palvelua.";
    }

    case "Piha ja maanrakennus": {
      const pihaTyyppi = v(tt.pihan_tyyppi);
      const nurmi = v(tt.nurmikon_pinta_ala);
      const tontti = v(tt.tontin_pinta_ala);
      const osa: string[] = [];
      if (pihaTyyppi) osa.push(`Pihan tyyppi: ${pihaTyyppi}.`);
      if (nurmi) osa.push(`Nurmikkoa n. ${nurmi} m².`);
      if (tontti) osa.push(`Tontin pinta-ala n. ${tontti} m².`);
      return osa.length ? osa.join(" ") : "Toivon pihaan tai maanrakennukseen liittyvää tarjousta.";
    }

    case "Kylpyhuone ja märkätilat":
      return "Toivon kylpyhuoneeseen tai märkätiloihin liittyvää palvelua.";

    case "Kosteus ja sisäilma":
      return "Toivon kosteus- tai sisäilmakartoitusta.";

    case "Muu / yleinen":
    default:
      return "";
  }
}

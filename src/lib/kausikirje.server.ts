// Kausikirje-sisällöt ja HTML-template. Server-only.

export type Kausi = "kevat" | "kesa" | "syksy" | "talvi";

export const KAUSI_INFO: Record<Kausi, {
  ikoni: string;
  nimi: string;
  otsikko: string;
  huollot: { otsikko: string; teksti: string }[];
  kysymys: string;
  napit: { teksti: string; vastaus: string; emoji?: string }[];
}> = {
  kevat: {
    ikoni: "🌱",
    nimi: "Kevään",
    otsikko: "Kevään huoltomuistutus",
    huollot: [
      { otsikko: "IV-suodattimet", teksti: "Vaihda ennen kesää – kerää siitepölyä ja katkaisee virtaukset." },
      { otsikko: "Räystäskourut", teksti: "Tarkista talven jälkeen – tyhjennä lehdet ja roskat." },
      { otsikko: "Katon tarkastus", teksti: "Halkeamat ja läpiviennit pintaan ennen sateita." },
      { otsikko: "Vikavirtasuojan testaus", teksti: "Paina testinappia – pitää laueta välittömästi." },
      { otsikko: "Salaojat", teksti: "Tarkista kevätsulannan jälkeen toimivuus ja kaivot." },
    ],
    kysymys: "Oletko tehnyt kauden huoltoja?",
    napit: [
      { teksti: "Kyllä, tehty", vastaus: "tehty", emoji: "✓" },
      { teksti: "Vielä kesken", vastaus: "kesken", emoji: "⏳" },
      { teksti: "En vielä – tilaan apua", vastaus: "tilaan", emoji: "✗" },
    ],
  },
  kesa: {
    ikoni: "☀️",
    nimi: "Kesän",
    otsikko: "Kesän huoltomuistutus",
    huollot: [
      { otsikko: "Julkisivun kuntokierros", teksti: "Halkeamat, maalikalvon kunto, lahot puuosat." },
      { otsikko: "Terassin hoito ja tarkastus", teksti: "Puhdista, käsittele öljyllä tai kuultolla." },
      { otsikko: "Nuohous", teksti: "Paras aika kesällä – varaa nuohooja ajoissa." },
      { otsikko: "Lattiakaivot", teksti: "Kesäpuhdistus – nosta kaivon kansi ja huuhtele." },
    ],
    kysymys: "Miten Kotiluotsi on palvellut tähän mennessä?",
    napit: [
      { teksti: "⭐", vastaus: "1" },
      { teksti: "⭐⭐", vastaus: "2" },
      { teksti: "⭐⭐⭐", vastaus: "3" },
      { teksti: "⭐⭐⭐⭐", vastaus: "4" },
      { teksti: "⭐⭐⭐⭐⭐", vastaus: "5" },
    ],
  },
  syksy: {
    ikoni: "🍂",
    nimi: "Syksyn",
    otsikko: "Syksyn huoltomuistutus",
    huollot: [
      { otsikko: "Lämmityksen käynnistys ja patterit", teksti: "Ilmaa patterit ja tarkista toiminta." },
      { otsikko: "Räystäskourut", teksti: "Puhdista ennen sateita – lehdet tukkivat." },
      { otsikko: "Vikavirtasuoja ja palovaroittimet", teksti: "Testit + paristot uusiksi." },
      { otsikko: "Alkusammutin", teksti: "Vuositarkastus – varmista voimassaolo." },
      { otsikko: "Ulkovesipisteen talvisulku", teksti: "Tyhjennä putket ja sulje sulkuventtiili." },
    ],
    kysymys: "Oletko tehnyt kauden huoltoja?",
    napit: [
      { teksti: "Kyllä, tehty", vastaus: "tehty", emoji: "✓" },
      { teksti: "Vielä kesken", vastaus: "kesken", emoji: "⏳" },
      { teksti: "En vielä – tilaan apua", vastaus: "tilaan", emoji: "✗" },
    ],
  },
  talvi: {
    ikoni: "❄️",
    nimi: "Talven",
    otsikko: "Talven huoltomuistutus",
    huollot: [
      { otsikko: "Lumikuorma katolla", teksti: "Seuraa kertymää ja pudota tarvittaessa." },
      { otsikko: "Märkätilojen silikonit", teksti: "Tarkasta saumat – uusi tarvittaessa." },
      { otsikko: "IV-suodattimet", teksti: "Talvivaihto – sisäilman laatu kuntoon." },
      { otsikko: "Vesiputkien jäätymisriski", teksti: "Tarkista eristykset ja kylmät kohdat." },
    ],
    kysymys: "Onko talossa huoltoasioita joihin kaipaat apua?",
    napit: [
      { teksti: "Kyllä, tilaan apua", vastaus: "tilaan" },
      { teksti: "Ei, kaikki hyvin", vastaus: "ok" },
    ],
  },
};

export const KAUSI_TYYPPI: Record<Kausi, string> = {
  kevat: "kausikirje_kevat",
  kesa: "kausikirje_kesa",
  syksy: "kausikirje_syksy",
  talvi: "kausikirje_talvi",
};

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export type KausikirjeData = {
  etunimi: string;
  kausi: Kausi;
  token: string;
  baseUrl: string;
  ptsHuomio?: { kohde: string; teksti: string } | null;
};

export function rakennaKausikirje(d: KausikirjeData): { subject: string; html: string } {
  const info = KAUSI_INFO[d.kausi];
  const subject = `${info.ikoni} Kotiluotsi – ${info.nimi.toLowerCase()} huoltomuistutus`;
  const base = d.baseUrl.replace(/\/$/, "");
  const palauteUrl = (vastaus: string) =>
    `${base}/palaute?token=${encodeURIComponent(d.token)}&vastaus=${encodeURIComponent(vastaus)}&kausi=${d.kausi}`;
  const ctaUrl = `${base}/dashboard`;
  const profUrl = `${base}/talon-tiedot`;

  const huoltoLista = info.huollot.map((h) =>
    `<li style="margin: 8px 0; font-size: 14px; line-height: 1.5;"><strong style="color:#0D1F14;">${esc(h.otsikko)}</strong> – <span style="color:#444;">${esc(h.teksti)}</span></li>`
  ).join("");

  const napit = info.napit.map((n) =>
    `<a href="${esc(palauteUrl(n.vastaus))}" style="display:inline-block; margin:4px; padding:10px 16px; background:#0D1F14; color:#C9A84C; text-decoration:none; border:1px solid #C9A84C; border-radius:6px; font-size:14px;">${n.emoji ? esc(n.emoji)+" " : ""}${esc(n.teksti)}</a>`
  ).join("");

  const ptsBlock = d.ptsHuomio ? `
    <div style="margin: 24px 0; padding: 16px; background: #f7f7f5; border-left: 3px solid #C9A84C; border-radius: 4px;">
      <p style="margin: 0 0 8px; font-size: 13px; color:#666;">📊 Talosi PTS-suunnitelmasta:</p>
      <p style="margin: 0 0 12px; font-size: 14px; color:#0D1F14;"><strong>${esc(d.ptsHuomio.kohde)}</strong> on ajankohtainen – ${esc(d.ptsHuomio.teksti)}</p>
      <a href="${esc(base)}/pts" style="color:#0D1F14; font-weight:600; text-decoration:none;">Katso PTS-suunnitelma →</a>
    </div>
  ` : "";

  const html = `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #ffffff;">
  <div style="background: #0D1F14; color: #C9A84C; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-family: Georgia, serif; font-size: 22px;">${esc(info.ikoni)} ${esc(info.otsikko)}</h2>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px; font-size: 15px;">Hei ${esc(d.etunimi)},</p>
    <p style="margin: 0 0 16px; font-size: 14px; color: #444;">Tässä ${esc(info.nimi.toLowerCase())} tärkeimmät huoltotoimenpiteet omakotitaloasi varten.</p>

    <h3 style="margin: 24px 0 8px; color:#0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Kauden tärkeimmät huollot</h3>
    <ul style="margin: 0; padding-left: 18px;">${huoltoLista}</ul>

    ${ptsBlock}

    <h3 style="margin: 24px 0 12px; color:#0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${esc(info.kysymys)}</h3>
    <div style="text-align: center;">${napit}</div>

    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
      <a href="${esc(ctaUrl)}" style="display: inline-block; padding: 12px 28px; background: #C9A84C; color: #0D1F14; text-decoration: none; border-radius: 6px; font-weight: 700; letter-spacing: 0.5px;">Avaa Kotiluotsi →</a>
    </div>

    <p style="margin: 28px 0 0; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888; text-align: center;">
      Et halua kausimuistutuksia? <a href="${esc(profUrl)}" style="color:#666;">Peruuta tilaus →</a>
    </p>
  </div>
</div>`.trim();

  return { subject, html };
}

export function rakennaFollowUpKesken(etunimi: string, kausi: Kausi, baseUrl: string): { subject: string; html: string } {
  const info = KAUSI_INFO[kausi];
  const base = baseUrl.replace(/\/$/, "");
  return {
    subject: `Kauden huollot vielä kesken? Me autamme`,
    html: `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #ffffff;">
  <div style="background: #0D1F14; color: #C9A84C; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-family: Georgia, serif; font-size: 20px;">${esc(info.ikoni)} Apua kauden huoltoihin?</h2>
  </div>
  <div style="border:1px solid #e5e5e5; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
    <p>Hei ${esc(etunimi)},</p>
    <p>Viikko sitten kerroit että ${esc(info.nimi.toLowerCase())} huollot ovat vielä tekemättä.</p>
    <p>Kotiluotsin tarkastetut ammattilaiset hoitavat – pyydä tarjous suoraan palvelusta.</p>
    <div style="text-align:center; margin-top: 24px;">
      <a href="${esc(base)}/pts" style="display:inline-block; padding:12px 28px; background:#C9A84C; color:#0D1F14; text-decoration:none; border-radius:6px; font-weight:700;">Tilaa ammattilainen →</a>
    </div>
  </div>
</div>`.trim(),
  };
}

export function rakennaOmistajaHalytys(args: {
  asiakas: string; puhelin: string; kategoria: string; palvelu: string; kaupunki: string; lahetetty: string;
}): { subject: string; html: string } {
  return {
    subject: `⚠️ Ammattilainen ei reagoinut – ${args.kategoria} – ${args.kaupunki}`,
    html: `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width:640px; margin:0 auto; padding:24px; background:#ffffff; color:#1a1a1a;">
  <div style="background:#7a2e2e; color:#fff; padding:16px 20px; border-radius:8px 8px 0 0;">
    <h2 style="margin:0; font-family:Georgia,serif; font-size:18px;">⚠️ AMMATTILAINEN EI REAGOINUT</h2>
  </div>
  <div style="border:1px solid #e5e5e5; border-top:none; padding:20px; border-radius:0 0 8px 8px;">
    <p>Asiakas ilmoittaa ettei ammattilainen ole ottanut yhteyttä 3 arkipäivään.</p>
    <table style="width:100%; font-size:14px; border-collapse:collapse;">
      <tr><td style="padding:4px 0; color:#666; width:120px;">Asiakas</td><td>${esc(args.asiakas)} – ${esc(args.puhelin)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Kategoria</td><td>${esc(args.kategoria)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Palvelu</td><td>${esc(args.palvelu)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Kaupunki</td><td>${esc(args.kaupunki)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Lähetetty</td><td>${esc(args.lahetetty)}</td></tr>
    </table>
  </div>
</div>`.trim(),
  };
}

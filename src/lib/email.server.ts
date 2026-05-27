// Resend-sähköpostien lähetys palvelinpuolella. Käytetään suoraa fetch-kutsua.
// RESEND_API_KEY luetaan ajonaikaisesti process.env-muuttujasta.

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "Kotivahti <onboarding@resend.dev>";

export async function lahetaEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY puuttuu – sähköpostia ei lähetetä");
    return { ok: false, error: "RESEND_API_KEY puuttuu" };
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: input.to, subject: input.subject, html: input.html }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Resend epäonnistui", res.status, txt);
      return { ok: false, error: `Resend ${res.status}: ${txt}` };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("Resend-virhe", e);
    return { ok: false, error: e?.message ?? "tuntematon virhe" };
  }
}

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

const PALVELU_NIMET: Record<string, string> = {
  kuntoarvio: "Kuntoarvio",
  huolto: "Huolto",
  tarjouspyynto: "Tarjouspyyntö",
};
const AJOITUS_NIMET: Record<string, string> = {
  asap: "Mahdollisimman pian",
  "1_3kk": "1–3 kuukauden sisällä",
  ensi_vuonna: "Vasta ensi vuonna / ei kiire",
};

type LiidiData = {
  palvelu: string;
  kategoria: string;
  kuvaus?: string | null;
  nimi: string;
  puhelin: string;
  sahkoposti: string;
  ajoitus: string;
  lisatieto?: string | null;
  osoite?: string | null;
  rakennus_vuosi?: number | null;
  lammitys?: string | null;
};

export function asiakkaanVahvistus(liidi: LiidiData) {
  const palvelu = PALVELU_NIMET[liidi.palvelu] ?? liidi.palvelu;
  return {
    subject: "Pyyntösi on vastaanotettu – Kotivahti",
    html: `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2 style="font-family: Georgia, serif; color: #1a1a1a;">Hei ${esc(liidi.nimi)},</h2>
  <p>Olemme vastaanottaneet pyyntösi ja välitämme sen sopivalle ammattilaiselle lähialueeltasi.</p>
  <h3 style="margin-top: 24px;">Yhteenveto pyynnöstäsi</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 6px 0; color: #666;">Palvelu</td><td style="padding: 6px 0;">${esc(palvelu)}</td></tr>
    <tr><td style="padding: 6px 0; color: #666;">Kohde</td><td style="padding: 6px 0;">${esc(liidi.kategoria)}</td></tr>
    ${liidi.osoite ? `<tr><td style="padding: 6px 0; color: #666;">Kiinteistö</td><td style="padding: 6px 0;">${esc(liidi.osoite)}</td></tr>` : ""}
    ${liidi.kuvaus ? `<tr><td style="padding: 6px 0; color: #666; vertical-align: top;">Kuvaus</td><td style="padding: 6px 0;">${esc(liidi.kuvaus)}</td></tr>` : ""}
  </table>
  <p style="margin-top: 24px;">Ammattilainen ottaa sinuun yhteyttä puhelimitse tai sähköpostitse mahdollisimman pian.</p>
  <p>Kaikki Kotivahdin ammattilaiset ovat tarkastettuja ja sertifioituja.</p>
  <p style="margin-top: 24px; color: #666;">Terveisin,<br/>Kotivahti-tiimi</p>
</div>`.trim(),
  };
}

export function ammattilaisenLiidi(liidi: LiidiData) {
  const palvelu = PALVELU_NIMET[liidi.palvelu] ?? liidi.palvelu;
  const ajoitus = AJOITUS_NIMET[liidi.ajoitus] ?? liidi.ajoitus;
  return {
    subject: `Uusi ${palvelu.toLowerCase()} -pyyntö – ${liidi.osoite || liidi.kategoria}`,
    html: `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2 style="font-family: Georgia, serif;">Uusi pyyntö Kotivahti-palvelusta</h2>

  <h3>Asiakas</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 4px 0; color: #666; width: 140px;">Nimi</td><td>${esc(liidi.nimi)}</td></tr>
    <tr><td style="padding: 4px 0; color: #666;">Puhelin</td><td><a href="tel:${esc(liidi.puhelin)}">${esc(liidi.puhelin)}</a></td></tr>
    <tr><td style="padding: 4px 0; color: #666;">Sähköposti</td><td><a href="mailto:${esc(liidi.sahkoposti)}">${esc(liidi.sahkoposti)}</a></td></tr>
  </table>

  <h3 style="margin-top: 20px;">Kiinteistö</h3>
  <table style="width: 100%; border-collapse: collapse;">
    ${liidi.osoite ? `<tr><td style="padding: 4px 0; color: #666; width: 140px;">Osoite</td><td>${esc(liidi.osoite)}</td></tr>` : ""}
    ${liidi.rakennus_vuosi ? `<tr><td style="padding: 4px 0; color: #666;">Rakennusvuosi</td><td>${esc(String(liidi.rakennus_vuosi))}</td></tr>` : ""}
    ${liidi.lammitys ? `<tr><td style="padding: 4px 0; color: #666;">Lämmitys</td><td>${esc(liidi.lammitys)}</td></tr>` : ""}
  </table>

  <h3 style="margin-top: 20px;">Pyyntö</h3>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 4px 0; color: #666; width: 140px;">Palvelu</td><td>${esc(palvelu)}</td></tr>
    <tr><td style="padding: 4px 0; color: #666;">Kohde</td><td>${esc(liidi.kategoria)}</td></tr>
    <tr><td style="padding: 4px 0; color: #666;">Ajoitus</td><td>${esc(ajoitus)}</td></tr>
    ${liidi.kuvaus ? `<tr><td style="padding: 4px 0; color: #666; vertical-align: top;">Kuvaus</td><td>${esc(liidi.kuvaus)}</td></tr>` : ""}
    ${liidi.lisatieto ? `<tr><td style="padding: 4px 0; color: #666; vertical-align: top;">Lisätieto</td><td>${esc(liidi.lisatieto)}</td></tr>` : ""}
  </table>

  <p style="margin-top: 24px;">Ole yhteydessä asiakkaaseen mahdollisimman pian.</p>
  <p style="color: #666;">Kotivahti-tiimi</p>
</div>`.trim(),
  };
}

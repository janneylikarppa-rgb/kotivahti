// Resend-sähköpostien lähetys palvelinpuolella. Käytetään suoraa fetch-kutsua.
// RESEND_API_KEY luetaan ajonaikaisesti process.env-muuttujasta.

const RESEND_URL = "https://api.resend.com/emails";
const FROM = "Kotiluotsi <noreply@kotiluotsi.fi>";

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

type LiidiData = {
  palvelu: string;
  kategoria: string;
  kuvaus?: string | null;
  nimi: string;
  puhelin: string;
  sahkoposti: string;
  lisatieto?: string | null;
  osoite?: string | null;
  kaupunki?: string | null;
  rakennus_vuosi?: number | null;
  lammitys?: string | null;
};

/** Ilmoitus omistajalle uudesta liidistä. */
export function omistajanIlmoitus(liidi: LiidiData, opts?: { adminUrl?: string }) {
  const palvelu = PALVELU_NIMET[liidi.palvelu] ?? liidi.palvelu;
  const nyt = new Date().toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" });
  const kaupunki = liidi.kaupunki || "tuntematon kaupunki";
  const adminUrl = opts?.adminUrl ?? "/admin";

  return {
    subject: `🔔 Uusi liidi – ${liidi.kategoria} – ${kaupunki}`,
    html: `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #ffffff;">
  <div style="background: #0D1F14; color: #C9A84C; padding: 16px 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-family: Georgia, serif; font-size: 20px;">UUSI LIIDI – KOTILUOTSI</h2>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 16px; color: #666; font-size: 13px;">Vastaanotettu: <strong style="color: #1a1a1a;">${esc(nyt)}</strong></p>

    <h3 style="margin: 20px 0 8px; color: #0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Pyyntö</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #666; width: 130px;">Palvelu</td><td>${esc(palvelu)}</td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Kategoria</td><td>${esc(liidi.kategoria)}</td></tr>
    </table>

    <h3 style="margin: 20px 0 8px; color: #0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Asiakas</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 4px 0; color: #666; width: 130px;">Nimi</td><td>${esc(liidi.nimi)}</td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Puhelin</td><td><a href="tel:${esc(liidi.puhelin)}" style="color: #0D1F14;">${esc(liidi.puhelin)}</a></td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Sähköposti</td><td><a href="mailto:${esc(liidi.sahkoposti)}" style="color: #0D1F14;">${esc(liidi.sahkoposti)}</a></td></tr>
    </table>

    <h3 style="margin: 20px 0 8px; color: #0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Kiinteistö</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      ${liidi.osoite ? `<tr><td style="padding: 4px 0; color: #666; width: 130px;">Osoite</td><td>${esc(liidi.osoite)}</td></tr>` : ""}
      ${liidi.kaupunki ? `<tr><td style="padding: 4px 0; color: #666;">Kaupunki</td><td>${esc(liidi.kaupunki)}</td></tr>` : ""}
      ${liidi.rakennus_vuosi ? `<tr><td style="padding: 4px 0; color: #666;">Rakennusvuosi</td><td>${esc(String(liidi.rakennus_vuosi))}</td></tr>` : ""}
      ${liidi.lammitys ? `<tr><td style="padding: 4px 0; color: #666;">Lämmitys</td><td>${esc(liidi.lammitys)}</td></tr>` : ""}
    </table>

    <h3 style="margin: 20px 0 8px; color: #0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Kuvaus</h3>
    <p style="margin: 0; padding: 12px; background: #f7f7f5; border-left: 3px solid #C9A84C; white-space: pre-wrap; font-size: 14px;">${esc(liidi.kuvaus) || "Ei kuvausta"}</p>

    ${liidi.lisatieto ? `<h3 style="margin: 20px 0 8px; color: #0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Lisätieto</h3>
    <p style="margin: 0; padding: 12px; background: #f7f7f5; border-left: 3px solid #C9A84C; white-space: pre-wrap; font-size: 14px;">${esc(liidi.lisatieto)}</p>` : ""}

    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
      <a href="${esc(adminUrl)}" style="display: inline-block; padding: 12px 24px; background: #0D1F14; color: #C9A84C; text-decoration: none; border-radius: 6px; font-weight: 600; letter-spacing: 0.5px;">Hallinnoi pyyntöä admin-paneelissa →</a>
    </div>
  </div>
</div>`.trim(),
  };
}

// Liidikäsittelyagentti: analysoi uuden liidin Claudella, tallentaa ehdotuksen
// liidit-tauluun ja hoitaa omistajan ilmoituksen aikarajalla (08–18 heti, muuten aamukoonti).
// Ajetaan vain palvelimella. ANTHROPIC_API_KEY luetaan ajonaikaisesti.

import { lahetaEmail } from "@/lib/email.server";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const OMISTAJA_OLETUS = "janne.ylikarppa@gmail.com";
const BASE_URL = "https://kotiluotsi.fi";

export type AgentinEhdotus = {
  kiireellisyys: "korkea" | "normaali" | "matala" | string;
  ammattilaiset: {
    nimi: string;
    puhelin: string;
    arvosana: number;
    arvostelut: number;
    perustelu: string;
  }[];
  valmis_viesti: string;
};

type LiidiInput = {
  id: string;
  kategoria: string;
  kaupunki: string | null;
  palvelu: string;
  kuvaus: string | null;
  nimi: string;
};

function helsinkiTunti(): number {
  const nytHelsinki = new Date().toLocaleString("fi-FI", {
    timeZone: "Europe/Helsinki",
    hour: "2-digit",
    hour12: false,
  });
  return parseInt(nytHelsinki, 10);
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function rakennaPrompt(liidi: LiidiInput): string {
  return `Olet Kotiluotsi-palvelun liidikäsittelyagentti.

Uusi huoltoliidi:
Kategoria: ${liidi.kategoria}
Sijainti: ${liidi.kaupunki ?? "ei tiedossa"}
Palvelu: ${liidi.palvelu}
Kuvaus: ${liidi.kuvaus ?? "ei kuvausta"}

Tehtäväsi:
1. Analysoi liidin kiireellisyys
2. Ehdota 3 parasta ammattilaista Google-haun perusteella alueelta.
   Arvioi: arvosana (min 4.0), arvostelujen määrä (min 5),
   sopivuus kategoriaan.
3. Kirjoita valmis lyhyt yhteydenottoteksti ammattilaiselle.

Palauta VAIN JSON-objekti ilman muuta tekstiä:
{
  "kiireellisyys": "korkea/normaali/matala",
  "ammattilaiset": [
    {
      "nimi": "",
      "puhelin": "",
      "arvosana": 0,
      "arvostelut": 0,
      "perustelu": ""
    }
  ],
  "valmis_viesti": ""
}`;
}

function puraJson(teksti: string): AgentinEhdotus | null {
  try {
    // Poista mahdolliset markdown-koodimerkinnät
    const siistitty = teksti.replace(/```(?:json)?/gi, "").trim();
    const alku = siistitty.indexOf("{");
    const loppu = siistitty.lastIndexOf("}");
    if (alku < 0 || loppu <= alku) return null;
    const j = JSON.parse(siistitty.slice(alku, loppu + 1));
    if (!j || !Array.isArray(j.ammattilaiset)) return null;
    return {
      kiireellisyys: String(j.kiireellisyys ?? "normaali"),
      ammattilaiset: (j.ammattilaiset as any[]).slice(0, 3).map((a) => ({
        nimi: String(a?.nimi ?? ""),
        puhelin: String(a?.puhelin ?? ""),
        arvosana: Number(a?.arvosana ?? 0),
        arvostelut: Number(a?.arvostelut ?? 0),
        perustelu: String(a?.perustelu ?? ""),
      })),
      valmis_viesti: String(j.valmis_viesti ?? ""),
    };
  } catch {
    return null;
  }
}

export async function analysoiLiidi(liidi: LiidiInput): Promise<AgentinEhdotus | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[agentti] VIRHE: ANTHROPIC_API_KEY puuttuu – agenttia ei ajeta");
    return null;
  }
  console.log("[agentti] Aloitetaan Claude-kutsu");
  try {
    const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        ...(workspaceId ? { "anthropic-workspace-id": workspaceId } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [{ role: "user", content: rakennaPrompt(liidi) }],
      }),
    });
    if (!res.ok) {
      console.error("[agentti] VIRHE: Anthropic epäonnistui", res.status, await res.text().catch(() => ""));
      return null;
    }
    const body = await res.json();
    console.log("[agentti] Vastaus:", JSON.stringify(body).slice(0, 4000));
    const teksti = body?.content?.map((c: any) => c?.text ?? "").join("") ?? "";
    const purettu = puraJson(teksti);
    if (!purettu) console.error("[agentti] VIRHE: JSON-parsinta epäonnistui raakavastauksesta");
    return purettu;
  } catch (error) {
    console.error("[agentti] VIRHE:", error);
    return null;
  }
}

function agentinIlmoitusEmail(liidi: LiidiInput, ehdotus: AgentinEhdotus) {
  const kaupunki = liidi.kaupunki || "tuntematon kaupunki";
  const rivit = ehdotus.ammattilaiset
    .map((a, i) => `${i + 1}. ${a.nimi} – ${a.arvosana}⭐ (${a.arvostelut} arv.)`)
    .join("<br>");
  return {
    subject: `🔔 Uusi liidi – ${liidi.kategoria} – ${kaupunki}`,
    html: `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #ffffff;">
  <div style="background: #0D1F14; color: #C9A84C; padding: 16px 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-family: Georgia, serif; font-size: 20px;">UUSI LIIDI – AGENTIN SUOSITUS</h2>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; font-size: 14px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #666; width: 130px;">Asiakas</td><td>${esc(liidi.nimi)}</td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Kategoria</td><td>${esc(liidi.kategoria)}</td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Sijainti</td><td>${esc(kaupunki)}</td></tr>
      <tr><td style="padding: 4px 0; color: #666;">Kiireellisyys</td><td><strong>${esc(ehdotus.kiireellisyys)}</strong></td></tr>
    </table>

    <h3 style="margin: 20px 0 8px; color: #0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Agentin suositus</h3>
    <p style="margin: 0; padding: 12px; background: #f7f7f5; border-left: 3px solid #C9A84C;">${rivit || "Ei ehdotuksia"}</p>

    <h3 style="margin: 20px 0 8px; color: #0D1F14; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Valmis yhteydenottoteksti</h3>
    <p style="margin: 0; padding: 12px; background: #f7f7f5; border-left: 3px solid #C9A84C; white-space: pre-wrap;">"${esc(ehdotus.valmis_viesti)}"</p>

    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
      <a href="${BASE_URL}/admin" style="display: inline-block; padding: 12px 24px; background: #0D1F14; color: #C9A84C; text-decoration: none; border-radius: 6px; font-weight: 600;">Katso admin-paneelissa →</a>
    </div>
  </div>
</div>`.trim(),
  };
}

/**
 * Agentin pääajovaihe liidin tallennuksen jälkeen:
 * analysoi, tallentaa ehdotuksen, ja joko lähettää heti (08–18) tai jonottaa aamukoontiin.
 * Ei koskaan heitä virhettä – liidin luonti ei saa kaatua agenttiin.
 */
function helsinkiAika(d = new Date()): string {
  return new Intl.DateTimeFormat("fi-FI", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

export async function kasitteleLiidiAgentilla(supabase: any, liidi: LiidiInput): Promise<void> {
  try {
    const ehdotus = await analysoiLiidi(liidi);
    const tunti = helsinkiTunti();
    const onPaiva = tunti >= 8 && tunti < 18;

    console.log(`[liidi-agentti] Liidi ${liidi.id} käsitelty. Helsinki-aika: ${helsinkiAika()}, tunti: ${tunti}, onPaiva: ${onPaiva}`);

    const paivitys: Record<string, unknown> = {
      kasitelty_at: new Date().toISOString(),
    };
    if (ehdotus) paivitys.agentin_ehdotus = ehdotus;
    if (!onPaiva) paivitys.lahetus_jonossa = true;

    await supabase.from("liidit").update(paivitys).eq("id", liidi.id);

    if (onPaiva && ehdotus) {
      const vastaanottaja = process.env.OWNER_EMAIL ?? OMISTAJA_OLETUS;
      const msg = agentinIlmoitusEmail(liidi, ehdotus);
      const r = await lahetaEmail({ to: vastaanottaja, subject: msg.subject, html: msg.html });
      if (!r.ok) console.error("Agentin ilmoitus epäonnistui", r.error);
    }
  } catch (e) {
    console.error("kasitteleLiidiAgentilla epäonnistui", e);
  }
}

/** Aamukoonti: lähettää yön liidit ja nollaa jonotuslipun. Palauttaa määrät. */
export async function lahetaAamukoonti(supabaseAdmin: any): Promise<{ lahetetty: number; ohitettu: boolean }> {
  const { data: liidit, error } = await supabaseAdmin
    .from("liidit")
    .select("id, kategoria, kaupunki, created_at")
    .eq("lahetus_jonossa", true)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const lista = (liidit ?? []) as any[];
  if (lista.length === 0) return { lahetetty: 0, ohitettu: true };

  const rivit = lista
    .map((l) => {
      const aika = new Date(l.created_at).toLocaleString("fi-FI", {
        timeZone: "Europe/Helsinki",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `• ${esc(l.kategoria)} – ${esc(l.kaupunki || "tuntematon")} – klo ${aika}`;
    })
    .join("<br>");

  const vastaanottaja = process.env.OWNER_EMAIL ?? OMISTAJA_OLETUS;
  const r = await lahetaEmail({
    to: vastaanottaja,
    subject: `☀️ ${lista.length} uutta liidiä yön aikana`,
    html: `
<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #ffffff;">
  <div style="background: #0D1F14; color: #C9A84C; padding: 16px 20px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-family: Georgia, serif; font-size: 20px;">AAMUKOONTI – KOTILUOTSI</h2>
  </div>
  <div style="border: 1px solid #e5e5e5; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; font-size: 14px;">
    <p>Yön aikana saapui <strong>${lista.length}</strong> uutta liidiä:</p>
    <p style="padding: 12px; background: #f7f7f5; border-left: 3px solid #C9A84C;">${rivit}</p>
    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center;">
      <a href="${BASE_URL}/admin" style="display: inline-block; padding: 12px 24px; background: #0D1F14; color: #C9A84C; text-decoration: none; border-radius: 6px; font-weight: 600;">Katso kaikki admin-paneelissa →</a>
    </div>
  </div>
</div>`.trim(),
  });

  if (!r.ok) throw new Error(`Koontisähköposti epäonnistui: ${r.error}`);

  await supabaseAdmin
    .from("liidit")
    .update({ lahetus_jonossa: false })
    .in("id", lista.map((l) => l.id));

  return { lahetetty: lista.length, ohitettu: false };
}

/** Onko Helsinki-aika 08:xx (aamukoontin lähetyshetki). */
export function onkoAamukoontiAika(): boolean {
  return helsinkiTunti() === 8;
}

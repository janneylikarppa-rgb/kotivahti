// Nuohousmuistutukset — kausipohjainen logiikka (ei PTS-käyttöikäkaava).
// Kevätmuistutus (1.3.) ja syysmuistutus (1.8.).
//
// Faktatausta (kesäkuu 2026): 5 alan toimijaa (NuohousMarkku, Markku.fi,
// Nalas, HSY Ilmastoinfo, Iloasua.fi) vertailtu — 4/5 vahvistaa kevään
// (helmi–huhtikuu, lämmityskauden loppu) parhaaksi ajankohdaksi. Maaliskuu
// osuu suositellun ikkunan keskelle.

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  kausi: z.enum(["kevat", "syksy"]),
  test_email: z.string().email().optional(),
});

export const Route = createFileRoute("/api/public/hooks/nuohous-muistutus")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body;
        try { body = bodySchema.parse(await request.json()); }
        catch { return new Response("Virheellinen pyyntö", { status: 400 }); }

        const [{ supabaseAdmin }, { lahetaEmail }] = await Promise.all([
          import("@/integrations/supabase/client.server"),
          import("@/lib/email.server"),
        ]);

        const baseUrl = process.env.PUBLIC_APP_URL ?? "https://kotivahti.fi";
        const vuosi = new Date().getFullYear();

        // Hae käyttäjät joilla on tulisija / hormi
        const { data: kiinteistot, error: kErr } = await supabaseAdmin
          .from("kiinteistot")
          .select("id, user_id, talon_tiedot(kiuas_tyyppi, hormityyppi)");
        if (kErr) return new Response(`DB-virhe: ${kErr.message}`, { status: 500 });

        const kelvollisetUserIds = new Set<string>();
        const kiinteistoIdByUser = new Map<string, string[]>();
        for (const k of (kiinteistot ?? []) as any[]) {
          const t = Array.isArray(k.talon_tiedot) ? k.talon_tiedot[0] : k.talon_tiedot;
          const onPuukiuas = t?.kiuas_tyyppi === "puu";
          const onHormi = t?.hormityyppi && t.hormityyppi !== "Ei hormia";
          if (!onPuukiuas && !onHormi) continue;
          kelvollisetUserIds.add(k.user_id);
          const arr = kiinteistoIdByUser.get(k.user_id) ?? [];
          arr.push(k.id);
          kiinteistoIdByUser.set(k.user_id, arr);
        }

        let lahetetty = 0;
        let ohitettu = 0;
        let virheita = 0;

        for (const userId of kelvollisetUserIds) {
          // Syysmuistutus: ohita jos tämän vuoden nuohous on jo kirjattu
          if (body.kausi === "syksy") {
            const ktIds = kiinteistoIdByUser.get(userId) ?? [];
            if (ktIds.length > 0) {
              const { data: hh } = await supabaseAdmin
                .from("huolto_historia")
                .select("id, paivamaara, kohde")
                .in("kiinteisto_id", ktIds)
                .gte("paivamaara", `${vuosi}-01-01`)
                .lte("paivamaara", `${vuosi}-12-31`);
              const onNuohous = (hh ?? []).some((h: any) =>
                /nuohou|hormi|piipu/i.test(String(h.kohde ?? ""))
              );
              if (onNuohous) { ohitettu++; continue; }
            }
          }

          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("email, nimi")
            .eq("id", userId)
            .maybeSingle();
          if (!prof?.email) { ohitettu++; continue; }

          const etunimi = (prof.nimi ?? prof.email).split(" ")[0];
          const msg = rakennaViesti(body.kausi, etunimi, baseUrl);
          const kohde = body.test_email ?? prof.email;
          const r = await lahetaEmail({ to: kohde, subject: msg.subject, html: msg.html });
          if (r.ok) lahetetty++; else virheita++;

          if (body.test_email) break;
        }

        return new Response(JSON.stringify({ ok: true, kausi: body.kausi, lahetetty, ohitettu, virheita }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function rakennaViesti(kausi: "kevat" | "syksy", etunimi: string, baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "");
  const ctaUrl = `${base}/pts`;

  if (kausi === "kevat") {
    return {
      subject: "Nuohous kannattaa tilata nyt — ei syksyllä",
      html: wrap("🔥 Nuohous kannattaa tilata nyt", etunimi, [
        `Lämmityskausi lähenee loppuaan, ja se on paras hetki tilata vuoden nuohous.`,
        `Nuohous on lakisääteinen velvollisuus vähintään kerran vuodessa. Suurin osa tilaa sen perinteisesti syksyllä, jolloin nuohoojien jonot venyvät ja oman aikataulun mukaisen ajan saaminen vaikeutuu. Keväällä tilanne on toinen: tulisijaa on käytetty aktiivisesti koko talven, joten noki ei ole ehtinyt pinttyä tai kerätä kosteutta — se irtoaa tehokkaammin ja hormin veto on parempi, mikä tekee työstä sekä nopeampaa että perusteellisempaa.`,
      ], {
        mitaItse: "onko hormin ympärillä tai nuohousluukussa näkyviä halkeamia, ja vetääkö tulisija normaalisti.",
        milloinAmm: "nuohous on aina ammattilaisen työ, ja samalla käynnillä voidaan tarkastaa hormin yleiskunto ja paloturvallisuus.",
        cta: "Varaa nuohous nyt, vältä syksyn ruuhka",
      }, ctaUrl);
    };
  }

  return {
    subject: "Nuohous on vielä tekemättä tältä vuodelta",
    html: wrap("🔥 Tämän vuoden nuohous on vielä kirjaamatta", etunimi, [
      `Tämän vuoden nuohous on vielä kirjaamatta talokirjassasi.`,
      `Lakisääteinen määräaika lähestyy, ja syksy on perinteisesti nuohoojien kiireisintä aikaa — mitä aiemmin varaat ajan, sitä todennäköisemmin saat sen ennen lämmityskauden alkua. Talvella tehty nuohous viime hetkellä tarkoittaa usein pidempää odotusta ja vähemmän valinnanvaraa tekijän suhteen.`,
    ], {
      mitaItse: "kertyikö viime talvena nokea tavallista enemmän, tai onko vedossa ollut muutoksia.",
      milloinAmm: "jos lämmityskausi on jo alkamassa eikä nuohousta ole tehty, kannattaa varata aika mahdollisimman pian.",
      cta: "Varaa nuohous ennen syksyn ruuhkaa",
    }, ctaUrl);
  };
}

function wrap(
  otsikko: string,
  etunimi: string,
  kappaleet: string[],
  info: { mitaItse: string; milloinAmm: string; cta: string },
  ctaUrl: string,
) {
  const kpl = kappaleet.map((k) => `<p style="margin:0 0 14px; font-size:14px; line-height:1.65; color:#333;">${esc(k)}</p>`).join("");
  return `
<div style="font-family:-apple-system,Segoe UI,sans-serif; max-width:640px; margin:0 auto; padding:24px; color:#1a1a1a; background:#ffffff;">
  <div style="background:#0D1F14; color:#C9A84C; padding:20px 24px; border-radius:8px 8px 0 0;">
    <h2 style="margin:0; font-family:Georgia,serif; font-size:20px;">${esc(otsikko)}</h2>
  </div>
  <div style="border:1px solid #e5e5e5; border-top:none; padding:24px; border-radius:0 0 8px 8px;">
    <p style="margin:0 0 16px; font-size:15px;">Hei ${esc(etunimi)},</p>
    ${kpl}
    <div style="margin:20px 0; padding:14px 16px; background:#f7f7f5; border-left:3px solid #C9A84C; border-radius:4px;">
      <p style="margin:0 0 8px; font-size:13px; color:#0D1F14;"><strong>Mitä voit tarkastaa itse:</strong> <span style="color:#444;">${esc(info.mitaItse)}</span></p>
      <p style="margin:0; font-size:13px; color:#0D1F14;"><strong>Milloin ammattilainen:</strong> <span style="color:#444;">${esc(info.milloinAmm)}</span></p>
    </div>
    <div style="margin-top:24px; text-align:center;">
      <a href="${esc(ctaUrl)}" style="display:inline-block; padding:12px 26px; background:#C9A84C; color:#0D1F14; text-decoration:none; border-radius:6px; font-weight:700; letter-spacing:0.3px;">${esc(info.cta)} →</a>
    </div>
    <p style="margin:24px 0 0; padding-top:16px; border-top:1px solid #e5e5e5; font-size:11px; color:#999; text-align:center;">
      Kotivahti – talokirja ja huoltomuistutukset omakotitaloasujille
    </p>
  </div>
</div>`.trim();
}

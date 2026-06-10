import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  kausi: z.enum(["kevat", "kesa", "syksy", "talvi"]),
  test_email: z.string().email().optional(),
});

export const Route = createFileRoute("/api/public/hooks/laheta-kausikirje")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body;
        try { body = bodySchema.parse(await request.json()); }
        catch { return new Response("Virheellinen pyyntö", { status: 400 }); }

        const [{ supabaseAdmin }, { rakennaKausikirje, KAUSI_TYYPPI }, { lahetaEmail }] = await Promise.all([
          import("@/integrations/supabase/client.server"),
          import("@/lib/kausikirje.server"),
          import("@/lib/email.server"),
        ]);

        const tyyppi = KAUSI_TYYPPI[body.kausi];
        const baseUrl = process.env.PUBLIC_APP_URL ?? "https://kotivahti.fi";

        // Hae kohderyhmä
        const { data: metriikat } = await supabaseAdmin
          .from("kayttaja_metriikat")
          .select("user_id, kausikirje_suostumus, rekisteroity_at")
          .eq("kausikirje_suostumus", true);

        const kahdenViikonRaja = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const kelvolliset = (metriikat ?? []).filter((m: any) =>
          !m.rekisteroity_at || new Date(m.rekisteroity_at).getTime() <= kahdenViikonRaja
        );

        let lahetetty = 0;
        let ohitettu = 0;
        let virheita = 0;

        for (const m of kelvolliset) {
          // Onko jo lähetetty tälle kaudelle (90pv sisällä)?
          const { data: jo } = await supabaseAdmin
            .from("palaute_kyselyt")
            .select("id")
            .eq("user_id", m.user_id)
            .eq("tyyppi", tyyppi)
            .gt("lahetetty_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1);
          if (jo && jo.length > 0) { ohitettu++; continue; }

          const { data: prof } = await supabaseAdmin
            .from("profiles")
            .select("email, nimi")
            .eq("id", m.user_id)
            .maybeSingle();
          if (!prof?.email) { ohitettu++; continue; }

          // PTS-huomio: valitse kiireellisin avoin kohde käyttäjältä
          const { data: kiinteistot } = await supabaseAdmin
            .from("kiinteistot")
            .select("id")
            .eq("user_id", m.user_id);
          const ktIds = (kiinteistot ?? []).map((k: any) => k.id);
          let ptsHuomio: { kohde: string; teksti: string } | null = null;
          if (ktIds.length > 0) {
            const { data: pts } = await supabaseAdmin
              .from("pts_suunnitelma")
              .select("kohde, vuosi, kuvaus")
              .in("kiinteisto_id", ktIds)
              .order("vuosi", { ascending: true })
              .limit(1);
            if (pts && pts.length > 0) {
              ptsHuomio = { kohde: pts[0].kohde, teksti: pts[0].kuvaus ?? `aikataulutettu vuodelle ${pts[0].vuosi}` };
            }
          }

          const { data: kysely, error: kErr } = await supabaseAdmin
            .from("palaute_kyselyt")
            .insert({ user_id: m.user_id, tyyppi })
            .select("token")
            .single();
          if (kErr || !kysely) { virheita++; continue; }

          const etunimi = (prof.nimi ?? prof.email).split(" ")[0];
          const msg = rakennaKausikirje({
            etunimi, kausi: body.kausi, token: kysely.token, baseUrl, ptsHuomio,
          });
          const kohde = body.test_email ?? prof.email;
          const r = await lahetaEmail({ to: kohde, subject: msg.subject, html: msg.html });
          if (r.ok) lahetetty++; else virheita++;

          if (body.test_email) break; // testilähetys lähettää yhden riittää
        }

        return new Response(JSON.stringify({ ok: true, lahetetty, ohitettu, virheita }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

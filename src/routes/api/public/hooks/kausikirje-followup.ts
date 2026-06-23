import { createFileRoute } from "@tanstack/react-router";

// Lähettää 7 päivän muistutussähköpostin niille käyttäjille jotka vastasivat
// kausikirjeeseen "kesken" (huollot vielä tekemättä). Lähetetään korkeintaan
// kerran per kysely — merkitään followup_at-aikaleima vastaukset-jsoniin.
export const Route = createFileRoute("/api/public/hooks/kausikirje-followup")({
  server: {
    handlers: {
      POST: async () => {
        const [{ supabaseAdmin }, { rakennaFollowUpKesken }, { lahetaEmail }] = await Promise.all([
          import("@/integrations/supabase/client.server"),
          import("@/lib/kausikirje.server"),
          import("@/lib/email.server"),
        ]);

        const baseUrl = process.env.PUBLIC_APP_URL ?? "https://kotivahti.fi";
        const seitsemanPv = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        // Yli 21 päivää vanhoja ei enää muistuteta
        const kolmeViikkoa = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();

        const { data: kyselyt } = await supabaseAdmin
          .from("palaute_kyselyt")
          .select("id, user_id, tyyppi, vastaukset, vastattu_at")
          .like("tyyppi", "kausikirje_%")
          .not("vastattu_at", "is", null)
          .lte("vastattu_at", seitsemanPv)
          .gte("vastattu_at", kolmeViikkoa);

        let lahetetty = 0, ohitettu = 0, virheita = 0;

        for (const k of kyselyt ?? []) {
          const v = (k.vastaukset ?? {}) as any;
          if (v.vastaus !== "kesken") { ohitettu++; continue; }
          if (v.followup_at) { ohitettu++; continue; }

          const { data: prof } = await supabaseAdmin
            .from("profiles").select("email, nimi").eq("id", k.user_id).maybeSingle();
          if (!prof?.email) { ohitettu++; continue; }

          const kausi = String(k.tyyppi).replace(/^kausikirje_/, "") as
            "kevat" | "kesa" | "syksy" | "talvi";
          const etunimi = (prof.nimi ?? prof.email).split(" ")[0];

          const msg = rakennaFollowUpKesken(etunimi, kausi, baseUrl);
          const r = await lahetaEmail({ to: prof.email, subject: msg.subject, html: msg.html });
          if (!r.ok) { virheita++; continue; }

          await supabaseAdmin.from("palaute_kyselyt")
            .update({ vastaukset: { ...v, followup_at: new Date().toISOString() } })
            .eq("id", k.id);
          lahetetty++;
        }

        return new Response(JSON.stringify({ ok: true, lahetetty, ohitettu, virheita }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

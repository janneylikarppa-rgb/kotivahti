import { createFileRoute } from "@tanstack/react-router";

// Aamukoonti yön aikana saapuneista liideistä. pg_cron kutsuu 05:00 ja 06:00 UTC;
// lähetetään vain kun Europe/Helsinki-kello on 08:xx (kesä/talviaika huomioitu).
export const Route = createFileRoute("/api/public/hooks/liidi-aamukoonti")({
  server: {
    handlers: {
      POST: async () => {
        const [{ supabaseAdmin }, { lahetaAamukoonti, onkoAamukoontiAika }] = await Promise.all([
          import("@/integrations/supabase/client.server"),
          import("@/lib/liidi-agentti.server"),
        ]);

        if (!onkoAamukoontiAika()) {
          return new Response(JSON.stringify({ ok: true, ohitettu: "ei_aamukoonti_aika" }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const tulos = await lahetaAamukoonti(supabaseAdmin);
          return new Response(JSON.stringify({ ok: true, ...tulos }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          console.error("Aamukoonti epäonnistui", e);
          return new Response(JSON.stringify({ ok: false, error: e?.message ?? "virhe" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});

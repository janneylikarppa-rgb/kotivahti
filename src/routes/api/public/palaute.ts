import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  token: z.string().uuid(),
  vastaus: z.string().min(1).max(100),
  kausi: z.string().max(20).optional(),
});

export const Route = createFileRoute("/api/public/palaute")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return new Response("Virheellinen pyyntö", { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: kysely, error: hErr } = await supabaseAdmin
          .from("palaute_kyselyt")
          .select("id, vastattu_at, token_voimassa")
          .eq("token", parsed.token)
          .maybeSingle();
        if (hErr || !kysely) {
          return new Response(JSON.stringify({ error: "ei_loytynyt" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }
        if (kysely.token_voimassa && new Date(kysely.token_voimassa).getTime() < Date.now()) {
          return new Response(JSON.stringify({ error: "token_expired" }), { status: 410, headers: { "Content-Type": "application/json" } });
        }
        if (kysely.vastattu_at) {
          return new Response(JSON.stringify({ ok: true, already: true }), { headers: { "Content-Type": "application/json" } });
        }

        const { error: uErr } = await supabaseAdmin
          .from("palaute_kyselyt")
          .update({
            vastattu_at: new Date().toISOString(),
            vastaukset: { vastaus: parsed.vastaus, kausi: parsed.kausi ?? null },
          })
          .eq("id", kysely.id);
        if (uErr) return new Response(uErr.message, { status: 500 });

        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
      },
    },
  },
});

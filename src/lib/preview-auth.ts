import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const AUTH_BYPASS_ENABLED = import.meta.env.DEV;

async function getPreviewUserId(supabase: any) {
  const { data: kiinteisto } = await supabase
    .from("kiinteistot")
    .select("user_id")
    .eq("aktiivinen", true)
    .limit(1)
    .maybeSingle();
  if (kiinteisto?.user_id) return kiinteisto.user_id as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (profile?.id) return profile.id as string;

  throw new Error("Esikatselutilaan ei löytynyt käyttäjää");
}

export const requirePreviewOrSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("Backend-yhteyden asetukset puuttuvat");
    }

    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.auth.getClaims(token);
      if (error || !data?.claims?.sub) throw new Error("Unauthorized: Invalid token");
      return next({ context: { supabase, userId: data.claims.sub, claims: data.claims } });
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("Unauthorized: No authorization header provided");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = await getPreviewUserId(supabaseAdmin);
    const now = Math.floor(Date.now() / 1000);
    const claims: any = {
      iss: "preview",
      sub: userId,
      aud: "authenticated",
      exp: now + 60 * 60,
      iat: now,
      role: "authenticated",
      aal: "aal1",
      session_id: "preview",
      preview: true,
    };
    return next({ context: { supabase: supabaseAdmin as any, userId, claims } });
  },
);
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

let cachedSession: Session | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (initialized) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { data } = await supabase.auth.getSession();
    cachedSession = data.session;
    initialized = true;
    supabase.auth.onAuthStateChange((_event, session) => {
      cachedSession = session;
      initialized = true;
    });
  })();
  return initPromise;
}

/** Synchronous read; returns undefined before first init. */
export function getCachedSession(): Session | null | undefined {
  return initialized ? cachedSession : undefined;
}

/** Awaits initial session restore on first call; sync thereafter. */
export async function getReadySession(): Promise<Session | null> {
  if (!initialized) await ensureInit();
  return cachedSession;
}

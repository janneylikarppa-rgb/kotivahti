import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

let cachedSession: Session | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;
let listenerStarted = false;
const listeners = new Set<(session: Session | null) => void>();

function notify() {
  listeners.forEach((listener) => listener(cachedSession));
}

function startListener() {
  if (listenerStarted || typeof window === "undefined") return;
  listenerStarted = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedSession = session;
    notify();
  });
}

function ensureInit(): Promise<void> {
  if (initialized) return Promise.resolve();
  if (initPromise) return initPromise;
  startListener();
  initPromise = (async () => {
    const { data } = await supabase.auth.getSession();
    cachedSession = data.session;
    initialized = true;
    notify();
  })();
  return initPromise;
}

/** Synchronous read; returns undefined before first init. */
export function getCachedSession(): Session | null | undefined {
  return initialized ? cachedSession : undefined;
}

export function hasPersistedSessionHint(): boolean {
  if (typeof window === "undefined") return false;
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i) ?? "";
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) return true;
  }
  return false;
}

/** Awaits initial session restore on first call; sync thereafter. */
export async function getReadySession(): Promise<Session | null> {
  if (!initialized) await ensureInit();
  return cachedSession;
}

export function subscribeToSession(listener: (session: Session | null) => void) {
  startListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

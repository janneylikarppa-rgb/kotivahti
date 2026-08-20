import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const DISMISS_KEY = "kotiluotsi_install_banner_dismissed";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos && isSafari;
}

export function AsennaBanner() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      localStorage.setItem(DISMISS_KEY, "1");
      setPromptEvent(null);
      setShowIosHint(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    if (isIosSafari()) setShowIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const visible = !!promptEvent || showIosHint;
  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setPromptEvent(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    dismiss();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 no-print">
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <img
          src="/icons/icon-192.png"
          alt="Kotiluotsi-sovelluksen kuvake"
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 shrink-0 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Lisää Kotiluotsi kotinäytölle</p>
          {promptEvent ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Avaa talokirjasi yhdellä napautuksella kuin sovelluksena.
            </p>
          ) : (
            <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              Napauta selaimen jakokuvaketta
              <Share className="inline h-3.5 w-3.5" aria-hidden />
              ja valitse "Lisää Koti-valikkoon".
            </p>
          )}
          {promptEvent && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={install}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-[color:var(--gold-2)]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Asenna
              </button>
              <button
                onClick={dismiss}
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Ei nyt
              </button>
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Sulje asennusbanneri"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

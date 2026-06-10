import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { haeAktiivinenKysely, vastaaKyselyyn, type AktiivinenKysely } from "@/lib/palaute.functions";

const OHITETUT_AVAIN = "kotivahti_palaute_ohitettu";

function ohitetut(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(sessionStorage.getItem(OHITETUT_AVAIN) || "[]")); } catch { return new Set(); }
}
function ohitaSessio(id: string) {
  if (typeof window === "undefined") return;
  const s = ohitetut(); s.add(id);
  sessionStorage.setItem(OHITETUT_AVAIN, JSON.stringify(Array.from(s)));
}

export function PalauteKortti() {
  const haeFn = useServerFn(haeAktiivinenKysely);
  const vastFn = useServerFn(vastaaKyselyyn);
  const qc = useQueryClient();
  const { data: kysely } = useQuery<AktiivinenKysely>({
    queryKey: ["aktiivinen-kysely"],
    queryFn: () => haeFn(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const [auki, setAuki] = useState(false);

  useEffect(() => {
    if (kysely?.id && !ohitetut().has(kysely.id)) {
      const t = setTimeout(() => setAuki(true), 600);
      return () => clearTimeout(t);
    }
  }, [kysely?.id]);

  const mut = useMutation({
    mutationFn: (vastaukset: Record<string, any>) => vastFn({ data: { id: kysely!.id, vastaukset } }),
    onSuccess: () => {
      toast.success("Kiitos palautteestasi!");
      setAuki(false);
      qc.invalidateQueries({ queryKey: ["aktiivinen-kysely"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!kysely || !auki) return null;

  const sulje = () => { ohitaSessio(kysely.id); setAuki(false); };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[360px] w-[calc(100vw-2rem)] rounded-xl border border-primary/50 bg-[#142A1A] p-4 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
      <button onClick={sulje} aria-label="Sulje" className="absolute right-2 top-2 text-muted-foreground hover:text-cream">
        <X className="h-4 w-4" />
      </button>
      <KyselySisalto kysely={kysely} onVastaa={(v) => mut.mutate(v)} loading={mut.isPending} />
    </div>
  );
}

function KyselySisalto({ kysely, onVastaa, loading }: { kysely: NonNullable<AktiivinenKysely>; onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  switch (kysely.tyyppi) {
    case "onboarding":
      return <ChoiceKysely
        otsikko="Mikä Kotivahdissa toimi parhaiten?"
        kentta="hyoty"
        vaihtoehdot={[
          { v: "yleiskuva", n: "Sain talosta yleiskuvan" },
          { v: "huoltomuistutukset", n: "Huoltomuistutukset" },
          { v: "kuntoarvio", n: "Tilasin kuntoarvion" },
          { v: "muu", n: "Muu" },
        ]}
        onVastaa={onVastaa}
        loading={loading}
      />;
    case "nps":
      return <NpsKysely onVastaa={onVastaa} loading={loading} />;
    case "churn":
      return <ChoiceKysely
        otsikko="Et ole käynyt vähään aikaan – mitä jäit kaipaamaan?"
        kentta="syy"
        vaihtoehdot={[
          { v: "ei_tarvetta", n: "Ei tarvetta juuri nyt" },
          { v: "monimutkainen", n: "Liian monimutkainen" },
          { v: "muu", n: "Muu – kerro mikä" },
        ]}
        onVastaa={onVastaa}
        loading={loading}
        salliKommentti
      />;
    case "liidi_yhteydenotto":
      return <ChoiceKysely
        otsikko="Onko ammattilainen ottanut sinuun yhteyttä?"
        kentta="yhteydenotto"
        vaihtoehdot={[
          { v: "kylla_nopeasti", n: "Kyllä, nopeasti" },
          { v: "kylla_myohemmin", n: "Kyllä, mutta vasta myöhemmin" },
          { v: "ei_ollenkaan", n: "Ei ollenkaan" },
        ]}
        onVastaa={onVastaa}
        loading={loading}
      />;
    case "liidi_tulos":
      return <ChoiceKysely
        otsikko="Vastasiko palvelu tarpeeseesi?"
        kentta="tarve"
        vaihtoehdot={[
          { v: "taysin", n: "Kyllä, täysin" },
          { v: "osittain", n: "Osittain" },
          { v: "ei", n: "Ei" },
          { v: "ei_viela", n: "Työ ei vielä tehty" },
        ]}
        onVastaa={onVastaa}
        loading={loading}
        salliKommentti
      />;
    case "tyonlaatu":
      return <TahdetKysely onVastaa={onVastaa} loading={loading} />;
    default:
      return null;
  }
}

function ChoiceKysely({ otsikko, kentta, vaihtoehdot, onVastaa, loading, salliKommentti }: {
  otsikko: string; kentta: string;
  vaihtoehdot: { v: string; n: string }[];
  onVastaa: (v: Record<string, any>) => void; loading: boolean; salliKommentti?: boolean;
}) {
  const [valinta, setValinta] = useState<string | null>(null);
  const [kommentti, setKommentti] = useState("");
  return (
    <div className="space-y-3 pr-6">
      <h3 className="font-serif text-base text-cream">{otsikko}</h3>
      <div className="flex flex-col gap-1.5">
        {vaihtoehdot.map((v) => (
          <button key={v.v} onClick={() => setValinta(v.v)}
            className={`text-left rounded-md border px-3 py-2 text-sm transition ${
              valinta === v.v ? "border-primary bg-primary/15 text-cream" : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-cream"
            }`}>{v.n}</button>
        ))}
      </div>
      {salliKommentti && valinta && (
        <Textarea rows={2} placeholder="Halutessasi kerro lisää..." value={kommentti} onChange={(e) => setKommentti(e.target.value)} />
      )}
      <Button disabled={!valinta || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({ [kentta]: valinta, ...(kommentti ? { kommentti } : {}) })}>
        {loading ? "Lähetetään..." : "Lähetä"}
      </Button>
    </div>
  );
}

function NpsKysely({ onVastaa, loading }: { onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  const [pisteet, setPisteet] = useState<number | null>(null);
  return (
    <div className="space-y-3 pr-6">
      <h3 className="font-serif text-base text-cream">Suosittelisitko Kotivahtia tutullesi?</h3>
      <p className="text-xs text-muted-foreground">0 = en lainkaan, 10 = ehdottomasti</p>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }).map((_, i) => (
          <button key={i} onClick={() => setPisteet(i)}
            className={`h-8 rounded text-xs font-mono transition ${
              pisteet === i ? "bg-primary text-primary-foreground" : "bg-background/40 text-muted-foreground hover:bg-primary/20 hover:text-cream"
            }`}>{i}</button>
        ))}
      </div>
      <Button disabled={pisteet === null || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({ pisteet })}>
        {loading ? "Lähetetään..." : "Lähetä"}
      </Button>
    </div>
  );
}

function TahdetKysely({ onVastaa, loading }: { onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  const [laatu, setLaatu] = useState<number | null>(null);
  const [kommentti, setKommentti] = useState("");
  return (
    <div className="space-y-3 pr-6">
      <h3 className="font-serif text-base text-cream">Miten ammattilaisen työ sujui?</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setLaatu(n)}
            className={`text-2xl ${laatu !== null && n <= laatu ? "text-primary" : "text-muted-foreground/50"} hover:text-primary`}>
            ★
          </button>
        ))}
      </div>
      <Textarea rows={2} placeholder="Halutessasi kerro tarkemmin..." value={kommentti} onChange={(e) => setKommentti(e.target.value)} />
      <Button disabled={!laatu || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({ laatu, ...(kommentti ? { kommentti } : {}) })}>
        {loading ? "Lähetetään..." : "Lähetä"}
      </Button>
    </div>
  );
}

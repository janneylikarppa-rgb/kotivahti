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
  const [kiitos, setKiitos] = useState(false);

  useEffect(() => {
    if (kysely?.id && !ohitetut().has(kysely.id)) {
      const t = setTimeout(() => setAuki(true), 600);
      return () => clearTimeout(t);
    }
  }, [kysely?.id]);

  const mut = useMutation({
    mutationFn: (vastaukset: Record<string, any>) => vastFn({ data: { id: kysely!.id, vastaukset } }),
    onSuccess: () => {
      setKiitos(true);
      setTimeout(() => {
        setAuki(false);
        setKiitos(false);
        qc.invalidateQueries({ queryKey: ["aktiivinen-kysely"] });
      }, 2000);
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!kysely || !auki) return null;

  const sulje = () => { ohitaSessio(kysely.id); setAuki(false); };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[340px] w-[calc(100vw-2rem)] rounded-xl border border-primary/50 bg-[#142A1A] p-4 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
      {!kiitos && (
        <button onClick={sulje} aria-label="Sulje" className="absolute right-2 top-2 text-muted-foreground hover:text-cream">
          <X className="h-4 w-4" />
        </button>
      )}
      {kiitos ? (
        <div className="py-6 text-center">
          <div className="text-3xl mb-2">🙏</div>
          <p className="font-serif text-base text-cream">Kiitos palautteesta!</p>
        </div>
      ) : (
        <KyselySisalto kysely={kysely} onVastaa={(v) => mut.mutate(v)} loading={mut.isPending} />
      )}
    </div>
  );
}

function KyselySisalto({ kysely, onVastaa, loading }: { kysely: NonNullable<AktiivinenKysely>; onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  switch (kysely.tyyppi) {
    case "onboarding":
      return <OnboardingKysely onVastaa={onVastaa} loading={loading} />;
    case "nps":
      return <NpsKysely onVastaa={onVastaa} loading={loading} />;
    case "churn":
      return <ChurnKysely onVastaa={onVastaa} loading={loading} />;
    case "ydinprosessi_yhteydenotto":
      return <ChoiceKysely
        otsikko="Onko ammattilainen ottanut sinuun yhteyttä?"
        kentta="yhteydenotto"
        vaihtoehdot={[
          { v: "kylla_sovittu", n: "✓ Kyllä – sovittu käynti" },
          { v: "kylla_yhteydessa", n: "✓ Kyllä – oltu yhteydessä" },
          { v: "ei_viela", n: "⏳ Ei vielä" },
          { v: "ei_ollenkaan", n: "✗ Ei ollenkaan" },
        ]}
        onVastaa={onVastaa}
        loading={loading}
      />;
    case "ydinprosessi_kaynnin_jalkeen":
      return <VaiheKaksiKysely onVastaa={onVastaa} loading={loading} />;
    case "ydinprosessi_kokonaiskokemus":
      return <VaiheKolmeKysely onVastaa={onVastaa} loading={loading} />;
    case "tyonlaatu":
      return <TahdetKysely onVastaa={onVastaa} loading={loading} />;
    // legacy fallback
    case "liidi_yhteydenotto":
      return <ChoiceKysely
        otsikko="Onko ammattilainen ottanut sinuun yhteyttä?"
        kentta="yhteydenotto"
        vaihtoehdot={[
          { v: "kylla_nopeasti", n: "Kyllä, nopeasti" },
          { v: "kylla_myohemmin", n: "Kyllä, myöhemmin" },
          { v: "ei_ollenkaan", n: "Ei ollenkaan" },
        ]}
        onVastaa={onVastaa} loading={loading} />;
    case "liidi_tulos":
      return <ChoiceKysely
        otsikko="Vastasiko palvelu tarpeeseesi?"
        kentta="tarve"
        vaihtoehdot={[
          { v: "taysin", n: "Kyllä, täysin" },
          { v: "osittain", n: "Osittain" },
          { v: "ei", n: "Ei" },
        ]}
        onVastaa={onVastaa} loading={loading} salliKommentti />;
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

function OnboardingKysely({ onVastaa, loading }: { onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  const [helppous, setHelppous] = useState<string | null>(null);
  const [ensivaikutelma, setEnsivaikutelma] = useState<number | null>(null);
  const [toive, setToive] = useState("");
  const helppoudet = [
    { v: "todella_helppo", n: "Todella helppoa" },
    { v: "melko_helppo", n: "Melko helppoa" },
    { v: "vaikeaa", n: "Vaikeaa" },
  ];
  return (
    <div className="space-y-3 pr-6">
      <h3 className="font-serif text-base text-cream">Miten kokemuksesi alkoi?</h3>
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Oliko aloittaminen helppoa?</p>
        <div className="flex flex-col gap-1.5">
          {helppoudet.map((v) => (
            <button key={v.v} onClick={() => setHelppous(v.v)}
              className={`text-left rounded-md border px-3 py-1.5 text-sm transition ${
                helppous === v.v ? "border-primary bg-primary/15 text-cream" : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-cream"
              }`}>{v.n}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Ensivaikutelma</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setEnsivaikutelma(n)}
              className={`text-2xl ${ensivaikutelma !== null && n <= ensivaikutelma ? "text-primary" : "text-muted-foreground/50"} hover:text-primary`}>★</button>
          ))}
        </div>
      </div>
      <Textarea rows={2} placeholder="Mitä toivoisit lisää?" value={toive} onChange={(e) => setToive(e.target.value)} />
      <Button disabled={!helppous || !ensivaikutelma || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({ helppous, ensivaikutelma, ...(toive ? { toive } : {}) })}>
        {loading ? "Lähetetään..." : "Lähetä"}
      </Button>
    </div>
  );
}

function NpsKysely({ onVastaa, loading }: { onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  const [pisteet, setPisteet] = useState<number | null>(null);
  const [miksi, setMiksi] = useState("");
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
      {pisteet !== null && (
        <Textarea rows={2} placeholder="Miksi annoit tämän pistemäärän?" value={miksi} onChange={(e) => setMiksi(e.target.value)} />
      )}
      <Button disabled={pisteet === null || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({ pisteet, ...(miksi ? { miksi } : {}) })}>
        {loading ? "Lähetetään..." : "Lähetä"}
      </Button>
    </div>
  );
}

function ChurnKysely({ onVastaa, loading }: { onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  const [valitut, setValitut] = useState<string[]>([]);
  const [muu, setMuu] = useState("");
  const syyt = [
    { v: "ei_tarvetta", n: "Ei tarvetta juuri nyt" },
    { v: "monimutkainen", n: "Liian monimutkainen käyttää" },
    { v: "ei_hyotya", n: "Ei tuntunut hyödylliseltä" },
    { v: "loysin_muualta", n: "Löysin saman muualta" },
    { v: "unohtui", n: "Unohtui kokonaan" },
  ];
  const toggle = (v: string) => setValitut((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
  return (
    <div className="space-y-3 pr-6">
      <h3 className="font-serif text-base text-cream">Et ole käynyt vähään aikaan – mitä jäit kaipaamaan?</h3>
      <p className="text-xs text-muted-foreground">Voit valita useamman</p>
      <div className="flex flex-col gap-1.5">
        {syyt.map((v) => (
          <button key={v.v} onClick={() => toggle(v.v)}
            className={`text-left rounded-md border px-3 py-1.5 text-sm transition ${
              valitut.includes(v.v) ? "border-primary bg-primary/15 text-cream" : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-cream"
            }`}>{v.n}</button>
        ))}
      </div>
      <Textarea rows={2} placeholder="Muu syy – kerro mikä" value={muu} onChange={(e) => setMuu(e.target.value)} />
      <Button disabled={(valitut.length === 0 && !muu.trim()) || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({ syyt: valitut, ...(muu ? { muu } : {}) })}>
        {loading ? "Lähetetään..." : "Lähetä"}
      </Button>
    </div>
  );
}

function VaiheKaksiKysely({ onVastaa, loading }: { onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  const [kavi, setKavi] = useState<string | null>(null);
  const [kommunikointi, setKommunikointi] = useState<number | null>(null);
  const [ensivaikutelma, setEnsivaikutelma] = useState("");
  const k1 = [
    { v: "kylla_kavi", n: "✓ Kyllä, kävi sovitusti" },
    { v: "sovittu_ei_viela", n: "⏳ Käynti sovittu, ei vielä" },
    { v: "peruutettiin", n: "✗ Peruutettiin" },
    { v: "ei_kaynyt_ei_ilmoittanut", n: "✗ Ei käynyt eikä ilmoittanut" },
  ];
  return (
    <div className="space-y-3 pr-6">
      <h3 className="font-serif text-base text-cream">Miten käynti meni?</h3>
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Käviköhän ammattilainen sovitusti?</p>
        <div className="flex flex-col gap-1.5">
          {k1.map((v) => (
            <button key={v.v} onClick={() => setKavi(v.v)}
              className={`text-left rounded-md border px-3 py-1.5 text-sm transition ${
                kavi === v.v ? "border-primary bg-primary/15 text-cream" : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-cream"
              }`}>{v.n}</button>
          ))}
        </div>
      </div>
      {(kavi === "kylla_kavi" || kavi === "sovittu_ei_viela") && (
        <>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Miten kommunikointi ja esittäytyminen sujui?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setKommunikointi(n)}
                  className={`text-2xl ${kommunikointi !== null && n <= kommunikointi ? "text-primary" : "text-muted-foreground/50"} hover:text-primary`}>★</button>
              ))}
            </div>
          </div>
          <Textarea rows={2} placeholder="Vapaa sana ensivaikutelmasta" value={ensivaikutelma} onChange={(e) => setEnsivaikutelma(e.target.value)} />
        </>
      )}
      <Button disabled={!kavi || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({
          kavi,
          ...(kommunikointi ? { kommunikointi } : {}),
          ...(ensivaikutelma ? { ensivaikutelma } : {}),
        })}>
        {loading ? "Lähetetään..." : "Lähetä"}
      </Button>
    </div>
  );
}

function VaiheKolmeKysely({ onVastaa, loading }: { onVastaa: (v: Record<string, any>) => void; loading: boolean }) {
  const [tyo_laatu, setTyoLaatu] = useState<number | null>(null);
  const [hinta, setHinta] = useState<string | null>(null);
  const [aikataulu, setAikataulu] = useState<string | null>(null);
  const [siisteys, setSiisteys] = useState<string | null>(null);
  const [suosittelu, setSuosittelu] = useState<string | null>(null);
  const [kokonaisuus, setKokonaisuus] = useState<string | null>(null);
  const [vapaa, setVapaa] = useState("");

  const radio = (val: string | null, set: (v: string) => void, opts: { v: string; n: string }[]) => (
    <div className="flex flex-col gap-1">
      {opts.map((o) => (
        <button key={o.v} onClick={() => set(o.v)}
          className={`text-left rounded-md border px-3 py-1.5 text-xs transition ${
            val === o.v ? "border-primary bg-primary/15 text-cream" : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-cream"
          }`}>{o.n}</button>
      ))}
    </div>
  );

  const valmis = tyo_laatu && hinta && aikataulu && siisteys && suosittelu && kokonaisuus;

  return (
    <div className="space-y-3 pr-6 max-h-[70vh] overflow-y-auto">
      <h3 className="font-serif text-base text-cream">Kokonaiskokemus työstä</h3>

      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Työn lopputulos (1=ei hyväksyttävä, 5=ylitti odotukset)</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setTyoLaatu(n)}
              className={`text-2xl ${tyo_laatu !== null && n <= tyo_laatu ? "text-primary" : "text-muted-foreground/50"} hover:text-primary`}>★</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Vastasiko hinta laatua?</p>
        {radio(hinta, setHinta, [
          { v: "taysin", n: "Kyllä täysin" }, { v: "melko", n: "Melko hyvin" },
          { v: "ei_oikein", n: "Ei oikein" }, { v: "ei_ollenkaan", n: "Ei ollenkaan" },
        ])}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Pysyikö aikataulu?</p>
        {radio(aikataulu, setAikataulu, [
          { v: "taysin", n: "Kyllä täysin" }, { v: "lahes", n: "Lähes – pieni viive" },
          { v: "merkittava", n: "Ei – merkittävä viive" }, { v: "ei_sovittu", n: "Ei sovittu selkeää aikataulua" },
        ])}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Jättikö kohteen siistiksi?</p>
        {radio(siisteys, setSiisteys, [
          { v: "erinomaisesti", n: "Kyllä erinomaisesti" }, { v: "hyvin", n: "Kyllä hyvin" },
          { v: "kohtalaisesti", n: "Kohtalaisesti" }, { v: "ei_riittavasti", n: "Ei riittävästi" },
        ])}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Suosittelisitko?</p>
        {radio(suosittelu, setSuosittelu, [
          { v: "ehdottomasti", n: "Kyllä ehdottomasti" }, { v: "todennakoisesti", n: "Kyllä todennäköisesti" },
          { v: "en_osaa", n: "En osaa sanoa" }, { v: "en_todennakoisesti", n: "En todennäköisesti" },
          { v: "ei_missaan", n: "En missään tapauksessa" },
        ])}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">Vastasiko palvelu kokonaisuudessaan tarpeeseesi?</p>
        {radio(kokonaisuus, setKokonaisuus, [
          { v: "taysin", n: "Täysin – tekijä löytyi ja työ tehty" }, { v: "osittain", n: "Osittain – jotain jäi" },
          { v: "ei_loytynyt", n: "Ei – ei löytynyt sopivaa tekijää" }, { v: "ei_vastannut", n: "Ei – työ ei vastannut odotuksia" },
        ])}
      </div>

      <Textarea rows={2} placeholder="Mitä haluaisit kertoa kokemuksestasi?" value={vapaa} onChange={(e) => setVapaa(e.target.value)} />

      <Button disabled={!valmis || loading} className="w-full uppercase tracking-wider font-semibold"
        onClick={() => onVastaa({ tyo_laatu, hinta, aikataulu, siisteys, suosittelu, kokonaisuus, ...(vapaa ? { vapaa } : {}) })}>
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

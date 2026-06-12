import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getKuitatut, getPts, kuittaaHuolto } from "@/lib/kotivahti.functions";
import { KAUDET, kaikkiHuollot, PERUSHUOLLOT, dynamicHuollot, type Kausi, type HuoltoRivi } from "@/lib/vuosikello-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ArrowRight, Check, Circle, Info, MinusCircle, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { LiidiDialog } from "@/components/liidi-dialog";
import { arvaaKategoria } from "@/lib/liidit-kategoriat";
import { haeHuoltoInfo, type HuoltoInfo } from "@/lib/huolto-infot";

export const Route = createFileRoute("/_authenticated/vuosikello")({
  component: VuosikelloPage,
});

function autoKausi(): Kausi {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "kevat";
  if (m >= 6 && m <= 8) return "kesa";
  if (m >= 9 && m <= 11) return "syksy";
  return "talvi";
}

type Kuitattu = { kausi_key: string; huolto_nimi: string; tekija: string | null; hinta: number | null };

function VuosikelloPage() {
  const fetchFn = useServerFn(getKuitatut);
  const fetchPts = useServerFn(getPts);
  const kuittaaFn = useServerFn(kuittaaHuolto);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["kuitatut"], queryFn: () => fetchFn() });
  const { data: ptsData } = useQuery({ queryKey: ["pts"], queryFn: () => fetchPts(), staleTime: 30_000 });
  const kuitatut: Kuitattu[] = (data?.kuitatut as Kuitattu[]) ?? [];
  const talon = data?.talon_tiedot ?? null;
  const erapaivat = ((ptsData?.rivit as any[]) ?? []).filter((r) => r.huoltoErapaiva);
  const [kausi, setKausi] = useState<Kausi>(autoKausi());
  const [valittu, setValittu] = useState<string | null>(null);
  const [liidiNimi, setLiidiNimi] = useState<string | null>(null);
  const [infoNimi, setInfoNimi] = useState<string | null>(null);
  const infoData: HuoltoInfo | null = infoNimi ? haeHuoltoInfo(infoNimi) : null;

  const mut = useMutation({
    mutationFn: (v: any) => kuittaaFn({ data: v }),
    onSuccess: () => {
      toast.success("Kuitattu");
      qc.invalidateQueries({ queryKey: ["kuitatut"] });
      qc.invalidateQueries({ queryKey: ["kulut"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["huollot"] });
      setValittu(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const huollot = useMemo(() => kaikkiHuollot(kausi, talon), [kausi, talon]);
  const perus = PERUSHUOLLOT[kausi];
  const dyn = dynamicHuollot(talon)[kausi] ?? [];

  const statusOf = (nimi: string) => kuitatut.find((k) => k.kausi_key === kausi && k.huolto_nimi === nimi);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Vuosikello {new Date().getFullYear()}</p>
        <h1 className="font-serif text-4xl text-cream">Kauden <em className="text-primary not-italic italic">työt</em></h1>
        <p className="mt-3 text-muted-foreground">Kuittaa tehdyt huollot. Kuittaukset nollautuvat vuodenvaihteessa.</p>
      </header>

      {erapaivat.length > 0 && (
        <Card className="gold-card border border-red-500/30">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <p className="eyebrow text-red-300">Huoltoväli täynnä</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Seuraaville kohteille suositeltu huoltoväli on tullut täyteen. Varaa aika tai kuittaa tehdyksi.
            </p>
            <ul className="space-y-2">
              {erapaivat.map((r: any) => (
                <li key={r.kohde} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <div className="flex-1">
                    <span className="text-cream">{r.kohde}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      huoltoväli {r.huoltovali} v
                      {r.viimeisinHuoltoVuosi ? ` · viimeksi ${r.viimeisinHuoltoVuosi}` : " · ei aiempaa merkintää"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild variant="link" className="px-0 text-primary">
              <Link to="/pts">Avaa PTS <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}


      {/* Kausi-välilehdet */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {KAUDET.map((k) => {
          const total = kaikkiHuollot(k.key, talon).length;
          const done = kuitatut.filter((x) => x.kausi_key === k.key).length;
          return (
            <button
              key={k.key}
              onClick={() => setKausi(k.key)}
              className={`flex flex-col items-center gap-1 rounded-md border p-3 transition ${
                kausi === k.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">{k.ikoni}</span>
              <span className="text-xs uppercase tracking-wider">{k.nimi}</span>
              {k.kuukaudet && <span className="text-[10px] text-muted-foreground">{k.kuukaudet}</span>}
              <span className={`text-[10px] font-mono ${done >= total && total > 0 ? "text-primary" : "text-muted-foreground"}`}>{done}/{total}</span>
            </button>
          );
        })}
      </div>

      <Card className="gold-card">
        <CardContent className="pt-6 space-y-6">
          <HuoltoLista
            otsikko="Perushuollot"
            nimet={perus}
            statusOf={statusOf}
            onAvaa={(n) => setValittu(n)}
            onTilaa={(n) => setLiidiNimi(n)}
            onInfo={(n) => setInfoNimi(n)}
          />
          {dyn.length > 0 && (
            <HuoltoLista
              otsikko="Talon tietoihin perustuvat"
              ikoni={<Sparkles className="h-4 w-4 text-primary" />}
              nimet={dyn}
              statusOf={statusOf}
              onAvaa={(n) => setValittu(n)}
              onTilaa={(n) => setLiidiNimi(n)}
              onInfo={(n) => setInfoNimi(n)}
            />
          )}
          {huollot.length === 0 && (
            <p className="text-sm text-muted-foreground">Ei huoltokohteita.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!valittu} onOpenChange={(o) => !o && setValittu(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif text-xl">Kuittaa tehdyksi</DialogTitle></DialogHeader>
          {valittu && (
            <KuittausForm
              nimi={valittu}
              onSubmit={(v) => mut.mutate({ kausi_key: kausi, huolto_nimi: valittu, ...v })}
              loading={mut.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <LiidiDialog
        open={!!liidiNimi}
        onOpenChange={(o) => !o && setLiidiNimi(null)}
        esitaytetty={liidiNimi ? {
          palvelu: "huolto",
          kategoria: arvaaKategoria(liidiNimi),
          kuvaus: liidiNimi.toLowerCase().includes("nuohou") && (talon as any)?.hormien_maara
            ? `${liidiNimi}, hormeja ${(talon as any).hormien_maara} kpl${(talon as any)?.hormityyppi ? ` (${(talon as any).hormityyppi})` : ""}`
            : liidiNimi,
        } : undefined}
      />

      <Dialog open={!!infoNimi} onOpenChange={(o) => !o && setInfoNimi(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{infoNimi}</DialogTitle>
          </DialogHeader>
          {infoData ? (
            <div className="space-y-4 text-sm">
              <div>
                <p className="eyebrow mb-1 text-primary">Miksi tämä tehdään</p>
                <p className="text-muted-foreground leading-relaxed">{infoData.miksi}</p>
              </div>
              {infoData.miten && (
                <div>
                  <p className="eyebrow mb-1 text-primary">Miten toimit</p>
                  <p className="text-muted-foreground leading-relaxed">{infoData.miten}</p>
                </div>
              )}
              {infoData.milloinAmmattilainen && (
                <div>
                  <p className="eyebrow mb-1 text-primary">Milloin tilaa ammattilainen</p>
                  <p className="text-muted-foreground leading-relaxed">{infoData.milloinAmmattilainen}</p>
                </div>
              )}
              {infoData.vinkki && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                  <p className="text-xs text-cream"><span className="text-primary font-semibold">Vinkki: </span>{infoData.vinkki}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tälle toimenpiteelle ei ole vielä tarkempaa infopakettia. Lisäämme niitä jatkuvasti.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HuoltoLista({
  otsikko,
  ikoni,
  nimet,
  statusOf,
  onAvaa,
  onTilaa,
  onInfo,
}: {
  otsikko: string;
  ikoni?: React.ReactNode;
  nimet: HuoltoRivi[];
  statusOf: (n: string) => Kuitattu | undefined;
  onAvaa: (n: string) => void;
  onTilaa: (n: string) => void;
  onInfo: (n: string) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-3 flex items-center gap-2">{ikoni} {otsikko}</p>
      <ul className="divide-y divide-border/60">
        {nimet.map((rivi) => {
          const nimi = rivi.nimi;
          const st = statusOf(nimi);
          const done = st && st.tekija !== "jatetaan";
          const skipped = st?.tekija === "jatetaan";
          const onkoInfo = !!haeHuoltoInfo(nimi);
          return (
            <li key={nimi} className="flex items-center gap-3 py-3">
              <button onClick={() => onAvaa(nimi)} className="shrink-0" aria-label="Kuittaa">
                {done ? (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></span>
                ) : skipped ? (
                  <MinusCircle className="h-6 w-6 text-muted-foreground/70" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition" />
                )}
              </button>
              <div className="flex-1">
                <span className={`${done ? "text-muted-foreground line-through" : skipped ? "text-muted-foreground italic" : "text-cream"}`}>
                  {nimi}
                </span>
                {onkoInfo && (
                  <button
                    type="button"
                    onClick={() => onInfo(nimi)}
                    className="ml-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-primary hover:underline align-middle"
                    aria-label="Avaa infopaketti"
                  >
                    <Info className="h-3 w-3" /> Info
                  </button>
                )}
                {rivi.kuvaus && (
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{rivi.kuvaus}</p>
                )}
              </div>
              {rivi.ammattilainen && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onTilaa(nimi)}
                  className="h-7 px-2 text-[11px] uppercase tracking-wider text-primary hover:bg-primary/10"
                >
                  <Send className="mr-1 h-3 w-3" /> Tilaa
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}


function KuittausForm({ nimi, onSubmit, loading }: { nimi: string; onSubmit: (v: any) => void; loading: boolean }) {
  const [tekija, setTekija] = useState<"itse" | "ammattilainen" | "jatetaan">("itse");
  const [tekijaNimi, setTekijaNimi] = useState("");
  const [hinta, setHinta] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          tekija,
          tekija_nimi: tekija === "ammattilainen" ? tekijaNimi.trim() || null : null,
          hinta: tekija === "ammattilainen" ? Number(hinta || 0) : 0,
        });
      }}
      className="space-y-4"
    >
      <p className="text-sm text-muted-foreground">{nimi}</p>
      <div className="space-y-2">
        <Label>Kuka teki?</Label>
        <Select value={tekija} onValueChange={(v: any) => setTekija(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="itse">Tein itse</SelectItem>
            <SelectItem value="ammattilainen">Ammattilainen teki</SelectItem>
            <SelectItem value="jatetaan">Jätetään tekemättä</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {tekija === "ammattilainen" && (
        <>
          <div className="space-y-2">
            <Label>Tekijä / yritys</Label>
            <Input value={tekijaNimi} onChange={(e) => setTekijaNimi(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label>Kustannus (€)</Label>
            <Input type="number" min="0" step="0.01" value={hinta} onChange={(e) => setHinta(e.target.value)} />
          </div>
        </>
      )}
      <Button type="submit" disabled={loading} className="w-full uppercase tracking-wider font-semibold">
        {loading ? "Tallennetaan..." : "Kuittaa"}
      </Button>
    </form>
  );
}

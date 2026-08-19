import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { merkitsePtsAvattu } from "@/lib/palaute.functions";
import {
  addHuolto,
  addPtsRivi,
  deletePtsRivi,
  getPts,
  lykkaaPtsRivi,
  peruLykkays,
} from "@/lib/kotivahti.functions";
import { HuoltoForm } from "@/components/huolto-form";
import { getSisaltoteksti, getYlitetytTeksti } from "@/lib/pts-sisaltotekstit";
import { HUOLTO_KOHDE_RYHMAT } from "@/lib/huolto-kohteet";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Check, Trash2, Wrench, AlertTriangle, Calendar, Clock, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { LiidiDialog } from "@/components/liidi-dialog";
import { arvaaKategoria } from "@/lib/liidit-kategoriat";

export const Route = createFileRoute("/_authenticated/pts")({
  loader: ({ context }) => {
    if (typeof window === "undefined") return null;
    return context.queryClient.ensureQueryData({
      queryKey: ["pts"],
      queryFn: () => getPts(),
      staleTime: 30_000,
    });
  },
  component: PtsPage,
});

const AURINKO_ID = "aurinko-suositus";
const AURINKO_DISMISS_KEY = "kotivahti_aurinko_kuitattu";
const AURINKO_LYKKAYS_KEY = "kotivahti_aurinko_lykatty_asti";

type PtsRivi = {
  id: string;
  lahde: "auto" | "oma";
  kohde: string;
  kategoria: string;
  vuosi: number;
  vuosiaJaljella: number;
  tila: "kiireellinen" | "lahivuosina" | "seurannassa";
  kuvaus?: string | null;
  huoltovali: number;
  ylitettyVuosia?: number;
  lykatty?: boolean;
  lykkaysPeruste?: string | null;
  alkuperainenVuosi?: number;
  huoltoErapaiva?: boolean;
  viimeisinHuoltoVuosi?: number | null;
};

const TILA_META: Record<string, { label: string; emoji: string; chip: string; ring: string }> = {
  kiireellinen: {
    label: "Kiireellinen",
    emoji: "🔴",
    chip: "bg-red-500/15 text-red-300 border-red-500/30",
    ring: "border-red-500/30",
  },
  lahivuosina: {
    label: "Lähivuosina",
    emoji: "🟡",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    ring: "border-amber-500/30",
  },
  seurannassa: {
    label: "Seurannassa",
    emoji: "🟢",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    ring: "border-emerald-500/30",
  },
};

function PtsPage() {
  const fetchFn = useServerFn(getPts);
  const merkitseFn = useServerFn(merkitsePtsAvattu);
  useEffect(() => { merkitseFn().catch(() => {}); }, [merkitseFn]);
  const addFn = useServerFn(addPtsRivi);
  const delFn = useServerFn(deletePtsRivi);
  const huoltoFn = useServerFn(addHuolto);
  const invalidateDelPts = useServerFn(deletePtsRivi);
  const lykkaysFn = useServerFn(lykkaaPtsRivi);
  const peruFn = useServerFn(peruLykkays);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["pts"],
    queryFn: () => fetchFn(),
    staleTime: 30_000,
  });

  const [addOpen, setAddOpen] = useState(false);
  const [kuittaa, setKuittaa] = useState<PtsRivi | null>(null);
  const [lykkaa, setLykkaa] = useState<PtsRivi | null>(null);
  const [liidiRivi, setLiidiRivi] = useState<PtsRivi | null>(null);
  const [aurinkoTick, setAurinkoTick] = useState(0);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["pts"] });
    qc.invalidateQueries({ queryKey: ["huollot"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["kulut"] });
  };

  const addM = useMutation({
    mutationFn: (input: any) => addFn({ data: input }),
    onSuccess: () => {
      toast.success("PTS-rivi lisätty");
      setAddOpen(false);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Poistettu"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const kuittausM = useMutation({
    mutationFn: async (input: { rivi: PtsRivi; values: any }) => {
      await huoltoFn({ data: input.values });
      if (input.rivi.lahde === "oma") {
        await invalidateDelPts({ data: { id: input.rivi.id } });
      }
    },
    onSuccess: () => {
      toast.success("Merkitty tehdyksi – kirjattu huoltohistoriaan");
      setKuittaa(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const lykkaysM = useMutation({
    mutationFn: (input: any) => lykkaysFn({ data: input }),
    onSuccess: () => {
      toast.success("Siirretty eteenpäin – palaa näkyviin sovittuna vuonna");
      setLykkaa(null);
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const peruM = useMutation({
    mutationFn: (kohde: string) => peruFn({ data: { kohde } }),
    onSuccess: () => { toast.success("Siirto peruttu"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading || !data) {
    return <div className="p-6 text-cream/60">Ladataan…</div>;
  }

  const rivitDb: PtsRivi[] = (data?.rivit ?? []) as any;
  const aurinko = (data as any).aurinko;
  const nyt = new Date().getFullYear();
  const aurinkoNakyy = (() => {
    void aurinkoTick;
    if (!aurinko?.suositus) return false;
    if (typeof window === "undefined") return true;
    if (localStorage.getItem(AURINKO_DISMISS_KEY) === "1") return false;
    const lyk = Number(localStorage.getItem(AURINKO_LYKKAYS_KEY) || 0);
    if (lyk && nyt < lyk) return false;
    return true;
  })();
  const aurinkoRivi: PtsRivi | null = aurinkoNakyy ? {
    id: AURINKO_ID,
    lahde: "auto",
    kohde: "Aurinkosähkön kartoitus",
    kategoria: "Aurinkosähkö ja paneelit",
    vuosi: nyt,
    vuosiaJaljella: 0,
    tila: "kiireellinen",
    kuvaus: `Talosi sähkönkulutus viimeisen ${aurinko?.data_kuukausia ?? 0} kuukauden ajalta viittaa siihen, että aurinkosähkö voi olla kannattava investointi. Katon suunta, varjostukset ja rakenne ratkaisevat lopullisen kannattavuuden – paras seuraava askel on ammattilaisen maksuton kartoitus.`,
    huoltovali: 0,
  } : null;
  const rivit: PtsRivi[] = aurinkoRivi ? [aurinkoRivi, ...rivitDb] : rivitDb;
  const ryhmat = {
    kiireellinen: rivit.filter((r) => r.tila === "kiireellinen"),
    lahivuosina: rivit.filter((r) => r.tila === "lahivuosina"),
    seurannassa: rivit.filter((r) => r.tila === "seurannassa"),
  };

  const handleKuittaa = (r: PtsRivi) => {
    if (r.id === AURINKO_ID) {
      localStorage.setItem(AURINKO_DISMISS_KEY, "1");
      setAurinkoTick((t) => t + 1);
      toast.success("Aurinkosuositus piilotettu");
      return;
    }
    setKuittaa(r);
  };
  const handleLykkaa = (r: PtsRivi) => setLykkaa(r);
  const handlePyydaArvio = (r: PtsRivi) => setLiidiRivi(r);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="animate-fade-up space-y-2">
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Pitkän tähtäimen suunnitelma</p>
        <h1 className="font-serif text-3xl text-cream md:text-4xl">
          Pitkän tähtäimen <em className="text-primary not-italic italic">suunnitelma</em>
        </h1>
        <p className="max-w-3xl text-cream/70">
          Seuraavan 10 vuoden suositellut toimenpiteet. Perustuu talosi tietoihin
          ja RT-kortiston käyttöikätaulukoihin – sekä omiin lisäyksiisi.
        </p>
      </header>

      {data.talonTiedotPuuttuu && (
        <Card className="gold-card border-amber-500/30">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <div>
                <div className="font-medium text-cream">Täydennä talon tiedot</div>
                <div className="text-sm text-cream/60">
                  PTS-ennusteet tarkentuvat kun täytät lämmitysmuodon, kattomateriaalin ja muut perustiedot.
                </div>
              </div>
            </div>
            <Button asChild variant="secondary">
              <Link to="/talon-tiedot">Talon tiedot</Link>
            </Button>
          </CardContent>
        </Card>
      )}






      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden md:grid grid-cols-3 gap-2">
          <RyhmaPill tila="kiireellinen" count={ryhmat.kiireellinen.length} />
          <RyhmaPill tila="lahivuosina" count={ryhmat.lahivuosina.length} />
          <RyhmaPill tila="seurannassa" count={ryhmat.seurannassa.length} />
        </div>
        <div className="ml-auto">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Lisää oma PTS-rivi</Button>
            </DialogTrigger>
            <LisaaRiviDialog onSubmit={(v) => addM.mutate(v)} />
          </Dialog>
        </div>
      </div>

      <RyhmaOsio
        otsikko="🔴 Kiireellinen"
        rivit={ryhmat.kiireellinen}
        onKuittaa={handleKuittaa}
        onLykkaa={handleLykkaa}
        onPeruLykkays={(k) => peruM.mutate(k)}
        onDelete={(id) => delM.mutate(id)}
        onPyydaArvio={handlePyydaArvio}
        tyhja="Ei kiireellisiä toimenpiteitä – hienoa työtä!"
        defaultOpen
      />
      <RyhmaOsio
        otsikko="🟡 Lähivuosina"
        rivit={ryhmat.lahivuosina}
        onKuittaa={handleKuittaa}
        onLykkaa={handleLykkaa}
        onPeruLykkays={(k) => peruM.mutate(k)}
        onDelete={(id) => delM.mutate(id)}
        onPyydaArvio={handlePyydaArvio}
        tyhja="Ei toimenpiteitä lähivuosille."
      />
      <RyhmaOsio
        otsikko="🟢 Seurannassa"
        rivit={ryhmat.seurannassa}
        onKuittaa={handleKuittaa}
        onLykkaa={handleLykkaa}
        onPeruLykkays={(k) => peruM.mutate(k)}
        onDelete={(id) => delM.mutate(id)}
        onPyydaArvio={handlePyydaArvio}
        tyhja="Ei seurattavia kohteita 10 vuoden ikkunassa."
      />

      <Dialog open={!!kuittaa} onOpenChange={(o) => !o && setKuittaa(null)}>
        {kuittaa && (
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Kuittaa tehdyksi: {kuittaa.kohde}</DialogTitle>
            </DialogHeader>
            <HuoltoForm
              lockKohde
              initial={{ tyyppi: "huolto", kohde: kuittaa.kohde, kategoria: "PTS" }}
              loading={kuittausM.isPending}
              submitLabel="Kuittaa tehdyksi"
              invalidate={invalidate}
              onSubmit={(values) => kuittausM.mutateAsync({ rivi: kuittaa, values })}
            />
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!lykkaa} onOpenChange={(o) => !o && setLykkaa(null)}>
        {lykkaa && (
          <LykkaysDialog
            rivi={lykkaa}
            onSubmit={(v) => {
              if (lykkaa.id === AURINKO_ID) {
                const uusi = new Date().getFullYear() + v.vuosia;
                localStorage.setItem(AURINKO_LYKKAYS_KEY, String(uusi));
                setAurinkoTick((t) => t + 1);
                setLykkaa(null);
                toast.success(`Aurinkosuositus siirretty vuoteen ${uusi}`);
                return;
              }
              lykkaysM.mutate({
                ...v,
                kohde: lykkaa.kohde,
                lahde: lykkaa.lahde,
                rivi_id: lykkaa.id,
              });
            }}
          />
        )}
      </Dialog>

      <LiidiDialog
        open={!!liidiRivi}
        onOpenChange={(o) => !o && setLiidiRivi(null)}
        esitaytetty={liidiRivi ? (
          liidiRivi.id === AURINKO_ID ? {
            palvelu: "kuntoarvio",
            kategoria: "Aurinkosähkö ja paneelit",
            kuvaus: "Aurinkosähkökartoitus",
            lukitseKategoria: true,
          } : {
            palvelu: "kuntoarvio",
            kategoria: arvaaKategoria(liidiRivi.kohde),
            kuvaus: `PTS-suunnitelma suosittelee kuntoarviota: ${liidiRivi.kohde}, arvioitu toimenpidevuosi ${liidiRivi.vuosi}.`,
            pts_kohde: liidiRivi.kohde,
            lukitseKategoria: false,
          }
        ) : undefined}
      />
    </div>
  );
}

function RyhmaPill({ tila, count }: { tila: keyof typeof TILA_META; count: number }) {
  const m = TILA_META[tila];
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${m.chip}`}>
      <span className="mr-1">{m.emoji}</span>
      <span className="font-medium">{m.label}</span>
      <span className="ml-2 opacity-70">{count}</span>
    </div>
  );
}

function RyhmaOsio({
  otsikko, rivit, onKuittaa, onLykkaa, onPeruLykkays, onDelete, onPyydaArvio, tyhja, defaultOpen,
}: {
  otsikko: string;
  rivit: PtsRivi[];
  onKuittaa: (r: PtsRivi) => void;
  onLykkaa: (r: PtsRivi) => void;
  onPeruLykkays: (kohde: string) => void;
  onDelete: (id: string) => void;
  onPyydaArvio: (r: PtsRivi) => void;
  tyhja: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-cream/10 bg-cream/5 px-4 py-3 text-left text-cream hover:bg-cream/10"
      >
        <span className="font-serif text-lg">{otsikko} <span className="text-cream/50">({rivit.length})</span></span>
        <span className="text-cream/50">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="grid gap-3">
          {rivit.length === 0 ? (
            <div className="rounded-md border border-dashed border-cream/10 p-6 text-center text-sm text-cream/50">{tyhja}</div>
          ) : (
            rivit.map((r) => (
              <PtsKortti
                key={r.id}
                rivi={r}
                onKuittaa={onKuittaa}
                onLykkaa={onLykkaa}
                onPeruLykkays={onPeruLykkays}
                onDelete={onDelete}
                onPyydaArvio={onPyydaArvio}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function PtsKortti({
  rivi, onKuittaa, onLykkaa, onPeruLykkays, onDelete, onPyydaArvio,
}: {
  rivi: PtsRivi;
  onKuittaa: (r: PtsRivi) => void;
  onLykkaa: (r: PtsRivi) => void;
  onPeruLykkays: (kohde: string) => void;
  onDelete: (id: string) => void;
  onPyydaArvio: (r: PtsRivi) => void;
}) {
  const m = TILA_META[rivi.tila];
  const ylitetty = rivi.ylitettyVuosia && rivi.ylitettyVuosia > 2;
  const teksti = ylitetty
    ? getYlitetytTeksti(rivi.kohde)
    : rivi.kuvaus || getSisaltoteksti(rivi.kohde, rivi.tila);

  return (
    <Card className={`gold-card border ${m.ring}`}>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-serif text-xl text-cream">{rivi.kohde}</div>
            <div className="text-xs uppercase tracking-wide text-cream/50">{rivi.kategoria}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-md border px-2 py-1 text-xs ${m.chip}`}>{m.emoji} {m.label}</span>
            <span className="flex items-center gap-1 rounded-md border border-cream/15 bg-cream/5 px-2 py-1 text-xs text-cream/80">
              <Calendar className="h-3 w-3" /> {rivi.vuosi}
              {rivi.vuosiaJaljella > 0 ? <span className="ml-1 opacity-70">(+{rivi.vuosiaJaljella}v)</span> : <span className="ml-1 opacity-70">(nyt)</span>}
            </span>
          </div>
        </div>
        {rivi.lykatty && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Siirretty eteenpäin
              {rivi.alkuperainenVuosi ? ` (alkuperäinen suositus ${rivi.alkuperainenVuosi})` : ""}
              {rivi.lykkaysPeruste ? ` – ${rivi.lykkaysPeruste}` : ""}
            </span>
            {rivi.lahde === "auto" && (
              <Button size="sm" variant="ghost" className="ml-auto h-6 px-2 text-amber-200 hover:text-amber-100" onClick={() => onPeruLykkays(rivi.kohde)}>
                <Undo2 className="mr-1 h-3 w-3" /> Peru siirto
              </Button>
            )}
          </div>
        )}
        {rivi.huoltoErapaiva && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              Huoltoväli ({rivi.huoltovali} v) on täynnä – määräaikainen huolto on ajankohtainen.
              {rivi.viimeisinHuoltoVuosi
                ? ` Viimeisin huoltomerkintä vuodelta ${rivi.viimeisinHuoltoVuosi}.`
                : " Huoltohistoriasta ei löydy aiempaa merkintää."}
            </span>
          </div>
        )}
        <p className="text-sm leading-relaxed text-cream/75">{teksti}</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onKuittaa(rivi)}>
            <Check className="mr-1 h-4 w-4" /> Kuittaa tehdyksi
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onLykkaa(rivi)}>
            <Clock className="mr-1 h-4 w-4" /> Siirrä eteenpäin
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onPyydaArvio(rivi)}>
            <Wrench className="mr-1 h-4 w-4" /> Pyydä kuntoarviota
          </Button>
          {rivi.lahde === "oma" && (
            <Button size="sm" variant="ghost" className="ml-auto text-cream/60 hover:text-red-300" onClick={() => onDelete(rivi.id)}>
              <Trash2 className="mr-1 h-4 w-4" /> Poista
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LisaaRiviDialog({ onSubmit }: { onSubmit: (v: { vuosi: number; kohde: string; kuvaus?: string }) => void }) {
  const nyt = new Date().getFullYear();
  const [vuosi, setVuosi] = useState(nyt + 1);
  const [kohde, setKohde] = useState("");
  const [kuvaus, setKuvaus] = useState("");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Lisää oma PTS-rivi</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Vuosi</Label>
          <Input type="number" min={nyt} max={nyt + 20} value={vuosi} onChange={(e) => setVuosi(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label>Kohde</Label>
          <Select value={kohde} onValueChange={setKohde}>
            <SelectTrigger><SelectValue placeholder="Valitse kohde" /></SelectTrigger>
            <SelectContent>
              {HUOLTO_KOHDE_RYHMAT.map((r) => (
                <SelectGroup key={r.ryhma}>
                  <SelectLabel>{r.ryhma}</SelectLabel>
                  {r.kohteet.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Kuvaus (vapaaehtoinen)</Label>
          <Textarea value={kuvaus} onChange={(e) => setKuvaus(e.target.value)} placeholder="Esim. terassi maalataan ja korjataan tolpat" />
        </div>
        <Button
          className="w-full"
          disabled={!kohde}
          onClick={() => onSubmit({ vuosi, kohde, kuvaus: kuvaus || undefined })}
        >Tallenna</Button>
      </div>
    </DialogContent>
  );
}


function LykkaysDialog({
  rivi, onSubmit,
}: {
  rivi: PtsRivi;
  onSubmit: (v: { vuosia: number; peruste?: string | null }) => void;
}) {
  const [vuosia, setVuosia] = useState(2);
  const [peruste, setPeruste] = useState("");
  const nyt = new Date().getFullYear();
  const pohjaVuosi = Math.max(rivi.vuosi, nyt);
  const uusiVuosi = pohjaVuosi + vuosia;
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Siirrä eteenpäin: {rivi.kohde}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-cream/70">
          Toimenpide piilotetaan listalta ja palaa automaattisesti näkyviin valitun vuosimäärän kuluttua.
        </p>
        <div className="grid gap-2">
          <Label>Kuinka monta vuotta eteenpäin?</Label>
          <Input type="number" min={1} max={30} value={vuosia} onChange={(e) => setVuosia(Math.max(1, Number(e.target.value) || 1))} />
          <div className="text-xs text-cream/60">
            Uusi suositusvuosi: <span className="text-cream">{uusiVuosi}</span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Perustelu (vapaaehtoinen)</Label>
          <Textarea value={peruste} onChange={(e) => setPeruste(e.target.value)} placeholder="Esim. tarkastettu, ei tarvetta vielä – katsotaan uudestaan parin vuoden päästä" />
        </div>
        <Button className="w-full" onClick={() => onSubmit({ vuosia, peruste: peruste || null })}>
          <Clock className="mr-2 h-4 w-4" /> Siirrä
        </Button>
      </div>
    </DialogContent>
  );
}

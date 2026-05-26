import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  addPtsRivi,
  deletePtsRivi,
  getPts,
  kuittaaPtsRivi,
  lykkaaPtsRivi,
  peruLykkays,
} from "@/lib/kotivahti.functions";
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
  const addFn = useServerFn(addPtsRivi);
  const delFn = useServerFn(deletePtsRivi);
  const kuittausFn = useServerFn(kuittaaPtsRivi);
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
    mutationFn: (input: any) => kuittausFn({ data: input }),
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

  const rivit: PtsRivi[] = (data?.rivit ?? []) as any;
  const ryhmat = {
    kiireellinen: rivit.filter((r) => r.tila === "kiireellinen"),
    lahivuosina: rivit.filter((r) => r.tila === "lahivuosina"),
    seurannassa: rivit.filter((r) => r.tila === "seurannassa"),
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        <div className="eyebrow">4.4 PTS-suunnitelma</div>
        <h1 className="font-serif text-3xl text-cream md:text-4xl">
          Pitkän tähtäimen suunnitelma
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
        onKuittaa={setKuittaa}
        onLykkaa={setLykkaa}
        onPeruLykkays={(k) => peruM.mutate(k)}
        onDelete={(id) => delM.mutate(id)}
        tyhja="Ei kiireellisiä toimenpiteitä – hienoa työtä!"
        defaultOpen
      />
      <RyhmaOsio
        otsikko="🟡 Lähivuosina"
        rivit={ryhmat.lahivuosina}
        onKuittaa={setKuittaa}
        onLykkaa={setLykkaa}
        onPeruLykkays={(k) => peruM.mutate(k)}
        onDelete={(id) => delM.mutate(id)}
        tyhja="Ei toimenpiteitä lähivuosille."
      />
      <RyhmaOsio
        otsikko="🟢 Seurannassa"
        rivit={ryhmat.seurannassa}
        onKuittaa={setKuittaa}
        onLykkaa={setLykkaa}
        onPeruLykkays={(k) => peruM.mutate(k)}
        onDelete={(id) => delM.mutate(id)}
        tyhja="Ei seurattavia kohteita 10 vuoden ikkunassa."
      />

      <Dialog open={!!kuittaa} onOpenChange={(o) => !o && setKuittaa(null)}>
        {kuittaa && (
          <KuittausDialog
            rivi={kuittaa}
            onSubmit={(v) => kuittausM.mutate({ ...v, kohde: kuittaa.kohde, lahde: kuittaa.lahde, rivi_id: kuittaa.lahde === "oma" ? kuittaa.id : null })}
          />
        )}
      </Dialog>

      <Dialog open={!!lykkaa} onOpenChange={(o) => !o && setLykkaa(null)}>
        {lykkaa && (
          <LykkaysDialog
            rivi={lykkaa}
            onSubmit={(v) => lykkaysM.mutate({
              ...v,
              kohde: lykkaa.kohde,
              lahde: lykkaa.lahde,
              rivi_id: lykkaa.lahde === "oma" ? lykkaa.id : null,
            })}
          />
        )}
      </Dialog>
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
  otsikko, rivit, onKuittaa, onLykkaa, onPeruLykkays, onDelete, tyhja, defaultOpen,
}: {
  otsikko: string;
  rivit: PtsRivi[];
  onKuittaa: (r: PtsRivi) => void;
  onLykkaa: (r: PtsRivi) => void;
  onPeruLykkays: (kohde: string) => void;
  onDelete: (id: string) => void;
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
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function PtsKortti({
  rivi, onKuittaa, onLykkaa, onPeruLykkays, onDelete,
}: {
  rivi: PtsRivi;
  onKuittaa: (r: PtsRivi) => void;
  onLykkaa: (r: PtsRivi) => void;
  onPeruLykkays: (kohde: string) => void;
  onDelete: (id: string) => void;
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
          <Button size="sm" variant="secondary" onClick={() => toast.info("Ammattilaisen tilaus tulee pian käyttöön")}>
            <Wrench className="mr-1 h-4 w-4" /> Tilaa ammattilainen
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

function KuittausDialog({ rivi, onSubmit }: { rivi: PtsRivi; onSubmit: (v: any) => void }) {
  const [pvm, setPvm] = useState(new Date().toISOString().slice(0, 10));
  const [tekija, setTekija] = useState<"itse" | "ammattilainen">("itse");
  const [tekijaNimi, setTekijaNimi] = useState("");
  const [kustannus, setKustannus] = useState(0);
  const [kuvaus, setKuvaus] = useState("");
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Kuittaa tehdyksi: {rivi.kohde}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Päivämäärä</Label>
          <Input type="date" value={pvm} onChange={(e) => setPvm(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Tekijä</Label>
          <Select value={tekija} onValueChange={(v) => setTekija(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="itse">Itse</SelectItem>
              <SelectItem value="ammattilainen">Ammattilainen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {tekija === "ammattilainen" && (
          <div className="grid gap-2">
            <Label>Tekijän nimi</Label>
            <Input value={tekijaNimi} onChange={(e) => setTekijaNimi(e.target.value)} placeholder="Yritys / henkilö" />
          </div>
        )}
        <div className="grid gap-2">
          <Label>Kustannus € (vapaaehtoinen)</Label>
          <Input type="number" min={0} step="0.01" value={kustannus} onChange={(e) => setKustannus(Number(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <Label>Kuvaus</Label>
          <Textarea value={kuvaus} onChange={(e) => setKuvaus(e.target.value)} placeholder="Mitä tehtiin?" />
        </div>
        <Button className="w-full" onClick={() => onSubmit({ pvm, tekija, tekija_nimi: tekijaNimi || null, kustannus, kuvaus: kuvaus || null })}>
          <Check className="mr-2 h-4 w-4" /> Tallenna
        </Button>
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

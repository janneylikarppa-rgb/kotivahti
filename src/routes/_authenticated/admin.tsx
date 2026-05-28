import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  getAdminLiidit,
  paivitaLiidinStatus,
  getAmmattilaiset,
  lisaaAmmattilainen,
  paivitaAmmattilainen,
  poistaAmmattilainen,
  getLiidiAsetukset,
  paivitaLiidiAsetukset,
  onkoAdmin,
} from "@/lib/liidit.functions";
import { LIIDI_KATEGORIAT, LIIDI_STATUKSET } from "@/lib/liidit-kategoriat";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const adminFn = useServerFn(onkoAdmin);
  const { data: adminCheck, isLoading } = useQuery({ queryKey: ["onko-admin"], queryFn: () => adminFn() });

  if (isLoading) return <p className="text-muted-foreground">Tarkistetaan oikeuksia...</p>;
  if (!adminCheck?.admin) {
    return (
      <Card className="gold-card">
        <CardContent className="py-12 text-center">
          <p className="text-cream font-serif text-xl">Ei käyttöoikeuksia</p>
          <p className="mt-2 text-sm text-muted-foreground">Vain ylläpitäjät pääsevät tälle sivulle.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Admin</p>
        <h1 className="font-serif text-4xl text-cream">Liidien <em className="text-primary not-italic italic">hallinta</em></h1>
      </header>
      <Tabs defaultValue="liidit">
        <TabsList>
          <TabsTrigger value="liidit">Liidit</TabsTrigger>
          <TabsTrigger value="ammattilaiset">Ammattilaiset</TabsTrigger>
          <TabsTrigger value="asetukset">Asetukset</TabsTrigger>
        </TabsList>
        <TabsContent value="liidit" className="mt-6"><LiiditTab /></TabsContent>
        <TabsContent value="ammattilaiset" className="mt-6"><AmmattilaisetTab /></TabsContent>
        <TabsContent value="asetukset" className="mt-6"><AsetuksetTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function LiiditTab() {
  const fetchFn = useServerFn(getAdminLiidit);
  const updFn = useServerFn(paivitaLiidinStatus);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-liidit"], queryFn: () => fetchFn() });
  const mut = useMutation({
    mutationFn: (v: any) => updFn({ data: v }),
    onSuccess: () => { toast.success("Päivitetty"); qc.invalidateQueries({ queryKey: ["admin-liidit"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if ((data as any[]).length === 0) {
    return <p className="text-muted-foreground">Ei liidejä.</p>;
  }
  return (
    <div className="space-y-2">
      {(data as any[]).map((l) => (
        <Card key={l.id} className="gold-card">
          <CardContent className="py-4 space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-serif text-cream">{l.palvelu}</span>
              <span className="text-sm text-muted-foreground">· {l.kategoria}</span>
              <span className="ml-auto text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("fi-FI")}</span>
            </div>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div><span className="text-muted-foreground">Asiakas:</span> <span className="text-cream">{l.nimi}</span></div>
              <div><span className="text-muted-foreground">Sähköposti:</span> <a className="text-primary" href={`mailto:${l.sahkoposti}`}>{l.sahkoposti}</a></div>
              <div><span className="text-muted-foreground">Puhelin:</span> <a className="text-primary" href={`tel:${l.puhelin}`}>{l.puhelin}</a></div>
              <div><span className="text-muted-foreground">Osoite:</span> <span className="text-cream">{l.osoite ?? "—"}</span></div>
            </div>
            {l.kuvaus && <p className="text-sm text-muted-foreground">{l.kuvaus}</p>}
            {l.lisatieto && <pre className="whitespace-pre-wrap text-xs text-muted-foreground rounded border border-border/60 p-2">{l.lisatieto}</pre>}
            <div className="flex items-center gap-2 pt-2">
              <Label className="text-xs uppercase tracking-wider">Tila</Label>
              <Select value={l.status} onValueChange={(v) => mut.mutate({ id: l.id, status: v })}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LIIDI_STATUKSET.map((s) => <SelectItem key={s.arvo} value={s.arvo}>{s.nimi}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AmmattilaisetTab() {
  const fetchFn = useServerFn(getAmmattilaiset);
  const addFn = useServerFn(lisaaAmmattilainen);
  const updFn = useServerFn(paivitaAmmattilainen);
  const delFn = useServerFn(poistaAmmattilainen);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-ammattilaiset"], queryFn: () => fetchFn() });
  const [open, setOpen] = useState(false);
  const inv = () => qc.invalidateQueries({ queryKey: ["admin-ammattilaiset"] });

  const addM = useMutation({
    mutationFn: (v: any) => addFn({ data: v }),
    onSuccess: () => { toast.success("Lisätty"); inv(); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const updM = useMutation({
    mutationFn: (v: any) => updFn({ data: v }),
    onSuccess: inv,
    onError: (e: any) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Poistettu"); inv(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="uppercase tracking-wider font-semibold"><Plus className="mr-2 h-4 w-4" /> Lisää ammattilainen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif text-2xl">Lisää ammattilainen</DialogTitle></DialogHeader>
            <AmmattilainenForm onSubmit={(v) => addM.mutate(v)} loading={addM.isPending} />
          </DialogContent>
        </Dialog>
      </div>
      {(data as any[]).length === 0 ? (
        <p className="text-muted-foreground">Ei ammattilaisia rekisterissä.</p>
      ) : (
        <div className="space-y-2">
          {(data as any[]).map((a) => (
            <Card key={a.id} className="gold-card">
              <CardContent className="py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-cream">{a.yritys}</div>
                  <div className="text-xs text-muted-foreground">{a.kategoria} · {a.sahkoposti}{a.puhelin ? ` · ${a.puhelin}` : ""}</div>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Aktiivinen
                  <Switch checked={a.aktiivinen} onCheckedChange={(v) => updM.mutate({ id: a.id, aktiivinen: v })} />
                </label>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Poistetaanko?")) delM.mutate(a.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AmmattilainenForm({ onSubmit, loading }: { onSubmit: (v: any) => void; loading: boolean }) {
  const [yritys, setYritys] = useState("");
  const [sahkoposti, setSahkoposti] = useState("");
  const [puhelin, setPuhelin] = useState("");
  const [kategoria, setKategoria] = useState<string>(LIIDI_KATEGORIAT[0]);
  const [prioriteetti, setPrioriteetti] = useState(1);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ yritys: yritys.trim(), sahkoposti: sahkoposti.trim(), puhelin: puhelin.trim() || null, kategoria, prioriteetti, aktiivinen: true });
      }}
    >
      <div className="space-y-2"><Label>Yritys</Label><Input value={yritys} onChange={(e) => setYritys(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Sähköposti</Label><Input type="email" value={sahkoposti} onChange={(e) => setSahkoposti(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Puhelin</Label><Input value={puhelin} onChange={(e) => setPuhelin(e.target.value)} /></div>
      <div className="space-y-2">
        <Label>Kategoria</Label>
        <Select value={kategoria} onValueChange={setKategoria}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {LIIDI_KATEGORIAT.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label>Prioriteetti (1 = ylin)</Label><Input type="number" min={1} max={99} value={prioriteetti} onChange={(e) => setPrioriteetti(Number(e.target.value))} /></div>
      <Button type="submit" disabled={loading} className="w-full uppercase tracking-wider font-semibold">
        {loading ? "Tallennetaan..." : "Tallenna"}
      </Button>
    </form>
  );
}

function AsetuksetTab() {
  const fetchFn = useServerFn(getLiidiAsetukset);
  const saveFn = useServerFn(paivitaLiidiAsetukset);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["liidi-asetukset"], queryFn: () => fetchFn() });
  const mut = useMutation({
    mutationFn: (v: any) => saveFn({ data: v }),
    onSuccess: () => { toast.success("Tallennettu"); qc.invalidateQueries({ queryKey: ["liidi-asetukset"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const paalla = !!(data as any)?.automaatio_paalla;
  return (
    <Card className="gold-card">
      <CardContent className="py-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-serif text-cream">Sähköpostiautomaatio</div>
            <p className="text-xs text-muted-foreground">Kun pois päältä, liidit tallennetaan mutta sähköpostia ei lähetetä.</p>
          </div>
          <Switch checked={paalla} onCheckedChange={(v) => mut.mutate({ automaatio_paalla: v })} />
        </div>
      </CardContent>
    </Card>
  );
}

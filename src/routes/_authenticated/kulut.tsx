import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addKulu, deleteKulu, getKulut, saveAsetukset } from "@/lib/kotivahti.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/kulut")({
  component: KulutPage,
});

const KK = ["Tam", "Hel", "Maa", "Huh", "Tou", "Kes", "Hei", "Elo", "Syy", "Lok", "Mar", "Jou"];
const KATEGORIAT = ["sahko", "vesi", "lammitys", "huolto", "vakuutus", "kiinteistovero", "muu"] as const;
const KAT_LABEL: Record<string, string> = { sahko: "Sähkö", vesi: "Vesi", lammitys: "Lämmitys", huolto: "Huolto", vakuutus: "Vakuutus", kiinteistovero: "Kiinteistövero", muu: "Muu" };

function KulutPage() {
  const fetchFn = useServerFn(getKulut);
  const addFn = useServerFn(addKulu);
  const delFn = useServerFn(deleteKulu);
  const saveAsFn = useServerFn(saveAsetukset);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["kulut"], queryFn: () => fetchFn() });

  const addM = useMutation({
    mutationFn: (v: any) => addFn({ data: v }),
    onSuccess: () => { toast.success("Kulu lisätty"); qc.invalidateQueries({ queryKey: ["kulut"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kulut"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
  const saveM = useMutation({
    mutationFn: (v: any) => saveAsFn({ data: v }),
    onSuccess: () => { toast.success("Asetukset tallennettu"); qc.invalidateQueries({ queryKey: ["kulut"] }); },
  });

  if (isLoading) return <p className="text-muted-foreground">Ladataan...</p>;
  const kulut = data?.kulut ?? [];
  const asetukset = data?.asetukset;
  const nykyinen = new Date().getFullYear();
  const vuodetSaatavilla = Array.from(new Set([nykyinen, ...kulut.map((k: any) => new Date(k.pvm).getFullYear())])).sort((a, b) => b - a);
  const [vuosi, setVuosi] = useStateClient(nykyinen);
  const tamaVuosi = kulut.filter((k: any) => new Date(k.pvm).getFullYear() === vuosi);
  const summa = tamaVuosi.reduce((s: number, k: any) => s + Number(k.summa || 0), 0);

  const perKategoria = KATEGORIAT.map((kat) => ({
    kat: KAT_LABEL[kat],
    summa: tamaVuosi.filter((k: any) => k.kategoria === kat).reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
  }));
  const perKk = Array.from({ length: 12 }, (_, i) => ({
    kk: KK[i],
    summa: tamaVuosi.filter((k: any) => new Date(k.pvm).getMonth() === i).reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Kulujenseuranta</p>
          <h1 className="font-serif text-4xl text-cream">Talon <em className="text-primary not-italic italic">kulut</em></h1>
        </div>
        <Select value={String(vuosi)} onValueChange={(v) => setVuosi(Number(v))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>{vuodetSaatavilla.map((v) => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent>
        </Select>
      </header>

      <Tabs defaultValue="yhteenveto">
        <TabsList>
          <TabsTrigger value="yhteenveto">Yhteenveto</TabsTrigger>
          <TabsTrigger value="kaikki">Kaikki kulut</TabsTrigger>
          <TabsTrigger value="asetukset">Asetukset</TabsTrigger>
        </TabsList>

        <TabsContent value="yhteenveto" className="space-y-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Yhteensä" value={`${summa.toFixed(0)} €`} hi />
            {["sahko", "vesi", "lammitys"].map((kat) => (
              <Stat key={kat} label={KAT_LABEL[kat]}
                    value={`${perKategoria.find((p) => p.kat === KAT_LABEL[kat])!.summa.toFixed(0)} €`} />
            ))}
          </div>
          <Card className="gold-card">
            <CardContent className="pt-6">
              <p className="eyebrow mb-4">Kulut kuukausittain</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={perKk}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="kk" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} cursor={{ fill: "color-mix(in oklab, var(--gold) 8%, transparent)" }} />
                    <Bar dataKey="summa" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kaikki" className="space-y-4 pt-4">
          <div className="flex justify-end">
            <KuluLisaaDialog asetukset={asetukset} onAdd={(v) => addM.mutate(v)} loading={addM.isPending} />
          </div>
          {kulut.length === 0 ? (
            <Card className="gold-card"><CardContent className="py-12 text-center text-muted-foreground">Ei vielä kuluja.</CardContent></Card>
          ) : (
            <Card className="gold-card"><CardContent className="p-0">
              <ul className="divide-y divide-border/60">
                {kulut.map((k: any) => (
                  <li key={k.id} className="flex items-center gap-4 px-4 py-3">
                    <span className="eyebrow w-28 text-muted-foreground">{KAT_LABEL[k.kategoria] || k.kategoria}</span>
                    <div className="flex-1">
                      <p className="text-cream">{k.nimi}</p>
                      <p className="text-xs text-muted-foreground">{new Date(k.pvm).toLocaleDateString("fi-FI")}{k.kwh ? ` · ${k.kwh} kWh` : ""}{k.kulutus_m3 ? ` · ${k.kulutus_m3} m³` : ""}</p>
                    </div>
                    <span className="font-mono text-primary">{Number(k.summa).toFixed(2)} €</span>
                    <Button variant="ghost" size="icon" onClick={() => delM.mutate(k.id)}><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="asetukset" className="pt-4">
          <AsetuksetForm asetukset={asetukset} onSave={(v) => saveM.mutate(v)} loading={saveM.isPending} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, hi }: { label: string; value: string; hi?: boolean }) {
  return (
    <Card className="gold-card"><CardContent className="pt-6">
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 font-serif text-3xl ${hi ? "text-primary" : "text-cream"}`}>{value}</p>
    </CardContent></Card>
  );
}

function KuluLisaaDialog({ asetukset, onAdd, loading }: { asetukset: any; onAdd: (v: any) => void; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const [kat, setKat] = useState<string>("muu");
  const [nimi, setNimi] = useState("");
  const [summa, setSumma] = useState("");
  const [pvm, setPvm] = useState(new Date().toISOString().slice(0, 10));
  const [kwh, setKwh] = useState("");
  const [mittari, setMittari] = useState("");

  const sahkoHinta = asetukset ? (Number(kwh || 0) * (Number(asetukset.sahko_energia_snt || 0) + Number(asetukset.sahko_siirto_snt || 0)) / 100) : 0;
  const edellinen = Number(asetukset?.edellinen_mittarilukema || 0);
  const m3 = mittari ? Math.max(0, Number(mittari) - edellinen) : 0;
  const vesiHinta = asetukset ? m3 * (Number(asetukset.vesi_puhdas_eur_m3 || 0) + Number(asetukset.vesi_jatevesi_eur_m3 || 0)) : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let v: any = { nimi: nimi || KAT_LABEL[kat], kategoria: kat, pvm };
    if (kat === "sahko") { v.kwh = Number(kwh || 0); v.summa = Number(sahkoHinta.toFixed(2)); }
    else if (kat === "vesi") { v.mittarilukema = Number(mittari); v.kulutus_m3 = m3; v.summa = Number(vesiHinta.toFixed(2)); }
    else { v.summa = Number(summa || 0); }
    onAdd(v);
    setOpen(false); setNimi(""); setSumma(""); setKwh(""); setMittari("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="uppercase tracking-wider font-semibold"><Plus className="mr-2 h-4 w-4" /> Lisää kulu</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-serif text-xl">Uusi kulu</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label>Kategoria</Label>
            <Select value={kat} onValueChange={setKat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{KATEGORIAT.map((k) => <SelectItem key={k} value={k}>{KAT_LABEL[k]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Päivämäärä</Label><Input type="date" value={pvm} onChange={(e) => setPvm(e.target.value)} /></div>
            <div className="space-y-2"><Label>Nimi</Label><Input value={nimi} onChange={(e) => setNimi(e.target.value)} placeholder={KAT_LABEL[kat]} /></div>
          </div>

          {kat === "sahko" ? (<>
            <div className="space-y-2"><Label>Kulutus (kWh)</Label><Input type="number" min="0" step="0.01" value={kwh} onChange={(e) => setKwh(e.target.value)} required /></div>
            <p className="text-sm text-muted-foreground">Hinta: <span className="text-primary font-mono">{sahkoHinta.toFixed(2)} €</span> ({(Number(asetukset?.sahko_energia_snt ?? 0) + Number(asetukset?.sahko_siirto_snt ?? 0)).toFixed(2)} snt/kWh)</p>
          </>) : kat === "vesi" ? (<>
            <div className="space-y-2"><Label>Mittarilukema (m³)</Label><Input type="number" min="0" step="0.001" value={mittari} onChange={(e) => setMittari(e.target.value)} required /></div>
            <p className="text-sm text-muted-foreground">Kulutus: {m3.toFixed(2)} m³ · Hinta: <span className="text-primary font-mono">{vesiHinta.toFixed(2)} €</span></p>
            {edellinen > 0 && <p className="text-xs text-muted-foreground">Edellinen lukema: {edellinen}</p>}
          </>) : (
            <div className="space-y-2"><Label>Summa (€)</Label><Input type="number" min="0" step="0.01" value={summa} onChange={(e) => setSumma(e.target.value)} required /></div>
          )}

          <Button type="submit" disabled={loading} className="w-full uppercase tracking-wider font-semibold">
            {loading ? "Tallennetaan..." : "Tallenna"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AsetuksetForm({ asetukset, onSave, loading }: { asetukset: any; onSave: (v: any) => void; loading: boolean }) {
  const [se, setSe] = useState(asetukset?.sahko_energia_snt ?? 10);
  const [ss, setSs] = useState(asetukset?.sahko_siirto_snt ?? 5);
  const [vp, setVp] = useState(asetukset?.vesi_puhdas_eur_m3 ?? 2.5);
  const [vj, setVj] = useState(asetukset?.vesi_jatevesi_eur_m3 ?? 3.5);

  return (
    <Card className="gold-card"><CardContent className="pt-6 space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cream mb-3">Sähkö</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Energia (snt/kWh)</Label><Input type="number" step="0.01" value={se} onChange={(e) => setSe(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Siirto (snt/kWh)</Label><Input type="number" step="0.01" value={ss} onChange={(e) => setSs(Number(e.target.value))} /></div>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg text-cream mb-3">Vesi</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Puhdas vesi (€/m³)</Label><Input type="number" step="0.01" value={vp} onChange={(e) => setVp(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Jätevesi (€/m³)</Label><Input type="number" step="0.01" value={vj} onChange={(e) => setVj(Number(e.target.value))} /></div>
        </div>
      </div>
      <Button onClick={() => onSave({ sahko_energia_snt: se, sahko_siirto_snt: ss, vesi_puhdas_eur_m3: vp, vesi_jatevesi_eur_m3: vj })}
              disabled={loading} className="uppercase tracking-wider font-semibold">
        {loading ? "Tallennetaan..." : "Tallenna asetukset"}
      </Button>
    </CardContent></Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  addKulu, deleteKulu, getKulut, saveAsetukset,
  addToistuvaKulu, updateToistuvaKulu, deleteToistuvaKulu,
  tallennaKuukaudenMittari,
} from "@/lib/kotivahti.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Repeat, Gauge } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, ComposedChart, Line, Legend, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/kulut")({
  loader: ({ context }) => {
    if (typeof window === "undefined") return null;
    return context.queryClient.ensureQueryData({ queryKey: ["kulut"], queryFn: () => getKulut(), staleTime: 30_000 });
  },
  component: KulutPage,
});

const KK = ["Tam", "Hel", "Maa", "Huh", "Tou", "Kes", "Hei", "Elo", "Syy", "Lok", "Mar", "Jou"];
const KK_PITKA = ["Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"];
const KATEGORIAT = ["sahko", "vesi", "lammitys", "huolto", "vakuutus", "kiinteistovero", "muu"] as const;
const KAT_LABEL: Record<string, string> = { sahko: "Sähkö", vesi: "Vesi", lammitys: "Lämmitys", huolto: "Huolto", vakuutus: "Vakuutus", kiinteistovero: "Kiinteistövero", muu: "Muu" };
const TOISTUVA_KATEGORIAT = ["vakuutus", "kiinteistovero", "muu"] as const;
const PIKAMALLIT: { nimi: string; kategoria: string }[] = [
  { nimi: "Kiinteistövero", kategoria: "kiinteistovero" },
  { nimi: "Kotivakuutus", kategoria: "vakuutus" },
  { nimi: "Maavuokra", kategoria: "muu" },
  { nimi: "Jätehuolto", kategoria: "muu" },
  { nimi: "Talvikunnossapito", kategoria: "muu" },
  { nimi: "Nuohous-sopimus", kategoria: "muu" },
];

function KulutPage() {
  const fetchFn = useServerFn(getKulut);
  const addFn = useServerFn(addKulu);
  const delFn = useServerFn(deleteKulu);
  const saveAsFn = useServerFn(saveAsetukset);
  const addToistuvaFn = useServerFn(addToistuvaKulu);
  const updateToistuvaFn = useServerFn(updateToistuvaKulu);
  const deleteToistuvaFn = useServerFn(deleteToistuvaKulu);
  const tallennaMittariFn = useServerFn(tallennaKuukaudenMittari);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["kulut"], queryFn: () => fetchFn(), staleTime: 30_000 });
  const [vuosi, setVuosi] = useState<number>(new Date().getFullYear());

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["kulut"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); };

  const addM = useMutation({
    mutationFn: (v: any) => addFn({ data: v }),
    onSuccess: () => { toast.success("Kulu lisätty"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: async (kulu: any) => {
      const poista_myos_linkitetty = !!kulu.huolto_id
        ? window.confirm("Tähän kuluun on linkitetty huoltohistorian merkintä. Poistetaanko myös huoltomerkintä?")
        : false;
      return delFn({ data: { id: kulu.id, poista_myos_linkitetty } });
    },
    onSuccess: invalidate,
  });
  const saveM = useMutation({
    mutationFn: (v: any) => saveAsFn({ data: v }),
    onSuccess: () => { toast.success("Asetukset tallennettu"); invalidate(); },
  });
  const addToistuvaM = useMutation({
    mutationFn: (v: any) => addToistuvaFn({ data: v }),
    onSuccess: () => { toast.success("Toistuva kulu lisätty"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateToistuvaM = useMutation({
    mutationFn: (v: any) => updateToistuvaFn({ data: v }),
    onSuccess: invalidate,
  });
  const deleteToistuvaM = useMutation({
    mutationFn: (id: string) => deleteToistuvaFn({ data: { id, poista_materialisoidut: true } }),
    onSuccess: () => { toast.success("Toistuva kulu poistettu"); invalidate(); },
  });
  const mittariM = useMutation({
    mutationFn: (v: any) => tallennaMittariFn({ data: v }),
    onSuccess: (r: any) => {
      const osat: string[] = [];
      if (r?.sahko) osat.push(`Sähkö ${r.sahko.kulutus.toFixed(0)} kWh · ${r.sahko.summa.toFixed(2)} €`);
      if (r?.vesi) osat.push(`Vesi ${r.vesi.kulutus.toFixed(2)} m³ · ${r.vesi.summa.toFixed(2)} €`);
      toast.success(osat.join(" · ") || "Mittarilukema tallennettu");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Ladataan...</p>;
  const kulut = data?.kulut ?? [];
  const asetukset = data?.asetukset;
  const toistuvat = data?.toistuvat ?? [];
  const nykyinen = new Date().getFullYear();
  const vuodetSaatavilla = Array.from(new Set<number>([nykyinen, ...kulut.map((k: any) => new Date(k.pvm).getFullYear())])).sort((a, b) => b - a);
  const tamaVuosi = kulut.filter((k: any) => new Date(k.pvm).getFullYear() === vuosi);
  const summa = tamaVuosi.reduce((s: number, k: any) => s + Number(k.summa || 0), 0);

  const perKategoria = KATEGORIAT.map((kat) => ({
    kat: KAT_LABEL[kat],
    summa: tamaVuosi.filter((k: any) => k.kategoria === kat).reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
  }));

  const juoksevatPerKk = Array.from({ length: 12 }, (_, i) => {
    const kkRivit = tamaVuosi.filter((k: any) => new Date(k.pvm).getMonth() === i);
    return {
      kk: KK[i],
      sahko: kkRivit.filter((k: any) => k.kategoria === "sahko").reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
      vesi: kkRivit.filter((k: any) => k.kategoria === "vesi").reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
      kwh: kkRivit.filter((k: any) => k.kategoria === "sahko").reduce((s: number, k: any) => s + Number(k.kwh || 0), 0),
      m3: kkRivit.filter((k: any) => k.kategoria === "vesi").reduce((s: number, k: any) => s + Number(k.kulutus_m3 || 0), 0),
    };
  });
  const huoltoPerKk = Array.from({ length: 12 }, (_, i) => ({
    kk: KK[i],
    summa: tamaVuosi.filter((k: any) => k.kategoria === "huolto" && new Date(k.pvm).getMonth() === i).reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
  }));
  const huoltoSumma = huoltoPerKk.reduce((s, r) => s + r.summa, 0);
  const KIINTEAT_KAT = ["vakuutus", "kiinteistovero", "lammitys", "muu"] as const;
  const kiinteatData = KIINTEAT_KAT.map((kat) => ({
    nimi: KAT_LABEL[kat],
    summa: tamaVuosi.filter((k: any) => k.kategoria === kat).reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
  })).filter((r) => r.summa > 0);
  const kiinteatSumma = kiinteatData.reduce((s, r) => s + r.summa, 0);
  const KIINTEAT_VARIT = ["#c9a961", "#7a8b99", "#8b6f47", "#5a6b7a"];

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
          <TabsTrigger value="toistuvat">Toistuvat kulut</TabsTrigger>
          <TabsTrigger value="asetukset">Asetukset</TabsTrigger>
        </TabsList>

        <TabsContent value="yhteenveto" className="space-y-6 pt-4">
          <MittariKortti asetukset={asetukset} onSave={(v) => mittariM.mutate(v)} loading={mittariM.isPending} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Yhteensä" value={`${summa.toFixed(0)} €`} hi />
            <Stat label="Sähkö" value={`${perKategoria.find((p) => p.kat === "Sähkö")!.summa.toFixed(0)} €`} />
            <Stat label="Vesi" value={`${perKategoria.find((p) => p.kat === "Vesi")!.summa.toFixed(0)} €`} />
            <Stat label="Huolto / korjaus" value={`${huoltoSumma.toFixed(0)} €`} />
          </div>

          <Card className="gold-card">
            <CardContent className="pt-6">
              <p className="eyebrow mb-1">Juoksevat kulut</p>
              <p className="text-xs text-muted-foreground mb-4">Sähkö ja vesi kuukausittain — kulutuksen trendi näkyy viivasta.</p>
              <div className="h-72">
                <ResponsiveContainer>
                  <ComposedChart data={juoksevatPerKk}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="kk" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis yAxisId="eur" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis yAxisId="kulutus" orientation="right" stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} cursor={{ fill: "color-mix(in oklab, var(--gold) 8%, transparent)" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="eur" dataKey="sahko" name="Sähkö €" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="eur" dataKey="vesi" name="Vesi €" fill="#7a8b99" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="kulutus" type="monotone" dataKey="kwh" name="Sähkö kWh" stroke="var(--gold)" strokeWidth={2} dot={false} />
                    <Line yAxisId="kulutus" type="monotone" dataKey="m3" name="Vesi m³" stroke="#7a8b99" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="gold-card">
            <CardContent className="pt-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="eyebrow mb-1">Huolto & korjaus</p>
                  <p className="text-xs text-muted-foreground">Suunnitellut ja akuutit huoltokulut kuukausittain.</p>
                </div>
                <p className="font-serif text-xl text-primary">{huoltoSumma.toFixed(0)} € / vuosi</p>
              </div>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={huoltoPerKk}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="kk" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} cursor={{ fill: "color-mix(in oklab, #8b6f47 12%, transparent)" }} />
                    <Bar dataKey="summa" name="Huolto €" fill="#8b6f47" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="gold-card">
            <CardContent className="pt-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="eyebrow mb-1">Kiinteät kulut</p>
                  <p className="text-xs text-muted-foreground">Vakuutukset, verot, lämmitys ja muut vuosittaiset.</p>
                </div>
                <p className="font-serif text-xl text-primary">{kiinteatSumma.toFixed(0)} € / vuosi</p>
              </div>
              {kiinteatData.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Ei vielä kiinteitä kuluja tälle vuodelle.</p>
              ) : (
                <div className="grid gap-6 md:grid-cols-[180px_1fr] items-center">
                  <div className="h-44">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={kiinteatData} dataKey="summa" nameKey="nimi" innerRadius={40} outerRadius={70} paddingAngle={2}>
                          {kiinteatData.map((_, i) => <Cell key={i} fill={KIINTEAT_VARIT[i % KIINTEAT_VARIT.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: any) => `${Number(v).toFixed(0)} €`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-2">
                    {kiinteatData.map((r, i) => (
                      <li key={r.nimi} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="block h-3 w-3 rounded-sm" style={{ backgroundColor: KIINTEAT_VARIT[i % KIINTEAT_VARIT.length] }} />
                          <span className="text-cream">{r.nimi}</span>
                        </span>
                        <span className="font-mono text-primary">{r.summa.toFixed(0)} €</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                {kulut.map((k: any) => {
                  const onToistuva = typeof k.kohde_avain === "string" && k.kohde_avain.startsWith("toistuva:");
                  const onMittari = typeof k.kohde_avain === "string" && k.kohde_avain.startsWith("mittari:");
                  return (
                    <li key={k.id} className="flex items-center gap-4 px-4 py-3">
                      <span className="eyebrow w-28 text-muted-foreground">{KAT_LABEL[k.kategoria] || k.kategoria}</span>
                      <div className="flex-1">
                        <p className="text-cream flex items-center gap-1.5">
                          {k.huolto_id && <span title="Linkitetty huoltohistoriaan">🔧</span>}
                          {onToistuva && <Repeat className="h-3.5 w-3.5 text-primary" />}
                          {onMittari && <Gauge className="h-3.5 w-3.5 text-primary" />}
                          {k.nimi}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(k.pvm).toLocaleDateString("fi-FI")}{k.kwh ? ` · ${k.kwh} kWh` : ""}{k.kulutus_m3 ? ` · ${k.kulutus_m3} m³` : ""}</p>
                      </div>
                      <span className="font-mono text-primary">{Number(k.summa).toFixed(2)} €</span>
                      {!onToistuva && (
                        <Button variant="ghost" size="icon" onClick={() => delM.mutate(k)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="toistuvat" className="space-y-4 pt-4">
          <ToistuvatVali toistuvat={toistuvat}
            onAdd={(v) => addToistuvaM.mutate(v)}
            onUpdate={(v) => updateToistuvaM.mutate(v)}
            onDelete={(id) => deleteToistuvaM.mutate(id)}
            adding={addToistuvaM.isPending} />
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

function MittariKortti({ asetukset, onSave, loading }: { asetukset: any; onSave: (v: any) => void; loading: boolean }) {
  const nyt = new Date();
  const [vuosi, setVuosi] = useState(nyt.getFullYear());
  const [kk, setKk] = useState(nyt.getMonth() + 1);
  const [sahko, setSahko] = useState("");
  const [vesi, setVesi] = useState("");

  const edSahko = Number(asetukset?.edellinen_sahkomittari || 0);
  const edVesi = Number(asetukset?.edellinen_mittarilukema || 0);
  const sahkoTariffi = Number(asetukset?.sahko_energia_snt || 0) + Number(asetukset?.sahko_siirto_snt || 0);
  const sahkoPerus = Number(asetukset?.sahko_perusmaksu_eur_kk || 0);
  const vesiTariffi = Number(asetukset?.vesi_puhdas_eur_m3 || 0) + Number(asetukset?.vesi_jatevesi_eur_m3 || 0);
  const vesiPerus = Number(asetukset?.vesi_perusmaksu_eur_kk || 0);

  const sahkoKulutus = sahko ? Math.max(0, Number(sahko) - edSahko) : 0;
  const sahkoEur = sahko ? (sahkoKulutus * sahkoTariffi) / 100 + sahkoPerus : 0;
  const vesiKulutus = vesi ? Math.max(0, Number(vesi) - edVesi) : 0;
  const vesiEur = vesi ? vesiKulutus * vesiTariffi + vesiPerus : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sahko && !vesi) { toast.error("Anna ainakin yksi mittarilukema"); return; }
    const v: any = { vuosi, kuukausi: kk };
    if (sahko) v.sahko_lukema = Number(sahko);
    if (vesi) v.vesi_lukema = Number(vesi);
    onSave(v);
    setSahko(""); setVesi("");
  };

  return (
    <Card className="gold-card">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="h-4 w-4 text-primary" />
          <p className="eyebrow">Kuukauden mittarilukemat</p>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Syötä mittarilukema kerran kuussa — €-summa lasketaan automaattisesti asetusten tariffeista.</p>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end">
          <div className="space-y-1.5">
            <Label className="text-xs">Kuukausi</Label>
            <Select value={String(kk)} onValueChange={(v) => setKk(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{KK_PITKA.map((n, i) => <SelectItem key={i} value={String(i + 1)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Vuosi</Label>
            <Input type="number" value={vuosi} onChange={(e) => setVuosi(Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sähkömittari (kWh)</Label>
            <Input type="number" step="0.01" value={sahko} onChange={(e) => setSahko(e.target.value)} placeholder={edSahko ? `ed. ${edSahko}` : "lukema"} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Vesimittari (m³)</Label>
            <Input type="number" step="0.001" value={vesi} onChange={(e) => setVesi(e.target.value)} placeholder={edVesi ? `ed. ${edVesi}` : "lukema"} />
          </div>
          <Button type="submit" disabled={loading} className="uppercase tracking-wider font-semibold">{loading ? "Tallennetaan..." : "Tallenna"}</Button>
        </form>
        {(sahko || vesi) && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            {sahko && <span>Sähkö: <span className="text-cream">{sahkoKulutus.toFixed(0)} kWh</span> → <span className="text-primary font-mono">{sahkoEur.toFixed(2)} €</span></span>}
            {vesi && <span>Vesi: <span className="text-cream">{vesiKulutus.toFixed(2)} m³</span> → <span className="text-primary font-mono">{vesiEur.toFixed(2)} €</span></span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToistuvatVali({ toistuvat, onAdd, onUpdate, onDelete, adding }:
  { toistuvat: any[]; onAdd: (v: any) => void; onUpdate: (v: any) => void; onDelete: (id: string) => void; adding: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end gap-4">
        <p className="text-xs text-muted-foreground max-w-2xl">Lisää vuosittain toistuvat kiinteät kulut — ne ilmestyvät automaattisesti Kulut-yhteenvetoon joka vuodelle alkuvuodesta nykyhetkeen.</p>
        <ToistuvaDialog onSave={onAdd} loading={adding} />
      </div>
      {toistuvat.length === 0 ? (
        <Card className="gold-card"><CardContent className="py-12 text-center text-muted-foreground">Ei vielä toistuvia kuluja.</CardContent></Card>
      ) : (
        <Card className="gold-card"><CardContent className="p-0">
          <ul className="divide-y divide-border/60">
            {toistuvat.map((t: any) => (
              <li key={t.id} className="flex items-center gap-4 px-4 py-3">
                <Repeat className="h-4 w-4 text-primary" />
                <span className="eyebrow w-28 text-muted-foreground">{KAT_LABEL[t.kategoria] || t.kategoria}</span>
                <div className="flex-1">
                  <p className="text-cream">{t.nimi}</p>
                  <p className="text-xs text-muted-foreground">{KK_PITKA[t.eraantymiskuukausi - 1]} · alkaen {t.alkuvuosi}</p>
                </div>
                <Switch checked={t.aktiivinen} onCheckedChange={(v) => onUpdate({ id: t.id, aktiivinen: v })} />
                <span className="font-mono text-primary w-24 text-right">{Number(t.summa).toFixed(0)} € / v</span>
                <Button variant="ghost" size="icon" onClick={() => { if (window.confirm("Poistetaanko myös aiemmin luodut vuosittaiset rivit?")) onDelete(t.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent></Card>
      )}
    </div>
  );
}

function ToistuvaDialog({ onSave, loading }: { onSave: (v: any) => void; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const [nimi, setNimi] = useState("");
  const [kategoria, setKategoria] = useState<string>("muu");
  const [summa, setSumma] = useState("");
  const [kk, setKk] = useState(1);
  const [alku, setAlku] = useState(new Date().getFullYear());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = Number(summa);
    if (!nimi || !s) { toast.error("Anna nimi ja summa"); return; }
    onSave({ nimi, kategoria, summa: s, eraantymiskuukausi: kk, alkuvuosi: alku, aktiivinen: true });
    setOpen(false); setNimi(""); setSumma("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="uppercase tracking-wider font-semibold"><Plus className="mr-2 h-4 w-4" /> Lisää toistuva</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-serif text-xl">Toistuva vuosikulu</DialogTitle></DialogHeader>
        <div className="flex flex-wrap gap-2 mb-1">
          {PIKAMALLIT.map((p) => (
            <button key={p.nimi} type="button" onClick={() => { setNimi(p.nimi); setKategoria(p.kategoria); }}
              className="text-xs px-3 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/60 transition">
              {p.nimi}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label>Nimi</Label><Input value={nimi} onChange={(e) => setNimi(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Kategoria</Label>
              <Select value={kategoria} onValueChange={setKategoria}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TOISTUVA_KATEGORIAT.map((k) => <SelectItem key={k} value={k}>{KAT_LABEL[k]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Summa (€/v)</Label><Input type="number" step="0.01" value={summa} onChange={(e) => setSumma(e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Erääntymiskuukausi</Label>
              <Select value={String(kk)} onValueChange={(v) => setKk(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{KK_PITKA.map((n, i) => <SelectItem key={i} value={String(i + 1)}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Alkuvuosi</Label><Input type="number" value={alku} onChange={(e) => setAlku(Number(e.target.value))} /></div>
          </div>
          <Button type="submit" disabled={loading} className="w-full uppercase tracking-wider font-semibold">{loading ? "Tallennetaan..." : "Tallenna"}</Button>
        </form>
      </DialogContent>
    </Dialog>
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

  const sahkoPerus = Number(asetukset?.sahko_perusmaksu_eur_kk || 0);
  const vesiPerus = Number(asetukset?.vesi_perusmaksu_eur_kk || 0);
  const sahkoTariffi = Number(asetukset?.sahko_energia_snt || 0) + Number(asetukset?.sahko_siirto_snt || 0);
  const sahkoHintaLaskettu = kwh && sahkoTariffi > 0 ? (Number(kwh) * sahkoTariffi / 100) + sahkoPerus : 0;
  const edellinen = Number(asetukset?.edellinen_mittarilukema || 0);
  const m3 = mittari ? Math.max(0, Number(mittari) - edellinen) : 0;
  const vesiTariffi = Number(asetukset?.vesi_puhdas_eur_m3 || 0) + Number(asetukset?.vesi_jatevesi_eur_m3 || 0);
  const vesiHintaLaskettu = m3 && vesiTariffi > 0 ? m3 * vesiTariffi + vesiPerus : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let v: any = { nimi: nimi || KAT_LABEL[kat], kategoria: kat, pvm };
    if (kat === "sahko") {
      if (kwh) v.kwh = Number(kwh);
      const manuaali = Number(summa || 0);
      v.summa = manuaali > 0 ? manuaali : Number(sahkoHintaLaskettu.toFixed(2));
    } else if (kat === "vesi") {
      if (mittari) { v.mittarilukema = Number(mittari); v.kulutus_m3 = m3; }
      const manuaali = Number(summa || 0);
      v.summa = manuaali > 0 ? manuaali : Number(vesiHintaLaskettu.toFixed(2));
    } else {
      v.summa = Number(summa || 0);
    }
    if (!v.summa || v.summa <= 0) { toast.error("Anna summa tai mittarilukema/kulutus"); return; }
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Kulutus (kWh)</Label><Input type="number" min="0" step="0.01" value={kwh} onChange={(e) => setKwh(e.target.value)} placeholder="valinnainen" /></div>
              <div className="space-y-2"><Label>Laskun summa (€)</Label><Input type="number" min="0" step="0.01" value={summa} onChange={(e) => setSumma(e.target.value)} placeholder={sahkoHintaLaskettu > 0 ? sahkoHintaLaskettu.toFixed(2) : "esim. 120.50"} /></div>
            </div>
            <p className="text-xs text-muted-foreground">{sahkoTariffi > 0 ? <>Jos jätät summan tyhjäksi, lasketaan kulutuksesta: <span className="text-primary font-mono">{sahkoHintaLaskettu.toFixed(2)} €</span></> : "Voit antaa kulutuksen, summan tai molemmat. Aseta hinnat asetuksissa automaattilaskentaa varten."}</p>
          </>) : kat === "vesi" ? (<>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Mittarilukema (m³)</Label><Input type="number" min="0" step="0.001" value={mittari} onChange={(e) => setMittari(e.target.value)} placeholder="valinnainen" /></div>
              <div className="space-y-2"><Label>Laskun summa (€)</Label><Input type="number" min="0" step="0.01" value={summa} onChange={(e) => setSumma(e.target.value)} placeholder={vesiHintaLaskettu > 0 ? vesiHintaLaskettu.toFixed(2) : "esim. 65.00"} /></div>
            </div>
            <p className="text-xs text-muted-foreground">{vesiTariffi > 0 ? <>Kulutus: {m3.toFixed(2)} m³ · Laskettu hinta: <span className="text-primary font-mono">{vesiHintaLaskettu.toFixed(2)} €</span>{edellinen > 0 ? ` · Edellinen lukema: ${edellinen}` : ""}</> : "Voit antaa mittarilukeman, summan tai molemmat. Aseta hinnat asetuksissa automaattilaskentaa varten."}</p>
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
  const [sp, setSp] = useState(asetukset?.sahko_perusmaksu_eur_kk ?? 0);
  const [vp, setVp] = useState(asetukset?.vesi_puhdas_eur_m3 ?? 2.5);
  const [vj, setVj] = useState(asetukset?.vesi_jatevesi_eur_m3 ?? 3.5);
  const [vpm, setVpm] = useState(asetukset?.vesi_perusmaksu_eur_kk ?? 0);
  const [edS, setEdS] = useState(asetukset?.edellinen_sahkomittari ?? 0);
  const [edV, setEdV] = useState(asetukset?.edellinen_mittarilukema ?? 0);

  return (
    <Card className="gold-card"><CardContent className="pt-6 space-y-5">
      <div>
        <h3 className="font-serif text-lg text-cream mb-3">Sähkö</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>Energia (snt/kWh)</Label><Input type="number" step="0.01" value={se} onChange={(e) => setSe(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Siirto (snt/kWh)</Label><Input type="number" step="0.01" value={ss} onChange={(e) => setSs(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Perusmaksu (€/kk)</Label><Input type="number" step="0.01" value={sp} onChange={(e) => setSp(Number(e.target.value))} /></div>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg text-cream mb-3">Vesi</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label>Puhdas vesi (€/m³)</Label><Input type="number" step="0.01" value={vp} onChange={(e) => setVp(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Jätevesi (€/m³)</Label><Input type="number" step="0.01" value={vj} onChange={(e) => setVj(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Perusmaksu (€/kk)</Label><Input type="number" step="0.01" value={vpm} onChange={(e) => setVpm(Number(e.target.value))} /></div>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-lg text-cream mb-3">Edelliset mittarilukemat</h3>
        <p className="text-xs text-muted-foreground mb-3">Käytetään lähtöarvona kun syötät seuraavan kuukauden lukeman. Päivittyy automaattisesti jokaisen tallennuksen jälkeen.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>Sähkömittari (kWh)</Label><Input type="number" step="0.01" value={edS} onChange={(e) => setEdS(Number(e.target.value))} /></div>
          <div className="space-y-2"><Label>Vesimittari (m³)</Label><Input type="number" step="0.001" value={edV} onChange={(e) => setEdV(Number(e.target.value))} /></div>
        </div>
      </div>
      <Button onClick={() => onSave({ sahko_energia_snt: se, sahko_siirto_snt: ss, sahko_perusmaksu_eur_kk: sp, vesi_puhdas_eur_m3: vp, vesi_jatevesi_eur_m3: vj, vesi_perusmaksu_eur_kk: vpm, edellinen_sahkomittari: Number(edS), edellinen_mittarilukema: Number(edV) })}
              disabled={loading} className="uppercase tracking-wider font-semibold">
        {loading ? "Tallennetaan..." : "Tallenna asetukset"}
      </Button>
    </CardContent></Card>
  );
}

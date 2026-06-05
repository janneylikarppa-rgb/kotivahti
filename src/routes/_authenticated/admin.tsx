import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
import { LIIDI_KATEGORIAT, LIIDI_STATUKSET, LIIDI_PALVELUT } from "@/lib/liidit-kategoriat";
import { MAAKUNNAT } from "@/lib/maakunnat";
import { Checkbox } from "@/components/ui/checkbox";

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

function statusBadge(s: string) {
  const found = LIIDI_STATUKSET.find((x) => x.arvo === s);
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider whitespace-nowrap ${found?.vari ?? "border-border text-muted-foreground"}`}>
      {found?.nimi ?? s}
    </span>
  );
}

function palveluNimi(p: string) {
  return LIIDI_PALVELUT.find((x) => x.arvo === p)?.nimi ?? p;
}

type Filtteri = "kaikki" | "uusi" | "kasittelyssa" | "valitetty" | "valmis";

function LiiditTab() {
  const fetchFn = useServerFn(getAdminLiidit);
  const updFn = useServerFn(paivitaLiidinStatus);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-liidit"], queryFn: () => fetchFn() });
  const [filtteri, setFiltteri] = useState<Filtteri>("kaikki");
  const [avoinId, setAvoinId] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (v: any) => updFn({ data: v }),
    onSuccess: () => {
      toast.success("Päivitetty");
      qc.invalidateQueries({ queryKey: ["admin-liidit"] });
      qc.invalidateQueries({ queryKey: ["uusien-liidien-maara"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const liidit = data as any[];
  const filteredListSrc = useMemo(() => {
    if (filtteri === "kaikki") return liidit;
    return liidit.filter((l) => l.status === filtteri);
  }, [liidit, filtteri]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { kaikki: liidit.length };
    for (const l of liidit) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [liidit]);

  const avoin = avoinId ? liidit.find((l) => l.id === avoinId) : null;

  const filterPainikkeet: { arvo: Filtteri; nimi: string }[] = [
    { arvo: "kaikki", nimi: "Kaikki" },
    { arvo: "uusi", nimi: "Uusi" },
    { arvo: "kasittelyssa", nimi: "Käsittelyssä" },
    { arvo: "valitetty", nimi: "Välitetty" },
    { arvo: "valmis", nimi: "Valmis" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterPainikkeet.map((f) => (
          <button
            key={f.arvo}
            type="button"
            onClick={() => setFiltteri(f.arvo)}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition ${
              filtteri === f.arvo
                ? "border-primary bg-primary/20 text-primary"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-cream"
            }`}
          >
            {f.nimi}
            <span className="ml-2 text-[10px] opacity-70">{counts[f.arvo] ?? 0}</span>
          </button>
        ))}
      </div>

      {filteredListSrc.length === 0 ? (
        <p className="text-muted-foreground">Ei liidejä valitulla suodattimella.</p>
      ) : (
        <Card className="gold-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Aika</th>
                  <th className="px-3 py-2 text-left">Kategoria</th>
                  <th className="px-3 py-2 text-left">Palvelu</th>
                  <th className="px-3 py-2 text-left">Nimi</th>
                  <th className="px-3 py-2 text-left">Puhelin</th>
                  <th className="px-3 py-2 text-left">Osoite</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredListSrc.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setAvoinId(l.id)}
                    className="cursor-pointer border-t border-border/40 hover:bg-primary/5"
                  >
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-3 py-2 text-cream">{l.kategoria}</td>
                    <td className="px-3 py-2 text-muted-foreground">{palveluNimi(l.palvelu)}</td>
                    <td className="px-3 py-2 text-cream">{l.nimi}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{l.puhelin}</td>
                    <td className="px-3 py-2 text-muted-foreground">{l.osoite ?? "—"}</td>
                    <td className="px-3 py-2">{statusBadge(l.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={!!avoinId} onOpenChange={(o) => !o && setAvoinId(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          {avoin && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{avoin.kategoria}</DialogTitle>
                <DialogDescription>
                  {palveluNimi(avoin.palvelu)} · {new Date(avoin.created_at).toLocaleString("fi-FI")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <section className="space-y-1">
                  <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Asiakas</h3>
                  <div className="grid gap-1 text-sm">
                    <div><span className="text-muted-foreground">Nimi:</span> <span className="text-cream">{avoin.nimi}</span></div>
                    <div><span className="text-muted-foreground">Puhelin:</span> <a className="text-primary" href={`tel:${avoin.puhelin}`}>{avoin.puhelin}</a></div>
                    <div><span className="text-muted-foreground">Sähköposti:</span> <a className="text-primary" href={`mailto:${avoin.sahkoposti}`}>{avoin.sahkoposti}</a></div>
                  </div>
                </section>

                <section className="space-y-1">
                  <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Kiinteistö</h3>
                  <div className="grid gap-1 text-sm">
                    <div><span className="text-muted-foreground">Osoite:</span> <span className="text-cream">{avoin.osoite ?? "—"}</span></div>
                    {avoin.kaupunki && <div><span className="text-muted-foreground">Kaupunki:</span> <span className="text-cream">{avoin.kaupunki}</span></div>}
                    {avoin.rakennus_vuosi && <div><span className="text-muted-foreground">Rakennusvuosi:</span> <span className="text-cream">{avoin.rakennus_vuosi}</span></div>}
                    {avoin.lammitys && <div><span className="text-muted-foreground">Lämmitys:</span> <span className="text-cream">{avoin.lammitys}</span></div>}
                  </div>
                </section>

                {avoin.kuvaus && (
                  <section className="space-y-1">
                    <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Asiakkaan kuvaus</h3>
                    <p className="whitespace-pre-wrap rounded border border-border/60 p-3 text-sm text-cream">{avoin.kuvaus}</p>
                  </section>
                )}

                {avoin.lisatieto && (
                  <section className="space-y-1">
                    <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">Lisätieto</h3>
                    <pre className="whitespace-pre-wrap rounded border border-border/60 p-3 text-xs text-muted-foreground">{avoin.lisatieto}</pre>
                  </section>
                )}

                <section className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <Label className="text-xs uppercase tracking-wider">Tila</Label>
                  <Select value={avoin.status} onValueChange={(v) => mut.mutate({ id: avoin.id, status: v })}>
                    <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LIIDI_STATUKSET.map((s) => <SelectItem key={s.arvo} value={s.arvo}>{s.nimi}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
            <div className="font-serif text-cream">Sähköpostiautomaatio ammattilaisille</div>
            <p className="text-xs text-muted-foreground">Tämä asetus on varattu tulevaa automaattista välitystä varten. Omistajan ilmoitukset uusista liideistä lähtevät aina automaattisesti.</p>
          </div>
          <Switch checked={paalla} onCheckedChange={(v) => mut.mutate({ automaatio_paalla: v })} />
        </div>
      </CardContent>
    </Card>
  );
}

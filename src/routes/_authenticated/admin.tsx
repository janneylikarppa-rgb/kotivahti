import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
import {
  getPalauteYhteenveto,
  getKonversioputki,
  getKayttajaSegmentit,
  getPalauteVastaukset,
  getAmmattilaisarviot,
  getKausikirjeTilastot,
  lahetaTestiKausikirje,
  getYdinprosessiMittarit,
  getAmmattilaisRanking,
  getYdinprosessiLiidiStatukset,
} from "@/lib/palaute.functions";
import { LIIDI_KATEGORIAT, LIIDI_STATUKSET, LIIDI_PALVELUT } from "@/lib/liidit-kategoriat";
import { MAAKUNNAT } from "@/lib/maakunnat";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const adminFn = useServerFn(onkoAdmin);
  const navigate = useNavigate();
  const { data: adminCheck, isLoading } = useQuery({ queryKey: ["onko-admin"], queryFn: () => adminFn() });
  const eiOikeuksia = !isLoading && !adminCheck?.admin;

  useEffect(() => {
    if (!eiOikeuksia) return;
    toast.error("Ei käyttöoikeuksia", { description: "Vain ylläpitäjät pääsevät tälle sivulle." });
    navigate({ to: "/dashboard", replace: true });
  }, [eiOikeuksia, navigate]);

  if (isLoading || eiOikeuksia) return <p className="text-muted-foreground">Tarkistetaan oikeuksia...</p>;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="animate-fade-up">
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Admin</p>
        <h1 className="font-serif text-4xl text-cream">Liidien <em className="text-primary not-italic italic">hallinta</em></h1>
      </header>
      <Tabs defaultValue="liidit">
        <TabsList>
          <TabsTrigger value="liidit">Liidit</TabsTrigger>
          <TabsTrigger value="palaute">Palaute</TabsTrigger>
          <TabsTrigger value="ammattilaiset">Ammattilaiset</TabsTrigger>
          <TabsTrigger value="asetukset">Asetukset</TabsTrigger>
        </TabsList>
        <TabsContent value="liidit" className="mt-6"><LiiditTab /></TabsContent>
        <TabsContent value="palaute" className="mt-6"><PalauteTab /></TabsContent>
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
  const statusFn = useServerFn(getYdinprosessiLiidiStatukset);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-liidit"], queryFn: () => fetchFn() });
  const { data: statukset = {} } = useQuery({ queryKey: ["liidi-vaihestatukset"], queryFn: () => statusFn() });
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
                  <th className="px-3 py-2 text-left">Maakunta</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">V1/V2/V3</th>
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
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{l.maakunta ?? "—"}</td>
                    <td className="px-3 py-2">{statusBadge(l.status)}</td>
                    <td className="px-3 py-2"><VaiheStatukset s={(statukset as any)[l.id]} /></td>
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
                    {avoin.maakunta && <div><span className="text-muted-foreground">Maakunta:</span> <span className="text-cream">{avoin.maakunta}</span></div>}
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
                  <div className="text-xs text-muted-foreground mt-1">
                    Toimialueet: {Array.isArray(a.toimialueet) && a.toimialueet.length > 0 ? a.toimialueet.join(", ") : "Koko Suomi"}
                  </div>
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
  const [toimialueet, setToimialueet] = useState<string[]>([]);

  const toggleAlue = (m: string) => {
    setToimialueet((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  return (
    <form
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          yritys: yritys.trim(),
          sahkoposti: sahkoposti.trim(),
          puhelin: puhelin.trim() || null,
          kategoria,
          prioriteetti,
          aktiivinen: true,
          toimialueet,
        });
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

      <div className="space-y-2">
        <Label>Toimialue (valitse yksi tai useampi)</Label>
        <p className="text-xs text-muted-foreground">Tyhjä = koko Suomi. Liidi reititetään vain valituille alueille.</p>
        <div className="grid grid-cols-2 gap-2 rounded border border-border/60 p-3">
          {MAAKUNNAT.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm text-cream cursor-pointer">
              <Checkbox
                checked={toimialueet.includes(m)}
                onCheckedChange={() => toggleAlue(m)}
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
      </div>

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

// ============================ PALAUTE-TAB ============================
function PalauteTab() {
  const yhFn = useServerFn(getPalauteYhteenveto);
  const kpFn = useServerFn(getKonversioputki);
  const segFn = useServerFn(getKayttajaSegmentit);
  const vastFn = useServerFn(getPalauteVastaukset);
  const arvFn = useServerFn(getAmmattilaisarviot);
  const kkFn = useServerFn(getKausikirjeTilastot);
  const testiFn = useServerFn(lahetaTestiKausikirje);
  const ypFn = useServerFn(getYdinprosessiMittarit);
  const rankFn = useServerFn(getAmmattilaisRanking);

  const yh = useQuery({ queryKey: ["palaute-yhteenveto"], queryFn: () => yhFn() });
  const kp = useQuery({ queryKey: ["palaute-konversio"], queryFn: () => kpFn() });
  const seg = useQuery({ queryKey: ["palaute-segmentit"], queryFn: () => segFn() });
  const vast = useQuery({ queryKey: ["palaute-vastaukset"], queryFn: () => vastFn() });
  const arv = useQuery({ queryKey: ["palaute-amm-arviot"], queryFn: () => arvFn() });
  const kk = useQuery({ queryKey: ["palaute-kausikirje"], queryFn: () => kkFn() });
  const yp = useQuery({ queryKey: ["palaute-ydinprosessi"], queryFn: () => ypFn() });
  const rank = useQuery({ queryKey: ["palaute-amm-ranking"], queryFn: () => rankFn() });

  const [kausi, setKausi] = useState<"kevat" | "kesa" | "syksy" | "talvi">("kevat");
  const testi = useMutation({
    mutationFn: () => testiFn({ data: { kausi } }),
    onSuccess: (r: any) => r?.ok ? toast.success("Testikirje lähetetty") : toast.error(r?.error ?? "Lähetys epäonnistui"),
    onError: (e: any) => toast.error(e.message),
  });

  const maxLkm = Math.max(1, ...((kp.data as any[] | undefined)?.map((v) => v.lkm) ?? [1]));

  return (
    <div className="space-y-6">
      {/* Yhteenvetokortit */}
      <div className="grid gap-3 md:grid-cols-3">
        <Yhteenveto otsikko="NPS" arvo={yh.data?.nps != null ? String(yh.data.nps) : "—"} />
        <Yhteenveto otsikko="Kausikirje vastaus-%" arvo={yh.data?.kausiPros != null ? `${yh.data.kausiPros}%` : "—"} />
        <Yhteenveto otsikko="Reagoimattomat (7pv)" arvo={String(yh.data?.reagoimattomat ?? 0)} korosta={!!yh.data?.reagoimattomat && yh.data.reagoimattomat > 0} />
      </div>

      {/* Ydinprosessin mittarit */}
      <Card className="gold-card">
        <CardContent className="py-5 space-y-4">
          <h3 className="font-serif text-lg text-cream">Ydinprosessi</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <Yhteenveto
              otsikko="Yhteydenotto"
              arvo={yp.data?.yhteydenottoPros != null ? `${yp.data.yhteydenottoPros}%` : "—"}
            />
            <Yhteenveto
              otsikko="Käynti"
              arvo={yp.data?.kayntiPros != null ? `${yp.data.kayntiPros}%` : "—"}
            />
            <Yhteenveto
              otsikko="Tyytyväisyys"
              arvo={yp.data?.tyytyvaisyysPros != null ? `${yp.data.tyytyvaisyysPros}%` : "—"}
            />
          </div>
          <div className="text-[11px] text-muted-foreground">
            Vastauksia: V1 {yp.data?.v1Vastauksia ?? 0} · V2 {yp.data?.v2Vastauksia ?? 0} · V3 {yp.data?.v3Vastauksia ?? 0}
          </div>

          <div className="pt-2 border-t border-border/40">
            <h4 className="font-serif text-sm text-cream mb-2">Ammattilaisten ranking</h4>
            {((rank.data as any[]) ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">Ei vielä pisteytettyjä ammattilaisia (vaatii ≥ 3 vastausta).</p>
            ) : (
              <div className="space-y-1">
                {((rank.data as any[]) ?? []).map((a) => {
                  const heikko = a.keskiarvopisteet != null && a.keskiarvopisteet < 3.0;
                  return (
                    <div key={a.id}
                      className={`flex items-center justify-between text-sm border-b border-border/30 pb-1 ${heikko ? "text-red-400" : "text-cream"}`}>
                      <span>{a.yritys} <span className="text-xs text-muted-foreground">· {a.kategoria}</span></span>
                      <span className="font-mono">
                        {a.keskiarvopisteet != null ? `${Number(a.keskiarvopisteet).toFixed(2)} pist` : "—"}
                        <span className="text-muted-foreground ml-2">({a.arviomaara})</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Konversioputki */}
      <Card className="gold-card">
        <CardContent className="py-5 space-y-3">
          <h3 className="font-serif text-lg text-cream">Konversioputki</h3>
          <div className="space-y-2">
            {((kp.data as any[]) ?? []).map((v) => (
              <div key={v.vaihe} className="space-y-1">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">{v.vaihe}</span><span className="font-mono text-cream">{v.lkm}</span></div>
                <div className="h-2 rounded bg-background/40 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(v.lkm / maxLkm) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Käyttäjäsegmentit */}
      <div className="grid gap-3 md:grid-cols-4">
        <Yhteenveto otsikko="Aktiiviset" arvo={String(seg.data?.aktiiviset ?? 0)} />
        <Yhteenveto otsikko="Passiiviset" arvo={String(seg.data?.passiiviset ?? 0)} />
        <Yhteenveto otsikko="Liidiasiakkaat" arvo={String(seg.data?.liidiasiakkaat ?? 0)} />
        <Yhteenveto otsikko="Yhteensä" arvo={String(seg.data?.yhteensa ?? 0)} />
      </div>

      {/* Kausikirje */}
      <Card className="gold-card">
        <CardContent className="py-5 space-y-3">
          <h3 className="font-serif text-lg text-cream">Kausikirje</h3>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Lähetetty</div><div className="font-mono text-cream">{kk.data?.lahetetty ?? 0}</div></div>
            <div><div className="text-xs text-muted-foreground">Vastausprosentti</div><div className="font-mono text-cream">{kk.data?.vastausProsentti ?? 0}%</div></div>
            <div><div className="text-xs text-muted-foreground">Vastattuja</div><div className="font-mono text-cream">{kk.data?.vastattu ?? 0}</div></div>
          </div>
          {kk.data?.jakauma && Object.keys(kk.data.jakauma).length > 0 && (
            <div className="space-y-1 pt-2">
              {Object.entries(kk.data.jakauma).map(([v, n]) => (
                <div key={v} className="flex items-center gap-3 text-xs">
                  <span className="w-32 text-muted-foreground">{v}</span>
                  <div className="flex-1 h-1.5 rounded bg-background/40 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${((n as number) / (kk.data?.lahetetty || 1)) * 100}%` }} />
                  </div>
                  <span className="font-mono text-cream w-8 text-right">{String(n)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-3 pt-3 border-t border-border/40">
            <div className="space-y-1">
              <Label className="text-xs uppercase tracking-wider">Testikirje</Label>
              <Select value={kausi} onValueChange={(v: any) => setKausi(v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kevat">Kevät</SelectItem>
                  <SelectItem value="kesa">Kesä</SelectItem>
                  <SelectItem value="syksy">Syksy</SelectItem>
                  <SelectItem value="talvi">Talvi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => testi.mutate()} disabled={testi.isPending} className="uppercase tracking-wider font-semibold">
              {testi.isPending ? "Lähetetään..." : "Lähetä omaan sähköpostiin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ammattilaisten arviot */}
      <Card className="gold-card">
        <CardContent className="py-5 space-y-3">
          <h3 className="font-serif text-lg text-cream">Ammattilaisten arviot</h3>
          {((arv.data as any[]) ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Ei vielä arvioita.</p>
          ) : (
            <div className="space-y-1.5">
              {((arv.data as any[]) ?? []).map((a) => (
                <div key={a.nimi} className="flex items-center justify-between text-sm border-b border-border/30 pb-1.5">
                  <span className="text-cream">{a.nimi}</span>
                  <span className="text-primary font-mono">★ {a.keskiarvo.toFixed(1)} <span className="text-muted-foreground">({a.lkm})</span></span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vastaukset */}
      <Card className="gold-card">
        <CardContent className="py-5 space-y-3">
          <h3 className="font-serif text-lg text-cream">Viimeisimmät vastaukset</h3>
          {((vast.data as any[]) ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Ei vielä vastauksia.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-2 py-1 text-left">Aika</th><th className="px-2 py-1 text-left">Tyyppi</th><th className="px-2 py-1 text-left">Vastaus</th></tr>
                </thead>
                <tbody>
                  {((vast.data as any[]) ?? []).slice(0, 50).map((v) => (
                    <tr key={v.id} className="border-t border-border/30">
                      <td className="px-2 py-1 text-xs text-muted-foreground whitespace-nowrap">{new Date(v.vastattu_at).toLocaleString("fi-FI", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-2 py-1 text-cream whitespace-nowrap">{v.tyyppi}</td>
                      <td className="px-2 py-1 text-muted-foreground"><code className="text-xs">{JSON.stringify(v.vastaukset)}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Yhteenveto({ otsikko, arvo, korosta }: { otsikko: string; arvo: string; korosta?: boolean }) {
  return (
    <Card className={`gold-card ${korosta ? "border-orange-500/60" : ""}`}>
      <CardContent className="py-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{otsikko}</div>
        <div className={`font-serif text-2xl mt-1 ${korosta ? "text-orange-400" : "text-cream"}`}>{arvo}</div>
      </CardContent>
    </Card>
  );
}

type Vaihe = { vastattu: boolean; vastaukset?: any; lahetetty_at?: string };
function vaiheVari(vaihe: "v1" | "v2" | "v3", v?: Vaihe): string {
  if (!v) return "bg-muted/30 text-muted-foreground border-border/40";
  if (!v.vastattu) return "bg-orange-500/15 text-orange-300 border-orange-500/40";
  const a = v.vastaukset ?? {};
  if (vaihe === "v1") {
    if (String(a.yhteydenotto ?? "").startsWith("kylla_")) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
    if (a.yhteydenotto === "ei_viela") return "bg-orange-500/15 text-orange-300 border-orange-500/40";
    return "bg-red-500/15 text-red-300 border-red-500/40";
  }
  if (vaihe === "v2") {
    if (a.kavi === "kylla_kavi") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
    if (a.kavi === "sovittu_ei_viela") return "bg-orange-500/15 text-orange-300 border-orange-500/40";
    return "bg-red-500/15 text-red-300 border-red-500/40";
  }
  // v3
  const ka = Number(a.tyo_laatu);
  if (ka >= 4 || a.kokonaisuus === "taysin") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  if (ka === 3 || a.kokonaisuus === "osittain") return "bg-orange-500/15 text-orange-300 border-orange-500/40";
  return "bg-red-500/15 text-red-300 border-red-500/40";
}
function VaiheStatukset({ s }: { s?: { v1?: Vaihe; v2?: Vaihe; v3?: Vaihe } }) {
  const cell = (n: string, vaihe: "v1" | "v2" | "v3", v?: Vaihe) => (
    <span className={`inline-flex h-5 w-7 items-center justify-center rounded border text-[10px] font-semibold ${vaiheVari(vaihe, v)}`}>
      {n}
    </span>
  );
  return (
    <div className="flex gap-1">
      {cell("V1", "v1", s?.v1)}
      {cell("V2", "v2", s?.v2)}
      {cell("V3", "v3", s?.v3)}
    </div>
  );
}

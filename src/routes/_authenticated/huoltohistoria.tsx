import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  addHuolto,
  deleteHuolto,
  deleteHuoltoLiite,
  getDokumenttiUrl,
  getHuollot,
  updateHuolto,
} from "@/lib/kotivahti.functions";
import { HUOLTO_KOHDE_RYHMAT, HUOLTO_TYYPIT } from "@/lib/huolto-kohteet";
import { materiaalivaihtoehdot, tukeeLaitePaivitysta, tukeeMerkkiMalli } from "@/lib/laite-paivitys";
import { supabase } from "@/integrations/supabase/client";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Paperclip, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/huoltohistoria")({
  loader: ({ context }) => {
    if (typeof window === "undefined") return null;
    return context.queryClient.ensureQueryData({ queryKey: ["huollot"], queryFn: () => getHuollot(), staleTime: 30_000 });
  },
  component: HuoltoPage,
});

function HuoltoPage() {
  const fetchFn = useServerFn(getHuollot);
  const addFn = useServerFn(addHuolto);
  const updFn = useServerFn(updateHuolto);
  const delFn = useServerFn(deleteHuolto);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["huollot"], queryFn: () => fetchFn(), staleTime: 30_000 });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["huollot"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["kuitatut"] });
    qc.invalidateQueries({ queryKey: ["kulut"] });
    qc.invalidateQueries({ queryKey: ["talo"] });
  };

  const addM = useMutation({
    mutationFn: (input: any) => addFn({ data: input }),
    onSuccess: () => { toast.success("Huolto lisätty"); invalidate(); setOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const updM = useMutation({
    mutationFn: (input: any) => updFn({ data: input }),
    onSuccess: () => { toast.success("Päivitetty"); invalidate(); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: async (h: any) => {
      const poista_myos_linkitetty = !!h.kulu_id
        ? window.confirm("Tähän huoltoon on linkitetty kulu. Poistetaanko myös kulu?")
        : false;
      return delFn({ data: { id: h.id, poista_myos_linkitetty } });
    },
    onSuccess: () => { toast.success("Poistettu"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const ryhmat = (data as any[]).reduce((acc: Record<string, any[]>, h) => {
    const v = String(new Date(h.pvm).getFullYear());
    (acc[v] ||= []).push(h);
    return acc;
  }, {});
  const vuodet = Object.keys(ryhmat).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Huoltohistoria</p>
          <h1 className="font-serif text-4xl text-cream">Tehdyt <em className="text-primary not-italic italic">huollot</em></h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="uppercase tracking-wider font-semibold"><Plus className="mr-2 h-4 w-4" /> Lisää huolto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif text-2xl">Lisää huoltomerkintä</DialogTitle></DialogHeader>
            <HuoltoForm onSubmit={(v) => addM.mutate(v)} loading={addM.isPending} invalidate={invalidate} />
          </DialogContent>
        </Dialog>
      </header>

      {isLoading ? <p className="text-muted-foreground">Ladataan...</p>
        : vuodet.length === 0 ? (
          <Card className="gold-card"><CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Ei vielä yhtään huoltomerkintää.</p>
            <p className="text-xs text-muted-foreground mt-2">Aloita lisäämällä ensimmäinen merkintä tai kuittaamalla vuosikellosta.</p>
          </CardContent></Card>
        ) : vuodet.map((v) => (
          <section key={v}>
            <h2 className="font-serif text-xl text-cream mb-3">{v}</h2>
            <div className="space-y-2">
              {ryhmat[v].map((h: any) => (
                <Card key={h.id} className="gold-card">
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-serif text-cream">{h.tyyppi}</span>
                        {h.kohde && <span className="text-sm text-muted-foreground">· {h.kohde}</span>}
                        {h.kohde === "Vuosikello" && <span className="text-[10px] uppercase tracking-wider text-primary">vk</span>}
                      </div>
                      {h.kuvaus && <p className="text-sm text-muted-foreground mt-1">{h.kuvaus}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{new Date(h.pvm).toLocaleDateString("fi-FI")}</span>
                        <span>{h.tekija === "itse" ? "Tein itse" : h.tekija_nimi || "Ammattilainen"}</span>
                        {Number(h.takuu_vuotta) > 0 && <span>Takuu {h.takuu_vuotta} v</span>}
                        {Number(h.pts_siirto) > 0 && <span className="text-primary">PTS +{h.pts_siirto} v</span>}
                        {h.liitteet?.length > 0 && (
                          <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />{h.liitteet.length}</span>
                        )}
                      </div>
                    </div>
                    {Number(h.kustannus) > 0 && <span className="font-mono text-primary">{Number(h.kustannus).toFixed(0)} €</span>}
                    <Button variant="ghost" size="icon" onClick={() => setEditing(h)} aria-label="Muokkaa"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Poistetaanko huoltomerkintä?")) delM.mutate(h); }} aria-label="Poista"><Trash2 className="h-4 w-4" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
      ))}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Muokkaa huoltoa</DialogTitle></DialogHeader>
          {editing && (
            <HuoltoForm
              initial={editing}
              onSubmit={(v) => updM.mutate({ id: editing.id, ...v })}
              loading={updM.isPending}
              submitLabel="Tallenna muutokset"
              invalidate={invalidate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Liite = { nimi: string; tiedosto_polku: string; mime?: string | null; koko_bytes?: number | null };

function HuoltoForm({
  initial,
  onSubmit,
  loading,
  submitLabel = "Tallenna huolto",
  invalidate,
}: {
  initial?: any;
  onSubmit: (v: any) => void;
  loading: boolean;
  submitLabel?: string;
  invalidate: () => void;
}) {
  const [form, setForm] = useState<any>({
    tyyppi: initial?.tyyppi ?? "huolto",
    kohde: initial?.kohde ?? "",
    kuvaus: initial?.kuvaus ?? "",
    pvm: initial?.pvm ?? new Date().toISOString().slice(0, 10),
    tekija: initial?.tekija ?? "itse",
    tekija_nimi: initial?.tekija_nimi ?? "",
    kustannus: initial?.kustannus != null ? String(initial.kustannus) : "",
    takuu_vuotta: initial?.takuu_vuotta != null ? String(initial.takuu_vuotta) : "",
    pts_siirto: initial?.pts_siirto != null ? String(initial.pts_siirto) : "0",
  });
  const [paivitaTalo, setPaivitaTalo] = useState(false);
  const [laite, setLaite] = useState({ merkki: "", malli: "", asennusvuosi: "", materiaali: "" });
  const voiPaivittaa = tukeeLaitePaivitysta(form.kohde);
  const naytaMerkkiMalli = tukeeMerkkiMalli(form.kohde);
  const matOptiot = materiaalivaihtoehdot(form.kohde);
  const [uudet, setUudet] = useState<Liite[]>([]);
  const [vanhat, setVanhat] = useState<any[]>(initial?.liitteet ?? []);
  const [uploading, setUploading] = useState(false);

  const urlFn = useServerFn(getDokumenttiUrl);
  const delLiiteFn = useServerFn(deleteHuoltoLiite);

  const handleChange = (k: string, v: any) => setForm({ ...form, [k]: v });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Ei kirjautunutta käyttäjää");
      const ladatut: Liite[] = [];
      for (const file of Array.from(files)) {
        const safe = file.name.replace(/[^\w.\-]+/g, "_");
        const polku = `${uid}/huolto/${Date.now()}_${safe}`;
        const { error } = await supabase.storage.from("talo-dokumentit").upload(polku, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });
        if (error) throw error;
        ladatut.push({ nimi: file.name, tiedosto_polku: polku, mime: file.type || null, koko_bytes: file.size });
      }
      setUudet((u) => [...u, ...ladatut]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function poistaUusi(idx: number) {
    const l = uudet[idx];
    await supabase.storage.from("talo-dokumentit").remove([l.tiedosto_polku]);
    setUudet((u) => u.filter((_, i) => i !== idx));
  }

  async function poistaVanha(l: any) {
    if (!confirm(`Poistetaanko liite ${l.nimi}?`)) return;
    try {
      await delLiiteFn({ data: { id: l.id, tiedosto_polku: l.tiedosto_polku } });
      setVanhat((v) => v.filter((x) => x.id !== l.id));
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function avaaLiite(polku: string) {
    try {
      const r = await urlFn({ data: { polku } });
      window.open(r.url, "_blank");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const laite_paivitys = paivitaTalo && voiPaivittaa
          ? {
              merkki: naytaMerkkiMalli ? (laite.merkki.trim() || null) : null,
              malli: naytaMerkkiMalli ? (laite.malli.trim() || null) : null,
              asennusvuosi: laite.asennusvuosi ? Number(laite.asennusvuosi) : null,
              materiaali: matOptiot.length > 0 ? (laite.materiaali.trim() || null) : null,
            }
          : null;
        onSubmit({
          ...form,
          kustannus: Number(form.kustannus || 0),
          takuu_vuotta: Number(form.takuu_vuotta || 0),
          pts_siirto: Number(form.pts_siirto || 0),
          liitteet: uudet,
          laite_paivitys,
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Tyyppi *</Label>
          <Select value={form.tyyppi} onValueChange={(v) => handleChange("tyyppi", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {HUOLTO_TYYPIT.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Päivämäärä *</Label>
          <Input type="date" required value={form.pvm} onChange={(e) => handleChange("pvm", e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Kohde</Label>
        <Select value={form.kohde || undefined} onValueChange={(v) => handleChange("kohde", v)}>
          <SelectTrigger><SelectValue placeholder="Valitse kohde" /></SelectTrigger>
          <SelectContent className="max-h-72">
            {HUOLTO_KOHDE_RYHMAT.map((r) => (
              <SelectGroup key={r.ryhma}>
                <SelectLabel>{r.ryhma}</SelectLabel>
                {r.kohteet.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Kuvaus / lisätiedot</Label>
        <Textarea rows={2} value={form.kuvaus} onChange={(e) => handleChange("kuvaus", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Tekijä</Label>
          <Select value={form.tekija} onValueChange={(v) => handleChange("tekija", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="itse">Tein itse</SelectItem>
              <SelectItem value="ammattilainen">Ammattilainen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tekijän nimi</Label>
          <Input value={form.tekija_nimi ?? ""} onChange={(e) => handleChange("tekija_nimi", e.target.value)} disabled={form.tekija === "itse"} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Kustannus (€)</Label>
          <Input type="number" min="0" step="0.01" value={form.kustannus} onChange={(e) => handleChange("kustannus", e.target.value)} />
          <p className="text-[10px] text-muted-foreground">Siirtyy kulujenseurantaan</p>
        </div>
        <div className="space-y-2">
          <Label>Takuu (v)</Label>
          <Input type="number" min="0" value={form.takuu_vuotta} onChange={(e) => handleChange("takuu_vuotta", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>PTS-siirto (v)</Label>
          <Input type="number" min="0" max="50" value={form.pts_siirto} onChange={(e) => handleChange("pts_siirto", e.target.value)} />
          <p className="text-[10px] text-muted-foreground">Siirtää suositusta vuosilla</p>
        </div>
      </div>

      {voiPaivittaa && (
        <div className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-3">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={paivitaTalo}
              onChange={(e) => setPaivitaTalo(e.target.checked)}
              className="mt-1 accent-primary"
            />
            <span>
              <span className="text-cream font-medium">Päivitä talon tiedot tämän remontin perusteella</span>
              <span className="block text-xs text-muted-foreground">
                {naytaMerkkiMalli
                  ? `Asennusvuosi (ja tarvittaessa merkki/malli) tallennetaan kohteelle "${form.kohde}". Tieto päivittää myös PTS-suosituksen huolto- ja uusimissyklin.`
                  : `Uusi materiaali ja vuosi tallennetaan kohteelle "${form.kohde}". Tieto päivittää myös PTS-suosituksen huolto- ja uusimissyklin.`}
              </span>
            </span>
          </label>
          {paivitaTalo && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {naytaMerkkiMalli && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Merkki</Label>
                    <Input value={laite.merkki} onChange={(e) => setLaite({ ...laite, merkki: e.target.value })} placeholder="Esim. Nibe" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Malli</Label>
                    <Input value={laite.malli} onChange={(e) => setLaite({ ...laite, malli: e.target.value })} placeholder="Esim. S1255-12" />
                  </div>
                </>
              )}
              {matOptiot.length > 0 && (
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <Label className="text-xs">Materiaali / tyyppi</Label>
                  <Select value={laite.materiaali || undefined} onValueChange={(v) => setLaite({ ...laite, materiaali: v })}>
                    <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                    <SelectContent>
                      {matOptiot.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">{naytaMerkkiMalli ? "Asennusvuosi" : "Uusittu vuosi"}</Label>
                <Input type="number" min="1900" max="2100" value={laite.asennusvuosi} onChange={(e) => setLaite({ ...laite, asennusvuosi: e.target.value })} placeholder={String(new Date(form.pvm).getFullYear())} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Liitteet (kuitit, tarjoukset, valokuvat)</Label>
        <div className="rounded-md border border-dashed border-border p-3 space-y-2">
          {vanhat.length > 0 && (
            <ul className="space-y-1">
              {vanhat.map((l) => (
                <li key={l.id} className="flex items-center gap-2 text-sm">
                  <Paperclip className="h-3 w-3 text-primary shrink-0" />
                  <button type="button" onClick={() => avaaLiite(l.tiedosto_polku)} className="flex-1 text-left truncate hover:underline">{l.nimi}</button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => poistaVanha(l)}><X className="h-3 w-3" /></Button>
                </li>
              ))}
            </ul>
          )}
          {uudet.length > 0 && (
            <ul className="space-y-1">
              {uudet.map((l, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Paperclip className="h-3 w-3 text-primary shrink-0" />
                  <span className="flex-1 truncate">{l.nimi}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => poistaUusi(i)}><X className="h-3 w-3" /></Button>
                </li>
              ))}
            </ul>
          )}
          <label className="flex items-center justify-center gap-2 text-sm text-muted-foreground cursor-pointer py-2 hover:text-foreground">
            <Upload className="h-4 w-4" />
            {uploading ? "Ladataan..." : "Lisää liitteitä"}
            <input
              type="file"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            />
          </label>
        </div>
      </div>

      <Button type="submit" disabled={loading || uploading} className="w-full uppercase tracking-wider font-semibold">
        {loading ? "Tallennetaan..." : submitLabel}
      </Button>
    </form>
  );
}

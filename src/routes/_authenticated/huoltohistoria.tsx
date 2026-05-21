import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addHuolto, deleteHuolto, getHuollot, updateHuolto } from "@/lib/kotivahti.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/huoltohistoria")({
  component: HuoltoPage,
});

function HuoltoPage() {
  const fetchFn = useServerFn(getHuollot);
  const addFn = useServerFn(addHuolto);
  const updFn = useServerFn(updateHuolto);
  const delFn = useServerFn(deleteHuolto);
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["huollot"], queryFn: () => fetchFn() });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["huollot"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["kuitatut"] });
    qc.invalidateQueries({ queryKey: ["kulut"] });
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
    mutationFn: (id: string) => delFn({ data: { id } }),
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
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-serif text-2xl">Lisää huoltomerkintä</DialogTitle></DialogHeader>
            <HuoltoForm onSubmit={(v) => addM.mutate(v)} loading={addM.isPending} />
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
                      </div>
                    </div>
                    {Number(h.kustannus) > 0 && <span className="font-mono text-primary">{Number(h.kustannus).toFixed(0)} €</span>}
                    <Button variant="ghost" size="icon" onClick={() => setEditing(h)} aria-label="Muokkaa"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Poistetaanko huoltomerkintä?")) delM.mutate(h.id); }} aria-label="Poista"><Trash2 className="h-4 w-4" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
      ))}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-serif text-2xl">Muokkaa huoltoa</DialogTitle></DialogHeader>
          {editing && (
            <HuoltoForm
              initial={editing}
              onSubmit={(v) => updM.mutate({ id: editing.id, ...v })}
              loading={updM.isPending}
              submitLabel="Tallenna muutokset"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HuoltoForm({
  initial,
  onSubmit,
  loading,
  submitLabel = "Tallenna huolto",
}: {
  initial?: any;
  onSubmit: (v: any) => void;
  loading: boolean;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<any>({
    tyyppi: initial?.tyyppi ?? "",
    kohde: initial?.kohde ?? "",
    kuvaus: initial?.kuvaus ?? "",
    pvm: initial?.pvm ?? new Date().toISOString().slice(0, 10),
    tekija: initial?.tekija ?? "itse",
    tekija_nimi: initial?.tekija_nimi ?? "",
    kustannus: initial?.kustannus != null ? String(initial.kustannus) : "",
    takuu_vuotta: initial?.takuu_vuotta != null ? String(initial.takuu_vuotta) : "",
    pts_siirto: !!initial?.pts_siirto,
  });
  const handleChange = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({
      ...form,
      kustannus: Number(form.kustannus || 0),
      takuu_vuotta: Number(form.takuu_vuotta || 0),
    }); }} className="space-y-4">
      <div className="space-y-2"><Label>Tyyppi *</Label><Input required value={form.tyyppi} onChange={(e) => handleChange("tyyppi", e.target.value)} placeholder="Esim. Katon tarkistus" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Kohde</Label><Input value={form.kohde} onChange={(e) => handleChange("kohde", e.target.value)} placeholder="Esim. Pääkatto" /></div>
        <div className="space-y-2"><Label>Päivämäärä *</Label><Input type="date" required value={form.pvm} onChange={(e) => handleChange("pvm", e.target.value)} /></div>
      </div>
      <div className="space-y-2"><Label>Kuvaus / lisätiedot</Label><Textarea rows={2} value={form.kuvaus} onChange={(e) => handleChange("kuvaus", e.target.value)} /></div>
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
        <div className="space-y-2"><Label>Tekijän nimi</Label><Input value={form.tekija_nimi ?? ""} onChange={(e) => handleChange("tekija_nimi", e.target.value)} disabled={form.tekija === "itse"} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>Kustannus (€)</Label><Input type="number" min="0" step="0.01" value={form.kustannus} onChange={(e) => handleChange("kustannus", e.target.value)} /></div>
        <div className="space-y-2"><Label>Takuu (vuotta)</Label><Input type="number" min="0" value={form.takuu_vuotta} onChange={(e) => handleChange("takuu_vuotta", e.target.value)} /></div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="pts" checked={form.pts_siirto} onCheckedChange={(v) => handleChange("pts_siirto", !!v)} />
        <Label htmlFor="pts" className="font-normal cursor-pointer">Siirrä PTS-suunnitelmaan (tulossa)</Label>
      </div>
      <Button type="submit" disabled={loading} className="w-full uppercase tracking-wider font-semibold">
        {loading ? "Tallennetaan..." : submitLabel}
      </Button>
    </form>
  );
}

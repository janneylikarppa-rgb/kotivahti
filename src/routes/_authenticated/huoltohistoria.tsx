import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  addHuolto,
  deleteHuolto,
  getHuollot,
  updateHuolto,
} from "@/lib/kotivahti.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HuoltoForm } from "@/components/huolto-form";
import { Paperclip, Pencil, Plus, Trash2 } from "lucide-react";
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
                    {Number(h.kustannus) > 0 && (
                      <span className="font-mono text-primary flex items-center gap-1" title={h.kulu_id ? "Linkitetty kuluihin" : undefined}>
                        {h.kulu_id && <span aria-label="Linkitetty kuluihin">💰</span>}
                        {Number(h.kustannus).toFixed(0)} €
                      </span>
                    )}
                    
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


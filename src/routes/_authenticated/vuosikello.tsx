import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getKuitatut, kuittaaHuolto } from "@/lib/kotivahti.functions";
import { KAUDET, PERUSHUOLLOT, type Kausi } from "@/lib/vuosikello-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vuosikello")({
  component: VuosikelloPage,
});

function autoKausi(): Kausi {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "kevat";
  if (m >= 6 && m <= 8) return "kesa";
  if (m >= 9 && m <= 11) return "syksy";
  return "talvi";
}

function VuosikelloPage() {
  const fetchFn = useServerFn(getKuitatut);
  const kuittaaFn = useServerFn(kuittaaHuolto);
  const qc = useQueryClient();
  const { data: kuitatut = [] } = useQuery({ queryKey: ["kuitatut"], queryFn: () => fetchFn() });
  const [kausi, setKausi] = useState<Kausi>(autoKausi());
  const [valittu, setValittu] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (v: any) => kuittaaFn({ data: v }),
    onSuccess: () => { toast.success("Merkattu tehdyksi"); qc.invalidateQueries({ queryKey: ["kuitatut"] }); qc.invalidateQueries({ queryKey: ["kulut"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setValittu(null); },
    onError: (e: any) => toast.error(e.message),
  });

  const onKuitattu = (nimi: string) => (kuitatut as any[]).some((k) => k.kausi_key === kausi && k.huolto_nimi === nimi);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Vuosikello {new Date().getFullYear()}</p>
        <h1 className="font-serif text-4xl text-cream">Kauden <em className="text-primary not-italic italic">työt</em></h1>
        <p className="mt-3 text-muted-foreground">Kuittaa tehdyt huollot. Merkinnät nollautuvat vuoden vaihtuessa.</p>
      </header>

      {/* Kausi-välilehdet */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {KAUDET.map((k) => {
          const total = PERUSHUOLLOT[k.key].length;
          const done = (kuitatut as any[]).filter((x) => x.kausi_key === k.key).length;
          return (
            <button key={k.key} onClick={() => setKausi(k.key)}
              className={`flex flex-col items-center gap-1 rounded-md border p-3 transition ${
                kausi === k.key ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              }`}>
              <span className="text-2xl">{k.ikoni}</span>
              <span className="text-xs uppercase tracking-wider">{k.nimi}</span>
              <span className={`text-[10px] font-mono ${done === total && total > 0 ? "text-primary" : "text-muted-foreground"}`}>{done}/{total}</span>
            </button>
          );
        })}
      </div>

      <Card className="gold-card">
        <CardContent className="pt-6">
          <ul className="divide-y divide-border/60">
            {PERUSHUOLLOT[kausi].map((nimi) => {
              const done = onKuitattu(nimi);
              return (
                <li key={nimi} className="flex items-center gap-3 py-3">
                  <button onClick={() => !done && setValittu(nimi)} className="shrink-0">
                    {done
                      ? <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" /></span>
                      : <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition" />}
                  </button>
                  <span className={`flex-1 ${done ? "text-muted-foreground line-through" : "text-cream"}`}>{nimi}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={!!valittu} onOpenChange={(o) => !o && setValittu(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif text-xl">Kuittaa tehdyksi</DialogTitle></DialogHeader>
          {valittu && <KuittausForm nimi={valittu} onSubmit={(v) => mut.mutate({ kausi_key: kausi, huolto_nimi: valittu, ...v })} loading={mut.isPending} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KuittausForm({ nimi, onSubmit, loading }: { nimi: string; onSubmit: (v: any) => void; loading: boolean }) {
  const [tekija, setTekija] = useState("itse");
  const [hinta, setHinta] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ tekija, hinta: Number(hinta || 0) }); }} className="space-y-4">
      <p className="text-sm text-muted-foreground">{nimi}</p>
      <div className="space-y-2">
        <Label>Kuka teki?</Label>
        <Select value={tekija} onValueChange={setTekija}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="itse">Tein itse</SelectItem>
            <SelectItem value="ammattilainen">Ammattilainen</SelectItem>
            <SelectItem value="jatetaan">Jätetään tekemättä</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {tekija !== "jatetaan" && (
        <div className="space-y-2"><Label>Kustannus (€)</Label><Input type="number" min="0" step="0.01" value={hinta} onChange={(e) => setHinta(e.target.value)} /></div>
      )}
      <Button type="submit" disabled={loading} className="w-full uppercase tracking-wider font-semibold">
        {loading ? "Tallennetaan..." : "Kuittaa"}
      </Button>
    </form>
  );
}

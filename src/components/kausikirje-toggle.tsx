import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getOmaMetriikka, paivitaKausikirjeSuostumus } from "@/lib/palaute.functions";
import { toast } from "sonner";

export function KausikirjeToggle() {
  const haeFn = useServerFn(getOmaMetriikka);
  const tallennaFn = useServerFn(paivitaKausikirjeSuostumus);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["oma-metriikka"], queryFn: () => haeFn(), staleTime: 60_000 });
  const mut = useMutation({
    mutationFn: (suostumus: boolean) => tallennaFn({ data: { suostumus } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["oma-metriikka"] }); toast.success("Asetus tallennettu"); },
    onError: (e: any) => toast.error(e.message),
  });
  const arvo = !!data?.kausikirje_suostumus;

  return (
    <Card className="gold-card">
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-serif text-cream">Kausimuistutukset sähköpostiin</p>
          <p className="text-xs text-muted-foreground mt-1">Saat 4× vuodessa kauden tärkeimmät huoltovinkit sähköpostiisi.</p>
        </div>
        <Switch checked={arvo} onCheckedChange={(v) => mut.mutate(v)} disabled={mut.isPending} />
      </CardContent>
    </Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getOmatLiidit } from "@/lib/liidit.functions";
import { LiidiDialog } from "@/components/liidi-dialog";
import { LIIDI_STATUKSET, LIIDI_PALVELUT } from "@/lib/liidit-kategoriat";

export const Route = createFileRoute("/_authenticated/pyynnot")({
  component: PyynnotPage,
});

function statusBadge(s: string) {
  const found = LIIDI_STATUKSET.find((x) => x.arvo === s);
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${found?.vari ?? "border-border text-muted-foreground"}`}>
      {found?.nimi ?? s}
    </span>
  );
}

function palveluNimi(p: string) {
  return LIIDI_PALVELUT.find((x) => x.arvo === p)?.nimi ?? p;
}

function PyynnotPage() {
  const fetchFn = useServerFn(getOmatLiidit);
  const { data = [], isLoading } = useQuery({ queryKey: ["omat-liidit"], queryFn: () => fetchFn() });
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Pyynnöt</p>
          <h1 className="font-serif text-4xl text-cream">Tilatut <em className="text-primary not-italic italic">palvelut</em></h1>
          <p className="mt-3 text-muted-foreground">Lähettämäsi kartoitus-, huolto- ja tarjouspyynnöt.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="uppercase tracking-wider font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Tilaa palvelu
        </Button>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Ladataan...</p>
      ) : (data as any[]).length === 0 ? (
        <Card className="gold-card">
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-muted-foreground">Et ole vielä tilannut palveluita.</p>
            <p className="text-xs text-muted-foreground">Voit pyytää kuntoarvion, huollon tai tarjouksen suoraan ammattilaisverkostostamme.</p>
            <Button onClick={() => setOpen(true)} className="uppercase tracking-wider font-semibold mt-2">
              Tilaa ensimmäinen palvelu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {(data as any[]).map((l) => (
            <Card key={l.id} className="gold-card">
              <CardContent className="py-4 flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-serif text-cream">{palveluNimi(l.palvelu)}</span>
                    <span className="text-sm text-muted-foreground">· {l.kategoria}</span>
                  </div>
                  {l.kuvaus && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{l.kuvaus}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{new Date(l.created_at).toLocaleDateString("fi-FI")}</span>
                    {l.osoite && <span>{l.osoite}</span>}
                  </div>
                </div>
                {statusBadge(l.status)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LiidiDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

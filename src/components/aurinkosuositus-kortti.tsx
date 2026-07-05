import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LiidiDialog } from "@/components/liidi-dialog";

export type AurinkoTiedot = {
  suositus: boolean;
  aurinkokuukaudet_kk: number;
  aurinkokuukaudet_kwh: number;
  data_kuukausia: number;
  aurinkopaneelit: boolean;
};

export function AurinkoSuositusKortti({ aurinko }: { aurinko: AurinkoTiedot | null | undefined }) {
  const [open, setOpen] = useState(false);
  if (!aurinko || !aurinko.suositus) return null;

  return (
    <>
      <Card className="gold-card">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl leading-none" aria-hidden>☀️</div>
            <div className="flex-1 space-y-3">
              <h3 className="font-serif text-xl text-cream">
                Aurinkosähkö – kannattaako talossasi?
              </h3>
              <p className="text-sm text-cream/80">
                Talosi sähkönkulutus viimeisen {aurinko.data_kuukausia} kuukauden ajalta
                viittaa siihen, että aurinkosähkö voi olla sinulle kannattava hankinta.
              </p>
              <p className="text-sm text-cream/70">
                Jokainen talo on erilainen – katon suunta, varjostukset ja rakenne
                ratkaisevat lopulta sen, onko investointi juuri sinun kohdallasi järkevä.
                Siksi paras seuraava askel on ammattilaisen arvio.
              </p>
              <div className="pt-1">
                <Button onClick={() => setOpen(true)}>
                  Tilaa ilmainen kartoitus →
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Kartoitus on maksuton eikä sido mihinkään.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <LiidiDialog
        open={open}
        onOpenChange={setOpen}
        esitaytetty={{
          palvelu: "kuntoarvio",
          kategoria: "Aurinkosähkö ja paneelit",
          kuvaus: "Aurinkosähkökartoitus",
          lukitseKategoria: true,
        }}
      />
    </>
  );
}

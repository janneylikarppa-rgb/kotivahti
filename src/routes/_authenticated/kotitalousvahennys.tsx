import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getKotitalousvahennys } from "@/lib/kotiluotsi.functions";
import {
  laskeVahennys, vahennysVari, euro,
  ENIMMAISMAARA, OMAVASTUU, LAHDE,
} from "@/lib/kotitalousvahennys";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/kotitalousvahennys")({
  head: () => ({
    meta: [
      { title: "Kotitalousvähennys – Kotiluotsi" },
      { name: "description", content: "Seuraa kotitalousvähennyksen kertymää kirjatuista huoltotöistä ja arvioi verovähennyksesi." },
      { property: "og:title", content: "Kotitalousvähennys – Kotiluotsi" },
      { property: "og:description", content: "Seuraa kotitalousvähennyksen kertymää kirjatuista huoltotöistä ja arvioi verovähennyksesi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KotitalousvahennysPage,
});

const NYT = new Date().getFullYear();
const VUODET = [NYT + 1, NYT, NYT - 1, NYT - 2, NYT - 3];

function KotitalousvahennysPage() {
  const [vuosi, setVuosi] = useState(NYT);
  const [henkiloita, setHenkiloita] = useState(1);
  const [avattu, setAvattu] = useState(false);

  const haeFn = useServerFn(getKotitalousvahennys);
  const { data, isLoading } = useQuery({
    queryKey: ["kotitalousvahennys", vuosi],
    queryFn: () => haeFn({ data: { vuosi } }),
    staleTime: 30_000,
  });

  const kirjaukset = data?.kirjaukset ?? [];
  const tulos = laskeVahennys(kirjaukset as any, henkiloita);
  const vari = vahennysVari(tulos.tayttoaste);
  const palkkiVari = vari === "harmaa" ? "bg-muted-foreground" : vari === "oranssi" ? "bg-orange-500" : "bg-primary";

  return (
    <div className="space-y-6 fade-up">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Verotus</p>
        <h1 className="font-serif italic text-3xl text-cream">Kotitalousvähennys</h1>
      </header>

      {/* Kontrollit */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Vuosi</p>
          <Select value={String(vuosi)} onValueChange={(v) => setVuosi(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {VUODET.map((v) => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Henkilöt</p>
          <div className="flex gap-2">
            <Button variant={henkiloita === 1 ? "default" : "outline"} size="sm" onClick={() => setHenkiloita(1)}>1 henkilö</Button>
            <Button variant={henkiloita === 2 ? "default" : "outline"} size="sm" onClick={() => setHenkiloita(2)}>2 henkilöä</Button>
          </div>
        </div>
      </div>

      {/* Verovähennyskortti */}
      <Card className="gold-card">
        <CardContent className="py-6 space-y-2">
          <p className="text-sm text-muted-foreground">Arvioitu verovähennys</p>
          <p className="font-serif text-4xl text-primary">{isLoading ? "–" : euro(tulos.vahennys)}</p>
          <p className="text-sm text-muted-foreground">
            {henkiloita === 1
              ? "Perustuu kirjattuihin työkustannuksiin."
              : `Omavastuu lasketaan erikseen kummallekin (${OMAVASTUU} € / henkilö).`}
          </p>
        </CardContent>
      </Card>

      {/* Edistymispalkki */}
      <Card className="gold-card">
        <CardContent className="py-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-cream">Kotitalousvähennys {vuosi}</span>
            <span className="font-mono text-muted-foreground">
              {euro(tulos.vahennys)} / {euro(tulos.katto)}
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted/30 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${palkkiVari}`}
              style={{ width: `${Math.round(tulos.tayttoaste * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Laskentaselitys */}
      <Card className="gold-card">
        <CardContent className="py-4">
          <button
            type="button"
            onClick={() => setAvattu((a) => !a)}
            className="flex w-full items-center justify-between text-left text-cream"
          >
            <span>Miten vähennys lasketaan?</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${avattu ? "rotate-180" : ""}`} />
          </button>
          {avattu && (
            <div className="mt-4 space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="text-cream">Yritykseltä ostettu työ</p>
                <p>Työn osuus × 35 % – omavastuu {OMAVASTUU} € = verovähennys (max {ENIMMAISMAARA} € / henkilö)</p>
                <p className="mt-2">Esimerkki:</p>
                <p>Työn osuus 800 €</p>
                <p>800 × 35 % = 280 €</p>
                <p>280 – 150 € = 130 € verovähennystä</p>
              </div>
              <div>
                <p className="text-cream">Palkattu työntekijä</p>
                <p>Palkka × 13 % + työnantajan sivukulut = verovähennys (max {ENIMMAISMAARA} € / henkilö)</p>
              </div>
              <p>Huom: Vähennys tehdään suoraan veroistasi – ei tuloistasi.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tapahtumalista */}
      <section className="space-y-3">
        <h2 className="font-serif italic text-xl text-cream">Vähennyskelpoiset toimenpiteet</h2>
        {kirjaukset.length === 0 ? (
          <Card className="gold-card">
            <CardContent className="py-6 space-y-3 text-sm text-muted-foreground">
              <p>
                Ei vähennyskelpoisia toimenpiteitä. Merkitse työn osuus huoltoja kirjatessa jotta ne näkyvät tässä.
              </p>
              <Button asChild size="sm">
                <Link to="/huoltohistoria"><Plus className="h-4 w-4 mr-1" /> Lisää toimenpide</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {kirjaukset.map((k: any) => (
              <Card key={k.id} className="gold-card">
                <CardContent className="py-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-cream">
                      <span className="text-muted-foreground mr-2">
                        {new Date(k.pvm).toLocaleDateString("fi-FI")}
                      </span>
                      {k.kuvaus || k.kohde || k.tyyppi}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {k.tekija === "itse" ? "Tein itse" : k.tekija_nimi || "Ammattilainen"} · Työn osuus: {euro(Number(k.tyon_osuus ?? 0))}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-primary">
                    {k.kotitalousvahennys_tyyppi === "palkka" ? "palkattu työntekijä" : "yritys"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <p className="text-[11px] text-muted-foreground">
        Tämä on arvio perustuen ilmoittamiisi tietoihin. Lopullinen verovähennys vahvistetaan veroilmoituksessa.
        Lähde: {LAHDE.replace("vero.fi ", "vero.fi (vahvistettu ")}{")"}
      </p>
    </div>
  );
}

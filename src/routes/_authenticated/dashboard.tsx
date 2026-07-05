import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/kotivahti.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, Wallet, CalendarDays, Home, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";


export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => {
    if (typeof window === "undefined") return null;
    return context.queryClient.ensureQueryData({ queryKey: ["dashboard"], queryFn: () => getDashboard(), staleTime: 30_000 });
  },
  component: DashboardPage,
});

const KK = ["Tam", "Hel", "Maa", "Huh", "Tou", "Kes", "Hei", "Elo", "Syy", "Lok", "Mar", "Jou"];

function DashboardPage() {
  const fetchFn = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchFn(), staleTime: 30_000 });

  if (isLoading) return <div className="text-muted-foreground">Ladataan...</div>;
  if (!data) return null;

  const kulutPerKk = Array.from({ length: 12 }, (_, i) => ({
    kk: KK[i],
    summa: (data.kulut ?? []).filter((k: any) => new Date(k.pvm).getMonth() === i).reduce((s: number, k: any) => s + Number(k.summa || 0), 0),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="animate-fade-up">
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Talosi tilanne</p>
        <h1 className="font-serif text-4xl md:text-5xl text-cream">
          Hei{data.nimi ? `, ${data.nimi}` : ""} – <em className="text-primary not-italic italic">talosi tänään</em>
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          {data.kiinteisto?.osoite ? <>{data.kiinteisto.osoite}{data.kiinteisto.kaupunki ? `, ${data.kiinteisto.kaupunki}` : ""}</> : "Täytä talosi perustiedot, niin saat tarkemman näkymän."}
        </p>
      </header>


      <AurinkoSuositusKortti aurinko={(data as any).aurinko} />

      {/* Edistyminen */}
      <Card className="gold-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="eyebrow">Talon tietojen edistyminen</p>
              <p className="mt-2 font-serif text-2xl text-cream">{data.valmiitOsiot ?? 0} / 6 osiota täytetty</p>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/talon-tiedot">Täydennä <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <Progress value={data.edistyminen} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="gold-card">
          <CardHeader className="pb-3"><CardTitle className="text-base font-serif flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Viimeisimmät huollot</CardTitle></CardHeader>
          <CardContent>
            {data.huollot.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ei vielä kirjattuja huoltoja.</p>
            ) : (
              <ul className="space-y-3">
                {data.huollot.slice(0, 4).map((h: any) => (
                  <li key={h.id} className="flex items-start gap-3 border-l-2 border-primary/40 pl-3">
                    <div className="flex-1">
                      <p className="text-sm text-cream">{h.tyyppi}{h.kohde && <> · <span className="text-muted-foreground">{h.kohde}</span></>}</p>
                      <p className="text-xs text-muted-foreground">{new Date(h.pvm).toLocaleDateString("fi-FI")}</p>
                    </div>
                    {Number(h.kustannus) > 0 && <span className="text-xs text-primary font-mono">{Number(h.kustannus).toFixed(0)} €</span>}
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" className="px-0 mt-3 text-primary"><Link to="/huoltohistoria">Kaikki huollot →</Link></Button>
          </CardContent>
        </Card>

        <Card className="gold-card">
          <CardHeader className="pb-3"><CardTitle className="text-base font-serif flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Kulut tänä vuonna</CardTitle></CardHeader>
          <CardContent>
            <p className="font-serif text-3xl text-primary">{data.kulutSumma.toFixed(0)} €</p>
            <p className="text-xs text-muted-foreground mt-1">{new Date().getFullYear()} yhteensä</p>
            <div className="mt-4 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kulutPerKk}>
                  <Bar dataKey="summa" fill="var(--gold)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Button asChild variant="link" className="px-0 mt-2 text-primary"><Link to="/kulut">Avaa kulut →</Link></Button>
          </CardContent>
        </Card>

        <Card className="gold-card">
          <CardHeader className="pb-3"><CardTitle className="text-base font-serif flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Vuosikello</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tarkista kauden työt ja kuittaa tehdyt.</p>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {["🌱", "☀️", "🍂", "❄️"].map((i) => (
                <div key={i} className="rounded-md border border-border/60 bg-surface-2 py-2 text-lg">{i}</div>
              ))}
            </div>
            <Button asChild variant="link" className="px-0 mt-3 text-primary"><Link to="/vuosikello">Avaa vuosikello →</Link></Button>
          </CardContent>
        </Card>

        <Card className="gold-card md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base font-serif flex items-center gap-2"><Home className="h-4 w-4 text-primary" /> Kuluerittely kuukausittain</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kulutPerKk}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="kk" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} cursor={{ fill: "color-mix(in oklab, var(--gold) 8%, transparent)" }} />
                  <Bar dataKey="summa" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>



        <Card className="gold-card">
          <CardHeader className="pb-3"><CardTitle className="text-base font-serif flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Myyntiraportti</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tulosta dokumentoitu raportti välittäjälle – huollot, remontit ja liitteet yhdessä paketissa.</p>
            <Button asChild variant="link" className="px-0 mt-3 text-primary"><Link to="/myyntiraportti">Avaa raportti →</Link></Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}


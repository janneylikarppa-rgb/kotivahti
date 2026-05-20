import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getTaloTiedot, saveTaloTiedot } from "@/lib/kotivahti.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/talon-tiedot")({
  component: TaloTiedotPage,
});

const OSIOT = [
  { key: "perustiedot", nimi: "Perustiedot" },
  { key: "rakennus", nimi: "Rakennus" },
  { key: "katto", nimi: "Katto ja räystäät" },
  { key: "tekniset", nimi: "Tekniset järjestelmät" },
  { key: "ulkoalueet", nimi: "Ulkoalueet" },
  { key: "dokumentit", nimi: "Dokumentit" },
];

const LAMMITYS = ["maalämpö", "ilmavesilämpö", "kaukolämpö", "öljylämmitys", "puulämmitys", "sähkölämmitys", "ilmalämpöpumppu", "pellettilämmitys", "muu"];

function num(v: any) { return v === "" || v == null ? null : Number(v); }

function TaloTiedotPage() {
  const fetchFn = useServerFn(getTaloTiedot);
  const saveFn = useServerFn(saveTaloTiedot);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["talo"], queryFn: () => fetchFn() });
  const [active, setActive] = useState(0);
  const [k, setK] = useState<any>({});
  const [t, setT] = useState<any>({});
  const [valmiit, setValmiit] = useState<string[]>([]);

  useEffect(() => {
    if (data?.kiinteisto) setK(data.kiinteisto);
    if (data?.talo) {
      setT(data.talo);
      setValmiit(Array.isArray(data.talo.valmiit_osiot) ? data.talo.valmiit_osiot as string[] : []);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: (osioKey?: string) => {
      const uudet = osioKey && !valmiit.includes(osioKey) ? [...valmiit, osioKey] : valmiit;
      return saveFn({ data: {
        kiinteisto: {
          nimi: k.nimi, osoite: k.osoite, postinumero: k.postinumero, kaupunki: k.kaupunki,
          rakennusvuosi: num(k.rakennusvuosi),
        },
        talo: {
          pinta_ala: num(t.pinta_ala), tilavuus: num(t.tilavuus),
          kerroksia: num(t.kerroksia), asukkaita: num(t.asukkaita),
          rakennustapa: t.rakennustapa, julkisivumateriaali: t.julkisivumateriaali,
          julkisivu_maalattu_vuosi: num(t.julkisivu_maalattu_vuosi),
          kattotyyppi: t.kattotyyppi, kattomateriaali: t.kattomateriaali,
          katto_uusittu_vuosi: num(t.katto_uusittu_vuosi),
          raystaat_kunnostettu_vuosi: num(t.raystaat_kunnostettu_vuosi),
          lammitysmuoto: t.lammitysmuoto, lammitys_asennettu_vuosi: num(t.lammitys_asennettu_vuosi),
          ilmanvaihto: t.ilmanvaihto, ilmanvaihto_vuosi: num(t.ilmanvaihto_vuosi),
          putket_uusittu_vuosi: num(t.putket_uusittu_vuosi),
          putkimateriaali: t.putkimateriaali,
          viemari_uusittu_vuosi: num(t.viemari_uusittu_vuosi),
          sahkot_uusittu_vuosi: num(t.sahkot_uusittu_vuosi),
          tontin_pinta_ala: num(t.tontin_pinta_ala),
          pihan_tyyppi: t.pihan_tyyppi, piha_lisatieto: t.piha_lisatieto,
          valmiit_osiot: uudet,
        },
      }}).then(() => { setValmiit(uudet); });
    },
    onSuccess: () => { toast.success("Tallennettu"); qc.invalidateQueries({ queryKey: ["talo"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Ladataan...</p>;

  const edistyminen = Math.round((valmiit.length / OSIOT.length) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Talon tiedot</p>
        <h1 className="font-serif text-4xl text-cream">Rakennuksen <em className="text-primary not-italic italic">profiili</em></h1>
        <div className="mt-6 flex items-center justify-between gap-4">
          <Progress value={edistyminen} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground font-mono">{valmiit.length}/{OSIOT.length}</span>
        </div>
      </header>

      {/* Step-navigation */}
      <div className="flex flex-wrap gap-2">
        {OSIOT.map((o, i) => (
          <button key={o.key} onClick={() => setActive(i)}
            className={`px-3 py-2 text-xs uppercase tracking-wider rounded-md border transition ${
              i === active ? "border-primary bg-primary/10 text-primary"
                : valmiit.includes(o.key) ? "border-primary/30 text-cream"
                : "border-border text-muted-foreground hover:text-cream"
            }`}>
            <span className="font-mono mr-2">{i + 1}</span>{o.nimi}
            {valmiit.includes(o.key) && <Check className="ml-2 inline h-3 w-3 text-primary" />}
          </button>
        ))}
      </div>

      <Card className="gold-card">
        <CardContent className="pt-6 space-y-5">
          {active === 0 && (<>
            <h3 className="font-serif text-xl text-cream">1. Perustiedot</h3>
            <Row><Field label="Talon nimi"><Input value={k.nimi ?? ""} onChange={(e) => setK({ ...k, nimi: e.target.value })} /></Field>
              <Field label="Rakennusvuosi"><Input type="number" value={k.rakennusvuosi ?? ""} onChange={(e) => setK({ ...k, rakennusvuosi: e.target.value })} /></Field></Row>
            <Field label="Osoite"><Input value={k.osoite ?? ""} onChange={(e) => setK({ ...k, osoite: e.target.value })} /></Field>
            <Row><Field label="Postinumero"><Input value={k.postinumero ?? ""} onChange={(e) => setK({ ...k, postinumero: e.target.value })} /></Field>
              <Field label="Kaupunki"><Input value={k.kaupunki ?? ""} onChange={(e) => setK({ ...k, kaupunki: e.target.value })} /></Field></Row>
            <Row><Field label="Asukkaita"><Input type="number" value={t.asukkaita ?? ""} onChange={(e) => setT({ ...t, asukkaita: e.target.value })} /></Field>
              <Field label="Kerroksia"><Input type="number" value={t.kerroksia ?? ""} onChange={(e) => setT({ ...t, kerroksia: e.target.value })} /></Field></Row>
          </>)}

          {active === 1 && (<>
            <h3 className="font-serif text-xl text-cream">2. Rakennus</h3>
            <Row><Field label="Pinta-ala (m²)"><Input type="number" value={t.pinta_ala ?? ""} onChange={(e) => setT({ ...t, pinta_ala: e.target.value })} /></Field>
              <Field label="Tilavuus (m³)"><Input type="number" value={t.tilavuus ?? ""} onChange={(e) => setT({ ...t, tilavuus: e.target.value })} /></Field></Row>
            <Row><Field label="Rakennustapa"><Input value={t.rakennustapa ?? ""} onChange={(e) => setT({ ...t, rakennustapa: e.target.value })} placeholder="Esim. puurunko" /></Field>
              <Field label="Julkisivumateriaali"><Input value={t.julkisivumateriaali ?? ""} onChange={(e) => setT({ ...t, julkisivumateriaali: e.target.value })} /></Field></Row>
            <Field label="Julkisivu maalattu (vuosi)"><Input type="number" value={t.julkisivu_maalattu_vuosi ?? ""} onChange={(e) => setT({ ...t, julkisivu_maalattu_vuosi: e.target.value })} /></Field>
          </>)}

          {active === 2 && (<>
            <h3 className="font-serif text-xl text-cream">3. Katto ja räystäät</h3>
            <Row><Field label="Kattotyyppi"><Input value={t.kattotyyppi ?? ""} onChange={(e) => setT({ ...t, kattotyyppi: e.target.value })} placeholder="Harja, tasa, ..." /></Field>
              <Field label="Kattomateriaali"><Input value={t.kattomateriaali ?? ""} onChange={(e) => setT({ ...t, kattomateriaali: e.target.value })} placeholder="Pelti, tiili, ..." /></Field></Row>
            <Row><Field label="Katto uusittu (vuosi)"><Input type="number" value={t.katto_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, katto_uusittu_vuosi: e.target.value })} /></Field>
              <Field label="Räystäät kunnostettu (vuosi)"><Input type="number" value={t.raystaat_kunnostettu_vuosi ?? ""} onChange={(e) => setT({ ...t, raystaat_kunnostettu_vuosi: e.target.value })} /></Field></Row>
          </>)}

          {active === 3 && (<>
            <h3 className="font-serif text-xl text-cream">4. Tekniset järjestelmät</h3>
            <Row><Field label="Lämmitysmuoto">
              <Select value={t.lammitysmuoto ?? ""} onValueChange={(v) => setT({ ...t, lammitysmuoto: v })}>
                <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                <SelectContent>{LAMMITYS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select></Field>
              <Field label="Lämmitys asennettu (vuosi)"><Input type="number" value={t.lammitys_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, lammitys_asennettu_vuosi: e.target.value })} /></Field></Row>
            <Row><Field label="Ilmanvaihto"><Input value={t.ilmanvaihto ?? ""} onChange={(e) => setT({ ...t, ilmanvaihto: e.target.value })} placeholder="Painovoimainen, koneellinen..." /></Field>
              <Field label="Ilmanvaihto uusittu (vuosi)"><Input type="number" value={t.ilmanvaihto_vuosi ?? ""} onChange={(e) => setT({ ...t, ilmanvaihto_vuosi: e.target.value })} /></Field></Row>
            <Row><Field label="Putkimateriaali"><Input value={t.putkimateriaali ?? ""} onChange={(e) => setT({ ...t, putkimateriaali: e.target.value })} /></Field>
              <Field label="Putket uusittu (vuosi)"><Input type="number" value={t.putket_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, putket_uusittu_vuosi: e.target.value })} /></Field></Row>
            <Row><Field label="Viemäri uusittu (vuosi)"><Input type="number" value={t.viemari_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, viemari_uusittu_vuosi: e.target.value })} /></Field>
              <Field label="Sähköt uusittu (vuosi)"><Input type="number" value={t.sahkot_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, sahkot_uusittu_vuosi: e.target.value })} /></Field></Row>
          </>)}

          {active === 4 && (<>
            <h3 className="font-serif text-xl text-cream">5. Ulkoalueet</h3>
            <Row><Field label="Tontin pinta-ala (m²)"><Input type="number" value={t.tontin_pinta_ala ?? ""} onChange={(e) => setT({ ...t, tontin_pinta_ala: e.target.value })} /></Field>
              <Field label="Pihan tyyppi"><Input value={t.pihan_tyyppi ?? ""} onChange={(e) => setT({ ...t, pihan_tyyppi: e.target.value })} placeholder="Nurmi, sora, kiveys..." /></Field></Row>
            <Field label="Lisätietoa pihasta"><Textarea rows={3} value={t.piha_lisatieto ?? ""} onChange={(e) => setT({ ...t, piha_lisatieto: e.target.value })} /></Field>
          </>)}

          {active === 5 && (<>
            <h3 className="font-serif text-xl text-cream">6. Dokumentit</h3>
            <p className="text-sm text-muted-foreground">Dokumenttiarkisto (rakennuslupa, takuut, pohjapiirrokset) tulee seuraavaan versioon.</p>
          </>)}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <Button variant="outline" disabled={active === 0} onClick={() => setActive((a) => Math.max(0, a - 1))}>Edellinen</Button>
              <Button variant="outline" disabled={active === OSIOT.length - 1} onClick={() => setActive((a) => Math.min(OSIOT.length - 1, a + 1))}>Seuraava</Button>
            </div>
            <Button onClick={() => save.mutate(OSIOT[active].key)} disabled={save.isPending} className="uppercase tracking-wider font-semibold">
              {save.isPending ? "Tallennetaan..." : "Tallenna ja merkitse valmiiksi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

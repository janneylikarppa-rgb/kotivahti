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

const KIINTEISTOTYYPIT = [
  { key: "omakotitalo", nimi: "Omakotitalo" },
  { key: "paritalo", nimi: "Paritalo" },
  { key: "rivitalo", nimi: "Rivitalo" },
  { key: "mokki", nimi: "Mökki" },
];
const ILP_MERKIT = ["Mitsubishi", "Daikin", "Panasonic", "Toshiba", "Fujitsu", "LG", "Samsung", "Sharp", "Muu"];

const RAKENNUSTAVAT = ["Puurunko", "Hirsi", "Tiili", "Kevytsoraharkko (Leca)", "Betoniharkko", "Kevytbetoni (Siporex)", "Betonielementti", "Teräsrunko"];
const JULKISIVUMATERIAALIT = ["Puu (lautaverhous)", "Tiili", "Rappaus", "Levyverhous", "Hirsi", "Pelti", "Kuitusementtilevy", "Kivi"];
const KATTOTYYPIT = ["Harjakatto", "Pulpettikatto", "Aumakatto", "Mansardikatto", "Tasakatto", "Kaarikatto"];
const KATTOMATERIAALIT = ["Konesaumattu peltikatto", "Profiilipeltikatto", "Tiilikatto (savitiili)", "Betonitiili", "Huopakatto", "Kumibitumikermi", "Pärekatto"];
const LAMMITYS = [
  { key: "maalampo", nimi: "Maalämpö" },
  { key: "ilmavesilampo", nimi: "Ilma-vesilämpöpumppu" },
  { key: "ilmalampopumppu", nimi: "Ilmalämpöpumppu" },
  { key: "kaukolampo", nimi: "Kaukolämpö" },
  { key: "oljylammitys", nimi: "Öljylämmitys" },
  { key: "pellettilammitys", nimi: "Pellettilämmitys" },
  { key: "puulammitys", nimi: "Puulämmitys" },
  { key: "sahkolammitys", nimi: "Sähkölämmitys" },
  { key: "muu", nimi: "Muu" },
];
const MERKIT: Record<string, { tyyppi: string; merkit: string[] }> = {
  maalampo: { tyyppi: "Maalämpöpumppu", merkit: ["Nibe", "IVT", "Thermia", "Bosch", "Gebwell", "Mitsubishi", "Stiebel Eltron", "Oilon", "Muu"] },
  ilmavesilampo: { tyyppi: "Ilma-vesilämpöpumppu", merkit: ["Nibe", "Mitsubishi", "Daikin", "Panasonic", "Bosch", "Thermia", "Toshiba", "LG", "Muu"] },
  ilmalampopumppu: { tyyppi: "Ilmalämpöpumppu", merkit: ["Mitsubishi", "Daikin", "Panasonic", "Toshiba", "Fujitsu", "LG", "Samsung", "Sharp", "Muu"] },
  oljylammitys: { tyyppi: "Öljykattila", merkit: ["Jämä", "Kaukora", "Högfors", "Viessmann", "Buderus", "Oilon", "Muu"] },
  pellettilammitys: { tyyppi: "Pellettikattila", merkit: ["Ariterm", "Biotech", "ÖkoFEN", "Kaukora", "Muu"] },
  puulammitys: { tyyppi: "Puukattila", merkit: ["Jämä", "Kaukora", "Ariterm", "Högfors", "Muu"] },
  kaukolampo: { tyyppi: "Lämmönjakokeskus", merkit: ["Alfa Laval", "Danfoss", "Gebwell", "Högfors", "Cetetherm", "Muu"] },
  sahkolammitys: { tyyppi: "Sähkökattila / varaaja", merkit: ["Jäspi", "Kaukora", "Nibe", "Muu"] },
};
const ILMANVAIHDOT = ["Painovoimainen", "Koneellinen poisto", "Koneellinen tulo- ja poistoilmanvaihto (LTO)", "Hybridi"];
const PUTKIMATERIAALIT = ["Kupariputket", "Komposiittiputket (PEX-Al-PEX)", "Muoviputket (PEX)", "Galvanoitu teräs", "Valurauta", "Muu"];
const VIEMARIMATERIAALIT = ["Muovi (PVC/PP)", "Valurauta", "Betoni", "Keraaminen", "Lasikuitu", "Muu"];
const PIHATYYPIT = ["Nurmi", "Sora", "Kiveys", "Asfaltti", "Laatoitus", "Luonnonniitty", "Sekoitus"];
const TERASSIMATERIAALIT = ["Painekyllästetty puu", "Lämpökäsitelty puu", "Komposiitti", "Kestopuu (siperianlehtikuusi)", "Tiili/kiveys", "Betoni", "Ei terassia"];

function num(v: any) { return v === "" || v == null ? null : Number(v); }
function str(v: any) { return v === "" || v == null ? null : String(v); }

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

  const laite = t.lammitysmuoto ? MERKIT[t.lammitysmuoto] : undefined;
  const lammitysLisa = (t.lammitys_lisatieto && typeof t.lammitys_lisatieto === "object") ? t.lammitys_lisatieto : {};
  const setLisa = (patch: Record<string, any>) => setT({ ...t, lammitys_lisatieto: { ...lammitysLisa, ...patch } });

  const save = useMutation({
    mutationFn: (osioKey?: string) => {
      const uudet = osioKey && !valmiit.includes(osioKey) ? [...valmiit, osioKey] : valmiit;
      return saveFn({ data: {
        kiinteisto: {
          nimi: k.nimi, osoite: k.osoite, postinumero: k.postinumero, kaupunki: k.kaupunki,
          rakennusvuosi: num(k.rakennusvuosi), tyyppi: str(k.tyyppi),
        },
        talo: {
          pinta_ala: num(t.pinta_ala), tilavuus: num(t.tilavuus),
          kerroksia: num(t.kerroksia), asukkaita: num(t.asukkaita),
          rakennustapa: str(t.rakennustapa), julkisivumateriaali: str(t.julkisivumateriaali),
          julkisivu_maalattu_vuosi: num(t.julkisivu_maalattu_vuosi),
          kattotyyppi: str(t.kattotyyppi), kattomateriaali: str(t.kattomateriaali),
          katto_uusittu_vuosi: num(t.katto_uusittu_vuosi),
          raystaat_kunnostettu_vuosi: num(t.raystaat_kunnostettu_vuosi),
          lammitysmuoto: str(t.lammitysmuoto), lammitys_asennettu_vuosi: num(t.lammitys_asennettu_vuosi),
          lammitys_lisatieto: lammitysLisa,
          ilp_merkki: str(t.ilp_merkki), ilp_malli: str(t.ilp_malli),
          ilp_asennettu_vuosi: num(t.ilp_asennettu_vuosi),
          ilmanvaihto: str(t.ilmanvaihto), ilmanvaihto_vuosi: num(t.ilmanvaihto_vuosi),
          putket_uusittu_vuosi: num(t.putket_uusittu_vuosi),
          putkimateriaali: str(t.putkimateriaali),
          viemarimateriaali: str(t.viemarimateriaali),
          viemari_asennettu_vuosi: num(t.viemari_asennettu_vuosi),
          sahkot_asennettu_vuosi: num(t.sahkot_asennettu_vuosi),
          tontin_pinta_ala: num(t.tontin_pinta_ala),
          pihan_tyyppi: str(t.pihan_tyyppi), piha_lisatieto: str(t.piha_lisatieto),
          terassi_materiaali: str(t.terassi_materiaali),
          terassi_kunnostettu_vuosi: num(t.terassi_kunnostettu_vuosi),
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
            <p className="text-xs text-muted-foreground">Talon nimi on oletuksena omistajan nimi – käytetään myös etusivun tervehdyksessä.</p>
            <Row>
              <Field label="Talon nimi (omistajan nimi)"><Input value={k.nimi ?? ""} onChange={(e) => setK({ ...k, nimi: e.target.value })} /></Field>
              <Field label="Rakennusvuosi"><Input type="number" value={k.rakennusvuosi ?? ""} onChange={(e) => setK({ ...k, rakennusvuosi: e.target.value })} /></Field>
            </Row>
            <Field label="Osoite"><Input value={k.osoite ?? ""} onChange={(e) => setK({ ...k, osoite: e.target.value })} /></Field>
            <Row><Field label="Postinumero"><Input value={k.postinumero ?? ""} onChange={(e) => setK({ ...k, postinumero: e.target.value })} /></Field>
              <Field label="Kaupunki"><Input value={k.kaupunki ?? ""} onChange={(e) => setK({ ...k, kaupunki: e.target.value })} /></Field></Row>
            <Row><Field label="Asukkaita"><Input type="number" value={t.asukkaita ?? ""} onChange={(e) => setT({ ...t, asukkaita: e.target.value })} /></Field>
              <Field label="Kerroksia"><Input type="number" value={t.kerroksia ?? ""} onChange={(e) => setT({ ...t, kerroksia: e.target.value })} /></Field></Row>
            <Field label="Kiinteistön tyyppi">
              <Select value={k.tyyppi ?? ""} onValueChange={(v) => setK({ ...k, tyyppi: v })}>
                <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                <SelectContent>{KIINTEISTOTYYPIT.map((kt) => <SelectItem key={kt.key} value={kt.key}>{kt.nimi}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </>)}

          {active === 1 && (<>
            <h3 className="font-serif text-xl text-cream">2. Rakennus</h3>
            <Row>
              <Field label="Pinta-ala (m²)"><Input type="number" value={t.pinta_ala ?? ""} onChange={(e) => setT({ ...t, pinta_ala: e.target.value })} /></Field>
              <Field label="Tilavuus (m³)"><Input type="number" value={t.tilavuus ?? ""} onChange={(e) => setT({ ...t, tilavuus: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Rakennustapa">
                <SelectOrOther value={t.rakennustapa} options={RAKENNUSTAVAT} onChange={(v) => setT({ ...t, rakennustapa: v })} />
              </Field>
              <Field label="Julkisivumateriaali">
                <SelectOrOther value={t.julkisivumateriaali} options={JULKISIVUMATERIAALIT} onChange={(v) => setT({ ...t, julkisivumateriaali: v })} />
              </Field>
            </Row>
            <Field label="Julkisivu maalattu (vuosi)"><Input type="number" value={t.julkisivu_maalattu_vuosi ?? ""} onChange={(e) => setT({ ...t, julkisivu_maalattu_vuosi: e.target.value })} /></Field>
          </>)}

          {active === 2 && (<>
            <h3 className="font-serif text-xl text-cream">3. Katto ja räystäät</h3>
            <Row>
              <Field label="Kattotyyppi">
                <SelectOrOther value={t.kattotyyppi} options={KATTOTYYPIT} onChange={(v) => setT({ ...t, kattotyyppi: v })} />
              </Field>
              <Field label="Kattomateriaali">
                <SelectOrOther value={t.kattomateriaali} options={KATTOMATERIAALIT} onChange={(v) => setT({ ...t, kattomateriaali: v })} />
              </Field>
            </Row>
            <Row><Field label="Katto uusittu (vuosi)"><Input type="number" value={t.katto_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, katto_uusittu_vuosi: e.target.value })} /></Field>
              <Field label="Räystäät kunnostettu (vuosi)"><Input type="number" value={t.raystaat_kunnostettu_vuosi ?? ""} onChange={(e) => setT({ ...t, raystaat_kunnostettu_vuosi: e.target.value })} /></Field></Row>
          </>)}

          {active === 3 && (<>
            <h3 className="font-serif text-xl text-cream">4. Tekniset järjestelmät</h3>
            <p className="text-xs text-muted-foreground">Lämmityslaitteen merkki ja malli auttavat PTS-suositusten luonnissa (huoltovälit, käyttöikäennusteet).</p>

            <Row>
              <Field label="Lämmitysmuoto">
                <Select value={t.lammitysmuoto ?? ""} onValueChange={(v) => setT({ ...t, lammitysmuoto: v })}>
                  <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                  <SelectContent>{LAMMITYS.map((l) => <SelectItem key={l.key} value={l.key}>{l.nimi}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Lämmitys asennettu (vuosi)"><Input type="number" value={t.lammitys_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, lammitys_asennettu_vuosi: e.target.value })} /></Field>
            </Row>

            {laite && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-4">
                <p className="eyebrow text-primary">{laite.tyyppi}</p>
                <Row>
                  <Field label="Merkki">
                    <SelectOrOther value={lammitysLisa.merkki} options={laite.merkit} onChange={(v) => setLisa({ merkki: v })} />
                  </Field>
                  <Field label="Mallimerkintä"><Input value={lammitysLisa.malli ?? ""} onChange={(e) => setLisa({ malli: e.target.value })} placeholder="Esim. F1255-12" /></Field>
                </Row>
              </div>
            )}

            <Row>
              <Field label="Ilmanvaihto">
                <SelectOrOther value={t.ilmanvaihto} options={ILMANVAIHDOT} onChange={(v) => setT({ ...t, ilmanvaihto: v })} />
              </Field>
              <Field label="Ilmanvaihto uusittu (vuosi)"><Input type="number" value={t.ilmanvaihto_vuosi ?? ""} onChange={(e) => setT({ ...t, ilmanvaihto_vuosi: e.target.value })} /></Field>
            </Row>

            <Row>
              <Field label="Putkimateriaali">
                <SelectOrOther value={t.putkimateriaali} options={PUTKIMATERIAALIT} onChange={(v) => setT({ ...t, putkimateriaali: v })} />
              </Field>
              <Field label="Putket uusittu (vuosi)"><Input type="number" value={t.putket_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, putket_uusittu_vuosi: e.target.value })} /></Field>
            </Row>

            <Row>
              <Field label="Viemärimateriaali">
                <SelectOrOther value={t.viemarimateriaali} options={VIEMARIMATERIAALIT} onChange={(v) => setT({ ...t, viemarimateriaali: v })} />
              </Field>
              <Field label="Viemäri asennettu (vuosi)"><Input type="number" value={t.viemari_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, viemari_asennettu_vuosi: e.target.value })} /></Field>
            </Row>

            <Field label="Sähköt asennettu (vuosi)"><Input type="number" value={t.sahkot_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, sahkot_asennettu_vuosi: e.target.value })} /></Field>
          </>)}

          {active === 4 && (<>
            <h3 className="font-serif text-xl text-cream">5. Ulkoalueet</h3>
            <Row>
              <Field label="Tontin pinta-ala (m²)"><Input type="number" value={t.tontin_pinta_ala ?? ""} onChange={(e) => setT({ ...t, tontin_pinta_ala: e.target.value })} /></Field>
              <Field label="Pihan tyyppi">
                <SelectOrOther value={t.pihan_tyyppi} options={PIHATYYPIT} onChange={(v) => setT({ ...t, pihan_tyyppi: v })} />
              </Field>
            </Row>
            <Row>
              <Field label="Terassin materiaali">
                <SelectOrOther value={t.terassi_materiaali} options={TERASSIMATERIAALIT} onChange={(v) => setT({ ...t, terassi_materiaali: v })} />
              </Field>
              <Field label="Terassi kunnostettu (vuosi)"><Input type="number" value={t.terassi_kunnostettu_vuosi ?? ""} onChange={(e) => setT({ ...t, terassi_kunnostettu_vuosi: e.target.value })} /></Field>
            </Row>
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

function SelectOrOther({ value, options, onChange }: { value: string | null | undefined; options: string[]; onChange: (v: string) => void }) {
  const isPreset = !!value && options.includes(value);
  const [other, setOther] = useState(!value || isPreset ? false : true);
  const selectValue = other ? "__muu__" : (value ?? "");
  return (
    <div className="space-y-2">
      <Select
        value={selectValue}
        onValueChange={(v) => {
          if (v === "__muu__") { setOther(true); onChange(""); }
          else { setOther(false); onChange(v); }
        }}
      >
        <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          <SelectItem value="__muu__">Muu / oma…</SelectItem>
        </SelectContent>
      </Select>
      {other && (
        <Input placeholder="Kirjoita oma" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

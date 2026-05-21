import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getTaloTiedot, saveTaloTiedot, addDokumentti, deleteDokumentti, getDokumenttiUrl } from "@/lib/kotivahti.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Check, Trash2, FileText, Download, Upload } from "lucide-react";
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
  { key: "erillistalo", nimi: "Erillistalo" },
  { key: "mokki", nimi: "Mökki" },
];
const HANKINTATAVAT = [
  { key: "ostettu", nimi: "Ostettu" },
  { key: "rakennettu", nimi: "Rakennettu" },
  { key: "peritty", nimi: "Peritty / lahjoitettu" },
];
const ILP_MERKIT = ["Mitsubishi", "Daikin", "Panasonic", "Toshiba", "Fujitsu", "LG", "Samsung", "Sharp", "Muu"];
const RAKENNUSTAVAT = ["Puurunko", "Hirsi", "Tiili", "Kevytsoraharkko (Leca)", "Betoniharkko", "Kevytbetoni (Siporex)", "Betonielementti", "Teräsrunko"];
const JULKISIVUMATERIAALIT = ["Puu (lautaverhous)", "Tiili", "Rappaus", "Levyverhous", "Hirsi", "Pelti", "Kuitusementtilevy", "Kivi"];
const PERUSTUKSET = ["Maanvarainen laatta", "Tuulettuva alapohja (rossi)", "Kellari", "Pilariperustus", "Pohjalaatta + sokkeli"];
const ERISTEET = ["Mineraalivilla", "Lasivilla", "Selluvilla (puhallusvilla)", "Polyuretaani (PUR/PIR)", "EPS-styrox", "Sahanpuru", "Ekovilla", "Hamppu"];
const KATTOTYYPIT = ["Harjakatto", "Pulpettikatto", "Aumakatto", "Mansardikatto", "Tasakatto", "Kaarikatto"];
const KATTOMATERIAALIT = ["Konesaumattu peltikatto", "Profiilipeltikatto", "Tiilikatto (savitiili)", "Betonitiili", "Huopakatto", "Kumibitumikermi", "Pärekatto"];
const KOURUN_MATERIAALIT = ["Maalattu teräs", "Sinkitty teräs", "Kupari", "Alumiini", "Muovi"];
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
const IV_SUODATTIMET = ["F7 (vakio)", "M5", "ePM1", "ePM10", "Aktiivihiili", "Muu"];
const PUTKIMATERIAALIT = ["Kupariputket", "Komposiittiputket (PEX-Al-PEX)", "Muoviputket (PEX)", "Galvanoitu teräs", "Valurauta", "Muu"];
const VIEMARIMATERIAALIT = ["Muovi (PVC/PP)", "Valurauta", "Betoni", "Keraaminen", "Lasikuitu", "Muu"];
const PIHATYYPIT = ["Nurmi", "Sora", "Kiveys", "Asfaltti", "Laatoitus", "Luonnonniitty", "Sekoitus"];
const TERASSIMATERIAALIT = ["Painekyllästetty puu", "Lämpökäsitelty puu", "Komposiitti", "Kestopuu (siperianlehtikuusi)", "Tiili/kiveys", "Betoni", "Ei terassia"];
const DOK_TYYPIT = [
  { key: "dokumentti", nimi: "Dokumentti" },
  { key: "takuu", nimi: "Takuu" },
  { key: "kuitti", nimi: "Kuitti" },
  { key: "lasku", nimi: "Lasku" },
];

function num(v: any) { return v === "" || v == null ? null : Number(v); }
function str(v: any) { return v === "" || v == null ? null : String(v); }
function dateStr(v: any) { return v === "" || v == null ? null : String(v); }
function boolOrNull(v: any) { return v === "" || v == null ? null : Boolean(v); }

function TaloTiedotPage() {
  const fetchFn = useServerFn(getTaloTiedot);
  const saveFn = useServerFn(saveTaloTiedot);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["talo"], queryFn: () => fetchFn() });
  const [active, setActive] = useState(0);
  const [k, setK] = useState<any>({});
  const [t, setT] = useState<any>({});
  const [p, setP] = useState<any>({});
  const [valmiit, setValmiit] = useState<string[]>([]);

  useEffect(() => {
    if (data?.kiinteisto) setK(data.kiinteisto);
    if (data?.profile) setP(data.profile);
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
        profile: { nimi: str(p.nimi), puhelin: str(p.puhelin) },
        kiinteisto: {
          nimi: k.nimi, osoite: k.osoite, postinumero: k.postinumero, kaupunki: k.kaupunki,
          rakennusvuosi: num(k.rakennusvuosi), tyyppi: str(k.tyyppi),
          hankintatapa: str(k.hankintatapa), hankinta_vuosi: num(k.hankinta_vuosi),
        },
        talo: {
          pinta_ala: num(t.pinta_ala), kokonaispinta_ala: num(t.kokonaispinta_ala), tilavuus: num(t.tilavuus),
          kerroksia: num(t.kerroksia), asukkaita: num(t.asukkaita),
          rakennustapa: str(t.rakennustapa), julkisivumateriaali: str(t.julkisivumateriaali),
          julkisivu_maalattu_vuosi: num(t.julkisivu_maalattu_vuosi),
          perustus: str(t.perustus), eriste: str(t.eriste), rakennus_lisatieto: str(t.rakennus_lisatieto),
          kattotyyppi: str(t.kattotyyppi), kattomateriaali: str(t.kattomateriaali),
          katto_uusittu_vuosi: num(t.katto_uusittu_vuosi),
          katto_pinta_ala: num(t.katto_pinta_ala),
          raystaat_kunnostettu_vuosi: num(t.raystaat_kunnostettu_vuosi),
          hormit: str(t.hormit), kattoturvatuotteet: str(t.kattoturvatuotteet),
          kourun_pituus: num(t.kourun_pituus), kourun_materiaali: str(t.kourun_materiaali),
          syoksytorvet: num(t.syoksytorvet),
          lammitysmuoto: str(t.lammitysmuoto), lammitys_asennettu_vuosi: num(t.lammitys_asennettu_vuosi),
          lammitys_lisatieto: lammitysLisa,
          ilp_merkki: str(t.ilp_merkki), ilp_malli: str(t.ilp_malli), ilp_asennettu_vuosi: num(t.ilp_asennettu_vuosi),
          ilmanvaihto: str(t.ilmanvaihto), ilmanvaihto_vuosi: num(t.ilmanvaihto_vuosi),
          iv_suodatintyyppi: str(t.iv_suodatintyyppi), iv_suodatin_vaihdettu: dateStr(t.iv_suodatin_vaihdettu),
          putket_uusittu_vuosi: num(t.putket_uusittu_vuosi),
          putkimateriaali: str(t.putkimateriaali),
          viemarimateriaali: str(t.viemarimateriaali), viemari_asennettu_vuosi: num(t.viemari_asennettu_vuosi),
          paasulun_sijainti: str(t.paasulun_sijainti),
          sahkot_asennettu_vuosi: num(t.sahkot_asennettu_vuosi),
          palovaroittimia: num(t.palovaroittimia), palovaroitin_paristot: dateStr(t.palovaroitin_paristot),
          kiukaan_vuosi: num(t.kiukaan_vuosi), nuohous_pvm: dateStr(t.nuohous_pvm),
          tontin_pinta_ala: num(t.tontin_pinta_ala), nurmikon_pinta_ala: num(t.nurmikon_pinta_ala),
          sadevesikaivot: num(t.sadevesikaivot),
          pihan_tyyppi: str(t.pihan_tyyppi), piha_lisatieto: str(t.piha_lisatieto),
          terassi_materiaali: str(t.terassi_materiaali), terassi_pinta_ala: num(t.terassi_pinta_ala),
          terassi_rakennettu_vuosi: num(t.terassi_rakennettu_vuosi),
          terassi_kunnostettu_vuosi: num(t.terassi_kunnostettu_vuosi),
          salaojat: boolOrNull(t.salaojat), salaojat_tarkastettu: dateStr(t.salaojat_tarkastettu),
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
            <p className="text-xs text-muted-foreground">Aloitetaan perusteista. Näiden tietojen perusteella rakennamme henkilökohtaisen huoltosuunnitelman.</p>

            <p className="eyebrow text-primary pt-2">Sijainti</p>
            <Field label="Osoite"><Input value={k.osoite ?? ""} onChange={(e) => setK({ ...k, osoite: e.target.value })} /></Field>
            <Row>
              <Field label="Postinumero"><Input value={k.postinumero ?? ""} onChange={(e) => setK({ ...k, postinumero: e.target.value })} /></Field>
              <Field label="Kaupunki"><Input value={k.kaupunki ?? ""} onChange={(e) => setK({ ...k, kaupunki: e.target.value })} /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Kiinteistön tyyppi</p>
            <Field label="Tyyppi">
              <Select value={k.tyyppi ?? ""} onValueChange={(v) => setK({ ...k, tyyppi: v })}>
                <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                <SelectContent>{KIINTEISTOTYYPIT.map((kt) => <SelectItem key={kt.key} value={kt.key}>{kt.nimi}</SelectItem>)}</SelectContent>
              </Select>
            </Field>

            <p className="eyebrow text-primary pt-4">Omistajan tiedot</p>
            <Row>
              <Field label="Omistajan nimi"><Input value={p.nimi ?? ""} onChange={(e) => setP({ ...p, nimi: e.target.value })} /></Field>
              <Field label="Puhelinnumero"><Input value={p.puhelin ?? ""} onChange={(e) => setP({ ...p, puhelin: e.target.value })} placeholder="+358 40 123 4567" /></Field>
            </Row>
            <Field label="Sähköposti"><Input value={p.email ?? ""} disabled className="opacity-70" /></Field>
            <Row>
              <Field label="Hankintatapa">
                <Select value={k.hankintatapa ?? ""} onValueChange={(v) => setK({ ...k, hankintatapa: v })}>
                  <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                  <SelectContent>{HANKINTATAVAT.map((h) => <SelectItem key={h.key} value={h.key}>{h.nimi}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Ostettu / rakennettu (vuosi)"><Input type="number" value={k.hankinta_vuosi ?? ""} onChange={(e) => setK({ ...k, hankinta_vuosi: e.target.value })} /></Field>
            </Row>

            <Field label="Talon nimi (näytetään etusivulla)"><Input value={k.nimi ?? ""} onChange={(e) => setK({ ...k, nimi: e.target.value })} /></Field>
            <Row>
              <Field label="Asukkaita"><Input type="number" value={t.asukkaita ?? ""} onChange={(e) => setT({ ...t, asukkaita: e.target.value })} /></Field>
              <Field label="Kerroksia"><Input type="number" value={t.kerroksia ?? ""} onChange={(e) => setT({ ...t, kerroksia: e.target.value })} /></Field>
            </Row>
          </>)}

          {active === 1 && (<>
            <h3 className="font-serif text-xl text-cream">2. Rakennus</h3>
            <p className="text-xs text-muted-foreground">Rakennusvuosi ja materiaalit kertovat paljon tulevan huollon tarpeesta.</p>

            <p className="eyebrow text-primary pt-2">Koko ja ikä</p>
            <Row>
              <Field label="Rakennusvuosi"><Input type="number" value={k.rakennusvuosi ?? ""} onChange={(e) => setK({ ...k, rakennusvuosi: e.target.value })} /></Field>
              <Field label="Kerrosten määrä"><Input type="number" value={t.kerroksia ?? ""} onChange={(e) => setT({ ...t, kerroksia: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Asuinpinta-ala (m²)"><Input type="number" value={t.pinta_ala ?? ""} onChange={(e) => setT({ ...t, pinta_ala: e.target.value })} /></Field>
              <Field label="Kokonaispinta-ala (m²)"><Input type="number" value={t.kokonaispinta_ala ?? ""} onChange={(e) => setT({ ...t, kokonaispinta_ala: e.target.value })} /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Rakennusmateriaalit</p>
            <Row>
              <Field label="Kantava rakenne">
                <SelectOrOther value={t.rakennustapa} options={RAKENNUSTAVAT} onChange={(v) => setT({ ...t, rakennustapa: v })} />
              </Field>
              <Field label="Julkisivumateriaali">
                <SelectOrOther value={t.julkisivumateriaali} options={JULKISIVUMATERIAALIT} onChange={(v) => setT({ ...t, julkisivumateriaali: v })} />
              </Field>
            </Row>
            <Row>
              <Field label="Perustus">
                <SelectOrOther value={t.perustus} options={PERUSTUKSET} onChange={(v) => setT({ ...t, perustus: v })} />
              </Field>
              <Field label="Eristemateriaali">
                <SelectOrOther value={t.eriste} options={ERISTEET} onChange={(v) => setT({ ...t, eriste: v })} />
              </Field>
            </Row>
            <Field label="Julkisivu maalattu (vuosi)"><Input type="number" value={t.julkisivu_maalattu_vuosi ?? ""} onChange={(e) => setT({ ...t, julkisivu_maalattu_vuosi: e.target.value })} /></Field>
            <Field label="Lisätietoja rakennuksesta"><Textarea rows={3} value={t.rakennus_lisatieto ?? ""} onChange={(e) => setT({ ...t, rakennus_lisatieto: e.target.value })} /></Field>
          </>)}

          {active === 2 && (<>
            <h3 className="font-serif text-xl text-cream">3. Katto ja räystäät</h3>
            <p className="text-xs text-muted-foreground">Katto on yksi talon tärkeimmistä rakenteista. Tiedot auttavat ennakoimaan huolto- ja uusimistarpeita.</p>

            <p className="eyebrow text-primary pt-2">Katon perustiedot</p>
            <Row>
              <Field label="Kattotyyppi">
                <SelectOrOther value={t.kattotyyppi} options={KATTOTYYPIT} onChange={(v) => setT({ ...t, kattotyyppi: v })} />
              </Field>
              <Field label="Kattomateriaali">
                <SelectOrOther value={t.kattomateriaali} options={KATTOMATERIAALIT} onChange={(v) => setT({ ...t, kattomateriaali: v })} />
              </Field>
            </Row>
            <Row>
              <Field label="Katon pinta-ala (m²)"><Input type="number" value={t.katto_pinta_ala ?? ""} onChange={(e) => setT({ ...t, katto_pinta_ala: e.target.value })} /></Field>
              <Field label="Katon asennusvuosi"><Input type="number" value={t.katto_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, katto_uusittu_vuosi: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Hormit"><Input value={t.hormit ?? ""} onChange={(e) => setT({ ...t, hormit: e.target.value })} placeholder="Esim. tiilihormi" /></Field>
              <Field label="Kattoturvatuotteet"><Input value={t.kattoturvatuotteet ?? ""} onChange={(e) => setT({ ...t, kattoturvatuotteet: e.target.value })} placeholder="Esim. lumiesteet, kattosillat" /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Räystäskourut</p>
            <Row>
              <Field label="Kourujen pituus (jm)"><Input type="number" value={t.kourun_pituus ?? ""} onChange={(e) => setT({ ...t, kourun_pituus: e.target.value })} /></Field>
              <Field label="Kourun materiaali">
                <SelectOrOther value={t.kourun_materiaali} options={KOURUN_MATERIAALIT} onChange={(v) => setT({ ...t, kourun_materiaali: v })} />
              </Field>
            </Row>
            <Row>
              <Field label="Syöksytorvet (kpl)"><Input type="number" value={t.syoksytorvet ?? ""} onChange={(e) => setT({ ...t, syoksytorvet: e.target.value })} /></Field>
              <Field label="Räystäät kunnostettu (vuosi)"><Input type="number" value={t.raystaat_kunnostettu_vuosi ?? ""} onChange={(e) => setT({ ...t, raystaat_kunnostettu_vuosi: e.target.value })} /></Field>
            </Row>
          </>)}

          {active === 3 && (<>
            <h3 className="font-serif text-xl text-cream">4. Tekniset järjestelmät</h3>
            <p className="text-xs text-muted-foreground">Talotekniikalla on suositeltu käyttöikä – autamme seuraamaan milloin huolto tai uusinta on ajankohtainen.</p>

            <p className="eyebrow text-primary pt-2">Lämmitysjärjestelmä</p>
            <Row>
              <Field label="Päälämmitysmuoto">
                <Select value={t.lammitysmuoto ?? ""} onValueChange={(v) => setT({ ...t, lammitysmuoto: v })}>
                  <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                  <SelectContent>{LAMMITYS.map((l) => <SelectItem key={l.key} value={l.key}>{l.nimi}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Järjestelmän asennusvuosi"><Input type="number" value={t.lammitys_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, lammitys_asennettu_vuosi: e.target.value })} /></Field>
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

            <p className="eyebrow text-primary pt-2">Lämpöpumppu (lisälaite)</p>
            <Row>
              <Field label="Merkki">
                <SelectOrOther value={t.ilp_merkki} options={ILP_MERKIT} onChange={(v) => setT({ ...t, ilp_merkki: v })} />
              </Field>
              <Field label="Mallimerkintä"><Input value={t.ilp_malli ?? ""} onChange={(e) => setT({ ...t, ilp_malli: e.target.value })} placeholder="Esim. MSZ-LN35VG" /></Field>
            </Row>
            <Field label="LP:n asennusvuosi"><Input type="number" value={t.ilp_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, ilp_asennettu_vuosi: e.target.value })} /></Field>

            <p className="eyebrow text-primary pt-4">Ilmanvaihto</p>
            <Row>
              <Field label="IV-tyyppi">
                <SelectOrOther value={t.ilmanvaihto} options={ILMANVAIHDOT} onChange={(v) => setT({ ...t, ilmanvaihto: v })} />
              </Field>
              <Field label="IV-koneen asennusvuosi"><Input type="number" value={t.ilmanvaihto_vuosi ?? ""} onChange={(e) => setT({ ...t, ilmanvaihto_vuosi: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Suodatintyyppi">
                <SelectOrOther value={t.iv_suodatintyyppi} options={IV_SUODATTIMET} onChange={(v) => setT({ ...t, iv_suodatintyyppi: v })} />
              </Field>
              <Field label="Suodatin vaihdettu viimeksi"><Input type="date" value={t.iv_suodatin_vaihdettu ?? ""} onChange={(e) => setT({ ...t, iv_suodatin_vaihdettu: e.target.value })} /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Vesiputket ja viemärit</p>
            <Row>
              <Field label="Käyttövesiputket">
                <SelectOrOther value={t.putkimateriaali} options={PUTKIMATERIAALIT} onChange={(v) => setT({ ...t, putkimateriaali: v })} />
              </Field>
              <Field label="Putkien asennusvuosi"><Input type="number" value={t.putket_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, putket_uusittu_vuosi: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Viemärien materiaali">
                <SelectOrOther value={t.viemarimateriaali} options={VIEMARIMATERIAALIT} onChange={(v) => setT({ ...t, viemarimateriaali: v })} />
              </Field>
              <Field label="Viemäri asennettu (vuosi)"><Input type="number" value={t.viemari_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, viemari_asennettu_vuosi: e.target.value })} /></Field>
            </Row>
            <Field label="Pääsulun sijainti"><Input value={t.paasulun_sijainti ?? ""} onChange={(e) => setT({ ...t, paasulun_sijainti: e.target.value })} placeholder="Esim. tekninen tila, kellari" /></Field>

            <p className="eyebrow text-primary pt-4">Muut laitteet</p>
            <Row>
              <Field label="Palovaroittimia (kpl)"><Input type="number" value={t.palovaroittimia ?? ""} onChange={(e) => setT({ ...t, palovaroittimia: e.target.value })} /></Field>
              <Field label="Paristot vaihdettu"><Input type="date" value={t.palovaroitin_paristot ?? ""} onChange={(e) => setT({ ...t, palovaroitin_paristot: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Kiukaan asennusvuosi"><Input type="number" value={t.kiukaan_vuosi ?? ""} onChange={(e) => setT({ ...t, kiukaan_vuosi: e.target.value })} /></Field>
              <Field label="Nuohous viimeksi"><Input type="date" value={t.nuohous_pvm ?? ""} onChange={(e) => setT({ ...t, nuohous_pvm: e.target.value })} /></Field>
            </Row>
            <Field label="Sähköt asennettu (vuosi)"><Input type="number" value={t.sahkot_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, sahkot_asennettu_vuosi: e.target.value })} /></Field>
          </>)}

          {active === 4 && (<>
            <h3 className="font-serif text-xl text-cream">5. Ulkoalueet ja piha</h3>
            <p className="text-xs text-muted-foreground">Piha-alueiden tiedot auttavat muistuttamaan kausihuolloista ja ennakoimaan kunnossapitoa.</p>

            <p className="eyebrow text-primary pt-2">Tontti</p>
            <Row>
              <Field label="Tontin pinta-ala (m²)"><Input type="number" value={t.tontin_pinta_ala ?? ""} onChange={(e) => setT({ ...t, tontin_pinta_ala: e.target.value })} /></Field>
              <Field label="Nurmikon pinta-ala (m²)"><Input type="number" value={t.nurmikon_pinta_ala ?? ""} onChange={(e) => setT({ ...t, nurmikon_pinta_ala: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Pihan tyyppi">
                <SelectOrOther value={t.pihan_tyyppi} options={PIHATYYPIT} onChange={(v) => setT({ ...t, pihan_tyyppi: v })} />
              </Field>
              <Field label="Sadevesikaivot (kpl)"><Input type="number" value={t.sadevesikaivot ?? ""} onChange={(e) => setT({ ...t, sadevesikaivot: e.target.value })} /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Terassi</p>
            <Row>
              <Field label="Terassin pinta-ala (m²)"><Input type="number" value={t.terassi_pinta_ala ?? ""} onChange={(e) => setT({ ...t, terassi_pinta_ala: e.target.value })} /></Field>
              <Field label="Terassin materiaali">
                <SelectOrOther value={t.terassi_materiaali} options={TERASSIMATERIAALIT} onChange={(v) => setT({ ...t, terassi_materiaali: v })} />
              </Field>
            </Row>
            <Row>
              <Field label="Rakennettu vuonna"><Input type="number" value={t.terassi_rakennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, terassi_rakennettu_vuosi: e.target.value })} /></Field>
              <Field label="Käsitelty / maalattu viimeksi"><Input type="number" value={t.terassi_kunnostettu_vuosi ?? ""} onChange={(e) => setT({ ...t, terassi_kunnostettu_vuosi: e.target.value })} /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Salaojat</p>
            <Row>
              <Field label="Salaojat">
                <Select value={t.salaojat == null ? "" : String(t.salaojat)} onValueChange={(v) => setT({ ...t, salaojat: v === "true" })}>
                  <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Kyllä</SelectItem>
                    <SelectItem value="false">Ei</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tarkastettu viimeksi"><Input type="date" value={t.salaojat_tarkastettu ?? ""} onChange={(e) => setT({ ...t, salaojat_tarkastettu: e.target.value })} /></Field>
            </Row>
            <Field label="Lisätietoa pihasta"><Textarea rows={3} value={t.piha_lisatieto ?? ""} onChange={(e) => setT({ ...t, piha_lisatieto: e.target.value })} /></Field>
          </>)}

          {active === 5 && (
            <DokumentitOsio kiinteistoId={data?.kiinteisto?.id} dokumentit={data?.dokumentit ?? []} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <Button variant="outline" disabled={active === 0} onClick={() => setActive((a) => Math.max(0, a - 1))}>Edellinen</Button>
              <Button variant="outline" disabled={active === OSIOT.length - 1} onClick={() => setActive((a) => Math.min(OSIOT.length - 1, a + 1))}>Seuraava</Button>
            </div>
            {active !== 5 && (
              <Button onClick={() => save.mutate(OSIOT[active].key)} disabled={save.isPending} className="uppercase tracking-wider font-semibold">
                {save.isPending ? "Tallennetaan..." : "Tallenna ja merkitse valmiiksi"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DokumentitOsio({ kiinteistoId, dokumentit }: { kiinteistoId?: string; dokumentit: any[] }) {
  const qc = useQueryClient();
  const addFn = useServerFn(addDokumentti);
  const delFn = useServerFn(deleteDokumentti);
  const urlFn = useServerFn(getDokumenttiUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tyyppi, setTyyppi] = useState<"dokumentti" | "takuu" | "kuitti" | "lasku">("dokumentti");
  const [kuvaus, setKuvaus] = useState("");
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !kiinteistoId) return;
    setUploading(true);
    try {
      const polku = `${kiinteistoId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("talo-dokumentit").upload(polku, file);
      if (error) throw error;
      await addFn({ data: { nimi: file.name, tyyppi, tiedosto_polku: polku, mime: file.type, koko_bytes: file.size, kuvaus: kuvaus || null } });
      toast.success("Tiedosto lisätty");
      setKuvaus("");
      if (fileRef.current) fileRef.current.value = "";
      qc.invalidateQueries({ queryKey: ["talo"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const lataa = async (polku: string) => {
    try {
      const { url } = await urlFn({ data: { polku } });
      window.open(url, "_blank");
    } catch (e: any) { toast.error(e.message); }
  };

  const poista = useMutation({
    mutationFn: (d: any) => delFn({ data: { id: d.id, tiedosto_polku: d.tiedosto_polku } }),
    onSuccess: () => { toast.success("Poistettu"); qc.invalidateQueries({ queryKey: ["talo"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <>
      <h3 className="font-serif text-xl text-cream">6. Dokumentit ja takuut</h3>
      <p className="text-xs text-muted-foreground">Lisää taloosi liittyvät dokumentit, takuut, kuitit ja laskut. Kaikki on turvallisesti tallessa ja helposti löydettävissä.</p>

      <div className="rounded-md border border-border/60 bg-muted/30 p-4 space-y-3">
        <p className="eyebrow text-primary">Lisää uusi</p>
        <Row>
          <Field label="Tyyppi">
            <Select value={tyyppi} onValueChange={(v) => setTyyppi(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOK_TYYPIT.map((d) => <SelectItem key={d.key} value={d.key}>{d.nimi}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Tiedosto"><Input ref={fileRef} type="file" /></Field>
        </Row>
        <Field label="Kuvaus (vapaaehtoinen)"><Input value={kuvaus} onChange={(e) => setKuvaus(e.target.value)} placeholder="Esim. katon takuupaperit 2022" /></Field>
        <Button onClick={upload} disabled={uploading} className="gap-2"><Upload className="h-4 w-4" />{uploading ? "Ladataan..." : "Lataa"}</Button>
      </div>

      <div className="space-y-2">
        {dokumentit.length === 0 && <p className="text-sm text-muted-foreground">Ei dokumentteja vielä.</p>}
        {dokumentit.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 p-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <FileText className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-cream truncate">{d.nimi}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="uppercase">{d.tyyppi}</span> · {d.lisatty_pvm}
                  {d.koko_bytes && ` · ${(d.koko_bytes / 1024).toFixed(0)} kB`}
                </p>
                {d.kuvaus && <p className="text-xs text-muted-foreground italic mt-1">{d.kuvaus}</p>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => lataa(d.tiedosto_polku)}><Download className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => poista.mutate(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </>
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

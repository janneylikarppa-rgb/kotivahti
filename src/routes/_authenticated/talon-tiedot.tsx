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
import { KausikirjeToggle } from "@/components/kausikirje-toggle";

export const Route = createFileRoute("/_authenticated/talon-tiedot")({
  loader: ({ context }) => {
    if (typeof window === "undefined") return null;
    return context.queryClient.ensureQueryData({ queryKey: ["talo"], queryFn: () => getTaloTiedot(), staleTime: 30_000 });
  },
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
const PERUSTUKSET = ["Betonivalu (maanvarainen laatta)", "Harkkoperustus", "Tuulettuva alapohja (rossi)", "Kellari", "Pilariperustus", "Pohjalaatta + sokkeli", "Maanvarainen laatta"];
const ERISTEET = ["Mineraalivilla", "Lasivilla", "Selluvilla (puhallusvilla)", "Polyuretaani (PUR/PIR)", "EPS-styrox", "Sahanpuru", "Ekovilla", "Hamppu"];
const KATTOTYYPIT = ["Harjakatto", "Pulpettikatto", "Aumakatto", "Mansardikatto", "Tasakatto", "Kaarikatto"];
const KATTOMATERIAALIT = ["Konesaumattu peltikatto", "Profiilipeltikatto", "Tiilikatto (savitiili)", "Betonitiili", "Huopakatto", "Kumibitumikermi", "Pärekatto"];
const HORMITYYPIT = ["Ei hormia", "Tiilihormi", "Teräs-/moduulihormi", "Muu"];
const KIUAS_TYYPIT: { key: string; nimi: string }[] = [
  { key: "puu", nimi: "Puukiuas" },
  { key: "sahko", nimi: "Sähkökiuas" },
];
const KOURUN_MATERIAALIT = ["Maalattu teräs", "Sinkitty teräs", "Kupari", "Alumiini", "Muovi"];
const LAMMITYS = [
  { key: "maalampo", nimi: "Maalämpö" },
  { key: "kaukolampo", nimi: "Kaukolämpö" },
  { key: "ilmavesilampo", nimi: "Ilma-vesilämpö" },
  { key: "sahkolammitys", nimi: "Suora sähkölämmitys" },
  { key: "keskuslammitys", nimi: "Keskuslämmitys (kattila + vesikierto)" },
  { key: "ilmalampopumppu", nimi: "Ilmalämpöpumppu" },
  { key: "muu", nimi: "Muu" },
];
// Legacy-arvot, jotka edelleen voivat löytyä tietokannasta — näytetään valinnassa jotta read-only toimii
const LAMMITYS_LEGACY: Record<string, string> = {
  oljylammitys: "Öljylämmitys (vanha — siirrä keskuslämmitykseen)",
  pellettilammitys: "Pellettilämmitys (vanha — siirrä keskuslämmitykseen)",
  puulammitys: "Puulämmitys (vanha — siirrä keskuslämmitykseen)",
};
const MERKIT: Record<string, { tyyppi: string; merkit: string[] }> = {
  maalampo: { tyyppi: "Maalämpöpumppu", merkit: ["Nibe", "IVT", "Thermia", "Bosch", "Gebwell", "Mitsubishi", "Stiebel Eltron", "Oilon", "Muu"] },
  ilmavesilampo: { tyyppi: "Ilma-vesilämpöpumppu", merkit: ["Nibe", "Mitsubishi", "Daikin", "Panasonic", "Bosch", "Thermia", "Toshiba", "LG", "Muu"] },
  ilmalampopumppu: { tyyppi: "Ilmalämpöpumppu", merkit: ["Mitsubishi", "Daikin", "Panasonic", "Toshiba", "Fujitsu", "LG", "Samsung", "Sharp", "Muu"] },
  oljylammitys: { tyyppi: "Öljykattila", merkit: ["Jämä", "Kaukora", "Högfors", "Viessmann", "Buderus", "Oilon", "Muu"] },
  pellettilammitys: { tyyppi: "Pellettikattila", merkit: ["Ariterm", "Biotech", "ÖkoFEN", "Kaukora", "Muu"] },
  puulammitys: { tyyppi: "Puukattila", merkit: ["Jämä", "Kaukora", "Ariterm", "Högfors", "Muu"] },
  kaukolampo: { tyyppi: "Lämmönjakokeskus", merkit: ["Alfa Laval", "Danfoss", "Gebwell", "Högfors", "Cetetherm", "Muu"] },
  sahkolammitys: { tyyppi: "Lämminvesivaraaja", merkit: ["Jäspi", "Kaukora", "Nibe", "Haato", "Muu"] },
};
const KATTILA_TYYPIT = [
  { key: "puu", nimi: "Puukattila" },
  { key: "sahko", nimi: "Sähkökattila" },
  { key: "pelletti", nimi: "Pellettikattila" },
  { key: "oljy", nimi: "Öljykattila" },
];
const KATTILA_MERKIT: Record<string, string[]> = {
  puu: ["Jämä", "Kaukora", "Ariterm", "Högfors", "Muu"],
  sahko: ["Jäspi", "Kaukora", "Nibe", "Muu"],
  pelletti: ["Ariterm", "Biotech", "ÖkoFEN", "Kaukora", "Muu"],
  oljy: ["Jämä", "Kaukora", "Högfors", "Viessmann", "Buderus", "Oilon", "Muu"],
};
const LAMMONJAOT = [
  "Vesikiertoiset patterit",
  "Vesikiertoinen lattialämmitys",
  "Molemmat (patterit + lattialämmitys)",
  "Muu",
];
const PUTKI_MATERIAALIT_LAMM = [
  "Rauta / teräs",
  "Kupari",
  "Muovi (musta)",
  "Muovi (harmaa)",
  "Muovi (kirkas)",
  "Komposiitti",
];
const ILMANVAIHDOT = ["Painovoimainen", "Koneellinen poisto", "Koneellinen tulo- ja poistoilmanvaihto (LTO)", "Hybridi"];
const IKKUNATYYPIT = ["2-lasiset", "3-lasiset", "4-lasiset", "Sekoitus", "En tiedä"];
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
  const { data, isLoading } = useQuery({ queryKey: ["talo"], queryFn: () => fetchFn(), staleTime: 30_000 });
  const [active, setActive] = useState(0);
  const [k, setK] = useState<any>({});
  const [t, setT] = useState<any>({});
  const [p, setP] = useState<any>({});
  const [valmiit, setValmiit] = useState<string[]>([]);
  const hydrated = useRef(false);
  const hydratedKiinteistoId = useRef<string | null>(null);

  const [autoStatus, setAutoStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    const uusiId = data?.kiinteisto?.id ?? null;
    if (!data || !uusiId) return;
    if (hydratedKiinteistoId.current === uusiId) return;
    // Uusi kiinteistö (joko ensimmäinen lataus tai vaihto) → hydrataan kaikki state
    hydrated.current = false;
    if (data.kiinteisto) setK(data.kiinteisto);
    if (data.profile) setP(data.profile);
    if (data.talo) {
      setT(data.talo);
      setValmiit(Array.isArray(data.talo.valmiit_osiot) ? data.talo.valmiit_osiot as string[] : []);
    } else {
      setT({});
      setValmiit([]);
    }
    setActive(0);
    hydratedKiinteistoId.current = uusiId;
    const id = setTimeout(() => { hydrated.current = true; }, 50);
    return () => clearTimeout(id);
  }, [data]);

  const laite = t.lammitysmuoto ? MERKIT[t.lammitysmuoto] : undefined;
  const lammitysLisa = (t.lammitys_lisatieto && typeof t.lammitys_lisatieto === "object") ? t.lammitys_lisatieto : {};
  const setLisa = (patch: Record<string, any>) => setT({ ...t, lammitys_lisatieto: { ...lammitysLisa, ...patch } });
  const kattilaMerkitLista = lammitysLisa.kattila_tyyppi ? (KATTILA_MERKIT[lammitysLisa.kattila_tyyppi] ?? ["Muu"]) : ["Muu"];


  const buildPayload = (osioKey?: string, merkitseKaikkiValmiiksi?: boolean) => {
    let uudet = valmiit;
    if (merkitseKaikkiValmiiksi) {
      const kaikki = OSIOT.filter((o) => o.key !== "dokumentit").map((o) => o.key);
      const yhd = new Set([...valmiit, ...kaikki]);
      uudet = Array.from(yhd);
    } else if (osioKey && !valmiit.includes(osioKey)) {
      uudet = [...valmiit, osioKey];
    }
    return {
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
        julkisivu_asennettu_vuosi: num(t.julkisivu_asennettu_vuosi),
        perustus: str(t.perustus), eriste: str(t.eriste), rakennus_lisatieto: str(t.rakennus_lisatieto),
        kattotyyppi: str(t.kattotyyppi), kattomateriaali: str(t.kattomateriaali),
        katto_uusittu_vuosi: num(t.katto_uusittu_vuosi),
        katto_pinta_ala: num(t.katto_pinta_ala),
        raystaat_kunnostettu_vuosi: num(t.raystaat_kunnostettu_vuosi),
        hormit: str(t.hormit), hormityyppi: str(t.hormityyppi), hormien_maara: num(t.hormien_maara), kiuas_tyyppi: str(t.kiuas_tyyppi), kattoturvatuotteet: str(t.kattoturvatuotteet),
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
        ikkunat_tyyppi: str(t.ikkunat_tyyppi), ikkunat_uusittu_vuosi: num(t.ikkunat_uusittu_vuosi),
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
        terassi_lasitettu: boolOrNull(t.terassi_lasitettu),
        terassi_lasitus_vuosi: num(t.terassi_lasitus_vuosi),
        salaojat: boolOrNull(t.salaojat), salaojat_tarkastettu: dateStr(t.salaojat_tarkastettu),
        aurinkopaneelit: boolOrNull(t.aurinkopaneelit),
        aurinko_asennus_vuosi: t.aurinkopaneelit ? num(t.aurinko_asennus_vuosi) : null,
        valmiit_osiot: uudet,
      },
      _uudet: uudet,
    };
  };

  const save = useMutation({
    mutationFn: async (opts: { osioKey?: string; silent?: boolean; merkitseKaikkiValmiiksi?: boolean } = {}) => {
      const payload = buildPayload(opts.osioKey, opts.merkitseKaikkiValmiiksi);
      const uudet = payload._uudet;
      delete (payload as any)._uudet;
      await saveFn({ data: payload });
      setValmiit(uudet);
      return opts;
    },
    onSuccess: (opts) => {
      qc.invalidateQueries({ queryKey: ["talo"], refetchType: "inactive" });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["pts"] });
      if (opts?.silent) {
        setAutoStatus("saved");
        setTimeout(() => setAutoStatus("idle"), 1500);
      } else if (opts?.merkitseKaikkiValmiiksi) {
        toast.success("Kaikki välilehdet tallennettu");
      } else {
        toast.success("Tallennettu");
      }
    },
    onError: (e: any, opts) => {
      if (opts?.silent) setAutoStatus("idle");
      toast.error(e.message);
    },
  });

  // Autosave: gentle background save every 60 s
  useEffect(() => {
    if (!hydrated.current) return;
    const id = setInterval(() => {
      setAutoStatus("saving");
      save.mutate({ silent: true });
    }, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlurSave = (e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      setAutoStatus("saving");
      save.mutate({ silent: true });
    }
  };


  if (isLoading) return <p className="text-muted-foreground">Ladataan...</p>;

  const edistyminen = Math.round((valmiit.length / OSIOT.length) * 100);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="animate-fade-up">
        <p className="eyebrow mb-3 flex items-center gap-3"><span className="block h-px w-8 bg-primary" /> Talon tiedot</p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="font-serif text-4xl text-cream">Rakennuksen <em className="text-primary not-italic italic">profiili</em></h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground min-w-[120px] text-right">
              {autoStatus === "saving" ? "Tallennetaan..." : autoStatus === "saved" ? "✓ Tallennettu" : "Automaattitallennus"}
            </span>
            <Button onClick={() => save.mutate({ merkitseKaikkiValmiiksi: true })} disabled={save.isPending} variant="outline" className="uppercase tracking-wider font-semibold">
              Tallenna kaikki välilehdet
            </Button>
          </div>
        </div>
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
        <CardContent className="pt-6 space-y-5" onBlur={handleBlurSave}>
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
            <Row>
              <Field label="Julkisivun asennusvuosi"><Input type="number" value={t.julkisivu_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, julkisivu_asennettu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäinen" /></Field>
              {/^.*(puu|hirsi).*$/i.test(String(t.julkisivumateriaali ?? "")) && (
                <Field label="Julkisivu maalattu / huollettu (vuosi)"><Input type="number" value={t.julkisivu_maalattu_vuosi ?? ""} onChange={(e) => setT({ ...t, julkisivu_maalattu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos ei tiedossa" /></Field>
              )}
            </Row>
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
              <Field label="Katon asennusvuosi"><Input type="number" value={t.katto_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, katto_uusittu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäinen" /></Field>
            </Row>
            <Row>
              <Field label="Hormityyppi">
                <Select value={t.hormityyppi ?? ""} onValueChange={(v) => setT({ ...t, hormityyppi: v })}>
                  <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                  <SelectContent>{HORMITYYPIT.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Hormeja (kpl)"><Input type="number" min="0" value={t.hormien_maara ?? ""} onChange={(e) => setT({ ...t, hormien_maara: e.target.value })} disabled={t.hormityyppi === "Ei hormia"} /></Field>
            </Row>
            <Row>
              <Field label="Kattoturvatuotteet"><Input value={t.kattoturvatuotteet ?? ""} onChange={(e) => setT({ ...t, kattoturvatuotteet: e.target.value })} placeholder="Esim. lumiesteet, kattosillat" /></Field>
              <div />
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
              <Field label="Räystäät asennettu (vuosi)"><Input type="number" value={t.raystaat_kunnostettu_vuosi ?? ""} onChange={(e) => setT({ ...t, raystaat_kunnostettu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäiset" /></Field>
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
                  <SelectContent>
                    {LAMMITYS.map((l) => <SelectItem key={l.key} value={l.key}>{l.nimi}</SelectItem>)}
                    {t.lammitysmuoto && LAMMITYS_LEGACY[t.lammitysmuoto] && (
                      <SelectItem value={t.lammitysmuoto}>{LAMMITYS_LEGACY[t.lammitysmuoto]}</SelectItem>
                    )}
                  </SelectContent>
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

            {/* Keskuslämmitys: kattilan tiedot */}
            {t.lammitysmuoto === "keskuslammitys" && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-4">
                <p className="eyebrow text-primary">Kattila</p>
                <Row>
                  <Field label="Kattilatyyppi">
                    <Select value={lammitysLisa.kattila_tyyppi ?? ""} onValueChange={(v) => setLisa({ kattila_tyyppi: v, kattila_merkki: null })}>
                      <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                      <SelectContent>{KATTILA_TYYPIT.map((kt) => <SelectItem key={kt.key} value={kt.key}>{kt.nimi}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Kattilan asennusvuosi"><Input type="number" value={lammitysLisa.kattila_asennettu_vuosi ?? ""} onChange={(e) => setLisa({ kattila_asennettu_vuosi: e.target.value })} /></Field>
                </Row>
                {lammitysLisa.kattila_tyyppi && (
                  <Row>
                    <Field label="Kattilan merkki">
                      <SelectOrOther value={lammitysLisa.kattila_merkki} options={kattilaMerkitLista} onChange={(v) => setLisa({ kattila_merkki: v })} />
                    </Field>
                    <Field label="Mallimerkintä"><Input value={lammitysLisa.kattila_malli ?? ""} onChange={(e) => setLisa({ kattila_malli: e.target.value })} /></Field>
                  </Row>
                )}
              </div>
            )}

            {/* Vesikiertoinen lämmönjako + lämmitysputkisto */}
            {(t.lammitysmuoto === "keskuslammitys" || t.lammitysmuoto === "kaukolampo" || t.lammitysmuoto === "maalampo" || t.lammitysmuoto === "ilmavesilampo") && (
              <div className="rounded-md border border-border bg-card/40 p-4 space-y-4">
                <p className="eyebrow text-primary">Lämmönjako ja lämmitysputkisto</p>
                <Row>
                  <Field label="Lämmönjako">
                    <SelectOrOther value={lammitysLisa.lammonjako} options={LAMMONJAOT} onChange={(v) => setLisa({ lammonjako: v })} />
                  </Field>
                  <Field label="Putkiston asennusvuosi"><Input type="number" value={lammitysLisa.putki_asennettu_vuosi ?? ""} onChange={(e) => setLisa({ putki_asennettu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäinen" /></Field>
                </Row>
                <Field label="Lämmitysputkiston materiaali">
                  <SelectOrOther value={lammitysLisa.putki_materiaali} options={PUTKI_MATERIAALIT_LAMM} onChange={(v) => setLisa({ putki_materiaali: v })} />
                </Field>
              </div>
            )}

            {/* Suora sähkölämmitys: patterit + LVV */}
            {t.lammitysmuoto === "sahkolammitys" && (
              <div className="rounded-md border border-border bg-card/40 p-4 space-y-4">
                <p className="eyebrow text-primary">Sähköpatterit ja lämminvesivaraaja</p>
                <Field label="Sähköpattereiden asennusvuosi"><Input type="number" value={lammitysLisa.sahkopatteri_asennettu_vuosi ?? ""} onChange={(e) => setLisa({ sahkopatteri_asennettu_vuosi: e.target.value })} /></Field>
                <Row>
                  <Field label="Lämminvesivaraajan merkki">
                    <SelectOrOther value={lammitysLisa.lvv_merkki} options={MERKIT.sahkolammitys.merkit} onChange={(v) => setLisa({ lvv_merkki: v })} />
                  </Field>
                  <Field label="LVV:n mallimerkintä"><Input value={lammitysLisa.lvv_malli ?? ""} onChange={(e) => setLisa({ lvv_malli: e.target.value })} /></Field>
                </Row>
                <Field label="LVV:n asennusvuosi"><Input type="number" value={lammitysLisa.lvv_asennettu_vuosi ?? ""} onChange={(e) => setLisa({ lvv_asennettu_vuosi: e.target.value })} /></Field>
              </div>
            )}

            <p className="eyebrow text-primary pt-2">Ilmalämpöpumppu (lisälaite)</p>
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
              <Field label="IV-koneen asennusvuosi"><Input type="number" value={t.ilmanvaihto_vuosi ?? ""} onChange={(e) => setT({ ...t, ilmanvaihto_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäinen" /></Field>
            </Row>
            <Row>
              <Field label="Suodatintyyppi">
                <SelectOrOther value={t.iv_suodatintyyppi} options={IV_SUODATTIMET} onChange={(v) => setT({ ...t, iv_suodatintyyppi: v })} />
              </Field>
              <Field label="Suodatin vaihdettu viimeksi"><Input type="date" value={t.iv_suodatin_vaihdettu ?? ""} onChange={(e) => setT({ ...t, iv_suodatin_vaihdettu: e.target.value })} /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Aurinkopaneelit</p>
            <Row>
              <Field label="Onko talossa aurinkopaneelit?">
                <Select
                  value={t.aurinkopaneelit ? "kylla" : "ei"}
                  onValueChange={(v) => setT({
                    ...t,
                    aurinkopaneelit: v === "kylla",
                    aurinko_asennus_vuosi: v === "kylla" ? t.aurinko_asennus_vuosi : null,
                  })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ei">Ei</SelectItem>
                    <SelectItem value="kylla">Kyllä</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {t.aurinkopaneelit && (
                <Field label="Asennusvuosi">
                  <Input
                    type="number"
                    value={t.aurinko_asennus_vuosi ?? ""}
                    onChange={(e) => setT({ ...t, aurinko_asennus_vuosi: e.target.value })}
                    placeholder="esim. 2022"
                  />
                </Field>
              )}
            </Row>



            <p className="eyebrow text-primary pt-4">Vesiputket ja viemärit</p>
            <Row>
              <Field label="Käyttövesiputket">
                <SelectOrOther value={t.putkimateriaali} options={PUTKIMATERIAALIT} onChange={(v) => setT({ ...t, putkimateriaali: v })} />
              </Field>
              <Field label="Putkien asennusvuosi"><Input type="number" value={t.putket_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, putket_uusittu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäiset" /></Field>
            </Row>
            <Row>
              <Field label="Viemärien materiaali">
                <SelectOrOther value={t.viemarimateriaali} options={VIEMARIMATERIAALIT} onChange={(v) => setT({ ...t, viemarimateriaali: v })} />
              </Field>
              <Field label="Viemärien asennusvuosi"><Input type="number" value={t.viemari_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, viemari_asennettu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäiset" /></Field>
            </Row>
            <Field label="Pääsulun sijainti"><Input value={t.paasulun_sijainti ?? ""} onChange={(e) => setT({ ...t, paasulun_sijainti: e.target.value })} placeholder="Esim. tekninen tila, kellari" /></Field>

            <p className="eyebrow text-primary pt-4">Ikkunat</p>
            <Row>
              <Field label="Ikkunatyyppi">
                <SelectOrOther value={t.ikkunat_tyyppi} options={IKKUNATYYPIT} onChange={(v) => setT({ ...t, ikkunat_tyyppi: v })} />
              </Field>
              <Field label="Ikkunoiden asennusvuosi"><Input type="number" value={t.ikkunat_uusittu_vuosi ?? ""} onChange={(e) => setT({ ...t, ikkunat_uusittu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäiset" /></Field>
            </Row>

            <p className="eyebrow text-primary pt-4">Muut laitteet</p>
            <Row>
              <Field label="Palovaroittimia (kpl)"><Input type="number" value={t.palovaroittimia ?? ""} onChange={(e) => setT({ ...t, palovaroittimia: e.target.value })} /></Field>
              <Field label="Paristot vaihdettu"><Input type="date" value={t.palovaroitin_paristot ?? ""} onChange={(e) => setT({ ...t, palovaroitin_paristot: e.target.value })} /></Field>
            </Row>
            <Row>
              <Field label="Kiukaan asennusvuosi"><Input type="number" value={t.kiukaan_vuosi ?? ""} onChange={(e) => setT({ ...t, kiukaan_vuosi: e.target.value })} /></Field>
              <Field label="Kiuastyyppi">
                <Select value={t.kiuas_tyyppi ?? ""} onValueChange={(v) => setT({ ...t, kiuas_tyyppi: v })}>
                  <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                  <SelectContent>{KIUAS_TYYPIT.map((k) => <SelectItem key={k.key} value={k.key}>{k.nimi}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </Row>
            <Field label="Nuohous viimeksi"><Input type="date" value={t.nuohous_pvm ?? ""} onChange={(e) => setT({ ...t, nuohous_pvm: e.target.value })} /></Field>
            <Field label="Sähköjärjestelmän asennusvuosi"><Input type="number" value={t.sahkot_asennettu_vuosi ?? ""} onChange={(e) => setT({ ...t, sahkot_asennettu_vuosi: e.target.value })} placeholder="Jätä tyhjäksi jos alkuperäinen" /></Field>
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
            <Row>
              <Field label="Lasitus">
                <Select value={t.terassi_lasitettu == null ? "" : String(t.terassi_lasitettu)} onValueChange={(v) => setT({ ...t, terassi_lasitettu: v === "true" })}>
                  <SelectTrigger><SelectValue placeholder="Valitse" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Kyllä, lasitettu</SelectItem>
                    <SelectItem value="false">Ei lasitusta</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Lasitus asennettu vuonna"><Input type="number" value={t.terassi_lasitus_vuosi ?? ""} onChange={(e) => setT({ ...t, terassi_lasitus_vuosi: e.target.value })} disabled={t.terassi_lasitettu !== true} /></Field>
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
              <Button onClick={() => save.mutate({ osioKey: OSIOT[active].key })} disabled={save.isPending} className="uppercase tracking-wider font-semibold">
                {save.isPending ? "Tallennetaan..." : "Tallenna ja merkitse valmiiksi"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <KausikirjeToggle />
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

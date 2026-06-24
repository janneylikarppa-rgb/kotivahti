import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getMyyntiraportti } from "@/lib/kotivahti.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Printer, Pencil, ExternalLink, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/myyntiraportti")({
  loader: ({ context }) => {
    if (typeof window === "undefined") return null;
    return context.queryClient.ensureQueryData({
      queryKey: ["myyntiraportti"],
      queryFn: () => getMyyntiraportti(),
      staleTime: 30_000,
    });
  },
  component: MyyntiraporttiPage,
});

const LAMMITYS_POLTTOAINE = new Set(["kaukolampo", "oljy", "puu", "hake", "pelletti"]);
const LAMMITYS_LABEL: Record<string, string> = {
  kaukolampo: "Kaukolämpö",
  oljy: "Öljylämmitys",
  puu: "Puulämmitys",
  hake: "Hakelämmitys",
  pelletti: "Pellettilämmitys",
  sahko: "Sähkölämmitys",
  maalampo: "Maalämpö",
  ilma_vesi: "Ilma-vesilämpöpumppu",
  ilmalampopumppu: "Ilmalämpöpumppu",
};

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleDateString("fi-FI");
  } catch {
    return s;
  }
}
function fmtNum(n: number, dec = 0) {
  return n.toLocaleString("fi-FI", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function Rivi({ label, value }: { label: string; value: any }) {
  if (value == null || value === "" || value === false) return null;
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-dashed border-black/10">
      <span className="text-sm opacity-70">{label}</span>
      <span className="text-sm font-medium text-right">{String(value)}</span>
    </div>
  );
}

function kategoriaRyhma(kohdeAvain: string | null | undefined): string {
  const a = (kohdeAvain ?? "").toLowerCase();
  if (a.startsWith("katto") || a.includes("raystas")) return "Kattoon ja rakenteisiin liittyvät";
  if (a.includes("kylpyhuone") || a.includes("viemari") || a.includes("kayttovesi") || a.includes("vesi"))
    return "Märkätiloihin liittyvät";
  if (a.startsWith("lammitys") || a.includes("iv_") || a.includes("ilmanvaihto") || a.includes("ilp"))
    return "Lämmitykseen ja talotekniikkaan";
  return "Muut dokumentit";
}

function MyyntiraporttiPage() {
  const fetchFn = useServerFn(getMyyntiraportti);
  const { data, isLoading } = useQuery({
    queryKey: ["myyntiraportti"],
    queryFn: () => fetchFn(),
    staleTime: 30_000,
  });

  const [kommentti, setKommentti] = useState("");
  const [varoitus, setVaroitus] = useState(false);

  const kulutusInfo = useMemo(() => {
    if (!data) return null;
    const kulut = data.kulut as any[];
    const lammitysmuoto = (data.talo?.lammitysmuoto ?? "").toLowerCase();
    const sahkoKwh = kulut
      .filter((k) => k.kategoria === "sahko")
      .reduce((s, k) => s + Number(k.kwh || 0), 0);
    const vesiM3 = kulut
      .filter((k) => k.kategoria === "vesi")
      .reduce((s, k) => s + Number(k.kulutus_m3 || 0), 0);
    const lammitysRivit = kulut.filter((k) => k.kategoria === "lammitys");
    const lammitysKwh = lammitysRivit.reduce((s, k) => s + Number(k.kwh || 0), 0);
    const lammitysSumma = lammitysRivit.reduce((s, k) => s + Number(k.summa || 0), 0);
    return {
      lammitysmuoto,
      naytaLammitys: LAMMITYS_POLTTOAINE.has(lammitysmuoto),
      sahko: sahkoKwh > 0 ? sahkoKwh : null,
      vesi: vesiM3 > 0 ? vesiM3 : null,
      lammitys: lammitysKwh > 0 || lammitysSumma > 0 ? { kwh: lammitysKwh, summa: lammitysSumma } : null,
    };
  }, [data]);

  const [sisallyta, setSisallyta] = useState<{ sahko: boolean; lammitys: boolean; vesi: boolean }>({
    sahko: false,
    lammitys: false,
    vesi: false,
  });

  // Initial sync once data loads
  useEffect(() => {
    if (kulutusInfo) {
      setSisallyta({
        sahko: !!kulutusInfo.sahko,
        lammitys: !!kulutusInfo.lammitys,
        vesi: !!kulutusInfo.vesi,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.kulutVuosi]);


  // Liite-numerointi
  const liitteet = useMemo(() => {
    if (!data) return { items: [] as any[], byHuolto: {} as Record<string, any[]>, ryhmat: {} as Record<string, any[]> };
    const dokumentit = (data.dokumentit as any[]).slice();
    const huoltoPvm = new Map<string, string>();
    for (const h of data.huollot as any[]) huoltoPvm.set(h.id, h.pvm);

    dokumentit.sort((a, b) => {
      const aH = a.huolto_id ? huoltoPvm.get(a.huolto_id) ?? "9999" : "9999";
      const bH = b.huolto_id ? huoltoPvm.get(b.huolto_id) ?? "9999" : "9999";
      if (aH !== bH) return aH.localeCompare(bH);
      return (a.lisatty_pvm ?? "").localeCompare(b.lisatty_pvm ?? "");
    });

    const items = dokumentit.map((d, i) => ({ ...d, liite_nro: i + 1 }));
    const byHuolto: Record<string, any[]> = {};
    const ryhmat: Record<string, any[]> = {};
    for (const it of items) {
      if (it.huolto_id) (byHuolto[it.huolto_id] ||= []).push(it);
      const h = (data.huollot as any[]).find((x) => x.id === it.huolto_id);
      const ryhma = kategoriaRyhma(h?.kohde_avain);
      (ryhmat[ryhma] ||= []).push(it);
    }
    return { items, byHuolto, ryhmat };
  }, [data]);

  if (isLoading) return <div className="text-muted-foreground">Ladataan…</div>;
  if (!data) return <div className="text-muted-foreground">Ei kiinteistöä.</div>;

  const t = data.talo ?? {};
  const k = data.kiinteisto;
  const huollot = data.huollot as any[];
  const vuosi = data.kulutVuosi;

  // Talotekniikka helpers
  const dataJsonb = (t.data ?? {}) as Record<string, any>;
  const lammitysMalli = (t.lammitys_lisatieto ?? {})?.malli ?? null;
  const onIlmalampopumppu = !!t.ilp_asennettu_vuosi || !!t.ilp_malli || !!t.ilp_merkki;

  const laitelista: string[] = [];
  if (t.kiukaan_vuosi || t.kiuas_tyyppi) laitelista.push(`Kiuas${t.kiuas_tyyppi ? ` (${t.kiuas_tyyppi})` : ""}`);
  if (t.salaojat) laitelista.push("Salaojat");
  if (t.terassi_lasitettu) laitelista.push("Lasitettu terassi");
  if (Number(t.palovaroittimia) > 0) laitelista.push(`Palovaroittimet (${t.palovaroittimia} kpl)`);
  if (t.hormit || t.hormityyppi) laitelista.push(`Hormi${t.hormityyppi ? ` (${t.hormityyppi})` : ""}`);
  if (Array.isArray(dataJsonb.laitteet)) for (const l of dataJsonb.laitteet) if (l) laitelista.push(String(l));

  const vanhinHuolto = huollot[0]?.pvm ? new Date(huollot[0].pvm).getFullYear() : null;

  // Toistuvat kulut yhteensä
  const toistuvatYht = (data.toistuvat as any[]).reduce((s, x) => s + Number(x.summa || 0), 0);

  function handlePrint() {
    const togglePaalla = sisallyta.sahko || sisallyta.lammitys || sisallyta.vesi;
    const dataPuuttuu =
      (sisallyta.sahko && !kulutusInfo?.sahko) ||
      (sisallyta.lammitys && !kulutusInfo?.lammitys) ||
      (sisallyta.vesi && !kulutusInfo?.vesi);
    if (togglePaalla && dataPuuttuu) {
      setVaroitus(true);
      return;
    }
    window.print();
  }

  function ValidointiKortti({
    nimi,
    onData,
    kentta,
    yksikko,
  }: {
    nimi: string;
    onData: boolean;
    kentta: "sahko" | "lammitys" | "vesi";
    yksikko: string;
  }) {
    return (
      <Card className={onData ? "border-green-600/50" : ""}>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-cream">{nimi}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {onData ? `✓ Vuosi ${vuosi} kirjattu (${yksikko})` : `– Vuoden ${vuosi} dataa ei kirjattu`}
              </p>
            </div>
            {!onData && (
              <Button asChild variant="outline" size="sm">
                <Link to="/kulut">Lisää →</Link>
              </Button>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs">
            <Switch
              checked={sisallyta[kentta]}
              onCheckedChange={(v) => setSisallyta((s) => ({ ...s, [kentta]: v }))}
            />
            <span className="text-muted-foreground">
              {sisallyta[kentta] ? "Sisällytetään raporttiin" : "Jätetään tyhjäksi"}
            </span>
          </label>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Validointipalkki */}
      <div className="no-print space-y-3">
        <header>
          <p className="eyebrow mb-2 flex items-center gap-3">
            <span className="block h-px w-8 bg-primary" /> Myyntiraportti
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-cream">
            Huoltokirja <em className="text-primary not-italic italic">välittäjälle</em>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tarkista kulutusdata ja tulosta raportti. Voit lisätä myyjän kommentin alimpana.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          <ValidointiKortti nimi="Sähkönkulutus" onData={!!kulutusInfo?.sahko} kentta="sahko" yksikko="kWh" />
          {kulutusInfo?.naytaLammitys && (
            <ValidointiKortti
              nimi={LAMMITYS_LABEL[kulutusInfo.lammitysmuoto] ?? "Lämmitys"}
              onData={!!kulutusInfo?.lammitys}
              kentta="lammitys"
              yksikko="kWh / €"
            />
          )}
          <ValidointiKortti nimi="Vedenkulutus" onData={!!kulutusInfo?.vesi} kentta="vesi" yksikko="m³" />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={handlePrint} className="bg-primary text-primary-foreground">
            <Printer className="mr-2 h-4 w-4" /> Tulosta raportti
          </Button>
          <Button asChild variant="outline">
            <Link to="/talon-tiedot">
              <Pencil className="mr-2 h-4 w-4" /> Muokkaa talon tietoja
            </Link>
          </Button>
        </div>
      </div>

      {/* Itse raportti */}
      <article className="raportti bg-white text-black rounded-lg shadow-sm p-8 md:p-12 space-y-10">
        {/* OSA 1: Kansilehti */}
        <section className="page-break text-center space-y-4">
          <h1 className="font-serif italic text-4xl md:text-5xl">Huoltokirja ja kuntoraportti</h1>
          <div className="text-xl md:text-2xl mt-6">
            {k.osoite}
            {k.kaupunki ? `, ${k.kaupunki}` : ""}
          </div>
          {k.rakennusvuosi && <div className="text-lg opacity-70">Rakennusvuosi: {k.rakennusvuosi}</div>}
          <div className="my-6 mx-auto h-px w-32" style={{ background: "var(--gold)" }} />
          <p className="text-sm opacity-70">Dokumentoitu Kotivahti-palvelussa</p>
          <p className="text-sm opacity-70">Päivätty {new Date().toLocaleDateString("fi-FI")}</p>
          <div className="text-sm mt-8 flex justify-center gap-4 flex-wrap opacity-80">
            <span>{huollot.length} huoltoa kirjattu</span>
            <span>·</span>
            <span>{liitteet.items.length} dokumenttia liitteenä</span>
            {vanhinHuolto && (
              <>
                <span>·</span>
                <span>Dokumentoitu vuodesta {vanhinHuolto}</span>
              </>
            )}
          </div>
        </section>

        {/* OSA 2: Perustiedot */}
        <section className="space-y-3">
          <h2 className="font-serif italic text-2xl border-b pb-2">Talon perustiedot</h2>
          <div className="grid md:grid-cols-2 gap-x-8">
            <div>
              <Rivi label="Osoite" value={k.osoite} />
              <Rivi label="Kaupunki" value={k.kaupunki} />
              <Rivi label="Rakennusvuosi" value={k.rakennusvuosi} />
              <Rivi label="Asuinpinta-ala" value={t.pinta_ala ? `${t.pinta_ala} m²` : null} />
              <Rivi label="Kokonaispinta-ala" value={t.kokonaispinta_ala ? `${t.kokonaispinta_ala} m²` : null} />
              <Rivi label="Kerroksia" value={t.kerroksia} />
              <Rivi label="Kellari" value={dataJsonb.kellari === true ? "Kyllä" : dataJsonb.kellari === false ? "Ei" : null} />
              <Rivi label="Tontti" value={t.tontin_pinta_ala ? `${t.tontin_pinta_ala} m²` : null} />
              <Rivi label="Kiinteistötunnus" value={dataJsonb.kiinteistotunnus} />
            </div>
            <div>
              <Rivi label="Kantava rakenne" value={t.rakennustapa} />
              <Rivi label="Julkisivu" value={t.julkisivumateriaali} />
              <Rivi label="Perustus" value={t.perustus} />
              <Rivi label="Eriste" value={t.eriste} />
              <Rivi
                label="Kattomateriaali"
                value={t.kattomateriaali ? `${t.kattomateriaali}${t.katto_uusittu_vuosi ? ` (${t.katto_uusittu_vuosi})` : ""}` : null}
              />
              <Rivi
                label="Ikkunat"
                value={t.ikkunat_tyyppi ? `${t.ikkunat_tyyppi}${t.ikkunat_uusittu_vuosi ? ` (${t.ikkunat_uusittu_vuosi})` : ""}` : t.ikkunat_uusittu_vuosi ? `${t.ikkunat_uusittu_vuosi}` : null}
              />
            </div>
          </div>
        </section>

        {/* OSA 3: Talotekniikka */}
        {(t.lammitysmuoto || t.ilmanvaihto || t.putkimateriaali || t.viemarimateriaali || laitelista.length > 0) && (
          <section className="page-break space-y-4">
            <h2 className="font-serif italic text-2xl border-b pb-2">Talotekniikka</h2>

            {t.lammitysmuoto && (
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide opacity-70 mb-1">Lämmitys</h3>
                <Rivi label="Päälämmitysmuoto" value={LAMMITYS_LABEL[t.lammitysmuoto] ?? t.lammitysmuoto} />
                <Rivi label="Asennettu" value={t.lammitys_asennettu_vuosi} />
                <Rivi label="Merkki / malli" value={lammitysMalli} />
                {onIlmalampopumppu && (
                  <>
                    <Rivi label="Lisälämmitys" value="Ilmalämpöpumppu" />
                    <Rivi label="ILP asennettu" value={t.ilp_asennettu_vuosi} />
                    <Rivi label="ILP merkki / malli" value={t.ilp_malli || t.ilp_merkki} />
                  </>
                )}
              </div>
            )}

            {(t.ilmanvaihto || t.ilmanvaihto_vuosi) && (
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide opacity-70 mb-1">Ilmanvaihto</h3>
                <Rivi label="Tyyppi" value={t.ilmanvaihto} />
                <Rivi label="Asennettu" value={t.ilmanvaihto_vuosi} />
              </div>
            )}

            {(t.putkimateriaali || t.viemarimateriaali) && (
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide opacity-70 mb-1">Käyttövesi ja viemäri</h3>
                <Rivi
                  label="Vesiputket"
                  value={t.putkimateriaali ? `${t.putkimateriaali}${t.putket_uusittu_vuosi ? ` (${t.putket_uusittu_vuosi})` : ""}` : null}
                />
                <Rivi
                  label="Viemärit"
                  value={t.viemarimateriaali ? `${t.viemarimateriaali}${t.viemari_asennettu_vuosi ? ` (${t.viemari_asennettu_vuosi})` : ""}` : null}
                />
              </div>
            )}

            {laitelista.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide opacity-70 mb-1">Muut laitteet</h3>
                <ul className="list-disc pl-5 text-sm">
                  {laitelista.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* OSA 4: Energiankulutus */}
        <section className="space-y-3">
          <h2 className="font-serif italic text-2xl border-b pb-2">Energiankulutus</h2>
          <p className="text-xs opacity-60">Viimeisin täysi kalenterivuosi</p>
          <div className="kulutus-taulu space-y-1 text-sm">
            {sisallyta.sahko ? (
              <Rivi label={`Sähkönkulutus ${vuosi}`} value={kulutusInfo?.sahko ? `${fmtNum(kulutusInfo.sahko)} kWh` : "—"} />
            ) : (
              <div className="flex justify-between py-1 border-b border-dashed border-black/20">
                <span>Sähkönkulutus {vuosi}:</span>
                <span className="opacity-50">_________ kWh</span>
              </div>
            )}

            {kulutusInfo?.naytaLammitys &&
              (sisallyta.lammitys ? (
                <Rivi
                  label={`${LAMMITYS_LABEL[kulutusInfo.lammitysmuoto] ?? "Lämmitys"} ${vuosi}`}
                  value={
                    kulutusInfo.lammitys
                      ? kulutusInfo.lammitysmuoto === "kaukolampo"
                        ? `${fmtNum(kulutusInfo.lammitys.kwh / 1000, 1)} MWh`
                        : `${fmtNum(kulutusInfo.lammitys.kwh)} kWh`
                      : "—"
                  }
                />
              ) : (
                <div className="flex justify-between py-1 border-b border-dashed border-black/20">
                  <span>
                    {LAMMITYS_LABEL[kulutusInfo.lammitysmuoto] ?? "Lämmitys"} {vuosi}:
                  </span>
                  <span className="opacity-50">_________</span>
                </div>
              ))}

            {sisallyta.vesi ? (
              <Rivi label={`Vedenkulutus ${vuosi}`} value={kulutusInfo?.vesi ? `${fmtNum(kulutusInfo.vesi, 1)} m³` : "—"} />
            ) : (
              <div className="flex justify-between py-1 border-b border-dashed border-black/20">
                <span>Vedenkulutus {vuosi}:</span>
                <span className="opacity-50">_________ m³</span>
              </div>
            )}
          </div>
        </section>

        {/* OSA 5: Kiinteät vuosikulut */}
        {data.toistuvat.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-serif italic text-2xl border-b pb-2">Kiinteät vuosikulut</h2>
            <p className="text-xs opacity-60">Vakiomaksut jotka siirtyvät uudelle omistajalle</p>
            <div className="space-y-1 text-sm">
              {(data.toistuvat as any[]).map((tk) => (
                <div key={tk.id} className="flex justify-between py-1 border-b border-dashed border-black/10">
                  <span>{tk.kategoria === "kiinteistovero" ? "Kiinteistövero" : tk.nimi}:</span>
                  <span>{fmtNum(Number(tk.summa))} €/v</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-semibold border-t border-black">
                <span>Yhteensä</span>
                <span>{fmtNum(toistuvatYht)} €/v</span>
              </div>
            </div>
          </section>
        ) : (
          <section className="no-print space-y-2">
            <h2 className="font-serif italic text-2xl border-b pb-2">Kiinteät vuosikulut</h2>
            <Button asChild variant="outline" size="sm">
              <Link to="/kulut">Lisää kiinteät kulut →</Link>
            </Button>
          </section>
        )}

        {/* OSA 6: Huollot ja remontit */}
        <section className="page-break space-y-3">
          <h2 className="font-serif italic text-2xl border-b pb-2">Huolto- ja remonttitoimenpiteet</h2>
          <p className="text-xs opacity-60">Kronologisessa järjestyksessä, vanhin ensin</p>
          {huollot.length === 0 ? (
            <p className="text-sm opacity-70 no-print">
              Huoltokirjauksia ei ole lisätty.{" "}
              <Link to="/huoltohistoria" className="underline">
                Lisää huoltoja →
              </Link>
            </p>
          ) : (
            <ul className="space-y-4">
              {huollot.map((h) => (
                <li key={h.id} className="border-l-2 border-black/30 pl-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">{fmtDate(h.pvm)}</span>
                    <span>{h.kuvaus || h.kohde || h.tyyppi}</span>
                  </div>
                  <div className="opacity-80 mt-1 space-y-0.5">
                    <div>Tyyppi: {h.tyyppi}</div>
                    <div>Tekijä: {h.tekija === "itse" ? "Itse" : h.tekija_nimi || h.tekija}</div>
                    {Number(h.takuu_vuotta) > 0 && <div>Takuu: {h.takuu_vuotta} vuotta</div>}
                    {(liitteet.byHuolto[h.id] ?? []).map((l) => (
                      <div key={l.id}>
                        → ks. Liite {l.liite_nro}: {l.nimi}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* OSA 7: Liiteluettelo */}
        {liitteet.items.length > 0 && (
          <section className="page-break space-y-4">
            <h2 className="font-serif italic text-2xl border-b pb-2">Liitteet</h2>
            <p className="text-xs opacity-60">Kaikki raporttiin liittyvät dokumentit</p>
            {Object.entries(liitteet.ryhmat).map(([ryhma, items]) => (
              <div key={ryhma} className="space-y-2">
                <h3 className="font-semibold text-sm uppercase tracking-wide opacity-70">{ryhma}</h3>
                <ul className="space-y-1 text-sm">
                  {items.map((l) => {
                    const h = (data.huollot as any[]).find((x) => x.id === l.huolto_id);
                    return (
                      <li key={l.id} className="flex justify-between gap-3 py-1 border-b border-dashed border-black/10">
                        <span>
                          <span className="font-mono mr-2">Liite {l.liite_nro}</span>
                          {l.nimi}
                          {h && <span className="opacity-60"> — {h.kuvaus || h.kohde || h.tyyppi}, {fmtDate(h.pvm)}</span>}
                        </span>
                        {l.url && (
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-print text-xs inline-flex items-center gap-1 underline"
                          >
                            Avaa <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* OSA 8: Myyjän kommentti */}
        <section className="space-y-2">
          <h2 className="font-serif italic text-2xl border-b pb-2">Myyjän lisätieto</h2>
          <div className="no-print">
            <Textarea
              value={kommentti}
              onChange={(e) => setKommentti(e.target.value)}
              placeholder="Kirjoita tähän vapaamuotoinen myyjän kommentti…"
              className="min-h-32 text-black"
            />
          </div>
          {kommentti.trim() && (
            <div className="hidden print:block whitespace-pre-wrap text-sm">{kommentti}</div>
          )}
          {!kommentti.trim() && <div className="hidden print:block text-sm opacity-50">—</div>}
        </section>

        {/* OSA 9: Allekirjoitus */}
        <section className="space-y-3 pt-8 text-sm">
          <div>Paikka ja aika: ____________________, __.__.______</div>
          <div>Myyjä: __________________________________________</div>
          <div>Allekirjoitus: ___________________________________</div>
        </section>
      </article>

      <AlertDialog open={varoitus} onOpenChange={setVaroitus}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Kulutusdata puutteellinen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Yksi tai useampi kulutustyyppi on merkitty sisällytettäväksi, mutta vuoden {vuosi} dataa ei
              löydy. Haluatko tulostaa silti?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setVaroitus(false);
                setTimeout(() => window.print(), 100);
              }}
            >
              Tulosta silti
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

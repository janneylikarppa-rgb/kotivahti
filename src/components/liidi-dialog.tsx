import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getOmatKiinteistot, luoLiidi } from "@/lib/liidit.functions";
import {
  LIIDI_KATEGORIAT,
  LIIDI_PALVELUT,
  LIIDI_AJOITUKSET,
  type LiidiKategoria,
} from "@/lib/liidit-kategoriat";

type Palvelu = "kuntoarvio" | "huolto" | "tarjouspyynto";
type Ajoitus = "asap" | "1_3kk" | "ensi_vuonna";

export type LiidiDialogProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  esitaytetty?: {
    palvelu?: Palvelu;
    kategoria?: LiidiKategoria;
    kuvaus?: string;
    pts_kohde?: string;
    lukitseKategoria?: boolean;
  };
};

export function LiidiDialog({ open, onOpenChange, esitaytetty }: LiidiDialogProps) {
  const fetchKt = useServerFn(getOmatKiinteistot);
  const luoFn = useServerFn(luoLiidi);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["liidi-kiinteistot"],
    queryFn: () => fetchKt(),
    enabled: open,
    staleTime: 60_000,
  });

  const [palvelu, setPalvelu] = useState<Palvelu>(esitaytetty?.palvelu ?? "huolto");
  const [kategoria, setKategoria] = useState<LiidiKategoria>(esitaytetty?.kategoria ?? "Muu / yleinen");
  const [kuvaus, setKuvaus] = useState(esitaytetty?.kuvaus ?? "");
  const [nimi, setNimi] = useState("");
  const [puhelin, setPuhelin] = useState("");
  const [sahkoposti, setSahkoposti] = useState("");
  const [kiinteistoId, setKiinteistoId] = useState<string>("");
  const [ajoitus, setAjoitus] = useState<Ajoitus>("1_3kk");
  const [lisatieto, setLisatieto] = useState("");

  // Esitäytä yhteystiedot ja kiinteistö profiilista
  useEffect(() => {
    if (!open || !data) return;
    if (data.profile?.nimi && !nimi) setNimi(data.profile.nimi);
    if (data.profile?.email && !sahkoposti) setSahkoposti(data.profile.email);
    if (data.profile?.puhelin && !puhelin) setPuhelin(data.profile.puhelin);
    if (!kiinteistoId && data.valittu_id) setKiinteistoId(data.valittu_id);
  }, [open, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Esitäytä kun esitaytetty muuttuu / dialogi avautuu
  useEffect(() => {
    if (!open) return;
    if (esitaytetty?.palvelu) setPalvelu(esitaytetty.palvelu);
    if (esitaytetty?.kategoria) setKategoria(esitaytetty.kategoria);
    if (esitaytetty?.kuvaus) setKuvaus(esitaytetty.kuvaus);
  }, [open, esitaytetty?.palvelu, esitaytetty?.kategoria, esitaytetty?.kuvaus]);

  // Automaattinen lisätieto: kourut/syöksytorvet/nuohous → tuo talon tietoja näkyviin
  const valittuKt: any = useMemo(
    () => data?.kiinteistot?.find((k: any) => k.id === kiinteistoId) ?? null,
    [data, kiinteistoId],
  );
  const autoLisatieto = useMemo(() => {
    if (!valittuKt) return "";
    const rivit: string[] = [];
    if (kategoria === "Salaojat ja sadevesijärjestelmä") {
      if (valittuKt.kourun_pituus) rivit.push(`Kourujen pituus: ${valittuKt.kourun_pituus} m`);
      if (valittuKt.syoksytorvet) rivit.push(`Syöksytorvia: ${valittuKt.syoksytorvet} kpl`);
    }
    if (kategoria === "Nuohous ja tulisijat") {
      if (valittuKt.hormit) rivit.push(`Hormit: ${valittuKt.hormit}`);
      if (valittuKt.nuohous_pvm) rivit.push(`Edellinen nuohous: ${valittuKt.nuohous_pvm}`);
    }
    if (kategoria === "Katto ja räystäät") {
      if (valittuKt.katto_pinta_ala) rivit.push(`Katon pinta-ala: ${valittuKt.katto_pinta_ala} m²`);
      if (valittuKt.kattomateriaali) rivit.push(`Katon materiaali: ${valittuKt.kattomateriaali}`);
    }
    return rivit.join("\n");
  }, [valittuKt, kategoria]);

  useEffect(() => {
    // Esitäytä lisätieto-kenttä automaattisesti kun kategoria/kiinteistö vaihtuu, jos käyttäjä ei ole vielä koskenut
    if (!open) return;
    setLisatieto((nyk) => (nyk && nyk !== autoLisatieto ? nyk : autoLisatieto));
  }, [autoLisatieto, open]);

  const mut = useMutation({
    mutationFn: (v: any) => luoFn({ data: v }),
    onSuccess: () => {
      toast.success("Pyyntö lähetetty");
      qc.invalidateQueries({ queryKey: ["omat-liidit"] });
      onOpenChange(false);
      // Tyhjennä lomakkeen muuttuvat kentät
      setKuvaus(esitaytetty?.kuvaus ?? "");
      setLisatieto("");
    },
    onError: (e: any) => toast.error(e?.message ?? "Lähetys epäonnistui"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kiinteistoId) {
      toast.error("Valitse kiinteistö");
      return;
    }
    mut.mutate({
      kiinteisto_id: kiinteistoId,
      palvelu,
      kategoria,
      kuvaus: kuvaus.trim() || null,
      nimi: nimi.trim(),
      puhelin: puhelin.trim(),
      sahkoposti: sahkoposti.trim(),
      ajoitus,
      lisatieto: lisatieto.trim() || null,
      pts_kohde: esitaytetty?.pts_kohde ?? null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Tilaa palvelu</DialogTitle>
          <DialogDescription>
            Välitämme pyynnön tarkastetuille ammattilaisille omalla alueellasi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Palvelun tyyppi</Label>
            <RadioGroup value={palvelu} onValueChange={(v) => setPalvelu(v as Palvelu)} className="grid gap-2">
              {LIIDI_PALVELUT.map((p) => (
                <label key={p.arvo} className="flex items-start gap-3 rounded-md border border-border/60 p-3 cursor-pointer hover:border-primary/40">
                  <RadioGroupItem value={p.arvo} className="mt-1" />
                  <span>
                    <span className="block text-cream">{p.nimi}</span>
                    <span className="block text-xs text-muted-foreground">{p.kuvaus}</span>
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Kohde / kategoria</Label>
            <Select
              value={kategoria}
              onValueChange={(v) => setKategoria(v as LiidiKategoria)}
              disabled={!!esitaytetty?.lukitseKategoria}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LIIDI_KATEGORIAT.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lyhyt kuvaus</Label>
            <Textarea value={kuvaus} onChange={(e) => setKuvaus(e.target.value)} rows={2} maxLength={2000} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nimi</Label>
              <Input value={nimi} onChange={(e) => setNimi(e.target.value)} required maxLength={150} />
            </div>
            <div className="space-y-2">
              <Label>Puhelin</Label>
              <Input value={puhelin} onChange={(e) => setPuhelin(e.target.value)} required maxLength={40} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sähköposti</Label>
            <Input type="email" value={sahkoposti} onChange={(e) => setSahkoposti(e.target.value)} required maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label>Kiinteistö</Label>
            <Select value={kiinteistoId} onValueChange={setKiinteistoId}>
              <SelectTrigger><SelectValue placeholder="Valitse kiinteistö" /></SelectTrigger>
              <SelectContent>
                {(data?.kiinteistot ?? []).map((k: any) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nimi || k.osoite || "Kiinteistö"}{k.osoite ? ` – ${k.osoite}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ajoitus</Label>
            <RadioGroup value={ajoitus} onValueChange={(v) => setAjoitus(v as Ajoitus)} className="grid gap-2">
              {LIIDI_AJOITUKSET.map((a) => (
                <label key={a.arvo} className="flex items-center gap-3 rounded-md border border-border/60 p-2 cursor-pointer hover:border-primary/40">
                  <RadioGroupItem value={a.arvo} />
                  <span className="text-sm text-cream">{a.nimi}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Lisätieto ammattilaiselle</Label>
            <Textarea
              value={lisatieto}
              onChange={(e) => setLisatieto(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Esim. kourujen pituus, syöksytorvien määrä, hormien tyyppi..."
            />
            {autoLisatieto && (
              <p className="text-[11px] text-muted-foreground">
                Esitäytetty talon tiedoista – voit muokata vapaasti.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Peruuta</Button>
            <Button type="submit" disabled={mut.isPending} className="uppercase tracking-wider font-semibold">
              {mut.isPending ? "Lähetetään..." : "Lähetä pyyntö"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

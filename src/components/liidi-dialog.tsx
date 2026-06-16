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
  type LiidiKategoria,
} from "@/lib/liidit-kategoriat";
import { rakennaKuvausPohja } from "@/lib/liidi-kuvauspohja";

type Palvelu = "kuntoarvio" | "huolto" | "tarjouspyynto";

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
  const [alkuKategoria, setAlkuKategoria] = useState<LiidiKategoria | null>(esitaytetty?.kategoria ?? null);
  const [kuvaus, setKuvaus] = useState(esitaytetty?.kuvaus ?? "");
  const [talonTiedot, setTalonTiedot] = useState("");
  const [talonTiedotMuokattu, setTalonTiedotMuokattu] = useState(false);
  const [nimi, setNimi] = useState("");
  const [puhelin, setPuhelin] = useState("");
  const [sahkoposti, setSahkoposti] = useState("");
  const [kiinteistoId, setKiinteistoId] = useState<string>("");

  useEffect(() => {
    if (!open || !data) return;
    if (data.profile?.nimi && !nimi) setNimi(data.profile.nimi);
    if (data.profile?.email && !sahkoposti) setSahkoposti(data.profile.email);
    if (data.profile?.puhelin && !puhelin) setPuhelin(data.profile.puhelin);
    if (!kiinteistoId && data.valittu_id) setKiinteistoId(data.valittu_id);
  }, [open, data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    if (esitaytetty?.palvelu) setPalvelu(esitaytetty.palvelu);
    if (esitaytetty?.kategoria) {
      setKategoria(esitaytetty.kategoria);
      setAlkuKategoria(esitaytetty.kategoria);
    } else {
      setAlkuKategoria(null);
    }
    if (esitaytetty?.kuvaus !== undefined) {
      setKuvaus(esitaytetty.kuvaus ?? "");
    }
  }, [open, esitaytetty?.palvelu, esitaytetty?.kategoria, esitaytetty?.kuvaus]);

  // Nollaa talon tietojen muokkauslippu kun dialog suljetaan
  useEffect(() => {
    if (!open) setTalonTiedotMuokattu(false);
  }, [open]);

  const valittuKt: any = useMemo(
    () => data?.kiinteistot?.find((k: any) => k.id === kiinteistoId) ?? null,
    [data, kiinteistoId],
  );

  // Esitäytä talon tiedot -kenttä kategorian + kiinteistön perusteella,
  // jos käyttäjä ei ole muokannut kenttää käsin.
  useEffect(() => {
    if (!open || talonTiedotMuokattu) return;
    const pohja = rakennaKuvausPohja(kategoria, valittuKt?.talon_tiedot ?? null);
    setTalonTiedot(pohja ?? "");
  }, [open, kategoria, valittuKt, talonTiedotMuokattu]);

  const mut = useMutation({
    mutationFn: (v: any) => luoFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["omat-liidit"] });
      qc.invalidateQueries({ queryKey: ["admin-liidit"] });
      qc.invalidateQueries({ queryKey: ["uusien-liidien-maara"] });
      onOpenChange(false);
      toast.custom(
        () => (
          <div
            className="flex items-start gap-3 rounded-lg border px-5 py-4 shadow-lg"
            style={{ backgroundColor: "#0D1F14", borderColor: "#C9A84C", color: "#C9A84C", minWidth: 320 }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>✓</span>
            <div className="space-y-1">
              <div className="font-serif text-base" style={{ color: "#C9A84C" }}>
                Pyyntösi on vastaanotettu.
              </div>
              <div className="text-sm" style={{ color: "#E8D89A" }}>
                Olemme sinuun yhteydessä 1–3 arkipäivän sisällä.
              </div>
            </div>
          </div>
        ),
        { duration: 5000 },
      );
      setKuvaus(esitaytetty?.kuvaus ?? "");
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
            <Label>Kuvaus</Label>
            <Textarea
              value={kuvaus}
              onChange={(e) => { setKuvaus(e.target.value); setKuvausMuokattu(true); }}
              rows={3}
              maxLength={2000}
              placeholder="Kerro lyhyesti mitä haluat (vapaaehtoinen)"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nimi</Label>
              <Input value={nimi} onChange={(e) => setNimi(e.target.value)} required maxLength={150} />
            </div>
            <div className="space-y-2">
              <Label>Puhelinnumero</Label>
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
            {valittuKt && (
              <p className="text-[11px] text-muted-foreground">
                {[valittuKt.osoite, valittuKt.kaupunki].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Lähettämällä pyynnön hyväksyt, että antamasi tiedot välitetään valitulle
            ammattilaiselle yhteydenottoa varten. Lisätietoja:{" "}
            <a href="/tietosuoja" target="_blank" rel="noreferrer" className="text-primary hover:underline">tietosuojaseloste</a>.
          </p>

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

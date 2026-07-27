import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronDown, Home, Plus, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { haeRyhtiTiedot, haeRyhtiKoordinaateilla } from "@/lib/ryhti.functions";
import { OsoiteAutocomplete } from "@/components/osoite-autocomplete";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addKiinteisto,
  listKiinteistot,
  setValittuKiinteisto,
} from "@/lib/kotivahti.functions";

export function PropertySwitcher() {
  const router = useRouter();
  const qc = useQueryClient();
  const lista = useServerFn(listKiinteistot);
  const setValittu = useServerFn(setValittuKiinteisto);
  const lisaa = useServerFn(addKiinteisto);

  const [openDialog, setOpenDialog] = useState(false);
  const [nimi, setNimi] = useState("");
  const [tyyppi, setTyyppi] = useState("omakotitalo");
  const [osoite, setOsoite] = useState("");
  const [kaupunki, setKaupunki] = useState("");
  const [postinumero, setPostinumero] = useState("");
  const [ryhtiTiedot, setRyhtiTiedot] = useState<any>(null);
  const [ryhtiInfo, setRyhtiInfo] = useState(false);
  const ryhtiFn = useServerFn(haeRyhtiTiedot);
  const ryhtiKoordFn = useServerFn(haeRyhtiKoordinaateilla);

  const ryhtiHaku = useMutation({
    mutationFn: async () =>
      ryhtiFn({ data: { osoite: osoite.trim(), kaupunki: kaupunki.trim() || null } }),
    onSuccess: (res: any) => {
      if (!res?.ok) {
        if (res?.koodi === "TIMEOUT" || res?.koodi === "UPSTREAM_ERROR") {
          toast.error("Ryhti-palvelu ei vastaa juuri nyt. Yritä hetken kuluttua uudelleen tai täytä tiedot käsin.");
        } else {
          toast.error("Rakennusta ei löydy tällä osoitteella. Voit täyttää tiedot käsin.");
        }
        return;
      }
      setRyhtiTiedot(res.tiedot);
      toast.success("✓ Talon tiedot haettu Ryhti-rajapinnasta.");
    },
    onError: (e: any) => toast.error(e?.message ?? "Haku epäonnistui"),
  });

  const ryhtiKoordinaattiHaku = useMutation({
    mutationFn: (v: { lat: number; lon: number; rakennusAvain?: string | null }) => ryhtiKoordFn({ data: v }),
    onSuccess: (res: any) => {
      if (!res?.ok) {
        toast.info("Osoite valittu. Talon virallisia tietoja ei löytynyt – täytä loput käsin.");
        return;
      }
      setRyhtiTiedot(res.tiedot);
      toast.success("✓ Talon tiedot haettu Ryhti-rajapinnasta.");
    },
    onError: (e: any) => toast.error(e?.message ?? "Haku epäonnistui"),
  });

  const ryhtiYhteenveto = ryhtiTiedot
    ? [
        ryhtiTiedot.rakennusvuosi ? `rakennusvuosi ${ryhtiTiedot.rakennusvuosi}` : null,
        ryhtiTiedot.pinta_ala ? `${ryhtiTiedot.pinta_ala} m²` : null,
        ryhtiTiedot.kerroksia ? `${ryhtiTiedot.kerroksia} krs` : null,
        ryhtiTiedot.lammitysmuoto,
        ryhtiTiedot.julkisivumateriaali,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";


  const { data } = useQuery({
    queryKey: ["kiinteistot"],
    queryFn: () => lista(),
  });

  const vaihdaMut = useMutation({
    mutationFn: (id: string) => setValittu({ data: { id } }),
    onSuccess: async () => {
      await qc.invalidateQueries();
      router.invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Vaihto epäonnistui"),
  });

  const lisaaMut = useMutation({
    mutationFn: () =>
      lisaa({
        data: {
          nimi: nimi.trim(),
          tyyppi,
          osoite: osoite.trim() || null,
          kaupunki: kaupunki.trim() || null,
          postinumero: postinumero.trim() || null,
          rakennusvuosi: ryhtiTiedot?.rakennusvuosi ?? null,
          pinta_ala: ryhtiTiedot?.pinta_ala ?? null,
          kerroksia: ryhtiTiedot?.kerroksia ?? null,
          lammitysmuoto: ryhtiTiedot?.lammitysmuoto ?? null,
          julkisivumateriaali: ryhtiTiedot?.julkisivumateriaali ?? null,
        },
      }),
    onSuccess: async () => {
      toast.success("Kiinteistö lisätty");
      setOpenDialog(false);
      setNimi("");
      setOsoite("");
      setKaupunki("");
      setPostinumero("");
      setRyhtiTiedot(null);
      await qc.invalidateQueries();
      router.invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Lisäys epäonnistui"),
  });


  const kiinteistot = data?.kiinteistot ?? [];
  const valittuId = data?.valittuId ?? null;
  const valittu = kiinteistot.find((k: any) => k.id === valittuId) ?? kiinteistot[0];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-9 gap-2 text-cream hover:bg-secondary/60"
          >
            <Home className="h-4 w-4 text-primary" />
            <span className="max-w-[160px] truncate font-medium">
              {valittu?.nimi ?? "Ei kiinteistöä"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="eyebrow">Kiinteistöt</DropdownMenuLabel>
          {kiinteistot.map((k: any) => (
            <DropdownMenuItem
              key={k.id}
              onClick={() => k.id !== valittuId && vaihdaMut.mutate(k.id)}
              className="flex items-start gap-2"
            >
              <Check
                className={`mt-0.5 h-4 w-4 ${k.id === valittuId ? "opacity-100 text-primary" : "opacity-0"}`}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{k.nimi}</span>
                {k.osoite && (
                  <span className="text-xs text-muted-foreground">
                    {k.osoite}
                    {k.kaupunki ? `, ${k.kaupunki}` : ""}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Lisää kiinteistö
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lisää kiinteistö</DialogTitle>
            <DialogDescription>
              Esim. mökki tai toinen koti. Voit vaihtaa aktiivista kiinteistöä yläpalkista.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ks-nimi">Nimi</Label>
              <Input
                id="ks-nimi"
                value={nimi}
                onChange={(e) => setNimi(e.target.value)}
                placeholder="Esim. Mökki, Saimaa"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ks-tyyppi">Tyyppi</Label>
              <Select value={tyyppi} onValueChange={setTyyppi}>
                <SelectTrigger id="ks-tyyppi">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omakotitalo">Omakotitalo</SelectItem>
                  <SelectItem value="paritalo">Paritalo</SelectItem>
                  <SelectItem value="rivitalo">Rivitalo</SelectItem>
                  <SelectItem value="mokki">Mökki / vapaa-ajan asunto</SelectItem>
                  <SelectItem value="muu">Muu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ks-osoite">Osoite</Label>
                <OsoiteAutocomplete
                  id="ks-osoite"
                  arvo={osoite}
                  onChangeTeksti={(v: string) => {
                    setOsoite(v);
                    setRyhtiTiedot(null);
                  }}
                  onValitse={(val: { katuosoite: string; postinumero: string | null; kaupunki: string | null; lat: number; lon: number; rakennusAvain?: string | null }) => {
                    setOsoite(val.katuosoite);
                    if (val.kaupunki) setKaupunki(val.kaupunki);
                    if (val.postinumero) setPostinumero(val.postinumero);
                    setRyhtiTiedot(null);
                    ryhtiKoordinaattiHaku.mutate({ lat: val.lat, lon: val.lon, rakennusAvain: val.rakennusAvain ?? null });
                  }}

                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ks-kaupunki">Kaupunki</Label>
                <Input
                  id="ks-kaupunki"
                  value={kaupunki}
                  onChange={(e) => {
                    setKaupunki(e.target.value);
                    setRyhtiTiedot(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ks-postinumero">Postinumero</Label>
              <Input
                id="ks-postinumero"
                value={postinumero}
                onChange={(e) => setPostinumero(e.target.value)}
                placeholder="00100"
              />
            </div>

            {(ryhtiHaku.isPending || ryhtiKoordinaattiHaku.isPending) && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Haetaan talon tietoja…
              </p>
            )}
            {ryhtiTiedot && ryhtiYhteenveto && (
              <p className="text-xs font-medium text-emerald-600">
                ✓ Talon tiedot haettu: {ryhtiYhteenveto}. Voit muokata niitä Talon tiedot -sivulla.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenDialog(false)}>
              Peruuta
            </Button>
            <Button
              onClick={() => lisaaMut.mutate()}
              disabled={!nimi.trim() || lisaaMut.isPending}
            >
              {lisaaMut.isPending ? "Lisätään…" : "Lisää"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

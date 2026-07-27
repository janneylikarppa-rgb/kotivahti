import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { haeOsoiteEhdotukset } from "@/lib/ryhti.functions";

export type OsoiteValinta = {
  katuosoite: string;
  postinumero: string | null;
  kaupunki: string | null;
  lat: number;
  lon: number;
  rakennusAvain?: string | null;
};


type Props = {
  arvo: string;
  onChangeTeksti: (arvo: string) => void;
  onValitse: (valinta: OsoiteValinta) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
};

export function OsoiteAutocomplete({
  arvo,
  onChangeTeksti,
  onValitse,
  disabled,
  id,
  placeholder,
}: Props) {
  const ehdotusFn = useServerFn(haeOsoiteEhdotukset);
  const [haku, setHaku] = useState("");
  const [avoin, setAvoin] = useState(false);
  const [korostus, setKorostus] = useState(0);
  const valittuJustNyt = useRef(false);
  const sulkuAjastin = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce
  useEffect(() => {
    if (valittuJustNyt.current) {
      valittuJustNyt.current = false;
      setHaku("");
      return;
    }
    const t = setTimeout(() => setHaku(arvo.trim()), 400);
    return () => clearTimeout(t);
  }, [arvo]);

  useEffect(() => () => {
    if (sulkuAjastin.current) clearTimeout(sulkuAjastin.current);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["osoite-ehdotukset", haku],
    queryFn: () => ehdotusFn({ data: { teksti: haku } }),
    enabled: haku.length >= 3,
    staleTime: 5 * 60_000,
  });

  const ehdotukset = (data as any)?.ok ? ((data as any).ehdotukset as OsoiteValinta[] & { id: string; label: string }[]) : [];
  const naytaLista = avoin && haku.length >= 3;

  const valitse = (e: any) => {
    valittuJustNyt.current = true;
    setAvoin(false);
    onValitse({
      katuosoite: e.katuosoite,
      postinumero: e.postinumero ?? null,
      kaupunki: e.kaupunki ?? null,
      lat: e.lat,
      lon: e.lon,
    });
  };

  return (
    <div className="relative">
      <Input
        id={id}
        value={arvo}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(ev) => {
          onChangeTeksti(ev.target.value);
          setAvoin(true);
          setKorostus(0);
        }}
        onFocus={() => setAvoin(true)}
        onBlur={() => {
          sulkuAjastin.current = setTimeout(() => setAvoin(false), 150);
        }}
        onKeyDown={(ev) => {
          if (!naytaLista || ehdotukset.length === 0) return;
          if (ev.key === "ArrowDown") {
            ev.preventDefault();
            setKorostus((i) => (i + 1) % ehdotukset.length);
          } else if (ev.key === "ArrowUp") {
            ev.preventDefault();
            setKorostus((i) => (i - 1 + ehdotukset.length) % ehdotukset.length);
          } else if (ev.key === "Enter") {
            ev.preventDefault();
            valitse(ehdotukset[korostus]);
          } else if (ev.key === "Escape") {
            setAvoin(false);
          }
        }}
      />
      {naytaLista && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-xl border border-primary/20 bg-popover p-1 shadow-2xl">
          {isFetching && ehdotukset.length === 0 && (
            <p className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Haetaan osoitteita…
            </p>
          )}
          {!isFetching && ehdotukset.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Ei ehdotuksia – täytä tiedot käsin
            </p>
          )}
          {ehdotukset.map((e: any, i: number) => (
            <button
              key={e.id}
              type="button"
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => valitse(e)}
              onMouseEnter={() => setKorostus(i)}
              className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                i === korostus ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                <span className="font-medium">{e.katuosoite}</span>
                {(e.postinumero || e.kaupunki) && (
                  <span className="block text-xs text-muted-foreground">
                    {[e.postinumero, e.kaupunki].filter(Boolean).join(" ")}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

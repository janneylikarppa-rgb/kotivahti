import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tilaa aktiivisen kiinteistön huolto_historia / kulut / pts_suunnitelma
 * -taulujen muutokset ja invalidoi vastaavat TanStack Query -avaimet.
 * Päivittää näkymät reaaliajassa ilman sivun latausta.
 */
export function useRealtimeSync(kiinteistoId: string | null | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!kiinteistoId) return;
    const filter = `kiinteisto_id=eq.${kiinteistoId}`;
    const channel = supabase
      .channel(`kotiluotsi-${kiinteistoId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "huolto_historia", filter }, () => {
        qc.invalidateQueries({ queryKey: ["huollot"] });
        qc.invalidateQueries({ queryKey: ["pts"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        qc.invalidateQueries({ queryKey: ["kuitatut"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "kulut", filter }, () => {
        qc.invalidateQueries({ queryKey: ["kulut"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "pts_suunnitelma", filter }, () => {
        qc.invalidateQueries({ queryKey: ["pts"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [kiinteistoId, qc]);
}

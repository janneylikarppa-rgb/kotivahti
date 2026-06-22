import { createFileRoute } from "@tanstack/react-router";

const ARKIPV_MS = 24 * 60 * 60 * 1000;

export const Route = createFileRoute("/api/public/hooks/ydinprosessi-eskalointi")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { lahetaEmail } = await import("@/lib/email.server");
        const ownerEmail = process.env.OWNER_EMAIL;
        if (!ownerEmail) {
          return Response.json({ ok: false, error: "OWNER_EMAIL puuttuu" }, { status: 200 });
        }

        // Vaiheen 1 vastaukset joissa "ei vielä" / "ei ollenkaan", vastattu yli 2 pv sitten
        const raja = new Date(Date.now() - 2 * ARKIPV_MS).toISOString();
        const { data: kyselyt } = await supabaseAdmin
          .from("palaute_kyselyt")
          .select("id, trigger_id, vastaukset, vastattu_at")
          .eq("tyyppi", "ydinprosessi_yhteydenotto")
          .not("vastattu_at", "is", null)
          .lt("vastattu_at", raja);

        let lahetetty = 0;
        for (const k of kyselyt ?? []) {
          const ans = String((k.vastaukset as any)?.yhteydenotto ?? "");
          if (ans !== "ei_ollenkaan" && ans !== "ei_viela") continue;
          if ((k.vastaukset as any)?.halytys_lahetetty_at) continue;
          if (!k.trigger_id) continue;

          const { data: l } = await supabaseAdmin
            .from("liidit")
            .select("nimi, puhelin, sahkoposti, kategoria, palvelu, kaupunki, ammattilainen_id, lahetetty_at, created_at")
            .eq("id", k.trigger_id).maybeSingle();
          if (!l) continue;

          const { data: amm } = l.ammattilainen_id
            ? await supabaseAdmin.from("ammattilaiset").select("yritys, sahkoposti, puhelin").eq("id", l.ammattilainen_id).maybeSingle()
            : { data: null as any };

          const paivia = Math.floor((Date.now() - new Date(l.lahetetty_at ?? l.created_at).getTime()) / ARKIPV_MS);
          const subject = `⚠️ KIIREELLINEN – Ammattilainen ei reagoinut – ${l.kategoria} – ${l.kaupunki ?? "—"}`;
          const html = `
            <h2>${subject}</h2>
            <p>Asiakas vastasi vaiheen 1 kyselyyn: "${ans === "ei_ollenkaan" ? "Ei ollenkaan" : "Ei vielä"}"</p>
            <p><strong>Asiakas:</strong> ${l.nimi} – ${l.puhelin} – ${l.sahkoposti}</p>
            <p><strong>Palvelu:</strong> ${l.palvelu} (${l.kategoria})</p>
            <p><strong>Kaupunki:</strong> ${l.kaupunki ?? "—"}</p>
            <p><strong>Ammattilainen:</strong> ${amm?.yritys ?? "—"}${amm?.sahkoposti ? ` (${amm.sahkoposti})` : ""}${amm?.puhelin ? `, ${amm.puhelin}` : ""}</p>
            <p><strong>Liidistä kulunut:</strong> ${paivia} päivää</p>
          `;
          const r = await lahetaEmail({ to: ownerEmail, subject, html });
          if (r.ok) {
            lahetetty++;
            await supabaseAdmin
              .from("palaute_kyselyt")
              .update({ vastaukset: { ...(k.vastaukset as any), halytys_lahetetty_at: new Date().toISOString() } })
              .eq("id", k.id);
          }
        }

        return Response.json({ ok: true, lahetetty, tarkistettu: kyselyt?.length ?? 0 });
      },
    },
  },
});

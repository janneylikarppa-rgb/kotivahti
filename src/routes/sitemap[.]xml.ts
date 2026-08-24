import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://kotiluotsi.fi";

const POLUT = [
  "/",
  "/ukk",
  "/opas",
  "/opas/nuohous-hinta",
  "/opas/iv-puhdistus",
  "/opas/katon-tarkastus",
  "/blogi/sahkoinen-talokirja",
  "/kayttoehdot",
  "/tietosuoja",
  "/login",
  "/rekisteroidy",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const nyt = new Date().toISOString().slice(0, 10);
        const urls = POLUT.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${nyt}</lastmod></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});

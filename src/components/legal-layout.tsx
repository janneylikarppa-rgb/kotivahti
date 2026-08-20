import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-serif">K</div>
            <span className="font-serif text-lg text-cream">Kotiluotsi<span className="text-primary">.</span></span>
          </Link>
          <nav className="flex gap-4 text-xs uppercase tracking-wider text-muted-foreground">
            <Link to="/kayttoehdot" className="hover:text-primary">Käyttöehdot</Link>
            <Link to="/tietosuoja" className="hover:text-primary">Tietosuoja</Link>
            <Link to="/login" className="hover:text-primary">Kirjaudu</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="eyebrow mb-3">Lakitekstit</p>
        <h1 className="font-serif text-4xl text-cream mb-2">{title}</h1>
        <p className="text-xs text-muted-foreground mb-10">Päivitetty: {updated}</p>
        <article className="prose prose-invert max-w-none text-cream/90 leading-relaxed space-y-6 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-cream [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-cream [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm [&_p]:text-cream/80 [&_ul]:text-sm [&_ul]:text-cream/80 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline">
          {children}
        </article>
        <div className="mt-16 pt-6 border-t border-border/60 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Takaisin etusivulle</Link>
        </div>
      </main>
    </div>
  );
}

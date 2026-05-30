import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/rekisteroidy")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [nimi, setNimi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Salasanan tulee olla vähintään 6 merkkiä"); return; }
    if (!accepted) { toast.error("Hyväksy käyttöehdot ja tietosuojaseloste"); return; }
    setLoading(true);
    const now = new Date().toISOString();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nimi,
          tos_accepted_at: now,
          privacy_accepted_at: now,
          tos_version: "2026-05",
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSentTo(email);
  };

  const handleGoogle = async () => {
    if (!accepted) { toast.error("Hyväksy käyttöehdot ja tietosuojaseloste ennen jatkamista"); return; }
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error(result.error.message ?? "Rekisteröinti epäonnistui"); return; }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  if (sentTo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <Link to="/login" className="inline-flex items-center gap-2 mb-8">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-serif">K</div>
            <span className="font-serif text-lg text-cream">Kotivahti<span className="text-primary">.</span></span>
          </Link>
          <p className="eyebrow mb-3">Vahvista sähköposti</p>
          <h1 className="font-serif text-3xl text-cream mb-4">Tarkista sähköpostisi</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Lähetimme vahvistuslinkin osoitteeseen <span className="text-cream">{sentTo}</span>.
            Klikkaa linkki, niin pääset kirjautumaan sisään. Tarkista myös roskaposti.
          </p>
          <Link to="/login" className="inline-flex">
            <Button variant="outline">Takaisin kirjautumiseen</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 mb-8">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-serif">K</div>
          <span className="font-serif text-lg text-cream">Kotivahti<span className="text-primary">.</span></span>
        </Link>
        <p className="eyebrow mb-3">Luo tili</p>
        <h1 className="font-serif text-3xl text-cream mb-2">
          Aloita talosi <em className="text-primary not-italic italic">huoltokirja</em>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Onko sinulla jo tili?{" "}
          <Link to="/login" className="text-primary hover:underline">Kirjaudu sisään</Link>
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nimi">Nimi</Label>
            <Input id="nimi" required value={nimi} onChange={(e) => setNimi(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Sähköposti</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Salasana</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="flex items-start gap-3 rounded-md border border-border/60 p-3">
            <Checkbox
              id="accept"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="accept" className="text-xs text-muted-foreground leading-relaxed cursor-pointer font-normal">
              Hyväksyn{" "}
              <Link to="/kayttoehdot" target="_blank" className="text-primary hover:underline">käyttöehdot</Link>
              {" "}ja{" "}
              <Link to="/tietosuoja" target="_blank" className="text-primary hover:underline">tietosuojaselosteen</Link>.
            </Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full uppercase tracking-wider font-semibold">
            {loading ? "Luodaan..." : "Luo tili"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-background px-3 text-muted-foreground">tai</span>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={handleGoogle} className="w-full">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.46-1.71 4.28-5.27 4.28-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.83 3.93 14.7 3 12.17 3 6.96 3 2.75 7.21 2.75 12.45S6.96 21.9 12.17 21.9c7.02 0 9.34-4.93 9.34-7.46 0-.5-.05-.88-.16-1.34Z"/></svg>
          Jatka Googlella
        </Button>
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          Jatkamalla hyväksyt <Link to="/kayttoehdot" className="hover:text-primary underline-offset-4 hover:underline">käyttöehdot</Link> ja <Link to="/tietosuoja" className="hover:text-primary underline-offset-4 hover:underline">tietosuojaselosteen</Link>.
        </p>
      </div>
    </div>
  );
}

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Calculator, Menu, X } from "lucide-react";
import { getReadySession } from "@/lib/auth-session";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const session = await getReadySession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: LandingPage,
});

const STYLES = `
:root {
  --vihrea: #1e3a2f;
  --vihrea-dark: #152a22;
  --kulta: #c8973a;
  --kulta-light: #e4b96a;
  --kerma: #f5f0e8;
  --kerma-dark: #ece5d6;
  --teksti: #1a1a1a;
  --harmaa: #6b6b6b;
  --valkoinen: #ffffff;
}
html { scroll-behavior: smooth; }
.kv-page * { margin: 0; padding: 0; box-sizing: border-box; }
.kv-page { font-family: 'DM Sans', sans-serif; background: var(--kerma); color: var(--teksti); overflow-x: hidden; min-height: 100vh; }

.kv-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 3rem; background: rgba(245,240,232,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(200,151,58,0.15); }
.nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--vihrea); letter-spacing: -0.5px; }
.nav-logo span { color: var(--kulta); }
.nav-links { display: flex; align-items: center; gap: 2rem; }
.nav-links a { text-decoration: none; color: var(--harmaa); font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
.nav-links a:hover { color: var(--vihrea); }
.nav-cta { background: var(--kulta); color: var(--valkoinen) !important; padding: 0.55rem 1.4rem; border-radius: 6px; font-weight: 600 !important; font-size: 0.88rem !important; letter-spacing: 0.02em; transition: background 0.2s !important; }
.nav-cta:hover { background: #b8842e !important; color: #fff !important; }
.nav-toggle { display: none; align-items: center; justify-content: center; width: 44px; height: 44px; margin-left: 0.5rem; border: 1px solid rgba(200,151,58,0.3); border-radius: 8px; background: transparent; color: var(--vihrea); cursor: pointer; }
.nav-mobile { display: none; }


.hero { min-height: 100vh; background: var(--vihrea-dark); display: flex; align-items: center; position: relative; overflow: hidden; padding: 7rem 3rem 5rem; }
.hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(200,151,58,0.08) 0%, transparent 70%); }
.hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; position: relative; }
.hero-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(200,151,58,0.15); border: 1px solid rgba(200,151,58,0.3); color: var(--kulta-light); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.4rem 1rem; border-radius: 20px; margin-bottom: 1.8rem; animation: fadeUp 0.6s ease both; }
.hero-badge::before { content: '✦'; font-size: 0.6rem; }
.hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 5vw, 4.2rem); line-height: 1.1; color: var(--valkoinen); margin-bottom: 0.5rem; animation: fadeUp 0.6s 0.1s ease both; }
.hero h1 em { font-style: italic; color: var(--kulta); display: block; }
.hero-sub { font-size: 1.05rem; line-height: 1.7; color: rgba(255,255,255,0.65); margin: 1.5rem 0 2.5rem; animation: fadeUp 0.6s 0.2s ease both; }
.hero-actions { display: flex; flex-direction: column; gap: 1rem; animation: fadeUp 0.6s 0.3s ease both; }
.btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--kulta); color: var(--valkoinen); padding: 1rem 2.2rem; border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.01em; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 20px rgba(200,151,58,0.35); width: fit-content; }
.btn-primary:hover { background: #b8842e; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(200,151,58,0.45); color: var(--valkoinen); }
.hero-trust { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.trust-item { display: flex; align-items: center; gap: 0.4rem; color: rgba(255,255,255,0.55); font-size: 0.82rem; }
.trust-item span { color: var(--kulta-light); }

.hero-visual { animation: fadeUp 0.7s 0.2s ease both; }
.mock-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px); }
.mock-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.mock-title { font-family: 'Playfair Display', serif; color: var(--valkoinen); font-size: 1rem; }
.mock-address { color: rgba(255,255,255,0.45); font-size: 0.8rem; margin-bottom: 1.5rem; }
.mock-tasks { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
.mock-task { display: flex; align-items: center; gap: 0.7rem; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.65rem 0.9rem; font-size: 0.83rem; color: rgba(255,255,255,0.7); }
.mock-task.done { opacity: 0.5; text-decoration: line-through; }
.check-done { color: #4ade80; font-size: 1rem; }
.check-todo { width: 16px; height: 16px; border: 1.5px solid rgba(255,255,255,0.25); border-radius: 50%; flex-shrink: 0; }
.mock-costs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-bottom: 1.2rem; }
.mock-cost { background: rgba(255,255,255,0.06); border-radius: 8px; padding: 0.7rem; text-align: center; }
.mock-cost-val { color: var(--valkoinen); font-size: 0.95rem; font-weight: 600; }
.mock-cost-label { color: rgba(255,255,255,0.4); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.15rem; }
.mock-pts { background: rgba(200,151,58,0.12); border: 1px solid rgba(200,151,58,0.25); border-radius: 10px; padding: 0.9rem; }
.mock-pts-label { color: var(--kulta-light); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem; }
.mock-pts-title { color: var(--valkoinen); font-size: 0.9rem; font-weight: 500; }
.mock-pts-sub { color: rgba(255,255,255,0.45); font-size: 0.75rem; margin-top: 0.2rem; }
.mock-pts-btns { margin-top: 0.8rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.mock-pts-btn { background: var(--kulta); color: #fff; border: none; border-radius: 6px; padding: 0.45rem 1rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.mock-pts-btn-ghost { background: transparent; color: var(--kulta-light); border: 1px solid rgba(200,151,58,0.45); border-radius: 6px; padding: 0.45rem 1rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.features-strip { background: var(--kerma-dark); padding: 1.2rem 3rem; border-bottom: 1px solid rgba(0,0,0,0.07); }
.features-strip-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.strip-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.83rem; color: var(--harmaa); }
.strip-item strong { color: var(--vihrea); }
.strip-dot { color: var(--kulta); font-size: 1.2rem; line-height: 1; }

.section-label { display: flex; align-items: center; gap: 0.8rem; color: var(--kulta); font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; margin-bottom: 1rem; }
.section-label::before, .section-label::after { content: ''; flex: 0 0 2rem; height: 1px; background: var(--kulta); opacity: 0.4; }
.section-h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3.5vw, 3rem); line-height: 1.15; color: var(--vihrea); margin-bottom: 1rem; }
.section-h2 em { font-style: italic; color: var(--kulta); }
.section-lead { font-size: 1rem; color: var(--harmaa); line-height: 1.7; max-width: 520px; }

.features { padding: 6rem 3rem; background: var(--kerma); }
.features-inner { max-width: 1200px; margin: 0 auto; }
.features-head { text-align: center; margin-bottom: 4rem; }
.features-head .section-label { justify-content: center; }
.features-head .section-lead { margin: 0 auto; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.feat-card { background: var(--valkoinen); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 1.8rem; transition: all 0.25s; position: relative; overflow: hidden; }
.feat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--kulta); opacity: 0; transition: opacity 0.25s; }
.feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
.feat-card:hover::before { opacity: 1; }
.feat-icon { font-size: 1.8rem; margin-bottom: 1rem; }
.feat-title { font-size: 1.05rem; font-weight: 600; color: var(--vihrea); margin-bottom: 0.5rem; }
.feat-desc { font-size: 0.875rem; color: var(--harmaa); line-height: 1.6; }
.feat-card.highlight { background: var(--vihrea); border-color: var(--vihrea); }
.feat-card.highlight::before { opacity: 1; }
.feat-card.highlight .feat-title { color: var(--valkoinen); }
.feat-card.highlight .feat-desc { color: rgba(255,255,255,0.65); }
.feat-card.highlight .feat-tag { display: inline-block; background: rgba(200,151,58,0.25); color: var(--kulta-light); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 0.7rem; }

.kilpailutus { padding: 6rem 3rem; background: var(--vihrea-dark); position: relative; overflow: hidden; }
.kilpailutus::before { content: ''; position: absolute; top: -30%; right: -10%; width: 50%; height: 130%; background: radial-gradient(ellipse, rgba(200,151,58,0.07) 0%, transparent 70%); }
.kilpailutus-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; position: relative; }
.kilpailutus .section-h2 { color: var(--valkoinen); }
.kilpailutus .section-lead { color: rgba(255,255,255,0.6); }
.kil-steps { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
.kil-step { display: flex; gap: 1.2rem; align-items: flex-start; }
.kil-num { flex-shrink: 0; width: 36px; height: 36px; background: rgba(200,151,58,0.2); border: 1px solid rgba(200,151,58,0.35); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--kulta-light); font-size: 0.8rem; font-weight: 700; }
.kil-step-title { color: var(--valkoinen); font-weight: 600; font-size: 0.95rem; margin-bottom: 0.2rem; }
.kil-step-desc { color: rgba(255,255,255,0.5); font-size: 0.83rem; line-height: 1.5; }

.kil-mock { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; }
.kil-mock-title { font-family: 'Playfair Display', serif; color: var(--valkoinen); font-size: 1.1rem; margin-bottom: 0.4rem; }
.kil-mock-sub { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-bottom: 1.5rem; }
.kil-cats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.5rem; }
.kil-cat { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem 0.9rem; color: rgba(255,255,255,0.65); font-size: 0.82rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
.kil-cat.active { background: rgba(200,151,58,0.2); border-color: rgba(200,151,58,0.5); color: var(--kulta-light); }
.kil-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.2rem 0; }
.kil-result { background: rgba(200,151,58,0.1); border: 1px solid rgba(200,151,58,0.25); border-radius: 10px; padding: 1rem; }
.kil-result-label { color: var(--kulta-light); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; }
.kil-offers { display: flex; flex-direction: column; gap: 0.5rem; }
.kil-offer { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 0.6rem 0.8rem; }
.kil-offer-name { color: rgba(255,255,255,0.7); font-size: 0.82rem; }
.kil-offer-price { color: var(--valkoinen); font-size: 0.88rem; font-weight: 600; }
.kil-offer-stars { color: var(--kulta); font-size: 0.7rem; }

.proof { padding: 5rem 3rem; background: var(--kerma-dark); }
.proof-inner { max-width: 1200px; margin: 0 auto; }
.proof-head { text-align: center; margin-bottom: 3.5rem; }
.proof-head .section-label { justify-content: center; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 0; }
.stat-box { background: var(--valkoinen); border-radius: 12px; padding: 2rem 1.5rem; text-align: center; border: 1px solid rgba(0,0,0,0.06); }
.stat-val { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: var(--vihrea); font-weight: 700; line-height: 1; margin-bottom: 0.4rem; }
.stat-val span { color: var(--kulta); }
.stat-label { font-size: 0.82rem; color: var(--harmaa); }

.cta-section { padding: 7rem 3rem; background: var(--vihrea); text-align: center; position: relative; overflow: hidden; }
.cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,151,58,0.1) 0%, transparent 70%); }
.cta-section-inner { max-width: 700px; margin: 0 auto; position: relative; }
.cta-section .section-label { justify-content: center; margin-bottom: 1.5rem; }
.cta-section h2 { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 4vw, 3.5rem); color: var(--valkoinen); line-height: 1.1; margin-bottom: 1rem; }
.cta-section h2 em { color: var(--kulta); font-style: italic; }
.cta-section p { color: rgba(255,255,255,0.6); font-size: 1rem; margin-bottom: 2.5rem; line-height: 1.6; }
.cta-checks { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
.cta-check { display: flex; align-items: center; gap: 0.4rem; color: rgba(255,255,255,0.7); font-size: 0.85rem; }
.cta-check::before { content: '✓'; color: var(--kulta-light); font-weight: 700; }

.kv-footer { background: var(--vihrea-dark); padding: 2rem 3rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.06); }
.kv-footer span { color: var(--kulta); opacity: 0.7; }

.showcase { padding: 5rem 3rem 2rem; background: var(--kerma); scroll-margin-top: 80px; }
.showcase-inner { max-width: 1150px; margin: 0 auto; }
.sc-row { display: grid; grid-template-columns: 1fr 360px; gap: 4rem; align-items: center; padding: 4rem 0; border-top: 1px solid rgba(200,151,58,0.22); }
.sc-row:first-child { border-top: none; padding-top: 1rem; }
.sc-row.reverse { grid-template-columns: 360px 1fr; }
.sc-row.reverse .sc-text { order: 2; }
.sc-row.reverse .sc-visual { order: 1; }
.sc-visual { display: flex; justify-content: center; }
.sc-icon { font-size: 1.6rem; margin-bottom: 0.8rem; }
.sc-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--vihrea); line-height: 1.2; margin-bottom: 1.2rem; }
.sc-p { color: var(--harmaa); font-size: 0.98rem; line-height: 1.75; margin-bottom: 1rem; }
.sc-btn { display: inline-block; background: var(--kulta); color: #fff; text-decoration: none; font-weight: 600; font-size: 0.92rem; padding: 0.85rem 1.8rem; border-radius: 8px; margin-top: 0.6rem; transition: background 0.2s; }
.sc-btn:hover { background: #b8842e; }
.sc-note { color: var(--harmaa); font-size: 0.8rem; line-height: 1.5; margin-top: 0.8rem; opacity: 0.85; }
.sc-fact { max-width: 320px; margin-top: 1.2rem; padding: 1rem; background: rgba(30,58,47,0.06); border: 1px solid rgba(200,151,58,0.22); border-radius: 10px; color: var(--harmaa); font-size: 0.82rem; line-height: 1.55; }

.phone { width: 320px; max-width: 100%; background: var(--vihrea-dark); border: 1px solid rgba(200,151,58,0.25); border-radius: 34px; padding: 12px; box-shadow: 0 26px 50px -22px rgba(21,42,34,0.55); }
.phone-screen { background: #16261f; border-radius: 24px; padding: 1.1rem 1rem 1.3rem; min-height: 400px; }
.phone-notch { width: 84px; height: 5px; background: rgba(255,255,255,0.16); border-radius: 3px; margin: 0 auto 0.9rem; }
.ph-title { font-family: 'Playfair Display', serif; color: var(--valkoinen); font-size: 1rem; margin-bottom: 0.2rem; }
.ph-sub { color: rgba(255,255,255,0.4); font-size: 0.72rem; margin-bottom: 1rem; }
.ph-chip { display: inline-block; background: rgba(200,151,58,0.2); border: 1px solid rgba(200,151,58,0.4); color: var(--kulta-light); font-size: 0.65rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.2rem 0.55rem; border-radius: 5px; margin-bottom: 0.9rem; }
.ph-chip-group { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.9rem; }
.ph-chip-group .ph-chip { margin-bottom: 0; }
.ph-chip-active { background: rgba(200,151,58,0.55); border-color: rgba(200,151,58,0.85); color: var(--valkoinen); }
.ph-rows { display: flex; flex-direction: column; gap: 0.5rem; }
.ph-row { display: flex; justify-content: space-between; align-items: center; gap: 0.6rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; padding: 0.55rem 0.7rem; font-size: 0.74rem; }
.ph-row .k { color: rgba(255,255,255,0.5); }
.ph-row .v { color: var(--valkoinen); font-weight: 600; text-align: right; }
.ph-btn { margin-top: 1rem; background: rgba(200,151,58,0.9); color: #fff; text-align: center; font-size: 0.76rem; font-weight: 600; padding: 0.6rem; border-radius: 8px; }
.ph-ktv { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0.5rem 0 1rem; }
.ph-ktv-amount { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: var(--kulta-light); line-height: 1; margin-bottom: 0.3rem; }
.ph-ktv-label { color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-bottom: 1rem; }
.ph-ktv-bar { width: 100%; height: 10px; background: rgba(255,255,255,0.08); border-radius: 5px; overflow: hidden; margin-bottom: 0.6rem; }
.ph-ktv-fill { height: 100%; background: linear-gradient(90deg, var(--kulta), var(--kulta-light)); border-radius: 5px; }
.ph-ktv-meta { color: rgba(255,255,255,0.4); font-size: 0.7rem; margin-bottom: 1rem; }

.sc-final { padding: 6.5rem 3rem; background: var(--vihrea-dark); text-align: center; position: relative; overflow: hidden; }
.sc-final::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,151,58,0.1) 0%, transparent 70%); }
.sc-final-inner { max-width: 700px; margin: 0 auto; position: relative; }
.sc-final h2 { font-family: 'Playfair Display', serif; font-size: clamp(2.1rem, 4vw, 3.2rem); color: var(--valkoinen); line-height: 1.15; margin-bottom: 1.2rem; }
.sc-final p { color: rgba(255,255,255,0.6); font-size: 1rem; line-height: 1.7; margin-bottom: 2.2rem; }
.sc-final .sc-btn { font-size: 1.05rem; padding: 1.05rem 2.6rem; }
.sc-final-small { color: rgba(255,255,255,0.4); font-size: 0.82rem; margin-top: 1.2rem; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
.animate-on-scroll { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
.animate-on-scroll.visible { opacity: 1; transform: translateY(0); }

@media (max-width: 900px) {
  .kv-nav { padding: 1rem 1.5rem; }
  .hero-inner, .kilpailutus-inner { grid-template-columns: 1fr; gap: 3rem; }
  .hero { padding: 6rem 1.5rem 4rem; }
  .features { padding: 4rem 1.5rem; }
  .features-grid { grid-template-columns: 1fr 1fr; }
  .kilpailutus { padding: 4rem 1.5rem; }
  .proof { padding: 4rem 1.5rem; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .cta-section { padding: 5rem 1.5rem; }
  .features-strip { padding: 1rem 1.5rem; }
}
@media (max-width: 600px) {
  .features-grid { grid-template-columns: 1fr; }
  .kil-cats { grid-template-columns: 1fr; }
  .nav-links a:not(.nav-cta) { display: none; }
  .nav-links { gap: 0.6rem; }
  .nav-toggle { display: inline-flex; }
  .nav-mobile { display: block; position: fixed; top: 68px; left: 0; right: 0; z-index: 99; background: rgba(245,240,232,0.98); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(200,151,58,0.25); box-shadow: 0 10px 30px rgba(30,58,47,0.12); padding: 0.5rem 1.5rem 1rem; }
  .nav-mobile a { display: block; padding: 0.85rem 0; text-decoration: none; color: var(--vihrea); font-size: 1rem; font-weight: 500; border-bottom: 1px solid rgba(200,151,58,0.15); }
  .nav-mobile a:last-child { border-bottom: none; }
  .nav-backdrop { position: fixed; inset: 0; z-index: 98; background: rgba(21,42,34,0.25); border: 0; }
}

@media (max-width: 900px) {
  .showcase { padding: 3.5rem 1.5rem 1rem; }
  .sc-row, .sc-row.reverse { grid-template-columns: 1fr; gap: 2.2rem; padding: 2.8rem 0; }
  .sc-row.reverse .sc-text { order: 1; }
  .sc-row.reverse .sc-visual { order: 2; }
  .sc-final { padding: 4.5rem 1.5rem; }
}
`;


const FEATURES = [
  { icon: "📋", title: "Talokirja", desc: "Sähköinen talokirja kokoaa kotisi tiedot yhteen paikkaan – perustiedot, talotekniikka, materiaalit, laitteet ja vuosiluvut. Tieto on aina ajantasaista ja löytyy hetkessä. Myyntitilanteessa dokumentoitu huoltohistoria on arvokas – se kertoo ostajalle, että talosta on pidetty huolta." },
  { icon: "📅", title: "Vuosikello", desc: "Oikea huolto oikeaan aikaan – kausikohtaiset huoltomuistutukset talosi tietojen perusteella. Kuittaa tehdyksi, niin toimenpide siirtyy automaattisesti huoltohistoriaan." },
  { icon: "🤝", title: "Palveluiden kilpailutus", desc: "Tarvitsetko kuntoarvion, huollon tai tarjouksen? Lähetä pyyntö suoraan sovelluksesta – välitetään tarkistetuille paikallisille ammattilaisille. Sinä päätät kenen valitset.", highlight: true, tag: "⭐ Suosittu", note: "Kumppaniverkosto rakenteilla – palvelu laajenee alueittain." },
  { icon: "📊", title: "PTS-suunnitelma", desc: "Pitkän tähtäimen suunnitelma laskee talosi tietojen perusteella milloin rakennusosat – katto, putket, lämmitysjärjestelmä, märkätilat – tarvitsevat huoltoa tai uusimista. Näet seuraavan 10 vuoden huoltotarpeet yhdellä silmäyksellä. Ei yllätyksiä, ei kiirehuoltoja – vain ennakointi." },
  { icon: "💰", title: "Kulujenseuranta", desc: "Seuraa sähkön ja veden kulutusta vuositasolla. Näet miten kulutus kehittyy vuodesta toiseen – ja saat ennakoivan arvion tulevista kustannuksista." },
  { icon: "🔧", title: "Huoltohistoria", desc: "Kaikki tehdyt huollot, remontit ja tarkastukset dokumentoituna – tekijä, päivämäärä, kustannus ja liitteet. Kuitit ja takuut tallessa digitaalisesti. Löydät aina mitä tarvitset ja milloin." },
  { icon: "🧮", title: "Kotitalousvähennys", desc: "Seuraa kotitalousvähennyksen kertymää huolto- ja remonttikirjauksista. Kotiluotsi laskee automaattisesti, paljonko verovähennystä on kertynyt ja paljonko on vielä käytettävissä." },
  { icon: "📄", title: "Myyntiraportti", desc: "Kun taloa myydään, kaikki on valmiina. Yksi nappi tulostaa selkeän raportin välittäjälle – huoltohistoria, rakennusosat, energiankulutus ja dokumenttiliitteet järjestyksessä. Luottamusta herättävä paketti ostajalle." },
];

type Mock = {
  title: string;
  sub: string;
  chip?: ReactNode;
  rows?: [string, string][];
  btn?: string;
  special?: string;
};

const SHOWCASE: { icon: ReactNode; title: string; paragraphs: string[]; mock: Mock; fact?: string }[] = [
  {
    icon: "📋",
    title: "Kaikki talosi tiedot yhdessä paikassa",
    paragraphs: [
      "Omakotitalossa on satoja yksityiskohtia joita pitäisi muistaa – milloin katto on asennettu, mikä maalämpöpumpun malli on, koska putket on viimeksi tarkastettu.",
      "Talokirja kokoaa kaiken: perustiedot, talotekniikka, materiaalit, laitteet ja asennusvuodet. Tieto syötetään kerran ja se on aina käytettävissä – myös silloin kun ammattilainen kysyy tai talo laitetaan myyntiin.",
    ],
    mock: {
      title: "Talon tiedot",
      sub: "Koivutie 12",
      rows: [
        ["Rakennusvuosi", "1998"],
        ["Pinta-ala", "142 m²"],
        ["Lämmitys", "Maalämpö 2016"],
        ["Julkisivu", "Puu (lautaverhous)"],
        ["Katto", "Peltikatto 2012"],
        ["Ilmanvaihto", "Koneellinen, IV-kone 2005"],
      ],
    },
  },
  {
    icon: "📅",
    title: "Oikea huolto oikeaan aikaan – automaattisesti",
    paragraphs: [
      "Omakotitalossa on paljon huollettavaa ja moni asia saattaa unohtua. Keväällä pitäisi tarkastaa katto ja salaojat, syksyllä räystäät ja lämmitysjärjestelmä, talvella lumikuorma ja silikonisaumat.",
      "Vuosikello listaa kausikohtaiset huoltotehtävät automaattisesti talosi tietojen perusteella. Kuittaat tehdyksi yhdellä painalluksella – ja toimenpide siirtyy suoraan huoltohistoriaan dokumentoituna.",
    ],
    mock: {
      title: "Vuosikello",
      sub: "Kausi: kevät",
      chip: "4 tehtävää",
      rows: [
        ["Katon ja räystäiden tarkastus", "Tee"],
        ["Salaojien tarkastus", "Tee"],
        ["Sadevesikourujen puhdistus", "✓"],
        ["Julkisivun silmämääräinen tarkastus", "Tee"],
      ],
      btn: "Kuittaa tehdyksi",
    },
  },
  {
    icon: "🤝",
    title: "Löydä oikea tekijä – ilman etsimistä",
    paragraphs: [
      "Milloin olet viimeksi tarvinnut ammattilaista ja miettinyt kenen soitat? Oikean tekijän löytäminen vie aikaa ja lopputulos on epävarma.",
      "Kotiluotsin kautta tilaat kuntoarvion, huollon tai tarjouspyynnön suoraan sovelluksesta. Pyyntö välitetään tarkistetuille paikallisille ammattilaisille omalla alueellasi. Sinä valitset kenen kanssa jatkat.",
    ],
    mock: {
      title: "Tilaa palvelu",
      sub: "Pyyntö paikallisille ammattilaisille",
      chip: "Ilmanvaihto ja IV-kone",
      rows: [
        ["Palvelu", "Huolto"],
        ["Kohde", "Koivutie 12"],
        ["Alue", "Oma alueesi"],
        ["Kuvaus", "IV-kanavat puhdistamatta 12 v"],
      ],
      btn: "Lähetä pyyntö",
    },
  },
  {
    icon: "📊",
    title: "Tiedät jo tänään mitä talossa tapahtuu 10 vuoden päästä",
    paragraphs: [
      "Katto kestää 30–40 vuotta. Putket 40–50 vuotta. Maalämpöpumppu 20–25 vuotta. Märkätilat 25 vuotta. Jokaisella rakennusosalla on käyttöikä.",
      "PTS-suunnitelma laskee talosi rakennusvuoden ja tietojen perusteella milloin kukin osa lähestyy huolto- tai uusimisajankohtaansa. Näet seuraavan 10 vuoden huoltotarpeet selkeänä listana. Ei yllätyksiä – voit varautua ajoissa sekä taloudellisesti että käytännössä.",
    ],
    mock: {
      title: "PTS-suunnitelma",
      sub: "Seuraavat 10 vuotta",
      rows: [
        ["IV-kanavien puhdistus", "2027"],
        ["Märkätilojen kunnostus", "2029"],
        ["Julkisivun maalaus", "2031"],
        ["Peltikaton huoltomaalaus", "2033"],
        ["Käyttövesiputkisto", "2038"],
      ],
    },
  },
  {
    icon: "💰",
    title: "Näe mihin energia kuluu ja ennakoi tulevat kulut",
    paragraphs: [
      "Sähkön ja veden kulutuksen seuranta paljastaa trendit – onko kulutus kasvamassa vai laskenut viime vuodesta. Yksittäinen piikki voi kertoa vuotavasta hanasta tai huonosti toimivasta laitteesta.",
      "Kirjaa kulutuslukemat kuukausittain ja näet selkeän historian. Riittävän datan kertyessä palvelu tunnistaa automaattisesti sopiiko aurinkosähkö talollesi – ja ehdottaa ammattilaisen kartoitusta.",
    ],
    mock: {
      title: "Kulut",
      sub: "Sähkönkulutus kuukausittain",
      rows: [
        ["Tammikuu", "1 420 kWh"],
        ["Helmikuu", "1 280 kWh"],
        ["Maaliskuu", "1 040 kWh"],
        ["Huhtikuu", "780 kWh"],
        ["Toukokuu", "560 kWh"],
        ["Kesäkuu", "410 kWh"],
      ],
      btn: "Lisää mittarilukema",
    },
  },
  {
    icon: "🔧",
    title: "Dokumentoitu historia on talon arvokkain asiakirja",
    paragraphs: [
      "Muistatko milloin kylpyhuone on viimeksi remontoitu? Kuka teki ilmanvaihdon huollon ja minkä yrityksen takuu on vielä voimassa?",
      "Huoltohistoria tallentaa kaikki tehdyt toimenpiteet – tekijä, päivämäärä, kustannus, kuitit ja takuupaperit. Digitaalisesti tallessa, löydät aina kun tarvitset. Myyntitilanteessa huolella pidetty dokumentaatio on merkittävä luottamuksen rakentaja.",
    ],
    mock: {
      title: "Huoltohistoria",
      sub: "12 kirjausta",
      rows: [
        ["Nuohous · Nuohoja Oy", "3/2026"],
        ["IV-suodattimet vaihdettu", "1/2026"],
        ["Maalämpöpumpun huolto", "9/2025"],
        ["Kylpyhuoneremontti", "5/2024"],
      ],
      btn: "Lisää huoltokirjaus",
    },
  },
  {
    icon: <Calculator size={28} color="var(--kulta)" strokeWidth={1.5} />,
    title: "Kotitalousvähennys – seuraa hyöty euroina",
    paragraphs: [
      "Kotitalousvähennys on yksi suomalaisten käytetyimmistä verotuksen eduista – mutta moni jättää sen hakematta tai käyttää vain osan.",
      "Kun kirjaat huollon tai remontin Kotiluotsin huoltohistoriaan, merkitset samalla työn osuuden. Kotiluotsi laskee automaattisesti kuinka paljon verovähennystä on kertynyt ja paljonko on vielä käytettävissä – reaaliajassa, koko vuoden ajan.",
      "Ei enää arvaile veroilmoituksessa. Kaikki kirjattu, kaikki laskettuna.",
    ],
    mock: {
      title: "Kotitalousvähennys",
      sub: "Arvio vuodelle 2026",
      chip: (
        <div className="ph-chip-group">
          <span className="ph-chip ph-chip-active">1 henkilö</span>
          <span className="ph-chip">2 henkilöä</span>
        </div>
      ),
      special: "kotitalousvahennys",
    },
  },
  {
    icon: "📄",
    title: "Myyntitilanteessa kaikki on jo valmiina",
    paragraphs: [
      "Kun talo laitetaan myyntiin, välittäjä kysyy rakennustietoja, huoltohistoriaa ja dokumentteja. Useimmiten ne etsitään kiireellä vanhoista papereista ja muistista.",
      "Kotiluotsin myyntiraportti kokoaa kaiken automaattisesti – talon perustiedot, talotekniikka, huoltohistoria kronologisesti, energiankulutus ja dokumenttiliitteet. Yksi nappi, tulostettava PDF välittäjälle. Dokumentoitu talo myy paremmin.",
    ],
    mock: {
      title: "Myyntiraportti",
      sub: "Esikatselu · Koivutie 12",
      chip: "Valmis tulostettavaksi",
      rows: [
        ["1. Perustiedot", "✓"],
        ["2. Talotekniikka", "✓"],
        ["3. Huoltohistoria", "12 kpl"],
        ["4. Energiankulutus", "✓"],
        ["5. Dokumenttiliitteet", "6 kpl"],
      ],
      btn: "Tulosta PDF",
    },
  },
];

function PhoneMock({ mock }: { mock: Mock }) {
  const isKtv = mock.special === "kotitalousvahennys";
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-notch" />
        <div className="ph-title">{mock.title}</div>
        <div className="ph-sub">{mock.sub}</div>
        {mock.chip && (
          typeof mock.chip === "string" ? (
            <div className="ph-chip">{mock.chip}</div>
          ) : (
            mock.chip
          )
        )}
        {isKtv ? (
          <div className="ph-ktv">
            <div className="ph-ktv-amount">1 480 €</div>
            <div className="ph-ktv-label">Arvioitu verovähennys</div>
            <div className="ph-ktv-bar">
              <div className="ph-ktv-fill" style={{ width: "92.5%" }} />
            </div>
            <div className="ph-ktv-meta">Jäljellä 120 € / 1 600 €</div>
            <div className="ph-rows">
              <div className="ph-row">
                <span className="k">Yritystyöt</span>
                <span className="v">4 120 €</span>
              </div>
              <div className="ph-row">
                <span className="k">Palkkatyöt</span>
                <span className="v">0 €</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="ph-rows">
              {(mock.rows ?? []).map(([k, v]) => (
                <div className="ph-row" key={k}>
                  <span className="k">{k}</span>
                  <span className="v">{v}</span>
                </div>
              ))}
            </div>
            {mock.btn && <div className="ph-btn">{mock.btn}</div>}
          </>
        )}
      </div>
    </div>
  );
}



const STEPS = [
  { n: 1, title: "Valitse palvelu", desc: "Katto, LVI, sähkö, ilmanvaihto, nuohous – 14 kategoriaa suoraan sovelluksessa." },
  { n: 2, title: "Lähetä pyyntö", desc: "Talon tiedot täyttyvät automaattisesti talokirjastasi. Yksi nappi." },
  { n: 3, title: "Saat tarjoukset", desc: "Tarkastetut paikalliset yritykset ottavat yhteyttä. Sinä valitset." },
  { n: 4, title: "Tallenna huoltokirjaan", desc: "Työn jälkeen syötät tehdyn työn tiedot ja dokumentit itse huoltokirjaan – kaikki tallessa yhdessä paikassa." },
];

const CATS = [
  "🏠 Katto & vesikatto",
  "🔧 LVI & putket",
  "⚡ Sähkötyöt",
  "🌬️ Ilmanvaihto & IV-huolto",
  "🔥 Nuohous & tulisijat",
  "🌿 Piha & salaojat",
];

const OFFERS = [
  { name: "Yritys 1", stars: "★★★★★", price: "1 200€" },
  { name: "Yritys 2", stars: "★★★★☆", price: "1 450€" },
  { name: "Yritys 3", stars: "★★★★★", price: "980€" },
];

function LandingPage() {
  const [valikkoAuki, setValikkoAuki] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

    const cats = document.querySelectorAll<HTMLDivElement>(".kil-cat");
    const handler = (e: Event) => {
      cats.forEach((c) => c.classList.remove("active"));
      (e.currentTarget as HTMLElement).classList.add("active");
    };
    cats.forEach((c) => c.addEventListener("click", handler));
    return () => {
      observer.disconnect();
      cats.forEach((c) => c.removeEventListener("click", handler));
    };
  }, []);

  useEffect(() => {
    if (!valikkoAuki) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setValikkoAuki(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [valikkoAuki]);

  const sulje = () => setValikkoAuki(false);

  return (
    <div className="kv-page">
      <style>{STYLES}</style>

      <nav className="kv-nav">
        <div className="nav-logo">Koti<span>luotsi</span></div>
        <div className="nav-links">
          <a href="#ominaisuudet">Ominaisuudet</a>
          <a href="#kilpailutus">Kilpailutus</a>
          <Link to="/blogi/sahkoinen-talokirja">Blogi</Link>
          <Link to="/rekisteroidy" className="nav-cta">Aloita ilmaiseksi</Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label={valikkoAuki ? "Sulje valikko" : "Avaa valikko"}
            aria-expanded={valikkoAuki}
            onClick={() => setValikkoAuki((v) => !v)}
          >
            {valikkoAuki ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {valikkoAuki && (
        <>
          <button type="button" className="nav-backdrop" aria-label="Sulje valikko" onClick={sulje} />
          <div className="nav-mobile">
            <a href="#ominaisuudet" onClick={sulje}>Ominaisuudet</a>
            <a href="#kilpailutus" onClick={sulje}>Kilpailutus</a>
            <Link to="/blogi/sahkoinen-talokirja" onClick={sulje}>Blogi</Link>
            <Link to="/ukk" onClick={sulje}>Usein kysyttyä</Link>
            <Link to="/login" onClick={sulje}>Kirjaudu</Link>
          </div>
        </>
      )}


      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">Uutta · Ilmainen talokirja</div>
            <h1>
              Yksi sovellus –
              <em>koko talon hallinta.</em>
            </h1>
            <p className="hero-sub">
              Sähköinen talokirja, vuosikello, kulujenseuranta, PTS-suunnitelma ja palveluiden kilpailutus – kaikki samassa paikassa.
            </p>
            <div className="hero-actions">
              <Link to="/rekisteroidy" className="btn-primary">
                Avaa talokirja ilmaiseksi →
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="mock-card">
              <div className="mock-header">
                <div>
                  <div className="mock-title">Kotiluotsi</div>
                  <div className="mock-address">Koivutie 12</div>
                </div>
              </div>
              <div className="mock-tasks">
                <div className="mock-task done"><span className="check-done">✓</span> IV-suodattimet</div>
                <div className="mock-task done"><span className="check-done">✓</span> Räystäskourut puhdistettu</div>
                <div className="mock-task"><div className="check-todo" /> Katon tarkastus</div>
                <div className="mock-task"><div className="check-todo" /> Vikavirtasuojan testaus</div>
              </div>
              <div className="mock-costs">
                <div className="mock-cost"><div className="mock-cost-val">2 480€</div><div className="mock-cost-label">Sähkö</div></div>
                <div className="mock-cost"><div className="mock-cost-val">380€</div><div className="mock-cost-label">Vesi</div></div>
                <div className="mock-cost"><div className="mock-cost-val">4 200€</div><div className="mock-cost-label">Lämpö</div></div>
              </div>
              <div className="mock-pts">
                <div className="mock-pts-label">⚠ Seuraava PTS-toimenpide</div>
                <div className="mock-pts-title">Ilmanvaihtokone – huolto</div>
                <div className="mock-pts-sub">Suositellaan 2027 · Asennettu 2005, kanavat puhdistamatta 12v</div>
                <div className="mock-pts-btns">
                  <button className="mock-pts-btn">Tilaa kuntoarvio</button>
                  <button className="mock-pts-btn-ghost">Tarjouspyyntö: IV-kanavien puhdistus</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="features-strip">
        <div className="features-strip-inner">
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Ilmainen</strong> kaikille ominaisuuksille</div>
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Tarkastettu</strong> ammattilaisten verkosto</div>
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Automaattiset</strong> muistutukset huolloista</div>
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Myyntiraportti</strong> yksi nappi</div>
        </div>
      </div>

      <section className="features" id="ominaisuudet">
        <div className="features-inner">
          <div className="features-head animate-on-scroll">
            <div className="section-label">Ominaisuudet</div>
            <h2 className="section-h2">Kaikki mitä talo tarvitsee<br /><em>– yhdessä.</em></h2>
            <p className="section-lead">Kahdeksan toimintoa jotka tekevät talostasi hyvin hoidetun – automaattisesti ja ilman vaivaa.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feat-card animate-on-scroll${f.highlight ? " highlight" : ""}`}>
                {f.tag && <div className="feat-tag">{f.tag}</div>}
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
                {f.note && <div className="feat-note">{f.note}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="showcase">
        <div className="showcase-inner">
          {SHOWCASE.map((s, i) => (
            <div key={s.title} className={`sc-row animate-on-scroll${i % 2 === 1 ? " reverse" : ""}`}>
              <div className="sc-text">
                <div className="sc-icon">{s.icon}</div>
                <h3 className="sc-title">{s.title}</h3>
                {s.paragraphs.map((p) => (
                  <p className="sc-p" key={p.slice(0, 24)}>{p}</p>
                ))}
                <Link to="/rekisteroidy" className="sc-btn">Aloita ilmaiseksi →</Link>
                <p className="sc-note">Käyttö on maksutonta.<br />Käyttöönotto vie muutaman minuutin.</p>
              </div>
              <div className="sc-visual">
                <PhoneMock mock={s.mock} />
                {s.fact && <div className="sc-fact">{s.fact}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="sc-final">
        <div className="sc-final-inner">
          <h2>Talosi ansaitsee<br />enemmän kuin muistilista.</h2>
          <p>
            Liity Kotiluotsin käyttäjiin ja pidä talosi tiedot järjestyksessä. Käyttö on maksutonta – käyttöönotto vie muutaman minuutin.
          </p>
          <Link to="/rekisteroidy" className="sc-btn">Luo ilmainen tili →</Link>
          <p className="sc-final-small">Ei luottokorttia. Ei määräaikaa. Vain selkeämpi kuva talostasi.</p>
        </div>
      </section>



      <section className="kilpailutus" id="kilpailutus">
        <div className="kilpailutus-inner">
          <div>
            <div className="section-label" style={{ color: "var(--kulta-light)" }}>
              Palveluiden kilpailutus
            </div>
            <h2 className="section-h2">Ammattilainen paikalle –<br /><em>helposti ja nopeasti.</em></h2>
            <p className="section-lead">Tilaa suoraan sovelluksesta. Kotiluotsi välittää pyyntösi tarkastettuihin paikallisiin yrityksiin ja sinä valitset parhaan tarjouksen.</p>
            <div className="kil-steps">
              {STEPS.map((s) => (
                <div className="kil-step" key={s.n}>
                  <div className="kil-num">{s.n}</div>
                  <div>
                    <div className="kil-step-title">{s.title}</div>
                    <div className="kil-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="kil-mock animate-on-scroll">
            <div className="kil-mock-title">Tilaa palvelu</div>
            <div className="kil-mock-sub">Valitse kategoria – loput hoituu automaattisesti</div>
            <div className="kil-cats">
              {CATS.map((c, i) => (
                <div key={c} className={`kil-cat${i === 0 ? " active" : ""}`}>{c}</div>
              ))}
            </div>
            <hr className="kil-divider" />
            <div className="kil-result">
              <div className="kil-result-label">Paikalliset tarjoukset</div>
              <div className="kil-offers">
                {OFFERS.map((o) => (
                  <div className="kil-offer" key={o.name}>
                    <div>
                      <div className="kil-offer-name">{o.name}</div>
                      <div className="kil-offer-stars">{o.stars}</div>
                    </div>
                    <div className="kil-offer-price">{o.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof">
        <div className="proof-inner">
          <div className="proof-head animate-on-scroll">
            <div className="section-label">Miksi Kotiluotsi</div>
            <h2 className="section-h2">Talosi tiedot vihdoin<br /><em>järjestyksessä.</em></h2>
          </div>
          <div className="stats-row">
            <div className="stat-box animate-on-scroll"><div className="stat-val">7<span>+</span></div><div className="stat-label">toimintoa yhdessä sovelluksessa</div></div>
            <div className="stat-box animate-on-scroll"><div className="stat-val">0<span>€</span></div><div className="stat-label">kaikki ominaisuudet ilmaiseksi</div></div>
            <div className="stat-box animate-on-scroll"><div className="stat-val">14<span>+</span></div><div className="stat-label">ammattilaiskategoriaa kilpailutuksessa</div></div>
            <div className="stat-box animate-on-scroll"><div className="stat-val">1<span>min</span></div><div className="stat-label">käyttöönotto alle minuutissa</div></div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="aloita">
        <div className="cta-section-inner">
          <div className="section-label">Aloita tänään</div>
          <h2>Avaa talokirja.<br /><em>Ilmaiseksi.</em></h2>
          <p>Kaikki ominaisuudet heti käytössä. Ei luottokorttia eikä sitoumuksia.</p>
          <div className="cta-checks">
            <div className="cta-check">Kaikki ominaisuudet ilmaisia</div>
            <div className="cta-check">Ei luottokorttia eikä sitoumuksia</div>
            <div className="cta-check">Käyttöönotto alle minuutissa</div>
          </div>
          <Link to="/rekisteroidy" className="btn-primary" style={{ margin: "0 auto", fontSize: "1.1rem", padding: "1.1rem 2.8rem" }}>
            Aloita nyt – ilmaiseksi →
          </Link>
        </div>
      </section>

      <footer className="kv-footer">
        <p style={{ marginBottom: "0.6rem" }}>
          <a href="/ukk" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", marginRight: "1.2rem" }}>UKK</a>
          
          <a href="/kayttoehdot" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", marginRight: "1.2rem" }}>Käyttöehdot</a>
          <a href="/tietosuoja" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Tietosuoja</a>
        </p>
        <p>© 2026 <span>Kotiluotsi</span> · Talosi oma avustaja · Suomi</p>
      </footer>
    </div>
  );
}

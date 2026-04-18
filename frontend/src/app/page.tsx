"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CROPS = [
  { key: "apple", emoji: "🍎", en: "Apple", hi: "सेब" },
  { key: "corn", emoji: "🌽", en: "Corn", hi: "मक्का" },
  { key: "grape", emoji: "🍇", en: "Grape", hi: "अंगूर" },
  { key: "potato", emoji: "🥔", en: "Potato", hi: "आलू" },
  { key: "tomato", emoji: "🍅", en: "Tomato", hi: "टमाटर" },
  { key: "pepper", emoji: "🌶️", en: "Pepper", hi: "मिर्च" },
  { key: "cherry", emoji: "🍒", en: "Cherry", hi: "चेरी" },
  { key: "peach", emoji: "🍑", en: "Peach", hi: "आड़ू" },
  { key: "strawberry", emoji: "🍓", en: "Strawberry", hi: "स्ट्रॉबेरी" },
  { key: "orange", emoji: "🍊", en: "Orange", hi: "संतरा" },
];

const FEATURES = [
  { 
    icon: <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, 
    title: "AI Detection", 
    desc: "38 disease classes with 94%+ accuracy" 
  },
  { 
    icon: <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, 
    title: "Smart Treatment", 
    desc: "Chemical, organic & prevention advice" 
  },
  { 
    icon: <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>, 
    title: "Voice Output", 
    desc: "Listen to advice in Hindi & regional" 
  },
  { 
    icon: <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>, 
    title: "Works Offline", 
    desc: "PWA — no internet needed" 
  },
];

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => setIsVisible(true), []);

  return (
    <main className="min-h-dvh" style={{ background: "var(--bg)" }}>
      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-4 pt-8 pb-12"
        style={{
          background: "linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 100%)",
          minHeight: "60dvh",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full opacity-10 animate-float"
          style={{ width: 300, height: 300, background: "#86efac", top: -80, right: -60, borderRadius: "50%" }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: 200,
            height: 200,
            background: "#86efac",
            bottom: -40,
            left: -40,
            borderRadius: "50%",
            animation: "float 4s ease-in-out infinite 1s",
          }}
        />

        <div className={`max-w-lg mx-auto text-center relative z-10 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          {/* Logo & Nav */}
          <nav className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 text-white">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              <span className="font-bold text-lg">Kisan Sathi</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm">
                EN
              </button>
              <button className="px-3 py-1 rounded-full text-sm font-medium text-white/70 hover:bg-white/10 transition">
                हिं
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="mt-12 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
              अपनी फसल की जांच करें
            </h1>
            <p className="text-lg text-green-100/90 mb-2">Check Your Crop Health</p>
            <p className="text-sm text-green-200/70 max-w-xs mx-auto">
              Point your camera at a leaf. Get instant disease diagnosis and treatment advice in your language.
            </p>
          </div>

          {/* CTA Button */}
          <Link href="/scan">
            <button
              id="scan-button"
              className="btn-primary text-lg px-10 py-4 animate-pulse-glow"
              style={{ fontSize: "1.1rem" }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Scan Any Crop Now
            </button>
          </Link>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="px-4 py-10 max-w-lg mx-auto">
        <div className={`grid grid-cols-2 gap-3 stagger-children ${isVisible ? "" : "opacity-0"}`}>
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-4 text-center">
              <div className="mb-3 flex justify-center text-[var(--primary)]">{f.icon}</div>
              <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>{f.title}</h3>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported Crops Info ──────────────────────────────── */}
      <section className="px-4 pb-10 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "var(--primary-dark)" }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Detects 38+ Diseases
        </h2>
        <div className="glass-card p-4">
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>Our AI is trained to detect diseases across various crops including:</p>
          <div className="flex flex-wrap gap-2">
            {CROPS.map((c) => (
              <span key={c.key} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium" style={{ color: "var(--text)" }}>
                {c.en}
              </span>
            ))}
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
              + many more
            </span>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-lg mx-auto">
        <div className="flex gap-3">
          <Link href="/scan" className="flex-1">
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Scan Now
            </button>
          </Link>
          <Link href="/history" className="flex-1">
            <button className="btn-secondary w-full flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              History
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="text-center py-6 text-xs" style={{ color: "var(--text-secondary)" }}>
        <p>Kisan Sathi — AI for Indian Agriculture 🇮🇳</p>
        <p className="mt-1">Powered by Grok + Gemini + PyTorch</p>
      </footer>
    </main>
  );
}

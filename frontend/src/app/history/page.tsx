"use client";

import { useState, useEffect } from "react";
import { getHistory, type HistoryItem } from "@/lib/api";
import Link from "next/link";

const UI_STRINGS: Record<string, any> = {
  en: {
    home: "Home",
    scanHistory: "SCAN HISTORY",
    unauthorizedTitle: "Secure Access Only",
    unauthorizedDesc: "Your scan history is private. Please authenticate to continue.",
    login: "Log In",
    signup: "Sign Up",
    emptyTitle: "Your garden is empty",
    emptyDesc: "Start your first AI scan to see your crop history here.",
    emptyBtn: "Scan Your First Leaf",
    confidence: "Confidence",
    healthy: "HEALTHY",
    retry: "Retry Connection"
  },
  hi: {
    home: "होम",
    scanHistory: "स्कैन इतिहास",
    unauthorizedTitle: "केवल सुरक्षित पहुंच",
    unauthorizedDesc: "आपका स्कैन इतिहास निजी है। कृपया जारी रखने के लिए प्रमाणित करें।",
    login: "लॉग इन",
    signup: "साइन अप",
    emptyTitle: "आपका बगीचा खाली है",
    emptyDesc: "अपना फसल इतिहास यहां देखने के लिए अपना पहला AI स्कैन शुरू करें।",
    emptyBtn: "अपना पहला पत्ता स्कैन करें",
    confidence: "सटीकता",
    healthy: "स्वस्थ",
    retry: "फिर से कोशिश करें"
  }
};

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  HIGH: { color: "#ef4444", bg: "#fee2e2", icon: "🔴" },
  MEDIUM: { color: "#f59e0b", bg: "#fef3c7", icon: "🟡" },
  LOW: { color: "#10b981", bg: "#dcfce7", icon: "🟢" },
  NONE: { color: "#059669", bg: "#ecfdf5", icon: "✅" },
};

export default function HistoryPage() {
  const [detections, setDetections] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("leaf_scan_lang") || "en";
    setLang(savedLang);
    loadHistory();
  }, []);

  async function loadHistory() {
    const token = typeof window !== "undefined" ? localStorage.getItem("kisan_token") : null;
    if (!token) {
      setError("unauthorized");
      setLoading(false);
      return;
    }

    try {
      const data = await getHistory(50);
      setDetections(data.detections);
    } catch {
      setError("Could not load history. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'hi' ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function getDisplayName(key: string) {
    return key.replace(/___/g, " — ").replace(/_/g, " ");
  }

  const t = UI_STRINGS[lang] || UI_STRINGS.en;

  return (
    <main className="min-h-screen mesh-bg py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
           <Link href="/" className="group flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-all font-bold">
              <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">←</span>
              {t.home}
           </Link>
           <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t.scanHistory.split(' ')[0]} <span className="text-emerald-600">{t.scanHistory.split(' ')[1]}</span></h1>
           <Link href="/scan">
              <button className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:rotate-90 transition-all font-black">+</button>
           </Link>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass h-24 w-full animate-pulse bg-white/50" />
            ))}
          </div>
        )}

        {error && error !== "unauthorized" && (
          <div className="glass p-10 text-center space-y-4">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-xl">📡</div>
            <p className="font-bold text-slate-800 text-lg">{error}</p>
            <button onClick={loadHistory} className="btn-outline px-8 py-3">
              {t.retry}
            </button>
          </div>
        )}

        {error === "unauthorized" && (
          <div className="glass p-12 text-center space-y-8 animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">🔐</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">{t.unauthorizedTitle}</h2>
              <p className="text-slate-500 font-medium text-lg">{t.unauthorizedDesc}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="flex-1">
                <button className="btn-premium w-full py-4">{t.login}</button>
              </Link>
              <Link href="/register" className="flex-1">
                <button className="btn-outline w-full py-4 bg-white/50 backdrop-blur-sm">{t.signup}</button>
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && detections.length === 0 && (
          <div className="glass p-16 text-center space-y-6 animate-fade-in-up">
            <div className="w-32 h-32 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-6xl mx-auto shadow-inner animate-float">🌱</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">{t.emptyTitle}</h2>
              <p className="text-slate-500 font-medium">{t.emptyDesc}</p>
            </div>
            <Link href="/scan">
              <button className="btn-premium px-12 py-4 text-lg">{t.emptyBtn}</button>
            </Link>
          </div>
        )}

        {!loading && detections.length > 0 && (
          <div className="space-y-4 stagger-children">
            {detections.map((d) => {
              const sev = SEVERITY_CONFIG[d.severity] || SEVERITY_CONFIG.NONE;
              return (
                <Link href={`/results/${d.id}`} key={d.id} className="block group">
                  <div className="glass p-5 flex items-center gap-6 bg-white/60 card-hover group-hover:border-emerald-500/50">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                       <div className="w-full h-full flex items-center justify-center text-3xl grayscale group-hover:grayscale-0 transition-all">
                          {sev.icon}
                       </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-black text-lg text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {getDisplayName(d.disease_name)}
                         </h3>
                         <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-500">
                            {d.crop_type}
                         </span>
                      </div>
                      <p className="text-sm font-bold text-slate-400">
                         {formatDate(d.created_at)} • {d.confidence.toFixed(1)}% {t.confidence}
                      </p>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span
                        className="px-4 py-2 rounded-xl text-xs font-black tracking-widest shadow-sm"
                        style={{ background: sev.bg, color: sev.color }}
                      >
                        {d.severity === "NONE" ? t.healthy : d.severity}
                      </span>
                    </div>

                    <div className="text-slate-300 group-hover:text-emerald-600 transition-all">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

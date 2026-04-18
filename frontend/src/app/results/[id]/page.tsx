"use client";

import { useState, useEffect, use } from "react";
import { getDetection } from "@/lib/api";
import Link from "next/link";

export default function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    getDetection(Number(id))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.85;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="text-5xl animate-float mb-4">🌿</div>
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="text-center glass-card p-8">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="text-lg font-bold mb-2">Detection Not Found</h2>
          <Link href="/history"><button className="btn-primary mt-4">← Back to History</button></Link>
        </div>
      </main>
    );
  }

  const displayName = String(data.disease_name || "").replace(/___/g, " — ").replace(/_/g, " ");
  const rec = data.recommendation;
  const severity = String(data.severity || "NONE");
  const sevClass = `severity-${severity.toLowerCase()}`;
  
  const recText = rec?.text ? String(rec.text) : "";
  const recSource = rec?.source ? String(rec.source) : "AI";

  return (
    <main className="min-h-dvh px-4 py-6" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center gap-3 mb-6">
        <Link href="/history" className="text-2xl">←</Link>
        <h1 className="text-xl font-bold" style={{ color: "var(--primary-dark)" }}>Detection #{id}</h1>
      </nav>

      <div className="max-w-lg mx-auto stagger-children">
        {/* Detection Card */}
        <div className="glass-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>{displayName}</h2>
            <span className={`badge ${sevClass}`}>{severity === "NONE" ? "Healthy" : severity}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span style={{ color: "var(--text-secondary)" }}>Crop</span>
              <p className="font-semibold">{String(data.crop_type || "N/A")}</p>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)" }}>Confidence</span>
              <p className="font-semibold" style={{ color: "var(--primary)" }}>{Number(data.confidence || 0).toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: `${Number(data.confidence || 0)}%` }} />
            </div>
          </div>
        </div>

        {/* Other predictions */}
        {Array.isArray(data.top_predictions) && data.top_predictions.length > 1 ? (
          <div className="glass-card p-4 mb-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>All Predictions</h3>
            {data.top_predictions.map((p: any, i: number) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <span>{String(p.disease || p.class_key || "")}</span>
                <span className="font-medium">{Number(p.confidence || 0).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Recommendation */}
        {recText && severity !== "NONE" ? (
          <div className="glass-card p-5 mb-4 border-l-4 border-red-500 bg-red-50/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                What to do now
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                via {recSource}
              </span>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: "var(--text)" }}>
              {recText}
            </div>
          </div>
        ) : null}
        {recText && severity === "NONE" ? (
          <div className="glass-card p-5 mb-4 border-l-4 border-green-500 bg-green-50/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Plant is Healthy
              </h3>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: "var(--text)" }}>
              {recText}
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => speakText(rec?.text ? String(rec.text) : displayName)}
            className={`btn-secondary flex-1 ${speaking ? "animate-pulse-glow" : ""}`}
          >
            🔊 {speaking ? "Speaking..." : "Listen"}
          </button>
          <Link href="/scan" className="flex-1">
            <button className="btn-primary w-full">📸 New Scan</button>
          </Link>
        </div>

        {/* Date */}
        {data.created_at && (
          <p className="text-center text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
            Scanned on {new Date(String(data.created_at)).toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </main>
  );
}

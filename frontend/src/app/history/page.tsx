"use client";

import { useState, useEffect } from "react";
import { getHistory, type HistoryItem } from "@/lib/api";
import Link from "next/link";

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  HIGH: { color: "#dc2626", bg: "#fef2f2", icon: "🔴" },
  MEDIUM: { color: "#d97706", bg: "#fffbeb", icon: "🟡" },
  LOW: { color: "#16a34a", bg: "#f0fdf4", icon: "🟢" },
  NONE: { color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
};

export default function HistoryPage() {
  const [detections, setDetections] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  function getDisplayName(key: string) {
    return key.replace(/___/g, " — ").replace(/_/g, " ");
  }

  return (
    <main className="min-h-dvh px-4 py-6" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl">←</Link>
          <h1 className="text-xl font-bold" style={{ color: "var(--primary-dark)" }}>
            📊 Detection History
          </h1>
        </div>
        <Link href="/scan">
          <button className="btn-primary px-4 py-2 text-sm">+ Scan</button>
        </Link>
      </nav>

      <div className="max-w-lg mx-auto">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        )}

        {error && error !== "unauthorized" && (
          <div className="glass-card p-6 text-center">
            <p className="text-4xl mb-3">📡</p>
            <p className="font-medium" style={{ color: "var(--text)" }}>{error}</p>
            <button onClick={loadHistory} className="btn-secondary mt-4 text-sm">
              Retry
            </button>
          </div>
        )}

        {error === "unauthorized" && (
          <div className="glass-card p-8 text-center animate-fade-in-up">
            <p className="text-5xl mb-4">🔐</p>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>
              Login Required
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Please log in to view your scan history and recommendations.
            </p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <button className="btn-primary w-full">Log In</button>
              </Link>
              <Link href="/register" className="flex-1">
                <button className="btn-secondary w-full">Sign Up</button>
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && detections.length === 0 && (
          <div className="glass-card p-8 text-center animate-fade-in-up">
            <p className="text-5xl mb-4">🌱</p>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text)" }}>
              No scans yet
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Scan your first crop to start building your history
            </p>
            <Link href="/scan">
              <button className="btn-primary">📸 Scan Now</button>
            </Link>
          </div>
        )}

        {!loading && detections.length > 0 && (
          <div className="space-y-3 stagger-children">
            {detections.map((d) => {
              const sev = SEVERITY_CONFIG[d.severity] || SEVERITY_CONFIG.NONE;
              return (
                <Link href={`/results/${d.id}`} key={d.id}>
                  <div className="glass-card p-4 flex items-center gap-4">
                    <span className="text-2xl">{sev.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                        {getDisplayName(d.disease_name)}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {d.crop_type} • {d.confidence.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className="badge text-xs"
                        style={{ background: sev.bg, color: sev.color }}
                      >
                        {d.severity === "NONE" ? "Healthy" : d.severity}
                      </span>
                      {d.created_at && (
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                          {formatDate(d.created_at)}
                        </p>
                      )}
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

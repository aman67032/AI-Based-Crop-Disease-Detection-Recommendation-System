"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { detectDisease, type DetectResponse } from "@/lib/api";
import Link from "next/link";
import { Suspense } from "react";

const CROPS = [
  { key: "apple", emoji: "🍎", en: "Apple" },
  { key: "corn", emoji: "🌽", en: "Corn" },
  { key: "grape", emoji: "🍇", en: "Grape" },
  { key: "potato", emoji: "🥔", en: "Potato" },
  { key: "tomato", emoji: "🍅", en: "Tomato" },
  { key: "pepper", emoji: "🌶️", en: "Pepper" },
  { key: "cherry", emoji: "🍒", en: "Cherry" },
  { key: "peach", emoji: "🍑", en: "Peach" },
  { key: "strawberry", emoji: "🍓", en: "Strawberry" },
  { key: "orange", emoji: "🍊", en: "Orange" },
];

function ScanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<"capture" | "processing" | "results">("capture");
  const [selectedCrop, setSelectedCrop] = useState(searchParams.get("crop") || "");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en");
  const [speaking, setSpeaking] = useState(false);

  // Auto-advance if crop is pre-selected
  useEffect(() => {
    if (searchParams.get("crop")) setStep("capture");
  }, [searchParams]);

  // ── Camera ─────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      setError("Camera not available. Please upload an image instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreview(canvas.toDataURL("image/jpeg"));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  }, [stopCamera]);

  // ── File Upload ────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ── Detection ──────────────────────────────────────────
  const runDetection = async () => {
    if (!selectedFile) return;
    setStep("processing");
    setError("");
    try {
      const res = await detectDisease(selectedFile, selectedCrop, language);
      setResult(res);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed");
      setStep("capture");
    }
  };

  // ── Voice Output ───────────────────────────────────────
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = language === "hi" ? "hi-IN" : "en-US";
      utter.rate = 0.85;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };



  // ── Step: Capture / Upload ────────────────────────────
  if (step === "capture") {
    return (
      <main className="min-h-dvh px-4 py-6" style={{ background: "var(--bg)" }}>
        <nav className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-2xl hover:text-green-700 transition">←</Link>
          <h1 className="text-xl font-bold" style={{ color: "var(--primary-dark)" }}>
            Scan Plant Leaf
          </h1>
        </nav>

        <div className="max-w-lg mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "#fef2f2", color: "var(--danger)" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Camera View */}
          {cameraActive && (
            <div className="relative rounded-2xl overflow-hidden mb-4 animate-scale-in" style={{ background: "#000" }}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full" style={{ maxHeight: "50dvh" }} />
              {/* Corner guides */}
              <div className="absolute inset-8 border-2 border-white/40 rounded-xl pointer-events-none" />
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
                <button onClick={capturePhoto} className="btn-primary px-8 py-3 text-lg">
                  📸 Capture
                </button>
                <button onClick={stopCamera} className="btn-secondary px-6 py-3">
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && !cameraActive && (
            <div className="relative rounded-2xl overflow-hidden mb-4 animate-scale-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Leaf preview" className="w-full rounded-2xl" style={{ maxHeight: "50dvh", objectFit: "cover" }} />
              <button
                onClick={() => { setPreview(null); setSelectedFile(null); }}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload zone — shown when no camera and no preview */}
          {!cameraActive && !preview && (
            <div
              className="upload-zone mb-4"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex justify-center mb-3">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <p className="font-semibold" style={{ color: "var(--primary-dark)" }}>
                Upload or Drag Leaf Photo
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                JPG, PNG — up to 20MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Tips */}
          <div className="glass-card p-4 mb-4">
            <p className="text-sm font-medium" style={{ color: "var(--primary-dark)" }}>
              💡 Tips for best results:
            </p>
            <ul className="text-xs mt-2 space-y-1" style={{ color: "var(--text-secondary)" }}>
              <li>• Hold phone 20cm from the leaf</li>
              <li>• Ensure good lighting (natural daylight best)</li>
              <li>• Focus on the diseased area of the leaf</li>
              <li>• Avoid shadows and blurry photos</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!cameraActive && (
              <button className="btn-secondary flex-1" onClick={startCamera}>
                📷 Open Camera
              </button>
            )}
            {!cameraActive && (
              <button
                className="btn-secondary flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                🖼️ Gallery
              </button>
            )}
          </div>

          {preview && selectedFile && (
            <button className="btn-primary w-full mt-4 text-lg py-4" onClick={runDetection}>
              🔍 Analyze Leaf
            </button>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </main>
    );
  }

  // ── Step: Processing ──────────────────────────────────
  if (step === "processing") {
    return (
      <main className="min-h-dvh flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="text-center animate-fade-in-up">
          <div className="text-6xl mb-4 animate-float">🌿</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--primary-dark)" }}>
            Analyzing your crop...
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Running AI detection — this takes 2-5 seconds
          </p>
          <div className="mt-6 mx-auto" style={{ width: 200 }}>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: "100%", animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%" }}
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Step: Results ─────────────────────────────────────
  if (step === "results" && result) {
    const { detection, predictions, recommendation } = result;
    const severityClass = `severity-${detection.severity.toLowerCase()}`;

    return (
      <main className="min-h-dvh px-4 py-6" style={{ background: "var(--bg)" }}>
        <nav className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => { setStep("capture"); setPreview(null); setSelectedFile(null); setResult(null); }} className="text-2xl">←</button>
            <h1 className="text-xl font-bold" style={{ color: "var(--primary-dark)" }}>Results</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLanguage("en")} className={`px-3 py-1 rounded-full text-xs font-semibold ${language === "en" ? "bg-green-600 text-white" : "bg-gray-200"}`}>EN</button>
            <button onClick={() => setLanguage("hi")} className={`px-3 py-1 rounded-full text-xs font-semibold ${language === "hi" ? "bg-green-600 text-white" : "bg-gray-200"}`}>हिं</button>
          </div>
        </nav>

        <div className="max-w-lg mx-auto stagger-children">
          {/* Image preview */}
          {preview && (
            <div className="rounded-2xl overflow-hidden mb-4" style={{ maxHeight: "30dvh" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Scanned leaf" className="w-full object-cover" style={{ maxHeight: "30dvh" }} />
            </div>
          )}

          {/* Primary Detection */}
          <div className="glass-card p-5 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {detection.is_healthy ? (
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  )}
                  <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                    {detection.disease}
                  </h2>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {detection.crop} • {result.model_version}
                </p>
              </div>
              <span className={`badge ${severityClass}`}>
                {detection.severity === "NONE" ? "Healthy" : detection.severity}
              </span>
            </div>

            {/* Confidence bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: "var(--text-secondary)" }}>Confidence</span>
                <span className="font-bold" style={{ color: "var(--primary)" }}>{detection.confidence}%</span>
              </div>
              <div className="confidence-bar">
                <div
                  className={`confidence-fill ${detection.confidence > 80 ? "high" : detection.confidence > 50 ? "medium" : ""}`}
                  style={{ width: `${detection.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Other predictions */}
          {predictions.length > 1 && (
            <div className="glass-card p-4 mb-4">
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                Other possibilities:
              </h3>
              {predictions.slice(1).map((p, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-sm">{p.disease}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{p.confidence}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Treatment Recommendation */}
          {recommendation.text && !detection.is_healthy && (
            <div className="glass-card p-5 mb-4 border-l-4 border-red-500 bg-red-50/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2 text-red-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  What to do now
                </h3>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--primary-light)", color: "var(--primary-dark)" }}>
                  via {recommendation.source}
                </span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: "var(--text)" }}>
                {recommendation.text}
              </div>

              {/* Treatment data cards */}
              {recommendation.treatment_data && (
                <div className="mt-5 space-y-3 border-t border-red-200 pt-4">
                  {recommendation.treatment_data.chemical && (
                    <div className="p-3 rounded-xl bg-white/60 border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Chemical Treatment
                      </p>
                      <p className="text-sm mt-1">{recommendation.treatment_data.chemical}</p>
                    </div>
                  )}
                  {recommendation.treatment_data.organic && (
                    <div className="p-3 rounded-xl bg-white/60 border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wide flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        Organic Option
                      </p>
                      <p className="text-sm mt-1">{recommendation.treatment_data.organic}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => speakText(recommendation.text || detection.disease)}
              className={`btn-secondary flex-1 ${speaking ? "animate-pulse-glow" : ""}`}
            >
              🔊 {speaking ? "Speaking..." : "Listen"}
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Kisan Sathi: ${detection.disease}`,
                    text: `Disease: ${detection.disease}\nConfidence: ${detection.confidence}%\n\n${recommendation.text}`,
                  });
                }
              }}
              className="btn-secondary flex-1"
            >
              📤 Share
            </button>
          </div>

          {/* Scan Again */}
          <button
            className="btn-primary w-full py-4"
            onClick={() => { setStep("capture"); setPreview(null); setSelectedFile(null); setResult(null); }}
          >
            📸 Scan Another Leaf
          </button>
        </div>
      </main>
    );
  }

  return null;
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center">Loading...</div>}>
      <ScanPageContent />
    </Suspense>
  );
}

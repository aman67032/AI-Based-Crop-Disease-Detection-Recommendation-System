"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { detectDisease } from "@/lib/api";

export default function ScanPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const constraints = { video: { facingMode: { ideal: "environment" } }, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraOpen(true);
      setPreview(null);
      setImage(null);
    } catch (err) {
      console.error("Camera access denied or failed:", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        setIsCameraOpen(true);
      } catch (fallbackErr) {
        console.error("Complete camera failure:", fallbackErr);
        alert("Could not access camera. Please check permissions.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
            handleFile(file);
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await detectDisease(image);
      router.push(`/results/${res.id}`);
    } catch (err) {
      console.error("Scan failed:", err);
      setTimeout(() => { router.push(`/history`); }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/a68268f1c84cdb06d93efa985ce9566b.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--earth)]/80 via-[var(--primary-dark)]/70 to-[var(--earth)]/90 z-0" />
      
      <div className="relative z-10 max-w-2xl mx-auto px-5 pt-24 pb-32 space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-white/80 hover:text-white transition-all font-bold">
            <span className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all text-lg">←</span>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <svg className="w-7 h-7 text-[var(--gold-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Scan Plant
          </h1>
        </div>

        {/* Scan Area */}
        <div className="glass-dark p-6 md:p-10 rounded-[2rem] border border-white/15 shadow-2xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-6 animate-fade-in">
              {/* Animated growing plant SVG */}
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 text-[var(--gold-light)] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
                </svg>
                <div className="absolute inset-0 rounded-full border-4 border-[var(--gold)]/30 border-t-[var(--gold)] animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white animate-pulse">Analyzing Leaf...</h3>
                <p className="text-white/60 text-base font-medium">पत्ती की जाँच हो रही है...</p>
              </div>
            </div>
          ) : isCameraOpen ? (
            <div className="space-y-6 animate-fade-in">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black shadow-xl border-2 border-white/20">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button onClick={stopCamera} className="absolute top-4 right-4 w-12 h-12 bg-black/40 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center backdrop-blur-md transition-all text-xl font-bold">✕</button>
                {/* Corner Viewfinder Brackets */}
                <div className="absolute top-6 left-6 w-12 h-12 border-l-4 border-t-4 border-[var(--gold)] rounded-tl-lg pointer-events-none" />
                <div className="absolute top-6 right-6 w-12 h-12 border-r-4 border-t-4 border-[var(--gold)] rounded-tr-lg pointer-events-none" />
                <div className="absolute bottom-6 left-6 w-12 h-12 border-l-4 border-b-4 border-[var(--gold)] rounded-bl-lg pointer-events-none" />
                <div className="absolute bottom-6 right-6 w-12 h-12 border-r-4 border-b-4 border-[var(--gold)] rounded-br-lg pointer-events-none" />
                <div className="scan-line" />
              </div>
              <div className="flex justify-center">
                <button onClick={capturePhoto} className="w-20 h-20 bg-white border-4 border-[var(--gold)] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,168,83,0.4)] hover:scale-110 active:scale-90 transition-all">
                  <div className="w-14 h-14 bg-[var(--primary)] rounded-full" />
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : preview ? (
            <div className="space-y-6 animate-fade-in">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
                <img src={preview} className="w-full h-full object-cover" alt="Selected Leaf" />
                <button onClick={() => {setPreview(null); setImage(null);}} className="absolute top-4 right-4 w-12 h-12 bg-red-600/80 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg hover:bg-red-600 transition-all text-lg">✕</button>
              </div>
              <button onClick={handleScan} disabled={loading} className="btn-gold w-full py-5 text-xl tracking-wide">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Analyze Plant
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 md:p-10 transition-all duration-300 flex flex-col items-center justify-center gap-6 min-h-[280px] ${isDragging ? "border-[var(--gold)] bg-white/10 scale-[1.02]" : "border-white/20 hover:border-white/40"}`}
            >
              <div className="w-24 h-24 rounded-3xl bg-white/10 text-[var(--gold-light)] flex items-center justify-center shadow-inner animate-float-slow border border-white/10">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Upload or Take Photo</h3>
                <p className="text-white/50 text-sm font-medium">JPG, PNG (Max 5MB)</p>
              </div>
              
              <div className="flex flex-col gap-4 pt-2 w-full">
                <button onClick={startCamera} className="btn-primary w-full py-5 text-lg">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  📷 Take Photo
                </button>
                <label className="btn-gold w-full py-5 text-lg cursor-pointer">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  🖼️ Choose from Gallery
                  <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-dark p-5 flex gap-4 items-start rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/20 text-[var(--gold-light)] flex flex-shrink-0 items-center justify-center text-xl">☀️</div>
            <div>
              <h4 className="font-bold text-white text-base">Good Light</h4>
              <p className="text-sm text-white/60 font-medium mt-1">Use bright, indirect sunlight for best results.</p>
            </div>
          </div>
          <div className="card-dark p-5 flex gap-4 items-start rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/20 text-[var(--green-300)] flex flex-shrink-0 items-center justify-center text-xl">🍃</div>
            <div>
              <h4 className="font-bold text-white text-base">Full Leaf</h4>
              <p className="text-sm text-white/60 font-medium mt-1">Make sure the leaf fills most of the frame.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

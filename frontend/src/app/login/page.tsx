"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("kisan_token", "demo_token");
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f2f4f2] p-0 md:p-6 lg:p-12 relative">
      
      {/* Background for Mobile (Leaves) */}
      <div className="absolute inset-0 block md:hidden z-0">
        <img src="/14dd2dc57fde2f87bb2f429eaeb3a743.webp" alt="Leaves" className="w-full h-full object-cover brightness-75" />
      </div>

      <div className="w-full max-w-[1100px] min-h-[100vh] md:min-h-[750px] md:bg-white md:rounded-[2.5rem] shadow-2xl flex relative overflow-hidden z-10">
        
        {/* Left Side: Form Container */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 md:px-16 py-12 relative z-40 bg-white/60 md:bg-white backdrop-blur-3xl md:backdrop-blur-none">
          
          <div className="w-full max-w-sm mx-auto space-y-10">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-[#1a2e1a] tracking-tight">Welcome <span className="text-[var(--primary)]">Back</span></h1>
              <p className="text-gray-500 font-medium text-sm">Sign in to continue your agricultural journey.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email or Phone</label>
                <input
                  type="text"
                  value={email}
                  placeholder="farmer@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border-2 border-gray-100 bg-white/50 focus:border-[var(--primary)] focus:bg-white outline-none transition-all text-sm font-bold text-gray-800 shadow-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 rounded-full border-2 border-gray-100 bg-white/50 focus:border-[var(--primary)] focus:bg-white outline-none transition-all text-sm font-bold text-gray-800 shadow-sm"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--primary)] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:scale-[1.02] active:scale-[0.98] text-white rounded-full font-black text-lg transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                Log in
              </button>
            </form>

            <div className="relative flex items-center justify-center pt-2">
              <div className="absolute inset-x-0 h-px bg-gray-100"></div>
              <span className="relative bg-transparent md:bg-white px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">or use socials</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button className="flex-1 py-3 rounded-2xl border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all bg-white shadow-sm active:scale-95">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              </button>
              <button className="flex-1 py-3 rounded-2xl border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all bg-white shadow-sm active:scale-95">
                <svg className="w-5 h-5" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs font-medium text-gray-500">
                Don't have an account? <Link href="/register" className="text-[var(--primary)] font-bold hover:underline">Sign up free</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Paper Cut Wavy Layers (Desktop Only) */}
        {/* Layer 1 (Bottom, Darkest Shadow) */}
        <svg 
          className="absolute left-1/2 top-0 h-full w-[300px] -translate-x-[50px] z-10 text-[#d1d5db] hidden md:block" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          style={{ filter: "drop-shadow(25px 0 25px rgba(0,0,0,0.6))" }}
        >
          <path d="M0,0 L50,0 C10,20 110,40 20,60 C-30,80 80,100 0,100 Z" fill="currentColor" />
        </svg>

        {/* Layer 2 (Middle Layer) */}
        <svg 
          className="absolute left-1/2 top-0 h-full w-[260px] -translate-x-[30px] z-20 text-[#e5e7eb] hidden md:block" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          style={{ filter: "drop-shadow(15px 0 15px rgba(0,0,0,0.4))" }}
        >
          <path d="M0,0 L50,0 C15,20 95,40 25,60 C-20,80 70,100 0,100 Z" fill="currentColor" />
        </svg>

        {/* Layer 3 (Top Layer - White) */}
        <svg 
          className="absolute left-1/2 top-0 h-full w-[220px] -translate-x-[10px] z-30 text-white hidden md:block" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          style={{ filter: "drop-shadow(10px 0 10px rgba(0,0,0,0.2))" }}
        >
          <path d="M0,0 L50,0 C20,20 80,40 30,60 C-10,80 60,100 0,100 Z" fill="currentColor" />
        </svg>

        {/* Right Side: Tropical Leaves Image (Desktop Only) */}
        <div className="hidden md:block absolute inset-y-0 right-0 w-1/2 z-0">
          <img src="/14dd2dc57fde2f87bb2f429eaeb3a743.webp" alt="Tropical Leaves" className="w-full h-full object-cover scale-105" />
          {/* Subtle dark overlay for better depth */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

      </div>
      
      {/* Back to Home Link */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors z-50 flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full backdrop-blur-md">
        ← Back to Home
      </Link>
    </main>
  );
}

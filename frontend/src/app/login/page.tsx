"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, loginWithGoogle, setToken } from "@/lib/api";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.token) {
        setToken(res.token);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const res = await loginWithGoogle(idToken);
      if (res.token) {
        setToken(res.token);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4 pt-32 pb-12 md:px-6 md:pt-32 lg:px-12 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/dc0a6f2b4300f5704f25c260209e6477.jpg')" }}
    >
      {/* Dark gradient overlay for text readability and cinematic feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--green-950)]/80 via-[var(--green-900)]/60 to-[var(--primary-dark)]/80 backdrop-blur-sm z-0"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up flex flex-col items-center">
        <div className="w-full mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-colors bg-black/20 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg w-fit">
            ← Back to Home
          </Link>
        </div>
        {/* Glass Card */}
        <div className="glass-dark p-8 md:p-12 border border-white/20 shadow-2xl rounded-[2.5rem]">
          <div className="text-center space-y-3 mb-10">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 hover:scale-110 transition-transform">
              <img src="/logo(leafscan).png" alt="LeafScan" className="w-10 h-10 object-contain" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Welcome <span className="text-[var(--green-300)]">Back</span></h1>
            <p className="text-[var(--green-100)] font-medium text-sm">Sign in to continue your agricultural journey.</p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-100 rounded-2xl text-sm font-bold flex items-start gap-3 animate-shake backdrop-blur-md">
              <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--green-200)] ml-4">Email or Phone</label>
              <input
                type="text"
                value={email}
                placeholder="farmer@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-[var(--green-300)] focus:bg-white/20 outline-none transition-all text-base font-medium text-white placeholder-white/50 shadow-inner"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[var(--green-200)] ml-4">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-[var(--green-300)] focus:bg-white/20 outline-none transition-all text-base font-medium text-white placeholder-white/50 shadow-inner pr-14"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white bg-white/5 rounded-xl transition-colors"
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--primary-light)] hover:bg-[var(--green-400)] active:scale-[0.98] text-[var(--green-950)] rounded-2xl font-black text-lg transition-all shadow-[0_8px_20px_rgba(74,222,128,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-[var(--green-900)] border-t-transparent rounded-full animate-spin" />
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center pt-8 pb-4">
            <div className="absolute inset-x-0 h-px bg-white/20"></div>
            <span className="relative bg-[var(--green-950)] px-4 text-[10px] font-black uppercase tracking-widest text-[var(--green-200)] rounded-full border border-white/10">or continue with</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center gap-3 hover:bg-white/20 transition-all shadow-sm active:scale-95 text-white font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
          </div>

          <div className="text-center pt-8">
            <p className="text-sm font-medium text-white/70">
              New here? <Link href="/register" className="text-[var(--green-300)] font-bold hover:underline hover:text-white transition-colors">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
      
    </main>
  );
}

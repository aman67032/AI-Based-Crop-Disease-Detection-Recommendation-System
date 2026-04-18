"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res.token) {
        setToken(res.token);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/history");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-bg flex items-center justify-center p-6 selection:bg-emerald-200">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
           <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
           </Link>
           <div className="space-y-1">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
             <p className="text-slate-500 font-bold">Securely login to your Leaf Scan account</p>
           </div>
        </div>

        {/* Form Card */}
        <div className="glass p-8 space-y-6 shadow-2xl bg-white/60">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email or Phone</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  placeholder="farmer@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                 <Link href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-white/50 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full py-5 text-lg shadow-[0_20px_40px_-15px_rgba(5,150,105,0.4)] flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  SIGN IN
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-bold text-slate-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-emerald-600 hover:text-emerald-700 border-b-2 border-emerald-100 hover:border-emerald-600 transition-all">
            Join the community
          </Link>
        </p>
      </div>
    </main>
  );
}

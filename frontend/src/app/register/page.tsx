"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, setToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    language_pref: "en",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email && !formData.phone) {
        throw new Error("Please provide either email or phone");
      }

      const res = await registerUser(formData);
      if (res.token) {
        setToken(res.token);
        window.dispatchEvent(new Event("auth-change"));
        router.push("/history");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-12 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/14dd2dc57fde2f87bb2f429eaeb3a743.webp')" }}
    >
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--green-950)]/90 via-[var(--green-900)]/70 to-transparent backdrop-blur-sm z-0"></div>

      <div className="w-full max-w-xl relative z-10 animate-fade-in-up mt-12 md:mt-0">
        {/* Glass Card */}
        <div className="glass-dark p-8 md:p-12 border border-white/20 shadow-2xl rounded-[2.5rem]">
          <div className="text-center space-y-4 mb-10">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-2 hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-[var(--green-300)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Create <span className="text-[var(--green-300)]">Account</span></h1>
            <p className="text-[var(--green-100)] font-medium text-sm">Join the LeafScan agricultural community.</p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-100 rounded-2xl text-sm font-bold flex items-start gap-3 animate-shake backdrop-blur-md">
              <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--green-200)] ml-4">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-[var(--green-300)] focus:bg-white/20 outline-none transition-all text-base font-medium text-white placeholder-white/50 shadow-inner"
                placeholder="Ramesh Kumar"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--green-200)] ml-4">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-[var(--green-300)] focus:bg-white/20 outline-none transition-all text-base font-medium text-white placeholder-white/50 shadow-inner"
                placeholder="farmer@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--green-200)] ml-4">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-[var(--green-300)] focus:bg-white/20 outline-none transition-all text-base font-medium text-white placeholder-white/50 shadow-inner"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--green-200)] ml-4">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-[var(--green-300)] focus:bg-white/20 outline-none transition-all text-base font-medium text-white placeholder-white/50 shadow-inner"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--green-200)] ml-4">Language</label>
              <select
                name="language_pref"
                value={formData.language_pref}
                onChange={handleChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-[var(--green-300)] focus:bg-white/20 outline-none transition-all text-base font-medium text-white shadow-inner appearance-none cursor-pointer"
              >
                <option value="en" className="text-black">English (Global)</option>
                <option value="hi" className="text-black">हिन्दी (India)</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--primary-light)] hover:bg-[var(--green-400)] active:scale-[0.98] text-[var(--green-950)] rounded-2xl font-black text-lg transition-all shadow-[0_8px_20px_rgba(74,222,128,0.3)] flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-[var(--green-900)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Free Account
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-8">
            <p className="text-sm font-medium text-white/70">
              Already using LeafScan?{" "}
              <Link href="/login" className="text-[var(--green-300)] font-bold hover:underline hover:text-white transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Back to Home Link */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-bold text-white/80 hover:text-white transition-colors z-50 flex items-center gap-2 bg-black/20 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        ← Back to Home
      </Link>
    </main>
  );
}

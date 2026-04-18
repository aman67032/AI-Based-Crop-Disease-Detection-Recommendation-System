"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("kisan_token"));
    checkAuth();
    
    // Theme init
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);

    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center transition-all duration-500 font-[family-name:var(--font-poppins)]">
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-6 py-3">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <img src="/logo(leafscan).png" alt="LeafScan Logo" className="w-10 h-10 object-contain group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-300" />
          <span className="font-extrabold text-2xl tracking-tight text-[var(--text)] dark:text-white font-[family-name:var(--font-outfit)]">
            Leaf<span className="text-[var(--primary)]">Scan</span>
          </span>
        </Link>

        {/* Links - Center */}
        <div className="hidden md:flex gap-8 items-center font-medium text-[15px] text-[var(--text-secondary)] dark:text-slate-300">
          <Link href="/" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <a href="/#about" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <Link href="/search" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            Search
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/weather" className="relative hover:text-[var(--primary)] transition-colors group py-1">
            Weather
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {isAuth && (
            <>
              <Link href="/history" className="relative hover:text-[var(--primary)] transition-colors group py-1">
                History
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/farm" className="relative hover:text-[var(--primary)] transition-colors group py-1">
                My Area
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </>
          )}
        </div>

        {/* Login - Right */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-110 transition-all border border-slate-200 dark:border-slate-700"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>

          {isAuth ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] w-10 h-10 md:w-auto md:px-6 md:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:bg-[var(--primary-dark)]">
                <svg className="w-5 h-5 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="hidden md:inline md:ml-2">Profile</span>
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem("kisan_token");
                  window.dispatchEvent(new Event("auth-change"));
                }}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-red-100 dark:bg-red-900/30 w-10 h-10 md:w-auto md:px-4 md:py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 shadow-md transition-all hover:scale-105 hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden md:inline md:ml-2">Logout</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] w-10 h-10 md:w-auto md:px-6 md:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2">
              <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
              <svg className="w-5 h-5 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4a8 8 0 018-8h4m0 0l-4-4m4 4l-4 4" />
              </svg>
              <span className="hidden md:inline md:ml-2">Login / Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

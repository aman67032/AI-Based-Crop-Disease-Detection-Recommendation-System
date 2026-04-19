"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("kisan_token"));
    checkAuth();
    window.addEventListener("auth-change", checkAuth);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-3 md:py-4"}`}>
      <div className={`max-w-6xl w-full mx-auto flex justify-between items-center rounded-full px-5 md:px-8 py-2.5 md:py-3 mx-4 md:mx-auto transition-all duration-500 ${
        scrolled 
          ? "bg-[var(--cream)]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(92,64,51,0.1)] border border-[var(--gold-light)]/30" 
          : "bg-transparent"
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <img src="/logo(leafscan).png" alt="LeafScan Logo" className="w-10 h-10 object-contain group-hover:scale-110 group-hover:rotate-[12deg] transition-all duration-300" />
          <span className={`font-extrabold text-xl md:text-2xl tracking-tight transition-colors duration-300 font-[family-name:var(--font-outfit)] ${scrolled ? "text-[var(--text)]" : "text-white"}`}>
            Leaf<span className="text-[var(--primary-light)]">Scan</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className={`hidden md:flex gap-6 items-center font-semibold text-[15px] transition-colors duration-300 ${scrolled ? "text-[var(--text-secondary)]" : "text-white/90"}`}>
          <Link href="/" className="relative hover:text-[var(--primary-light)] transition-colors group py-1">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <a href="/#about" className="relative hover:text-[var(--primary-light)] transition-colors group py-1">
            About
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full"></span>
          </a>
          <Link href="/search" className="relative hover:text-[var(--primary-light)] transition-colors group py-1">
            Search
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/weather" className="relative hover:text-[var(--primary-light)] transition-colors group py-1">
            Weather
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          {isAuth && (
            <>
              <Link href="/history" className="relative hover:text-[var(--primary-light)] transition-colors group py-1">
                History
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/farm" className="relative hover:text-[var(--primary-light)] transition-colors group py-1">
                My Area
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--gold)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAuth ? (
            <div className="flex items-center gap-2">
              <div id="google_translate_element" className="mr-2 [&>div]:!h-auto max-w-[120px] md:max-w-none overflow-hidden"></div>
              <Link href="/profile" className="hidden md:inline-flex group relative items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] w-11 h-11 md:w-auto md:px-5 md:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl hover:bg-[var(--primary-dark)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7z" /></svg>
                <span className="hidden md:inline md:ml-2">Profile</span>
              </Link>
              <button 
                onClick={() => {
                  localStorage.removeItem("kisan_token");
                  window.dispatchEvent(new Event("auth-change"));
                }}
                className="w-11 h-11 md:w-auto md:px-4 md:py-2.5 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-sm font-semibold shadow-md transition-all hover:scale-105 hover:bg-red-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="hidden md:inline md:ml-1.5">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div id="google_translate_element" className="mr-2 [&>div]:!h-auto max-w-[120px] md:max-w-none overflow-hidden"></div>
              <Link href="/login" className={`hidden md:inline-flex group relative items-center justify-center overflow-hidden rounded-full w-11 h-11 md:w-auto md:px-6 md:py-2.5 text-sm font-semibold shadow-lg transition-all hover:scale-105 ${
                scrolled 
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]" 
                  : "bg-white/20 text-white border border-white/30 backdrop-blur-md hover:bg-white/30"
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden md:inline md:ml-2">Login</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

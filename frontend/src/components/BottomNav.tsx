"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => setIsAuth(!!localStorage.getItem("kisan_token"));
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const navItems = [
    {
      name: "Home",
      nameHi: "होम",
      path: "/",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Search",
      nameHi: "खोजें",
      path: "/search",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: "Scan",
      nameHi: "स्कैन",
      path: "/scan",
      isFab: true,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: "Weather",
      nameHi: "मौसम",
      path: "/weather",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: isAuth ? "Profile" : "Login",
      nameHi: isAuth ? "प्रोफ़ाइल" : "लॉगिन",
      path: isAuth ? "/profile" : "/login",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      {/* Warm frosted background */}
      <div className="mx-2 mb-2 rounded-3xl bg-[var(--cream)]/95 backdrop-blur-2xl border border-[var(--gold-light)]/30 shadow-[0_-8px_40px_rgba(92,64,51,0.12)]">
        <div className="flex justify-between items-end px-3 py-2">
          {navItems.map((item, i) => {
            const isActive = pathname === item.path || (item.path === "/scan" && pathname === "/scan");

            if (item.isFab) {
              return (
                <div key={i} className="flex flex-col items-center -mt-8">
                  <Link
                    href={item.path}
                    className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-[0_8px_28px_rgba(45,106,79,0.45)] border-[5px] border-[var(--cream)] transform transition-transform active:scale-90 animate-pulse-glow text-white"
                  >
                    {item.icon}
                  </Link>
                  <span className="text-[11px] font-extrabold mt-1.5 text-[var(--primary)] whitespace-nowrap">
                    {item.nameHi}
                  </span>
                </div>
              );
            }

            return (
              <Link key={i} href={item.path} className="flex flex-col items-center justify-end w-16 gap-0.5 py-2">
                <div className={`transition-colors duration-300 ${isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"} whitespace-nowrap`}>
                  {item.nameHi}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WeatherPage() {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          try {
            const res = await fetch(`${API_BASE}/api/weather?lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            
            if (data.current) {
              setWeatherData({
                temperature: data.current.temp,
                humidity: data.current.humidity,
                rainProbability: data.forecast?.[0]?.pop ? Math.round(data.forecast[0].pop * 100) : 0,
                waterSuggestion: data.current.humidity > 70 ? "every 2 days" : "1 time per day",
                condition: data.current.description || "Partly Cloudy",
              });
            }
          } catch (err) {
            console.error("Failed to fetch weather", err);
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Fallback to New Delhi if location denied
          const fetchFallback = async () => {
            try {
              const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
              const res = await fetch(`${API_BASE}/api/weather?lat=28.6139&lon=77.2090`);
              const data = await res.json();
              if (data.current) {
                setWeatherData({
                  temperature: data.current.temp,
                  humidity: data.current.humidity,
                  rainProbability: data.forecast?.[0]?.pop ? Math.round(data.forecast[0].pop * 100) : 0,
                  waterSuggestion: data.current.humidity > 70 ? "every 2 days" : "1 time per day",
                  condition: data.current.description || "Partly Cloudy",
                });
              }
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          };
          fetchFallback();
        }
      );
    }
  }, []);

  return (
    <main className="min-h-screen mesh-bg-warm relative overflow-hidden pt-20 md:pt-28">
      {/* Hero image at top */}
      <div className="absolute top-0 inset-x-0 h-[300px] z-0">
        <img src="/Best%20Organic%20Fertilizers%20for%20Summer%20Growth.webp" alt="Farm field" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-warm)]/80 to-[var(--bg-warm)]" />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12 space-y-8 md:space-y-10 relative z-10 animate-fade-in-up">
        <div className="text-center space-y-3 md:space-y-4">
          <span className="badge badge-earth text-sm">☀️ Live Weather</span>
          <h1 className="text-jumbo text-[var(--text)] tracking-tight">Smart Weather Insights</h1>
          <p className="text-readable max-w-2xl mx-auto">Real-time weather conditions tailored for your farming needs.</p>
          <div className="organic-divider max-w-[80px] mx-auto" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="glass-card h-40 md:h-48 rounded-2xl md:rounded-[2rem]"></div>
            ))}
            <div className="col-span-2 md:col-span-1 glass-card h-40 md:h-48 rounded-2xl md:rounded-[2rem]"></div>
            <div className="col-span-2 md:col-span-3 glass-card h-32 rounded-2xl md:rounded-[2rem]"></div>
          </div>
        ) : weatherData && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {/* Temperature */}
              <div className="card-earth p-5 md:p-8 text-center card-hover group relative overflow-hidden rounded-2xl md:rounded-[2rem]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fef3c7]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--gold-light)]/40 text-[var(--gold-dark)] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-inner">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2">Temperature</h3>
                <div className="text-3xl md:text-5xl font-black text-[var(--text)]">{weatherData.temperature}°C</div>
                <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)] mt-1 md:mt-2">{weatherData.condition}</p>
              </div>

              {/* Humidity */}
              <div className="card-earth p-5 md:p-8 text-center card-hover group relative overflow-hidden rounded-2xl md:rounded-[2rem]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#e0f2fe]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--green-100)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-inner">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2">Humidity</h3>
                <div className="text-3xl md:text-5xl font-black text-[var(--text)]">{weatherData.humidity}%</div>
                <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)] mt-1 md:mt-2">Optimal range</p>
              </div>

              {/* Rain Prediction */}
              <div className="card-earth col-span-2 md:col-span-1 p-5 md:p-8 text-center card-hover group relative overflow-hidden rounded-2xl md:rounded-[2rem]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#e0e7ff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[var(--terracotta-light)]/30 text-[var(--terracotta)] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-inner">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v3m0-3l-2.5 2.5m2.5-2.5l2.5 2.5" /></svg>
                </div>
                <h3 className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1 md:mb-2">Rain Probability</h3>
                <div className="text-3xl md:text-5xl font-black text-[var(--text)]">{weatherData.rainProbability}%</div>
                <p className="text-xs md:text-sm font-medium text-[var(--text-secondary)] mt-1 md:mt-2">Low chance of rain</p>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="card-dark p-6 md:p-12 text-center rounded-2xl md:rounded-[2rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--primary)] via-[var(--gold)] to-[var(--primary)]" />
              <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center shadow-inner mb-1 md:mb-2 animate-float">
                  <span className="text-2xl md:text-3xl">🌱</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-white">Smart Watering Suggestion</h3>
                <p className="text-base md:text-xl text-[var(--green-100)] font-medium max-w-xl">
                  Based on today's weather conditions, we recommend watering your plants <strong className="text-white font-black px-2 py-1 bg-white/20 rounded-lg">{weatherData.waterSuggestion}</strong> to maintain optimal soil moisture.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

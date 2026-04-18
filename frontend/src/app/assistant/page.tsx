"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const TRANSLATIONS: Record<string, any> = {
  en: {
    title: "AI Agronomist Assistant",
    subtitle: "Speak naturally to your personalized farming expert.",
    pressToSpeak: "Press & Hold to Speak",
    listening: "Listening...",
    processing: "Thinking...",
    error: "Sorry, I couldn't hear you. Please try again.",
    back: "Back to Home",
    greeting: "Hello! I am your AI Agronomist. How can I help you with your crops today?"
  },
  hi: {
    title: "AI कृषि विशेषज्ञ",
    subtitle: "अपने व्यक्तिगत कृषि विशेषज्ञ से स्वाभाविक रूप से बात करें।",
    pressToSpeak: "बोलने के लिए दबाकर रखें",
    listening: "सुन रहा हूँ...",
    processing: "सोच रहा हूँ...",
    error: "क्षमा करें, मैं आपको सुन नहीं पाया। कृपया पुनः प्रयास करें।",
    back: "होम पर वापस जाएं",
    greeting: "नमस्ते! मैं आपका AI कृषि विशेषज्ञ हूँ। आज मैं आपकी फसलों के साथ कैसे मदद कर सकता हूँ?"
  }
};

export default function AssistantPage() {
  const [lang, setLang] = useState("en");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const savedLang = localStorage.getItem("leaf_scan_lang") || "en";
    setLang(savedLang);

    // Initialize Web Speech API for STT
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError("");
        setTranscript("");
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setError(TRANSLATIONS[savedLang].error);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        // If we have a final transcript, process it
        if (transcriptRef.current) {
          handleAskAI(transcriptRef.current);
        }
      };
    } else {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    }
  }, []);

  // Use a ref to keep track of the latest transcript for the onend callback
  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Update language of recognition when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-US";
    }
  }, [lang]);

  const handleStartListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      try {
        setResponse("");
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleAskAI = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/assistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          language: lang,
          context: "General farming advice" // You could pass recent scan history here
        })
      });
      
      if (!res.ok) throw new Error("Failed to get answer");
      
      const data = await res.json();
      setResponse(data.answer);
      speakText(data.answer);
    } catch (err) {
      console.error(err);
      setError("Could not connect to AI. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === "hi" ? "hi-IN" : "en-US";
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <main className="min-h-screen mesh-bg py-8 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background rings when listening */}
      {isListening && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-64 h-64 border-4 border-emerald-400/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-4 border-emerald-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      )}

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
           <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all font-bold mb-4">
              <span className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">←</span>
              {t.back}
           </Link>
           <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
             <span className="text-emerald-600">AI</span> {t.title.replace('AI ', '')}
           </h1>
           <p className="text-lg text-slate-600 font-medium">{t.subtitle}</p>
        </div>

        {/* Chat / Interaction Area */}
        <div className="glass p-8 rounded-3xl border-2 border-white shadow-2xl min-h-[300px] flex flex-col justify-end space-y-6 bg-white/60">
          
          {/* AI Response Bubble */}
          <div className="flex gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xl shadow-lg">🤖</div>
             <div className="bg-white p-5 rounded-3xl rounded-tl-none shadow-sm border border-slate-100 flex-1">
                <p className="text-slate-800 font-medium text-lg leading-relaxed">
                   {response || t.greeting}
                </p>
             </div>
          </div>

          {/* User Input Bubble (shows while talking) */}
          {transcript && (
             <div className="flex gap-4 justify-end animate-fade-in-up">
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl rounded-tr-none shadow-sm max-w-[80%]">
                   <p className="text-emerald-900 font-medium">{transcript}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xl shadow-lg">🧑‍🌾</div>
             </div>
          )}

          {error && (
             <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center border border-red-100">
               ⚠️ {error}
             </div>
          )}
        </div>

        {/* Microphone Button Area */}
        <div className="flex flex-col items-center gap-4 pt-8">
           <button
             onMouseDown={handleStartListening}
             onMouseUp={handleStopListening}
             onMouseLeave={handleStopListening}
             onTouchStart={handleStartListening}
             onTouchEnd={handleStopListening}
             disabled={isProcessing}
             className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-2xl transition-all select-none
               ${isListening ? 'bg-red-500 scale-95 shadow-red-500/50' : 
                 isProcessing ? 'bg-slate-200 animate-pulse text-2xl' : 
                 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105 shadow-emerald-500/40'}`}
           >
             {isProcessing ? '⏳' : isListening ? '🎙️' : '🎤'}
           </button>
           <p className={`font-black tracking-widest uppercase text-sm ${isListening ? 'text-red-500' : 'text-slate-400'}`}>
             {isProcessing ? t.processing : isListening ? t.listening : t.pressToSpeak}
           </p>
        </div>

      </div>
    </main>
  );
}

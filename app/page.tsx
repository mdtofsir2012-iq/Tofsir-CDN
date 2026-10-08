"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter, JetBrains_Mono } from "next/font/google";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap" });

const HighlightedHeroCode = () => (
  <span>
    curl -X <span className="text-[#2563EB]">POST</span>{" "}
    <span className="text-[#E5E5E5]/90">
      https://imgstorage1.vercel.app/api/v1/upload
    </span>{" "}
    \ <br />
    {"  "}-H{" "}
    <span className="text-[#E5E5E5]/90">"x-api-key: your_api_key_here"</span>{" "}
    \ <br />
    {"  "}-F <span className="text-[#E5E5E5]/90">"image=@media.mp4"</span>
    <br />
    <br />
    <span className="text-[#E5E5E5]/35">// Response</span>
    <br />
    {"{"}
    <br />
    <span className="text-[#E5E5E5]/60"> "success"</span>:{" "}
    <span className="text-[#2563EB]">true</span>,<br />
    <span className="text-[#E5E5E5]/60"> "url"</span>:{" "}
    <span className="text-[#E5E5E5]/90">
      "https://imgstorage1.vercel.app/i/abc123"
    </span>
    ,<br />
    <span className="text-[#E5E5E5]/60"> "id"</span>:{" "}
    <span className="text-[#E5E5E5]/90">"abc123"</span>
    <br />
    {"}"}
  </span>
);

const HighlightedJSON = () => (
  <span>
    <span className="text-[#E5E5E5]/35">// Response</span>
    <br />
    {"{"}
    <br />
    <span className="text-[#E5E5E5]/60"> "success"</span>:{" "}
    <span className="text-[#2563EB]">true</span>,<br />
    <span className="text-[#E5E5E5]/60"> "url"</span>:{" "}
    <span className="text-[#E5E5E5]/90">
      "https://imgstorage1.vercel.app/i/abc123"
    </span>
    ,<br />
    <span className="text-[#E5E5E5]/60"> "id"</span>:{" "}
    <span className="text-[#E5E5E5]/90">"abc123"</span>
    <br />
    {"}"}
  </span>
);

const HighlightedJS = () => (
  <span>
    <span className="text-[#2563EB]">const</span> uploadMedia ={" "}
    <span className="text-[#2563EB]">async</span> (file) ={">"} {"{"}
    <br />
    {"  "}
    <span className="text-[#2563EB]">const</span> formData ={" "}
    <span className="text-[#2563EB]">new</span> FormData();
    <br />
    {"  "}formData.append(<span className="text-[#E5E5E5]/90">'image'</span>,
    file);
    <br />
    <br />
    {"  "}
    <span className="text-[#2563EB]">const</span> res ={" "}
    <span className="text-[#2563EB]">await</span> fetch(
    <span className="text-[#E5E5E5]/90">
      'https://imgstorage1.vercel.app/api/v1/upload'
    </span>
    , {"{"}
    <br />
    {"    "}method: <span className="text-[#E5E5E5]/90">'POST'</span>,<br />
    {"    "}headers: {"{"}
    <br />
    {"      "}
    <span className="text-[#E5E5E5]/90">'x-api-key'</span>:{" "}
    <span className="text-[#E5E5E5]/90">'your_api_key'</span>
    <br />
    {"    }"},<br />
    {"    "}body: formData
    <br />
    {"  }"});
    <br />
    <br />
    {"  "}
    <span className="text-[#2563EB]">return</span>{" "}
    <span className="text-[#2563EB]">await</span> res.json();
    <br />
    {"}"}
  </span>
);

const HighlightedPython = () => (
  <span>
    <span className="text-[#2563EB]">import</span> requests
    <br />
    <br />
    <span className="text-[#2563EB]">def</span> upload_media(file_path):
    <br />
    {"    "}
    <span className="text-[#2563EB]">with</span> open(file_path,{" "}
    <span className="text-[#E5E5E5]/90">'rb'</span>){" "}
    <span className="text-[#2563EB]">as</span> f:
    <br />
    {"        "}files = {"{"}
    <span className="text-[#E5E5E5]/90">'image'</span>: f{"}"}
    <br />
    {"        "}headers = {"{"}
    <span className="text-[#E5E5E5]/90">'x-api-key'</span>:{" "}
    <span className="text-[#E5E5E5]/90">'your_api_key'</span>
    {"}"}
    <br />
    <br />
    {"        "}res = requests.post(
    <br />
    {"            "}
    <span className="text-[#E5E5E5]/90">
      'https://imgstorage1.vercel.app/api/v1/upload'
    </span>
    ,<br />
    {"            "}headers=headers,
    <br />
    {"            "}files=files
    <br />
    {"        "})<br />
    <br />
    {"        "}
    <span className="text-[#2563EB]">return</span> res.json()
  </span>
);

const HighlightedCurl = () => (
  <span>
    curl -X <span className="text-[#2563EB]">POST</span>{" "}
    <span className="text-[#E5E5E5]/90">
      https://imgstorage1.vercel.app/api/v1/upload
    </span>{" "}
    \ <br />
    {"  "}-H{" "}
    <span className="text-[#E5E5E5]/90">"x-api-key: your_api_key"</span>{" "}
    \ <br />
    {"  "}-F <span className="text-[#E5E5E5]/90">"image=@media.mp4"</span>
  </span>
);

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("javascript");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [isScrolled, setIsScrolled] = useState(false);

  // Security PIN states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              const next = new Set(prev);
              next.add(entry.target.id);
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    setIsVerifying(true);
    setPinError("");

    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCode.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Access Granted!");
        setShowPinModal(false);
        router.push("/dashboard");
      } else {
        setPinError(data.error || "Incorrect PIN");
      }
    } catch (err) {
      setPinError("Failed to verify PIN");
    } finally {
      setIsVerifying(false);
    }
  };

  const faqs = [
    {
      question: "Is this storage really free?",
      answer:
        "Yes. By utilizing Telegram's infrastructure for storage, we avoid traditional cloud storage costs and pass those savings entirely to developers. You only pay for your own deployment server.",
    },
    {
      question: "What media formats are supported?",
      answer:
        "We support a wide range of formats! Images: JPEG, JPG, PNG, WebP, GIF, AVIF, APNG, ICO. Videos: MP4. Audio: MP3, WAV, OGG, M4A, AAC.",
    },
    {
      question: "Are there file size limits?",
      answer:
        "Yes, to ensure fast performance and adhere to infrastructure limits: Images are capped at 10MB, while Videos and Audio files are capped at 20MB per file.",
    },
    {
      question: "How do the built-in media players work?",
      answer:
        "When a video or audio file is clicked in the dashboard, it opens in a custom-built, premium player. The video player supports speed controls, PiP, and volume. The audio player features a live visualizer that reacts to the music beats!",
    },
    {
      question: "How is the dashboard secured?",
      answer:
        "Your admin dashboard is fully secured by a custom PIN code. This PIN is stored securely in Firebase/Env and is required to access the dashboard, view files, or manage API keys.",
    },
    {
      question: "How do I use the API?",
      answer:
        "Once logged into the dashboard, you can generate scoped API keys. You can even use the built-in 'API Key Tester' sandbox to safely test uploads, fetching, and deleting without writing a single line of code.",
    },
  ];

  const features = [
    {
      title: "Universal Media Support",
      desc: "Upload images, stream MP4 videos, and play audio files seamlessly. All handled by a single unified API endpoint.",
    },
    {
      title: "Premium Media Players",
      desc: "Built-in custom video and audio players. Featuring cinematic widescreen video and a live beat-reactive audio visualizer.",
    },
    {
      title: "PIN-Secured Dashboard",
      desc: "Your files and API keys are safe. Access to the admin panel is strictly locked behind a customizable security PIN.",
    },
    {
      title: "Interactive API Sandbox",
      desc: "Test your API keys, upload media, and manage files directly through our interactive dashboard API Tester.",
    },
    {
      title: "Real-time Upload Progress",
      desc: "Watch true 0-100% network-level upload progress tracking right in the dashboard, backed by SSE streaming.",
    },
    {
      title: "Free Forever",
      desc: "Zero storage limits, zero bandwidth fees, and no credit card required. Powered entirely by Telegram's infrastructure.",
    },
  ];

  return (
    <div
      className={`min-h-screen text-[1.05rem] selection:bg-[#2563EB]/30 selection:text-[#E5E5E5] ${inter.className}`}
      style={{ backgroundColor: "#0A0A0A", color: "#E5E5E5" }}
    >
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s infinite ease-out;
        }
        @keyframes slowHeroGlow {
          0% { opacity: 0.06; }
          50% { opacity: 0.12; }
          100% { opacity: 0.06; }
        }
        .animate-slow-glow {
          animation: slowHeroGlow 4s infinite ease-in-out;
        }
        .mono-font {
          font-family: ${mono.style.fontFamily}, monospace;
        }
        h2 { font-weight: 700 !important; }
      `}</style>

      {/* Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Access Dashboard</h3>
            <p className="text-sm text-[#888] mb-6">Enter your security PIN to access the dashboard.</p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors font-mono tracking-widest text-center text-lg"
                  autoFocus
                />
                {pinError && <p className="text-red-400 text-xs mt-2 text-center">{pinError}</p>}
              </div>
              <button
                type="submit"
                disabled={isVerifying || !pinCode}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Access'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. NAVBAR */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-[#0A0A0A]/85 backdrop-blur-[12px] border-b border-[#E5E5E5]/10" : "bg-transparent border-b border-transparent"}`}
      >
        <nav className="px-6 py-4 flex items-center justify-between max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-[#E5E5E5]">
              Tofsir CDN
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#E5E5E5]/80">
            <Link
              href="#docs"
              className="hover:text-[#E5E5E5] transition-colors duration-200"
            >
              Docs
            </Link>
            <Link
              href="https://youtube.com/@b4uffeu?si=6ryK2Jxn6rKslbJ0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E5E5E5] transition-colors duration-200"
            >
              YouTube
            </Link>
          </div>
          <button
            onClick={() => setShowPinModal(true)}
            className="bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-[#2563EB]/90 transition-colors duration-200 border border-[#2563EB]"
          >
            Dashboard Login &rarr;
          </button>
        </nav>
      </header>

      {/* 2. HERO SECTION */}
      {/* Ambient animated glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#2563EB] rounded-full blur-[120px] pointer-events-none -z-10 animate-slow-glow"></div>

      <section className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-[100px] flex flex-col md:flex-row items-center gap-16 relative">
        <div className="flex-1 w-full text-left">
          <div className="inline-flex items-center gap-2 border border-[#E5E5E5]/20 border-l-[3px] border-l-[#2563EB] rounded-full px-4 py-1.5 text-xs font-medium text-[#E5E5E5]/80 mb-8 bg-[#E5E5E5]/5">
            <span className="text-[#2563EB]">⚡</span> v2.0 - Media, Video & Audio Support Added!
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.03em] text-[#E5E5E5] mb-6 leading-[1.1]">
            Serverless Media <br /> Storage API
          </h1>
          <p className="text-lg md:text-xl text-[#E5E5E5]/70 max-w-xl mb-10 leading-[1.8] font-light">
            Securely upload, store, and stream Images, Videos, and Audio via Telegram's infrastructure. Features custom media players, live upload tracking, and a PIN-secured dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <button
              onClick={() => setShowPinModal(true)}
              className="bg-white text-black px-8 py-3.5 rounded-md font-medium hover:bg-[#2563EB]/90 transition-colors duration-200 border border-[#2563EB]"
            >
              Access Dashboard &rarr;
            </button>
            <Link
              href="#docs"
              className="bg-transparent text-[#E5E5E5] px-8 py-3.5 rounded-md font-medium border border-[#E5E5E5]/30 hover:border-[#E5E5E5]/60 transition-colors duration-200"
            >
              View API Docs
            </Link>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#E5E5E5]/10 mono-font text-xs text-[#E5E5E5]/50">
            <div>Multi-Format Support</div>
            <div className="w-px h-4 bg-[#E5E5E5]/20"></div>
            <div>Built-in Media Players</div>
            <div className="w-px h-4 bg-[#E5E5E5]/20"></div>
            <div>Secured by PIN</div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg">
          <div className="border border-[#E5E5E5]/10 border-l-[3px] border-l-[#2563EB]/30 rounded-lg p-6 bg-[#0A0A0A] shadow-[0_0_40px_-10px_rgba(229,229,229,0.05)] relative overflow-hidden">
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-[#E5E5E5]/20"></div>
              <div className="w-3 h-3 rounded-full bg-[#E5E5E5]/20"></div>
              <div className="w-3 h-3 rounded-full bg-[#E5E5E5]/20"></div>
            </div>
            <p className="text-[#E5E5E5]/50 text-xs mb-3 mono-font">
              POST /api/v1/upload
            </p>
            <pre className="text-sm mono-font text-[#E5E5E5] overflow-x-auto whitespace-pre-wrap leading-[1.6]">
              <HighlightedHeroCode />
            </pre>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-[1200px] mx-auto px-6 py-[100px] border-t border-[#E5E5E5]/10">
        <div className="mb-16">
          <h2 className="text-3xl tracking-tight mb-4 text-[#E5E5E5]">
            How it works
          </h2>
          <p className="text-[#E5E5E5]/60 text-lg leading-[1.8]">
            Three simple steps to secure, universal media hosting.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-[#2563EB]/50 to-transparent z-0"></div>

          {[
            {
              step: "01",
              title: "Login via PIN",
              desc: "Enter your admin PIN to securely access the dashboard. Create specific API keys for your applications.",
            },
            {
              step: "02",
              title: "Upload Media",
              desc: "POST images, MP4s, or Audio files directly to our API. See real-time upload progress in the dashboard.",
            },
            {
              step: "03",
              title: "Stream & Play",
              desc: "Receive a permanent URL instantly. View files using our beautiful, built-in custom video and audio players.",
            },
          ].map((item, i) => (
            <div
              key={i}
              id={`step-${i}`}
              className={`relative z-10 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-${i * 200} ${visibleItems.has(`step-${i}`) ? "opacity-100 translate-y-0" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] border border-[#2563EB] flex items-center justify-center text-[#2563EB] font-bold mb-6 text-sm">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#E5E5E5]">
                {item.title}
              </h3>
              <p className="text-[#E5E5E5]/60 leading-[1.8] font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CODE EXAMPLES */}
      <section
        id="docs"
        className="bg-[#111111] border-y border-[#E5E5E5]/10 py-[100px]"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl tracking-tight mb-4 text-[#E5E5E5]">
              Developer first
            </h2>
            <p className="text-[#E5E5E5]/60 text-lg leading-[1.8]">
              Integrate in minutes using standard HTTP clients.
            </p>
          </div>

          <div className="border border-[#E5E5E5]/10 rounded-lg bg-[#0A0A0A] overflow-hidden flex flex-col md:flex-row">
            {/* Tabs */}
            <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-[#E5E5E5]/10 bg-[#161616] p-2 flex flex-row md:flex-col gap-1 overflow-x-auto">
              {[
                { id: "javascript", label: "Node.js / JS" },
                { id: "python", label: "Python" },
                { id: "curl", label: "cURL" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm text-left rounded whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-[#2563EB]/10 text-[#2563EB] font-medium"
                      : "text-[#E5E5E5]/60 hover:text-[#E5E5E5] hover:bg-[#E5E5E5]/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Display */}
            <div className="flex-1 p-6 overflow-x-auto">
              <pre className="text-sm mono-font text-[#E5E5E5] leading-[1.6]">
                {activeTab === "javascript" && <HighlightedJS />}
                {activeTab === "python" && <HighlightedPython />}
                {activeTab === "curl" && <HighlightedCurl />}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 5. API REFERENCE COMPACT */}
      <section id="api" className="max-w-[1200px] mx-auto px-6 py-[100px]">
        <div className="mb-12">
          <h2 className="text-3xl tracking-tight mb-4 text-[#E5E5E5]">
            API Reference
          </h2>
          <p className="text-[#E5E5E5]/60 text-lg leading-[1.8]">
            Everything you need to know about the upload endpoint.
          </p>
        </div>

        <div className="border border-[#E5E5E5]/10 rounded-lg overflow-hidden bg-[#0A0A0A]">
          <div className="border-b border-[#E5E5E5]/10 px-6 py-4 bg-[#161616] flex items-center gap-3">
            <span className="bg-[#2563EB]/20 text-[#2563EB] px-2 py-1 rounded text-xs font-bold mono-font">
              POST
            </span>
            <span className="text-[#E5E5E5] font-medium mono-font">
              /api/v1/upload
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-sm font-semibold text-[#E5E5E5] mb-4 uppercase tracking-wider">
                Headers
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-[#E5E5E5]/10 pb-4">
                  <span className="mono-font text-[#2563EB] text-sm">
                    x-api-key
                  </span>
                  <span className="text-[#E5E5E5]/60 text-sm">Required</span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-[#E5E5E5] mt-8 mb-4 uppercase tracking-wider">
                Body (multipart/form-data)
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#E5E5E5]/10 pb-4">
                  <div>
                    <span className="mono-font text-[#2563EB] text-sm block">
                      image
                    </span>
                    <span className="text-[#E5E5E5]/40 text-xs">File object (Image, Audio, or Video)</span>
                  </div>
                  <span className="text-[#E5E5E5]/60 text-sm">Required</span>
                </div>
              </div>
              <p className="text-xs text-[#E5E5E5]/40 mt-4 italic">
                * Max file size: 10MB (Images), 20MB (Video/Audio).
              </p>
            </div>

            <div className="bg-[#111111] p-5 rounded-md border border-[#E5E5E5]/10">
              <h4 className="text-xs font-semibold text-[#E5E5E5]/40 mb-3 uppercase tracking-wider">
                Success Response (200 OK)
              </h4>
              <pre className="text-sm mono-font text-[#E5E5E5] whitespace-pre-wrap">
                <HighlightedJSON />
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURES GRID */}
      <section className="bg-[#111111] border-y border-[#E5E5E5]/10 py-[100px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl tracking-tight mb-4 text-[#E5E5E5]">
              Engineered for versatility
            </h2>
            <p className="text-[#E5E5E5]/60 text-lg max-w-2xl mx-auto leading-[1.8]">
              We handled the complex infrastructure routing so you can focus on
              building your product.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-[#0A0A0A] border border-[#E5E5E5]/10 p-8 rounded-lg hover:border-[#2563EB]/40 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-md bg-[#2563EB]/10 flex items-center justify-center mb-6">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#E5E5E5] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#E5E5E5]/60 text-sm leading-[1.8] font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="max-w-[800px] mx-auto px-6 py-[100px] border-t border-[#E5E5E5]/10">
        <h2 className="text-3xl tracking-tight mb-12 text-center text-[#E5E5E5]">
          FAQ
        </h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-[#E5E5E5]/10 rounded-lg overflow-hidden bg-[#0A0A0A]"
              >
                <button
                  className={`w-full text-left px-6 py-5 font-semibold flex justify-between items-center focus:outline-none transition-colors duration-200 ${isOpen ? "text-[#E5E5E5]" : "text-[#E5E5E5]/80"}`}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  {faq.question}
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#2563EB]" : "text-[#E5E5E5]/50"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="px-6 pb-5 text-[#E5E5E5]/60 font-light leading-[1.8]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="max-w-[1200px] mx-auto px-6 py-[140px] text-center border-t border-[#E5E5E5]/10">
        <h2 className="text-4xl md:text-5xl tracking-tight mb-6 text-[#E5E5E5] font-bold">
          Start hosting your media in minutes
        </h2>
        <p className="text-lg text-[#E5E5E5]/60 mb-10 font-light max-w-lg mx-auto leading-[1.8]">
          Skip the payment details context switch. Login to your secure dashboard and generate an API key today.
        </p>
        <button
          onClick={() => setShowPinModal(true)}
          className="animate-pulse-glow bg-white text-black px-10 py-4 rounded-md text-lg font-medium hover:bg-[#2563EB]/90 transition-colors duration-200 inline-block border border-[#2563EB]"
        >
          Access Dashboard &rarr;
        </button>
        <p className="mt-6 text-sm text-[#E5E5E5]/40 mono-font">
          Takes less than 60 seconds · Free forever
        </p>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-[#E5E5E5]/10">
        <div className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E5E5E5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-[#E5E5E5]">
              Tofsir CDN
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-[#E5E5E5]/60">
            <Link
              href="#docs"
              className="hover:text-[#E5E5E5] transition-colors duration-200"
            >
              Docs
            </Link>
            <Link
              href="#api"
              className="hover:text-[#E5E5E5] transition-colors duration-200"
            >
              API Reference
            </Link>
            <Link
              href="https://youtube.com/@b4uffeu?si=6ryK2Jxn6rKslbJ0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E5E5E5] transition-colors duration-200"
            >
              YouTube
            </Link>
            <Link
              href="#status"
              className="hover:text-[#E5E5E5] transition-colors duration-200"
            >
              Status
            </Link>
          </div>

          <div className="text-xs text-[#E5E5E5]/40 text-center md:text-right flex flex-col gap-2 tracking-tighter">
            <p className="mono-font text-[#E5E5E5]/30">
              Built with Next.js · Prisma · NeonDB · Telegram
            </p>
            <p>&copy; {new Date().getFullYear()} MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

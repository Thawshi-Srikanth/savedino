"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "./components/Header";
import { HelpModal } from "./components/HelpModal";
import { audioSynth } from "./components/AudioSynthesizer";

// Dynamically import DinoGameCanvas with SSR disabled
const DinoGameCanvas = dynamic(
  () => import("./components/DinoGameCanvas").then((mod) => mod.DinoGameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[600px] h-[225px] flex flex-col items-center justify-center gap-3 select-none">
        <div
          className="w-11 h-12"
          style={{
            backgroundImage: "url('/offline-sprite-1x.png')",
            backgroundPosition: "-40px -2px",
            backgroundRepeat: "no-repeat",
            imageRendering: "pixelated",
          }}
        />
        <span className="font-pixel text-[9px] text-muted-foreground tracking-wider uppercase animate-pulse">
          READY...
        </span>
      </div>
    ),
  }
);

export default function Home() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isNight, setIsNight] = useState<boolean>(false);
  const [devNightOverride, setDevNightOverride] = useState<boolean | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState<number>(0);

  useEffect(() => {
    setMounted(true);

    // Sync from local storage
    const savedTheme = localStorage.getItem("savedino_theme");
    if (savedTheme === "dark") {
      setIsNight(true);
    }

    // Start background theme audio
    audioSynth.startMusic();

    const handleFirstGesture = () => {
      audioSynth.startMusic();
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };

    window.addEventListener("pointerdown", handleFirstGesture);
    window.addEventListener("keydown", handleFirstGesture);

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
    };
  }, []);

  // Sync night-mode and dark class to document for seamless whole-page dark mode
  useEffect(() => {
    if (!mounted) return;
    if (isNight) {
      document.documentElement.classList.add("night-mode");
      document.documentElement.classList.add("dark");
      localStorage.setItem("savedino_theme", "dark");
    } else {
      document.documentElement.classList.remove("night-mode");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("savedino_theme", "light");
    }
  }, [isNight, mounted]);

  const handleToggleMute = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleScoreUpdate = (currentScore: number, hi: number, destroyed: number) => {
    setScore(currentScore);
    setHighScore(hi);
    setMeteorsDestroyed(destroyed);
  };

  const effectiveNight = devNightOverride !== null ? devNightOverride : isNight;
  const nightActive = mounted && effectiveNight;

  return (
    <main
      className={`min-h-[100dvh] flex flex-col items-center justify-between pb-3 sm:pb-12 px-2.5 sm:px-8 select-none overscroll-none transition-colors duration-700 ease-in-out ${
        nightActive ? "bg-[#020617] text-[#f8fafc]" : "bg-[#f8fafc] text-[#0f172a]"
      }`}
    >
      {/* Header */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isNight={nightActive}
        onToggleTheme={() => {
          const nextNight = devNightOverride !== null ? !devNightOverride : !isNight;
          setDevNightOverride(nextNight);
          setIsNight(nextNight);
        }}
      />

      {/* Main Game Stage */}
      <div className="w-full max-w-[600px] flex flex-col items-center justify-center my-auto py-1 sm:py-2">
        <DinoGameCanvas
          onScoreUpdate={handleScoreUpdate}
          onNightModeChange={setIsNight}
          nightModeOverride={devNightOverride}
        />

        {/* PostHog Highlight Styled Section */}
        <div className="w-full mt-3 sm:mt-8 text-left select-text transition-colors duration-700">
          <h2
            className={`text-base sm:text-lg font-pixel font-bold tracking-wide uppercase transition-colors duration-700 ${
              nightActive ? "text-[#f8fafc]" : "text-[#0f172a]"
            }`}
          >
            IASC Asteroid Search Campaign
          </h2>

          <p
            className={`text-xs font-mono mt-3 mb-3 transition-colors duration-700 ${
              nightActive ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Join <span className="posthog-violet-highlight font-bold">500,000+ teams</span> discovering new main-belt asteroids with NASA & IASC.
          </p>

          <ul
            className={`font-mono space-y-2 text-xs sm:text-[13px] pl-1 leading-relaxed transition-colors duration-700 ${
              nightActive ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <li className="flex items-center gap-2">
              <span className="text-[#10b981] font-bold">✓</span>
              <span>Real astronomical FITS image processing</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10b981] font-bold">✓</span>
              <span>Submit preliminary discovery reports to MPC</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#10b981] font-bold">✓</span>
              <span>Collaborate with global university & school teams</span>
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-md bg-[#8b5cf6] text-white border border-[#6d28d9] shadow-[0_3px_0_0_#6d28d9] hover:bg-[#7c3aed] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              <span>Explore Campaigns &gt;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="w-full max-w-[600px] pt-4 pb-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-4 bg-[#8b5cf6] rounded-xs transform -skew-x-12" />
          <div className="w-2 h-4 bg-[#10b981] rounded-xs transform -skew-x-12" />
          <div className="w-2 h-4 bg-[#38bdf8] rounded-xs transform -skew-x-12" />
          <span className="font-bold text-foreground ml-1">SaveDino</span>
        </div>
        <span>Powered by Next.js & Prisma</span>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

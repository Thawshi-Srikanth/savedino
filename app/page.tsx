"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "./components/Header";
import { HelpModal } from "./components/HelpModal";
import { audioSynth } from "./components/AudioSynthesizer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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
      audioSynth.pauseMusic();
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
      className={`h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-between pt-2 sm:pt-4 pb-2 sm:pb-4 px-4 sm:px-8 select-none overscroll-none transition-colors duration-700 ease-in-out ${
        nightActive ? "bg-[#121315] text-[#f3f4f6]" : "bg-[#f8fafc] text-[#0f172a]"
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
      <div className="w-full max-w-[600px] flex flex-col items-center justify-center my-auto py-1 px-2 sm:px-0">
        <DinoGameCanvas
          onScoreUpdate={handleScoreUpdate}
          onNightModeChange={setIsNight}
          nightModeOverride={devNightOverride}
        />

        {/* Chrome Dino Style "Page Not Found / No Internet" Section */}
        <div className="w-full mt-4 sm:mt-4 text-left select-text transition-colors duration-700 space-y-1 px-3 sm:px-4">
          <h2 className="text-sm sm:text-base font-pixel font-bold tracking-wide uppercase text-foreground">
            No Campaign Joined
          </h2>

          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            ERR_ASTEROID_CAMPAIGN_OFFLINE
          </p>

          <p className="text-[11px] font-mono font-bold text-foreground pt-1">
            Try:
          </p>

          <ul className="font-mono space-y-1 text-xs text-muted-foreground pl-1 leading-relaxed">
            <li className="flex items-center gap-2">
              <Check className="size-3.5 text-[#10b981] shrink-0" />
              <span>Forming an IASC asteroid search team</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-3.5 text-[#10b981] shrink-0" />
              <span>Analyzing telescope FITS image sets</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-3.5 text-[#10b981] shrink-0" />
              <span>Submitting discovery reports to MPC</span>
            </li>
          </ul>

          <div className="pt-2 flex items-center gap-3">
            <Link href="/campaigns">
              <Button size="sm" variant="default" className="text-xs font-bold">
                <span>Explore Campaigns &gt;</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

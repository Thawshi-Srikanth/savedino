"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "./components/Header";
import { HelpModal } from "./components/HelpModal";
import { audioSynth } from "./components/AudioSynthesizer";
import { Button } from "@/components/ui/button";

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
      className={`h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-between pb-2 sm:pb-4 px-2.5 sm:px-6 select-none overscroll-none transition-colors duration-700 ease-in-out ${
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
      <div className="w-full max-w-[600px] flex flex-col items-center justify-center my-auto py-1">
        <DinoGameCanvas
          onScoreUpdate={handleScoreUpdate}
          onNightModeChange={setIsNight}
          nightModeOverride={devNightOverride}
        />

        {/* Compact, Non-Distracting PostHog Info Strip */}
        <div className="w-full mt-2 sm:mt-4 p-3 rounded-lg border border-border bg-card text-left transition-colors duration-700 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[10px] sm:text-xs font-pixel font-bold tracking-wider uppercase text-foreground">
              IASC Asteroid Search
            </h2>
            <Link href="/campaigns">
              <Button size="sm" variant="default" className="text-[10px] h-7 px-3 font-bold">
                <span>Campaigns &gt;</span>
              </Button>
            </Link>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground leading-tight">
            Discover main-belt asteroids with NASA & IASC astronomical FITS image processing.
          </p>
        </div>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

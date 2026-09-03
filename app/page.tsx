"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DinoGameCanvas } from "./components/DinoGameCanvas";
import { HelpModal } from "./components/HelpModal";
import { audioSynth } from "./components/AudioSynthesizer";

export default function Home() {
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isNight, setIsNight] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState<number>(0);

  // Always play theme music the moment page loads
  useEffect(() => {
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

  // Sync night-mode class to document for seamless whole-page dark mode
  useEffect(() => {
    if (isNight) {
      document.documentElement.classList.add("night-mode");
      document.body.classList.add("night-mode");
    } else {
      document.documentElement.classList.remove("night-mode");
      document.body.classList.remove("night-mode");
    }
  }, [isNight]);

  const handleToggleMute = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleScoreUpdate = (currentScore: number, hi: number, destroyed: number) => {
    setScore(currentScore);
    setHighScore(hi);
    setMeteorsDestroyed(destroyed);
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-between pb-12 px-4 sm:px-8 select-none transition-colors duration-700 ease-in-out ${
        isNight ? "bg-[#202124] text-[#e8eaed]" : "bg-[#f4f4f4] text-[#535353]"
      }`}
    >
      {/* Header */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isNight={isNight}
      />

      {/* Main Game Stage */}
      <div className="w-full max-w-[600px] flex flex-col items-center justify-center my-auto py-2">
        <DinoGameCanvas
          onScoreUpdate={handleScoreUpdate}
          onNightModeChange={setIsNight}
        />

        {/* Chrome Error Style "Coming Soon" Section (Dynamic Day/Night Theme) */}
        <div className="w-full mt-10 text-left select-text transition-colors duration-700">
          <h2
            className={`text-base sm:text-lg font-pixel font-bold tracking-wide uppercase transition-colors duration-700 ${
              isNight ? "text-[#ffffff]" : "text-[#202124]"
            }`}
          >
            Coming Soon
          </h2>

          <p
            className={`text-xs font-pixel mt-5 mb-3 transition-colors duration-700 ${
              isNight ? "text-[#9aa0a6]" : "text-[#535353]"
            }`}
          >
            Stay :
          </p>

          <ul
            className={`font-tech space-y-2 text-xs sm:text-[13px] pl-1 leading-relaxed transition-colors duration-700 ${
              isNight ? "text-[#e8eaed]" : "text-[#535353]"
            }`}
          >
            <li className="flex items-center gap-2.5">
              <span
                className={`w-1.5 h-1.5 inline-block flex-shrink-0 transition-colors duration-700 ${
                  isNight ? "bg-[#9aa0a6]" : "bg-[#535353]"
                }`}
              ></span>
              <span>Curious about Asteroids ?</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span
                className={`w-1.5 h-1.5 inline-block flex-shrink-0 transition-colors duration-700 ${
                  isNight ? "bg-[#9aa0a6]" : "bg-[#535353]"
                }`}
              ></span>
              <span>Gather your team now</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 bg-[#0284c7] inline-block flex-shrink-0"></span>
              <span
                className={`hover:underline cursor-pointer font-bold transition-colors duration-700 ${
                  isNight ? "text-[#38bdf8]" : "text-[#0284c7]"
                }`}
              >
                Initiating Asteroid Searching Campaign 2026
              </span>
            </li>
          </ul>

          <div
            className={`mt-8 font-tech text-[11px] sm:text-xs tracking-widest uppercase font-bold transition-colors duration-700 ${
              isNight ? "text-[#9aa0a6]" : "text-[#70757a]"
            }`}
          >
            ASTEROID_SEARCHING_CAMPAIGN
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`text-center text-[11px] font-tech select-none space-y-1 mt-12 transition-colors duration-700 ${
          isNight ? "text-[#80868b]" : "text-[#70757a]"
        }`}
      >
        <p
          className={`font-pixel text-[10px] uppercase transition-colors duration-700 ${
            isNight ? "text-[#e8eaed]" : "text-[#535353]"
          }`}
        >
          SAVE DINO — ASTEROID DEFENSE
        </p>
        <p className="text-[10px]">
          Chrome Dino with Laser Cannon & Falling Asteroids
        </p>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

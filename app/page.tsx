"use client";

import React, { useState } from "react";
import { Header } from "./components/Header";
import { LottieSplash } from "./components/LottieSplash";
import { DinoGameCanvas } from "./components/DinoGameCanvas";
import { HelpModal } from "./components/HelpModal";
import { audioSynth } from "./components/AudioSynthesizer";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState<number>(0);

  const handleToggleMute = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleStartGame = () => {
    audioSynth.playButtonClick();
    setIsPlaying(true);
  };

  const handleScoreUpdate = (currentScore: number, hi: number, destroyed: number) => {
    setScore(currentScore);
    setHighScore(hi);
    setMeteorsDestroyed(destroyed);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between pb-12 px-4 sm:px-8 select-none bg-[#f4f4f4] text-[#535353]">
      {/* Header */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area: Lottie Splash or Asteroid Laser Dino Canvas */}
      <div className="w-full max-w-[850px] flex flex-col items-center justify-center my-auto py-4">
        {!isPlaying ? (
          /* Splash Screen with Lottie Animation */
          <div className="w-full flex flex-col items-center text-center">
            {/* Lottie Animation (Splash_20240424a.json) */}
            <LottieSplash />

            {/* Start Button matching Gen Dino CSS */}
            <div className="next-steps-prompt-container mt-4 flex flex-col items-center gap-4">
              <button
                onClick={handleStartGame}
                className="pixelated-button large mt-2 text-[#fff] font-pixel text-xs shadow-[4px_4px_0px_#535353]"
              >
                ▶ START ASTEROID DEFENSE
              </button>

              <p className="text-[11px] font-mono text-[#535353] mt-2">
                Press <b>SPACE</b> to Blast Falling Asteroids with Lasers!
              </p>
            </div>
          </div>
        ) : (
          /* Asteroid Defense Laser Dino Canvas Engine */
          <div className="w-full flex flex-col items-center gap-4">
            <DinoGameCanvas onScoreUpdate={handleScoreUpdate} />

            <div className="w-full max-w-[600px] flex items-center justify-between px-2 text-xs font-mono text-[#535353]">
              <span className="text-[11px] text-[#535353]">
                <b>SPACE</b>: Fire Laser &nbsp;|&nbsp; <b>DOWN ARROW</b>: Crouch / Dodge &nbsp;|&nbsp; <b>UP ARROW</b>: Jump
              </span>

              <button
                onClick={() => setIsPlaying(false)}
                className="text-[11px] font-bold underline hover:text-[#000]"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] font-mono text-[#535353] select-none space-y-1">
        <p className="font-pixel text-[10px] uppercase text-[#535353]">
          SAVE DINO — ASTEROID DEFENSE
        </p>
        <p>Blast Asteroids with Dino's Laser Beam & Survive the Extinction Event</p>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

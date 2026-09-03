"use client";

import React from "react";
import Link from "next/link";
import { Sun, Moon, Volume2, VolumeX, HelpCircle, Telescope } from "lucide-react";

interface HeaderProps {
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isNight?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  isMuted,
  onToggleMute,
  isNight = false,
  onToggleTheme,
}) => {
  return (
    <header className="w-full relative px-3 py-3 sm:px-12 sm:py-6 flex flex-col items-center select-none transition-colors duration-700">
      {/* Top Navigation Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-4">
        {/* PostHog Style Slate & Violet Branding Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            {/* Slanted 3-Color Badge */}
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-6 bg-[#8b5cf6] rounded-xs transform -skew-x-12" />
              <div className="w-2.5 h-6 bg-[#10b981] rounded-xs transform -skew-x-12" />
              <div className="w-2.5 h-6 bg-[#38bdf8] rounded-xs transform -skew-x-12" />
            </div>
            <span className="font-pixel text-[11px] tracking-wider uppercase text-foreground">
              SaveDino
            </span>
            <span className="hidden sm:inline-block text-[8px] font-pixel uppercase tracking-widest px-2 py-0.5 border border-border rounded-md bg-card text-foreground">
              ARCADE GAME
            </span>
          </Link>

          <Link
            href="/campaigns"
            className="text-xs px-3.5 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-xs"
          >
            <Telescope className="size-3.5" />
            <span>IASC PLATFORM &gt;</span>
          </Link>
        </div>

        {/* Top Right Controls: Theme Toggle, Sound Toggle & Help */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-8 h-8 rounded-md border border-border bg-card flex items-center justify-center transition-colors focus:outline-hidden cursor-pointer hover:bg-accent text-foreground"
              title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isNight ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-[#8b5cf6]" />
              )}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="w-8 h-8 rounded-md border border-border bg-card flex items-center justify-center transition-colors focus:outline-hidden cursor-pointer hover:bg-accent text-foreground"
            title={isMuted ? "Unmute Music & Sound" : "Mute Music & Sound"}
          >
            {isMuted ? (
              <VolumeX className="size-4 text-muted-foreground" />
            ) : (
              <Volume2 className="size-4 text-[#10b981]" />
            )}
          </button>

          {/* Help Controls Modal Launcher */}
          <button
            onClick={onOpenHelp}
            className="px-3 py-1.5 rounded-md border border-border bg-card text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-hidden cursor-pointer hover:bg-accent text-foreground"
            title="View Game Controls & Instructions"
          >
            <HelpCircle className="size-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Controls</span>
          </button>
        </div>
      </div>
    </header>
  );
};

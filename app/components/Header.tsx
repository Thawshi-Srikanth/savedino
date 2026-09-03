"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
    <header className="w-full relative px-2 py-3 flex flex-col items-center select-none transition-colors duration-700">
      {/* Top Navigation Bar - Constrained to Game Window max-w-[600px] */}
      <div className="w-full max-w-[600px] flex items-center justify-between gap-3">
        {/* PostHog Style Slate & Violet Branding Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            {/* Slanted 3-Color Badge */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <div className="w-2 h-5 sm:w-2.5 sm:h-6 bg-[#8b5cf6] rounded-xs transform -skew-x-12" />
              <div className="w-2 h-5 sm:w-2.5 sm:h-6 bg-[#10b981] rounded-xs transform -skew-x-12" />
              <div className="w-2 h-5 sm:w-2.5 sm:h-6 bg-[#38bdf8] rounded-xs transform -skew-x-12" />
            </div>
            <span className="font-pixel text-[10px] sm:text-[11px] tracking-wider uppercase text-foreground">
              SaveDino
            </span>
          </Link>

          <Link href="/campaigns">
            <Button size="sm" variant="default" className="text-[10px] sm:text-xs font-bold flex items-center gap-1.5 px-2.5 sm:px-3.5">
              <Telescope className="size-3.5" />
              <span>PLATFORM &gt;</span>
            </Button>
          </Link>
        </div>

        {/* Top Right Controls: Theme Toggle, Sound Toggle & Help */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleTheme}
              className="h-8 w-8 rounded-md"
              title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
            >
              {isNight ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-[#8b5cf6]" />
              )}
            </Button>
          )}

          {/* Sound Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleMute}
            className="h-8 w-8 rounded-md"
            title={isMuted ? "Unmute Music & Sound" : "Mute Music & Sound"}
          >
            {isMuted ? (
              <VolumeX className="size-4 text-muted-foreground" />
            ) : (
              <Volume2 className="size-4 text-[#10b981]" />
            )}
          </Button>

          {/* Help Controls Modal Launcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHelp}
            className="h-8 text-xs font-bold flex items-center gap-1 px-2.5"
            title="View Game Controls & Instructions"
          >
            <HelpCircle className="size-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Controls</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

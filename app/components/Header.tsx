"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Volume2, VolumeX, HelpCircle, Telescope } from "lucide-react";

import { Logo } from "@/components/Logo";

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
    <header className="w-full relative px-2 py-3 flex flex-col items-center select-none">
      {/* Top Navigation Bar - Constrained to Game Window max-w-[600px] */}
      <div className="w-full max-w-[600px] flex items-center justify-between gap-3">
        {/* SaveDino Branding Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo href="/" size="md" />

          {/* Action button shown only when not in Demo Mode */}
          {process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && (
            <Link href="/campaigns" className="hidden sm:inline-flex">
              <Button
                size="sm"
                variant="default"
                className="text-[10px] sm:text-xs font-bold flex items-center gap-1.5 px-2.5 sm:px-3.5 shadow-arcade-primary"
              >
                <Telescope className="size-3.5" />
                <span>Explore Campaigns</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Top Right Controls: Theme Toggle, Sound Toggle & Help */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleTheme}
              className="h-8 w-8 rounded-lg shadow-arcade active:translate-y-0.5 cursor-pointer"
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
            className="h-8 w-8 rounded-lg shadow-arcade active:translate-y-0.5 cursor-pointer"
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
            className="h-8 text-xs font-bold flex items-center gap-1.5 px-2.5 rounded-lg shadow-arcade active:translate-y-0.5 cursor-pointer"
            title="View Game Controls & Instructions"
          >
            <HelpCircle className="size-3.5 text-[#8b5cf6]" />
            <span className="hidden sm:inline">Controls</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  HelpCircle,
  LayoutDashboard,
  Trophy,
  Gamepad2,
} from "lucide-react";

import { Logo } from "@/components/Logo";

interface HeaderProps {
  onOpenHelp?: () => void;
  onOpenLeaderboard?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isNight?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenLeaderboard,
  isMuted,
  onToggleMute,
  isNight = false,
  onToggleTheme,
}) => {
  const pathname = usePathname();
  const isLeaderboardPage = pathname === "/leaderboard";
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <header className="w-full relative px-2 py-3 flex flex-col items-center select-none">
      {/* Top Navigation Bar - Constrained to Game Window max-w-[600px] */}
      <div className="w-full max-w-[600px] flex items-center justify-between gap-3">
        {/* SaveDino Branding Logo & Nav Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo href="/" size="md" />

          {/* Action button shown only when authenticated and not in Demo Mode */}
          {process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && isAuthenticated && (
            <Link href="/campaigns" prefetch={false} className="inline-flex" title="Open Dashboard">
              <Button
                size="sm"
                variant="default"
                className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-arcade-primary active:translate-y-0.5 rounded-lg"
              >
                <LayoutDashboard className="size-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Top Right Controls: Theme Toggle, Leaderboard/Play & Controls Help */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleTheme}
              className="h-8 w-8 rounded-lg shadow-arcade active:translate-y-0.5 cursor-pointer"
              title="Toggle Day / Night Mode"
            >
              <Sun className="size-4 text-amber-400 dark:block hidden" />
              <Moon className="size-4 text-[#8b5cf6] dark:hidden block" />
            </Button>
          )}

          {/* Leaderboard or Play Game Link (Hidden in Demo Mode) */}
          {process.env.NEXT_PUBLIC_DEMO_MODE !== "true" &&
            (isLeaderboardPage ? (
              <Link href="/" prefetch={false}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold flex items-center gap-1.5 px-2.5 rounded-lg shadow-arcade active:translate-y-0.5 cursor-pointer text-[#10b981] hover:text-[#059669]"
                  title="Play SaveDino Retro Arcade Game"
                >
                  <Gamepad2 className="size-3.5 text-[#10b981]" />
                  <span className="hidden sm:inline">Play</span>
                </Button>
              </Link>
            ) : (
              <Link href="/leaderboard" prefetch={false}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold flex items-center gap-1.5 px-2.5 rounded-lg shadow-arcade active:translate-y-0.5 cursor-pointer text-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
                  title="View Global Arcade Leaderboard"
                >
                  <Trophy className="size-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Ranks</span>
                </Button>
              </Link>
            ))}

          {/* Help Controls Modal Launcher */}
          {onOpenHelp && (
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
          )}
        </div>
      </div>

      {/* Floating Sound Toggle Button in Bottom Right Corner */}
      <div className="fixed bottom-4 right-4 z-50 select-none">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleMute}
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-arcade hover:shadow-arcade-sm active:translate-y-0.5 cursor-pointer flex items-center justify-center transition-all"
          title={isMuted ? "Unmute Music & Sound" : "Mute Music & Sound"}
        >
          {isMuted ? (
            <VolumeX className="size-4 text-muted-foreground" />
          ) : (
            <Volume2 className="size-4 text-[#10b981]" />
          )}
        </Button>
      </div>
    </header>
  );
};

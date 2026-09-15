"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Header } from "@/app/components/Header";
import { HelpModal } from "@/app/components/HelpModal";
import { audioSynth } from "@/app/components/AudioSynthesizer";
import { Button } from "@/components/ui/button";
import { DinoLoading } from "@/components/dino-loading";
import { PixelAvatar } from "@/components/pixel-avatar";
import { MarqueeText } from "@/components/marquee-text";
import { ArcadeMetric } from "@/components/arcade-metric";
import { RefreshCw, LogIn, Trophy } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export interface LeaderboardEntry {
  id: string;
  userId: string;
  rank: number;
  score: number;
  meteorsDestroyed: number;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image?: string | null;
    institution?: string | null;
    country?: string | null;
    role: string;
  };
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: {
    score: number;
    meteorsDestroyed: number;
    rank: number;
    user?: {
      name: string;
      image?: string | null;
      institution?: string | null;
      country?: string | null;
      role?: string;
    };
  } | null;
  totalPlayers: number;
}

export default function LeaderboardPage() {
  const { data: session } = authClient.useSession();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [activeTab, setActiveTab] = useState<"score" | "asteroids">("score");
  const [cache, setCache] = useState<Record<string, LeaderboardData>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { resolvedTheme, setTheme } = useTheme();

  const isNight = mounted ? resolvedTheme === "dark" : false;

  const handleToggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const handleToggleMute = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  const fetchLeaderboard = useCallback(
    async (type: "score" | "asteroids" = activeTab, bypassCache: boolean = false) => {
      if (!bypassCache && cache[type]) {
        setData(cache[type]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/arcade/leaderboard?type=${type}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.success) {
          setData(json);
          setCache((prev) => ({ ...prev, [type]: json }));
        } else {
          setError(json.error || "Could not load leaderboard.");
        }
      } catch {
        setError("Network error while loading scores.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, cache]
  );

  const handleTabChange = (tab: "score" | "asteroids") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    if (cache[tab]) {
      setData(cache[tab]);
    } else {
      fetchLeaderboard(tab);
    }
  };

  const handleRefresh = () => {
    setCache({});
    fetchLeaderboard(activeTab, true);
  };

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      window.location.replace("/");
      return;
    }
    setMounted(true);
    fetchLeaderboard("score");
  }, []);

  const firstPlace = data?.leaderboard?.find((e) => e.rank === 1);
  const secondPlace = data?.leaderboard?.find((e) => e.rank === 2);
  const thirdPlace = data?.leaderboard?.find((e) => e.rank === 3);

  const renderPodiumSpot = (
    entry: LeaderboardEntry | undefined,
    rank: 1 | 2 | 3,
    imgSrc: string
  ) => {
    const isCurrent = entry && session?.user?.id === entry.userId;

    if (!entry) {
      return (
        <div className="flex flex-col items-center justify-start text-center">
          <div className="relative w-20 h-20 sm:w-26 sm:h-26 opacity-25 grayscale mb-1.5">
            <Image
              src={imgSrc}
              alt={`Rank ${rank}`}
              fill
              sizes="(max-width: 640px) 96px, 110px"
              className="object-contain"
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">#{rank} Vacant</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center text-center">
        {/* Dino Illustration on Podium with Backdrop #1 / #2 / #3 Offset Number */}
        <div className="relative w-20 h-20 sm:w-26 sm:h-26 shrink-0 flex items-center justify-center">
          {/* Background Offset Large Number */}
          <span
            className={`absolute -top-1 -left-1 sm:-top-2 sm:-left-2 font-mono font-black select-none pointer-events-none text-2xl sm:text-3xl leading-none z-0 ${
              rank === 1
                ? "text-amber-500/25 dark:text-amber-400/30"
                : rank === 2
                  ? "text-slate-400/25 dark:text-slate-300/25"
                  : "text-amber-700/25 dark:text-amber-600/30"
            }`}
          >
            #{rank}
          </span>

          <div className="relative w-full h-full z-10 drop-shadow-md">
            <Image
              src={imgSrc}
              alt={`Rank ${rank}`}
              fill
              sizes="(max-width: 640px) 100px, 110px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Consistent Sized Avatar */}
        <div className="relative mt-2 flex items-center justify-center">
          <PixelAvatar
            seed={entry.user.image || entry.user.name || entry.userId}
            size={36}
            className="rounded-xl shadow-xs"
          />
          {isCurrent && (
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 text-[8px] font-sans font-bold bg-[#8b5cf6] text-white rounded-md shadow-xs border border-background">
              You
            </span>
          )}
        </div>

        {/* Player Name with Marquee Overflow Support */}
        <div className="w-full max-w-[105px] sm:max-w-[140px] mt-1 px-0.5">
          <MarqueeText
            text={entry.user.name}
            className="text-xs sm:text-sm font-bold font-sans text-foreground text-center"
          />
        </div>

        {/* Institution / Location with Marquee Overflow Support */}
        <div className="w-full max-w-[105px] sm:max-w-[140px] px-0.5">
          <MarqueeText
            text={entry.user.institution || entry.user.country || "Defender"}
            className="text-[10px] sm:text-[11px] text-muted-foreground font-sans text-center"
          />
        </div>

        {/* Active Metric: Animated Roll & Pop on Tab Switch */}
        <ArcadeMetric
          label={activeTab === "score" ? "HI Score" : "Asteroids"}
          value={activeTab === "score" ? entry.score : entry.meteorsDestroyed}
          type={activeTab}
        />
      </div>
    );
  };

  return (
    <main className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-between pt-2 sm:pt-4 pb-2 sm:pb-3 px-4 sm:px-8 select-none overscroll-none bg-background text-foreground">
      {/* Header */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isNight={isNight}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Leaderboard Stage */}
      <div className="w-full max-w-[600px] flex flex-col items-center justify-center my-auto py-1 px-2 sm:px-0">
        <div className="w-full text-center space-y-1 mb-2.5 sm:mb-3.5">
          <h1 className="text-sm sm:text-base font-pixel font-bold tracking-wide uppercase text-foreground">
            SaveDino Champions
          </h1>
          <p className="text-xs text-muted-foreground font-sans">
            {activeTab === "score"
              ? "Global high scores in planetary defense"
              : "Global asteroid interception leaders"}
          </p>
        </div>

        {/* Content Area with Locked Height to eliminate layout shifts */}
        {isLoading ? (
          <div className="w-full h-[290px] sm:h-[310px] flex flex-col items-center justify-center">
            <DinoLoading
              size="lg"
              text={
                activeTab === "score"
                  ? "Loading score champions..."
                  : "Loading asteroid champions..."
              }
            />
          </div>
        ) : error ? (
          <div className="w-full h-[290px] sm:h-[310px] flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-xs font-sans text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 text-xs font-sans cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        ) : !data || data.leaderboard.length === 0 ? (
          <div className="w-full h-[290px] sm:h-[310px] flex flex-col items-center justify-center text-center space-y-1.5">
            <p className="text-xs font-medium text-foreground font-sans">No scores recorded yet</p>
            <p className="text-[11px] text-muted-foreground font-sans">
              Play a round of the arcade game to claim the #1 spot.
            </p>
          </div>
        ) : (
          <div className="w-full min-h-[290px] sm:min-h-[310px] flex flex-col justify-between space-y-2.5 sm:space-y-3">
            {/* Currently Logged-in User Card with Solid Colors ABOVE the Podium */}
            {session?.user && data.currentUser ? (
              <div className="w-full p-2 sm:p-2.5 rounded-2xl border-2 border-border bg-card shadow-arcade-sm flex items-center justify-between gap-2.5 transition-all">
                {/* Left: Rank & User Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-extrabold text-xs sm:text-sm text-muted-foreground shrink-0 pl-1">
                    #{data.currentUser.rank}
                  </span>

                  <div className="relative shrink-0 flex items-center justify-center">
                    <PixelAvatar
                      seed={
                        data.currentUser.user?.image ||
                        (session.user as any)?.image ||
                        session.user.name ||
                        session.user.id
                      }
                      size={36}
                      className="rounded-xl shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 text-[8px] font-sans font-bold bg-[#8b5cf6] text-white rounded-md shadow-xs border border-background">
                      You
                    </span>
                  </div>

                  <div className="min-w-0 max-w-[130px] sm:max-w-[200px] text-left">
                    <MarqueeText
                      text={session.user.name}
                      className="text-xs sm:text-sm font-bold text-foreground font-sans block text-left"
                    />
                    <MarqueeText
                      text={
                        data.currentUser.user?.institution ||
                        data.currentUser.user?.country ||
                        (session.user as any)?.institution ||
                        (session.user as any)?.country ||
                        "Planetary Defender"
                      }
                      className="text-[10px] sm:text-[11px] text-muted-foreground font-sans text-left"
                    />
                  </div>
                </div>

                {/* Right: Animated Metric on Tab Switch without enclosing outline */}
                <div className="flex items-center justify-end shrink-0 pr-1">
                  <ArcadeMetric
                    label={activeTab === "score" ? "High Score" : "Asteroids"}
                    value={
                      activeTab === "score"
                        ? data.currentUser.score
                        : data.currentUser.meteorsDestroyed
                    }
                    type={activeTab}
                    align="right"
                  />
                </div>
              </div>
            ) : session?.user && !data.currentUser ? (
              <div className="w-full p-2 sm:p-2.5 rounded-2xl border-2 border-border bg-card shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PixelAvatar
                    seed={(session.user as any)?.image || session.user.name || session.user.id}
                    size={34}
                    className="rounded-xl shrink-0"
                  />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-foreground font-sans truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-sans">
                      No score recorded yet
                    </p>
                  </div>
                </div>
                <Link href="/" prefetch={false}>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold font-sans bg-[#10b981] hover:bg-[#059669] text-white shadow-arcade-emerald active:translate-y-0.5 rounded-xl cursor-pointer"
                  >
                    Play Game
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="w-full p-2 sm:p-2.5 rounded-2xl border-2 border-border bg-card shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground shrink-0">
                    <Trophy className="size-3.5 text-amber-500" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-foreground font-sans truncate">
                      Claim your spot
                    </p>
                    <p className="text-[10px] text-muted-foreground font-sans truncate">
                      Sign in to save your asteroid scores
                    </p>
                  </div>
                </div>
                <Link href="/login" prefetch={false}>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold font-sans bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-arcade-primary active:translate-y-0.5 rounded-xl gap-1 cursor-pointer"
                  >
                    <LogIn className="size-3" />
                    <span>Sign in</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Podium: On Mobile: 1st Place on Row 1 (centered), 2nd & 3rd on Row 2. On sm+: All 3 side-by-side in 1 row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 items-start justify-items-center w-full py-1">
              <div className="col-span-2 sm:col-span-1 flex justify-center w-full">
                {renderPodiumSpot(firstPlace, 1, "/leader/win-1.png")}
              </div>
              <div className="col-span-1 flex justify-center w-full">
                {renderPodiumSpot(secondPlace, 2, "/leader/win-2.png")}
              </div>
              <div className="col-span-1 flex justify-center w-full">
                {renderPodiumSpot(thirdPlace, 3, "/leader/win-3.png")}
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs: High Score vs Total Asteroids + Refresh Button at the BOTTOM */}
        <div className="flex items-center justify-center gap-2 w-full max-w-[340px] sm:max-w-[360px] mt-2.5 sm:mt-3.5">
          <div className="flex items-center justify-center p-1 sm:p-1.5 bg-muted rounded-2xl border border-border flex-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleTabChange("score")}
              className={`flex-1 text-center py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all cursor-pointer ${
                activeTab === "score"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              High Score
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("asteroids")}
              className={`flex-1 text-center py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all cursor-pointer ${
                activeTab === "asteroids"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Asteroids
            </button>
          </div>

          {/* Refresh Icon Button Next to Tabs */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="size-9 sm:size-10 rounded-2xl border border-border bg-card shadow-xs hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-all active:translate-y-0.5"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`size-3.5 sm:size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Footer Note (Identical to Home Page Footer) */}
      <footer className="w-full max-w-[600px] flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 pb-2 text-[10px] sm:text-[11px] font-mono text-muted-foreground border-t border-border/40 select-text shrink-0 text-center sm:text-left">
        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
          <span className="font-bold text-foreground">SaveDino</span>
          <span className="opacity-40">&bull;</span>
          <a
            href="https://www.sedssl.org"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-80 hover:opacity-100 hover:text-foreground transition-opacity underline-offset-2 hover:underline inline-flex items-center"
          >
            SEDS Sri Lanka
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-2.5 gap-y-1">
          <Link
            href="/"
            prefetch={false}
            className="hover:text-foreground transition-colors underline-offset-2 hover:underline text-[#10b981] font-semibold"
          >
            Play Game
          </Link>
          <span className="opacity-40 hidden sm:inline">|</span>
          <Link
            href="/credits"
            prefetch={false}
            className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Credits
          </Link>
          <span className="opacity-40 hidden sm:inline">|</span>
          <Link
            href="/privacy"
            prefetch={false}
            className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Privacy
          </Link>
          <span className="opacity-40 hidden sm:inline">|</span>
          <Link
            href="/cookies"
            prefetch={false}
            className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Cookies
          </Link>
          <span className="opacity-40 hidden sm:inline">|</span>
          <Link
            href="/terms"
            prefetch={false}
            className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Terms
          </Link>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}

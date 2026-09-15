"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Header } from "./components/Header";
import { HelpModal } from "./components/HelpModal";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { ArcadeTabGuard } from "./components/ArcadeTabGuard";
import { audioSynth } from "./components/AudioSynthesizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/auth-client";
import { getUserProfile } from "@/lib/user-profile";
import { Check, Mail, Bell, LayoutDashboard, LogIn, Users, Telescope } from "lucide-react";
import { toast } from "sonner";

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
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);

  const [mounted, setMounted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const { resolvedTheme, setTheme } = useTheme();

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [meteorsDestroyed, setMeteorsDestroyed] = useState<number>(0);

  // Newsletter Subscription state
  const [email, setEmail] = useState<string>("");
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // User squads membership state
  const [userHasSquads, setUserHasSquads] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      getUserProfile()
        .then((d) => {
          if (d.success && Array.isArray(d.teams) && d.teams.length > 0) {
            setUserHasSquads(true);
          } else {
            setUserHasSquads(false);
          }
        })
        .catch(() => {
          setUserHasSquads(false);
        });
    } else {
      setUserHasSquads(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMounted(true);

    // Check localStorage for prior subscription
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("savedino_subscribed");
        if (stored === "true") {
          setIsSubscribed(true);
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("requestAccess") === "true" || urlParams.get("subscribe") === "true") {
          setIsNotifyModalOpen(true);
        }
      }
    } catch (e) {
      // Ignore localStorage read errors
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

  // Sync night-mode class to document for backward compatibility
  useEffect(() => {
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("night-mode");
    } else {
      document.documentElement.classList.remove("night-mode");
    }
  }, [resolvedTheme]);

  const handleToggleMute = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleScoreUpdate = (currentScore: number, hi: number, destroyed: number) => {
    setScore(currentScore);
    setHighScore(hi);
    setMeteorsDestroyed(destroyed);
  };

  const isNight = mounted ? resolvedTheme === "dark" : false;

  const handleToggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubscribed(true);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("savedino_subscribed", "true");
          }
        } catch (e) {
          // Ignore localStorage write errors
        }
        toast.success(data.message || "You're on the list! We'll notify you on launch.");
        setEmail("");
        setIsNotifyModalOpen(false);
      } else {
        toast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <ArcadeTabGuard>
      <main className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-between pt-2 sm:pt-4 pb-2 sm:pb-4 px-4 sm:px-8 select-none overscroll-none bg-background text-foreground">
        {/* Header */}
        <Header
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isNight={isNight}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Game Stage */}
        <div className="w-full max-w-[600px] flex flex-col items-center justify-center my-auto py-1 px-2 sm:px-0">
          <DinoGameCanvas
            onScoreUpdate={handleScoreUpdate}
            nightModeOverride={resolvedTheme === "dark"}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />

          {/* Campaign Status Section (Coming Soon in Demo Mode vs Explore in Live Mode) */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? (
            <div className="w-full mt-4 sm:mt-4 text-left select-text space-y-2 px-0">
              <h2 className="text-sm sm:text-base font-pixel font-bold tracking-wide uppercase text-foreground">
                Coming Soon
              </h2>

              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Get ready for the SaveDino Asteroid Search Challenge! Team up with your squad to
                spot real asteroids, submit discovery reports, and compete on the global
                leaderboard.
              </p>

              <ul className="font-sans space-y-1.5 text-xs text-muted-foreground pl-0 leading-relaxed pt-1">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#10b981] shrink-0" />
                  <span>Form or join a discovery squad</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#10b981] shrink-0" />
                  <span>Inspect telescope images to hunt asteroids</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#10b981] shrink-0" />
                  <span>Climb the leaderboard & unlock badges</span>
                </li>
              </ul>

              {/* Notify Me Action (Hidden once subscribed) */}
              {!isSubscribed && (
                <div className="pt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsNotifyModalOpen(true)}
                    className="h-9 text-xs font-semibold gap-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-arcade-primary cursor-pointer"
                  >
                    <Bell className="size-3.5" />
                    <span>Notify Me</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full mt-4 sm:mt-4 text-left select-text space-y-2 px-0">
              <h2 className="text-sm sm:text-base font-pixel font-bold tracking-wide uppercase text-foreground">
                Join an Asteroid Hunt
              </h2>

              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                Team up with a research squad to analyze real telescope images and hunt for
                undiscovered asteroids.
              </p>

              <ul className="font-sans space-y-1.5 text-xs text-muted-foreground pl-0 leading-relaxed pt-1">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#10b981] shrink-0" />
                  <span>Browse open asteroid search campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#10b981] shrink-0" />
                  <span>Join an existing team or create your own squad</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-[#10b981] shrink-0" />
                  <span>Inspect telescope surveys and report asteroid sightings</span>
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {isAuthenticated ? (
                  <>
                    <Link href="/campaigns" prefetch={false}>
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs font-bold shadow-arcade-primary cursor-pointer gap-1.5"
                      >
                        <LayoutDashboard className="size-3.5" />
                        <span>Open Dashboard</span>
                      </Button>
                    </Link>
                    {userHasSquads ? (
                      <Link href="/profile?tab=teams" prefetch={false}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-bold shadow-arcade cursor-pointer gap-1.5"
                        >
                          <Users className="size-3.5 text-[#10b981]" />
                          <span>My Squads</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/teams" prefetch={false}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-bold shadow-arcade cursor-pointer gap-1.5"
                        >
                          <Users className="size-3.5 text-[#10b981]" />
                          <span>Squad Directory</span>
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link href="/login" prefetch={false}>
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs font-bold shadow-arcade-primary cursor-pointer gap-1.5"
                      >
                        <LogIn className="size-3.5" />
                        <span>Sign In</span>
                      </Button>
                    </Link>
                    {!isSubscribed && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsNotifyModalOpen(true)}
                        className="text-xs font-bold shadow-arcade cursor-pointer gap-1.5 text-foreground hover:text-primary border-border"
                      >
                        <Bell className="size-3.5 text-[#8b5cf6]" />
                        <span>Request Access</span>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
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
            {process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && (
              <>
                <Link
                  href="/leaderboard"
                  prefetch={false}
                  className="hover:text-foreground transition-colors underline-offset-2 hover:underline text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-semibold"
                >
                  Ranks
                </Link>
                <span className="opacity-40 hidden sm:inline">|</span>
              </>
            )}
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

        {/* Notify Me Popup Modal */}
        <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground font-sans shadow-2xl">
            <DialogHeader className="space-y-1.5 text-left">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] dark:bg-[#8b5cf6]/20 shrink-0">
                  <Bell className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold font-sans">
                    Get Notified on Launch
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground font-sans">
                    Be the first to know when campaigns & registrations open.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubscribe} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="subscribe-email"
                  className="text-xs font-semibold text-foreground font-sans"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="subscribe-email"
                    type="email"
                    required
                    autoFocus
                    placeholder="commander@sedssl.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubscribing}
                    className="h-9 text-xs pl-8 bg-background border-border font-sans placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNotifyModalOpen(false)}
                  className="h-9 text-xs font-sans cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubscribing || !email.trim()}
                  className="h-9 text-xs font-semibold gap-1.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-arcade-primary cursor-pointer"
                >
                  {isSubscribing ? (
                    <>
                      <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="size-3.5" />
                      <span>Subscribe</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Help Modal */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        {/* Global Arcade Leaderboard Modal (Disabled in Demo Mode) */}
        {process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && (
          <LeaderboardModal
            isOpen={isLeaderboardOpen}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        )}
      </main>
    </ArcadeTabGuard>
  );
}

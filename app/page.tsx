"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Header } from "./components/Header";
import { HelpModal } from "./components/HelpModal";
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
import { Check, Mail, Bell } from "lucide-react";
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
  const [mounted, setMounted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
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

  useEffect(() => {
    setMounted(true);

    // Check localStorage for prior subscription
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("savedino_subscribed");
        if (stored === "true") {
          setIsSubscribed(true);
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
    <main
      className={`h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col items-center justify-between pt-2 sm:pt-4 pb-2 sm:pb-4 px-4 sm:px-8 select-none overscroll-none ${
        isNight ? "bg-[#121315] text-[#f3f4f6]" : "bg-[#f8fafc] text-[#0f172a]"
      }`}
    >
      {/* Header */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isNight={isNight}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Game Stage */}
      <div className="w-full max-w-[600px] flex flex-col items-center justify-center my-auto py-1 px-2 sm:px-0">
        <DinoGameCanvas
          onScoreUpdate={handleScoreUpdate}
          onNightModeChange={(night) => setTheme(night ? "dark" : "light")}
          nightModeOverride={mounted ? isNight : null}
        />

        {/* Campaign Status Section (Coming Soon in Demo Mode vs Explore in Live Mode) */}
        {process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? (
          <div className="w-full mt-4 sm:mt-4 text-left select-text space-y-2 px-0">
            <h2 className="text-sm sm:text-base font-pixel font-bold tracking-wide uppercase text-foreground">
              Coming Soon
            </h2>

            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Get ready for the SaveDino Asteroid Search Challenge! Team up with your squad to spot
              real asteroids, submit discovery reports, and compete on the global leaderboard.
            </p>

            <ul className="font-sans space-y-1.5 text-xs text-muted-foreground pl-0 leading-relaxed pt-1">
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#10b981] shrink-0" />
                <span>Form a squad with friends or join an open discovery team</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#10b981] shrink-0" />
                <span>Inspect telescope survey image sets to hunt for moving asteroids</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3.5 text-[#10b981] shrink-0" />
                <span>Earn points, climb the leaderboard, and unlock discovery badges</span>
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

            <div className="pt-2 flex items-center gap-3">
              <Link href="/campaigns">
                <Button
                  size="sm"
                  variant="default"
                  className="text-xs font-bold shadow-arcade-primary cursor-pointer"
                >
                  <span>Explore Campaigns &gt;</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Notify Me Popup Modal */}
      <Dialog open={isNotifyModalOpen} onOpenChange={setIsNotifyModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border text-card-foreground font-sans shadow-2xl">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] dark:bg-[#8b5cf6]/20 shrink-0">
                <Bell className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold font-sans">Get Notified</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-sans">
                  Be the first to know when registrations open for the upcoming Asteroid Search
                  Challenge.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubscribe} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="subscribe-email" className="text-xs font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="subscribe-email"
                  type="email"
                  required
                  autoFocus
                  placeholder="name@example.com"
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
                className="h-9 text-xs font-medium cursor-pointer"
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
                  <span>Subscribing...</span>
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
    </main>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { audioSynth } from "./AudioSynthesizer";

interface ArcadeTabGuardProps {
  children: React.ReactNode;
}

const CHANNEL_NAME = "savedino_arcade_session_channel";
const STORAGE_KEY = "savedino_arcade_active_tab";
const HEARTBEAT_KEY = "savedino_arcade_heartbeat";

export function ArcadeTabGuard({ children }: ArcadeTabGuardProps) {
  const { data: session } = useSession();
  const isAuthenticated = Boolean(session?.user?.id);

  // Each browser tab/window gets a truly distinct in-memory tab ID
  const [tabId] = useState(
    () => "tab_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
  );
  const [isStandby, setIsStandby] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const claimSession = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, tabId);
      localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());

      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ type: "CLAIM_SESSION", senderId: tabId });
        channel.close();
      }
      setIsStandby(false);
      audioSynth.startMusic();
    } catch (e) {
      setIsStandby(false);
    }
  }, [tabId]);

  useEffect(() => {
    setMounted(true);

    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    let heartbeatTimer: any = null;

    // Check if another tab is actively running
    const checkActiveTab = () => {
      try {
        const activeTab = localStorage.getItem(STORAGE_KEY);
        const lastHeartbeat = parseInt(localStorage.getItem(HEARTBEAT_KEY) || "0", 10);
        const isFresh = Date.now() - lastHeartbeat < 2000;

        if (activeTab && activeTab !== tabId && isFresh) {
          // Another tab is actively running the arcade! Enter standby
          setIsStandby(true);
          audioSynth.pauseMusic();
        } else {
          // No active tab running: claim and run
          claimSession();
        }
      } catch (e) {
        claimSession();
      }
    };

    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(CHANNEL_NAME);

      channel.onmessage = (event) => {
        const { type, senderId } = event.data || {};
        if (type === "CLAIM_SESSION" && senderId !== tabId) {
          // Another tab took over
          setIsStandby(true);
          audioSynth.pauseMusic();
        } else if (type === "PING" && !isStandby) {
          // Confirm to newly opened tabs that an active session exists
          if (channel) {
            channel.postMessage({ type: "PONG", senderId: tabId });
          }
        } else if (type === "TAB_CLOSED" && isStandby) {
          // Active tab was closed; check if we can claim
          setTimeout(checkActiveTab, 100);
        }
      };

      // Ping existing tabs
      channel.postMessage({ type: "PING", senderId: tabId });
    }

    checkActiveTab();

    // Heartbeat loop for the active tab (every 800ms)
    heartbeatTimer = setInterval(() => {
      try {
        const currentActive = localStorage.getItem(STORAGE_KEY);
        if (currentActive === tabId) {
          localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
        }
      } catch (e) {}
    }, 800);

    const handleReleaseSession = () => {
      try {
        const currentActive = localStorage.getItem(STORAGE_KEY);
        if (currentActive === tabId) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(HEARTBEAT_KEY);
          if (channel) {
            channel.postMessage({ type: "TAB_CLOSED", senderId: tabId });
          }
        }
      } catch (e) {}
    };

    window.addEventListener("beforeunload", handleReleaseSession);

    // Clean up on component unmount (e.g. when navigating to leaderboard/campaigns)
    return () => {
      window.removeEventListener("beforeunload", handleReleaseSession);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      handleReleaseSession();
      if (channel) channel.close();
    };
  }, [tabId, claimSession, isStandby]);

  if (!mounted) {
    return <>{children}</>;
  }

  // Standby Takeover Screen (If arcade is already running in another tab)
  if (isStandby) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 bg-background text-foreground font-sans select-none">
        {/* Top Header */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between">
          <Logo href="/" size="md" />
        </div>

        {/* Center Standby Card */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="w-full bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8 text-center space-y-5">
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Arcade is running in another tab
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                SaveDino Arcade is already active in a different browser tab. To avoid overlapping
                game sounds, only one arcade instance runs at a time.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link href="/campaigns" prefetch={false} className="block w-full">
                    <Button
                      size="default"
                      variant="default"
                      className="w-full h-11 text-xs font-bold cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-arcade-primary active:translate-y-0.5 rounded-xl"
                    >
                      <span>Open Dashboard</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/campaigns" prefetch={false} className="block w-full">
                    <Button
                      size="default"
                      variant="default"
                      className="w-full h-11 text-xs font-bold cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-arcade-primary active:translate-y-0.5 rounded-xl"
                    >
                      <span>Explore Campaigns</span>
                    </Button>
                  </Link>
                  <Link href="/login" prefetch={false} className="block w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 text-xs font-bold cursor-pointer border-border hover:bg-muted shadow-arcade active:translate-y-0.5 rounded-xl"
                    >
                      <span>Sign In</span>
                    </Button>
                  </Link>
                </div>
              )}

              <div className="pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={claimSession}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer font-medium transition-colors"
                >
                  Use arcade here instead
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between text-[10px] font-mono text-muted-foreground opacity-60 py-2">
          <a
            href="https://www.sedssl.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-2"
          >
            SEDS Sri Lanka
          </a>
          <div className="flex items-center gap-2">
            <Link
              href="/credits"
              prefetch={false}
              className="hover:text-foreground underline underline-offset-2"
            >
              Credits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

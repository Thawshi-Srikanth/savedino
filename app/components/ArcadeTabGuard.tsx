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

  const [tabId] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));
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

    // Check if an existing tab is active and fresh
    const checkActiveTab = () => {
      try {
        const activeTab = localStorage.getItem(STORAGE_KEY);
        const lastHeartbeat = parseInt(localStorage.getItem(HEARTBEAT_KEY) || "0", 10);
        const isFresh = Date.now() - lastHeartbeat < 3000;

        if (activeTab && activeTab !== tabId && isFresh) {
          // Another tab is active! Enter standby mode
          setIsStandby(true);
          audioSynth.pauseMusic();
        } else {
          // We become the active tab
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
          // Respond to ping confirming we are alive
          if (channel) {
            channel.postMessage({ type: "PONG", senderId: tabId });
          }
        }
      };
    }

    checkActiveTab();

    // Heartbeat loop for the active tab
    heartbeatTimer = setInterval(() => {
      try {
        const currentActive = localStorage.getItem(STORAGE_KEY);
        if (currentActive === tabId) {
          localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
        }
      } catch (e) {}
    }, 1000);

    const handleBeforeUnload = () => {
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

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
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
          <span>SaveDino &bull; NASA &amp; IASC Collaboration</span>
          <Link
            href="/credits"
            prefetch={false}
            className="hover:text-foreground underline underline-offset-2"
          >
            Credits
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

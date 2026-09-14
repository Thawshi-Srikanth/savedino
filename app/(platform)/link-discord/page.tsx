"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { DinoLoading } from "@/components/dino-loading";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Check, ShieldAlert, ArrowRight, RefreshCw, MessageSquare } from "lucide-react";

function LinkDiscordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { data: session, isPending: isSessionPending } = useSession();

  const [claiming, setClaiming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedUsername, setLinkedUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No linking token provided in the URL.");
      return;
    }

    if (isSessionPending) return;

    if (!session?.user) {
      // User needs to sign in first
      return;
    }

    // Attempt to claim the link
    let isMounted = true;
    async function claim() {
      setClaiming(true);
      setError(null);
      try {
        const res = await fetch("/api/discord/claim-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (isMounted) {
          if (res.ok && data.success) {
            setSuccess(true);
            setLinkedUsername(data.username || null);
            toast.success(data.message || "Discord account linked successfully!");
          } else {
            setError(data.error || "Failed to link Discord account.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Network error occurred.");
        }
      } finally {
        if (isMounted) setClaiming(false);
      }
    }

    claim();

    return () => {
      isMounted = false;
    };
  }, [token, session?.user, isSessionPending]);

  if (isSessionPending || claiming) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        <DinoLoading text={claiming ? "Connecting Discord account..." : "Verifying session..."} />
      </div>
    );
  }

  // Not signed in state
  if (!session?.user && token) {
    const returnUrl = `/link-discord?token=${encodeURIComponent(token)}`;
    return (
      <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none bg-background text-foreground font-sans">
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="flex flex-col items-center justify-center">
            <Logo href="/" size="lg" />
          </div>

          <div className="w-full bg-card border border-border shadow-arcade-lg rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="size-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-arcade-sm mx-auto">
                <svg className="size-6 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Link Discord Account
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sign in to your SaveDino account to complete linking your Discord profile.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                asChild
                className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-xl shadow-arcade-primary active:translate-y-[2px] active:shadow-none text-xs cursor-pointer"
              >
                <Link href={`/login?redirect=${encodeURIComponent(returnUrl)}`}>
                  <span>Sign In to Continue</span>
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-11 bg-card text-foreground font-bold rounded-xl border-border shadow-arcade active:translate-y-[2px] active:shadow-none text-xs cursor-pointer"
              >
                <Link href={`/register?redirect=${encodeURIComponent(returnUrl)}`}>
                  <span>Create an Account</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none bg-background text-foreground font-sans">
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="flex flex-col items-center justify-center">
            <Logo href="/" size="lg" />
          </div>

          <div className="w-full bg-card border border-border shadow-arcade-lg rounded-2xl p-6 sm:p-8 space-y-6 text-center">
            <div className="size-14 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-arcade-sm mx-auto">
              <Check className="size-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Discord Successfully Linked!
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your Discord account {linkedUsername ? `(@${linkedUsername}) ` : ""}is now linked to{" "}
                <span className="font-semibold text-foreground">{session?.user?.name}</span>.
              </p>
            </div>

            <div className="p-3.5 bg-muted/60 border border-border/60 rounded-xl text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Check className="size-3.5 text-primary" />
                <span>Campaign Roles Assigned</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Check className="size-3.5 text-primary" />
                <span>Squad Channels &amp; Voice Rooms Unlocked</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                asChild
                className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-xl shadow-arcade-primary active:translate-y-[2px] active:shadow-none text-xs cursor-pointer"
              >
                <Link href="/campaigns">
                  <span>Go to Observation Campaigns</span>
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-10 bg-card text-foreground font-bold rounded-xl border-border shadow-arcade active:translate-y-[2px] active:shadow-none text-xs cursor-pointer"
              >
                <Link href="/profile">
                  <span>View Profile</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none bg-background text-foreground font-sans">
      <div className="w-full max-w-md mx-auto my-auto space-y-6">
        <div className="flex flex-col items-center justify-center">
          <Logo href="/" size="lg" />
        </div>

        <div className="w-full bg-card border border-border shadow-arcade-lg rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="size-14 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center shadow-arcade-sm mx-auto">
            <ShieldAlert className="size-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Link Failed or Expired
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error || "We could not verify this Discord link token."}
            </p>
          </div>

          <div className="p-3.5 bg-muted/60 border border-border/60 rounded-xl text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">How to get a new link:</p>
            <p>
              Open Discord and type <code className="font-mono font-bold text-foreground">/link</code> in the server or Bot DM.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              asChild
              className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-xl shadow-arcade-primary active:translate-y-[2px] active:shadow-none text-xs cursor-pointer"
            >
              <Link href="/profile">
                <span>Go to Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LinkDiscordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <DinoLoading text="Loading..." />
        </div>
      }
    >
      <LinkDiscordContent />
    </Suspense>
  );
}

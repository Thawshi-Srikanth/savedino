"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { DinoLoading } from "@/components/dino-loading";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const redirectTo = searchParams.get("redirectTo") || "/campaigns";
  const token = searchParams.get("token");
  const urlError = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(!!token);
  const [cooldown, setCooldown] = useState(60);

  // If token is present in URL, verify token directly
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setVerifying(true);
      try {
        const res = await authClient.magicLink.verify({
          query: {
            token,
            callbackURL: redirectTo,
          },
        });

        if (res.error) {
          const msg = res.error.message || "This link has expired or has already been used.";
          toast.error(msg);
          setVerifying(false);
        } else {
          toast.success("Authenticated successfully!");
          const profileRes = await fetch("/api/user/profile");
          const profileData = await profileRes.json();
          if (profileData.success && profileData.user) {
            const u = profileData.user;
            const isComplete =
              u.name &&
              u.name.trim().length > 0 &&
              !u.name.includes("@") &&
              u.name.toLowerCase() !== u.email?.toLowerCase() &&
              u.whatsapp &&
              u.whatsapp.trim().length > 0;

            if (isComplete) {
              sessionStorage.setItem("savedino_profile_completed", "true");
              window.location.href = redirectTo;
              return;
            }
          }
          window.location.href = `/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`;
        }
      } catch (err: any) {
        const msg = err.message || "Failed to verify link. Please request a new one.";
        toast.error(msg);
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, redirectTo, router]);

  // If already authenticated and not verifying token, forward to destination
  useEffect(() => {
    if (token) return;
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const u = data.user;
          const isComplete =
            u.name &&
            u.name.trim().length > 0 &&
            !u.name.includes("@") &&
            u.name.toLowerCase() !== u.email?.toLowerCase() &&
            u.whatsapp &&
            u.whatsapp.trim().length > 0;

          if (isComplete) {
            sessionStorage.setItem("savedino_profile_completed", "true");
            window.location.href = redirectTo;
          } else {
            window.location.href = `/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`;
          }
        }
      })
      .catch(() => {});
  }, [token, redirectTo]);

  // Handle URL errors
  useEffect(() => {
    if (urlError) {
      const msg =
        urlError === "INVALID_TOKEN"
          ? "This link has expired or has already been used. Please request a new one."
          : "Authentication failed. Please request a new sign-in link.";
      toast.error(msg);
    }
  }, [urlError]);

  // Countdown timer for resending link
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Poll for active session so this tab automatically redirects when user clicks link in email
  useEffect(() => {
    if (token) return;

    let isSubscribed = true;

    const checkSession = async () => {
      try {
        const res = await authClient.getSession();
        const user = res?.data?.user as any;
        if (user && isSubscribed) {
          toast.success("Signed in successfully!");
          const profileRes = await fetch("/api/user/profile");
          const profileData = await profileRes.json();
          if (profileData.success && profileData.user) {
            const u = profileData.user;
            const isComplete =
              u.name &&
              u.name.trim().length > 0 &&
              !u.name.includes("@") &&
              u.name.toLowerCase() !== u.email?.toLowerCase() &&
              u.whatsapp &&
              u.whatsapp.trim().length > 0;

            if (isComplete) {
              sessionStorage.setItem("savedino_profile_completed", "true");
              window.location.href = redirectTo;
              return;
            }
          }
          window.location.href = `/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`;
        }
      } catch {
        // Ignore polling errors
      }
    };

    const interval = setInterval(checkSession, 2000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [token, redirectTo, router]);

  const handleResendLink = async () => {
    if (!email || cooldown > 0) return;

    setLoading(true);

    try {
      const res = await authClient.signIn.magicLink({
        email: email.trim().toLowerCase(),
        callbackURL: redirectTo,
      });

      if (res.error) {
        const msg = res.error.message || "Failed to resend link. Please try again.";
        toast.error(msg);
      } else {
        setCooldown(60);
        toast.success("A fresh sign-in link has been sent to your email!");
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred while resending the link.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getEmailProviderInfo = (emailAddress: string) => {
    const domain = emailAddress.split("@")[1]?.toLowerCase() || "";
    if (domain.includes("gmail") || domain.includes("google")) {
      return { name: "Gmail", url: "https://mail.google.com" };
    }
    if (
      domain.includes("outlook") ||
      domain.includes("hotmail") ||
      domain.includes("live") ||
      domain.includes("microsoft")
    ) {
      return { name: "Outlook", url: "https://outlook.live.com" };
    }
    if (domain.includes("yahoo")) {
      return { name: "Yahoo Mail", url: "https://mail.yahoo.com" };
    }
    if (domain.includes("proton")) {
      return { name: "Proton Mail", url: "https://mail.proton.me" };
    }
    return null;
  };

  const emailProvider = getEmailProviderInfo(email);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none bg-background text-foreground">
      {/* Top Left Code Comment Accent */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span>// email verification</span>
          </div>
          <div className="flex items-center gap-1">
            <span>// asteroid search</span>
            <span className="w-2 h-3.5 bg-[#10b981] inline-block animate-pulse" />
          </div>
        </div>

        {/* Back to Arcade */}
        <Link
          href="/"
          prefetch={false}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-pixel text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>&lt; Arcade Game</span>
        </Link>
      </div>

      {/* Main Centered Verification Section */}
      {verifying ? (
        <div className="w-full max-w-md mx-auto my-auto py-12 flex flex-col items-center justify-center text-center space-y-4">
          <Logo href="/" size="lg" className="mb-2" />
          <DinoLoading size="lg" text="Authenticating..." />
          <div className="space-y-1">
            <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
              Authenticating...
            </h1>
            <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
              Verifying your sign-in link and preparing your workspace.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
          {/* Brand Logo */}
          <div className="flex flex-col items-center justify-center">
            <Logo href="/" size="lg" />
          </div>

          {/* Consistent Theme Verification Card */}
          <div className="w-full bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
                {email ? (
                  <>
                    We sent a sign-in link to{" "}
                    <span className="font-semibold text-foreground">{email}</span>
                  </>
                ) : (
                  "We sent a sign-in link to your email address."
                )}
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {emailProvider ? (
                <Button
                  type="button"
                  variant="default"
                  className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold gap-2"
                  onClick={() => window.open(emailProvider.url, "_blank")}
                >
                  <span>Open {emailProvider.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : null}

              {email ? (
                <Button
                  type="button"
                  variant={emailProvider ? "outline" : "default"}
                  className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold gap-2"
                  disabled={loading || cooldown > 0}
                  onClick={handleResendLink}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  <span>{cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Link"}</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="default"
                  className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold gap-2"
                  onClick={() => router.push("/login")}
                >
                  <span>Back to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="text-center pt-2 border-t border-border">
              <Link
                href="/login"
                prefetch={false}
                className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different email</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <div className="w-full text-center text-[10px] font-mono text-muted-foreground opacity-50 py-2">
        SaveDino: NASA &amp; IASC Asteroid Search Collaboration
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<DinoLoading size="lg" text="Loading..." fullScreen />}>
      <VerifyContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { DinoLoading } from "@/components/dino-loading";
import posthog from "posthog-js";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/campaigns";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "discord" | null>(null);

  // If already authenticated, redirect to destination
  useEffect(() => {
    authClient
      .getSession()
      .then((res) => {
        if (res?.data?.session) {
          router.push(redirectTo);
        }
      })
      .catch(() => {});
  }, [redirectTo, router]);

  // Handle URL errors (e.g. expired tokens)
  useEffect(() => {
    if (urlError) {
      const msg =
        urlError === "INVALID_TOKEN"
          ? "This link has expired or has already been used. Please request a new one."
          : "Something went wrong. Please try again.";
      toast.error(msg);
    }
  }, [urlError]);

  const handleSocialSignIn = async (provider: "google" | "discord") => {
    setSocialLoading(provider);
    try {
      const callbackURL = `/onboarding?redirectTo=${encodeURIComponent(redirectTo)}`;
      await authClient.signIn.social({
        provider,
        callbackURL,
      });
    } catch (err: any) {
      toast.error(err?.message || `Failed to sign in with ${provider}.`);
      setSocialLoading(null);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await authClient.signIn.magicLink({
        email: normalizedEmail,
        callbackURL: redirectTo,
      });

      if (res.error) {
        const msg =
          res.error.message || "Failed to send link. Please check your email and try again.";
        toast.error(msg);
      } else {
        posthog.capture("magic_link_requested", { auth_method: "magic_link" });
        toast.success("Sign-in link sent! Check your inbox.");
        router.push(
          `/verify?email=${encodeURIComponent(normalizedEmail)}&redirectTo=${encodeURIComponent(redirectTo)}`
        );
      }
    } catch (err: any) {
      posthog.captureException(err, { auth_flow: "login", auth_method: "magic_link" });
      const msg = err.message || "An error occurred. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none bg-background text-foreground">
      {/* Top Left Code Comment Accent */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span>// sign in</span>
          </div>
          <div className="flex items-center gap-1">
            <span>// asteroid search</span>
            <span className="w-2 h-3.5 bg-[#8b5cf6] inline-block animate-pulse" />
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

      {/* Main Centered Auth Section */}
      <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center">
          <Logo href="/" size="lg" />
        </div>

        {/* Auth Card */}
        <div className="w-full bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
              Sign in to SaveDino
            </h1>
            <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
              Choose your preferred sign-in method to continue.
            </p>
          </div>

          {/* Social Sign In Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialSignIn("google")}
              disabled={loading || !!socialLoading}
              className="h-11 text-xs font-sans font-semibold flex items-center justify-center gap-2 border-border bg-card hover:bg-muted text-foreground shadow-arcade active:translate-y-[2px] active:shadow-none transition-all cursor-pointer rounded-xl"
            >
              {socialLoading === "google" ? (
                <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <GoogleIcon className="w-4 h-4 shrink-0" />
              )}
              <span>Google</span>
            </Button>

            <div className="relative">
              <span className="absolute -top-2.5 right-3 z-10 px-1.5 py-0.5 text-[9px] font-sans font-bold tracking-tight uppercase bg-[#5865F2] text-white rounded-full shadow-xs pointer-events-none">
                Recommended
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("discord")}
                disabled={loading || !!socialLoading}
                className="w-full h-11 text-xs font-sans font-semibold flex items-center justify-center gap-2 border-[#5865F2]/40 bg-card hover:bg-[#5865F2]/10 text-foreground hover:text-[#5865F2] shadow-arcade active:translate-y-[2px] active:shadow-none transition-all cursor-pointer rounded-xl"
              >
                {socialLoading === "discord" ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <DiscordIcon className="w-4 h-4 shrink-0 text-[#5865F2]" />
                )}
                <span>Discord</span>
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-mono">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider mb-1 text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10 font-sans text-xs bg-background"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold mt-2 gap-2 cursor-pointer"
              disabled={loading || !!socialLoading || !email.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Sign-in Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-xs font-sans text-muted-foreground pt-3 border-t border-border space-y-1.5">
            <p className="font-semibold text-foreground">
              No separate sign-up or password required.
            </p>
            <p className="text-[11px] text-muted-foreground">
              New here?{" "}
              <Link
                href="/register"
                prefetch={false}
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full text-center text-[10px] font-mono text-muted-foreground opacity-60 py-2 flex items-center justify-center gap-2">
        <span>SaveDino &bull; NASA &amp; IASC Collaboration</span>
        <span className="opacity-40">|</span>
        <a
          href="https://www.sedssl.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground underline-offset-2 hover:underline"
        >
          SEDS Sri Lanka
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<DinoLoading size="lg" text="Loading..." fullScreen />}>
      <LoginForm />
    </Suspense>
  );
}

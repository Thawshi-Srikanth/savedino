"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/campaigns";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, redirect to destination
  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data?.session) {
        router.push(redirectTo);
      }
    }).catch(() => {});
  }, [redirectTo, router]);

  // Handle URL errors (e.g. expired tokens)
  useEffect(() => {
    if (urlError) {
      if (urlError === "INVALID_TOKEN") {
        setErrorMsg("This link has expired or has already been used. Please request a new one.");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    }
  }, [urlError]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await authClient.signIn.magicLink({
        email: normalizedEmail,
        callbackURL: redirectTo,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Failed to send link. Please check your email and try again.");
      } else {
        router.push(
          `/verify?email=${encodeURIComponent(normalizedEmail)}&redirectTo=${encodeURIComponent(redirectTo)}`
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none transition-colors duration-700 bg-background text-foreground">
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
          className="hidden sm:inline-flex items-center gap-1 text-xs font-pixel text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>&lt; Arcade Game</span>
        </Link>
      </div>

      {/* Main Centered Auth Section */}
      <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center gap-2">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center gap-1">
              <div className="w-3 h-7 bg-[#8b5cf6] rounded-xs transform -skew-x-12" />
              <div className="w-3 h-7 bg-[#10b981] rounded-xs transform -skew-x-12" />
              <div className="w-3 h-7 bg-[#38bdf8] rounded-xs transform -skew-x-12" />
            </div>
            <span className="font-pixel text-xl tracking-wider uppercase text-foreground">
              SaveDino
            </span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
              Enter your email address to receive a sign-in link.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs font-sans text-center">
              {errorMsg}
            </div>
          )}

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
              className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold mt-2 gap-2"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Login Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-xs font-sans text-muted-foreground pt-2 border-t border-border">
            No password needed. We&apos;ll email you a secure link to sign in.
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="text-center text-xs font-sans text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-foreground hover:underline inline-flex items-center gap-1">
            <span>Create account</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="w-full text-center text-[10px] font-mono text-muted-foreground opacity-50 py-2">
        SaveDino — NASA &amp; IASC Asteroid Search Collaboration
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs font-mono text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/campaigns";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Failed to sign in. Please check your credentials.");
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none transition-colors duration-700 bg-background text-foreground">
      {/* Top Left Monospace Code Comment Accent (PostHog Inspired) */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span>// sign in to your account</span>
          </div>
          <div className="flex items-center gap-1">
            <span>// iasc asteroid search collaboration</span>
            <span className="w-2 h-3.5 bg-[#8b5cf6] inline-block animate-pulse" />
          </div>
        </div>

        {/* Back to Game */}
        <Link href="/" className="hidden sm:inline-flex items-center gap-1 text-xs font-pixel text-muted-foreground hover:text-foreground">
          <span>&lt; Arcade Game</span>
        </Link>
      </div>

      {/* Main Centered Auth Section */}
      <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
        {/* PostHog Style Centered Brand Logo */}
        <div className="flex flex-col items-center justify-center gap-2">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            {/* Slanted 3-Color Badge */}
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

        {/* PostHog Style Auth Card */}
        <div className="w-full bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-pixel font-bold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="text-xs font-mono text-muted-foreground">
              Access your Asteroid Search team workspace and campaigns.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-1 text-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                placeholder="you@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-1 text-foreground">
                Password
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 font-mono text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full h-11 font-pixel text-xs uppercase tracking-wider font-bold mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue >"}
            </Button>
          </form>
        </div>

        {/* Bottom Link Outside Card */}
        <div className="text-center text-xs font-mono text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-foreground hover:underline inline-flex items-center gap-1">
            <span>Create an account</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Spacing */}
      <div className="w-full text-center text-[10px] font-mono text-muted-foreground opacity-50 py-2">
        SaveDino — NASA & IASC Asteroid Search Collaboration
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-mono text-muted-foreground">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}

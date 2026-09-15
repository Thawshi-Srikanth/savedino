"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import posthog from "posthog-js";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("savedino_cookie_consent");
      if (!consent) {
        // Small delay for smooth entry
        const timer = setTimeout(() => setShowBanner(true), 800);
        return () => clearTimeout(timer);
      } else if (consent === "essential_only") {
        posthog.opt_out_capturing();
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("savedino_cookie_consent", "accepted");
      posthog.opt_in_capturing();
    } catch (e) {}
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("savedino_cookie_consent", "essential_only");
      posthog.opt_out_capturing();
    } catch (e) {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300 select-none text-foreground font-sans"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/15 text-primary shrink-0">
            <Cookie className="size-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Cookie Preferences
          </span>
        </div>

        <button
          type="button"
          onClick={handleEssentialOnly}
          className="text-muted-foreground hover:text-foreground cursor-pointer p-1 -mr-1 -mt-1 rounded-md"
          aria-label="Dismiss cookie banner"
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        SaveDino uses essential cookies for secure login and privacy-first EU-hosted PostHog
        analytics to deliver stable asteroid search tools.
      </p>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Link
          href="/cookies"
          prefetch={false}
          className="text-[11px] font-sans font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Cookie Policy
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEssentialOnly}
            className="h-8 px-2.5 text-xs font-bold rounded-lg cursor-pointer shadow-arcade-xs active:translate-y-0.5"
          >
            Essential Only
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={handleAcceptAll}
            className="h-8 px-3 text-xs font-bold rounded-lg cursor-pointer bg-primary text-primary-foreground shadow-arcade-primary active:translate-y-0.5"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}

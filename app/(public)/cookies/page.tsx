"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cookie, ShieldCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import posthog from "posthog-js";

export default function CookiePolicyPage() {
  const [consentStatus, setConsentStatus] = useState<string>("not_set");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("savedino_cookie_consent");
      if (stored) {
        setConsentStatus(stored);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const handleUpdateConsent = (choice: "accepted" | "essential_only") => {
    try {
      localStorage.setItem("savedino_cookie_consent", choice);
      setConsentStatus(choice);

      if (choice === "accepted") {
        posthog.opt_in_capturing();
        toast.success("All cookies enabled, including analytics.");
      } else {
        posthog.opt_out_capturing();
        toast.success("Only essential cookies are enabled.");
      }
    } catch (e) {
      toast.error("Failed to update preferences.");
    }
  };

  const handleResetConsent = () => {
    try {
      localStorage.removeItem("savedino_cookie_consent");
      setConsentStatus("not_set");
      toast.info("Cookie preferences reset. You will see the consent banner again.");
    } catch (e) {
      toast.error("Failed to reset preferences.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 sm:px-8 max-w-3xl mx-auto font-sans text-foreground">
      {/* Page Header */}
      <header className="space-y-2 pb-8 border-b border-border">
        <div className="flex items-center gap-2">
          <Cookie className="size-6 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Cookie Policy
          </h1>
        </div>
        <p className="text-xs font-mono text-muted-foreground">
          Effective Date: September 15, 2026 &bull; Version 1.0 &bull; SaveDino Platform
        </p>
      </header>

      {/* Main Document Content */}
      <main className="py-8 space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        {/* Interactive Preferences Panel */}
        {mounted && (
          <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Your Current Cookie Preferences</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage your analytics and telemetry preferences at any time.
                </p>
              </div>

              <div>
                {consentStatus === "accepted" ? (
                  <Badge className="bg-emerald-600 text-white font-sans text-xs">
                    All Cookies Accepted
                  </Badge>
                ) : consentStatus === "essential_only" ? (
                  <Badge variant="secondary" className="font-sans text-xs">
                    Essential Only
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-sans text-xs">
                    Not Set (Default)
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60">
              <Button
                size="sm"
                variant={consentStatus === "accepted" ? "default" : "outline"}
                onClick={() => handleUpdateConsent("accepted")}
                className="text-xs font-bold shadow-arcade-xs active:translate-y-0.5 cursor-pointer"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Accept All Cookies</span>
              </Button>

              <Button
                size="sm"
                variant={consentStatus === "essential_only" ? "default" : "outline"}
                onClick={() => handleUpdateConsent("essential_only")}
                className="text-xs font-bold shadow-arcade-xs active:translate-y-0.5 cursor-pointer"
              >
                <ShieldCheck className="size-3.5" />
                <span>Essential Cookies Only</span>
              </Button>

              {consentStatus !== "not_set" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetConsent}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer ml-auto"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            1. What Are Cookies &amp; Local Storage?
          </h2>
          <p>
            Cookies and browser local storage are standard web technologies that store small pieces
            of data on your device when you visit websites. They help remember your preferences,
            maintain your logged-in session, and ensure secure, seamless navigation.
          </p>
        </section>

        {/* Section 2: How SaveDino Uses Storage */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            2. How SaveDino Uses Storage
          </h2>
          <p>SaveDino categorizes cookies and storage into three distinct categories:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Strictly Necessary / Essential:</strong> Required
              for the core platform to function. These handle secure authentication sessions, CSRF
              protection, and account security. You cannot disable these without breaking login
              capabilities.
            </li>
            <li>
              <strong className="text-foreground">Functional Preferences:</strong> Store your user
              interface choices, such as Day/Night theme mode, audio synthesizer mute toggle, and
              cookie consent settings.
            </li>
            <li>
              <strong className="text-foreground">
                Analytics &amp; Feature Flags (PostHog EU):
              </strong>{" "}
              Help our development team understand platform performance, measure campaign usage,
              track software crashes, and manage controlled Early Access feature flag rollouts. All
              analytics data is hosted strictly within European Union data centers.
            </li>
          </ul>
        </section>

        {/* Section 3: Detailed Storage Breakdown Table */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            3. Detailed Cookie &amp; Storage Inventory
          </h2>
          <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-muted/60 border-b border-border text-foreground font-semibold">
                  <tr>
                    <th className="p-3">Key / Identifier</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-muted-foreground font-sans">
                  <tr>
                    <td className="p-3 font-mono font-bold text-foreground text-xs">
                      better-auth.session_token
                    </td>
                    <td className="p-3">
                      <Badge variant="default" className="text-[10px] font-sans">
                        Essential
                      </Badge>
                    </td>
                    <td className="p-3">Manages secure logged-in authentication sessions.</td>
                    <td className="p-3 font-mono text-xs">7 days</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-foreground text-xs">
                      savedino_cookie_consent
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-[10px] font-sans">
                        Functional
                      </Badge>
                    </td>
                    <td className="p-3">Remembers your cookie choice (accept all or essential).</td>
                    <td className="p-3 font-mono text-xs">Persistent</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-foreground text-xs">theme</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-[10px] font-sans">
                        Functional
                      </Badge>
                    </td>
                    <td className="p-3">Persists Day Mode / Night Mode appearance choice.</td>
                    <td className="p-3 font-mono text-xs">Persistent</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-foreground text-xs">
                      ph_phc_* (PostHog)
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] font-sans">
                        Analytics
                      </Badge>
                    </td>
                    <td className="p-3">
                      EU-hosted telemetry, Early Access flag gating, and error diagnostics.
                    </td>
                    <td className="p-3 font-mono text-xs">365 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4: Third-Party Services */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            4. Third-Party Integrations
          </h2>
          <p>
            When utilizing third-party authentication services, such as Google Sign-In or Discord
            OAuth, those services may set their own authentication cookies according to their
            respective policies:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-sm">
            <li>
              <a
                href="https://policies.google.com/technologies/cookies"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Google Cookie Policy
              </a>
            </li>
            <li>
              <a
                href="https://discord.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                Discord Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://posthog.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-primary"
              >
                PostHog Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        {/* Section 5: Controlling & Deleting Cookies */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            5. Managing Cookies in Your Browser
          </h2>
          <p>
            In addition to our on-page consent controls, you can configure your browser to block or
            alert you about cookies. Please note that blocking essential cookies will prevent you
            from signing in to SaveDino or accessing your squad dashboard.
          </p>
        </section>

        {/* Section 6: Contact */}
        <section className="space-y-3 pb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">6. Contact Us</h2>
          <p>
            If you have questions about our Cookie Policy or privacy practices, please contact SEDS
            Sri Lanka at{" "}
            <a
              href="mailto:info@sedssl.org"
              className="text-foreground underline underline-offset-4 font-mono"
            >
              info@sedssl.org
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}

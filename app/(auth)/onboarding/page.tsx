"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRandomSeed } from "@/lib/seed-avatar";
import { User, Building, Globe, RefreshCw, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { DinoLoading } from "@/components/dino-loading";
import { validatePhoneNumber, getCountryName } from "@/lib/phone-validation";
import { PhoneInput } from "@/components/ui/phone-input";
import posthog from "posthog-js";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/campaigns";
  const { data: session, isPending: isSessionLoading } = useSession();

  const requestedStep = searchParams.get("step") === "2" ? 2 : 1;
  const isForceDebug = searchParams.get("force") === "true" || searchParams.get("step") !== null;

  // Multi-step state: 1 = Details, 2 = Discord Community Step
  const [step, setStep] = useState<1 | 2>(requestedStep as 1 | 2);

  // Form states
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [isDiscordConnected, setIsDiscordConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(!isForceDebug);

  const discordInviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg";

  useEffect(() => {
    if (isForceDebug) {
      setCheckingStatus(false);
      return;
    }

    if (!isSessionLoading) {
      if (!session?.user) {
        router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      // Check server profile to determine completion state
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const u = data.user;
            setIsDiscordConnected(Boolean(u.discordConnected));

            const isComplete =
              u.name &&
              u.name.trim().length > 0 &&
              !u.name.includes("@") &&
              u.name.toLowerCase() !== u.email?.toLowerCase() &&
              u.whatsapp &&
              u.whatsapp.trim().length > 0;

            // If already complete and not force debugging, proceed directly
            if (isComplete && !isForceDebug) {
              sessionStorage.setItem(`savedino_profile_completed_${u.id}`, "true");
              router.replace(redirectTo);
              return;
            }

            setName(u.name && !u.name.includes("@") ? u.name : "");
            setWhatsapp(u.whatsapp || "");
            setInstitution(u.institution || "");
            setCountry(u.country || "Sri Lanka");
          }
          setCheckingStatus(false);
        })
        .catch(() => {
          const user = session.user as any;
          setName(user.name && !user.name.includes("@") ? user.name : "");
          setWhatsapp(user.whatsapp || "");
          setInstitution(user.institution || "");
          setCountry(user.country || "Sri Lanka");
          setCheckingStatus(false);
        });
    }
  }, [session, isSessionLoading, redirectTo, router, isForceDebug]);

  // Step 1 Submission: Save profile details
  const handleSubmitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!whatsapp.trim()) {
      toast.error("Please enter your WhatsApp number.");
      return;
    }

    const phoneValidation = validatePhoneNumber(whatsapp, country);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error || "Please enter a valid WhatsApp phone number.");
      return;
    }

    setLoading(true);

    try {
      const formattedWhatsapp = phoneValidation.formatted || whatsapp.trim();
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: formattedWhatsapp,
          institution: institution.trim() || null,
          country: country.trim() || "Sri Lanka",
          image: (session?.user as any)?.image || getRandomSeed(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save profile details");
      }

      sessionStorage.setItem(`savedino_profile_completed_${(session?.user as any)?.id}`, "true");

      // Move to Step 2: Discord Community Step
      setStep(2);
    } catch (err: any) {
      posthog.captureException(err, { onboarding_step: 1 });
      toast.error(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Final Step: Complete Onboarding & Enter Mission Control
  const handleFinishOnboarding = () => {
    posthog.capture("onboarding_completed", {
      discord_connected: isDiscordConnected,
    });
    toast.success("Welcome aboard, Citizen Scientist!");
    window.location.href = redirectTo;
  };

  if (isSessionLoading || checkingStatus) {
    return <DinoLoading size="lg" text="Verifying citizen status..." fullScreen />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none bg-background text-foreground">
      {/* Top Left Code Comment Accent */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span>// onboarding: step {step} of 2</span>
          </div>
          <div className="flex items-center gap-1">
            <span>// citizen scientist setup</span>
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

      {/* Main Centered Onboarding Section */}
      <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center justify-center">
          <Logo href="/" size="lg" showEarlyAccess />
        </div>

        {/* Auth / Onboarding Card */}
        <div className="w-full bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          {step === 1 ? (
            <>
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
                  Complete your profile
                </h1>
                <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
                  Enter your details to finalize your citizen scientist profile before joining
                  campaigns and squads.
                </p>
              </div>

              <form onSubmit={handleSubmitStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider mb-1 text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 pl-10 font-sans text-xs bg-background"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider mb-1 text-foreground flex items-center justify-between">
                    <span>
                      WhatsApp Number <span className="text-destructive">*</span>
                    </span>
                    <span className="text-[10px] font-normal text-muted-foreground lowercase">
                      campaign coordination
                    </span>
                  </label>
                  <PhoneInput
                    value={whatsapp}
                    defaultCountry={country || "Sri Lanka"}
                    onChange={(val, meta) => {
                      setWhatsapp(val);
                      if (meta?.country) {
                        setCountry(getCountryName(meta.country));
                      }
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider mb-1 text-foreground">
                      School / Org
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Optional"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="h-11 pl-9 font-sans text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider mb-1 text-foreground">
                      Country
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Sri Lanka"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="h-11 pl-9 font-sans text-xs bg-background"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold mt-2 gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-arcade-primary active:translate-y-0.5 cursor-pointer"
                  disabled={loading || !name.trim() || !whatsapp.trim()}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* STEP 2: DISCORD SERVER */
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="size-12 rounded-2xl bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center mx-auto mb-2">
                  <DiscordIcon className="size-6" />
                </div>
                <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
                  Join our Discord Server
                </h1>
                <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
                  Join the official community to chat with asteroid hunters and receive campaign
                  updates.
                </p>
              </div>

              {/* Prominent Large Join Button */}
              <Button
                asChild
                className="w-full h-12 text-sm font-sans font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white rounded-xl shadow-arcade flex items-center justify-center gap-2 active:translate-y-0.5 cursor-pointer"
              >
                <a href={discordInviteUrl} target="_blank" rel="noopener noreferrer">
                  <DiscordIcon className="size-5 shrink-0" />
                  <span>Join the Discord Server</span>
                </a>
              </Button>

              {/* Continue to Platform Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleFinishOnboarding}
                className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold gap-2 border-border bg-background hover:bg-muted shadow-arcade active:translate-y-0.5 cursor-pointer"
              >
                <span>Continue to SaveDino</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="text-center text-[11px] font-sans text-muted-foreground pt-2 border-t border-border">
            SaveDino Citizen Science &bull; SEDS Sri Lanka
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={<DinoLoading size="lg" text="Loading citizen profile..." fullScreen />}>
      <OnboardingForm />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRandomSeed } from "@/lib/seed-avatar";
import { User, Building, Globe, Phone, RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { DinoLoading } from "@/components/dino-loading";

import { validatePhoneNumber, resolveCountryCode, getCountryName } from "@/lib/phone-validation";
import { PhoneInput } from "@/components/ui/phone-input";

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/campaigns";
  const { data: session, isPending: isSessionLoading } = useSession();

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isSessionLoading) {
      if (!session?.user) {
        router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      // Query database directly to check for existing completion
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const user = data.user;
            const isComplete =
              user.name &&
              user.name.trim().length > 0 &&
              !user.name.includes("@") &&
              user.name.toLowerCase() !== user.email?.toLowerCase() &&
              user.whatsapp &&
              user.whatsapp.trim().length > 0;

            if (isComplete) {
              sessionStorage.setItem(`savedino_profile_completed_${user.id}`, "true");
              window.location.href = redirectTo;
              return;
            }

            if (!initialized) {
              setName(user.name && !user.name.includes("@") ? user.name : "");
              setWhatsapp(user.whatsapp || "");
              setInstitution(user.institution || "");
              setCountry(user.country || "Sri Lanka");
              setInitialized(true);
            }
          }
        })
        .catch(() => {
          const user = session.user as any;
          if (!initialized) {
            setName(user.name && !user.name.includes("@") ? user.name : "");
            setWhatsapp(user.whatsapp || "");
            setInstitution(user.institution || "");
            setCountry(user.country || "Sri Lanka");
            setInitialized(true);
          }
        });
    }
  }, [session, isSessionLoading, redirectTo, router, initialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!whatsapp.trim()) {
      toast.error("Please enter your WhatsApp number.");
      return;
    }

    // Standard phone number validation
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

      toast.success("Profile setup complete! Welcome aboard.");
      sessionStorage.setItem(`savedino_profile_completed_${(session?.user as any)?.id}`, "true");
      window.location.href = redirectTo;
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  if (isSessionLoading) {
    return <DinoLoading size="lg" text="Loading citizen profile..." fullScreen />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 select-none bg-background text-foreground">
      {/* Top Left Code Comment Accent */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-muted-foreground">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <span>// profile setup</span>
          </div>
          <div className="flex items-center gap-1">
            <span>// citizen scientist</span>
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
          <Logo href="/" size="lg" />
        </div>

        {/* Profile Card */}
        <div className="w-full bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-sans font-bold tracking-tight text-foreground">
              Complete your profile
            </h1>
            <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
              Enter your details to finalize your citizen scientist profile before joining campaigns
              and squads.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full h-11 font-sans text-xs uppercase tracking-wider font-bold mt-2 gap-2"
              disabled={loading || !name.trim() || !whatsapp.trim()}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-[11px] font-sans text-muted-foreground pt-2 border-t border-border">
            Your name and WhatsApp number are required for observation campaign credentials.
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
    <Suspense fallback={<DinoLoading size="lg" text="Loading..." fullScreen />}>
      <OnboardingForm />
    </Suspense>
  );
}

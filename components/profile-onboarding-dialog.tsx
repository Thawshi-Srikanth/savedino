"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRandomSeed } from "@/lib/seed-avatar";
import { Sparkles, User, Building2, Globe, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function ProfileOnboardingDialog() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");

  useEffect(() => {
    // Don't pop up on auth pages (login, register, verify) or on the dedicated profile page
    if (
      !session?.user?.id ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/verify" ||
      pathname === "/profile"
    ) {
      setIsOpen(false);
      return;
    }

    // Check if user dismissed onboarding in this browser session
    const dismissed = sessionStorage.getItem("savedino_onboarding_dismissed");
    if (dismissed) {
      return;
    }

    // Determine if profile is incomplete:
    // Missing institution OR name is empty / default email prefix
    const user = session.user as any;
    const isEmailPrefixName =
      !user.name ||
      user.name.trim() === "" ||
      user.name.includes("@") ||
      (user.email && user.name.toLowerCase() === user.email.split("@")[0].toLowerCase());

    const isMissingInstitution = !user.institution || user.institution.trim() === "";

    if ((isEmailPrefixName || isMissingInstitution) && !hasChecked) {
      setName(user.name && !user.name.includes("@") ? user.name : "");
      setInstitution(user.institution || "");
      setCountry(user.country || "");
      // System assigns a default random avatar seed if one does not already exist
      setAvatarSeed(user.image || getRandomSeed());
      setIsOpen(true);
      setHasChecked(true);
    }
  }, [session, pathname, hasChecked]);

  const handleDismiss = () => {
    sessionStorage.setItem("savedino_onboarding_dismissed", "true");
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          institution: institution.trim() || null,
          country: country.trim() || null,
          image: avatarSeed.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save profile details");
      }

      toast.success("Profile setup complete! Welcome aboard.");
      sessionStorage.setItem("savedino_onboarding_dismissed", "true");
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleDismiss();
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto p-5 sm:p-6 bg-card border border-border rounded-2xl shadow-2xl font-sans">
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold w-fit">
            <Sparkles className="size-3" />
            <span>Welcome Citizen Scientist</span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please enter your display name and affiliation to get started with observation campaigns and squads.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="onboard-name" className="text-xs font-bold flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                <span>
                  Full Name <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                id="onboard-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Hunter"
                className="h-9 text-xs rounded-xl"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="onboard-inst" className="text-xs font-bold flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                <span>School / University / Organization</span>
              </Label>
              <Input
                id="onboard-inst"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Astro Club, Stanford University"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="onboard-country" className="text-xs font-bold flex items-center gap-1.5">
                <Globe className="size-3.5 text-primary" />
                <span>Country / Region</span>
              </Label>
              <Input
                id="onboard-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States, Japan, Germany"
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Do this later
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-[0_2px_0_0_#6d28d9] dark:shadow-[0_2px_0_0_#5b21b6] active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save &amp; Continue</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

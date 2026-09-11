"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";

export function ProfileOnboardingDialog() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Don't intercept auth pages, onboarding, verify, or when not signed in
    if (
      isPending ||
      !session?.user?.id ||
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/verify" ||
      pathname === "/onboarding" ||
      pathname === "/create"
    ) {
      return;
    }

    // Fast-path: check if profile completion was already verified in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("savedino_profile_completed") === "true") {
      return;
    }

    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Verify against fresh server profile data
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const u = data.user;
          const isCompleteName =
            u.name &&
            u.name.trim().length > 0 &&
            !u.name.includes("@") &&
            u.name.toLowerCase() !== u.email?.toLowerCase();

          const isCompleteWhatsapp = u.whatsapp && u.whatsapp.trim().length > 0;

          if (isCompleteName && isCompleteWhatsapp) {
            sessionStorage.setItem("savedino_profile_completed", "true");
          } else {
            sessionStorage.removeItem("savedino_profile_completed");
            router.push(`/onboarding?redirectTo=${encodeURIComponent(pathname)}`);
          }
        }
      })
      .catch(() => {
        // Fallback to session user if API fails
        const user = session.user as any;
        const isMissingName =
          !user.name ||
          user.name.trim() === "" ||
          user.name.includes("@") ||
          (user.email && user.name.toLowerCase() === user.email.toLowerCase());

        const isMissingWhatsapp = !user.whatsapp || user.whatsapp.trim() === "";

        if (isMissingName || isMissingWhatsapp) {
          router.push(`/onboarding?redirectTo=${encodeURIComponent(pathname)}`);
        }
      });
  }, [session, isPending, pathname, router]);

  return null;
}

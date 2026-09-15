"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/user-profile";

export function ProfileOnboardingDialog() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (isSessionLoading || !session?.user) {
      return;
    }

    if (
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/verify")
    ) {
      return;
    }

    // Fast-path: check if profile completion was already verified in this session for this specific user
    const storageKey = `savedino_profile_completed_${session.user.id}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "true") {
      return;
    }

    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Verify against fresh server profile data with deduplication
    getUserProfile()
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
            sessionStorage.setItem(storageKey, "true");
          } else {
            sessionStorage.removeItem(storageKey);
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
  }, [session, isSessionLoading, pathname, router]);

  return null;
}

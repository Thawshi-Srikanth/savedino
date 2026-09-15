import { prisma } from "./prisma";
import { isFeatureFlagEnabled, getPostHogClient } from "./posthog-server";

export interface EarlyAccessResult {
  allowed: boolean;
  reason?: "posthog_allowed" | "admin_role" | "env_whitelist" | "public_access";
  error?: string;
}

/**
 * Checks if a specific email address is allowed to sign in or register.
 * PostHog Feature Flag ("early-access-allowed") is the primary real-time source of truth.
 */
export async function checkEarlyAccessPermission(email: string): Promise<EarlyAccessResult> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Always allow existing Admin / Staff or first DB user to prevent lockout
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { role: true },
    });

    if (existingUser && (existingUser.role === "admin" || existingUser.role === "staff")) {
      return { allowed: true, reason: "admin_role" };
    }

    const userCount = await prisma.user.count();
    if (userCount === 0) {
      return { allowed: true, reason: "admin_role" };
    }
  } catch (dbErr) {
    console.warn("[Early Access] DB check warning:", dbErr);
  }

  // 2. IMMEDIATE OVERRIDE: Environment whitelist (EARLY_ACCESS_EMAILS)
  // Ensures emails listed in environment variables are always allowed, even before PostHog flag evaluation
  const envWhitelist = (process.env.EARLY_ACCESS_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (envWhitelist.length > 0) {
    const isDirectMatch = envWhitelist.includes(normalizedEmail);
    const isDomainMatch = envWhitelist.some(
      (entry) => entry.startsWith("@") && normalizedEmail.endsWith(entry)
    );

    if (isDirectMatch || isDomainMatch) {
      return { allowed: true, reason: "env_whitelist" };
    }
  }

  // 3. PostHog Dynamic Feature Flag ("early-access-allowed")
  const posthog = getPostHogClient();
  if (posthog) {
    try {
      // Evaluate flag in PostHog for this user email (with email person property)
      const isAllowed = await isFeatureFlagEnabled(normalizedEmail, "early-access-allowed", {
        email: normalizedEmail,
      });

      // If flag is explicitly evaluated by PostHog:
      if (isAllowed === true) {
        return { allowed: true, reason: "posthog_allowed" };
      } else if (isAllowed === false) {
        return {
          allowed: false,
          error: "EARLY_ACCESS_REQUIRED",
        };
      }
    } catch (phErr) {
      console.warn("[Early Access] PostHog evaluation warning:", phErr);
    }
  }

  const isDemoModeActive =
    process.env.EARLY_ACCESS_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.DEMO_MODE === "true";

  if (isDemoModeActive) {
    return {
      allowed: false,
      error: "EARLY_ACCESS_REQUIRED",
    };
  }

  // Default: Open public access if no gating is active
  return { allowed: true, reason: "public_access" };
}

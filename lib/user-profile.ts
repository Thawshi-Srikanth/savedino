import { updateCachedUser } from "./auth-client";

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  institution?: string | null;
  country?: string | null;
  whatsapp?: string | null;
  tourCompleted?: boolean;
  createdAt: string | Date;
  discordConnected?: boolean;
  connectedProviders?: string[];
}

export interface UserProfileResponse {
  success: boolean;
  user: UserProfileData;
  campaigns?: any[];
  teams?: any[];
  claimedSets?: any[];
  joinRequests?: any[];
  stats?: {
    campaignsCount: number;
    teamsCount: number;
    squadsLeadCount: number;
    claimedSetsCount: number;
    submittedSetsCount: number;
  };
  error?: string;
}

let cachedProfile: UserProfileResponse | null = null;
let cachedAt = 0;
let inFlightPromise: Promise<UserProfileResponse> | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds fresh cache

/**
 * Single-flight deduplicated profile fetcher.
 * Prevents multiple simultaneous components from spamming /api/user/profile.
 */
export async function getUserProfile(force = false): Promise<UserProfileResponse> {
  if (typeof window === "undefined") {
    return { success: false, user: {} as any, error: "Server environment" };
  }

  const isFresh = Date.now() - cachedAt < CACHE_TTL_MS;
  if (!force && cachedProfile && isFresh) {
    return cachedProfile;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const res = await fetch("/api/user/profile", {
        headers: { "Content-Type": "application/json" },
      });
      const data: UserProfileResponse = await res.json();
      if (data.success && data.user) {
        cachedProfile = data;
        cachedAt = Date.now();
        // Keep session store synchronized with database seed & details
        updateCachedUser(data.user);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        user: {} as any,
        error: err?.message || "Failed to load profile",
      };
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

/**
 * Invalidate in-memory profile cache (e.g. after profile save or team changes)
 */
export function invalidateUserProfileCache() {
  cachedProfile = null;
  cachedAt = 0;
}

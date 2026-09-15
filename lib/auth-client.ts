import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import posthog from "posthog-js";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [magicLinkClient()],
});

// ---------------------------------------------------------------------------
// High-Performance In-Memory & Local Storage Session Cache
// Prevents duplicate /api/auth/get-session spam and synchronizes tabs smoothly.
// ---------------------------------------------------------------------------

const SESSION_STORAGE_KEY = "savedino_cached_session";
const SESSION_TIMESTAMP_KEY = "savedino_session_cached_at";
const AUTH_CHANNEL_NAME = "savedino_auth_sync_channel";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in-memory freshness

export type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: string;
    image?: string | null;
    institution?: string | null;
    country?: string | null;
    whatsapp?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string | Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
} | null;

interface SessionStoreState {
  data: SessionData;
  isPending: boolean;
  error: any;
}

// Initial state from localStorage if available (instant hydration, zero network delay)
function getInitialCachedSession(): SessionData {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    const timestamp = parseInt(localStorage.getItem(SESSION_TIMESTAMP_KEY) || "0", 10);
    if (raw && Date.now() - timestamp < CACHE_TTL_MS * 2) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return null;
}

let memoryState: SessionStoreState = {
  data: getInitialCachedSession(),
  isPending: typeof window !== "undefined" && !getInitialCachedSession(),
  error: null,
};

function identifyPostHogUser(data: SessionData) {
  if (data?.user?.id) {
    posthog.identify(data.user.id, {
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
    });
  }
}

identifyPostHogUser(memoryState.data);

const listeners = new Set<() => void>();
let inFlightPromise: Promise<SessionData> | null = null;
let broadcastChannel: BroadcastChannel | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function updateSessionState(data: SessionData, error: any = null) {
  memoryState = {
    data,
    isPending: false,
    error,
  };
  identifyPostHogUser(data);

  if (typeof window !== "undefined") {
    try {
      if (data) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
      }
    } catch (e) {}
  }

  emitChange();
}

/**
 * Single-flight deduplicated session fetcher
 */
export async function fetchSessionDeduplicated(force = false): Promise<SessionData> {
  if (typeof window === "undefined") return null;

  // Check if current memory cache is still fresh and not forced
  const cachedAt = parseInt(localStorage.getItem(SESSION_TIMESTAMP_KEY) || "0", 10);
  const isFresh = Date.now() - cachedAt < CACHE_TTL_MS;

  if (!force && memoryState.data && isFresh) {
    return memoryState.data;
  }

  // If already fetching, reuse the in-flight promise
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      const res = await authClient.getSession();
      const sessionData = (res?.data as SessionData) || null;
      updateSessionState(sessionData, res?.error || null);
      return sessionData;
    } catch (err) {
      updateSessionState(null, err);
      return null;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

/**
 * Initializes global broadcast & storage listeners for multi-tab sync
 */
if (typeof window !== "undefined") {
  // Setup BroadcastChannel for instant cross-tab sync without extra network requests
  if ("BroadcastChannel" in window) {
    try {
      broadcastChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === "SESSION_UPDATE") {
          const wasIdentified = Boolean(memoryState.data?.user?.id);
          memoryState = {
            data,
            isPending: false,
            error: null,
          };
          if (data) {
            identifyPostHogUser(data);
          } else if (wasIdentified) {
            posthog.reset();
          }
          emitChange();
        } else if (type === "SESSION_INVALIDATE") {
          fetchSessionDeduplicated(true);
        }
      };
    } catch (e) {}
  }

  // Storage event fallback for older browsers
  window.addEventListener("storage", (event) => {
    if (event.key === SESSION_STORAGE_KEY) {
      try {
        const newData = event.newValue ? JSON.parse(event.newValue) : null;
        const wasIdentified = Boolean(memoryState.data?.user?.id);
        memoryState = {
          data: newData,
          isPending: false,
          error: null,
        };
        if (newData) {
          identifyPostHogUser(newData);
        } else if (wasIdentified) {
          posthog.reset();
        }
        emitChange();
      } catch (e) {}
    }
  });

  // Initial single-flight fetch only if we have no valid cache
  const cachedAt = parseInt(localStorage.getItem(SESSION_TIMESTAMP_KEY) || "0", 10);
  if (!memoryState.data || Date.now() - cachedAt >= CACHE_TTL_MS) {
    fetchSessionDeduplicated(false);
  }
}

/**
 * Broadcasts session update to all other open tabs
 */
function broadcastSessionChange(type: "SESSION_UPDATE" | "SESSION_INVALIDATE", data?: SessionData) {
  if (typeof window !== "undefined" && broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type, data });
    } catch (e) {}
  }
}

/**
 * Invalidate session cache (e.g., after profile edit or persona switch)
 */
export async function invalidateSessionCache() {
  broadcastSessionChange("SESSION_INVALIDATE");
  return fetchSessionDeduplicated(true);
}

/**
 * Update cached user fields in local session store & broadcast to all open tabs
 */
export function updateCachedUser(partialUser: Partial<NonNullable<SessionData>["user"]>) {
  if (!memoryState.data?.user) return;

  let hasChanged = false;
  for (const [key, value] of Object.entries(partialUser)) {
    if (value !== undefined && (memoryState.data.user as any)[key] !== value) {
      hasChanged = true;
      break;
    }
  }

  if (!hasChanged) return;

  const updatedData: SessionData = {
    ...memoryState.data,
    user: {
      ...memoryState.data.user,
      ...partialUser,
    },
  };
  updateSessionState(updatedData);
  broadcastSessionChange("SESSION_UPDATE", updatedData);
}

const SERVER_SNAPSHOT: SessionStoreState = { data: null, isPending: false, error: null };
const getServerSnapshot = () => SERVER_SNAPSHOT;
const getClientSnapshot = () => memoryState;

/**
 * Optimized React hook: Drop-in replacement for Better-Auth `useSession()`
 * - Instant local storage hydration (zero layout shift)
 * - Single-flight network deduplication (no 10x /api/auth/get-session calls)
 * - Cross-tab real-time sync with BroadcastChannel
 */
export function useSession() {
  const state = useSyncExternalStore(
    useCallback((onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    }, []),
    getClientSnapshot,
    getServerSnapshot
  );

  const refetch = useCallback(async () => {
    return fetchSessionDeduplicated(true);
  }, []);

  return {
    data: state.data,
    isPending: state.isPending,
    error: state.error,
    refetch,
  };
}

// Wrapper for signOut that instantly clears local cache and notifies all tabs
export const signOut = async (options?: any) => {
  if (memoryState.data?.user?.id) {
    posthog.capture("user_logged_out");
    posthog.reset();
  }
  updateSessionState(null);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.clear();
    } catch (e) {}
  }
  broadcastSessionChange("SESSION_UPDATE", null);
  return authClient.signOut(options);
};

// Export remaining authClient methods
export const { signIn, signUp } = authClient;

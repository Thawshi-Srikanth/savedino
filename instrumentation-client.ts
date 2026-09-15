import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

if (!projectToken) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[PostHog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not configured. Analytics events will be skipped."
    );
  }
} else if (typeof window !== "undefined") {
  posthog.init(projectToken, {
    api_host: host,
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}

import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogClient() {
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  // Node.js server connects directly to EU Cloud ingestion
  const host =
    process.env.POSTHOG_SERVER_HOST ||
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    "https://eu.i.posthog.com";

  if (!projectToken) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[PostHog Server] Project token is not configured. Server events will be skipped."
      );
    }
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(projectToken, {
      host,
      flushAt: 1,
      flushInterval: 0,
      enableExceptionAutocapture: true,
    });
  }

  return posthogClient;
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.capture({ distinctId, event, properties });
    await client.flush();
  } catch (err) {
    console.warn("[PostHog Server] Event capture warning:", err);
  }
}

export async function captureServerException(
  error: unknown,
  distinctId: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.captureException(error, distinctId, properties);
    await client.flush();
  } catch (err) {
    console.warn("[PostHog Server] Exception capture warning:", err);
  }
}

/**
 * Checks if a specific PostHog Feature Flag is enabled for a given distinctId/email
 */
export async function isFeatureFlagEnabled(
  distinctId: string,
  flagKey: string,
  personProperties?: Record<string, string | number | boolean>
): Promise<boolean | null> {
  const client = getPostHogClient();
  if (!client) return null;

  try {
    const props = personProperties || { email: distinctId };

    if (typeof (client as any).isFeatureEnabled === "function") {
      const enabled = await (client as any).isFeatureEnabled(flagKey, distinctId, {
        personProperties: props,
      });
      if (typeof enabled === "boolean") return enabled;
    }

    if (typeof (client as any).getFeatureFlag === "function") {
      const flagVal = await (client as any).getFeatureFlag(flagKey, distinctId, {
        personProperties: props,
      });
      if (typeof flagVal === "boolean") return flagVal;
      if (flagVal !== undefined && flagVal !== null) return Boolean(flagVal);
    }

    return null;
  } catch (err) {
    console.warn(`[PostHog Server] Error evaluating flag "${flagKey}":`, err);
    return null;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCountryFlag } from "@/lib/phone-validation";

export const dynamic = "force-dynamic";

// In-memory cache for fast lookups
const ipGeoCache = new Map<
  string,
  {
    country: string;
    countryCode: string;
    city?: string;
    region?: string;
    flagEmoji: string;
    flagUrl?: string;
    isPrivate?: boolean;
    cachedAt: number;
  }
>();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const cleanIp = ip.trim().replace(/^::ffff:/, "");
  if (
    cleanIp === "127.0.0.1" ||
    cleanIp === "::1" ||
    cleanIp === "localhost" ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp) ||
    cleanIp.startsWith("fc00:") ||
    cleanIp.startsWith("fe80:")
  ) {
    return true;
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user.role !== "admin" && session.user.role !== "staff")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin or Staff privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const ip = searchParams.get("ip")?.trim();

    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP address parameter is required." },
        { status: 400 }
      );
    }

    // Check private/local IPs
    if (isPrivateIp(ip)) {
      return NextResponse.json({
        success: true,
        ip,
        isPrivate: true,
        country: "Local / Development",
        countryCode: "LOC",
        city: "Localhost",
        flagEmoji: "💻",
        flagUrl: undefined,
      });
    }

    // Check cache
    const cached = ipGeoCache.get(ip);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        ip,
        ...cached,
      });
    }

    // Query IP geolocation from ipwho.is with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "SaveDino-Admin-Lookup/1.0",
        },
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.country_code) {
          const countryCode = String(data.country_code).toUpperCase();
          const country = data.country || countryCode;
          const city = data.city || "";
          const region = data.region || "";
          const flagEmoji = data.flag?.emoji || getCountryFlag(countryCode);
          const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

          const result = {
            country,
            countryCode,
            city,
            region,
            flagEmoji,
            flagUrl,
            isPrivate: false,
            cachedAt: Date.now(),
          };

          ipGeoCache.set(ip, result);

          return NextResponse.json({
            success: true,
            ip,
            ...result,
          });
        }
      }
    } catch {
      // Fallback or ignore network error
    }

    // Fallback: ip-api.com
    try {
      const fallbackRes = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,regionName`,
        { headers: { Accept: "application/json" } }
      );

      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        if (fbData.status === "success" && fbData.countryCode) {
          const countryCode = String(fbData.countryCode).toUpperCase();
          const country = fbData.country || countryCode;
          const city = fbData.city || "";
          const flagEmoji = getCountryFlag(countryCode);
          const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;

          const result = {
            country,
            countryCode,
            city,
            region: fbData.regionName || "",
            flagEmoji,
            flagUrl,
            isPrivate: false,
            cachedAt: Date.now(),
          };

          ipGeoCache.set(ip, result);

          return NextResponse.json({
            success: true,
            ip,
            ...result,
          });
        }
      }
    } catch {
      // Ignore fallback error
    }

    // Default if unresolvable
    return NextResponse.json({
      success: true,
      ip,
      country: "Unknown Country",
      countryCode: "UN",
      flagEmoji: "🌐",
      flagUrl: undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to lookup IP." },
      { status: 500 }
    );
  }
}

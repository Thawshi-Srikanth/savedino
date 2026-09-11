import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://savedino.sedssl.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/campaigns",
          "/campaigns/*",
          "/teams",
          "/credits",
          "/terms",
          "/privacy",
          "/login",
          "/register",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/verify",
          "/onboarding",
          "/profile",
          "/profile/*",
          "/team/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

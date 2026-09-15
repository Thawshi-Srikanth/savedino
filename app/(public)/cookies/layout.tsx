import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | SaveDino Asteroid Search",
  description:
    "Information on how SaveDino uses essential cookies, local storage, and privacy-first EU-hosted PostHog analytics.",
  openGraph: {
    title: "Cookie Policy | SaveDino Asteroid Search",
    description:
      "Information on how SaveDino uses essential cookies, local storage, and privacy-first EU-hosted PostHog analytics.",
    url: "/cookies",
    images: ["/opengraph-image.png"],
  },
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

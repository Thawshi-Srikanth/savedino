import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citizen Science Asteroid Squads & Discovery Teams",
  description:
    "Browse citizen science research squads participating in global asteroid search campaigns. Join a team using an invite code or create your own research squad.",
  keywords: [
    "Sri Lanka",
    "Sri Lanka Astronomy Teams",
    "SEDS Sri Lanka Squads",
    "Asteroid Finding Teams",
    "Asteroid Search Squads",
    "Citizen Science Teams",
    "Discovery Squads",
    "Astronomy Teams",
    "Asteroid Competition Squads",
    "IASC Team Collaboration",
  ],
  openGraph: {
    title: "Asteroid Search Squads & Teams | SaveDino",
    description:
      "Form or join a citizen science research squad to hunt for asteroids and collaborate in telescope image analysis.",
    url: "/teams",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SaveDino Citizen Science Asteroid Search Squads",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asteroid Search Squads & Teams | SaveDino",
    description:
      "Form or join a citizen science research squad to hunt for asteroids with SEDS Sri Lanka and IASC.",
    images: ["/opengraph-image.png"],
  },
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

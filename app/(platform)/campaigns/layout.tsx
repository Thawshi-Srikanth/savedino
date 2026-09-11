import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asteroid Search Campaigns & Citizen Science Challenges",
  description:
    "Explore active asteroid search campaigns organized by SEDS Sri Lanka and IASC. Form citizen science squads, analyze Pan-STARRS telescope surveys, and discover new near-Earth asteroids.",
  keywords: [
    "Sri Lanka",
    "Sri Lanka Asteroid Search",
    "SEDS Sri Lanka",
    "All-Sri Lanka Asteroid Search Campaign",
    "Asteroid Search Campaign",
    "Asteroid Search Campaigns",
    "Asteroid Competition",
    "Asteroid Challenge",
    "Asteroid Finding Guide",
    "Asteroid Hunting",
    "IASC Observation Campaigns",
    "NASA Planetary Defense Challenge",
    "Pan-STARRS Sky Survey",
    "Citizen Science Astronomy",
  ],
  openGraph: {
    title: "Asteroid Search Campaigns | SaveDino",
    description:
      "Join active asteroid search campaigns. Analyze real telescope data, discover moving objects, and submit preliminary asteroid reports to IASC & MPC.",
    url: "/campaigns",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SaveDino Asteroid Search Campaigns",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asteroid Search Campaigns | SaveDino",
    description:
      "Join active asteroid search campaigns. Analyze real telescope data and hunt for new asteroids!",
    images: ["/opengraph-image.png"],
  },
};

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

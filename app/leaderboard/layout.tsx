import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaveDino Champions | Global Planetary Defenders",
  description:
    "Top planetary defenders and asteroid high scores on the global SaveDino arcade leaderboard.",
  keywords: [
    "SaveDino Champions",
    "SaveDino Leaderboard",
    "Asteroid Game High Scores",
    "SEDS Sri Lanka",
    "Planetary Defense Ranking",
    "Dino Game Champions",
  ],
  openGraph: {
    title: "SaveDino Champions | Planetary Defenders Leaderboard",
    description: "See the top global high scores on the SaveDino arcade game.",
    url: "/leaderboard",
    images: ["/opengraph-image.png"],
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

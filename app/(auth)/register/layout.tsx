import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Join Asteroid Search Campaigns",
  description:
    "Join SaveDino to participate in official IASC & NASA Planetary Defense asteroid search challenges. Sign up with your email to start analyzing telescope sky surveys.",
  keywords: [
    "Join Asteroid Search",
    "Asteroid Search Registration",
    "Citizen Scientist Sign Up",
    "Asteroid Challenge Account",
  ],
  openGraph: {
    title: "Join Asteroid Search Campaigns | SaveDino",
    description:
      "Create your citizen scientist account and join research squads to discover real asteroids.",
    url: "/register",
    images: ["/opengraph-image.png"],
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

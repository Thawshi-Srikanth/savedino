import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Access Asteroid Search Dashboard",
  description:
    "Sign in to SaveDino to access your active asteroid search squads, claimed image sets, and campaign discovery reports.",
  openGraph: {
    title: "Sign In | SaveDino",
    description: "Access your asteroid search campaigns, squad workspaces, and observation data.",
    url: "/login",
    images: ["/opengraph-image.png"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

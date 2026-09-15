import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits & Attributions | Open Source & Astronomical Partners",
  description:
    "Honoring the scientific partners, planetary defense organizations (SEDS Sri Lanka, IASC, Pan-STARRS, NASA PDCO, MPC), open-source software projects, and contributors powering SaveDino.",
  keywords: [
    "Sri Lanka",
    "SEDS Sri Lanka",
    "Sri Lanka Space Community",
    "SaveDino Credits",
    "IASC Asteroid Search",
    "NASA Planetary Defense",
    "Pan-STARRS Observatory",
    "Open Source Astronomy",
  ],
  openGraph: {
    title: "Credits & Attributions | SaveDino",
    description:
      "Honoring scientific partners, open-source projects, and contributors powering the SaveDino asteroid search platform.",
    url: "/credits",
    images: ["/opengraph-image.png"],
  },
};

export default function CreditsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

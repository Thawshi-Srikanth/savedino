import type { Metadata } from "next";
import { Press_Start_2P, Space_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AudioRouteGuard } from "./components/AudioRouteGuard";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { DevPersonaSwitcher } from "@/components/dev-persona-switcher";
import { CookieConsent } from "@/components/cookie-consent";

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-tech",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://savedino.sedssl.org";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SaveDino | Asteroid Search Campaign & Citizen Science Challenge",
    template: "%s | SaveDino",
  },
  description:
    "Join international citizen science asteroid search campaigns with SEDS Sri Lanka, IASC, and NASA Planetary Defense. Analyze Pan-STARRS sky surveys, form research squads, and discover real asteroids!",
  keywords: [
    "Sri Lanka",
    "Sri Lanka Asteroid Search",
    "Sri Lanka Astronomy",
    "Sri Lanka Space",
    "SEDS Sri Lanka",
    "SEDS",
    "Astronomy Sri Lanka",
    "Space Exploration Sri Lanka",
    "Sri Lanka Citizen Science",
    "All-Sri Lanka Asteroid Search Campaign",
    "Asteroid Search Campaign",
    "Asteroid Search Campaigns",
    "Asteroid Competition",
    "Asteroid Challenge",
    "Asteroid Finding Guide",
    "Asteroid Hunting",
    "Citizen Science Asteroid Search",
    "SaveDino",
    "Save Dino",
    "IASC Asteroid Search",
    "International Astronomical Search Collaboration",
    "NASA Planetary Defense",
    "Pan-STARRS Sky Survey",
    "Astrometrica Analysis",
    "Minor Planet Center",
    "MPC Discovery",
    "Astronomy Competitions",
    "Citizen Science Space Research",
    "Near Earth Objects",
  ],
  authors: [
    { name: "SEDS Sri Lanka", url: "https://sedssl.org" },
    { name: "Thawshi Srikanth", url: "https://thawshi.com" },
  ],
  creator: "SEDS Sri Lanka",
  publisher: "SEDS Sri Lanka",
  category: "Science & Education",
  applicationName: "SaveDino",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "SaveDino",
    title: "SaveDino | Asteroid Search Campaign & Citizen Science Challenge",
    description:
      "Join international asteroid search campaigns with SEDS Sri Lanka & IASC. Team up with squads, inspect telescope survey frames, and hunt for undiscovered asteroids!",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SaveDino - Asteroid Search Campaign & Citizen Science Competition",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaveDino | Asteroid Search Campaign & Citizen Science Challenge",
    description:
      "Join international asteroid search campaigns with SEDS Sri Lanka & IASC. Form squads, inspect telescope surveys, and discover real asteroids!",
    images: ["/opengraph-image.png"],
    creator: "@SEDSSriLanka",
    site: "@SEDSSriLanka",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "SaveDino",
      url: baseUrl,
      logo: `${baseUrl}/opengraph-image.png`,
      sameAs: ["https://sedssl.org", "https://github.com/Thawshi-Srikanth/savedino"],
      description:
        "Citizen science asteroid search platform and planetary defense initiative by SEDS Sri Lanka in collaboration with IASC, Pan-STARRS, and NASA Planetary Defense.",
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "SaveDino - Asteroid Search Campaign & Citizen Science Challenge",
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      description:
        "Join international asteroid search campaigns, hunt for near-Earth objects in astronomical sky surveys, and participate in citizen science discovery squads.",
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${pressStart2P.variable} ${spaceMono.variable} ${inter.variable} ${outfit.variable} min-h-full antialiased overscroll-none`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${pressStart2P.variable} ${spaceMono.variable} ${inter.variable} ${outfit.variable} min-h-screen flex flex-col bg-background text-foreground font-sans antialiased overscroll-none`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AudioRouteGuard />
          <Toaster position="top-right" />
          <CookieConsent />
          {children}
          {process.env.NODE_ENV === "development" && <DevPersonaSwitcher />}
        </ThemeProvider>
      </body>
    </html>
  );
}

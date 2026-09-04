import type { Metadata } from "next";
import { Press_Start_2P, Space_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AudioRouteGuard } from "./components/AudioRouteGuard";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";


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

export const metadata: Metadata = {
  title: "Save Dino — Asteroid Finding Challenge",
  description: "Dodge incoming sky meteorites, avoid obstacles, and save the Dino from extinction!",
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
      className={`${pressStart2P.variable} ${spaceMono.variable} ${inter.variable} ${outfit.variable} h-full antialiased overscroll-none`}
    >
      <body
        suppressHydrationWarning
        className={`${pressStart2P.variable} ${spaceMono.variable} ${inter.variable} ${outfit.variable} min-h-screen flex flex-col bg-background text-foreground font-sans antialiased overscroll-none`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AudioRouteGuard />
          <Toaster position="top-right" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

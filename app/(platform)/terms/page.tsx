import React from "react";
import Link from "next/link";
import {
  Scale,
  Users,
  Telescope,
  AlertTriangle,
  ShieldCheck,
  Mail,
  ArrowLeft,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions - SaveDino Documentation",
  description:
    "Official Terms of Service, research standards, and squad participation guidelines for SaveDino citizen scientists.",
};

const tocSections = [
  { id: "acceptance", number: "01", title: "Acceptance of Terms" },
  { id: "accounts", number: "02", title: "Accounts & Squad Roles" },
  { id: "scientific-integrity", number: "03", title: "Scientific Data & Attribution" },
  { id: "conduct", number: "04", title: "Platform Code of Conduct" },
  { id: "intellectual-property", number: "05", title: "Intellectual Property" },
  { id: "disclaimers", number: "06", title: "Service Availability & Liability" },
  { id: "contact", number: "07", title: "Contact Information" },
];

export default function TermsPage() {
  const lastUpdated = "September 11, 2026";
  const version = "v1.2";

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-8 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Metadata Header */}
      <div className="space-y-4 pb-8 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Link
              href="/"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="size-3" />
              <span>Arcade</span>
            </Link>
            <ChevronRight className="size-3 opacity-40" />
            <span>Docs</span>
            <ChevronRight className="size-3 opacity-40" />
            <span className="text-foreground font-semibold">Terms &amp; Conditions</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]">
              <span className="size-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Active Standard
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {version} &bull; {lastUpdated}
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[#8b5cf6]">
            <span>// LEGAL &amp; PARTICIPATION STANDARD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm sm:text-base font-sans text-muted-foreground max-w-3xl leading-relaxed">
            These terms define the participation rules, scientific research integrity standards, and
            squad responsibilities for citizen scientists using SaveDino.
          </p>
        </div>

        {/* Quick Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs font-mono text-muted-foreground">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Organization
            </div>
            <div className="text-foreground font-medium">SEDS Sri Lanka</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Scientific Partners
            </div>
            <div className="text-foreground font-medium">IASC &bull; NASA</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Applies To
            </div>
            <div className="text-foreground font-medium">All Registered Citizens</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Est. Read Time
            </div>
            <div className="text-foreground font-medium">~ 4 minutes</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
        {/* Main Documentation Column */}
        <div className="lg:col-span-8 space-y-12 text-foreground/90 font-sans leading-relaxed">
          {/* Section 1: Acceptance of Terms */}
          <section id="acceptance" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#8b5cf6] px-2 py-0.5 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Acceptance of Terms
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              By accessing, browsing, or creating an account on the SaveDino platform (operated by
              Students for the Exploration and Development of Space &ndash; SEDS Sri Lanka in
              partnership with the International Astronomical Search Collaboration &ndash; IASC and
              NASA), you agree to be bound by these Terms and Conditions.
            </p>

            <div className="border-l-2 border-[#8b5cf6] bg-muted/20 rounded-r-xl p-4 space-y-1">
              <div className="text-xs font-mono uppercase text-[#8b5cf6] font-bold flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                <span>Squad &amp; Institutional Authority</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                If you register or participate on behalf of a school, university, astronomy club, or
                research squad, you represent that you have full authorization to bind your squad
                members to these standards.
              </p>
            </div>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 2: Accounts & Squad Roles */}
          <section id="accounts" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20">
                02
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Accounts, Squads &amp; Leader Responsibilities
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              SaveDino facilitates authentic citizen science through collaborative search squads and
              telescope image set distribution. To ensure operational safety and attribution:
            </p>

            <ul className="space-y-3 pl-1 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Accurate Information:</strong> You agree to
                  provide an authentic email address, full name, and optional WhatsApp contact number
                  to receive sign-in links, team coordination messages, and official certificates.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Squad Leadership:</strong> Squad leaders are
                  responsible for moderating join requests, ensuring fair distribution of image sets,
                  and validating Astrometrica discovery reports prior to campaign submission.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Account Security:</strong> Magic links and
                  authentication sessions are personal to you. You are responsible for maintaining the
                  confidentiality of your inbox and devices.
                </span>
              </li>
            </ul>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 3: Scientific Data & Attribution */}
          <section id="scientific-integrity" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#38bdf8] px-2 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/20">
                03
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Scientific Data &amp; Discovery Attribution
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              All astronomical observation data distributed through SaveDino originates from
              professional sky surveys (such as the Pan-STARRS telescope array in Hawaii). Every
              measurement contributes to the global planetary defense record.
            </p>

            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <p>
                Citizen scientists must strictly adhere to the following scientific standards:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-foreground">Authentic Measurements:</strong> All candidate
                  detections must be measured manually using Astrometrica software in compliance with
                  IASC guidelines. The use of automated discovery spoofing or falsified reports is
                  strictly prohibited.
                </li>
                <li>
                  <strong className="text-foreground">Official Discovery Rights:</strong> Preliminary
                  and provisional asteroid discoveries are credited to the citizen scientists who
                  first identified and measured the object, in accordance with the International
                  Astronomical Union (IAU) and Minor Planet Center (MPC) protocols.
                </li>
                <li>
                  <strong className="text-foreground">Public Scientific Record:</strong> Validated
                  astrometric reports submitted to the Minor Planet Center become part of the
                  permanent, open scientific record and cannot be retracted or reassigned.
                </li>
              </ul>
            </div>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 4: Code of Conduct */}
          <section id="conduct" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#f59e0b] px-2 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Platform Code of Conduct &amp; Restrictions
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              SaveDino is a global educational community. To maintain a safe, fair, and welcoming
              research space, users must refrain from any of the following prohibited behaviors:
            </p>

            <ul className="space-y-2.5 pl-1 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#f59e0b] font-mono text-xs font-bold mt-1">&bull;</span>
                <span>
                  Attempting to disrupt or gain unauthorized administrative access to other squads,
                  image sets, or platform servers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f59e0b] font-mono text-xs font-bold mt-1">&bull;</span>
                <span>
                  Sending spam join requests, abusive communication, or harassing other citizen
                  scientists.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#f59e0b] font-mono text-xs font-bold mt-1">&bull;</span>
                <span>
                  Using scrapers, automated voting/scoring bots, or malicious payloads against API
                  endpoints.
                </span>
              </li>
            </ul>

            <div className="border-l-2 border-[#f59e0b] bg-muted/20 rounded-r-xl p-4 space-y-1">
              <div className="text-xs font-mono uppercase text-[#f59e0b] font-bold">
                Moderation &amp; Enforcement
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Violations of the Code of Conduct will result in immediate disqualification of the
                squad from active campaigns, revocation of discovery credentials, and permanent
                account suspension.
              </p>
            </div>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 5: Intellectual Property */}
          <section id="intellectual-property" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#a78bfa] px-2 py-0.5 rounded bg-[#a78bfa]/10 border border-[#a78bfa]/20">
                05
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Intellectual Property &amp; Trademarks
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              The SaveDino platform interface, retro Dino game elements, and software codebase are
              the property of SEDS Sri Lanka. Telescope imagery and survey FITS files are provided
              under international scientific partnership agreements through IASC, Pan-STARRS, and the
              University of Hawaii Institute for Astronomy.
            </p>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 6: Disclaimers & Liability */}
          <section id="disclaimers" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20">
                06
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Service Availability &amp; Disclaimers
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              SaveDino is provided on an &quot;as is&quot; basis for educational and non-commercial
              citizen astronomy research. While SEDS Sri Lanka strives for continuous availability
              and rapid image set distribution, we are not liable for telescope survey maintenance
              delays, weather disruptions at observatory sites, or temporary network interruptions.
            </p>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 7: Contact Information */}
          <section id="contact" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#8b5cf6] px-2 py-0.5 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
                07
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Contact Information
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              If you have questions regarding these Terms and Conditions or require assistance with
              squad governance, please reach out to our team:
            </p>

            <div className="font-mono text-xs text-foreground bg-muted/30 p-4 rounded-xl border border-border/60 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground font-sans uppercase text-[10px] tracking-wider">
                  Organization
                </span>
                <span className="font-semibold">SEDS Sri Lanka</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                <span className="text-muted-foreground font-sans uppercase text-[10px] tracking-wider">
                  Direct Inquiries
                </span>
                <a
                  href="mailto:info@sedssl.org"
                  className="text-[#8b5cf6] hover:underline font-bold"
                >
                  info@sedssl.org
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground font-sans uppercase text-[10px] tracking-wider">
                  Official Website
                </span>
                <a
                  href="https://sedssl.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#8b5cf6] hover:underline inline-flex items-center gap-1"
                >
                  <span>https://sedssl.org</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Next / Previous Docs Navigation */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
            <Link
              href="/privacy"
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 text-left">
                <div className="text-[10px] font-mono text-muted-foreground">Previous document</div>
                <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                  &larr; Privacy Policy
                </div>
              </div>
            </Link>

            <Link
              href="/campaigns"
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 text-right">
                <div className="text-[10px] font-mono text-muted-foreground">Next step</div>
                <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                  Explore Asteroid Campaigns &rarr;
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Sticky On This Page Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24 space-y-5 p-5 rounded-2xl bg-muted/15 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              <FileText className="size-3.5 text-[#8b5cf6]" />
              <span>On this page</span>
            </div>

            <nav className="space-y-1.5 text-xs font-sans">
              {tocSections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors group"
                >
                  <span className="font-mono text-[10px] text-muted-foreground/60 group-hover:text-[#8b5cf6] transition-colors">
                    {sec.number}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-border/40 space-y-2">
              <div className="text-[11px] font-mono text-muted-foreground">Related Documents</div>
              <Link
                href="/privacy"
                className="block text-xs text-[#8b5cf6] hover:underline font-sans"
              >
                Privacy Policy &rarr;
              </Link>
              <Link
                href="/"
                className="block text-xs text-muted-foreground hover:text-foreground font-sans"
              >
                SaveDino Home Arcade &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

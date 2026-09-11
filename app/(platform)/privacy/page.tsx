import React from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Mail,
  ArrowLeft,
  Globe,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - SaveDino Documentation",
  description:
    "Data privacy, transactional email policies, and scientific record guidelines for SaveDino citizen scientists.",
};

const tocSections = [
  { id: "overview", number: "01", title: "Overview & Mission" },
  { id: "data-collection", number: "02", title: "Information We Collect" },
  { id: "data-usage", number: "03", title: "How We Use Data" },
  { id: "transactional-emails", number: "04", title: "Email Communications" },
  { id: "rights-retention", number: "05", title: "Your Rights & Retention" },
  { id: "contact", number: "06", title: "Contact Information" },
];

export default function PrivacyPolicyPage() {
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
            <span className="text-foreground font-semibold">Privacy Policy</span>
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
            <span>// LEGAL &amp; PRIVACY SPECIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base font-sans text-muted-foreground max-w-3xl leading-relaxed">
            This policy describes how SaveDino and SEDS Sri Lanka collect, handle, and protect your
            personal data, squad records, and scientific discovery observations.
          </p>
        </div>

        {/* Quick Metadata Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs font-mono text-muted-foreground">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Data Controller
            </div>
            <div className="text-foreground font-medium">SEDS Sri Lanka</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Monetization Policy
            </div>
            <div className="text-[#10b981] font-semibold">Zero Data Selling</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Applies To
            </div>
            <div className="text-foreground font-medium">All Platform Users</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans">
              Est. Read Time
            </div>
            <div className="text-foreground font-medium">~ 3 minutes</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Sticky Table of Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8">
        {/* Main Documentation Column */}
        <div className="lg:col-span-8 space-y-12 text-foreground/90 font-sans leading-relaxed">
          {/* Section 1: Overview & Mission */}
          <section id="overview" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#8b5cf6] px-2 py-0.5 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Overview &amp; Mission
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              SaveDino is an educational citizen science platform developed by SEDS Sri Lanka in
              partnership with the International Astronomical Search Collaboration (IASC) and NASA.
              We are deeply committed to user privacy, transparent data handling, and scientific data
              integrity.
            </p>

            <div className="border-l-2 border-[#10b981] bg-muted/20 rounded-r-xl p-4 space-y-1">
              <div className="text-xs font-mono uppercase text-[#10b981] font-bold flex items-center gap-1.5">
                <Shield className="size-3.5" />
                <span>Our Core Privacy Principle</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We collect only the minimum data required to verify user accounts, coordinate search
                squads, and attribute discovered asteroids. We never monetize or sell personal data.
              </p>
            </div>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 2: Information We Collect */}
          <section id="data-collection" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#10b981] px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20">
                02
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Information We Collect
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When you participate in SaveDino campaigns and squad workspaces, we process the
              following categories of information:
            </p>

            <ul className="space-y-3 pl-1 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Account Identifiers:</strong> Your email address
                  and full name, provided during sign-in link generation and account registration.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Contact &amp; Profile Details:</strong> Optional
                  WhatsApp phone number (for squad and campaign emergency coordination), school or
                  university affiliation, and country of origin.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Astronomical Reports:</strong> Candidate moving
                  object measurements, MPC 80-column report strings, and image set verification logs.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-[#10b981] shrink-0 mt-1" />
                <span>
                  <strong className="text-foreground">Technical Security Logs:</strong> IP address and
                  browser user-agent strings, collected strictly for rate limiting and preventing
                  unauthorized account access.
                </span>
              </li>
            </ul>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 3: How We Use Data */}
          <section id="data-usage" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#38bdf8] px-2 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/20">
                03
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                How We Use Your Information
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Your information is used strictly for legitimate citizen science research and platform
              operations:
            </p>

            <div className="space-y-3 text-sm sm:text-base text-muted-foreground">
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Authenticating you securely into your squads and campaign workspaces.</li>
                <li>
                  Attributing official NASA / IASC preliminary and provisional discovery certificates
                  to you and your squad members.
                </li>
                <li>
                  Facilitating squad formation, teammate match-making, and join request reviews.
                </li>
                <li>
                  Generating real-time campaign leaderboards and research progress telemetry.
                </li>
              </ul>
            </div>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 4: Email Communications */}
          <section id="transactional-emails" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#f59e0b] px-2 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Transactional Email Communications
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We dispatch only functional, transactional emails (sign-in links, squad membership
              confirmations, and image set deliveries) via verified delivery providers (Resend and
              Brevo).
            </p>

            <div className="border-l-2 border-[#f59e0b] bg-muted/20 rounded-r-xl p-4 space-y-1">
              <div className="text-xs font-mono uppercase text-[#f59e0b] font-bold">
                Email Transparency Notice
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every email sent from SaveDino contains dynamic recipient attribution, the exact
                reason for dispatch, and direct links to contact support or view these privacy
                standards. We do not send marketing newsletters without explicit consent.
              </p>
            </div>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 5: Your Rights & Data Control */}
          <section id="rights-retention" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#a78bfa] px-2 py-0.5 rounded bg-[#a78bfa]/10 border border-[#a78bfa]/20">
                05
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Your Rights &amp; Data Control
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              You maintain direct control over your profile and personal information:
            </p>

            <ul className="space-y-2.5 pl-1 text-sm sm:text-base text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] font-mono text-xs font-bold mt-1">&bull;</span>
                <span>
                  <strong className="text-foreground">Profile Updates:</strong> You can edit your
                  display name, WhatsApp phone number, affiliation, and space avatar at any time from
                  your profile page.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] font-mono text-xs font-bold mt-1">&bull;</span>
                <span>
                  <strong className="text-foreground">Account Deletion:</strong> You can request full
                  deletion of your account and personal identifiers by contacting us.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a78bfa] font-mono text-xs font-bold mt-1">&bull;</span>
                <span>
                  <strong className="text-foreground">Scientific Discovery Records:</strong> Because
                  measurements submitted to IASC/MPC become part of the public astronomical archive,
                  historical astrometric coordinates remain attributed to their discovery squads.
                </span>
              </li>
            </ul>
          </section>

          <div className="border-b border-border/40" />

          {/* Section 6: Contact Information */}
          <section id="contact" className="scroll-mt-24 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#8b5cf6] px-2 py-0.5 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20">
                06
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
                Contact Us Regarding Privacy
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              For any questions, data subject access requests, or inquiries regarding your data:
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
                  Privacy Contact
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
              href="/"
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 text-left">
                <div className="text-[10px] font-mono text-muted-foreground">Previous page</div>
                <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                  &larr; SaveDino Arcade
                </div>
              </div>
            </Link>

            <Link
              href="/terms"
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 text-right">
                <div className="text-[10px] font-mono text-muted-foreground">Next document</div>
                <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                  Terms &amp; Conditions &rarr;
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
                href="/terms"
                className="block text-xs text-[#8b5cf6] hover:underline font-sans"
              >
                Terms &amp; Conditions &rarr;
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

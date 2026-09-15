import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Asteroid Campaign Rules",
  description:
    "Terms of Service, scientific integrity standards, and campaign squad guidelines for SaveDino citizen scientists participating in IASC asteroid searches.",
  openGraph: {
    title: "Terms & Conditions | SaveDino Asteroid Search",
    description: "Terms of Service, squad guidelines, and IASC discovery attribution standards.",
    url: "/terms",
    images: ["/opengraph-image.png"],
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-6 sm:px-8 max-w-3xl mx-auto font-sans text-foreground">
      <header className="space-y-2 pb-8 border-b border-border">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs font-mono text-muted-foreground">
          Effective Date: September 11, 2026 &bull; Version 2.0
        </p>
      </header>

      <main className="py-8 space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            Welcome to SaveDino, a citizen science asteroid search platform developed and operated
            by Students for the Exploration and Development of Space (SEDS Sri Lanka) in
            collaboration with the International Astronomical Search Collaboration (IASC,
            Hardin-Simmons University), Pan-STARRS (University of Hawaii Institute for Astronomy),
            and the NASA Planetary Defense Coordination Office.
          </p>
          <p>
            By accessing the website, signing in via email, joining a research squad, or analyzing
            telescope data on SaveDino, you agree to comply with and be bound by these Terms and
            Conditions. If you do not agree with these terms, please do not access or use the
            platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            2. Eligibility &amp; Squad Structure
          </h2>
          <p>
            SaveDino is open to students, educators, amateur astronomers, and citizen scientists
            worldwide.
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Accurate Account Information:</strong> You agree
              to provide an authentic full name, active email address, and accurate school or
              institutional affiliation. Your name is used for official discovery certificates
              issued by IASC and NASA partners.
            </li>
            <li>
              <strong className="text-foreground">Squad Participation Limits:</strong> Participants
              collaborate in squads up to the maximum member limit specified on the respective
              campaign page (in accordance with campaign guidelines). A user may only participate in
              one active squad per observation campaign.
            </li>
            <li>
              <strong className="text-foreground">Squad Leader Responsibilities:</strong> Squad
              leaders are responsible for managing squad membership, coordinating image set claims
              among members, reviewing candidate measurements, and submitting official Astrometrica
              MPC discovery reports.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            3. Telescope Data Access &amp; Astrometrica Analysis
          </h2>
          <p>
            Observation campaigns distribute high-resolution astronomical image sets (FITS format)
            captured by the Pan-STARRS survey telescopes located at Haleakala Observatory in Hawaii.
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Exclusive Educational &amp; Research Use:</strong>{" "}
              All image sets and sky survey data distributed through SaveDino are provided solely
              for non-commercial educational and scientific search activities.
            </li>
            <li>
              <strong className="text-foreground">Manual Scientific Verification:</strong> Candidate
              moving objects (asteroids and near-Earth objects) must be verified and measured
              manually using Astrometrica software following standardized IASC data analysis
              protocols.
            </li>
            <li>
              <strong className="text-foreground">Timely Analysis:</strong> Claimed image sets must
              be analyzed and submitted before campaign deadlines to ensure rapid follow-up
              observations of high-priority near-Earth objects by global observatories.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            4. Discovery Attribution &amp; MPC Reporting
          </h2>
          <p>
            Discoveries made during SaveDino observation campaigns adhere to international
            scientific attribution standards governed by the Minor Planet Center (MPC) and the
            International Astronomical Union (IAU):
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Preliminary Discoveries:</strong> When a squad
              reports an object with at least four consistent positions that do not match known
              asteroids, IASC logs it as a Preliminary Discovery credited to the squad members.
            </li>
            <li>
              <strong className="text-foreground">Provisional Discoveries &amp; Numbering:</strong>{" "}
              Once follow-up observations confirm the orbit over subsequent nights, the Minor Planet
              Center publishes a Provisional Discovery designation.
            </li>
            <li>
              <strong className="text-foreground">Permanent Naming Rights:</strong> When an orbit is
              fully computed and assigned a catalog number by the IAU (typically taking several
              years), the original discovering citizen scientists receive official naming privileges
              according to IAU naming rules.
            </li>
            <li>
              <strong className="text-foreground">Public Scientific Record:</strong> Validated
              astrometric measurements submitted to the Minor Planet Center become part of the
              permanent astronomical record and cannot be deleted, altered, or reassigned.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            5. Platform Code of Conduct &amp; Scientific Integrity
          </h2>
          <p>To maintain fairness, trust, and the scientific credibility of our findings:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Zero Tolerance for Spoofing:</strong> Submitting
              fabricated measurements, altering FITS headers, or using automated script bots to
              simulate discoveries is strictly prohibited and results in immediate permanent
              expulsion.
            </li>
            <li>
              <strong className="text-foreground">Respectful Collaboration:</strong> Harassment,
              abusive language, or disruptive behavior toward squad members, campaign coordinators,
              or staff will result in account termination.
            </li>
            <li>
              <strong className="text-foreground">System Security:</strong> Users must not attempt
              to circumvent authentication controls, access other squads&apos; confidential working
              reports, or overload platform APIs.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">6. Intellectual Property</h2>
          <p>
            The SaveDino platform software, Dino arcade interface, graphics, and branding are the
            property of SEDS Sri Lanka. Astronomical survey imagery remains the property of the
            University of Hawaii Pan-STARRS project and is distributed under scientific
            collaboration agreements with IASC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            7. Platform Telemetry, Feature Flags &amp; Early Access
          </h2>
          <p>
            To deliver stable asteroid detection tools, monitor system load, and prevent service
            crashes, SaveDino collects privacy-focused interaction telemetry and evaluates feature
            flags (including private beta and early access access controls) through PostHog EU:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-sm">
            <li>
              <strong className="text-foreground">Early Access Rollouts:</strong> Access to specific
              campaigns, automated tool pipelines, or platform features may be restricted or rolled
              out in waves based on account verification or capacity limits.
            </li>
            <li>
              <strong className="text-foreground">Diagnostics &amp; Bug Tracking:</strong> Anonymous
              performance telemetry and client error diagnostics are processed within the European
              Union to identify and resolve software bugs.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            8. Service Availability &amp; Astronomical Disclaimers
          </h2>
          <p>
            Telescope observation schedules depend on weather conditions at observatory sites,
            optical instrument maintenance, and sky transparency. SEDS Sri Lanka and IASC cannot
            guarantee uninterrupted image set delivery or real-time server availability during
            severe weather disruptions or telescope maintenance periods.
          </p>
          <p>
            SaveDino is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
            warranties of any kind.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            9. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, SEDS Sri Lanka, IASC, NASA, and their
            respective officers, coordinators, and volunteers shall not be liable for any direct,
            indirect, incidental, or consequential damages arising from your participation in
            campaigns or use of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">10. Changes to Terms</h2>
          <p>
            We may update these Terms and Conditions periodically to reflect changes in campaign
            rules, platform capabilities, or international astronomical guidelines. Continued
            participation in campaigns following published updates constitutes your acceptance of
            the modified terms.
          </p>
        </section>

        <section className="space-y-3 pb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            11. Contact &amp; Governance
          </h2>
          <p>
            For questions regarding campaign participation, squad governance, or these Terms and
            Conditions, please contact SEDS Sri Lanka:
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:info@sedssl.org"
              className="text-foreground underline underline-offset-4"
            >
              info@sedssl.org
            </a>
            <br />
            Website:{" "}
            <a
              href="https://sedssl.org"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              https://sedssl.org
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}

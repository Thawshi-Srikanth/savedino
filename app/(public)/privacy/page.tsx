import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | SaveDino Asteroid Search",
  description:
    "Privacy standards, Google OAuth user data handling, transactional email policies, and scientific data protection for SaveDino citizen scientists.",
  openGraph: {
    title: "Privacy Policy | SaveDino Asteroid Search",
    description:
      "Privacy standards and scientific data protection for SaveDino citizen scientists.",
    url: "/privacy",
    images: ["/opengraph-image.png"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-6 sm:px-8 max-w-3xl mx-auto font-sans text-foreground">
      <header className="space-y-2 pb-8 border-b border-border">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-muted-foreground">
          Effective Date: September 14, 2026 &bull; Version 2.1 &bull; SaveDino Platform
        </p>
      </header>

      <main className="py-8 space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        {/* Section 1: Overview & Application Identity */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            1. Overview &amp; Application Identity
          </h2>
          <p>
            This Privacy Policy governs the <strong>SaveDino</strong> platform (available at{" "}
            <a
              href="https://savedino.sedssl.org"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              https://savedino.sedssl.org
            </a>
            ), operated by{" "}
            <strong>Students for the Exploration and Development of Space (SEDS Sri Lanka)</strong>{" "}
            in partnership with the{" "}
            <strong>
              International Astronomical Search Collaboration (IASC, Hardin-Simmons University)
            </strong>{" "}
            and the <strong>NASA Planetary Defense Coordination Office</strong>.
          </p>
          <p>
            SaveDino is an educational citizen science initiative designed to enable students and
            amateur astronomers worldwide to analyze astronomical FITS datasets, detect near-Earth
            objects, and report validated asteroid observations.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            2. Information We Collect
          </h2>
          <p>
            We collect only the minimum personal information required to facilitate platform access,
            squad coordination, and scientific discovery attribution:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Authentication &amp; Contact Data:</strong> Email
              address and full display name (collected via single-use magic links or third-party
              OAuth providers such as Google and Discord).
            </li>
            <li>
              <strong className="text-foreground">Profile &amp; Attribution Data:</strong>{" "}
              School/Institution name, country of residence, and optional contact numbers (e.g.
              WhatsApp) provided voluntarily for squad coordination.
            </li>
            <li>
              <strong className="text-foreground">Astrometric &amp; Observation Records:</strong>{" "}
              Claimed image set identifiers, Astrometrica coordinate measurements, MPC discovery
              reports, squad memberships, and campaign progress metrics.
            </li>
            <li>
              <strong className="text-foreground">Technical Session &amp; Telemetry Data:</strong>{" "}
              Authentication session tokens, feature flag states, browser user-agent, error
              diagnostics, and privacy-respecting interaction telemetry processed through our
              EU-hosted analytics infrastructure to optimize platform performance.
            </li>
          </ul>
        </section>

        {/* Section 3: Google User Data Disclosures */}
        <section className="space-y-3 bg-card border border-border rounded-xl p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            3. Google User Data &amp; OAuth Compliance
          </h2>
          <p>
            When you sign in to SaveDino using Google Sign-In, we adhere strictly to the following
            policies regarding your Google account data:
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                a. What Google Data is Accessed
              </h3>
              <p className="pt-1">
                SaveDino requests access only to non-sensitive identity scopes (<code>openid</code>,{" "}
                <code>.../auth/userinfo.email</code>, and <code>.../auth/userinfo.profile</code>).
                Specifically, we access:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 pt-1 text-sm">
                <li>Your primary Google Account email address</li>
                <li>Your Google Account display name</li>
                <li>Your public Google profile avatar URL</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                b. How We Use Google User Data
              </h3>
              <p className="pt-1">Your Google user data is used exclusively to:</p>
              <ul className="list-disc list-inside space-y-1 pl-2 pt-1 text-sm">
                <li>Authenticate your identity and log you into your SaveDino account.</li>
                <li>Create and populate your citizen scientist participant profile.</li>
                <li>
                  Properly attribute validated asteroid discoveries to your name on official
                  certificates.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                c. Sharing, Transfer, and Disclosure of Google Data
              </h3>
              <p className="pt-1">
                <strong>
                  We do not share, sell, rent, monetize, or transfer Google user data to any third
                  parties, advertisers, or data brokers.
                </strong>{" "}
                Google user data is never used for serving advertisements or training generalized AI
                models. It is processed solely to provide and improve the SaveDino citizen science
                application functionality.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                d. Google API Services Limited Use Statement
              </h3>
              <p className="pt-1">
                SaveDino&apos;s use and transfer of information received from Google APIs to any
                other app adheres to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-4"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: How We Use Your Information */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            4. How We Use General Personal Information
          </h2>
          <p>
            Personal information collected across the platform is used strictly for legitimate
            scientific and operational purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Authenticating user sessions and safeguarding account security.</li>
            <li>
              Coordinating student squads, assigning campaign FITS image sets, and managing
              discovery submissions.
            </li>
            <li>
              Transmitting validated astrometric measurement data to IASC and the Minor Planet
              Center (MPC).
            </li>
            <li>
              Issuing verified digital certificates of asteroid discovery and campaign
              participation.
            </li>
            <li>
              Maintaining platform security, mitigating bot attacks, and enforcing fair competition
              rules.
            </li>
          </ul>
        </section>

        {/* Section 5: Email Communications */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            5. Email Communications Policy
          </h2>
          <p>
            SaveDino uses transactional email infrastructure (via Resend) solely to deliver
            essential service communications:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Single-use sign-in access links.</li>
            <li>Squad joining notifications, invitation confirmations, and leadership reviews.</li>
            <li>
              Campaign milestone announcements, image set assignments, and certificate
              notifications.
            </li>
          </ul>
          <p>
            We do not send marketing spam, promotional advertisements, or third-party newsletters.
          </p>
        </section>

        {/* Section 6: Analytics, Telemetry & PostHog EU Data Processing */}
        <section className="space-y-3 bg-card border border-border rounded-xl p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            6. Analytics, Telemetry &amp; PostHog EU Processing
          </h2>
          <p>
            To monitor platform health, troubleshoot pipeline errors, evaluate feature flags (such
            as our Early Access rollout), and understand user experience, SaveDino uses{" "}
            <strong>PostHog Cloud EU</strong> (hosted exclusively within European Union data centers
            at <code>eu.i.posthog.com</code> / <code>a.savedino.sedssl.org</code>).
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-sm pt-1">
            <li>
              <strong className="text-foreground">European Union Data Residency:</strong> All
              telemetry, page view metrics, and diagnostic event logs are ingested and stored
              strictly within the European Union in compliance with GDPR standards.
            </li>
            <li>
              <strong className="text-foreground">No Advertising or Data Brokerage:</strong>{" "}
              Analytics data is never shared with third-party advertisers, data brokers, or
              marketing networks. It is used solely by the SaveDino development team to ensure
              uptime and reliable asteroid hunting tools.
            </li>
            <li>
              <strong className="text-foreground">Privacy Safeguards:</strong> Sensitive inputs,
              passwords, authentication tokens, and private contact numbers are strictly masked and
              omitted from telemetry records.
            </li>
            <li>
              <strong className="text-foreground">Cookies &amp; Local Storage:</strong> We use local
              storage and first-party cookies for essential session persistence, Day/Night theme
              selection, audio synth preferences, and feature flag caching.
            </li>
          </ul>
        </section>

        {/* Section 7: Scientific Data Sharing */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            7. Scientific Data Sharing &amp; Public Records
          </h2>
          <p>In accordance with international astronomical research standards:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Minor Planet Center (MPC):</strong> Validated
              observation reports submitted through IASC to the MPC (operated by the Smithsonian
              Astrophysical Observatory under IAU auspices) become part of the permanent, open
              scientific record.
            </li>
            <li>
              <strong className="text-foreground">Discovery Attribution:</strong> Names of
              discovering citizen scientists and their institutional affiliations are published in
              official Minor Planet Electronic Circulars (MPECs) and IASC archives.
            </li>
          </ul>
        </section>

        {/* Section 8: Data Protection & Security */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            8. Data Protection &amp; Security Measures
          </h2>
          <p>
            We implement comprehensive technical and organizational safeguards to ensure data
            security:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Encryption:</strong> All data in transit is
              encrypted using modern TLS/HTTPS encryption protocols.
            </li>
            <li>
              <strong className="text-foreground">Database Isolation:</strong> Data is stored in
              secure, access-restricted PostgreSQL databases protected by strict role-based access
              control (RBAC).
            </li>
            <li>
              <strong className="text-foreground">Squad Email Masking:</strong> Personal email
              addresses are masked in squad member rosters to prevent unauthorized exposure among
              participants.
            </li>
            <li>
              <strong className="text-foreground">Token Security:</strong> Authentication sessions
              utilize secure, tamper-proof session tokens with automated expiration.
            </li>
          </ul>
        </section>

        {/* Section 9: Data Retention & User Deletion Rights */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            9. Data Retention, Revocation &amp; Deletion
          </h2>
          <p>You have full control over your personal data:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Revoking Google / Third-Party Access:</strong> You
              can revoke SaveDino&apos;s access at any time through your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                Google Account Security Permissions
              </a>
              .
            </li>
            <li>
              <strong className="text-foreground">Account Deletion:</strong> You may request the
              permanent deletion of your account and all associated personal data by emailing{" "}
              <a
                href="mailto:info@sedssl.org"
                className="text-foreground underline underline-offset-4"
              >
                info@sedssl.org
              </a>
              . Account deletions are processed within 30 days.
            </li>
            <li>
              <strong className="text-foreground">Permanent Astronomical Record:</strong>{" "}
              Measurements and discovery records already submitted to the Minor Planet Center cannot
              be deleted, as they constitute permanent international astronomical scientific data.
            </li>
          </ul>
        </section>

        {/* Section 10: Children's Educational Privacy */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            10. Children&apos;s Educational Privacy
          </h2>
          <p>
            SaveDino is committed to protecting the privacy of young students participating in
            astronomical search campaigns. We collect only the minimum information necessary for
            campaign participation and discovery certificates. We encourage parents and educators to
            oversee student squad activities.
          </p>
        </section>

        {/* Section 11: Contact Information */}
        <section className="space-y-3 pb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            11. Contact Information &amp; Data Controller
          </h2>
          <p>
            For questions or requests regarding this Privacy Policy or your personal data, please
            contact:
          </p>
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-1 text-sm">
            <p className="font-semibold text-foreground">
              Students for the Exploration and Development of Space (SEDS Sri Lanka)
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:info@sedssl.org"
                className="text-foreground underline underline-offset-4 font-mono"
              >
                info@sedssl.org
              </a>
            </p>
            <p>
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
            <p>
              Application URL:{" "}
              <a
                href="https://savedino.sedssl.org"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                https://savedino.sedssl.org
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

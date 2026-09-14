import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Citizen Science Data Protection",
  description:
    "Privacy standards, transactional email policies, and scientific data handling for SaveDino citizen scientists participating in astronomical campaigns.",
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
          Effective Date: September 11, 2026 &bull; Version 2.0
        </p>
      </header>

      <main className="py-8 space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            1. Overview &amp; Data Philosophy
          </h2>
          <p>
            SaveDino is operated by Students for the Exploration and Development of Space (SEDS Sri
            Lanka) in partnership with the International Astronomical Search Collaboration (IASC,
            Hardin-Simmons University) and the NASA Planetary Defense Coordination Office.
          </p>
          <p>
            We are dedicated to maintaining the highest level of privacy, transparency, and data
            integrity. SaveDino operates strictly as a non-commercial educational and citizen
            science initiative. We do not sell, rent, monetize, or trade your personal data with
            third-party advertisers or data brokers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            2. Information We Collect
          </h2>
          <p>
            To facilitate campaign participation and scientific attribution, we collect the
            following information:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Email Address:</strong> Required for passwordless
              authentication via single-use sign-in links, important campaign updates, squad
              invitations, and participation certificates.
            </li>
            <li>
              <strong className="text-foreground">Full Name:</strong> Required for official IASC
              asteroid discovery attribution, campaign reports, and verified participation
              certificates issued in collaboration with NASA partners.
            </li>
            <li>
              <strong className="text-foreground">WhatsApp Number (Optional):</strong> Collected to
              enable rapid, time-sensitive coordination between campaign coordinators and squad
              leaders for urgent follow-up observations and squad announcements.
            </li>
            <li>
              <strong className="text-foreground">School / Organization &amp; Country:</strong> Used
              to represent schools, universities, astronomy clubs, and regions on campaign
              leaderboards and global search directories.
            </li>
            <li>
              <strong className="text-foreground">Astrometric &amp; Observation Records:</strong>{" "}
              Claimed image set identifiers, Astrometrica measurement coordinates, report submission
              logs, and squad progress metrics.
            </li>
            <li>
              <strong className="text-foreground">Technical Session Data:</strong> Standard session
              authentication cookies and error logs necessary to maintain system security and
              prevent automated abuse.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            3. How We Use Your Information
          </h2>
          <p>
            Your information is processed strictly for legitimate scientific and operational
            purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Authenticating your account securely using sign-in links or OAuth providers.</li>
            <li>Coordinating research squads, image set allocations, and submission reviews.</li>
            <li>
              Transmitting validated astrometric measurement files to IASC and the Minor Planet
              Center (MPC).
            </li>
            <li>Issuing verified digital certificates of discovery and participation.</li>
            <li>
              Maintaining platform security, preventing bot spoofing, and ensuring fair data access.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            4. Google API &amp; Third-Party OAuth Disclosures
          </h2>
          <p>
            When you choose to sign in to SaveDino using Google or Discord authentication:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Data Accessed:</strong> We access only non-sensitive
              basic profile information—specifically your primary Google account email address, display name,
              and public avatar image (via the <code>openid</code>, <code>.../auth/userinfo.email</code>, and <code>.../auth/userinfo.profile</code> scopes).
            </li>
            <li>
              <strong className="text-foreground">Purpose of Use:</strong> This data is used solely to authenticate your identity, establish your citizen science participant account, and attribute asteroid discovery reports to your name.
            </li>
            <li>
              <strong className="text-foreground">No Advertising / No Sale:</strong> SaveDino does not sell Google user data, does not transfer Google user data to data brokers or advertising platforms, and does not use Google user data to serve targeted advertisements.
            </li>
            <li>
              <strong className="text-foreground">Google Limited Use Compliance:</strong> SaveDino&apos;s use and transfer to any other app of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </li>
            <li>
              <strong className="text-foreground">Data Retention &amp; Revocation:</strong> You can revoke SaveDino&apos;s access at any time through your Google Account Security settings. You may also request complete removal of your profile data by contacting our support team.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            5. Email Communications &amp; Deliverability
          </h2>
          <p>
            SaveDino utilizes enterprise transactional email infrastructure (powered by Resend) to
            deliver:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Single-use authentication links when you sign in.</li>
            <li>Squad join requests and leadership review notifications.</li>
            <li>Official IASC campaign milestone alerts and certificate issuance.</li>
          </ul>
          <p>
            We do not send unsolicited marketing emails, advertisements, or third-party promotional
            newsletters.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            6. Scientific Data Sharing &amp; Public Records
          </h2>
          <p>
            Citizen science relies on open scientific collaboration. When you submit validated
            asteroid observations:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Minor Planet Center (MPC):</strong> Astrometric
              observation reports and discovery credits submitted through IASC to the MPC (operated
              by the Smithsonian Astrophysical Observatory under IAU auspices) become part of the
              permanent, open scientific record.
            </li>
            <li>
              <strong className="text-foreground">Public Discovery Catalogs:</strong> Names of
              discovering citizen scientists and squad affiliations are published in official Minor
              Planet Electronic Circulars (MPECs) and IASC discovery archives.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            7. Data Security &amp; Privacy Protection
          </h2>
          <p>We implement industry-standard technical safeguards to protect your personal data:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Squad Privacy:</strong> Squad members&apos;
              personal email addresses are masked within shared squad workspaces so only the squad
              leader and campaign administrators can access full contact details.
            </li>
            <li>
              <strong className="text-foreground">Secure Encryption:</strong> All data in transit is
              encrypted using TLS/HTTPS protocols, and authentication sessions are secured using
              cryptographic single-use tokens.
            </li>
            <li>
              <strong className="text-foreground">Database Protection:</strong> Database records are
              hosted in isolated PostgreSQL environments with strict role-based access control.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            8. Your Privacy Rights &amp; Account Control
          </h2>
          <p>You retain control over your personal information:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Profile Updates:</strong> You can edit your
              display name, WhatsApp number, institution, and country at any time via the Profile
              Studio.
            </li>
            <li>
              <strong className="text-foreground">Account Deletion:</strong> You may request the
              deletion of your SaveDino account by emailing our support team. Upon deletion, your
              personal account details will be removed from our active database.
            </li>
            <li>
              <strong className="text-foreground">Permanent Astronomical Record:</strong>{" "}
              Astrometric measurements and discovery reports already submitted to the Minor Planet
              Center cannot be erased, as they form an integral part of the global astronomical
              record.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            9. Children&apos;s Educational Privacy
          </h2>
          <p>
            SaveDino actively engages school students and youth astronomy clubs. We collect only the
            minimum information necessary to support educational campaign participation and
            discovery certificates. We encourage parents and teachers to guide students during squad
            formation and campaign activities.
          </p>
        </section>

        <section className="space-y-3 pb-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            10. Contact Information &amp; Data Controller
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to exercise your data
            protection rights, please reach out to our data controller:
          </p>
          <p>
            Students for the Exploration and Development of Space (SEDS Sri Lanka)
            <br />
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

        {/* Footer Navigation Back Link */}
        <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-muted-foreground">
          <div>
            <span>SaveDino &bull; SEDS Sri Lanka</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              prefetch={false}
              className="hover:text-foreground underline underline-offset-4"
            >
              Return Home
            </Link>
            <Link
              href="/credits"
              prefetch={false}
              className="hover:text-foreground underline underline-offset-4"
            >
              Credits
            </Link>
            <Link
              href="/terms"
              prefetch={false}
              className="hover:text-foreground underline underline-offset-4"
            >
              Terms
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

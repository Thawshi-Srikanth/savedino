"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  Globe,
  Code2,
  GitCommit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Contributor {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  blog: string;
  html_url: string;
  contributions?: number;
  role?: string;
}

const DEFAULT_CONTRIBUTORS: Contributor[] = [
  {
    login: "Thawshi-Srikanth",
    name: "Thawshi Srikanth",
    avatar_url: "https://avatars.githubusercontent.com/u/100839102?v=4",
    bio: "Student at the Open University of Sri Lanka, passionate about programming and cosmic knowledge.",
    blog: "https://thawshi.com/",
    html_url: "https://github.com/Thawshi-Srikanth",
    role: "Lead Developer & Platform Architect",
  },
];

export default function CreditsPage() {
  const [contributors, setContributors] = useState<Contributor[]>(DEFAULT_CONTRIBUTORS);

  useEffect(() => {
    // Fetch live contributors from https://github.com/Thawshi-Srikanth/savedino
    fetch("https://api.github.com/repos/Thawshi-Srikanth/savedino/contributors")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch repo contributors");
      })
      .then(async (repoContributors: any[]) => {
        if (Array.isArray(repoContributors) && repoContributors.length > 0) {
          // Fetch detailed profile for each contributor
          const detailed = await Promise.all(
            repoContributors.map(async (c) => {
              try {
                const userRes = await fetch(`https://api.github.com/users/${c.login}`);
                if (userRes.ok) {
                  const u = await userRes.json();
                  return {
                    login: u.login || c.login,
                    name: u.name || c.login,
                    avatar_url: u.avatar_url || c.avatar_url,
                    bio: u.bio || (u.login === "Thawshi-Srikanth" ? DEFAULT_CONTRIBUTORS[0].bio : "Open Source Contributor"),
                    blog: u.blog
                      ? u.blog.startsWith("http")
                        ? u.blog
                        : `https://${u.blog}`
                      : u.login === "Thawshi-Srikanth"
                      ? DEFAULT_CONTRIBUTORS[0].blog
                      : "",
                    html_url: u.html_url || c.html_url,
                    contributions: c.contributions,
                    role: u.login === "Thawshi-Srikanth" ? "Lead Developer" : "Contributor",
                  };
                }
              } catch (e) {
                // Fall through to basic data
              }
              return {
                login: c.login,
                name: c.login === "Thawshi-Srikanth" ? DEFAULT_CONTRIBUTORS[0].name : c.login,
                avatar_url: c.avatar_url,
                bio: c.login === "Thawshi-Srikanth" ? DEFAULT_CONTRIBUTORS[0].bio : "Open Source Contributor",
                blog: c.login === "Thawshi-Srikanth" ? DEFAULT_CONTRIBUTORS[0].blog : "",
                html_url: c.html_url,
                contributions: c.contributions,
                role: c.login === "Thawshi-Srikanth" ? "Lead Developer" : "Contributor",
              };
            })
          );
          setContributors(detailed);
        }
      })
      .catch(() => {
        // Fallback to preloaded contributors
      });
  }, []);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto font-sans text-foreground">
      {/* Document Header */}
      <header className="space-y-2 pb-8 border-b border-border">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Credits &amp; Acknowledgements
        </h1>
        <p className="text-xs font-mono text-muted-foreground">
          Effective Date: September 11, 2026 &bull; SEDS Sri Lanka &bull; Version 2.0
        </p>
      </header>

      {/* Main Document Content */}
      <main className="py-8 space-y-10 text-sm sm:text-base leading-relaxed text-muted-foreground">
        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            1. Scientific Mission &amp; Overview
          </h2>
          <p>
            SaveDino is a citizen science asteroid search platform developed by{" "}
            <a
              href="https://sedssl.org"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
            >
              Students for the Exploration and Development of Space (SEDS Sri Lanka)
            </a>
            . Our mission is to democratize asteroid discovery and planetary defense, allowing
            students, researchers, and astronomy enthusiasts to analyze real sky survey data captured
            by major astronomical observatories.
          </p>
        </section>

        {/* Section 2: Code & Platform Contributors (Profile Cards) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              2. Code &amp; Platform Contributors
            </h2>
            <a
              href="https://github.com/Thawshi-Srikanth/savedino"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Code2 className="size-3.5" />
              <span>Thawshi-Srikanth/savedino</span>
              <ExternalLink className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
          <p>
            SaveDino was architected and developed with dedication to open-source software, high
            performance, and astronomical data precision:
          </p>

          {/* Render Contributor Profile Cards */}
          <div className="space-y-4 pt-1">
            {contributors.map((c) => (
              <div
                key={c.login}
                className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-md select-text"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                  {/* Profile Avatar */}
                  <div className="relative size-16 sm:size-20 rounded-2xl overflow-hidden border border-border shrink-0 bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.avatar_url}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Contributor Info */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-foreground">
                        {c.name}
                      </h3>
                      {c.role && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {c.role}
                        </Badge>
                      )}
                      {c.contributions && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                          <GitCommit className="size-3 text-primary" />
                          <span>{c.contributions} commits</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-primary">
                      @{c.login}
                    </p>
                    {c.bio && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                        {c.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Links and Actions */}
                <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center gap-3">
                  {c.html_url && (
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-all shadow-arcade-xs"
                    >
                      <Code2 className="size-3.5" />
                      <span>GitHub Profile</span>
                      <ExternalLink className="size-3 opacity-60" />
                    </a>
                  )}

                  {c.blog && (
                    <a
                      href={c.blog}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-all shadow-arcade-xs"
                    >
                      <Globe className="size-3.5" />
                      <span>Personal Website</span>
                      <ExternalLink className="size-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Scientific Partners & Sky Surveys */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            3. Scientific Partners &amp; Sky Survey Collaborations
          </h2>
          <p>
            Observation campaigns, sky survey data sets, and discovery confirmation pipelines on
            SaveDino operate in scientific collaboration with:
          </p>
          <ul className="list-disc list-inside space-y-2.5 pl-2">
            <li>
              <strong className="text-foreground">
                <a
                  href="https://sedssl.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  SEDS Sri Lanka
                </a>
                :
              </strong>{" "}
              Platform design, campaign hosting, student mentorship, and national astronomy outreach.
            </li>
            <li>
              <strong className="text-foreground">
                <a
                  href="http://iasc.cosmosearch.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  International Astronomical Search Collaboration (IASC)
                </a>
                :
              </strong>{" "}
              Hardin-Simmons University initiative distributing high-quality survey image sets,
              managing preliminary discovery reports, and facilitating student asteroid searches.
            </li>
            <li>
              <strong className="text-foreground">
                <a
                  href="https://panstarrs.ifa.hawaii.edu"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Pan-STARRS (Panoramic Survey Telescope and Rapid Response System)
                </a>
                :
              </strong>{" "}
              University of Hawaii Institute for Astronomy telescopes at Haleakala Observatory
              capturing astronomical FITS image sets.
            </li>
            <li>
              <strong className="text-foreground">
                <a
                  href="https://www.nasa.gov/planetarydefense"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  NASA Planetary Defense Coordination Office (PDCO)
                </a>
                :
              </strong>{" "}
              Supporting near-Earth object tracking and public citizen science search initiatives.
            </li>
            <li>
              <strong className="text-foreground">
                <a
                  href="https://minorplanetcenter.net"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Minor Planet Center (MPC) &amp; IAU
                </a>
                :
              </strong>{" "}
              Official international clearinghouse for collecting and verifying astrometric asteroid
              measurements under the International Astronomical Union.
            </li>
          </ul>
        </section>

        {/* Section 4: Open Source Technologies */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            4. Open Source Software &amp; Frameworks
          </h2>
          <p>
            SaveDino is built using modern open-source technologies created and maintained by the
            global developer community:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Next.js &amp; React:</strong> Full-stack framework
              and user interface component architecture (MIT License).
            </li>
            <li>
              <strong className="text-foreground">Tailwind CSS:</strong> Utility-first design token
              styling engine powering the Developer Tech &amp; Arcade Hybrid theme (MIT License).
            </li>
            <li>
              <strong className="text-foreground">Better Auth:</strong> Type-safe authentication
              engine supporting passwordless email magic link verification and sessions (MIT License).
            </li>
            <li>
              <strong className="text-foreground">Radix UI:</strong> Accessible, unstyled UI
              component primitives for dialogs, sheets, tooltips, and menus (MIT License).
            </li>
            <li>
              <strong className="text-foreground">Lucide Icons:</strong> Monotone, crisp vector icons
              powering navigation and status indicators (ISC License).
            </li>
            <li>
              <strong className="text-foreground">Bun:</strong> High-performance JavaScript runtime,
              bundler, and package manager (MIT License).
            </li>
            <li>
              <strong className="text-foreground">Prisma ORM:</strong> Next-generation TypeScript ORM
              for database modeling and migrations (Apache 2.0).
            </li>
            <li>
              <strong className="text-foreground">Sonner:</strong> Toast notification component for
              React (MIT License).
            </li>
          </ul>
        </section>

        {/* Section 5: Design, Typography & Sound Synthesis */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            5. Sound Synthesis &amp; Typography
          </h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Web Audio Synthesizer:</strong> Procedural 8-bit
              retro chiptune music and sound effects synthesized directly in code using the Web Audio
              API without external media assets.
            </li>
            <li>
              <strong className="text-foreground">Typography (Google Fonts):</strong>{" "}
              <em>Press Start 2P</em> (Arcade HUD &amp; Titles), <em>Space Mono</em> (Technical
              data &amp; IDs), and <em>Inter</em> (Platform UI &amp; Documents), licensed under Open
              Font License / Apache 2.0.
            </li>
          </ul>
        </section>

        {/* Section 6: Community & Citizen Scientists */}
        <section className="space-y-3 pb-2">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            6. Community &amp; Citizen Scientists
          </h2>
          <p>
            We extend our deepest gratitude to all student researchers, school squads, amateur
            astronomers, educators, and volunteers analyzing telescope frames. Your vigilance and
            contributions expand our understanding of the solar system and protect our planet.
          </p>
        </section>
      </main>
    </div>
  );
}

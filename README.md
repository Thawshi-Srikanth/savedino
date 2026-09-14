# SaveDino

> **Citizen Science Asteroid Search Campaign Management & Discovery Platform**  
> Built with passion by **[SEDS Sri Lanka](https://sedssl.org)**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Better Auth](https://img.shields.io/badge/Auth-Better--Auth-indigo)](https://better-auth.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<br />

<p align="center">
  <img src="public/opengraph-image.png" alt="SaveDino Platform Hero Banner" width="100%" />
</p>

---

## Overview

**SaveDino** is an open-source citizen science web platform designed to streamline and coordinate Asteroid Search Campaigns in Sri Lanka and worldwide. It provides automated squad matchmaking, real-time campaign tracking, telescope image set assignments, and astronomical dataset coordination for students, amateur astronomers, and research squads.

The platform blends a high-performance **Developer Tech** theme with an interactive **Retro Arcade Hybrid Design**, delivering an engaging and responsive experience for participants.

---

## Key Features

- **Passwordless Authentication**: Secure sign-in via email Magic Links and one-time verification tokens powered by [Better-Auth](https://better-auth.com).
- **Squad & Team Management**:
  - Create and lead asteroid hunting squads (up to 4 members per team).
  - Search public squads or join private squads with unique invite codes (e.g. `APOLLO-9X2`).
  - Send and review squad join requests with instant email notifications.
- **Campaign & Image Set Tracking**:
  - Explore national and international asteroid search campaigns (e.g. _All-Sri Lanka Asteroid Search 2026_).
  - Claim and analyze FITS telescope image sets using Astrometrica.
- **Role-Based Access Control (RBAC)**:
  - Granular permissions for `Admin`, `Staff`, `Leader`, `Member`, and `Solo Student` participants.
  - Dedicated Admin Management portal for user administration and automated matchmaking.
- **Resilient Email Infrastructure**:
  - Automated transactional emails for magic links, squad invites, and application status updates.
  - Multi-provider failover system with [Resend](https://resend.com) as primary and [Brevo](https://brevo.com) as secondary.
- **Built-in Arcade HUD**:
  - Interactive retro Dino mini-game in the platform header to celebrate cosmic milestones.
- **Modern SEO & Structured Data**:
  - OpenGraph / Twitter cards, dynamic XML sitemaps, robots policy, and JSON-LD schema for search engines.

---

## Tech Stack

| Layer               | Technology                                                                                                                                                    |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework**       | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Dynamic Routes)                                                                                 |
| **UI & Core**       | [React 19](https://react.dev), [TypeScript 5](https://www.typescriptlang.org)                                                                                 |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [Lucide React](https://lucide.dev), [Tabler Icons](https://tabler.io/icons) |
| **Database & ORM**  | [PostgreSQL](https://www.postgresql.org), [Prisma ORM 7](https://www.prisma.io)                                                                               |
| **Authentication**  | [Better-Auth](https://better-auth.com) (Magic Link, Sessions)                                                                                                 |
| **Emails**          | [Resend](https://resend.com) + [Brevo](https://brevo.com) (Auto-Failover)                                                                                     |
| **Package Manager** | [pnpm](https://pnpm.io)                                                                                                                                       |

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v20.x` or higher
- **pnpm**: `v10.x` or higher
- **PostgreSQL**: Local instance or remote database (e.g., Supabase, Neon, Railway)

### 1. Clone the Repository

```bash
git clone https://github.com/Thawshi-Srikanth/savedino.git
cd savedino
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the `.env.example` template to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/savedino?schema=public"

# App & Authentication
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="generate_a_random_32_character_secret_here"

# Transactional Emails (Optional for local testing)
EMAIL_FROM="SaveDino <login@savedino.sedssl.org>"
EMAIL_REPLY_TO="SEDS Sri Lanka <info@sedssl.org>"
RESEND_API_KEY="re_your_resend_key"
RESEND_SEGMENT_ID=""
BREVO_API_KEY="your_brevo_key"
```

### 4. Setup Database Schema & Seed Data

Push the Prisma schema to your PostgreSQL database and seed demo personas, squads, and campaigns:

```bash
# Push schema and generate Prisma client
pnpm prisma db push

# Seed initial development data
pnpm db:seed
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore SaveDino!

---

## Available Scripts

| Command             | Description                                                                 |
| :------------------ | :-------------------------------------------------------------------------- |
| `pnpm dev`          | Starts the Next.js development server with hot-reload                       |
| `pnpm build`        | Generates the Prisma client, verifies schema, and compiles production build |
| `pnpm start`        | Launches the compiled production application                                |
| `pnpm db:seed`      | Seeds the database with default roles, campaigns, squads, and test users    |
| `pnpm type-check`   | Runs the TypeScript compiler (`tsc --noEmit`) to validate types             |
| `pnpm format`       | Formats all code files across the codebase using Prettier                   |
| `pnpm format:check` | Checks if files comply with Prettier formatting rules                       |
| `pnpm lint`         | Runs ESLint to check for code quality and style violations                  |

---

## Directory Structure

```text
savedino/
├── app/                        # Next.js App Router
│   ├── (platform)/             # Authenticated platform pages & layout
│   │   ├── admin/              # Admin dashboard & squad matchmaking
│   │   ├── campaigns/          # Campaign explorer & image set claims
│   │   ├── credits/            # Dynamic contributors & open-source credits
│   │   ├── squads/ & teams/    # Squad management & invite flows
│   │   ├── profile/            # User profile & credentials
│   │   └── login/ & register/  # Passwordless authentication flows
│   ├── api/                    # Server Route Handlers
│   │   ├── admin/              # Protected admin management APIs
│   │   ├── auth/               # Better-Auth endpoints
│   │   ├── dev/                # Development-only studio & switchers
│   │   └── teams/              # Squad action APIs
│   ├── layout.tsx              # Root HTML & metadata layout
│   ├── robots.ts               # Search engine crawler policies
│   └── sitemap.ts              # Dynamic XML sitemap generator
├── components/                 # Reusable UI components
│   ├── ui/                     # Radix & Tailwind design system primitives
│   └── dev-persona-switcher.tsx # Development persona switcher bar
├── lib/                        # Business logic, email templates & Prisma client
│   ├── email.ts                # Multi-provider email dispatcher (Resend/Brevo)
│   ├── email-templates/        # Responsive HTML email templates
│   └── prisma.ts               # Global Prisma client instance
├── prisma/                     # Database schema definition
│   └── schema.prisma           # Prisma models & relations
├── public/                     # Static assets, branding, and OpenGraph images
└── scripts/                    # Database seeding and migration utilities
```

---

## Security Architecture

- **Protected API Handlers**: All dev routes (`/api/dev/*`, `/api/seed`) contain strict `process.env.NODE_ENV !== "development"` guards that return `403 Forbidden` / `404 Not Found` in production.
- **Session Protection**: All sensitive routes and mutations verify session tokens and role privileges through Better-Auth middleware and server headers.
- **Bot & Crawler Blocking**: Sensitive and internal paths (`/admin`, `/api`, `/profile`, `/team/*`) are explicitly disallowed in [`robots.ts`](app/robots.ts).

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/CosmicFeature`)
3. Commit your Changes (`git commit -m 'feat: Add CosmicFeature'`)
4. Push to the Branch (`git push origin feature/CosmicFeature`)
5. Open a Pull Request

---

## Credits & Attributions

- Organized & Developed by **[SEDS Sri Lanka](https://sedssl.org)** (Students for the Exploration and Development of Space).
- Maintained by **[Thawshi Srikanth](https://github.com/Thawshi-Srikanth)** ([thawshi.com](https://thawshi.com)).
- Check the interactive in-app [Credits Page](https://savedino.sedssl.org/credits) for the full list of GitHub contributors and open-source packages.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

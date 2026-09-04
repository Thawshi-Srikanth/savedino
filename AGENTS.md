<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Design System & UI Style Guidelines

## Style Scheme: "SaveDino Developer Tech & Arcade Hybrid Theme"

All components, designs, and pages created or modified in this repository MUST strictly follow the **SaveDino Developer Tech & Arcade Hybrid Theme**:

### 1. Color Palette & Scheme
- **Light Theme**:
  - Background Canvas: `#f8fafc` (Light Slate)
  - Card & Container background: `#ffffff` (Pure Flat White)
  - Primary Accent: `#8b5cf6` (Electric Violet)
  - Secondary Accents: `#10b981` (Emerald Green), `#38bdf8` (Sky Blue)
  - Text: `#0f172a` (Deep Slate)
- **Dark Theme / Night Mode**:
  - Background Canvas: `#121315` (Greyish Void Black)
  - Card & Container background: `#1c1d21` (Charcoal Slate)
  - Borders: `#38393e` (Greyish Dark Border)
  - Text: `#f3f4f6` (High Legibility Off-White)

### 2. Typography Rules & Constraints
- **Standard Sans Font (`font-sans` / `Inter`)**: Use for standard UI components, form controls, tables, buttons, cards, modals, navigation links, **badges, and status pills**.
- **Tech Monospace Font (`font-tech` / `font-mono` / `Space Mono`)**: Use for technical data, stats, metrics, IDs, timestamps, code blocks, and technical tags.
- **Pixel Font (`font-pixel` / `Press Start 2P`)**: ONLY allowed for retro game canvas elements, main arcade header title, and Dino game HUD.
- **CRITICAL RULE**: **DO NOT use pixel font (`font-pixel`) in badges, pills, buttons, form labels, or general platform UI components.**

### 3. Component Consistency
- Every new page, modal, form, or component must use CSS variables and Tailwind theme tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`, etc.) to align seamlessly with this style scheme.

### 4. UI Copy & Language Simplicity (CRITICAL RULE)
- **No Confusing Technical Jargon**: Never use overly complex terms or confusing technical jargon in user-facing copy (e.g., avoid "passwordless authentication", "cryptographic single-use tokens", "zero-password paradigm", etc.).
- **Keep it Simple and Direct**: Use plain, clear, and friendly language across all titles, descriptions, buttons, and badges (e.g., "Sign in", "Create account", "Send link", "Check your email", "We sent a link to your email").


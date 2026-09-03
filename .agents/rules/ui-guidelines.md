# PostHog Design System & UI Guidelines

## 1. PostHog Theme System (`app/globals.css`)
- **Light Mode ("Parchment Cream & Electric Orange")**:
  - Background: `#f3f4ef` (PostHog parchment cream).
  - Cards: `#ffffff` with solid dark border `#23241f`.
  - Primary Accent: `#f54e00` (PostHog Electric Orange).
  - Text: `#23241f` charcoal.
- **Dark Mode ("PostHog Midnight Void")**:
  - Background: `#151618` (PostHog midnight void).
  - Cards: `#1d1e21` dark slate.
  - Primary Accent: `#f54e00` (PostHog Electric Orange).
  - Text: `#f3f4f6` off-white.

## 2. Component Design Specifications (`components/ui/*`)
- **Buttons**: Font-mono bold text with solid borders (`border border-[#23241f]`), PostHog orange fill (`#f54e00`), and active press depth effect (`active:translate-y-[1px]`).
- **Badges**: Rounded-full font-mono badges (`text-[10px] font-mono font-semibold uppercase tracking-wider`).
- **Cards**: `rounded-lg border border-border bg-card text-card-foreground shadow-xs`.

## 3. No Raw Emojis in UI Text
- Do **NOT** use raw inline emojis in titles, navigation buttons, tabs, modal headers, or badges.
- Use `lucide-react` icons or clean, unadorned text.

## 4. Clear, Professional English Text
- Use simple, plain, clear, professional UI text (e.g. "Sign In", "Create Account", "Campaigns", "Teams").

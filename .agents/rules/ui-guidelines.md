# UI Guidelines & Design System Rules

## 1. Homepage Visual Consistency System
- All platform routes and components must follow the homepage visual theme system:
  - **Light Mode Canvas**: `#f4f4f4` background, `#f9f9f9` cards, `#535353` text, `#0284c7` primary accents.
  - **Night Mode Canvas**: `#121212` background, `#1c1c1e` cards, `#e8eaed` text, `#38bdf8` primary accents.
  - **Card Containers**: Bordered with `border-border` (`rgba(83,83,83,0.25)` light / `rgba(128,134,139,0.35)` dark).

## 2. Component Design Specifications (`components/ui/*`)
- **Badges**: Rounded-full pills with `font-mono uppercase text-[10px] tracking-wide`.
- **Buttons**: Font-mono text with crisp borders (`border-border`), sky-blue primary fill (`bg-primary`), and hover transitions matching homepage controls.
- **Inputs & Textareas**: Font-mono inputs with `border-border` borders and smooth focus rings.
- **Cards**: `rounded-lg border border-border bg-card text-card-foreground shadow-xs`.

## 3. No Raw Emojis in UI Text
- Do **NOT** use raw inline emojis in titles, navigation buttons, tabs, modal headers, or badges.
- Use `lucide-react` icons or clean, unadorned text.

## 4. Clear, Professional English Text
- Use simple, plain, clear, professional UI text (e.g. "Sign In", "Create Account", "Campaigns", "Teams").

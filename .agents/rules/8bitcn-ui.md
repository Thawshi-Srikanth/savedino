# 8bitcn / shadcn UI Component System Rules

## Rule Context
This project utilizes the official **8bitcn UI component library** (`@8bitcn/*`) built on top of shadcn/ui and Tailwind CSS.

## Layout & Architecture Isolation

1. **Homepage Isolation (`/`)**:
   - The homepage (`app/page.tsx`) is a dedicated full-screen pixel game arcade canvas (`DinoGameCanvas`).
   - It remains isolated with its own minimalist game header and retro sound controls.
   - Do NOT wrap the homepage in platform sidebars or dashboard shells.

2. **Platform & Dashboard Layouts (`/campaigns`, `/team/[teamId]`, `/admin`, `/login`, `/register`)**:
   - All application pages outside the homepage MUST use the **8bitcn Platform Shell**.
   - Use official 8bitcn components located in `components/ui/8bit/` and `components/ui/`:
     - **Layout & Navigation**: `@8bitcn/sidebar`, `@8bitcn/breadcrumb`, `@8bitcn/navigation-menu`, `@8bitcn/tabs`, `@8bitcn/dropdown-menu`
     - **Cards & Data**: `@8bitcn/card`, `@8bitcn/table`, `@8bitcn/badge`, `@8bitcn/progress`
     - **Controls & Actions**: `@8bitcn/button`, `@8bitcn/input`, `@8bitcn/select`, `@8bitcn/dialog`
     - **Retro Game Accents**: `@8bitcn/retro-mode-switcher`, `@8bitcn/health-bar`, `@8bitcn/xp-bar`

3. **Styling Guidelines**:
   - Import `@/components/ui/8bit/styles/retro.css` for `.retro` font family rules.
   - Combine 8-bit pixel fonts (`font-pixel`) for titles and buttons with monospace (`font-mono`) for numerical data.
   - Support dark/light mode seamless toggle via `retro-mode-switcher` and CSS variables.

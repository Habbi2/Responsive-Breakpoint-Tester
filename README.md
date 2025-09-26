<p align="center"><img width="90" src="src/app/icon.svg" alt="Breakpoint Tester" /></p>

# Responsive Breakpoint Tester

> Instant multi‑viewport preview & sharing for any public URL. [Live Demo](https://responsive-breakpoint-tester.vercel.app)

![Stars](https://img.shields.io/github/stars/Habbi2/Responsive-Breakpoint-Tester?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square) ![Status](https://img.shields.io/badge/status-stable-green?style=flat-square)

Instantly preview any public URL across multiple viewport widths in parallel. No login. Copy a single URL to restore layout & settings.

## Table of Contents
1. Overview
2. Core Features
3. Quick Start
4. URL Parameters
5. Breakpoint & Preset Model
6. Performance & Heuristics
7. Limitations
8. Roadmap / Ideas
9. Tech Stack
10. Contributing
11. License

## 1. Overview
The tool renders the same page in multiple iframes sized to your chosen breakpoints (px or em). It focuses on speed (lazy mounting, minimal re-renders), shareability (state encoded in the location bar), and local persistence (no server storage).

## 2. Core Features
- Dynamic breakpoints: add / edit / remove (`px` or `em`) sorted automatically
- Adjustable unified frame height (select + range slider)
- Theme modes: light / dark / system (persisted)
- Lazy loading (only mount frames when near viewport) + manual early load
- Per-frame load timing + aggregate average (optional)
- Heuristic slow / blocked overlays with reload / external open
- Local presets (name -> breakpoint list + optional URL) with migration from legacy format
- Shareable state via query parameters (copy address bar or use Copy button)

## 3. Quick Start
```bash
git clone https://github.com/Habbi2/Responsive-Breakpoint-Tester
cd Responsive-Breakpoint-Tester
npm install
npm run dev
```
Open http://localhost:3000 and click Open Tool.

## 4. URL Parameters
State is encoded to allow copy/paste reproducibility:
- `w` – serialized breakpoints list, e.g. `360px,480px,48em,1024px`
- `u` – target URL (must start with https?://)
- `h` – frame height (number of px, 300–1200)
- `t` – theme (`light` | `dark` | `system`)

Example:
```
?w=360px,480px,768px,1024px&u=https://example.com&h=600&t=dark
```

## 5. Breakpoint & Preset Model
Internal breakpoint interface:
```ts
interface Breakpoint { id: string; width: number; unit: 'px' | 'em'; }
```
Serialization: `width+unit` joined by commas: `360px,48em,1024px`.

Presets stored in `localStorage` under key `rbp-presets`:
```ts
interface PresetData { w: string; u?: string | null }
// Shape: { "MyPreset": { w: "360px,768px", u: "https://site.com" } }
```
Legacy string-only values automatically migrate to object form.

## 6. Performance & Heuristics
- Lazy load uses IntersectionObserver with 200px root margin to pre-mount just before scroll arrival.
- Timing: start recorded when a frame is scheduled to load; end on iframe `onLoad`.
- Average load time displayed when all visible frames settle.
- Slow / Blocked detection (current thresholds in code):
	- Slow: > 2000ms without `onLoad`
	- Blocked: > 3500ms OR known blocked domain pattern
- Block patterns help short-circuit known anti-embed domains.

## 7. Limitations
Some pages intentionally prevent embedding:
- `X-Frame-Options: DENY | SAMEORIGIN`
- `Content-Security-Policy: frame-ancestors ...`
Client code cannot bypass these security policies; affected frames show a blocked overlay with retry & open buttons.

Other notes:
- No JS execution isolation beyond standard iframe sandboxing (no custom proxy layer).
- No screenshot capture (yet).
- Not a full accessibility or performance audit tool—purely visual breakpoint verification + basic load signal.

## 8. Roadmap / Ideas
- Batch screenshot export (PNG strip or zip)
- Extract probable breakpoints from target CSS (parse `@media` queries)
- Color contrast quick scan per frame
- Optional diff mode (compare two URLs at identical breakpoints)
- Drag-to-resize individual frames (resizable handles)

## 9. Tech Stack
- Next.js 14 (App Router, React 18, TypeScript)
- Tailwind CSS utility-first styling
- IntersectionObserver for lazy mount
- LocalStorage for persistence

## 10. Contributing
Lightweight—open an issue or PR.

Guidelines:
- Keep PRs focused (one enhancement max)
- Avoid adding heavy dependencies unless discussed
- Maintain readability in `page.tsx` (consider extracting logic if it grows further)

## 11. License
MIT.

## Social / Preview Assets
Suggested OG image: 4 columns (mobile → desktop) showing the same site with widths captioned. Consider dynamic generation using a template (see upcoming portal OG service).

---
Design & build by Habbi Web Design. Share improvements back! 🚀

# Responsive Breakpoint Tester

Preview a URL across multiple viewport widths simultaneously. Fast, no-auth, sharable via a single URL parameter string.

## Features
- Add / remove pixel or `em` breakpoints
- Adjustable unified frame height (slider + presets)
- Light / Dark / System theme (persisted locally)
- Lazy iframe loading with manual force-load option
- Performance timing (per frame + average) optional overlay
- Heuristic blocked-frame overlay (slow >2s, blocked >3.5s) with retry + open externally (common for Google*, Facebook, Instagram, X/Twitter, LinkedIn)
- Color contrast quick scan (same-origin iframes only) highlighting failing text nodes and summarizing per breakpoint
- Presets saved locally (store breakpoint list + optional URL)
- Shareable state via query parameters: `?w=360px,480px,768px&u=https://example.com&h=600&t=dark`

## Not Implemented / Ideas
- Screenshot export batch
- Extract breakpoints from target CSS
- Enhanced accessibility audits (focus order, landmarks)

## Known Limitations
Some sites block embedding using either:
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `Content-Security-Policy: frame-ancestors ...`
These cannot be bypassed client-side; such frames will refuse to load.

Color contrast scan:
- Only works for same-origin frames (cross-origin DOM is inaccessible).
- Simple heuristic for large text: >=24px regular weight OR >=19px bold counts as "large" for WCAG threshold adjustments.
- Caps at ~1500 elements per frame for performance.
- Adds red outline to failing elements temporarily (page reload clears it).

## Development
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Tech Stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS

## Presets Storage
Stored under `localStorage` key `rbp-presets` as object: `{ name: { w: "360px,768px", u?: "https://..." } }` (legacy string-only values migrate automatically).

## License
MIT (add explicit LICENSE file if publishing publicly).

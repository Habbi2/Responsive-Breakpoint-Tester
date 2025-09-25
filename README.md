# Responsive Breakpoint Tester

Preview a URL across multiple viewport widths simultaneously. Fast, no-auth, sharable via a single URL parameter string.

## Features
- Add / remove pixel or `em` breakpoints
- Adjustable unified frame height (slider + presets)
- Light / Dark / System theme (persisted locally)
- Lazy iframe loading with manual force-load option
- Performance timing (per frame + average) optional overlay
- Heuristic blocked-frame overlay (slow >4s, blocked >8s) with retry + open externally
- Presets saved locally (store breakpoint list + optional URL)
- Shareable state via query parameters: `?w=360px,480px,768px&u=https://example.com&h=600&t=dark`

## Not Implemented / Ideas
- Screenshot export batch
- Extract breakpoints from target CSS
- Contrast checking per frame

## Known Limitations
Some sites block embedding using either:
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `Content-Security-Policy: frame-ancestors ...`
These cannot be bypassed client-side; such frames will refuse to load.

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

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Responsive Breakpoint Tester</h1>
        <p className="text-base-muted max-w-prose">Preview any public URL across multiple viewport widths simultaneously. No login, fast, shareable.</p>
      </header>
      <div className="flex gap-4">
        <Link href="/app" className="bg-base-accent text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90">Open Tool</Link>
        <Link href="/about" className="text-base-accent text-sm font-medium underline underline-offset-4">About</Link>
      </div>
      <section className="grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <h2 className="font-medium mb-1">Fast</h2>
          <p>Optimized rendering and lazy frames keep it snappy.</p>
        </div>
        <div>
          <h2 className="font-medium mb-1">Shareable</h2>
          <p>Copy a URL to reproduce layout + breakpoints instantly.</p>
        </div>
        <div>
          <h2 className="font-medium mb-1">Local</h2>
          <p>Settings + presets stored locally. No accounts ever.</p>
        </div>
      </section>
      <footer className="pt-10 text-xs text-base-muted">
        Built for front-end teams — <Link href="/about" className="font-medium text-base-accent hover:underline">Habbi Web Design</Link>
        <span className="mx-2">·</span>
        <a href="https://www.habbiwebdesign.site/" target="_blank" rel="noopener" className="hover:underline text-base-accent">Website</a>
      </footer>
    </main>
  );
}

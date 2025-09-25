import Link from 'next/link';

const ABOUT_TEXT = `Responsive Breakpoint Tester lets you preview any public web page across multiple viewport widths at once. 
It focuses on:
• Speed – minimal overhead + lazy iframe loading.
• Shareability – copy a single URL to reproduce breakpoints and settings.
• Local privacy – everything (presets, theme) stored in your browser.

Limitations:
Some sites set security headers (X-Frame-Options / frame-ancestors) that block embedding. Those frames will show as blocked. This is a browser security policy – not a bug in the tool.
`;

export const metadata = { title: 'About – Responsive Breakpoint Tester' };

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-14 space-y-10">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">About</h1>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-base-muted">{ABOUT_TEXT}</p>
      </div>
      <section className="space-y-4 text-sm">
        <h2 className="font-medium">Why build this?</h2>
        <p>The goal was a fast, no-login, copy-link-and-share responsive preview that your team can use in daily reviews without extra accounts or vendor lock.</p>
        <h2 className="font-medium">Planned ideas</h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>One-click screenshot set export</li>
          <li>Breakpoint suggestion (extract from CSS)</li>
          <li>Color contrast quick scan (per frame)</li>
        </ul>
      </section>
      <div className="flex gap-4 text-sm">
        <Link href="/" className="text-base-accent underline underline-offset-4">Home</Link>
        <Link href="/app" className="text-base-accent underline underline-offset-4">Open Tool</Link>
        <a href="https://www.habbiwebdesign.site/" target="_blank" rel="noopener" className="text-base-accent underline underline-offset-4">Habbi Web Design</a>
      </div>
    </main>
  );
}

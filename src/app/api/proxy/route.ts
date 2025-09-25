import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Basic HTML rewrite: inject <base> and strip inline CSP meta to reduce breakage.
// WARNING: This is a minimal proxy and not production hardened. Do not expose broadly without additional sanitization.

export const revalidate = 0; // no caching

function isAllowed(url: URL) {
  // Restrict protocols & optionally block private networks.
  if(!['http:','https:'].includes(url.protocol)) return false;
  // Basic private IP guard (very naive).
  if(/^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(url.hostname)) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('u');
  if(!target) return NextResponse.json({ error: 'missing u' }, { status: 400 });
  let url: URL;
  try { url = new URL(target); } catch { return NextResponse.json({ error: 'invalid url' }, { status: 400 }); }
  if(!isAllowed(url)) return NextResponse.json({ error: 'blocked' }, { status: 400 });

  let resp: Response;
  try {
    resp = await fetch(url.toString(), { redirect: 'follow', headers: { 'User-Agent': 'BreakpointTester/1.0' }});
  } catch (e) {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
  const ct = resp.headers.get('content-type') || '';
  if(!ct.includes('text/html')) {
    return NextResponse.json({ error: 'not html', contentType: ct }, { status: 415 });
  }
  const text = await resp.text();
  // Very light rewrite: ensure a <base> tag so relative assets load.
  const origin = url.origin + url.pathname.replace(/\/[^/]*$/, '/');
  const baseTag = `<base href="${origin}">`;
  let rewritten = text.replace(/<meta[^>]+content-security-policy[^>]*>/gi, '');
  if(/<head[^>]*>/i.test(rewritten)) {
    rewritten = rewritten.replace(/<head[^>]*>/i, match => `${match}\n${baseTag}`);
  } else {
    rewritten = baseTag + rewritten;
  }
  // Inject a small script to mark proxied context (optional).
  rewritten = rewritten.replace('</head>', '<script>window.__PROXIED__=true;</script></head>');

  return new NextResponse(rewritten, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

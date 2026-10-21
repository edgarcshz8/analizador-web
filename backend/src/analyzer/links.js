import { URL } from 'url';
import * as cheerio from 'cheerio';
import { http } from './fetch.js';

const LIMIT       = 40;
const CONCURRENCY = 5;

function resolve(href, base) {
  try { return new URL(href, base).href; } catch { return null; }
}

async function ping(url) {
  try {
    const res = await http.head(url, { timeout: 6000 });
    if (res.status === 405) {
      const res2 = await http.get(url, { timeout: 6000, responseType: 'stream' });
      res2.data?.destroy?.();
      return res2.status;
    }
    return res.status;
  } catch { return 0; }
}

export async function checkLinks(html, baseUrl) {
  const $    = cheerio.load(html);
  const base = new URL(baseUrl);
  const seen = new Set();
  const all  = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    const text = $(el).text().trim().slice(0, 60);
    if (!href || /^(#|mailto:|tel:|javascript:)/.test(href)) return;
    const resolved = resolve(href, baseUrl);
    if (!resolved || seen.has(resolved)) return;
    seen.add(resolved);
    all.push({ url: resolved, text, isExternal: new URL(resolved).hostname !== base.hostname });
  });

  const toCheck = all.slice(0, LIMIT);
  const broken    = [];
  const redirects = [];

  for (let i = 0; i < toCheck.length; i += CONCURRENCY) {
    const batch   = toCheck.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (link) => ({ ...link, status: await ping(link.url) })));
    for (const r of results) {
      if ([404, 410, 0].includes(r.status)) broken.push(r);
      else if ([301, 302, 307, 308].includes(r.status)) redirects.push(r);
    }
  }

  return { total: all.length, checked: toCheck.length, broken, redirects };
}

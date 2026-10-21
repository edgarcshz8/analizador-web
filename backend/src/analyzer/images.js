import * as cheerio from 'cheerio';
import { http } from './fetch.js';

const CONCURRENCY = 5;

function resolve(src, base) {
  if (!src || src.startsWith('data:')) return null;
  try { return new URL(src, base).href; } catch { return null; }
}

export async function checkImages(html, baseUrl) {
  const $   = cheerio.load(html);
  const imgs = [];

  $('img').each((_, el) => {
    const src     = $(el).attr('src')?.trim();
    const alt     = $(el).attr('alt');
    const resolved = resolve(src, baseUrl);
    if (!resolved) return;
    imgs.push({ src: resolved, originalSrc: src, hasAlt: alt !== undefined, altText: alt ?? '' });
  });

  const missingAlt = imgs.filter(i => !i.hasAlt || i.altText.trim() === '');
  const broken     = [];

  for (let i = 0; i < imgs.length; i += CONCURRENCY) {
    const batch   = imgs.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (img) => {
      try {
        const res     = await http.head(img.src, { timeout: 5000 });
        const isImage = res.headers['content-type']?.startsWith('image/');
        if (res.status >= 400 || (res.status === 200 && !isImage)) return img;
        return null;
      } catch { return img; }
    }));
    broken.push(...results.filter(Boolean));
  }

  return { total: imgs.length, broken, missingAlt };
}

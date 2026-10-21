import { fetchPage }   from './fetch.js';
import { checkSSL }    from './ssl.js';
import { checkSEO }    from './seo.js';
import { checkLinks }  from './links.js';
import { checkImages } from './images.js';

function calcSummary(ssl, seo, links, images, speed) {
  let score = 100;
  let critical = 0, warnings = 0, passed = 0;

  const add = (status) => {
    if (status === 'critical') { score -= 10; critical++; }
    else if (status === 'warning') { score -= 3; warnings++; }
    else passed++;
  };

  add(ssl.status);
  add(speed.status);
  add(seo.title.status);
  add(seo.description.status);
  add(seo.h1.status);
  add(seo.canonical.exists  ? 'ok' : 'warning');
  add(seo.viewport.exists   ? 'ok' : 'critical');
  add(seo.og.title.exists && seo.og.description.exists && seo.og.image.exists ? 'ok' : 'warning');

  if (links.broken.length > 0) {
    const s = links.broken.length > 2 ? 'critical' : 'warning';
    score -= links.broken.length * 4;
    s === 'critical' ? critical++ : warnings++;
  } else passed++;

  if (images.broken.length > 0) {
    score -= images.broken.length * 3;
    critical++;
  } else passed++;

  if (images.missingAlt.length > 0) {
    score -= Math.min(images.missingAlt.length, 5);
    warnings++;
  } else passed++;

  return { score: Math.max(0, score), critical, warnings, passed };
}

export async function analyze(rawUrl) {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const [sslResult, pageResult] = await Promise.all([
    checkSSL(url),
    fetchPage(url),
  ]);

  const { res, responseTime } = pageResult;

  const speedStatus = responseTime < 1000 ? 'ok' : responseTime < 3000 ? 'warning' : 'critical';
  const speed       = { responseTime, status: speedStatus };

  const html = typeof res.data === 'string' ? res.data : '';

  const [seoResult, linksResult, imagesResult] = await Promise.all([
    Promise.resolve(checkSEO(html)),
    checkLinks(html, url),
    checkImages(html, url),
  ]);

  const summary = calcSummary(sslResult, seoResult, linksResult, imagesResult, speed);

  return {
    url,
    analyzedAt: new Date().toISOString(),
    speed,
    ssl:    sslResult,
    seo:    seoResult,
    links:  linksResult,
    images: imagesResult,
    summary,
  };
}

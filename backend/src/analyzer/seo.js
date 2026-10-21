import * as cheerio from 'cheerio';

export function checkSEO(html) {
  const $ = cheerio.load(html);

  // Title
  const titleVal  = $('title').first().text().trim();
  const titleLen  = titleVal.length;
  const titleStatus = !titleVal ? 'critical' : (titleLen < 30 || titleLen > 60) ? 'warning' : 'ok';

  // Meta description
  const descVal    = $('meta[name="description"]').attr('content')?.trim() ?? '';
  const descLen    = descVal.length;
  const descStatus = !descVal ? 'critical' : (descLen < 120 || descLen > 160) ? 'warning' : 'ok';

  // H1
  const h1Els    = $('h1');
  const h1Count  = h1Els.length;
  const h1Values = h1Els.map((_, el) => $(el).text().trim()).get();
  const h1Status = h1Count === 0 ? 'critical' : h1Count > 1 ? 'warning' : 'ok';

  // H2
  const h2Count = $('h2').length;

  return {
    title:       { value: titleVal, length: titleLen, status: titleStatus },
    description: { value: descVal,  length: descLen,  status: descStatus },
    h1:          { count: h1Count, values: h1Values,  status: h1Status },
    h2Count,
    canonical: { exists: !!$('link[rel="canonical"]').attr('href'), value: $('link[rel="canonical"]').attr('href') || null },
    robots:    { exists: !!$('meta[name="robots"]').attr('content'), value: $('meta[name="robots"]').attr('content') || null },
    viewport:  { exists: !!$('meta[name="viewport"]').attr('content') },
    og: {
      title:       { exists: !!$('meta[property="og:title"]').attr('content') },
      description: { exists: !!$('meta[property="og:description"]').attr('content') },
      image:       { exists: !!$('meta[property="og:image"]').attr('content') },
    },
  };
}

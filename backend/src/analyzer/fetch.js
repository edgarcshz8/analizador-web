import axios from 'axios';

export const http = axios.create({
  timeout: 8000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebAnalyzer/1.0; +https://edgarcampos.cl)' },
  validateStatus: () => true,
  maxRedirects: 5,
});

export async function fetchPage(url) {
  const start = Date.now();
  const res = await http.get(url, { responseType: 'text' });
  const responseTime = Date.now() - start;
  return { res, responseTime };
}

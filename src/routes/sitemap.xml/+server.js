import { absoluteUrl, sitePages } from '$lib/site.js';

export const prerender = true;

export function GET() {
  const urls = sitePages()
    .map((page) => `  <url><loc>${absoluteUrl(page.path)}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

import { CONTACT_EMAIL } from '$lib/contact.js';
import { absoluteUrl, sitePages } from '$lib/site.js';

export const prerender = true;

export function GET() {
  const pages = sitePages();
  const links = pages
    .map((page) => `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`)
    .join('\n');

  const body = `# Pithia (Πυθία)

> Greek premium rolling house, founded in 2013 in Athens. Rolling papers, filter tips, tobacco cases, and wallets. The public site is an editorial catalogue and story, not the online shop.

Pithia takes its name from the oracle of Delphi. The craft started in 1991 at a kiosk on Patision 302. The company is 100% Greek. The Physis (Φύσις) line is the plant-based, plastic-free range of papers and filters. Filter tips are made in Greece. The site is written in Greek by default, and the same pages are also available in English, Spanish, and Dutch — the language is chosen in the browser, not by a separate URL.

The site is for adults. It asks visitors to confirm they are 18 or older before they read it.

House: Patision 302, 11141 Athens. Shop: Patision 306, Athens. Email: ${CONTACT_EMAIL}.

## Pages

${links}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

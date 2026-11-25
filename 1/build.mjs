// node build.mjs  ->  renders src/index.html + site.config.mjs into index.html
import { readFileSync, writeFileSync } from 'node:fs';
import c from './site.config.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const a = c.address;

const stats = c.stats.map((s) => {
  const final = s.value.toFixed(s.decimals);
  return `<li class="stat"><p class="stat__num"><span data-count="${s.value}" data-decimals="${s.decimals}" style="min-width:${final.length}ch">${final}</span><span class="stat__suffix">${esc(s.suffix)}</span></p><p class="label">${esc(s.label)}</p></li>`;
}).join('\n          ');

const jsonld = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: c.name,
  url: c.url,
  image: c.url + 'assets/og.jpg',
  telephone: c.phoneE164,
  foundingDate: String(c.founded),
  description: 'Electronic weighing scales, weighbridges and load cells. Built, calibrated and serviced since 1996.',
  address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal, addressCountry: a.country },
}).replace(/</g, '\\u003c');

const vars = {
  name: esc(c.name), url: esc(c.url), phoneDisplay: esc(c.phoneDisplay), phoneE164: esc(c.phoneE164),
  whatsapp: esc(c.whatsapp), addressLine: esc(`${a.street}, ${a.city} ${a.postal}`), gstin: esc(c.gstin),
  founded: c.founded, year: new Date().getFullYear(), stats, jsonld,
};

const out = readFileSync('src/index.html', 'utf8').replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in vars)) throw new Error(`Unknown token ${m}`);
  return vars[k];
});
// self-check: no tokens left, JSON-LD parses
if (/\{\{\w+\}\}/.test(out)) throw new Error('Unrendered token left in output');
JSON.parse(out.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
writeFileSync('index.html', out);
console.log('index.html built');

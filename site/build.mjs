// node build.mjs  ->  renders src/data.mjs into dist/ (static, clean URLs, no framework)
import { mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { site, categories, products, faqs, gallery, ranges } from './src/data.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });
cpSync(join(ROOT, 'src/styles.css'), join(DIST, 'styles.css'));
cpSync(join(ROOT, 'src/main.js'), join(DIST, 'main.js'));
// Project 1 (3D / scroll-motion site), copied byte-for-byte, unchanged, to /experience/
cpSync(join(ROOT, '../1'), join(DIST, 'experience'), { recursive: true });

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const catBy = Object.fromEntries(categories.map((c) => [c.slug, c]));
const prodBy = Object.fromEntries(products.map((p) => [p.slug, p]));
const a = site.address;
const addressLine = `${a.street}, ${a.city}, ${a.region} ${a.postal}`;
const year = new Date().getFullYear();
const wa = (text) => `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
const waProduct = (name) => wa(`Hi Sunstar, please share today's price for: ${name}`);
const waGeneral = wa('Hi Sunstar, I need a price for a weighing scale');
const tel = `tel:${site.phoneE164}`;
const urlOf = (path) => site.domain + '/' + path;
const clip = (s, n = 158) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,.;:]$/, '') + '…');
const spec = (p, k) => (p.specs.find(([x]) => x === k) || [])[1] || '';
const capOf = (p) => spec(p, 'Capacity');

// ---------- 7-segment readout (the scale's own display, drawn as SVG) ----------
const SEG = {
  a: '1,0 9,0 7.6,1.8 2.4,1.8', d: '2.4,16.2 7.6,16.2 9,18 1,18', g: '1,9 2.4,8.1 7.6,8.1 9,9 7.6,9.9 2.4,9.9',
  f: '0,1 1.8,2.4 1.8,7.6 0,8.6', b: '10,1 10,8.6 8.2,7.6 8.2,2.4', e: '0,9.4 1.8,10.4 1.8,15.6 0,17', c: '10,9.4 10,17 8.2,15.6 8.2,10.4',
};
const DIGIT = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', ' ': '' };
function readout(str, { label } = {}) {
  const cells = [];
  for (const ch of String(str)) { if (ch === '.' && cells.length) cells[cells.length - 1].dp = true; else cells.push({ ch, dp: false }); }
  const W = 13.5, w = cells.length * W;
  const body = cells.map(({ ch, dp }, i) => {
    const on = DIGIT[ch] ?? '';
    const segs = Object.entries(SEG).map(([k, pts]) => `<polygon points="${pts}" class="${on.includes(k) ? 'on' : 'off'}"/>`).join('');
    return `<g transform="translate(${i * W + 1.5} 0) skewX(-7)">${segs}<rect x="10.6" y="15.4" width="2.6" height="2.6" class="${dp ? 'on' : 'off'}"/></g>`;
  }).join('');
  return `<svg class="seg" viewBox="0 0 ${w + 2} 18" role="img" aria-label="${esc(label || str)}">${body}</svg>`;
}
// "30 kg" -> display text "30.000" style readouts keep the scale's 3 decimals for kg
const capReadout = (cap) => {
  const m = /^([\d.]+)\s*(kg|g|t)$/.exec(cap || '');
  if (!m) return '';
  const v = m[2] === 'kg' ? Number(m[1]).toFixed(3) : m[1];
  return `<span class="disp disp--sm">${readout(v, { label: cap })}<span class="disp__unit">${m[2]}</span></span>`;
};

// ---------- components (all take `r` = relative prefix to site root) ----------
const shot = (r, p, { sizes = '(max-width: 760px) 90vw, 50vw', lazy = true, h } = {}) => {
  if (!p.img) return `<span class="noimg" role="img" aria-label="${esc(p.name)}, photo coming soon"><img src="${r}assets/sunstar-seal.webp" alt="" width="64" height="64" loading="lazy"><strong>${esc(p.model || p.name)}</strong><span>Photo coming soon. Ask us on WhatsApp for pictures.</span></span>`;
  const ar = (p.img.w / p.img.h).toFixed(3);
  return `<span class="shot" style="--ar:${ar}${h ? `;--h:${h}` : ''}"><img src="${r}assets/products/${p.img.file}.webp" srcset="${r}assets/products/${p.img.file}-640.webp 640w, ${r}assets/products/${p.img.file}.webp ${p.img.w}w" sizes="${sizes}" width="${p.img.w}" height="${p.img.h}" alt="${esc(p.name)}, ${esc(site.brand)} weighing machine, Bahadurgarh"${lazy ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async"></span>`;
};

// The spec plate printed on every Sunstar scale: Max / Min / e
const plateRow = (p) => {
  const max = capOf(p), min = spec(p, 'Minimum'), e = spec(p, 'Readability (e)');
  if (!max) return '';
  return `<dl class="specplate"><div><dt>Max</dt><dd>${esc(max)}</dd></div>${min ? `<div><dt>Min</dt><dd>${esc(min)}</dd></div>` : ''}${e ? `<div><dt>e</dt><dd>${esc(e)}</dd></div>` : ''}</dl>`;
};
const specTable = (p, { withAsk = true } = {}) => {
  const rows = p.specs.filter(([k]) => !['Capacity', 'Minimum', 'Readability (e)'].includes(k));
  return `<table class="specs">
${rows.map(([k, v]) => `        <tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('\n')}
${withAsk ? p.ask.map((k) => `        <tr><th scope="row">${esc(k)}</th><td class="ask">Ask us</td></tr>`).join('\n') : ''}
      </table>`;
};

const tile = (r, p) => `<li class="tile pcard" data-cat="${p.cat}">
        <a class="pcard__img" href="${r}products/${p.slug}/" tabindex="-1" aria-hidden="true">${shot(r, p, { sizes: '(max-width: 760px) 80vw, (max-width: 1100px) 40vw, 26vw' })}</a>
        <div class="pcard__body">
          <h3><a href="${r}products/${p.slug}/">${esc(p.model || p.name)}</a></h3>
          <p class="pcard__sub">${esc(p.model ? p.name.replace(p.model + ' ', '') : catBy[p.cat].name)}</p>
          ${capOf(p) ? `<p class="pcard__cap">${capOf(p).includes('/') ? esc(capOf(p)) : `Up to ${esc(capOf(p))}`}</p>` : ''}
          <div class="pcard__cta"><a class="btn btn--sm" href="${waProduct(p.name)}">Get price</a><a class="textlink textlink--chev" href="${r}products/${p.slug}/">Learn more</a></div>
        </div>
      </li>`;

const typeList = (c) => `<ul class="types">
${c.types.map((t) => `        <li><span>${esc(t)}</span><a href="${waProduct(t)}">Ask for price</a></li>`).join('\n')}
      </ul>`;

const faqBlock = (items) => `<section class="band faq" aria-labelledby="faq-title">
  <div class="wrap faq__in">
    <h2 id="faq-title">Common questions</h2>
    <div>${items.map(([q, ans]) => `<details><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join('\n    ')}</div>
  </div>
</section>`;

const closing = () => `<section class="closing" aria-labelledby="closing-title">
  <div class="wrap closing__in">
    <div>
      <h2 id="closing-title">Ask for today’s price</h2>
      <p>Send the model or the weight you need on WhatsApp. We reply the same day.</p>
    </div>
    <div class="closing__cta">
      <a class="btn btn--ink" href="${waGeneral}">WhatsApp us</a>
      <a class="btn btn--line" href="${tel}">Call ${esc(site.phoneDisplay)}</a>
    </div>
    <address>${esc(site.name)}, ${esc(addressLine)}</address>
  </div>
</section>`;

const crumbsHtml = (r, crumbs) => `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>
  <li><a href="${r}">Home</a></li>
  ${crumbs.map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${r}${c.path}">${esc(c.name)}</a></li>`)).join('\n  ')}
</ol></nav>`;


const rangeBlock = (rg) => `<section class="band band--tight range"><div class="wrap">
    <h2 class="h3">${esc(rg.title)}</h2>
    <div class="range__scroll"><table class="specs range__table"><thead><tr>${rg.cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>
      ${rg.rows.map((row) => `<tr>${row.map((v, i) => (i ? `<td>${esc(v)}</td>` : `<th scope="row">${esc(v)}</th>`)).join('')}</tr>`).join('\n      ')}
    </tbody></table></div>
    ${rg.notes.length ? `<ul class="range__notes">${rg.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
  </div></section>`;
const rangesFor = (kind, slug) => Object.values(ranges).filter((rg) => rg[kind].includes(slug)).map(rangeBlock).join('\n');
const pageHead = ({ h1, lede, cta }) => `<section class="page-head">
  <div class="wrap">
    <h1>${h1}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${cta ? `<div class="actions">${cta}</div>` : ''}
  </div>
</section>`;

// ---------- schema ----------
const business = {
  '@type': ['LocalBusiness', 'Store'],
  '@id': site.domain + '/#business',
  name: site.name,
  alternateName: site.alternateNames,
  url: site.domain + '/',
  image: site.domain + '/assets/og.jpg',
  logo: site.domain + '/assets/sunstar-seal.png',
  telephone: site.phoneE164,
  foundingDate: String(site.founded),
  founder: { '@type': 'Person', name: site.founder },
  description: 'Weighing machine manufacturer in Bahadurgarh, Haryana since 1996: electronic tabletop, price computing, platform and crane scales, weighbridges (dharam kanta), load cells, repair and calibration.',
  slogan: 'A quality product',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Cheque, Bank transfer, Visa, Mastercard, RuPay',
  address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal, addressCountry: a.country },
  ...(site.geo ? { geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
  hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.name + ', ' + addressLine)}`,
  areaServed: [...site.localAreas.map((n) => ({ '@type': 'Place', name: n })), { '@type': 'Country', name: 'India' }],
  contactPoint: { '@type': 'ContactPoint', telephone: site.phoneE164, contactType: 'sales', areaServed: 'IN', availableLanguage: ['en', 'hi'] },
  knowsAbout: ['Weighing machines', 'Electronic weighing scales', 'Digital weighing scales', 'Platform scales', 'Crane scales', 'Weighbridges', 'Load cells', 'Weighing scale repair', 'Weighing scale calibration'],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Weighing machines', itemListElement: categories.map((c) => ({ '@type': 'OfferCatalog', name: c.name, url: urlOf(`${c.slug}/`) })) },
  makesOffer: ['Weighing machine repair', 'Weighing scale calibration', 'Weighbridge installation'].map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n, areaServed: 'Bahadurgarh, Haryana' } })),
  sameAs: site.profiles,
  ...(site.gstin ? { taxID: site.gstin } : {}),
};
const website = { '@type': 'WebSite', '@id': site.domain + '/#website', url: site.domain + '/', name: site.name, alternateName: site.alternateNames, inLanguage: 'en-IN', publisher: { '@id': business['@id'] } };
const productLd = (p) => ({ '@type': 'Product', '@id': urlOf(`products/${p.slug}/`) + '#product', name: p.name, ...(p.model ? { sku: p.model, mpn: p.model } : {}), category: catBy[p.cat].name, description: p.desc, ...(p.img ? { image: urlOf(`assets/products/${p.img.file}.webp`) } : {}), brand: { '@type': 'Brand', name: site.brand }, manufacturer: { '@id': business['@id'] }, additionalProperty: p.specs.map(([k, v]) => ({ '@type': 'PropertyValue', name: k, value: v })) });
const breadcrumbLd = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: urlOf(c.path) })),
});
const faqLd = (items) => ({ '@type': 'FAQPage', mainEntity: items.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) });
const itemListLd = (list) => ({ '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: urlOf(`products/${p.slug}/`), name: p.name })) });

// ---------- layout ----------
const NAV = [
  ['products/', 'Products'],
  ['weighbridges/', 'Weighbridges'],
  ['clients/', 'Clients'],
  ['about/', 'About'],
  ['contact/', 'Contact'],
];

const LOGO = readFileSync(join(ROOT, 'assets/sunstar-logo.svg'), 'utf8').replace('<svg ', '<svg class="logo-svg" aria-hidden="true" ');
const sitemap = [];
function page({ path, title, desc, body, schema = [], crumbs, home = false, ogImage = 'assets/og.jpg', preload = '', product = null }) {
  const depth = path ? path.split('/').filter(Boolean).length : 0;
  const r = '../'.repeat(depth);
  const graph = { '@context': 'https://schema.org', '@graph': [business, website, ...(crumbs ? [breadcrumbLd(crumbs)] : []), ...schema] };
  const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${urlOf(path)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="geo.region" content="IN-HR">
<meta name="geo.placename" content="Bahadurgarh, Haryana">
<meta name="theme-color" content="#F5F5F7">
<link rel="icon" href="${r}assets/favicon.png" type="image/png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_IN">
<meta property="og:url" content="${urlOf(path)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${urlOf(ogImage)}">
<meta property="og:image:alt" content="${esc(site.name)}, weighing machine manufacturer in Bahadurgarh">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
${preload}<link rel="stylesheet" href="${r}styles.css">
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
</head>
<body${home ? ' class="home"' : ''}>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="wordmark" href="${r}" aria-label="${esc(site.name)}, home"><img class="seal" src="${r}assets/sunstar-seal.webp" alt="" width="38" height="38"><span class="wordmark__text"><img class="wordmark__logo" src="${r}assets/sunstar-wordmark.webp" alt="Sunstar Systems" width="600" height="142"><span class="wordmark__tag">Weighing Scale Manufacturer</span></span></a>
    <button class="search-btn" type="button" aria-expanded="false" aria-controls="site-search" aria-label="Search products"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Primary">
      <ul>
        ${NAV.map(([p, n]) => `<li><a href="${r}${p}"${path.startsWith(p) ? ' aria-current="page"' : ''}>${n}</a></li>`).join('\n        ')}
      </ul>
      <a class="btn btn--sm" href="${waGeneral}">WhatsApp</a>
    </nav>
  </div>
  <div class="search-panel" id="site-search" hidden>
    <div class="wrap">
      <form class="search-form" role="search" action="${r}products/">
        <label class="sr-only" for="q">Search scales</label>
        <input id="q" name="q" type="search" placeholder="Search scales: tabletop, 30 kg, crane, SS-PF100" autocomplete="off">
        <button class="btn btn--sm" type="submit">Search</button>
      </form>
      <ul class="search-results" aria-live="polite"></ul>
      <script type="application/json" id="search-data">${JSON.stringify([
        ...products.map((p) => ({ t: p.name, s: categories.find((c) => c.slug === p.cat).name, u: `${r}products/${p.slug}/`, k: [p.model, p.line, ...p.specs.map((x) => x[1])].filter(Boolean).join(' ') })),
        ...categories.map((c) => ({ t: c.name, s: 'Category', u: `${r}${c.slug}/`, k: c.intro || '' })),
      ]).replace(/</g, '\\u003c')}</script>
    </div>
  </div>
</header>
${crumbs ? crumbsHtml(r, crumbs) : ''}
<main id="main">
${body(r)}
</main>
<footer class="site-footer">
  <div class="wrap footer__grid">
    <div>
      <p class="wordmark"><img class="seal" src="${r}assets/sunstar-seal.webp" alt="" width="38" height="38"><span class="wordmark__text"><img class="wordmark__logo" src="${r}assets/sunstar-wordmark.webp" alt="Sunstar Systems" width="600" height="142"><span class="wordmark__tag">Weighing Scale Manufacturer</span></span></p>
      <p class="footer__note">Weighing machine manufacturer in Bahadurgarh, Haryana, since ${site.founded}. Weighing scales, weighbridges and load cells, dispatched across India.</p>
    </div>
    <div>
      <h2>Products</h2>
      <ul>${categories.map((c) => `<li><a href="${r}${c.slug}/">${esc(c.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Sunstar</h2>
      <ul><li><a href="${r}weighing-machine-bahadurgarh/">Weighing machine in Bahadurgarh</a></li><li><a href="${r}weighing-machine-manufacturer/">Weighing machine manufacturer</a></li><li><a href="${r}weighing-machine-repair-bahadurgarh/">Weighing machine repair</a></li><li><a href="${r}about/">About</a></li><li><a href="${r}clients/">Clients</a></li><li><a href="${r}pan-india-supply/">Supply across India</a></li><li><a href="${r}contact/">Contact</a></li><li><a href="${r}experience/">3D walkthrough</a></li></ul>
    </div>
    <div>
      <h2>Visit</h2>
      <address>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.region)} ${esc(a.postal)}<br><a href="${tel}">${esc(site.phoneDisplay)}</a><br>${esc(site.hours)}</address>
    </div>
  </div>
  <div class="wrap footer__base"><span>GSTIN ${esc(site.gstin)}</span><span>© ${site.founded}–${year} ${esc(site.name)}</span></div>
</footer>
<div class="bot" data-bot data-wa="${site.whatsappNumber}" data-tel="${tel}"${product ? ` data-product="${esc(product.name)}" data-product-cat="${product.cat}"` : ''}>
  <div class="bot__nudge" hidden><button class="bot__nudge-open" type="button"><img src="${r}assets/sunstar-seal.webp" alt="" width="32" height="32"><span><strong>How may I help you?</strong>Get today’s price in a few taps.</span></button><button class="bot__nudge-x" type="button" aria-label="Dismiss">×</button></div>
  <button class="bot__launch" type="button" aria-expanded="false" aria-controls="bot-panel"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01" stroke-linecap="round" stroke-width="2.6"/></svg><span>Ask Sunstar</span></button>
  <section class="bot__panel" id="bot-panel" role="dialog" aria-label="Sunstar assistant" hidden>
    <header class="bot__head"><img src="${r}assets/sunstar-seal.webp" alt="" width="36" height="36"><div><strong>Sunstar assistant</strong><span>Replies on WhatsApp, usually the same day</span></div><button class="bot__close" type="button" aria-label="Close chat">×</button></header>
    <ol class="bot__log" aria-live="polite"></ol>
    <div class="bot__chips"></div>
    <form class="bot__form"><label class="sr-only" for="bot-in">Your answer</label><input id="bot-in" type="text" autocomplete="off" placeholder="Type your answer"><button type="submit" aria-label="Send">➤</button></form>
  </section>
  <script type="application/json" id="bot-data">${JSON.stringify({
    cats: categories.map((c) => ({ slug: c.slug, short: c.short, name: c.name, items: products.filter((p) => p.cat === c.slug).map((p) => p.name) })),
  }).replace(/</g, '\\u003c')}</script>
</div>
<script src="${r}main.js" defer></script>
</body>
</html>
`;
  const out = join(DIST, path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  sitemap.push(path);
}

// ---------- pages ----------
const CAT_TITLE = {
  'tabletop-scales': 'Tabletop Weighing Machine in Bahadurgarh | Sunstar',
  'price-computing-scales': 'Price Computing Scale in Bahadurgarh | Sunstar',
  'platform-scales': 'Platform Weighing Machine in Bahadurgarh | Sunstar',
  'jewellery-scales': 'Jewellery Weighing Scale in Bahadurgarh | Sunstar',
  weighbridges: 'Weighbridge (Dharam Kanta) in Bahadurgarh | Sunstar',
  'load-cells': 'Load Cells & Weighing Indicators, Bahadurgarh | Sunstar',
  'special-scales': 'Crane & Hanging Scales in Bahadurgarh | Sunstar',
  'automation-instrumentation': 'Weighing Automation & Instrumentation | Sunstar',
};
const hero = prodBy['ss-30'];
const featured = ['ss-30', 'stainless-tabletop', 'sst-30', 'ss-pf100'].map((s) => prodBy[s]);
const PLATE_TONE = { 'bg-cream': 'tone-plain', 'bg-soft': 'tone-plain', 'bg-charcoal': 'tone-plain', 'bg-orange': 'tone-plain' };

// HOME: logo + company details first (no product), then products, then photos
const STRIP = [
  ['tabletop-scales', 'Tabletop', 'ss-30'], ['price-computing-scales', 'Price computing', 'sst-30'], ['platform-scales', 'Platform', 'ss-pf100'],
  ['platform-scales', 'Floor', 'ss-fs500'], ['special-scales', 'Crane', 'ss-cs1000'], ['jewellery-scales', 'Precision', null],
  ['special-scales', 'Livestock', null], ['weighbridges', 'Weighbridges', null],
];
page({
  path: '',
  home: true,
  title: 'Weighing Machine Manufacturer in Bahadurgarh | Sunstar Systems',
  desc: 'Weighing machine manufacturer in Bahadurgarh since 1996: tabletop, platform and crane scales, weighbridges, repair and calibration. Price on WhatsApp.',
  schema: [faqLd(faqs.common)],
  body: (r) => `
<section class="hero-c" aria-roledescription="carousel" aria-labelledby="hero-title">
  <div class="hero-c__track" data-carousel tabindex="0" aria-label="Featured scales">
    <article class="slide" aria-roledescription="slide" aria-label="1 of 3">
      <div class="wrap slide__in">
        <div class="slide__copy">
          <img class="slide__seal" src="${r}assets/sunstar-seal.webp" alt="Sunstar, a quality product" width="640" height="640" fetchpriority="high">
          <p class="slide__k">Since ${site.founded}, Bahadurgarh</p>
          <h1 id="hero-title">Weighing machine manufacturer in Bahadurgarh</h1>
          <p class="slide__lede">Tabletop, price computing, platform and crane scales, built and calibrated in our Bahadurgarh workshop.</p>
          <a class="btn btn--red" href="${r}products/">See all products</a>
        </div>
        <div class="slide__media slide__media--duo">${(() => { const p = prodBy['stainless-tabletop']; return `<img class="slide__img" src="${r}assets/products/${p.img.file}.webp" alt="" width="${p.img.w}" height="${p.img.h}" decoding="async">`; })()} ${(() => { const p = prodBy['sst-30']; return `<img class="slide__img slide__img--tall" src="${r}assets/products/${p.img.file}.webp" alt="" width="${p.img.w}" height="${p.img.h}" decoding="async">`; })()}</div>
      </div>
    </article>
    <article class="slide" aria-roledescription="slide" aria-label="2 of 3">
      <div class="wrap slide__in">
        <div class="slide__copy">
          <p class="slide__k">SS-PF100</p>
          <h2 class="slide__h">Platform Weighing Scale</h2>
          <p class="slide__lede">600 × 600 mm diamond-plate platform, 100 to 300 kg, rechargeable battery.</p>
          <a class="btn btn--red" href="${r}products/ss-pf100/">View the scale</a>
        </div>
        <div class="slide__media">${(() => { const p = prodBy['ss-pf100']; return `<img class="slide__img slide__img--tall" src="${r}assets/products/${p.img.file}.webp" alt="" width="${p.img.w}" height="${p.img.h}" decoding="async">`; })()}</div>
      </div>
    </article>
    <article class="slide" aria-roledescription="slide" aria-label="3 of 3">
      <div class="wrap slide__in">
        <div class="slide__copy">
          <p class="slide__k">SS-CS1000</p>
          <h2 class="slide__h">Crane scales up to 5 tonnes</h2>
          <p class="slide__lede">Hook-mounted, bright green LED display and rechargeable battery, for factories and loading bays.</p>
          <a class="btn btn--red" href="${r}products/ss-cs1000/">View the scale</a>
        </div>
        <div class="slide__media slide__media--hang">${(() => { const p = prodBy['ss-cs1000']; return `<img class="slide__img slide__img--hang" src="${r}assets/products/${p.img.file}.webp" alt="" width="${p.img.w}" height="${p.img.h}" decoding="async">`; })()}</div>
      </div>
    </article>
  </div>
  <button class="hero-c__btn hero-c__btn--prev" type="button" aria-label="Previous slide" data-prev>‹</button>
  <button class="hero-c__btn hero-c__btn--next" type="button" aria-label="Next slide" data-next>›</button>
  <div class="hero-c__dots" role="tablist" aria-label="Choose slide"><button type="button" role="tab" aria-selected="true" aria-label="Slide 1"></button><button type="button" role="tab" aria-selected="false" aria-label="Slide 2"></button><button type="button" role="tab" aria-selected="false" aria-label="Slide 3"></button></div>
</section>

<section class="intro-band"><div class="wrap">
    <div class="intro">
      <p>Since ${site.founded}, Sunstar Systems has manufactured tabletop, price computing, platform, floor and crane scales, weighbridges and load cells for sweet shops, pharmacies, footwear makers and national grocery brands. Every scale is calibrated in our Bahadurgarh workshop and comes with installation and service. We dispatch to every state, with dealers in Jammu and Rajasthan. Looking for a <a class="textlink" href="${r}weighing-machine-bahadurgarh/">weighing machine in Bahadurgarh</a> or <a class="textlink" href="${r}weighing-machine-repair-bahadurgarh/">weighing machine repair</a>? Visit the shop near Metro Pillar 804.</p>
      <div class="intro__cta"><a class="btn" href="${waGeneral}">Get today’s price on WhatsApp</a><a class="textlink textlink--chev" href="${tel}">Call ${esc(site.phoneDisplay)}</a></div>
    </div>
  </div>
</section>

<section class="band band--tight industries" aria-labelledby="ind-title">
  <div class="wrap">
    <h2 id="ind-title" class="h2">Products by industry</h2>
    <ul class="ind-cards">
      ${[
        ['tabletop-scales', 'compact-tabletop', 'Retail and grocery', 'Counter and tabletop scales for kirana stores, supermarkets and online grocery packing.'],
        ['price-computing-scales', 'sst-30', 'Sweets and food shops', 'Price computing scales with a customer display, for mithai, dry fruit and bakery counters.'],
        ['platform-scales', 'kissan-platform', 'Factories and warehouses', 'Platform and floor scales for production, stores and dispatch, from 100 kg to 2 tonnes.'],
        ['special-scales', 'ss-cs1000', 'Heavy lifting', 'Crane scales up to 5 tonnes, plus weighbridges for trucks.'],
      ].map(([slug, prod, h, d]) => { const p = prodBy[prod]; return `<li><a href="${r}${slug}/"><span class="ind-cards__img"><img src="${r}assets/products/${p.img.file}-640.webp" alt="" width="${p.img.w}" height="${p.img.h}" loading="lazy" decoding="async"></span><span class="ind-cards__cap"><strong>${h}</strong><span>${d}</span><em>View scales</em></span></a></li>`; }).join('\n      ')}
    </ul>
  </div>
</section>

<section class="clients-band" aria-labelledby="clients-title">
  <div class="wrap">
    <h2 id="clients-title" class="clients-band__title">Our Top Clients</h2>
    <div class="marq" data-marq><ul class="client-logos">${[0, 1].map((k) => site.clients.map((c) => `<li${k ? ' aria-hidden="true"' : ''}><img src="${r}assets/clients/${c.logo}.webp" alt="${k ? '' : esc(c.name)}" width="${c.w}" height="${c.h}" loading="lazy" decoding="async"></li>`).join('')).join('')}</ul></div>
  </div>
</section>

<section class="band lineup" id="catalogue" aria-labelledby="products-title">
  <div class="wrap">
    <h2 id="products-title" class="display">Explore the line-up.</h2>
    <div class="chips" role="group" aria-label="Filter by family">
      <button class="chip" type="button" data-filter="all" aria-pressed="true">All products</button>
      ${categories.filter((c) => products.some((p) => p.cat === c.slug)).map((c) => `<button class="chip" type="button" data-filter="${c.slug}" aria-pressed="false">${esc(c.short)}</button>`).join('\n      ')}
    </div>
    <ul class="grid">
      ${products.map((p) => tile(r, p)).join('\n      ')}
    </ul>
    <p class="lineup__more">Also supplied to order: ${categories.filter((c) => !products.some((p) => p.cat === c.slug)).map((c) => `<a class="textlink" href="${r}${c.slug}/">${esc(c.name.toLowerCase())}</a>`).join(', ')}.</p>
  </div>
</section>

<section class="band why" aria-labelledby="why-title">
  <div class="wrap">
    <h2 id="why-title" class="display">Why buy from Sunstar.</h2>
    <ul class="rail">
      <li class="why-card"><p class="why-card__k">Price</p><h3>Today’s price on WhatsApp, the same day.</h3><p>Send the model or the weight you need. No forms, no waiting.</p></li>
      <li class="why-card"><p class="why-card__k">Delivery</p><h3>Dispatched to every state.</h3><p>From Delhi NCR to South India and the North East, with dealers in Jammu and Rajasthan.</p></li>
      <li class="why-card"><p class="why-card__k">Service</p><h3>Installation, calibration and repair.</h3><p>Spare load cells and indicators in stock. Service for all makes.</p></li>
      <li class="why-card"><p class="why-card__k">Since ${site.founded}</p><h3>${year - site.founded} years in Bahadurgarh.</h3><p>One shop in Vivekanand Nagar, trusted by shops, factories and brands.</p></li>
    </ul>
  </div>
</section>

<section class="band photos" aria-labelledby="photos-title">
  <div class="wrap">
    <h2 id="photos-title" class="display">Inside Sunstar.</h2>
    <ul class="rail rail--photos">
      ${gallery.map((g) => `<li><figure><img src="${r}assets/gallery/${g.file}.webp" width="1000" height="1000" alt="${esc(g.caption)}" loading="lazy" decoding="async"><figcaption>${esc(g.caption)}</figcaption></figure></li>`).join('\n      ')}
    </ul>
  </div>
</section>



${faqBlock(faqs.common)}
${closing()}`,
});

// PRODUCTS INDEX
page({
  path: 'products/',
  title: 'Weighing Machines & Scales, All Models | Sunstar Bahadurgarh',
  desc: 'Tabletop, price computing, platform and jewellery scales, weighbridges, load cells and crane scales from Sunstar Systems. Get today’s price on WhatsApp.',
  crumbs: [{ name: 'Products', path: 'products/' }],
  schema: [itemListLd(products)],
  body: (r) => `
${pageHead({ h1: 'Weighing scales and weighbridges', lede: `${products.length} models in stock and ${categories.length} product families. Prices change with quantity and delivery, so ask on WhatsApp for today’s price.` })}
<section class="band band--flush catalogue">
  <div class="wrap">
    <div class="chips" role="group" aria-label="Filter by family">
      <button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>
      ${categories.filter((c) => c.hero).map((c) => `<button class="chip" type="button" data-filter="${c.slug}" aria-pressed="false">${esc(c.short)}</button>`).join('\n      ')}
    </div>
    <ul class="grid">
      ${products.map((p) => tile(r, p)).join('\n      ')}
    </ul>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <h2 class="h2">Supplied to order</h2>
    <ul class="cats">
      ${categories.filter((c) => !c.hero).map((c) => `<li class="cat ${PLATE_TONE[c.plate]}"><a href="${r}${c.slug}/"><h3>${esc(c.name)}</h3><p>${esc(c.intro)}</p><span class="textlink">See the range</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>
${closing()}`,
});

// CATEGORY PAGES
for (const c of categories) {
  const list = products.filter((p) => p.cat === c.slug);
  const items = [
    [`What is the price of ${c.name.toLowerCase()}?`, `Prices depend on the model, capacity and quantity. Send us the ${c.short.toLowerCase()} you need on WhatsApp and we reply with today’s price.`],
    ...faqs.common.slice(1),
  ];
  page({
    path: `${c.slug}/`,
    title: CAT_TITLE[c.slug] || `${c.name} | Sunstar Bahadurgarh`,
    desc: clip(`${c.name} from Sunstar, weighing machine manufacturer in Bahadurgarh. ${c.intro.split('. ')[0]}. Price on WhatsApp.`),
    crumbs: [{ name: 'Products', path: 'products/' }, { name: c.name, path: `${c.slug}/` }],
    schema: [faqLd(items), ...(list.length ? [itemListLd(list)] : [])],
    body: (r) => `
${pageHead({ h1: esc(c.name), lede: esc(c.intro), cta: `<a class="btn" href="${waProduct(c.name)}">Get today’s price</a><a class="btn btn--line" href="${tel}">Call ${esc(site.phoneDisplay)}</a>` })}
${list.length ? `<section class="band band--flush catalogue"><div class="wrap"><ul class="grid">
      ${list.map((p) => tile(r, p)).join('\n      ')}
    </ul></div></section>` : ''}
${rangesFor('cats', c.slug)}
${c.types ? `<section class="band band--flush"><div class="wrap narrow">
    <h2 class="h3">Types we supply</h2>
    ${typeList(c)}
    <p class="note">We are adding photos of this range. Ask on WhatsApp for pictures, specifications and today’s price.</p>
  </div></section>` : ''}
<section class="band band--tight"><div class="wrap narrow">
    <h2 class="h3">Used in</h2>
    <ul class="pills">${c.uses.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  </div></section>
${faqBlock(items)}
${closing()}`,
  });
}

// PRODUCT PAGES
for (const p of products) {
  const c = catBy[p.cat];
  const related = products.filter((x) => x.cat === p.cat && x.slug !== p.slug).concat(products.filter((x) => x.cat !== p.cat)).slice(0, 3);
  const items = [
    [`What is the price of the ${p.name}?`, `The price depends on quantity and delivery location. Message us on WhatsApp and we reply with today’s price for the ${p.name}.`],
    ...faqs.common.slice(1),
  ];
  page({
    product: p,
    path: `products/${p.slug}/`,
    title: `${p.name} | Sunstar Bahadurgarh`.length <= 62 ? `${p.name} | Sunstar Bahadurgarh` : `${p.name} | Sunstar`,
    desc: clip(`${p.name}${capOf(p) ? `, ${capOf(p)}` : ''}. ${p.line} Made by Sunstar, Bahadurgarh. Get today’s price on WhatsApp.`),
    crumbs: [{ name: 'Products', path: 'products/' }, { name: c.name, path: `${c.slug}/` }, { name: p.model || p.name, path: `products/${p.slug}/` }],
    schema: [faqLd(items), productLd(p)],
    ogImage: p.img ? `assets/products/${p.img.file}.webp` : 'assets/og.jpg',
    body: (r) => `
<section class="plate plate--page ${PLATE_TONE[p.plate]}" aria-labelledby="p-title">
  <div class="wrap plate__in">
    <figure class="plate__media">${shot(r, p, { sizes: '(max-width: 760px) 92vw, 55vw', lazy: false })}</figure>
    <div class="plate__text">
      <p class="plate__cat">${esc(c.name)}</p>
      <h1 class="plate__name plate__name--page" id="p-title">${esc(p.name)}</h1>
      <p class="plate__desc">${esc(p.desc)}</p>
      ${plateRow(p)}
      ${specTable(p)}
      <div class="actions"><a class="btn${''}" href="${waProduct(p.name)}">Get today’s price</a><a class="textlink" href="${tel}">Call ${esc(site.phoneDisplay)}</a></div>
    </div>
  </div>
</section>
${rangesFor('products', p.slug)}
<section class="band band--tight facts-band">
  <div class="wrap facts">
    <p><strong>Price</strong>Shared on WhatsApp the same day you ask.</p>
    <p><strong>Delivery</strong>Collect from our Bahadurgarh shop, or we dispatch to your city.</p>
    <p><strong>Service</strong>Repair, calibration and spare parts.</p>
  </div>
</section>
<section class="band band--tight"><div class="wrap narrow">
    <h2 class="h3">Used in</h2>
    <ul class="pills">${c.uses.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  </div></section>
${faqBlock(items)}
<section class="band catalogue"><div class="wrap">
  <div class="band__head"><h2 class="h2">Related products</h2><a class="textlink" href="${r}${c.slug}/">All ${esc(c.name.toLowerCase())}</a></div>
  <ul class="grid">${related.map((x) => tile(r, x)).join('')}</ul>
</div></section>
${closing()}`,
  });
}

// CLIENTS
page({
  path: 'clients/',
  title: 'Clients & Industries | Sunstar Weighing Machines',
  desc: 'Weighing scales and weighbridges for brands, manufacturers, retailers and warehouses across India. Bulk orders with GST invoice.',
  crumbs: [{ name: 'Clients', path: 'clients/' }],
  body: (r) => `
${pageHead({ h1: 'Clients and industries', lede: 'National brands, factories, warehouses and neighbourhood shops weigh on Sunstar. We supply single scales and bulk orders with a GST invoice.' })}
<section class="band band--flush">
  <div class="wrap">
    <ul class="logo-wall">${site.clients.map((c) => `<li><img src="${r}assets/clients/${c.logo}.webp" alt="${esc(c.name)}" width="${c.w}" height="${c.h}" loading="lazy" decoding="async"><span>${esc(c.sector)}</span></li>`).join('')}</ul>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <h2 class="h2">Industries we supply</h2>
    <ul class="ind">
      <li><h3>Manufacturing</h3><p>Platform scales, piece counting scales and load cells for production lines and stores.</p><a class="textlink" href="${r}platform-scales/">Platform scales</a></li>
      <li><h3>Grocery and retail</h3><p>Tabletop and price computing scales for counters and supermarkets.</p><a class="textlink" href="${r}price-computing-scales/">Price computing scales</a></li>
      <li><h3>Warehousing and logistics</h3><p>Heavy-duty platform scales and weighbridges for dispatch and inbound.</p><a class="textlink" href="${r}weighbridges/">Weighbridges</a></li>
      <li><h3>Jewellery</h3><p>Jewellery and precision scales for gold, silver and gems.</p><a class="textlink" href="${r}jewellery-scales/">Jewellery scales</a></li>
      <li><h3>Dairy and food</h3><p>Stainless scales for wash-down counters, milk weighing and kitchens.</p><a class="textlink" href="${r}tabletop-scales/">Tabletop scales</a></li>
      <li><h3>Healthcare</h3><p>Baby, personal and medical scales for clinics and hospitals.</p><a class="textlink" href="${r}special-scales/">Special scales</a></li>
    </ul>
  </div>
</section>
<section class="band tone-dark b2b">
  <div class="wrap b2b__in">
    <h2 class="h2">Bulk and corporate orders</h2>
    <ul><li>GST invoice${site.gstin ? `, GSTIN ${esc(site.gstin)}` : ''}</li><li>Dispatch to several locations across India</li><li>Installation, calibration and annual maintenance</li></ul>
    <a class="btn" href="${wa('Hi Sunstar, we need a bulk / corporate quote for weighing scales')}">Request a bulk quote</a>
  </div>
</section>
${closing()}`,
});

// ABOUT
page({
  path: 'about/',
  title: 'About Sunstar: Weighing Machine Manufacturer Since 1996',
  desc: `Sunstar Systems has manufactured and serviced weighing scales in Bahadurgarh, Haryana since ${site.founded}. Managing Director ${site.founder}.`,
  crumbs: [{ name: 'About', path: 'about/' }],
  body: (r) => `
${pageHead({ h1: 'About Sunstar Systems', lede: `Sunstar Systems started in Bahadurgarh in ${site.founded}. The idea has not changed: a scale should be accurate, last for years and be priced fairly. Today we supply digital weighing scales, platform scales, weighbridges and load cells to shops, factories and brands across India.` })}
<section class="band band--flush">
  <div class="wrap about">
    <figure class="about__media tone-white">${shot(r, prodBy['steel-pan-tabletop'], { sizes: '(max-width: 760px) 80vw, 40vw' })}</figure>
    <table class="specs specs--facts">
      <tr><th scope="row">Established</th><td>${site.founded}</td></tr>
      <tr><th scope="row">Managing Director</th><td>${esc(site.founder)}</td></tr>
      <tr><th scope="row">Location</th><td>${esc(a.city)}, ${esc(a.region)}</td></tr>
      <tr><th scope="row">Supply</th><td>All India, with dealers in Jammu and Rajasthan</td></tr>
      <tr><th scope="row">Rating</th><td>${site.rating.value} out of 5 on ${site.rating.source} (${site.rating.count} ratings)</td></tr>
      <tr><th scope="row">GSTIN</th><td>${esc(site.gstin)}</td></tr>
      <tr><th scope="row">Payment</th><td>Cash, cheque or DD, Visa, Mastercard, RuPay</td></tr>
    </table>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <h2 class="h2">What we do</h2>
    <ul class="ind">
      <li><h3>Manufacturing</h3><p>Tabletop, price computing, platform, jewellery and crane scales, weighbridges and load cells.</p></li>
      <li><h3>Installation</h3><p>Platform scales and weighbridges set up and tested on site.</p></li>
      <li><h3>Calibration</h3><p>Scales checked and calibrated so every reading is right.</p></li>
      <li><h3>Repair and parts</h3><p>Service for all makes, with load cells, indicators and spares in stock.</p></li>
    </ul>
  </div>
</section>
${closing()}`,
});

// PAN-INDIA
page({
  path: 'pan-india-supply/',
  title: 'Weighing Machine Supplier Across India | Sunstar Systems',
  desc: 'Weighing scales, platform scales and load cells dispatched from Bahadurgarh to every state, including South India, the North East and Jammu & Kashmir.',
  crumbs: [{ name: 'Supply across India', path: 'pan-india-supply/' }],
  body: (r) => `
${pageHead({ h1: 'Weighing scales delivered across India', lede: 'We pack and dispatch weighing scales, platform scales, load cells and indicators to every state. Send your city and the model you need, and we share the price with delivery.', cta: `<a class="btn" href="${wa('Hi Sunstar, I need a scale delivered to (city): ')}">Get price with delivery</a>` })}
<section class="band band--flush">
  <div class="wrap">
    <ul class="regions">${site.regions.map((g) => `<li><h2 class="h3">${esc(g.name)}</h2><p>${esc(g.places)}</p></li>`).join('')}</ul>
    <p class="note">Sunstar has dealers in Jammu and Rajasthan. Ask us on WhatsApp for the dealer nearest you.</p>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <h2 class="h2">How ordering works</h2>
    <ol class="steps">
      <li><h3>Message us on WhatsApp</h3><p>Tell us the model or weight, the quantity and your city.</p></li>
      <li><h3>Get the price</h3><p>We reply with today’s price including delivery.</p></li>
      <li><h3>Pay and get a GST invoice</h3><p>Pay by bank transfer, cheque or card.</p></li>
      <li><h3>Receive your scale</h3><p>Tested, packed and dispatched to your city.</p></li>
    </ol>
  </div>
</section>
${closing()}`,
});

// CONTACT
page({
  path: 'contact/',
  title: 'Contact Sunstar | Weighing Machine Shop in Bahadurgarh',
  desc: clip(`Weighing scale shop near Metro Pillar 804, Vivekanand Nagar, Bahadurgarh. Call ${site.phoneDisplay} or WhatsApp for today’s price.`),
  crumbs: [{ name: 'Contact', path: 'contact/' }],
  body: (r) => `
${pageHead({ h1: 'Contact Sunstar' })}
<section class="band band--flush">
  <div class="wrap contact">
    <dl class="contact__info">
      <dt>Shop</dt>
      <dd><address>${esc(site.name)}<br>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.region)} ${esc(a.postal)}</address></dd>
      <dt>Phone</dt>
      <dd><a href="${tel}">${esc(site.phoneDisplay)}</a></dd>
      <dt>Hours</dt>
      <dd>${esc(site.hours)}</dd>
      <dt>Directions</dt>
      <dd><a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(site.name + ', ' + addressLine)}">Open in Google Maps</a></dd>
    </dl>
    <form class="enquiry" data-wa="${site.whatsappNumber}" novalidate>
      <h2 class="h3">Send an enquiry</h2>
      <label>Name<input name="name" autocomplete="name" required></label>
      <label>City<input name="city" autocomplete="address-level2"></label>
      <label>Product
        <select name="product">
          <option value="">Choose a product</option>
          ${products.map((p) => `<option>${esc(p.name)}</option>`).join('')}
          ${categories.filter((c) => !c.hero).map((c) => `<option>${esc(c.name)}</option>`).join('')}
          <option>Repair or calibration</option>
        </select>
      </label>
      <label>Message<textarea name="message" rows="4" placeholder="Capacity, quantity or anything else"></textarea></label>
      <button class="btn" type="submit">Send on WhatsApp</button>
      <p class="note">This opens WhatsApp with your message filled in. Nothing is stored on this website.</p>
    </form>
  </div>
  <div class="wrap"><iframe class="map" title="Map to ${esc(site.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(site.name + ', ' + addressLine)}&amp;output=embed"></iframe></div>
</section>`,
});


// ---------- local SEO landing pages ----------
const areaList = () => `<ul class="pills">${site.localAreas.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
const mapEmbed = () => `<iframe class="map" title="Map to ${esc(site.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(site.name + ', ' + addressLine)}&amp;output=embed"></iframe>`;
const napBlock = () => `<address class="nap"><strong>${esc(site.name)}</strong><br>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.district)} district, ${esc(a.region)} ${esc(a.postal)}<br><a href="${tel}">${esc(site.phoneDisplay)}</a> · <a href="${waGeneral}">WhatsApp</a></address>`;

page({
  path: 'weighing-machine-bahadurgarh/',
  title: 'Weighing Machine in Bahadurgarh | Sunstar Systems, Since 1996',
  desc: clip(`Buy a weighing machine in Bahadurgarh from the manufacturer. Digital, platform, crane scales and weighbridges near Metro Pillar 804. Repair, calibration, same-day price on WhatsApp.`),
  crumbs: [{ name: 'Weighing machine in Bahadurgarh', path: 'weighing-machine-bahadurgarh/' }],
  schema: [faqLd(faqs.local)],
  body: (r) => `
${pageHead({ h1: 'Weighing machine in Bahadurgarh', lede: `Sunstar Systems has made and sold weighing machines from Vivekanand Nagar, Bahadurgarh, since ${site.founded}. Come to the shop near Metro Pillar No. 804 to see the scales, or send the weight you need on WhatsApp for today’s price.`, cta: `<a class="btn" href="${waGeneral}">Get today’s price</a><a class="btn btn--line" href="${tel}">Call ${esc(site.phoneDisplay)}</a>` })}
<section class="band band--flush"><div class="wrap seo-cols">
  <div>
    <h2 class="h3">Every kind of weight machine, from one Bahadurgarh shop</h2>
    <p>Shops, factories and warehouses in Bahadurgarh buy from us because the scale is made, calibrated and serviced in the same place. Whether you call it a weighing machine, weight machine, electronic kanta, digital tarazu or dharam kanta, we make the right one for the job:</p>
    <ul class="seo-list">
      <li><a href="${r}tabletop-scales/">Tabletop weighing machines</a> for kirana, sweet and grocery counters, up to 30 kg</li>
      <li><a href="${r}price-computing-scales/">Price computing scales</a> with a customer pole display</li>
      <li><a href="${r}platform-scales/">Platform weighing machines</a> from 50 kg to 5 tonnes, including the Kissan model</li>
      <li><a href="${r}special-scales/">Crane and hanging scales</a> up to 5 tonnes</li>
      <li><a href="${r}weighbridges/">Weighbridges (dharam kanta)</a> for trucks, installed on site</li>
      <li><a href="${r}jewellery-scales/">Jewellery and precision scales</a> for gold, silver and labs</li>
      <li><a href="${r}load-cells/">Load cells, indicators and spare parts</a>, usually in stock</li>
    </ul>
  </div>
  <aside class="seo-card">
    <h2 class="h3">Visit the shop</h2>
    ${napBlock()}
    <p class="note">${esc(site.hours)}</p>
    <p><a class="textlink textlink--chev" href="${r}contact/">Directions and contact</a></p>
  </aside>
</div></section>
<section class="band band--tight"><div class="wrap">
  <h2 class="h3">Areas we cover from Bahadurgarh</h2>
  <p class="seo-p">Sales visits, installation, repair and calibration across Bahadurgarh and nearby towns and industrial areas. For the rest of India we dispatch by transport, with dealers in Jammu and Rajasthan.</p>
  ${areaList()}
</div></section>
<section class="band band--tight catalogue"><div class="wrap">
  <div class="band__head"><h2 class="h2">Popular weighing machines in Bahadurgarh</h2><a class="textlink" href="${r}products/">All products</a></div>
  <ul class="grid">${['ss-30', 'sst-30', 'kissan-platform', 'ss-pf100', 'ssp-50', 'ss-cs1000'].map((sl) => tile(r, prodBy[sl])).join('')}</ul>
</div></section>
<section class="band band--tight"><div class="wrap">${mapEmbed()}</div></section>
${faqBlock(faqs.local)}
${closing()}`,
});

page({
  path: 'weighing-machine-manufacturer/',
  title: 'Weighing Machine Manufacturer in Haryana | Sunstar Systems',
  desc: clip(`Sunstar Systems is a weighing machine manufacturer in Bahadurgarh, Haryana, since ${site.founded}. Electronic tabletop, platform and crane scales, bulk and dealer orders, pan-India dispatch.`),
  crumbs: [{ name: 'Weighing machine manufacturer', path: 'weighing-machine-manufacturer/' }],
  schema: [faqLd(faqs.common.slice(-1).concat([['Do you supply dealers and bulk buyers?', 'Yes. We supply dealers and companies with GST invoices and dispatch across India. We already have dealers in Jammu and Rajasthan.']]))],
  body: (r) => `
${pageHead({ h1: 'Weighing machine manufacturer in Bahadurgarh, Haryana', lede: `Sunstar Systems designs, assembles and calibrates electronic weighing machines in Bahadurgarh. Since ${site.founded} we have supplied shops, factories and national brands such as Surya Roshni, bigbasket, Relaxo and Gulab Rewri.`, cta: `<a class="btn" href="${wa('Hi Sunstar, I want a bulk / dealer quote for weighing machines')}">Bulk or dealer quote</a><a class="btn btn--line" href="${tel}">Call ${esc(site.phoneDisplay)}</a>` })}
<section class="band band--flush"><div class="wrap">
  <ul class="ind">
    <li><h3>Made in Bahadurgarh</h3><p>Every Sunstar scale is assembled, tested and calibrated in our own workshop before dispatch.</p></li>
    <li><h3>Full range, one maker</h3><p>Tabletop, price computing, platform, crane, pocket and jewellery scales, weighbridges and load cells.</p></li>
    <li><h3>Built to your size</h3><p>Platform scales from 400 × 400 mm to 1500 × 1500 mm, with other sizes made to order.</p></li>
    <li><h3>Dealers and bulk buyers</h3><p>GST invoice, dispatch to several locations, and dealer pricing. Dealers already in Jammu and Rajasthan.</p></li>
    <li><h3>Service after sale</h3><p>Repair, calibration and spare parts for every scale we make, and for other brands too.</p></li>
    <li><h3>Automation too</h3><p>Weighbridge conversion kits with software, milk weighing systems and auto filling machines.</p></li>
  </ul>
</div></section>
${Object.values(ranges).map(rangeBlock).join('\n')}
<section class="band band--tight"><div class="wrap">
  <h2 class="h3">Weighing machines we manufacture</h2>
  <ul class="cats">${categories.map((c) => `<li class="cat"><a href="${r}${c.slug}/"><h3>${esc(c.name)}</h3><p>${esc(c.intro)}</p><span class="textlink">See the range</span></a></li>`).join('')}</ul>
</div></section>
${closing()}`,
});

page({
  path: 'weighing-machine-repair-bahadurgarh/',
  title: 'Weighing Machine Repair & Calibration in Bahadurgarh | Sunstar',
  desc: clip('Weighing machine repair in Bahadurgarh for all brands: tabletop, platform, crane scales and weighbridges. Calibration, load cells, displays and PCBs in stock. Call or WhatsApp Sunstar.'),
  crumbs: [{ name: 'Weighing machine repair', path: 'weighing-machine-repair-bahadurgarh/' }],
  schema: [faqLd(faqs.repair), { '@type': 'Service', name: 'Weighing machine repair and calibration', serviceType: 'Weighing scale repair', provider: { '@id': business['@id'] }, areaServed: site.localAreas.map((n) => ({ '@type': 'Place', name: n })), url: urlOf('weighing-machine-repair-bahadurgarh/') }],
  body: (r) => `
${pageHead({ h1: 'Weighing machine repair and calibration in Bahadurgarh', lede: 'Scale not switching on, showing the wrong weight or drifting? Bring it to our Bahadurgarh workshop or call us to your site. We repair all makes, not only Sunstar.', cta: `<a class="btn" href="${wa('Hi Sunstar, my weighing machine needs repair. Model / problem: ')}">Book a repair on WhatsApp</a><a class="btn btn--line" href="${tel}">Call ${esc(site.phoneDisplay)}</a>` })}
<section class="band band--flush"><div class="wrap">
  <ul class="ind">
    <li><h3>Not switching on</h3><p>Adaptor, battery, PCB and wiring faults on tabletop and platform scales.</p></li>
    <li><h3>Wrong or unstable reading</h3><p>Load cell replacement, levelling and full recalibration with test weights.</p></li>
    <li><h3>Display and keypad</h3><p>Dead segments, faded displays and broken keys replaced.</p></li>
    <li><h3>Platform and crane scales</h3><p>Damaged platforms, frames, hooks and indicators repaired on site.</p></li>
    <li><h3>Weighbridges</h3><p>Load cell, junction box and indicator faults, plus conversion kits with software.</p></li>
    <li><h3>Spare parts in stock</h3><p>Load cells, motherboards, displays and adaptors, ready the same day.</p></li>
  </ul>
</div></section>
<section class="band band--tight"><div class="wrap seo-cols">
  <div><h2 class="h3">Areas we service</h2>${areaList()}</div>
  <aside class="seo-card"><h2 class="h3">Workshop</h2>${napBlock()}</aside>
</div></section>
${faqBlock(faqs.repair)}
${closing()}`,
});

// 404 (not in sitemap)
const before = sitemap.length;
page({
  path: '404/',
  title: 'Page not found — Sunstar Systems',
  desc: 'This page does not exist.',
  body: (r) => pageHead({ h1: 'Page not found', lede: 'The page may have moved. Go to the products, or message us on WhatsApp.', cta: `<a class="btn" href="${r}products/">See all products</a><a class="btn btn--line" href="${waGeneral}">WhatsApp us</a>` }),
});
sitemap.length = before;
cpSync(join(DIST, '404/index.html'), join(DIST, '404.html'));

// sitemap + robots
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((p) => `  <url><loc>${urlOf(p)}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(DIST, 'llms.txt'), `# ${site.name}

> Weighing machine manufacturer in Bahadurgarh, Haryana, India, since ${site.founded}. Electronic tabletop, price computing, platform, crane, pocket and jewellery scales, weighbridges (dharam kanta), load cells, repair and calibration. Dealers in Jammu and Rajasthan; dispatch across India.

- Address: ${addressLine}
- Phone / WhatsApp: ${site.phoneDisplay}
- Prices: on enquiry (WhatsApp)

## Pages
${sitemap.map((p) => `- ${urlOf(p)}`).join('\n')}
`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /404/\nSitemap: ${site.domain}/sitemap.xml\n`);

console.log(`Built ${sitemap.length} pages -> dist/`);

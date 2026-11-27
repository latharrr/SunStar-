// node build.mjs  ->  renders src/data.mjs into dist/ (static, clean URLs, no framework)
import { mkdirSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, categories, products, faqs } from './src/data.mjs';

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
const tel = `tel:${site.phoneE164}`;
const urlOf = (path) => site.domain + '/' + path;
const clip = (s, n = 158) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[,.;:]$/, '') + '…');

// ---------- components (all take `r` = relative prefix to site root) ----------
const shot = (r, p, { sizes = '(max-width: 760px) 90vw, 50vw', lazy = true, h } = {}) => {
  const ar = (p.img.w / p.img.h).toFixed(3);
  return `<span class="shot" style="--ar:${ar}${h ? `;--h:${h}` : ''}"><img src="${r}assets/products/${p.img.file}.webp" srcset="${r}assets/products/${p.img.file}-640.webp 640w, ${r}assets/products/${p.img.file}.webp ${p.img.w}w" sizes="${sizes}" width="${p.img.w}" height="${p.img.h}" alt="${esc(p.name)}, ${esc(site.brand)} ${esc(catBy[p.cat].name.toLowerCase())}"${lazy ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async"></span>`;
};

const specTable = (p) => `<table class="specs">
${p.specs.map(([k, v]) => `        <tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('\n')}
${p.ask.map((k) => `        <tr><th scope="row">${esc(k)}</th><td class="ask">Confirm on enquiry</td></tr>`).join('\n')}
      </table>`;

const tile = (r, p) => `<li class="tile" data-cat="${p.cat}">
        <a class="tile__link" href="${r}products/${p.slug}/">
          <div class="tile__img">${shot(r, p, { sizes: '(max-width: 760px) 80vw, (max-width: 1100px) 40vw, 28vw' })}</div>
          <div class="tile__meta"><div><h3>${esc(p.model || p.name)}</h3><p class="label">${esc(p.model ? p.name.replace(p.model + ' ', '') : catBy[p.cat].short)}${capOf(p) ? ' · ' + esc(capOf(p)) : ''}</p></div><span class="tile__go">View →</span></div>
        </a>
      </li>`;
const capOf = (p) => (p.specs.find(([k]) => k === 'Capacity') || [])[1] || '';

const typeList = (c) => `<ul class="types">
${c.types.map((t) => `        <li><span class="types__name">${esc(t)}</span><a class="link-arrow" href="${waProduct(t)}">Get price →</a></li>`).join('\n')}
      </ul>`;

const faqBlock = (items, title = 'Questions') => `<section class="section section--tight faq" aria-labelledby="faq-title">
  <div class="wrap wrap--narrow">
    <h2 id="faq-title">${title}</h2>
    ${items.map(([q, ans]) => `<details><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join('\n    ')}
  </div>
</section>`;

const closing = (r, p) => `<section class="closing" aria-labelledby="closing-title">
  ${p ? shot(r, p, { sizes: '(max-width: 760px) 70vw, 420px', h: '26vh' }) : ''}
  <h2 id="closing-title">Find your <em>scale.</em></h2>
  <p class="closing__sub">Send the model or the weight you need. We reply with today’s price.</p>
  <div class="closing__cta">
    <a class="btn btn--ink" href="${wa('Hi Sunstar, I need a quote for a weighing scale')}">WhatsApp for price</a>
    <a class="btn btn--line" href="${tel}">Call ${esc(site.phoneDisplay)}</a>
  </div>
  <address>${esc(addressLine)}</address>
</section>`;

const crumbsHtml = (r, crumbs) => `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>
  <li><a href="${r}">Home</a></li>
  ${crumbs.map((c, i) => (i === crumbs.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${r}${c.path}">${esc(c.name)}</a></li>`)).join('\n  ')}
</ol></nav>`;

// ---------- schema ----------
const business = {
  '@type': 'LocalBusiness',
  '@id': site.domain + '/#business',
  name: site.name,
  url: site.domain + '/',
  image: site.domain + '/assets/og.jpg',
  logo: site.domain + '/assets/favicon.svg',
  telephone: site.phoneE164,
  foundingDate: String(site.founded),
  founder: { '@type': 'Person', name: site.founder },
  description: site.tagline,
  priceRange: '₹₹',
  address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal, addressCountry: a.country },
  ...(site.geo ? { geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng } } : {}),
  areaServed: { '@type': 'Country', name: 'India' },
  sameAs: site.profiles,
  ...(site.gstin ? { taxID: site.gstin } : {}),
};
const website = { '@type': 'WebSite', '@id': site.domain + '/#website', url: site.domain + '/', name: site.name, publisher: { '@id': business['@id'] } };
const breadcrumbLd = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: urlOf(c.path) })),
});
const faqLd = (items) => ({ '@type': 'FAQPage', mainEntity: items.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) });

// ---------- layout ----------
const NAV = [
  ['products/', 'Products'],
  ['weighbridges/', 'Weighbridges'],
  ['clients/', 'Clients'],
  ['about/', 'About'],
  ['contact/', 'Contact'],
  ['experience/', '3D'],
];

function page({ path, title, desc, body, schema = [], crumbs, inner = true, ogImage = 'assets/og.jpg', preload = '' }) {
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
<meta name="theme-color" content="#FBF7F2">
<link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_IN">
<meta property="og:url" content="${urlOf(path)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${urlOf(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=Manrope:wght@400;500;600;700&display=swap">
${preload}<link rel="stylesheet" href="${r}styles.css">
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
</head>
<body class="${inner ? 'inner' : 'home'}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="wordmark" href="${r}" aria-label="${esc(site.name)}, home">Sunstar <em>Systems</em></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Primary">
      <ul>
        ${NAV.map(([p, n]) => `<li><a href="${r}${p}"${path.startsWith(p) ? ' aria-current="page"' : ''}>${n}</a></li>`).join('\n        ')}
      </ul>
      <a class="btn btn--sm" href="${wa('Hi Sunstar, I need a quote for a weighing scale')}">WhatsApp</a>
    </nav>
  </div>
</header>
${crumbs ? crumbsHtml(r, crumbs) : ''}
<main id="main">
${body(r)}
</main>
<footer class="site-footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <a class="wordmark" href="${r}">Sunstar <em>Systems</em></a>
      <p>Weighing scales, weighbridges and load cells since ${site.founded}. Supplied across India from Bahadurgarh, Haryana.</p>
    </div>
    <div>
      <p class="label">Products</p>
      <ul>${categories.map((c) => `<li><a href="${r}${c.slug}/">${esc(c.name)}</a></li>`).join('')}</ul>
    </div>
    <div>
      <p class="label">Company</p>
      <ul><li><a href="${r}about/">About</a></li><li><a href="${r}clients/">Clients</a></li><li><a href="${r}pan-india-supply/">Pan-India supply</a></li><li><a href="${r}contact/">Contact</a></li><li><a href="${r}experience/">3D experience</a></li></ul>
    </div>
    <div>
      <p class="label">Visit</p>
      <address>${esc(addressLine)}<br><a href="${tel}">${esc(site.phoneDisplay)}</a><br>${esc(site.hours)}</address>
    </div>
  </div>
  <div class="wrap footer__base"><span>GSTIN ${esc(site.gstin)}</span><span>© ${site.founded}–${year} ${esc(site.name)}, Bahadurgarh, Haryana</span></div>
</footer>
<a class="wa-float" href="${wa('Hi Sunstar, I need a quote for a weighing scale')}" aria-label="WhatsApp Sunstar">WhatsApp</a>
<script src="${r}main.js" defer></script>
</body>
</html>
`;
  const out = join(DIST, path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  sitemap.push(path);
}
const sitemap = [];

// ---------- pages ----------
const hero = prodBy['ss-30'];
const featured = ['ss-30', 'stainless-tabletop', 'sst-30', 'platform-diamond'].map((s) => prodBy[s]);
const homeFaq = faqs.common;

// HOME
page({
  path: '',
  inner: false,
  title: 'Sunstar Systems — Weighing Scales & Weighbridges, Bahadurgarh',
  desc: 'Digital, price computing and platform weighing scales, weighbridges and load cells. Accurate and pocket-friendly. Bahadurgarh, supplied across India since 1996.',
  preload: `<link rel="preload" as="image" href="assets/products/${hero.img.file}.webp" imagesrcset="assets/products/${hero.img.file}-640.webp 640w, assets/products/${hero.img.file}.webp ${hero.img.w}w" imagesizes="(max-width: 760px) 92vw, 900px" fetchpriority="high">\n`,
  schema: [faqLd(homeFaq)],
  body: (r) => `
<section class="hero" id="top" aria-labelledby="hero-title">
  <p class="label label--orange">Bahadurgarh · Since ${site.founded}</p>
  ${shot(r, hero, { sizes: '(max-width: 760px) 92vw, 900px', lazy: false })}
  <h1 id="hero-title">Weighing scales, <em>crafted.</em></h1>
  <div class="hero__row">
    <p class="label">Accurate · Durable · Pocket-friendly · Pan-India supply</p>
    <a class="link-arrow" href="${r}products/">Explore the range →</a>
  </div>
</section>

<section class="exp-band bg-charcoal on-dark" aria-label="3D experience">
  <div class="wrap exp-band__in">
    <p class="label">New · 3D</p>
    <p class="exp-band__title">See Sunstar in <em>3D.</em></p>
    <a class="btn" href="${r}experience/">Open the 3D experience →</a>
  </div>
</section>

<section class="section" id="range" aria-labelledby="range-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="range-title">The range</h2>
      <a class="label link-arrow" href="${r}products/">All products →</a>
    </div>
    <ul class="range__row">
      ${categories.slice(0, 3).map((c) => { const p = prodBy[c.hero]; return `<li class="range__card"><a href="${r}${c.slug}/">
        <div class="range__plate ${c.plate}${c.plate === 'bg-charcoal' ? ' on-dark' : ''}">${shot(r, p, { sizes: '(max-width: 760px) 70vw, 24vw' })}</div>
        <h3>${esc(c.name)}</h3><p class="label">${esc(c.range)}</p></a></li>`; }).join('\n      ')}
      <li class="range__card"><a href="${r}weighbridges/">
        <div class="range__plate bg-orange range__plate--type"><span class="range__word">60&thinsp;t</span></div>
        <h3>Weighbridges &amp; Load Cells</h3><p class="label">Pit, pitless &amp; mobile</p></a></li>
    </ul>
  </div>
</section>

${featured.map((p, i) => `<section class="plate ${p.plate}${p.plate === 'bg-charcoal' ? ' on-dark' : ''}${i % 2 ? ' plate--flip' : ''}" aria-labelledby="${p.slug}-title">
  <div class="plate__in">
    <figure class="plate__media"><span class="wm" aria-hidden="true">${esc(p.wm)}</span>${shot(r, p, { sizes: '(max-width: 760px) 92vw, 55vw' })}</figure>
    <div class="plate__text">
      <p class="label">${esc(catBy[p.cat].name)}</p>
      <h2 class="model" id="${p.slug}-title">${esc(p.model || catBy[p.cat].short)}</h2>
      <p class="desc">${esc(p.line)}</p>
      ${specTable({ ...p, ask: [] })}
      <div class="plate__cta"><a class="btn${p.plate === 'bg-orange' ? ' btn--ink' : ''}" href="${waProduct(p.name)}">Get price</a><a class="link-arrow" href="${r}products/${p.slug}/">Details →</a></div>
    </div>
  </div>
</section>`).join('\n\n')}

<section class="section why" aria-labelledby="why-title">
  <div class="wrap">
    <h2 id="why-title" class="sr-only">Why Sunstar</h2>
    <ul class="why__grid">
      <li><p class="why__num">${year - site.founded}<span>+</span></p><p class="label">Years in weighing</p><p>Making, supplying and servicing scales from Bahadurgarh since ${site.founded}.</p></li>
      <li><p class="why__num">${site.rating.value}<span>★</span></p><p class="label">${site.rating.source} rating</p><p>Rated by ${site.rating.count} customers for accurate scales and honest service.</p></li>
      <li><p class="why__num">All<span>&thinsp;India</span></p><p class="label">Dispatch</p><p>From Delhi NCR to South India, the North East and Jammu &amp; Kashmir.</p></li>
    </ul>
  </div>
</section>

<section class="section catalogue" id="catalogue" aria-labelledby="catalogue-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="catalogue-title">Complete catalogue</h2>
      <a class="label link-arrow" href="${r}products/">Browse by category →</a>
    </div>
    <ul class="grid">
      ${products.map((p) => tile(r, p)).join('\n      ')}
    </ul>
    <ul class="more">
      ${categories.filter((c) => !c.hero).map((c) => `<li><a href="${r}${c.slug}/"><span>${esc(c.name)}</span><span class="label">${esc(c.range)} →</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="trust" aria-label="Clients">
  <div class="wrap">
    <p class="label">Supplied to businesses including</p>
    <ul class="logos">${site.clients.map((c) => `<li class="logo${c.confirmed ? '' : ' logo--ph'}">${c.confirmed ? esc(c.name) : 'Client logo'}</li>`).join('')}</ul>
    <a class="label link-arrow" href="${r}clients/">Clients →</a>
  </div>
</section>

${faqBlock(homeFaq, 'Before you call')}

${closing(r, prodBy['sst-30'])}`,
});

// PRODUCTS INDEX
page({
  path: 'products/',
  title: 'All Products: Weighing Scales & Weighbridges | Sunstar Systems',
  desc: 'Tabletop, price computing, platform and jewellery scales, weighbridges, load cells and crane scales from Sunstar Systems. Get today’s price on WhatsApp.',
  crumbs: [{ name: 'Products', path: 'products/' }],
  schema: [{ '@type': 'ItemList', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: urlOf(`products/${p.slug}/`), name: p.name })) }],
  body: (r) => `
<section class="page-hero">
  <div class="wrap">
    <p class="label label--orange">${products.length} models · ${categories.length} families</p>
    <h1>Weighing scales &amp; <em>weighbridges</em></h1>
    <p class="lede">Every Sunstar product in one place. Prices are shared on enquiry: tap any product to get today’s price on WhatsApp.</p>
  </div>
</section>
<section class="section section--flush catalogue">
  <div class="wrap">
    <div class="chips" role="group" aria-label="Filter by category">
      <button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>
      ${categories.filter((c) => c.hero).map((c) => `<button class="chip" type="button" data-filter="${c.slug}" aria-pressed="false">${esc(c.short)}</button>`).join('\n      ')}
    </div>
    <ul class="grid">
      ${products.map((p) => tile(r, p)).join('\n      ')}
    </ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>More ranges</h2><p class="label">Supplied to order</p></div>
    <ul class="cats">
      ${categories.filter((c) => !c.hero).map((c) => `<li class="cat ${c.plate}${c.plate === 'bg-charcoal' ? ' on-dark' : ''}"><a href="${r}${c.slug}/"><p class="label">${esc(c.range)}</p><h3>${esc(c.name)}</h3><p>${esc(c.intro)}</p><span class="link-arrow">View range →</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>
${closing(r)}`,
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
    title: `${c.name} | Sunstar Systems, Bahadurgarh`,
    desc: clip(`${c.intro.split('. ')[0]}. Supplied across India from Bahadurgarh. Price on WhatsApp.`),
    crumbs: [{ name: 'Products', path: 'products/' }, { name: c.name, path: `${c.slug}/` }],
    schema: [faqLd(items), ...(list.length ? [{ '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: urlOf(`products/${p.slug}/`), name: p.name })) }] : [])],
    body: (r) => `
<section class="page-hero">
  <div class="wrap">
    <p class="label label--orange">${esc(c.range)}</p>
    <h1>${esc(c.name)}</h1>
    <p class="lede">${esc(c.intro)}</p>
    <div class="page-hero__cta"><a class="btn" href="${waProduct(c.name)}">Get price on WhatsApp</a><a class="btn btn--line" href="${tel}">Call ${esc(site.phoneDisplay)}</a></div>
  </div>
</section>
${list.length ? `<section class="section section--flush catalogue"><div class="wrap"><ul class="grid">
      ${list.map((p) => tile(r, p)).join('\n      ')}
    </ul></div></section>` : ''}
${c.types ? `<section class="section"><div class="wrap wrap--narrow">
    <h2 class="h-sm">Types we supply</h2>
    ${typeList(c)}
    <p class="note">Photos of this range are being added. Ask on WhatsApp for pictures, specifications and today’s price.</p>
  </div></section>` : ''}
<section class="section section--tight uses"><div class="wrap wrap--narrow">
    <h2 class="h-sm">Used by</h2>
    <ul class="pills">${c.uses.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  </div></section>
${faqBlock(items)}
${closing(r, list[0])}`,
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
    path: `products/${p.slug}/`,
    title: `${p.name} | Sunstar Systems`,
    desc: clip(`${p.name}${capOf(p) ? `, ${capOf(p)}` : ''}. ${p.line} Get today’s price on WhatsApp.`),
    crumbs: [{ name: 'Products', path: 'products/' }, { name: c.name, path: `${c.slug}/` }, { name: p.model || p.name, path: `products/${p.slug}/` }],
    schema: [faqLd(items)],
    ogImage: `assets/products/${p.img.file}.webp`,
    body: (r) => `
<section class="plate plate--page ${p.plate}${p.plate === 'bg-charcoal' ? ' on-dark' : ''}" aria-labelledby="p-title">
  <div class="plate__in">
    <figure class="plate__media"><span class="wm" aria-hidden="true">${esc(p.wm)}</span>${shot(r, p, { sizes: '(max-width: 760px) 92vw, 55vw', lazy: false })}</figure>
    <div class="plate__text">
      <p class="label">${esc(c.name)}</p>
      <h1 class="model model--page" id="p-title">${esc(p.name)}</h1>
      <p class="desc">${esc(p.desc)}</p>
      ${specTable(p)}
      <div class="plate__cta"><a class="btn${p.plate === 'bg-orange' ? ' btn--ink' : ''}" href="${waProduct(p.name)}">Get today’s price</a><a class="link-arrow" href="${tel}">Call ${esc(site.phoneDisplay)}</a></div>
    </div>
  </div>
</section>
<section class="section section--tight facts"><div class="wrap">
  <ul class="facts__row">
    <li><p class="label">Price</p><p>Shared on WhatsApp, same day</p></li>
    <li><p class="label">Delivery</p><p>Pick up in Bahadurgarh or dispatch across India</p></li>
    <li><p class="label">Service</p><p>Repair, calibration and spare parts</p></li>
  </ul>
</div></section>
<section class="section section--tight uses"><div class="wrap wrap--narrow">
    <h2 class="h-sm">Made for</h2>
    <ul class="pills">${c.uses.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  </div></section>
${faqBlock(items)}
<section class="section catalogue"><div class="wrap">
  <div class="section-head"><h2>Related</h2><a class="label link-arrow" href="${r}${c.slug}/">All ${esc(c.short.toLowerCase())} →</a></div>
  <ul class="grid">${related.map((x) => tile(r, x)).join('')}</ul>
</div></section>
${closing(r)}`,
  });
}

// CLIENTS
page({
  path: 'clients/',
  title: 'Clients & Industries | Sunstar Systems',
  desc: 'Weighing scales and weighbridges for brands, manufacturers, retailers and warehouses across India. Bulk orders with GST invoice.',
  crumbs: [{ name: 'Clients', path: 'clients/' }],
  body: (r) => `
<section class="page-hero">
  <div class="wrap">
    <p class="label label--orange">Clients</p>
    <h1>Weighing for the <em>brands you know.</em></h1>
    <p class="lede">From national brands to the shop next door, businesses across India weigh on Sunstar. We supply single scales and bulk orders with GST invoicing.</p>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap">
    <ul class="logo-wall">${site.clients.map((c) => `<li class="${c.confirmed ? '' : 'is-ph'}">${c.confirmed ? `<span>${esc(c.name)}</span>` : '<span class="label">Client logo</span>'}</li>`).join('')}</ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>Industries we supply</h2></div>
    <ul class="ind">
      <li><h3>Manufacturing</h3><p>Platform scales, piece counting scales and load cells for production and stores.</p><a class="link-arrow" href="${r}platform-scales/">Platform scales →</a></li>
      <li><h3>Grocery &amp; retail</h3><p>Tabletop and price computing scales for counters and supermarkets.</p><a class="link-arrow" href="${r}price-computing-scales/">Price computing →</a></li>
      <li><h3>Warehousing &amp; logistics</h3><p>Heavy-duty platform scales and weighbridges for dispatch and inbound.</p><a class="link-arrow" href="${r}weighbridges/">Weighbridges →</a></li>
      <li><h3>Jewellery</h3><p>Jewellery and precision scales for gold, silver and gems.</p><a class="link-arrow" href="${r}jewellery-scales/">Jewellery scales →</a></li>
      <li><h3>Dairy &amp; food</h3><p>Stainless scales for wash-down counters, milk weighing and kitchens.</p><a class="link-arrow" href="${r}tabletop-scales/">Tabletop scales →</a></li>
      <li><h3>Healthcare</h3><p>Baby, personal and medical scales for clinics and hospitals.</p><a class="link-arrow" href="${r}special-scales/">Special scales →</a></li>
    </ul>
  </div>
</section>
<section class="section section--tight b2b bg-charcoal on-dark">
  <div class="wrap b2b__in">
    <div><p class="label">For companies</p><h2>Bulk &amp; corporate orders</h2></div>
    <ul><li>GST invoice${site.gstin ? ` · GSTIN ${esc(site.gstin)}` : ''}</li><li>Multi-location dispatch across India</li><li>Installation, calibration &amp; AMC support</li></ul>
    <a class="btn" href="${wa('Hi Sunstar, we need a bulk / corporate quote for weighing scales')}">Request a bulk quote</a>
  </div>
</section>
${closing(r)}`,
});

// ABOUT
page({
  path: 'about/',
  title: 'About Sunstar Systems — Weighing Scales Since 1996',
  desc: `Sunstar Systems has made, supplied and serviced weighing scales in Bahadurgarh, Haryana since ${site.founded}. Managing Director ${site.founder}.`,
  crumbs: [{ name: 'About', path: 'about/' }],
  body: (r) => `
<section class="page-hero">
  <div class="wrap">
    <p class="label label--orange">Since ${site.founded}</p>
    <h1>${year - site.founded} years of <em>honest weight.</em></h1>
    <p class="lede">Sunstar Systems started in Bahadurgarh in ${site.founded} with one idea: a scale should be accurate, built to last and priced fairly. Today we supply digital weighing scales, platform scales, weighbridges and load cells to shops, factories and brands across India.</p>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap about">
    <figure class="about__media bg-soft">${shot(r, prodBy['steel-pan-tabletop'], { sizes: '(max-width: 760px) 80vw, 40vw' })}</figure>
    <div>
      <table class="specs facts-table">
        <tr><th scope="row">Established</th><td>${site.founded}</td></tr>
        <tr><th scope="row">Managing Director</th><td>${esc(site.founder)}</td></tr>
        <tr><th scope="row">Location</th><td>${esc(a.city)}, ${esc(a.region)}</td></tr>
        <tr><th scope="row">Supply</th><td>All India</td></tr>
        <tr><th scope="row">Rating</th><td>${site.rating.value}★ on ${site.rating.source} (${site.rating.count} ratings)</td></tr>
        <tr><th scope="row">GSTIN</th><td>${esc(site.gstin)}</td></tr>
        <tr><th scope="row">Payment</th><td>Cash, cheque / DD, Visa, Mastercard, RuPay</td></tr>
      </table>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>What we do</h2></div>
    <ul class="ind">
      <li><h3>Supply</h3><p>Tabletop, price computing, platform, jewellery and crane scales, weighbridges and load cells.</p></li>
      <li><h3>Installation</h3><p>Platform scales and weighbridges set up and tested on site.</p></li>
      <li><h3>Calibration</h3><p>Scales checked and calibrated so every reading is right.</p></li>
      <li><h3>Repair &amp; parts</h3><p>Service for all makes, with load cells, indicators and spares.</p></li>
    </ul>
  </div>
</section>
${closing(r)}`,
});

// PAN-INDIA
page({
  path: 'pan-india-supply/',
  title: 'Weighing Scale Supplier Across India | Sunstar Systems',
  desc: 'Weighing scales, platform scales and load cells dispatched from Bahadurgarh to every state, including South India, the North East and Jammu & Kashmir.',
  crumbs: [{ name: 'Pan-India supply', path: 'pan-india-supply/' }],
  body: (r) => `
<section class="page-hero">
  <div class="wrap">
    <p class="label label--orange">All India</p>
    <h1>From Bahadurgarh to <em>every state.</em></h1>
    <p class="lede">We pack and dispatch weighing scales, platform scales, load cells and indicators across India. Send your city and the model you need; we share the price with delivery.</p>
    <div class="page-hero__cta"><a class="btn" href="${wa('Hi Sunstar, I need a scale delivered to (city): ')}">Price with delivery</a></div>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap">
    <ul class="regions">${site.regions.map((g) => `<li><h2 class="h-sm">${esc(g.name)}</h2><p>${esc(g.places)}</p></li>`).join('')}</ul>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <div class="section-head"><h2>How ordering works</h2></div>
    <ol class="steps">
      <li><p class="label">01</p><h3>WhatsApp us</h3><p>Model or weight needed, quantity and delivery city.</p></li>
      <li><p class="label">02</p><h3>Get the price</h3><p>We reply with today’s price and delivery.</p></li>
      <li><p class="label">03</p><h3>GST invoice</h3><p>Pay by bank, cheque or card. Invoice with GSTIN.</p></li>
      <li><p class="label">04</p><h3>Dispatch</h3><p>Packed, tested and sent to your city.</p></li>
    </ol>
  </div>
</section>
${closing(r)}`,
});

// CONTACT
page({
  path: 'contact/',
  title: 'Contact Sunstar Systems, Bahadurgarh',
  desc: clip(`Weighing scale shop near Metro Pillar 804, Vivekanand Nagar, Bahadurgarh. Call ${site.phoneDisplay} or WhatsApp for today’s price.`),
  crumbs: [{ name: 'Contact', path: 'contact/' }],
  body: (r) => `
<section class="page-hero">
  <div class="wrap">
    <p class="label label--orange">Contact</p>
    <h1>Visit, call or <em>WhatsApp.</em></h1>
  </div>
</section>
<section class="section section--flush">
  <div class="wrap contact">
    <div class="contact__info">
      <p class="label">Shop</p>
      <address>${esc(site.name)}<br>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.region)} ${esc(a.postal)}</address>
      <p class="label">Phone</p>
      <p><a href="${tel}">${esc(site.phoneDisplay)}</a></p>
      <p class="label">Hours</p>
      <p>${esc(site.hours)}</p>
      <p class="label">Directions</p>
      <p><a class="link-arrow" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(site.name + ', ' + addressLine)}">Open in Google Maps →</a></p>
    </div>
    <form class="enquiry" data-wa="${site.whatsappNumber}" novalidate>
      <p class="label">Send an enquiry on WhatsApp</p>
      <label>Name<input name="name" autocomplete="name" required></label>
      <label>City<input name="city" autocomplete="address-level2"></label>
      <label>Product
        <select name="product">
          <option value="">Select…</option>
          ${products.map((p) => `<option>${esc(p.name)}</option>`).join('')}
          ${categories.filter((c) => !c.hero).map((c) => `<option>${esc(c.name)}</option>`).join('')}
          <option>Repair / calibration</option>
        </select>
      </label>
      <label>Message<textarea name="message" rows="4" placeholder="Capacity, quantity, anything else"></textarea></label>
      <button class="btn" type="submit">Send on WhatsApp</button>
      <p class="note">Opens WhatsApp with your message ready to send. Nothing is stored on this site.</p>
    </form>
  </div>
  <div class="wrap"><iframe class="map" title="Map to ${esc(site.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(site.name + ', ' + addressLine)}&amp;output=embed"></iframe></div>
</section>`,
});

// 404 (not in sitemap)
const before = sitemap.length;
page({
  path: '404/',
  title: 'Page not found — Sunstar Systems',
  desc: 'This page does not exist.',
  body: (r) => `<section class="page-hero page-hero--center"><div class="wrap"><p class="label label--orange">404</p><h1>This page weighs <em>nothing.</em></h1><p class="lede">It may have moved. Try the products or send us a WhatsApp.</p><div class="page-hero__cta"><a class="btn" href="${r}products/">View products</a><a class="btn btn--line" href="${wa('Hi Sunstar')}">WhatsApp</a></div></div></section>`,
});
sitemap.length = before;
cpSync(join(DIST, '404/index.html'), join(DIST, '404.html'));

// sitemap + robots
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((p) => `  <url><loc>${urlOf(p)}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /404/\nSitemap: ${site.domain}/sitemap.xml\n`);

console.log(`Built ${sitemap.length} pages -> dist/`);

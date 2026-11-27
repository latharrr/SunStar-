// node build.mjs -> writes index.html (static, no framework). Layout follows the client's base44 catalog.
import { readFileSync, writeFileSync } from 'node:fs';
import { site, categories, products, gallery } from './data.mjs';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = (t) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t)}`;
const logo = readFileSync(new URL('./assets/sunstar-logo.svg', import.meta.url), 'utf8').replace('<svg ', '<svg class="logo__mark" aria-hidden="true" ');
const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
const tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5 8.2l2 2 4-4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const icon = {
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z" fill="currentColor"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.7-8 11-4.6-1.3-8-6-8-11V5z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  award: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  headset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0116 0v2M4 14v4h3v-6H4zm16 0v4h-3v-6h3z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 19h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

const img = (p, cls = '') => p.img
  ? `<img class="${cls}" src="assets/p/${p.img}.webp" alt="${esc(p.name)}${p.model ? ` ${esc(p.model)}` : ''}, Sunstar ${esc(catName[p.cat].toLowerCase())} scale" loading="lazy" decoding="async">`
  : `<div class="noimg ${cls}"><span>${esc(p.model || p.name)}</span><small>Photo on request</small></div>`;

const card = (p) => `<li class="card" data-cat="${p.cat}" id="${p.id}">
  <div class="card__media"><span class="pill">${esc(p.pill)}</span>${img(p)}</div>
  <div class="card__body">
    ${p.model ? `<p class="card__model">${esc(p.model)}</p>` : ''}
    <h3 class="card__name">${esc(p.name)}</h3>
    <p class="card__desc">${esc(p.desc)}</p>
    <dl class="kv"><div><dt>Capacity</dt><dd>${esc(p.capacity)}</dd></div><div><dt>Accuracy</dt><dd>${esc(p.accuracy)}</dd></div></dl>
    <ul class="feat">${p.features.map((f) => `<li>${tick}${esc(f)}</li>`).join('')}</ul>
    <button class="card__more" type="button" data-open="${p.id}">View full details<span aria-hidden="true">›</span></button>
  </div>
</li>`;

const dialogs = products.map((p) => `<dialog class="sheet" id="d-${p.id}" aria-labelledby="t-${p.id}">
  <div class="sheet__in">
    <button class="sheet__close" type="button" data-close aria-label="Close">×</button>
    <div class="sheet__media">${img(p)}</div>
    <div class="sheet__body">
      <span class="pill pill--soft">${esc(p.pill)}</span>
      ${p.model ? `<p class="card__model">${esc(p.model)}</p>` : ''}
      <h2 class="sheet__name" id="t-${p.id}">${esc(p.name)}</h2>
      <p>${esc(p.desc)}</p>
      <dl class="kv"><div><dt>Capacity</dt><dd>${esc(p.capacity)}</dd></div><div><dt>Accuracy</dt><dd>${esc(p.accuracy)}</dd></div></dl>
      <ul class="feat feat--lg">${p.features.map((f) => `<li>${tick}${esc(f)}</li>`).join('')}</ul>
      <div class="sheet__cta">
        <a class="btn btn--wa" href="${wa(`Hi Sunstar, please share today's price for ${p.model ? p.model + ' ' : ''}${p.name}.`)}">${icon.wa}Get price on WhatsApp</a>
        <a class="btn btn--line" href="tel:${site.phoneE164}">${icon.phone}Call ${esc(site.phoneDisplay)}</a>
      </div>
      <p class="sheet__note">Prices depend on capacity, quantity and delivery city. We reply the same day.</p>
    </div>
  </div>
</dialog>`).join('\n');

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'LocalBusiness', name: site.name, url: site.url, telephone: site.phoneE164, address: { '@type': 'PostalAddress', streetAddress: '49, Main Road, Vivekanand Nagar, near Metro Pillar No. 804', addressLocality: 'Bahadurgarh', addressRegion: 'Haryana', postalCode: '124507', addressCountry: 'IN' }, taxID: site.gstin, areaServed: 'IN' },
    { '@type': 'ItemList', name: 'Sunstar weighing instruments', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: `${p.model ? p.model + ' ' : ''}${p.name}` })) },
  ],
};

const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sunstar Product Catalog — Platform, Floor, Crane, Precision &amp; Livestock Scales</title>
<meta name="description" content="Sunstar weighing instruments: platform, floor, tabletop, price computing, precision, crane and livestock scales. Capacity and accuracy for every model. Price on WhatsApp.">
<meta name="theme-color" content="#1E3A8A">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="Sunstar Product Catalog">
<meta property="og:description" content="Weighing instruments for every industry, from laboratory balances to heavy-duty industrial scales.">
<meta property="og:image" content="assets/og.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<a class="skip" href="#range">Skip to products</a>

<div class="topbar">
  <div class="wrap topbar__in">
    <div class="topbar__links">
      <a href="tel:${site.phoneE164}" aria-label="Call ${esc(site.phoneDisplay)}">${icon.phone}<span>${esc(site.phoneDisplay)}</span></a>
      <a href="${wa('Hi Sunstar')}" aria-label="WhatsApp">${icon.wa}<span>WhatsApp</span></a>
    </div>
    <span>${esc(site.iso)}</span>
  </div>
</div>

<header class="hero">
  <div class="hero__blob hero__blob--a" aria-hidden="true"></div>
  <div class="hero__blob hero__blob--b" aria-hidden="true"></div>
  <div class="wrap hero__in">
    <a class="logo" href="./" aria-label="Sunstar, weighing solutions">${logo}<span class="logo__sub">Weighing solutions</span></a>
    <h1>Professional Product Catalog</h1>
    <p class="hero__lede">Precision weighing instruments for every industry, from laboratory balances to heavy-duty industrial scales.</p>
    <div class="chips chips--hero" role="group" aria-label="Jump to a category">
      ${categories.map((c) => `<button class="chip" type="button" data-filter="${c.id}">${esc(c.name)}</button>`).join('')}
    </div>
    <div class="hero__cta">
      <a class="btn btn--amber" href="catalog.pdf" download>${icon.dl}Download Product Catalog (PDF)</a>
      <a class="btn btn--ghost" href="${wa('Hi Sunstar, I need a quote for weighing scales')}">${icon.wa}Get a quote on WhatsApp</a>
    </div>
  </div>
</header>

<main>
<section class="range" id="range" aria-labelledby="range-title">
  <div class="wrap">
    <p class="eyebrow">Our range</p>
    <h2 id="range-title">Weighing Instruments</h2>
    <p class="range__lede">Browse our complete range of precision weighing solutions, designed for reliability and accuracy.</p>

    <div class="filterbar" id="filterbar">
      <div class="chips" role="group" aria-label="Filter by category">
        <button class="chip chip--sm" type="button" data-filter="all" aria-pressed="true">All <span class="count">${products.length}</span></button>
        ${categories.map((c) => `<button class="chip chip--sm" type="button" data-filter="${c.id}" aria-pressed="false">${esc(c.name)} <span class="count">${products.filter((p) => p.cat === c.id).length}</span></button>`).join('')}
      </div>
      <p class="filterbar__status" aria-live="polite"><span id="shown">${products.length}</span> products</p>
    </div>

    <ul class="grid">
      ${products.map(card).join('\n      ')}
    </ul>

    <aside class="custom">
      <div>
        <h3>Didn’t find the scale you need?</h3>
        <p>We also supply weighbridges, load cells, jewellery and baby scales, and build to your capacity and platform size.</p>
      </div>
      <a class="btn btn--blue" href="${wa('Hi Sunstar, I need a scale with this capacity / platform size: ')}">${icon.wa}Tell us your requirement</a>
    </aside>
  </div>
</section>

<section class="photos" aria-labelledby="photos-title">
  <div class="wrap">
    <p class="eyebrow">Gallery</p>
    <h2 id="photos-title">Photos</h2>
    <p class="range__lede">From our shop and studio in Bahadurgarh.</p>
    <ul class="photo-grid">
      ${gallery.map((g) => `<li><figure><img src="assets/gallery/${g.file}.webp" width="1000" height="1000" alt="${esc(g.caption)}" loading="lazy" decoding="async"><figcaption>${esc(g.caption)}</figcaption></figure></li>`).join('')}
    </ul>
  </div>
</section>

<section class="quote" id="quote" aria-labelledby="quote-title">
  <div class="wrap quote__in">
    <div>
      <p class="eyebrow eyebrow--light">Quick quote</p>
      <h2 id="quote-title">Get today’s price in minutes</h2>
      <p>Tell us what you need. Your message opens in WhatsApp, ready to send. Nothing is stored on this website.</p>
      <ul class="quote__contact">
        <li>${icon.phone}<a href="tel:${site.phoneE164}">${esc(site.phoneDisplay)}</a></li>
        <li>${icon.pin}<span>${esc(site.address)}</span></li>
      </ul>
    </div>
    <form class="qform" id="qform" novalidate>
      <label>Your name<input name="name" autocomplete="name" required></label>
      <label>Product
        <select name="product"><option value="">Choose a product</option>${products.map((p) => `<option>${esc(`${p.model ? p.model + ' ' : ''}${p.name}`)}</option>`).join('')}<option>Something else</option></select>
      </label>
      <div class="qform__row">
        <label>Quantity<input name="qty" inputmode="numeric" placeholder="1"></label>
        <label>Delivery city<input name="city" autocomplete="address-level2"></label>
      </div>
      <button class="btn btn--amber" type="submit">${icon.wa}Send on WhatsApp</button>
      <a class="qform__fallback" hidden target="_blank" rel="noopener">Open WhatsApp with your message</a>
    </form>
  </div>
</section>
</main>

<footer class="footer">
  <div class="wrap">
    <ul class="trust">
      <li>${icon.shield}<div><strong>Quality assured</strong><span>${esc(site.iso)}</span></div></li>
      <li>${icon.award}<div><strong>Trusted brand</strong><span>Since 1996, supplied across India</span></div></li>
      <li>${icon.headset}<div><strong>Expert support</strong><span>Installation, calibration and repair</span></div></li>
    </ul>
    <div class="footer__base">
      <a class="logo logo--sm" href="./" aria-label="Sunstar">${logo}</a>
      <p>© ${new Date().getFullYear()} Sunstar Weighing Solutions. All rights reserved. GSTIN ${esc(site.gstin)}</p>
      <p class="footer__links"><a href="${site.mainSite}">Main website</a><a href="${site.experience}">3D walkthrough</a></p>
    </div>
  </div>
</footer>

<a class="wa-fab" href="${wa('Hi Sunstar, I need a quote for weighing scales')}" aria-label="WhatsApp Sunstar">${icon.wa}</a>

${dialogs}

<script src="app.js" defer></script>
</body>
</html>
`;
writeFileSync(new URL('./index.html', import.meta.url), html);
console.log('index.html built,', products.length, 'products');

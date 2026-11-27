# sunstarscales.com

Static site for Sunstar Systems, Bahadurgarh. Based on design 2 (orange product plates). No framework, no build dependencies beyond Node 18+.

```bash
node build.mjs           # renders src/data.mjs -> dist/
npx serve dist           # preview locally
```

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages). Serve `404.html` for missing routes.

## Structure

| Path | Page |
|---|---|
| `/` | Home: hero, range, 4 product plates, catalogue, clients, FAQ |
| `/products/` | All products + filter + more ranges |
| `/products/{slug}/` | 8 product pages (real photos) |
| `/{category}/` | 7 category pages (tabletop, price computing, platform, jewellery, weighbridges, load cells, special) |
| `/clients/` | Client wall, industries, bulk orders |
| `/about/`, `/pan-india-supply/`, `/contact/` | Company, all-India supply, enquiry form → WhatsApp + map |

Edit everything in `src/data.mjs`. Styles in `src/styles.css`, JS in `src/main.js`.

## Before launch (TODO)

- [ ] Confirm WhatsApp / phone for enquiries (`phoneE164`, `whatsappNumber`; currently 09355349600)
- [ ] Confirm GSTIN `06AGGPD2936C2ZW`, full opening hours, exact map pin (`geo`)
- [ ] Client names and logos, with permission from each (`clients`, only bigbasket confirmed)
- [ ] Specs marked "Confirm on enquiry" on each product
- [ ] Photos for jewellery scales, weighbridges, load cells, crane scales
- [ ] Re-shoot or retouch SSP-50 (shop-floor photo, plastic wrap)
- [ ] ISO certificate: labels show both 9001:2008 and 9001:2015; add `iso` only once a valid certificate is seen
- [ ] Add IndiaMART + Google Business Profile URLs to `profiles`
- [ ] Self-host the fonts (Fraunces, Manrope) for speed and privacy
- [ ] After DNS: submit `sitemap.xml` in Google Search Console; match the name, address and phone on Google Business Profile, Justdial and IndiaMART exactly

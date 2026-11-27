// Mobile menu
const menuBtn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
if (menuBtn) {
  const setMenu = (open) => { menuBtn.setAttribute('aria-expanded', open); nav.classList.toggle('open', open); };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
}

// Catalogue filter (products page)
const chips = document.querySelectorAll('.chip'), tiles = document.querySelectorAll('.tile');
chips.forEach((c) => c.addEventListener('click', () => {
  chips.forEach((x) => x.setAttribute('aria-pressed', x === c));
  tiles.forEach((t) => { t.hidden = c.dataset.filter !== 'all' && t.dataset.cat !== c.dataset.filter; });
}));

// Enquiry form -> WhatsApp (no data stored)
const form = document.querySelector('.enquiry');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(form), name = form.elements.name;
  if (!String(f.get('name')).trim()) { name.setAttribute('aria-invalid', 'true'); name.focus(); return; }
  name.removeAttribute('aria-invalid');
  const lines = ['Hi Sunstar, enquiry from the website.', `Name: ${f.get('name')}`];
  if (f.get('city')) lines.push(`City: ${f.get('city')}`);
  if (f.get('product')) lines.push(`Product: ${f.get('product')}`);
  if (f.get('message')) lines.push(`Message: ${f.get('message')}`);
  const url = `https://wa.me/${form.dataset.wa}?text=${encodeURIComponent(lines.join('\n'))}`;
  let link = form.querySelector('.enquiry__link');
  if (!link) { link = document.createElement('a'); link.className = 'link-arrow enquiry__link'; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Open WhatsApp with your message'; form.appendChild(link); }
  link.href = url;
  const w = window.open(url, '_blank', 'noopener');
  if (!w) link.focus();
});

// Hero carousel: scroll-snap track, arrow buttons, dots, gentle autoplay that stops on interaction.
(() => {
  const track = document.querySelector('[data-carousel]');
  if (!track) return;
  const root = track.closest('.hero-c');
  const slides = [...track.children];
  const dots = [...root.querySelectorAll('.hero-c__dots button')];
  const idx = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = (i) => track.scrollTo({ left: ((i + slides.length) % slides.length) * track.clientWidth });
  root.querySelector('[data-prev]').addEventListener('click', () => { stop(); go(idx() - 1); });
  root.querySelector('[data-next]').addEventListener('click', () => { stop(); go(idx() + 1); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stop(); go(i); }));
  track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { stop(); go(idx() + 1); } if (e.key === 'ArrowLeft') { stop(); go(idx() - 1); } });
  let t;
  track.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const i = idx(); dots.forEach((d, j) => d.setAttribute('aria-selected', String(i === j))); }, 60); }, { passive: true });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timer = reduce ? null : setInterval(() => go(idx() + 1), 6000);
  function stop() { clearInterval(timer); timer = null; }
  ['pointerdown', 'wheel', 'touchstart'].forEach((ev) => track.addEventListener(ev, stop, { passive: true }));
})();

// Site search: toggles a panel under the header and filters an inline index of products and categories.
(() => {
  const btn = document.querySelector('.search-btn');
  const panel = document.getElementById('site-search');
  if (!btn || !panel) return;
  const input = panel.querySelector('input');
  const list = panel.querySelector('.search-results');
  const data = JSON.parse(document.getElementById('search-data').textContent);
  const norm = (x) => x.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const index = data.map((d) => ({ ...d, h: norm(`${d.t} ${d.s} ${d.k}`), hc: norm(`${d.t} ${d.k}`).replace(/ /g, '') }));
  const open = (v) => { panel.hidden = !v; btn.setAttribute('aria-expanded', String(v)); if (v) input.focus(); };
  btn.addEventListener('click', () => open(panel.hidden));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
  const render = () => {
    const words = norm(input.value).trim().split(' ').filter(Boolean);
    if (!words.length) { list.innerHTML = ''; return; }
    const has = (d, w) => (/\d/.test(w) ? ` ${d.h} `.includes(` ${w} `) || d.hc.includes(w) && /[a-z]/.test(w) : d.h.includes(w) || d.hc.includes(w));
    const hits = index.filter((d) => words.every((w) => has(d, w))).slice(0, 8);
    list.innerHTML = hits.length
      ? hits.map((d) => `<li><a href="${d.u}">${d.t.replace(/</g, '&lt;')}<small>${d.s}</small></a></li>`).join('')
      : '<li class="empty">No scale found. Ask us on WhatsApp and we will tell you which model fits.</li>';
  };
  input.addEventListener('input', render);
  panel.querySelector('form').addEventListener('submit', (e) => { const first = list.querySelector('a'); if (first) { e.preventDefault(); location.href = first.href; } });
})();

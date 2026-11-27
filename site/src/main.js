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

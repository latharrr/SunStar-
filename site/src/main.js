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

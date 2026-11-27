{
  const cards = [...document.querySelectorAll('.card')];
  const chips = [...document.querySelectorAll('.filterbar .chip')];
  const shown = document.getElementById('shown');
  const filter = (cat, scroll) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === cat)));
    let n = 0;
    cards.forEach((c) => { const on = cat === 'all' || c.dataset.cat === cat; c.hidden = !on; if (on) n++; });
    shown.textContent = n;
    if (scroll) document.getElementById('range').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  chips.forEach((c) => c.addEventListener('click', () => filter(c.dataset.filter)));
  document.querySelectorAll('.chips--hero .chip').forEach((c) => c.addEventListener('click', () => filter(c.dataset.filter, true)));

  // View full details: native <dialog>, with a #product-id link that can be shared
  const open = (id) => { const d = document.getElementById('d-' + id); if (d && !d.open) d.showModal(); };
  document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => { open(b.dataset.open); history.replaceState(null, '', '#' + b.dataset.open); }));
  document.querySelectorAll('dialog.sheet').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', () => history.replaceState(null, '', location.pathname));
  });
  if (location.hash) open(location.hash.slice(1));

  // Quick quote -> WhatsApp (nothing stored)
  const f = document.getElementById('qform');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(f), name = f.elements.name;
    if (!String(d.get('name')).trim()) { name.setAttribute('aria-invalid', 'true'); name.focus(); return; }
    name.removeAttribute('aria-invalid');
    const lines = ['Hi Sunstar, quote request from the catalog.', `Name: ${d.get('name')}`];
    if (d.get('product')) lines.push(`Product: ${d.get('product')}`);
    if (d.get('qty')) lines.push(`Quantity: ${d.get('qty')}`);
    if (d.get('city')) lines.push(`Delivery city: ${d.get('city')}`);
    const url = 'https://wa.me/919355349600?text=' + encodeURIComponent(lines.join('\n'));
    const a = f.querySelector('.qform__fallback'); a.href = url; a.hidden = false;
    if (!window.open(url, '_blank', 'noopener')) a.focus();
  });
}

// Nav behaviour. Runs with or without motion.
(() => {
  const nav = document.querySelector('.nav');
  const btn = nav.querySelector('.nav__menu');
  const dds = [...nav.querySelectorAll('.dd')];
  const close = () => {
    nav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    dds.forEach((d) => (d.open = false));
  };
  btn.addEventListener('click', () => btn.setAttribute('aria-expanded', String(nav.classList.toggle('is-open'))));
  nav.querySelectorAll('.nav__panel a').forEach((a) => a.addEventListener('click', close));
  dds.forEach((d) => d.addEventListener('toggle', () => d.open && dds.forEach((o) => o !== d && (o.open = false))));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

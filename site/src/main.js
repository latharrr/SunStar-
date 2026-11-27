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

// Sunstar assistant: a short guided chat that drafts a WhatsApp message. No server, nothing stored.
(() => {
  const root = document.querySelector('[data-bot]');
  if (!root) return;
  const data = JSON.parse(document.getElementById('bot-data').textContent);
  const launch = root.querySelector('.bot__launch');
  const panel = root.querySelector('.bot__panel');
  const log = root.querySelector('.bot__log');
  const chips = root.querySelector('.bot__chips');
  const form = root.querySelector('.bot__form');
  const input = form.querySelector('input');
  const wa = root.dataset.wa;
  const tel = root.dataset.tel;
  const pageProduct = root.dataset.product || '';
  const ans = {};
  let step = null;
  let started = false;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const scroll = () => { log.scrollTop = log.scrollHeight; };
  const say = (text, who = 'bot') => { const li = document.createElement('li'); li.className = `bot__msg bot__msg--${who}`; li.textContent = text; log.append(li); scroll(); };
  const setChips = (opts) => {
    chips.innerHTML = '';
    opts.forEach((o) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o; b.addEventListener('click', () => answer(o)); chips.append(b); });
  };

  // Each step: question, optional chips, key to store, next step (fn or name). Free text always allowed.
  const steps = {
    intent: { q: 'Namaste! I can get you today’s price from the Sunstar team. What do you need?', c: ['Buy a scale', 'Repair or calibration', 'Bulk or company order', 'Something else'], key: 'intent',
      next: (v) => (/repair|calib/i.test(v) ? 'repairWhat' : /bulk|company/i.test(v) ? 'company' : /else/i.test(v) ? 'question' : pageProduct ? 'confirmProduct' : 'cat') },
    confirmProduct: { q: () => `Is it for the ${pageProduct}?`, c: ['Yes, this one', 'A different scale'], key: '_confirm',
      next: (v) => (/yes/i.test(v) ? (ans.model = pageProduct, 'qty') : 'cat') },
    cat: { q: 'Which type of scale?', c: () => [...data.cats.map((c) => c.short), 'Not sure'], key: 'type',
      next: (v) => { const c = data.cats.find((x) => x.short === v); ans._cat = c; return c && c.items.length ? 'model' : 'capacity'; } },
    model: { q: 'Any model in mind?', c: () => [...ans._cat.items, 'Help me choose'], key: 'model', next: (v) => (/help/i.test(v) ? (delete ans.model, 'capacity') : 'qty') },
    capacity: { q: 'What is the most weight you need to weigh at once?', c: ['Up to 30 kg', '50 to 300 kg', '500 kg to 2 tonnes', 'Above 2 tonnes', 'Gold or silver (grams)'], key: 'capacity', next: 'qty' },
    qty: { q: 'How many pieces?', c: ['1', '2 to 5', '6 to 20', 'More than 20'], key: 'qty', next: 'city' },
    repairWhat: { q: 'Which scale needs service, and what is wrong with it?', c: ['Not switching on', 'Wrong reading', 'Needs calibration', 'Display not working'], key: 'issue', next: 'city' },
    company: { q: 'What is your company name?', key: 'company', next: 'bulkWhat' },
    bulkWhat: { q: 'Which scales, and roughly how many?', key: 'need', next: 'city' },
    question: { q: 'Sure. Type your question below.', key: 'question', next: 'city' },
    city: { q: 'Which city or area should we deliver or come to?', c: ['Bahadurgarh', 'Delhi NCR', 'Rohtak', 'Jammu', 'Rajasthan'], key: 'city', next: 'name' },
    name: { q: 'Last one: your name?', c: ['Skip'], key: 'name', next: 'done' },
  };

  const draft = () => {
    const L = ['Hi Sunstar,'];
    if (/repair|calib/i.test(ans.intent)) L.push(`I need service for my weighing scale. Problem: ${ans.issue}.`);
    else if (/bulk|company/i.test(ans.intent)) L.push(`This is ${ans.company}. We need a bulk quote for: ${ans.need}.`);
    else if (/else/i.test(ans.intent)) L.push(ans.question);
    else {
      L.push('Please share today’s price for:');
      if (ans.model) L.push(`• Model: ${ans.model}`); else if (ans.type && ans.type !== 'Not sure') L.push(`• Type: ${ans.type}`);
      if (ans.capacity) L.push(`• Capacity: ${ans.capacity}`);
      if (ans.qty) L.push(`• Quantity: ${ans.qty}`);
    }
    if (ans.city) L.push(`Location: ${ans.city}`);
    if (ans.name && ans.name !== 'Skip') L.push(`Name: ${ans.name}`);
    return L.join('\n');
  };

  const showDraft = () => {
    say('Here is your message. Edit anything, then send it on WhatsApp.');
    chips.innerHTML = '';
    const li = document.createElement('li');
    li.className = 'bot__draft';
    li.innerHTML = `<label for="bot-draft">Message to Sunstar</label><textarea id="bot-draft">${esc(draft())}</textarea><div class="row"><a class="btn btn--wa" target="_blank" rel="noopener">Send on WhatsApp</a><a class="btn btn--line btn--sm" href="${tel}">Call instead</a><button class="btn btn--line btn--sm" type="button" data-restart>Start again</button></div>`;
    const ta = li.querySelector('textarea');
    const link = li.querySelector('.btn--wa');
    const sync = () => { link.href = `https://wa.me/${wa}?text=${encodeURIComponent(ta.value)}`; };
    ta.addEventListener('input', sync); sync();
    li.querySelector('[data-restart]').addEventListener('click', restart);
    log.append(li); scroll();
    form.hidden = true;
  };

  const ask = (name) => {
    step = name;
    if (name === 'done') { showDraft(); return; }
    const st = steps[name];
    say(typeof st.q === 'function' ? st.q() : st.q);
    setChips(st.c ? (typeof st.c === 'function' ? st.c() : st.c) : []);
    input.value = ''; input.focus({ preventScroll: true });
  };

  function answer(v) {
    v = v.trim();
    if (!v || !step || step === 'done') return;
    say(v, 'me');
    const st = steps[step];
    ans[st.key] = v;
    const nx = typeof st.next === 'function' ? st.next(v) : st.next;
    setTimeout(() => ask(nx), 250);
  }

  function restart() { Object.keys(ans).forEach((k) => delete ans[k]); log.innerHTML = ''; form.hidden = false; ask('intent'); }

  const open = (v) => {
    panel.hidden = !v; launch.setAttribute('aria-expanded', String(v));
    if (v && !started) { started = true; ask('intent'); } else if (v) input.focus({ preventScroll: true });
    if (!v) launch.focus();
  };
  launch.addEventListener('click', () => open(true));
  // "How may I help you?" nudge: shows once per visit after a few seconds, never while the chat is open.
  const nudge = root.querySelector('.bot__nudge');
  const seen = () => { try { return sessionStorage.getItem('ss-nudge') === '1'; } catch (e) { return false; } };
  const markSeen = () => { try { sessionStorage.setItem('ss-nudge', '1'); } catch (e) { /* storage blocked */ } };
  const hideNudge = () => { nudge.hidden = true; markSeen(); };
  if (nudge && !seen()) setTimeout(() => { if (panel.hidden) { nudge.hidden = false; } }, 4000);
  nudge?.querySelector('.bot__nudge-open').addEventListener('click', () => { hideNudge(); open(true); });
  nudge?.querySelector('.bot__nudge-x').addEventListener('click', hideNudge);
  launch.addEventListener('click', () => { if (nudge) hideNudge(); });
  root.querySelector('.bot__close').addEventListener('click', () => open(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) open(false); });
  form.addEventListener('submit', (e) => { e.preventDefault(); answer(input.value); });
})();

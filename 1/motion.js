// Living scroll motion (Standard tier): Lenis + GSAP/ScrollTrigger/SplitText; three.js shards load lazily.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('motion') || !window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  root.classList.add('ready');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = gsap.utils.clamp(0, 1);
  const motion = {
    velocity: 0,
    mobile: matchMedia('(max-width: 768px)').matches,
    fine: matchMedia('(hover: hover) and (pointer: fine)').matches,
  };

  /* ---------- Core: Lenis + shared velocity ---------- */
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -84 } });
  lenis.on('scroll', (e) => { motion.velocity += (e.velocity - motion.velocity) * 0.2; ScrollTrigger.update(); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // E14: --vel only on the fringe headlines (setting it on :root would restyle the whole page every frame)
  const ca = $$('[data-ca]');
  let lastVel = 0;
  gsap.ticker.add(() => {
    motion.velocity *= 0.92;
    const v = Math.min(Math.abs(motion.velocity), 40);
    if (Math.abs(v - lastVel) > 0.05) { lastVel = v; ca.forEach((el) => el.style.setProperty('--vel', v.toFixed(2))); }
  });

  /* ---------- E5: header theme per section (hero handled by its own trigger) ---------- */
  $$('[data-theme]:not(.hero)').forEach((sec) => ScrollTrigger.create({
    trigger: sec, start: 'top 40px', end: 'bottom 40px',
    onToggle: (s) => { if (s.isActive) root.dataset.theme = sec.dataset.theme; },
  }));

  /* ---------- Hero: readout, scan → photo, planet wipe, badge ---------- */
  const hero = $('.hero');
  const frame = $('.hero__frame');
  const planet = $('.hero__planet');
  const live = $('[data-readout]');
  const flag = $('.readout__flag');
  const heroView = ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top' });

  const reading = { v: 0 };
  gsap.to(reading, {
    v: 50, duration: 2.2, delay: 0.5, ease: 'power3.out',
    onUpdate() { // small load-cell settle wobble that decays to zero
      const k = this.progress();
      live.textContent = Math.max(0, reading.v + Math.sin(k * 22) * (1 - k) * 0.6 * (k > 0.4)).toFixed(3);
    },
    onComplete() { live.textContent = '50.000'; flag.classList.add('on'); },
  });

  let s = 0;
  let frameH = frame.offsetHeight;
  const inOut = gsap.parseEase('power2.inOut');
  ScrollTrigger.create({
    trigger: hero, start: 'top top', end: 'bottom bottom',
    onRefresh: () => { frameH = frame.offsetHeight; },
    onUpdate(self) {
      const p = self.progress;
      s = clamp(p / 0.55);
      const pl = inOut(clamp((p - 0.6) / 0.4));
      frame.style.setProperty('--s', s.toFixed(4));
      frame.style.setProperty('--pl', pl.toFixed(4));
      planet.style.transform = `translateY(${(-pl * frameH * 1.2).toFixed(1)}px)`;
      root.dataset.theme = pl > 0.55 ? 'light' : 'dark';
    },
  });

  const badge = $('[data-scroll-badge]');
  const spin = gsap.to(badge, { rotation: 360, duration: 18, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  gsap.ticker.add(() => {
    if (!heroView.isActive) return spin.pause();
    spin.resume().timeScale(1 + Math.abs(motion.velocity) * 0.05);
  });

  initScan($('.hero__scan'), () => s, () => heroView.isActive);

  /* ---------- E1: line-mask reveals ---------- */
  $$('[data-reveal="lines"]').forEach((el) => SplitText.create(el, {
    type: 'lines', mask: 'lines', autoSplit: true,
    onSplit: (sp) => gsap.from(sp.lines, {
      yPercent: 110, duration: 1.1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    }),
  }));

  /* ---------- E6: uneven stagger rise ---------- */
  const uneven = [0, 0.2, 0.07, 0.3];
  $$('[data-stagger]').forEach((list) => gsap.from(list.children, {
    y: (i, el) => 70 + (+el.dataset.offset || i) * 16, rotate: 2, opacity: 0,
    duration: 1.1, ease: 'expo.out', delay: (i) => uneven[i % 4],
    scrollTrigger: { trigger: list, start: 'top 80%', once: true },
  }));

  /* ---------- E7: image clip + zoom (scrubbed) ---------- */
  $$('[data-media="clip"]').forEach((m) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 95%', end: 'top 45%', scrub: true } });
    tl.fromTo(m, { clipPath: 'inset(100% 0% 0% 0% round 16px)' }, { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none' }, 0)
      .fromTo(m.querySelector('img'), { scale: 1.15 }, { scale: 1, ease: 'none' }, 0);
  });

  /* ---------- E15: count-ups (values come from site.config via the HTML) ---------- */
  $$('[data-count]').forEach((el) => {
    const to = +el.dataset.count;
    const dec = +el.dataset.decimals;
    const o = { v: 0 };
    el.textContent = (0).toFixed(dec);
    gsap.to(o, {
      v: to, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => { el.textContent = o.v.toFixed(dec); },
      onComplete: () => { el.textContent = to.toFixed(dec); },
    });
  });

  /* ---------- Process: sticky pin, steps fill in sequence ---------- */
  const steps = $$('.step');
  ScrollTrigger.create({
    trigger: '.process', start: 'top top', end: 'bottom bottom',
    onUpdate(self) {
      const pp = clamp(self.progress * 1.15) * (steps.length - 1); // 0..3
      steps.forEach((st, i) => {
        st.classList.toggle('on', pp >= i - 0.001);
        st.style.setProperty('--lp', clamp(pp - i).toFixed(4));
      });
    },
  });

  /* ---------- E9: active-row list + floating preview ---------- */
  const rows = $$('.row');
  const preview = $('.preview');
  const pimg = preview.querySelector('img');
  let hovering = false;
  const setActive = (row) => {
    rows.forEach((r) => r.classList.toggle('is-active', r === row));
    if (row && pimg.getAttribute('src') !== row.dataset.img) pimg.src = row.dataset.img;
  };
  rows.forEach((row) => ScrollTrigger.create({
    trigger: row, start: 'top center', end: 'bottom center',
    onToggle: (st) => { if (st.isActive && !hovering) setActive(row); },
  }));
  if (motion.fine) {
    const px = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
    const list = $('[data-active-list]');
    list.addEventListener('pointermove', (e) => { px(e.clientX + 24); py(e.clientY - 150); });
    rows.forEach((row) => row.addEventListener('pointerenter', () => { hovering = true; setActive(row); preview.classList.add('on'); }));
    list.addEventListener('pointerleave', () => { hovering = false; preview.classList.remove('on'); });
  }

  /* ---------- E16: velocity marquee ---------- */
  const track = $('.marquee__track');
  [...track.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); });
  const marqueeView = ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top' });
  let mx = 0;
  let dir = -1;
  gsap.ticker.add((t, dt) => {
    if (!marqueeView.isActive) return;
    const half = track.scrollWidth / 2;
    if (Math.abs(motion.velocity) > 0.5) dir = motion.velocity > 0 ? -1 : 1;
    mx += dir * 45 * (1 + Math.abs(motion.velocity) * 0.05) * (dt / 1000);
    if (mx <= -half) mx += half;
    if (mx > 0) mx -= half;
    track.style.transform = `translate3d(${mx.toFixed(2)}px,0,0)`;
  });

  /* ---------- E16: card tilt + glare (desktop only) ---------- */
  if (motion.fine) {
    $$('[data-tilt]').forEach((card) => {
      gsap.set(card, { transformPerspective: 800 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        ry((x - 0.5) * 12); rx((0.5 - y) * 12);
        card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- E10/E12: three.js shards, loaded on first interaction (keeps it out of LCP/TBT) ---------- */
  const evs = ['pointerdown', 'wheel', 'touchstart', 'keydown'];
  const startShards = () => {
    evs.forEach((ev) => removeEventListener(ev, startShards));
    import('./shards.js').then((m) => m.default({ gsap, ScrollTrigger, motion })).catch(() => {});
  };
  evs.forEach((ev) => addEventListener(ev, startShards, { passive: true }));

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());

  /* ---------- Hero point-cloud scan (2D canvas, no three.js needed) ---------- */
  function initScan(cv, getS, isVisible) {
    const ctx = cv.getContext('2d');
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const P = []; // x, y, z, kind (0 = steel, 1 = red display)
    const add = (x, y, z, k = 0) => P.push(x, y, z, k);
    const line = (a, b, step) => {
      const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / step));
      for (let i = 0; i <= n; i++) { const t = i / n; add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); }
    };
    const box = (cx, cy, cz, w, h, d, step, fill) => {
      const X = [cx - w / 2, cx + w / 2], Y = [cy - h / 2, cy + h / 2], Z = [cz - d / 2, cz + d / 2];
      for (const y of Y) for (const z of Z) line([X[0], y, z], [X[1], y, z], step);
      for (const x of X) for (const z of Z) line([x, Y[0], z], [x, Y[1], z], step);
      for (const x of X) for (const y of Y) line([x, y, Z[0]], [x, y, Z[1]], step);
      for (let i = 0; i < fill; i++) {
        const f = (rnd() * 6) | 0, u = rnd() - 0.5, v = rnd() - 0.5, sg = f < 3 ? -0.5 : 0.5;
        if (f % 3 === 0) add(cx + sg * w, cy + u * h, cz + v * d);
        else if (f % 3 === 1) add(cx + u * w, cy + sg * h, cz + v * d);
        else add(cx + u * w, cy + v * h, cz + sg * d);
      }
    };
    // modelled on assets/products/hero-platform.webp: square chequered platform, U-handle, column, indicator head
    box(0, 0.06, 0, 1.5, 0.12, 1.5, 0.025, 380);
    box(0, 0.135, 0, 1.44, 0.03, 1.44, 0.03, 0);
    for (let g = -1.3; g <= 1.3; g += 0.16) { // diamond tread plate: two diagonal hatches, clipped to the plate
      const seg = (sx) => {
        for (let t = -0.72; t <= 0.72; t += 0.03) { const x = g + sx * t; if (Math.abs(x) <= 0.72) add(x, 0.152, t); } };
      seg(1); seg(-1);
    }
    for (const fx of [-0.66, 0.66]) for (const fz of [-0.66, 0.66]) box(fx, -0.03, fz, 0.08, 0.06, 0.08, 0.02, 0);
    // U-handle: two posts, rounded corners, top bar
    const hz = -0.62, hy0 = 0.15, hy1 = 1.05, hx = 0.55, rr = 0.12;
    for (const sx of [-1, 1]) {
      line([sx * hx, hy0, hz], [sx * hx, hy1 - rr, hz], 0.018);
      for (let a = 0; a <= Math.PI / 2; a += 0.12) add(sx * (hx - rr + Math.cos(a) * rr), hy1 - rr + Math.sin(a) * rr, hz);
    }
    line([-hx + rr, hy1, hz], [hx - rr, hy1, hz], 0.018);
    box(0, 1.0, -0.68, 0.07, 1.7, 0.07, 0.02, 40); // column
    box(0, 2.0, -0.68, 0.52, 0.3, 0.12, 0.018, 180); // indicator head
    for (let x = -0.2; x <= 0.02; x += 0.016) for (let y = 2.02; y <= 2.1; y += 0.016) add(x, y, -0.615, 1); // red display
    for (let x = 0.08; x <= 0.21; x += 0.043) add(x, 1.93, -0.615); // keypad
    const N = P.length / 4;
    const stride = motion.mobile ? 2 : 1;

    let w = 0, h = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, motion.mobile ? 1.5 : 2);
      w = cv.width = Math.round(cv.clientWidth * dpr);
      h = cv.height = Math.round(cv.clientHeight * dpr);
    };
    new ResizeObserver(size).observe(cv);
    size();

    let last = 0;
    gsap.ticker.add((time) => {
      const sv = getS();
      if (!isVisible() || sv >= 0.999 || document.hidden || !w) return;
      if (motion.mobile && time - last < 1 / 30) return; // 30fps on phones
      last = time;
      ctx.clearRect(0, 0, w, h);
      // sways at 3/4 view, then settles to the photo's front-on angle as it solidifies
      const ay = (-0.62 + Math.sin(time * 0.35) * 0.38) * (1 - sv);
      const ax = 0.34 + 0.12 * sv;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      const scale = Math.min(w * 1.1, h) * 0.29;
      const dist = 4.2;
      const scanY = ((time * 0.28) % 1.3) * 2.0 - 0.15; // sweep band in model units
      const ps = 1.3 * dpr;
      for (let i = 0; i < N; i += stride) {
        const o = i * 4;
        const x = P[o], y = P[o + 1] - 1.05, z = P[o + 2];
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        const k = dist / (dist + z2);
        const near = Math.max(0, 1 - Math.abs(P[o + 1] - scanY) / 0.07);
        ctx.globalAlpha = Math.min(1, 0.22 + 0.4 * (1 - (z2 + 1.2) / 2.4) + near * 0.7);
        ctx.fillStyle = P[o + 3] ? '#D7141A' : near > 0.2 ? '#FFFFFF' : '#C9CBCC';
        ctx.fillRect(w / 2 + x1 * k * scale - ps / 2, h * 0.53 - y1 * k * scale - ps / 2, ps, ps);
      }
      ctx.globalAlpha = 1;
    });
  }
})();

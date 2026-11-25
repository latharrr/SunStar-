// E10 + E12: steel/red shard layer behind content. Loaded by motion.js on first interaction.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export default function initShards({ gsap, ScrollTrigger, motion }) {
  const canvas = document.querySelector('.shards');
  const count = motion.mobile ? 16 : 36;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !motion.mobile, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, motion.mobile ? 1 : 1.5));
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 200);
  camera.position.z = 22;
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const tri = new THREE.Shape();
  tri.moveTo(0, 1); tri.lineTo(-0.87, -0.5); tri.lineTo(0.87, -0.5); tri.closePath();
  const geo = new THREE.ExtrudeGeometry(tri, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  geo.center();
  // brushed steel (like a scale pan); a few red shards for the brand accent
  const mat = motion.mobile
    ? new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.85, roughness: 0.3 })
    : new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0.9, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  const steel = new THREE.Color('#B9BCBE'), red = new THREE.Color('#D7141A');
  for (let i = 0; i < count; i++) mesh.setColorAt(i, i % 7 === 3 ? red : steel);
  scene.add(mesh, new THREE.AmbientLight('#ffffff', 0.6));

  // formations are laid out in view-space units so they sit at the edges on any aspect ratio
  // shortcut: computed once at load; a big resize keeps the old layout until reload.
  const halfH = Math.tan(THREE.MathUtils.degToRad(17.5)) * 22;
  const halfW = halfH * camera.aspect;
  const V = THREE.Vector3, E = THREE.Euler, R = THREE.MathUtils.randFloatSpread;
  const formations = {
    cloud: (n) => Array.from({ length: n }, (_, i) => ({
      p: new V((i % 2 ? 1 : -1) * (halfW * 0.62 + Math.random() * halfW * 0.45), R(halfH * 1.8), R(8) - 3),
      r: new E(R(6), R(6), R(6)),
    })),
    row: (n) => Array.from({ length: n }, (_, i) => ({
      p: new V(-halfW * 1.05 + (i / (n - 1)) * halfW * 2.1, -halfH * 0.78 + Math.sin(i * 0.6) * 0.3, -2 - (i % 3)),
      r: new E(0, 0.4, Math.PI), s: 0.7,
    })),
    pinwheel: (n) => Array.from({ length: n }, (_, i) => (i < 4
      ? { p: new V(Math.cos(i * Math.PI / 2) * 0.8, Math.sin(i * Math.PI / 2) * 0.8, 0), r: new E(0, 0, i * Math.PI / 2 - Math.PI / 6), s: motion.mobile ? 0.6 : 0.95 }
      : { p: new V(R(30), R(20), -40), r: new E(), s: 0 })),
    hidden: (n) => Array.from({ length: n }, () => ({ p: new V(R(30), R(20), -40), r: new E(), s: 0 })),
  };
  const cache = {};
  const get = (k) => (cache[k] ||= formations[k](count));

  const seeds = Array.from({ length: count }, () => ({ phase: Math.random() * 6.28, speed: 0.3 + Math.random() * 0.7, scale: 0.35 + Math.random() * 0.5 }));
  const state = { formA: get('hidden'), formB: null, key: 'hidden', mix: 1, spin: 0, mouse: { x: 0, y: 0 }, pin: 0 };
  const dummy = new THREE.Object3D();
  const pinCenter = new V(halfW * (motion.mobile ? 0.55 : 0.62), halfH * (motion.mobile ? 0.74 : 0.6), 0);

  addEventListener('pointermove', (e) => { state.mouse.x = e.clientX / innerWidth - 0.5; state.mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); });

  const goTo = (key) => {
    if (key === state.key) return;
    state.formA = state.formB || state.formA;
    state.formB = get(key);
    state.key = key;
    state.mix = 0;
    gsap.to(state, { mix: 1, duration: 1.6, ease: 'expo.inOut', overwrite: true });
  };
  document.querySelectorAll('[data-shards]').forEach((sec) => {
    const st = ScrollTrigger.create({ trigger: sec, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => s.isActive && goTo(sec.dataset.shards) });
    if (st.isActive) goTo(sec.dataset.shards);
  });
  ScrollTrigger.create({ trigger: '.process', start: 'top top', end: 'bottom bottom', onUpdate: (s) => { state.pin = s.progress * Math.PI * 2; } });

  const p = new V();
  let idle = false;
  gsap.ticker.add((time) => {
    if (document.hidden) return;
    const settledHidden = state.key === 'hidden' && state.mix >= 1;
    if (settledHidden && idle) return; // nothing on screen: skip GPU work
    idle = settledHidden;
    state.spin += motion.velocity * 0.0004;
    const pinMix = state.key === 'pinwheel' ? state.mix : 0;
    const cosP = Math.cos(state.pin), sinP = Math.sin(state.pin);
    const A = state.formA, B = state.formB || state.formA;
    for (let i = 0; i < count; i++) {
      const a = A[i], b = B[i], s = seeds[i];
      p.lerpVectors(a.p, b.p, state.mix);
      if (pinMix && i < 4) { // pinwheel blades turn with the process scroll
        const x = p.x * cosP - p.y * sinP, y = p.x * sinP + p.y * cosP;
        p.set(x + pinCenter.x * pinMix, y + pinCenter.y * pinMix, p.z);
      }
      dummy.position.copy(p);
      dummy.position.y += Math.sin(time * s.speed + s.phase) * 0.15;
      dummy.rotation.set(
        THREE.MathUtils.lerp(a.r.x, b.r.x, state.mix) + time * 0.1 * s.speed * (1 - pinMix) + state.spin,
        THREE.MathUtils.lerp(a.r.y, b.r.y, state.mix) + time * 0.15 * s.speed * (1 - pinMix),
        THREE.MathUtils.lerp(a.r.z, b.r.z, state.mix) + (i < 4 ? state.pin * pinMix : 0));
      dummy.scale.setScalar(THREE.MathUtils.lerp(a.s ?? s.scale, b.s ?? s.scale, state.mix));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    camera.position.x += (state.mouse.x * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (-state.mouse.y * 0.6 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  });
}

(() => {
  'use strict';

  const canvas = document.getElementById('bg-3d');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  document.body.classList.add('bg3d');

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    spawnParts();
    spawnKeys();
    spawnLogos();
  }
  window.addEventListener('resize', resize);

  // ---------- degradado animado ----------
  const PALETTES = [
    ['#081c5e', '#0a6cff', '#5f3dc4'],
    ['#001d3d', '#0a6cff', '#0096c7'],
    ['#1d1040', '#6719a8', '#d6336c'],
    ['#3d0e2c', '#9d2c56', '#ff6b2d'],
    ['#052b2c', '#0a6c6a', '#12c2a0'],
    ['#0b2742', '#0a6cff', '#1455c4'],
  ].map((p) => p.map(hexRgb));

  const CYCLE = 8000;
  const TRANS = 2800;

  function hexRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function rgbStr(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }

  // ---------- partículas ----------
  const PARTS = [];
  function spawnParts() {
    PARTS.length = 0;
    const n = Math.min(150, Math.round((W * H) / 7000));
    for (let i = 0; i < n; i++) {
      PARTS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(0.05 + Math.random() * 0.35),
        base: 0.06 + Math.random() * 0.3,
        ph: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.4,
      });
    }
  }

  // ---------- teclas flotantes ----------
  const KEYS = [];
  const KEY_GLYPHS = ['⌘', '⇧', '⌥', '⌃', '⇥', '⌫', '⏎', '␣', '←', '→', '↑', '↓'];
  function spawnKeys() {
    KEYS.length = 0;
    const n = 9;
    for (let i = 0; i < n; i++) {
      KEYS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        w: 52 + Math.random() * 84,
        h: 36 + Math.random() * 30,
        rot: (Math.random() - 0.5) * 0.6,
        vr: (Math.random() - 0.5) * 0.002,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.06 + Math.random() * 0.16),
        a: 0.08 + Math.random() * 0.16,
        label: KEY_GLYPHS[i % KEY_GLYPHS.length],
      });
    }
  }

  // ---------- logos de los programas (SVG originales) ----------
  const LOGO_CACHE = new Map();
  function logoImage(id) {
    if (LOGO_CACHE.has(id)) return LOGO_CACHE.get(id);
    const L = window.SPARK_LOGOS && window.SPARK_LOGOS[id];
    if (!L) { LOGO_CACHE.set(id, null); return null; }
    const g = L.st
      ? '<g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">' + L.html + '</g>'
      : '<g fill="#fff">' + L.html + '</g>';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + L.vb + '">' + g + '</svg>';
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    const vbp = L.vb.split(/\s+/);
    img._ar = parseFloat(vbp[3]) / parseFloat(vbp[2]);
    LOGO_CACHE.set(id, img);
    return img;
  }

  let LOGOS = [];
  function spawnLogos() {
    const brands = window.SPARK_BRANDS;
    if (!brands) return;
    LOGOS.length = 0;
    const ids = Object.keys(brands);
    const n = Math.min(12, ids.length);
    for (let i = 0; i < n; i++) {
      const b = brands[ids[i]];
      LOGOS.push({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 34 + Math.random() * 30,
        rot: (Math.random() - 0.5) * 0.5,
        vr: (Math.random() - 0.5) * 0.002,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.05 + Math.random() * 0.14),
        a: 0.1 + Math.random() * 0.16,
        c: b.c,
        l: b.l,
        img: logoImage(ids[i]),
      });
    }
  }

  // ---------- flash (confetti) ----------
  let flashA = 0;
  function flash() { flashA = 1; }
  window.BG3D = { flash, counts: () => ({ parts: PARTS.length, keys: KEYS.length, logos: LOGOS.length }) };

  let mx = W / 2, my = H / 3;
  window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function wrap(e) {
    if (e.y < -100) { e.y = H + 100; e.x = Math.random() * W; }
    if (e.x < -100) e.x = W + 100;
    else if (e.x > W + 100) e.x = -100;
  }
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function frame(t) {
    if (!LOGOS.length && window.SPARK_BRANDS) spawnLogos();
    if (!reduce) {
      for (const p of PARTS) {
        p.x += p.vx; p.y += p.vy; wrap(p);
      }
      for (const k of KEYS) {
        k.x += k.vx; k.y += k.vy; k.rot += k.vr; wrap(k);
      }
      for (const l of LOGOS) {
        l.x += l.vx; l.y += l.vy; l.rot += l.vr; wrap(l);
      }
      if (flashA > 0.001) flashA *= 0.9;
    }

    // degradado
    const idx = Math.floor(t / CYCLE) % PALETTES.length;
    const next = (idx + 1) % PALETTES.length;
    const local = (t % CYCLE) / CYCLE;
    let mix = 0;
    const hold = 1 - TRANS / CYCLE;
    if (local > hold) mix = (local - hold) / (TRANS / CYCLE);
    mix = smooth(mix);
    const A = PALETTES[idx], B = PALETTES[next];
    const c0 = [lerp(A[0][0], B[0][0], mix), lerp(A[0][1], B[0][1], mix), lerp(A[0][2], B[0][2], mix)];
    const c1 = [lerp(A[1][0], B[1][0], mix), lerp(A[1][1], B[1][1], mix), lerp(A[1][2], B[1][2], mix)];
    const c2 = [lerp(A[2][0], B[2][0], mix), lerp(A[2][1], B[2][1], mix), lerp(A[2][2], B[2][2], mix)];
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, rgbStr(c0));
    g.addColorStop(0.55, rgbStr(c1));
    g.addColorStop(1, rgbStr(c2));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // halo sutil junto al puntero
    const gl = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(W, H) * 0.55);
    gl.addColorStop(0, 'rgba(255,255,255,0.10)');
    gl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl;
    ctx.fillRect(0, 0, W, H);

    // partículas
    ctx.fillStyle = '#ffffff';
    for (const p of PARTS) {
      const tw = 0.6 + 0.4 * Math.sin(t / 1000 * p.sp + p.ph);
      ctx.globalAlpha = p.base * tw;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fill();
    }

    // teclas flotantes
    for (const k of KEYS) {
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.rotate(k.rot);
      ctx.globalAlpha = k.a;
      ctx.fillStyle = '#ffffff';
      rr(-k.w / 2, -k.h / 2, k.w, k.h, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = Math.min(k.a * 2.4, 0.55);
      ctx.fillStyle = '#0a0a0c';
      ctx.font = '800 18px Nunito, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(k.label, 0, 1);
      ctx.restore();
    }

    // logos de los programas (SVG originales)
    for (const l of LOGOS) {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = l.a;
      ctx.fillStyle = l.c;
      const s = l.s;
      rr(-s / 2, -s / 2, s, s, s * 0.28);
      ctx.fill();
      ctx.globalAlpha = Math.min(l.a * 2.4, 0.7);
      if (l.img && l.img.naturalWidth > 0) {
        const max = s * 0.55;
        let w = max;
        let h = w / (l.img._ar || 1);
        if (h > max) { h = max; w = h * (l.img._ar || 1); }
        ctx.drawImage(l.img, -w / 2, -h / 2, w, h);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 ' + Math.round(s * 0.5) + 'px Nunito, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(l.l, 0, Math.round(s * 0.03));
      }
      ctx.restore();
    }

    // flash de confetti
    if (flashA > 0.001) {
      ctx.globalAlpha = flashA * 0.28;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 1;

    if (!reduce) requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();

// Teclado Logitech G815 (diseño de Staniel Petrov) integrado en SPARK.
// Fuente del diseño: https://www.linkedin.com/in/staniel-petrov/
window.SPARK_BOARD = (() => {
  'use strict';

  const K = window.SPARK_KEYS;
  const BOARD = document.getElementById('kb-board');
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const COLOR_VARIANTS = ['#0a6cff', '#34edff', '#00ff98', '#98ff00', '#ffe500', '#ff8100', '#ff0000', '#ff0079', '#c900ff', '#7700ff'];
  const KEY_SOUNDS = ['tactile', 'linear', 'clicky'];

  const AUDIO = {};
  for (const name of KEY_SOUNDS) {
    const el = document.getElementById(name + 'KeySound');
    if (el) AUDIO[name] = el;
  }

  const state = {
    curPlatform: 'mac',
    colorIndex: 0,
    currentKeySound: 'tactile',
    brightness: 3,
    discoTimer: null,
    savedColor: '#0a6cff',
    keyHandler: null,
    flashTimers: new Map(),
  };

  const keyEls = new Map();   // token -> [li]
  const keyById = new Map();  // data-key (lowercase event.code) -> li

  function indexKeys() {
    keyEls.clear();
    keyById.clear();
    if (!BOARD) return;
    for (const li of $$('li[data-tok]', BOARD)) {
      const tok = li.dataset.tok;
      if (!keyEls.has(tok)) keyEls.set(tok, []);
      keyEls.get(tok).push(li);
    }
    for (const li of $$('li[data-key]', BOARD)) {
      keyById.set(li.dataset.key.toLowerCase(), li);
    }
  }

  // resuelve tokens a teclas físicas del G815 (data-tok)
  function resolveTokens(tokens) {
    const out = [];
    for (const raw of tokens || []) {
      const norm = String(raw).toLowerCase();
      if (norm === 'home') { out.push('home'); continue; }
      if (norm === 'end') { out.push('end'); continue; }
      const res = K.tokenToKeys(state.curPlatform, norm);
      if (res === 'mouse') continue; // el G815 no tiene ratón
      for (const tk of res) out.push(tk);
    }
    return out;
  }

  // ---------------- API SPARK ----------------

  function build(platform) {
    state.curPlatform = platform || 'mac';
    indexKeys();
    applyPlatformLabels(state.curPlatform);
  }

  // adapta el G815 (teclado Windows) a la plataforma elegida:
  // en macOS las modificadoras pasan a ⌃ ⌥ ⌘ y el logo Windows a ⌘
  const META_BOX = '<div class="windows-key_box"><span></span><span></span><span></span><span></span></div>';

  function applyPlatformLabels(platform) {
    const mac = platform === 'mac';
    const text = (code, win, macLabel) => {
      const li = keyById.get(code.toLowerCase());
      if (li) li.textContent = mac ? macLabel : win;
    };
    text('ControlLeft', 'CTRL', '⌃');
    text('ControlRight', 'CTRL', '⌃');
    text('AltLeft', 'ALT', '⌥');
    text('AltRight', 'ALT GR', '⌥');
    for (const code of ['MetaLeft', 'MetaRight']) {
      const li = keyById.get(code.toLowerCase());
      if (!li) continue;
      li.classList.toggle('mac', mac);
      li.innerHTML = mac ? '<span class="cmd-glyph">⌘</span>' : META_BOX;
    }
  }

  function light(tokens) {
    for (const els of keyEls.values()) for (const el of els) el.classList.remove('lit');
    if (!tokens) return;
    for (const tk of resolveTokens(tokens)) {
      for (const el of keyEls.get(tk) || []) el.classList.add('lit');
    }
  }

  function press(tokens) {
    if (!tokens) return;
    for (const tk of resolveTokens(tokens)) {
      for (const el of keyEls.get(tk) || []) flash(el);
    }
  }

  function setKeyHandler(fn) {
    state.keyHandler = fn;
  }

  // ---------------- flash ----------------

  function flash(el) {
    el.classList.add('click');
    if (state.flashTimers.has(el)) clearTimeout(state.flashTimers.get(el));
    state.flashTimers.set(el, setTimeout(() => {
      el.classList.remove('click');
      state.flashTimers.delete(el);
    }, 130));
  }

  // ---------------- sonido ----------------

  function playSound() {
    const a = AUDIO[state.currentKeySound];
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch (e) { /* sin sonido */ }
  }

  function setKeySound(name) {
    if (!KEY_SOUNDS.includes(name)) return;
    state.currentKeySound = name;
    for (const el of $$('.key-sound', BOARD)) {
      el.classList.toggle('active', el.dataset.keySound === name);
    }
    playSound();
  }

  // ---------------- color, modo juego, disco, luces ----------------

  function cycleColor() {
    state.colorIndex = (state.colorIndex + 1) % COLOR_VARIANTS.length;
    state.savedColor = COLOR_VARIANTS[state.colorIndex];
    document.documentElement.style.setProperty('--key-text-highlight', state.savedColor);
    try { localStorage.setItem('spark-key-color', state.savedColor); } catch (e) { /* sin almacenamiento */ }
  }

  function toggleWhiteMode() {
    const wrapper = $('.keyboard-wrapper', BOARD);
    if (!wrapper) return;
    wrapper.classList.toggle('white-mode');
  }

  function toggleGameMode() {
    const logo = $('.logitech-logo', BOARD);
    const btn = $('.round-key.game', BOARD);
    const on = logo && logo.classList.toggle('active');
    if (btn) btn.classList.toggle('active', !!on);
  }

  function setBrightness(level) {
    state.brightness = ((level % 4) + 4) % 4;
    const wrapper = $('.keyboard-wrapper', BOARD);
    if (wrapper) {
      wrapper.style.filter = state.brightness === 3 ? '' : `brightness(${0.25 + state.brightness * 0.25})`;
    }
    const btn = $('.round-key.brightness', BOARD);
    if (btn) btn.classList.toggle('active', state.brightness > 0);
  }

  function toggleDisco() {
    const logo = $('.logitech-logo', BOARD);
    if (state.discoTimer) {
      clearInterval(state.discoTimer);
      state.discoTimer = null;
      if (logo) logo.classList.remove('active');
      document.documentElement.style.setProperty('--key-text-highlight', state.savedColor);
      return;
    }
    if (logo) logo.classList.add('active');
    state.discoTimer = setInterval(() => {
      state.colorIndex = (state.colorIndex + 1) % COLOR_VARIANTS.length;
      document.documentElement.style.setProperty('--key-text-highlight', COLOR_VARIANTS[state.colorIndex]);
    }, 150);
  }

  function toggleInfoLight(name) {
    const light = $('.' + name + '-light', BOARD);
    if (light) light.classList.toggle('active');
  }

  // ---------------- volumen ----------------

  function setVolume(v) {
    v = Math.max(0, Math.min(1, v));
    for (const name of KEY_SOUNDS) {
      const a = AUDIO[name];
      if (a) a.volume = v;
    }
  }

  function initVolumeWheel() {
    const box = $('.volume-wheel_box', BOARD);
    if (!box) return;
    let dragging = false, lastY = 0, lastV = 0.5;
    box.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const r = box.getBoundingClientRect();
      dragging = true;
      lastY = e.clientY;
      lastV = 1 - (e.clientY - r.top) / r.height;
      setVolume(lastV);
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      lastV = Math.max(0, Math.min(1, lastV + (lastY - e.clientY) * 2));
      lastY = e.clientY;
      setVolume(lastV);
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    box.addEventListener('wheel', (e) => {
      e.preventDefault();
      const cur = AUDIO[state.currentKeySound] ? AUDIO[state.currentKeySound].volume : 0.5;
      setVolume(cur + (e.deltaY < 0 ? 0.05 : -0.05));
    });
  }

  // ---------------- tipeo físico ----------------

  window.addEventListener('keydown', (ev) => {
    if (ev.code === 'F4') toggleDisco();
    const li = keyById.get(ev.code.toLowerCase());
    if (!li) return;
    flash(li);
    playSound();
    if (ev.code === 'NumLock') toggleInfoLight('numlock');
    if (ev.code === 'CapsLock') toggleInfoLight('capslock');
  });

  // ---------------- clic ----------------

  BOARD.addEventListener('click', (ev) => {
    const sound = ev.target.closest('.key-sound');
    if (sound) { setKeySound(sound.dataset.keySound); return; }

    const li = ev.target.closest('.keyboard-wrapper li');
    if (!li || li.classList.contains('info-light')) return;

    flash(li);

    if (li.closest('.media-keys')) { playSound(); return; }

    if (li.classList.contains('round-key')) {
      playSound();
      if (li.classList.contains('game')) toggleGameMode();
      else if (li.classList.contains('brightness')) setBrightness(state.brightness - 1);
      else if (li.classList.contains('memory')) toggleWhiteMode();
      else cycleColor();
      return;
    }

    if (li.classList.contains('numlock')) { playSound(); toggleInfoLight('numlock'); return; }

    if (li.dataset.tok) {
      playSound();
      if (li.classList.contains('caps-key')) toggleInfoLight('capslock');
      if (state.keyHandler) state.keyHandler(li.dataset.tok, li);
    }
  });

  // ---------------- init ----------------

  indexKeys();
  initVolumeWheel();

  // restaura el color elegido con M1-M3 entre recargas
  try {
    const c = localStorage.getItem('spark-key-color');
    if (c && /^#[0-9a-f]{6}$/i.test(c)) {
      state.savedColor = c;
      state.colorIndex = Math.max(0, COLOR_VARIANTS.indexOf(c));
      document.documentElement.style.setProperty('--key-text-highlight', c);
    }
  } catch (e) { /* sin almacenamiento */ }

  return { build, light, press, setKeyHandler };
})();

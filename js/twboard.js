// Teclado "Pure CSS" de ManzDev/twitch-keyboard integrado en SPARK.
// Fuente: https://github.com/ManzDev/twitch-keyboard
window.SPARK_BOARD = (() => {
  'use strict';

  const K = window.SPARK_KEYS;
  const CONTAINER = document.getElementById('kb-board');
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);

  const SOUNDS = (() => {
    try {
      return ['snd/key1.mp3', 'snd/key2.mp3'].map((s) => new Audio(s));
    } catch (e) {
      return [];
    }
  })();

  let curPlatform = 'mac';
  const keyEls = new Map();  // token(lower) -> [element]
  const keyById = new Map(); // id (ev.code en minúsculas) -> element

  const MOD_LABEL = {
    mac: { meta: '⌘', alt: '⌥', ctrl: '⌃', shift: '⇧', fn: 'FN' },
    win: { meta: '⊞', alt: 'alt', ctrl: 'ctrl', shift: 'shift', fn: 'fn' },
  };

  function mkKey(cls, id, tok, main) {
    const d = document.createElement('div');
    d.className = 'key' + (cls ? ' ' + cls : '');
    if (id) {
      d.id = id;
      keyById.set(id, d);
    }
    if (tok) d.dataset.tok = tok;
    if (main !== undefined) d.dataset.key = main;
    return d;
  }

  function mkHole(cls, children) {
    const h = document.createElement('div');
    h.className = 'hole' + (cls ? ' ' + cls : '');
    for (const c of children) h.appendChild(c);
    return h;
  }

  function spanSpecial(ch) {
    const s = document.createElement('span');
    s.className = 'special';
    s.textContent = ch;
    return s;
  }

  // tecla normal con símbolo desplazado (span.special, arriba-izquierda)
  function norm(id, tok, main, shifted) {
    const d = mkKey('normal-key', id, tok, main);
    if (shifted) d.appendChild(spanSpecial(shifted));
    return d;
  }

  // ---------------- construcción ----------------

  function build(platform) {
    curPlatform = platform;
    if (!CONTAINER) return;
    CONTAINER.innerHTML = '';
    keyEls.clear();
    keyById.clear();

    const kb = document.createElement('div');
    kb.className = 'keyboard';

    // ---- main-keys: fila F + bloque alfanumérico ----
    const main = document.createElement('div');
    main.className = 'main-keys';

    const fnRow = document.createElement('div');
    fnRow.className = 'function-keys';
    fnRow.appendChild(mkHole('', [mkKey('function-key', 'escape', 'esc', 'esc')]));
    fnRow.appendChild(mkHole('', [mkKey('function-key', 'f1', 'f1', 'f1'), mkKey('function-key', 'f2', 'f2', 'f2'), mkKey('function-key', 'f3', 'f3', 'f3')]));
    fnRow.appendChild(mkHole('', [mkKey('function-key', 'f4', 'f4', 'f4'), mkKey('function-key', 'f5', 'f5', 'f5'), mkKey('function-key', 'f6', 'f6', 'f6')]));
    fnRow.appendChild(mkHole('', [mkKey('function-key', 'f7', 'f7', 'f7'), mkKey('function-key', 'f8', 'f8', 'f8'), mkKey('function-key', 'f9', 'f9', 'f9')]));
    fnRow.appendChild(mkHole('', [mkKey('function-key', 'f10', 'f10', 'f10'), mkKey('function-key', 'f11', 'f11', 'f11'), mkKey('function-key', 'f12', 'f12', 'f12')]));
    main.appendChild(fnRow);

    const alpha = document.createElement('div');
    alpha.className = 'alpha-keys';
    alpha.appendChild(mkHole('wrap', [
      norm('backquote', '`', '`', '~'),
      norm('digit1', '1', '1', '!'),
      norm('digit2', '2', '2', '@'),
      norm('digit3', '3', '3', '#'),
      norm('digit4', '4', '4', '$'),
      norm('digit5', '5', '5', '%'),
      norm('digit6', '6', '6', '^'),
      norm('digit7', '7', '7', '&'),
      norm('digit8', '8', '8', '*'),
      norm('digit9', '9', '9', '('),
      norm('digit0', '0', '0', ')'),
      norm('minus', '-', '-', '_'),
      norm('equal', '=', '=', '+'),
      mkKey('backspace-key', 'backspace', 'backspace', 'backspace'),
      mkKey('ctrl-key', 'tab', 'tab', 'tab'),
      norm('keyq', 'q', 'q'),
      norm('keyw', 'w', 'w'),
      norm('keye', 'e', 'e'),
      norm('keyr', 'r', 'r'),
      norm('keyt', 't', 't'),
      norm('keyy', 'y', 'y'),
      norm('keyu', 'u', 'u'),
      norm('keyi', 'i', 'i'),
      norm('keyo', 'o', 'o'),
      norm('keyp', 'p', 'p'),
      norm('bracketleft', '[', '[', '{'),
      norm('bracketright', ']', ']', '}'),
      norm('backslash', '\\', '\\', '|'),
      mkKey('enter-key', 'capslock', 'capslock', 'caps lock'),
      norm('keya', 'a', 'a'),
      norm('keys', 's', 's'),
      norm('keyd', 'd', 'd'),
      norm('keyf', 'f', 'f'),
      norm('keyg', 'g', 'g'),
      norm('keyh', 'h', 'h'),
      norm('keyj', 'j', 'j'),
      norm('keyk', 'k', 'k'),
      norm('keyl', 'l', 'l'),
      norm('semicolon', ';', ';', ':'),
      norm('quote', "'", "'", '"'),
      mkKey('enter-key', 'enter', 'enter', 'enter'),
      mkKey('shift-key', 'shiftleft', 'shift', 'shift'),
      norm('keyz', 'z', 'z'),
      norm('keyx', 'x', 'x'),
      norm('keyc', 'c', 'c'),
      norm('keyv', 'v', 'v'),
      norm('keyb', 'b', 'b'),
      norm('keyn', 'n', 'n'),
      norm('keym', 'm', 'm'),
      norm('comma', ',', ',', '<'),
      norm('period', '.', '.', '>'),
      norm('slash', '/', '/', '?'),
      mkKey('shift-key', 'shiftright', 'shift', 'shift'),
      mkKey('ctrl-key', 'controlleft', 'ctrl', 'ctrl'),
      mkKey('ctrl-key', 'metaleft', curPlatform === 'mac' ? 'cmd' : 'win', curPlatform === 'mac' ? '⌘' : '⊞'),
      mkKey('ctrl-key', 'altleft', 'alt', 'alt'),
      mkKey('space-key', 'space', 'space', 'space'),
      mkKey('ctrl-key', 'altright', 'alt', 'alt'),
      mkKey('ctrl-key', '', 'fn', 'fn'),
      mkKey('ctrl-key', 'contextmenu', 'menu', 'menu'),
      mkKey('ctrl-key', 'controlright', 'ctrl', 'ctrl'),
    ]));
    main.appendChild(alpha);
    kb.appendChild(main);

    // ---- control-keys: PrtSc/ScrLck/Pause + nav + cursores ----
    const control = document.createElement('div');
    control.className = 'control-keys';

    const extra = document.createElement('div');
    extra.className = 'extra-keys';
    extra.appendChild(mkHole('', [
      mkKey('function-key', 'printscreen', 'prtsc', 'PrtScr'),
      mkKey('function-key', 'scrolllock', 'scrlk', 'ScrLck'),
      mkKey('function-key', 'pause', 'pause', 'Pause'),
    ]));
    control.appendChild(extra);

    const page = document.createElement('div');
    page.className = 'page-keys';
    page.appendChild(mkHole('wrap', [
      mkKey('normal-key', 'insert', 'insert', 'insert'),
      mkKey('normal-key', 'home', 'home', 'home'),
      mkKey('normal-key', 'pageup', 'pageup', 'page up'),
      mkKey('normal-key', 'delete', 'delete', 'delete'),
      mkKey('normal-key', 'end', 'end', 'end'),
      mkKey('normal-key', 'pagedown', 'pagedown', 'page down'),
    ]));
    control.appendChild(page);

    const cursor = document.createElement('div');
    cursor.className = 'cursor-keys';
    cursor.appendChild(mkHole('', [mkKey('normal-key', 'arrowup', 'up', '↑')]));
    cursor.appendChild(mkHole('wrap', [
      mkKey('normal-key', 'arrowleft', 'left', '←'),
      mkKey('normal-key', 'arrowdown', 'down', '↓'),
      mkKey('normal-key', 'arrowright', 'right', '→'),
    ]));
    control.appendChild(cursor);
    kb.appendChild(control);

    // ---- end-keys: LEDs + numpad ----
    const end = document.createElement('div');
    end.className = 'end-keys';

    const leds = document.createElement('div');
    leds.className = 'led-buttons';
    for (const l of ['numlock', 'capslock', 'scrolllock']) {
      const led = document.createElement('div');
      led.className = 'led ' + l;
      leds.appendChild(led);
    }
    end.appendChild(leds);

    const num = document.createElement('div');
    num.className = 'alphanum-keys';
    num.appendChild(mkHole('wrap', [
      mkKey('normal-key', 'numlock', '', 'num lock'),
      mkKey('normal-key', 'numpaddivide', '', '/'),
      mkKey('normal-key', 'numpadmultiply', '', '*'),
      mkKey('normal-key', 'numpadsubtract', '', '-'),
      mkKey('normal-key', 'numpad7', '', '7'),
      mkKey('normal-key', 'numpad8', '', '8'),
      mkKey('normal-key', 'numpad9', '', '9'),
      mkKey('vertical-key', 'numpadadd', '', '+'),
      mkKey('normal-key', 'numpad4', '', '4'),
      mkKey('normal-key', 'numpad5', '', '5'),
      mkKey('normal-key', 'numpad6', '', '6'),
      mkKey('normal-key', 'numpad1', '', '1'),
      mkKey('normal-key', 'numpad2', '', '2'),
      mkKey('normal-key', 'numpad3', '', '3'),
      mkKey('vertical-key', 'numpadenter', '', 'enter'),
      mkKey('zero-key', 'numpad0', '', '0'),
      mkKey('normal-key', 'numpaddecimal', '', '.'),
    ]));
    end.appendChild(num);
    kb.appendChild(end);

    CONTAINER.appendChild(kb);

    const mw = document.createElement('div');
    mw.className = 'kb-mouse-wrap';
    const m = document.createElement('div');
    m.className = 'kb-mouse';
    m.dataset.tok = 'mouse';
    mw.appendChild(m);
    CONTAINER.appendChild(mw);

    indexTokens();
  }

  function indexTokens() {
    keyEls.clear();
    for (const el of keyById.values()) {
      if (!el.dataset.tok) continue;
      for (const t of el.dataset.tok.trim().split(/\s+/)) {
        if (!keyEls.has(t)) keyEls.set(t, []);
        keyEls.get(t).push(el);
      }
    }
  }

  // ---------------- iluminación y pulsación ----------------

  function light(tokens) {
    for (const els of keyEls.values()) for (const e of els) e.classList.remove('lit');
    const mouse = $('.kb-mouse', CONTAINER);
    if (mouse) mouse.classList.remove('lit');
    if (!tokens) return;
    for (const raw of tokens) {
      const res = K.tokenToKeys(curPlatform, raw);
      if (res === 'mouse') {
        if (mouse) mouse.classList.add('lit');
        continue;
      }
      for (const tk of res) for (const e of keyEls.get(tk) || []) e.classList.add('lit');
    }
  }

  function flash(el) {
    el.classList.add('pressed');
    setTimeout(() => el.classList.remove('pressed'), 220);
  }

  function press(tokens) {
    if (!tokens) return;
    for (const raw of tokens) {
      const res = K.tokenToKeys(curPlatform, raw);
      if (res === 'mouse') {
        const m = $('.kb-mouse', CONTAINER);
        if (m) flash(m);
        continue;
      }
      for (const tk of res) for (const e of keyEls.get(tk) || []) flash(e);
    }
  }

  // ---------------- sonido, LEDs y easter egg (F4) ----------------

  function playSound() {
    if (!SOUNDS.length) return;
    try {
      const a = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => {});
      }
    } catch (e) { /* sin sonido */ }
  }

  addEventListener('keydown', (ev) => {
    const kb = $('.keyboard', CONTAINER);
    if (ev.code === 'F4' && kb) kb.classList.toggle('led');
    const keyDiv = keyById.get(ev.code.toLowerCase());
    if (!keyDiv) return;
    flash(keyDiv);
    playSound();
    if (ev.code === 'NumLock' || ev.code === 'CapsLock' || ev.code === 'ScrollLock') {
      const led = $('.led.' + ev.code.toLowerCase(), CONTAINER);
      if (led) led.classList.toggle('on');
    }
  });

  return { build, light, press };
})();

window.SPARK_KEYS = (() => {
  'use strict';

  const KEY_LABEL = {
    mac: {
      cmd: '⌘', shift: '⇧', alt: '⌥', ctrl: '⌃', fn: 'FN',
      esc: 'ESC', tab: 'TAB', enter: 'ENTER', space: '␣', backspace: '⌫',
      capslock: '⇪', up: '↑', down: '↓', left: '←', right: '→',
      home: 'HOME', end: 'END', win: '⊞',
      insert: 'INS', delete: '⌦', pageup: 'PGUP', pagedown: 'PGDN',
    },
    win: {
      cmd: 'CTRL', shift: 'SHIFT', alt: 'ALT', ctrl: 'CTRL', fn: 'FN',
      esc: 'ESC', tab: 'TAB', enter: 'ENTER', space: 'SPACE', backspace: 'BKSP',
      capslock: 'CAPS', up: '↑', down: '↓', left: '←', right: '→',
      home: 'HOME', end: 'END', win: '⊞',
      insert: 'INS', delete: 'DEL', pageup: 'PGUP', pagedown: 'PGDN',
      prtsc: 'PRTSC', scrlk: 'SCRLK', pause: 'PAUSE',
    },
  };

  const GLYPH = '⌘⇧⌥⌃⇥↵␣⌫⌦⇪↑↓←→';
  const isGlyph = (s) => typeof s === 'string' && s.length === 1 && GLYPH.includes(s);

  const MOUSE_KEYS = new Set(['click', 'right-click', 'double-click', 'drag']);

  function labelFor(platform, tok) {
    const k = String(tok).toLowerCase();
    const map = KEY_LABEL[platform] || KEY_LABEL.mac;
    if (map[k] !== undefined) return map[k];
    if (/^[a-z]$/.test(k)) return k.toUpperCase();
    if (/^f\d+$/.test(k)) return k.toUpperCase();
    return k;
  }

  // en Windows, cmd se teclea/representa como ctrl
  function normTok(platform, tok) {
    const k = String(tok).toLowerCase();
    if (platform === 'win' && k === 'cmd') return 'ctrl';
    return k;
  }

  const FUNC_ROW = [{ k: 'esc', w: 1.5 }, { k: 'F1' }, { k: 'F2' }, { k: 'F3' }, { k: 'F4' }, { k: 'F5' }, { k: 'F6' }, { k: 'F7' }, { k: 'F8' }, { k: 'F9' }, { k: 'F10' }, { k: 'F11' }, { k: 'F12' }];
  const ROW2 = [{ k: '`' }, { k: '1' }, { k: '2' }, { k: '3' }, { k: '4' }, { k: '5' }, { k: '6' }, { k: '7' }, { k: '8' }, { k: '9' }, { k: '0' }, { k: '-' }, { k: '=' }, { k: 'backspace', w: 2 }];
  const ROW3 = [{ k: 'tab', w: 1.5 }, { k: 'q' }, { k: 'w' }, { k: 'e' }, { k: 'r' }, { k: 't' }, { k: 'y' }, { k: 'u' }, { k: 'i' }, { k: 'o' }, { k: 'p' }, { k: '[' }, { k: ']' }, { k: '\\', w: 1.5 }];
  const ROW4 = [{ k: 'capslock', w: 1.75 }, { k: 'a' }, { k: 's' }, { k: 'd' }, { k: 'f' }, { k: 'g' }, { k: 'h' }, { k: 'j' }, { k: 'k' }, { k: 'l' }, { k: ';' }, { k: "'" }, { k: 'enter', w: 2.25 }];
  const ROW5 = [{ k: 'shift', w: 2.25 }, { k: 'z' }, { k: 'x' }, { k: 'c' }, { k: 'v' }, { k: 'b' }, { k: 'n' }, { k: 'm' }, { k: ',' }, { k: '.' }, { k: '/' }, { k: 'shift', w: 2.75 }];
  const NAV_ROW2 = [{ k: 'insert' }, { k: 'home' }, { k: 'pageup' }];
  const NAV_ROW3 = [{ k: 'delete' }, { k: 'end' }, { k: 'pagedown' }];
  const FUNC_ROW_WIN = [...FUNC_ROW, { k: 'prtsc' }, { k: 'scrlk' }, { k: 'pause' }];

  const BOARDS = {
    mac: [
      FUNC_ROW,
      [...ROW2, ...NAV_ROW2],
      [...ROW3, ...NAV_ROW3],
      ROW4,
      ROW5,
      [{ k: 'fn' }, { k: 'ctrl' }, { k: 'alt' }, { k: 'cmd', w: 1.25 }, { k: 'space', w: 5.5 }, { k: 'cmd', w: 1.25 }, { k: 'alt' }, { k: 'left' }, { k: 'up' }, { k: 'down' }, { k: 'right' }],
    ],
    win: [
      FUNC_ROW_WIN,
      [...ROW2, ...NAV_ROW2],
      [...ROW3, ...NAV_ROW3],
      ROW4,
      ROW5,
      [{ k: 'ctrl' }, { k: 'win' }, { k: 'alt' }, { k: 'space', w: 6 }, { k: 'alt' }, { k: 'fn' }, { k: 'ctrl' }, { k: 'left' }, { k: 'up' }, { k: 'down' }, { k: 'right' }],
    ],
  };

  const TOKEN_SHARED = {
    esc: 'esc', tab: 'tab', enter: 'enter', space: 'space', backspace: 'backspace',
    capslock: 'capslock', up: 'up', down: 'down', left: 'left', right: 'right',
    home: ['fn', 'left'], end: ['fn', 'right'],
    '`': '`', '-': '-', '=': '=', '[': '[', ']': ']', '\\': '\\', ';': ';',
    "'": "'", ',': ',', '.': '.', '/': '/', '<': ',', '+': ['=', '+'], '*': '*',
    mm: 'm', ee: 'e', uu: 'u', ll: 'l',
    arrowkeys: ['up', 'down', 'left', 'right'],
    'up/downarrow': ['up', 'down'],
    'left/rightarrow': ['left', 'right'],
  };

  const TOKEN_MOD = {
    mac: { cmd: 'cmd', shift: 'shift', alt: 'alt', ctrl: 'ctrl', fn: 'fn' },
    win: { cmd: 'ctrl', shift: 'shift', alt: 'alt', ctrl: 'ctrl', fn: 'fn', win: 'win' },
  };

  // token -> teclas físicas del board ('mouse' o array de tokens)
  function tokenToKeys(platform, tok) {
    const k = normTok(platform, tok);
    if (MOUSE_KEYS.has(k)) return 'mouse';
    let map = TOKEN_SHARED[k];
    if (map === undefined) map = TOKEN_MOD[platform][k];
    if (map === undefined) return [k];
    return Array.isArray(map) ? map : [map];
  }

  return { KEY_LABEL, isGlyph, MOUSE_KEYS, labelFor, normTok, BOARDS, TOKEN_SHARED, TOKEN_MOD, tokenToKeys };
})();

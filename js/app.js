(() => {
  'use strict';

  const DATA = window.SPARK_DATA;
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // ---------- estado ----------
  let lang = localStorage.getItem('spark-lang') || 'es';
  let platform = localStorage.getItem('spark-platform') || 'mac';

  // ---------- i18n ----------
  const I18N = {
    es: {
      htmlLang: 'es',
      title: 'SPARK — Conoce tus atajos',
      description: 'Conoce tus atajos de teclado. Elige una herramienta, pasa el ratón por un atajo y mira cómo se iluminan las teclas.',
      sidebar: 'Explorador de herramientas',
      toolsNav: 'Herramientas',
      scPage: 'Atajos de la herramienta',
      searchTools: 'Buscar',
      searchShortcuts: 'Buscar atajos',
      back: 'Volver a todas las herramientas',
      displayHint: 'Pasa el ratón por un atajo',
      kbHint: 'Elige una herramienta para empezar',
      builtWith: 'Hecho con',
      changelog: 'Cambios',
      contact: 'Contacto',
      switchLang: 'Cambiar a inglés',
      switchLangFrom: 'Cambiar a español',
      switchKbWin: 'Cambiar a teclado Windows',
      switchKbMac: 'Cambiar a teclado macOS',
      cats: { DESIGN: 'DISEÑO', VIDEO: 'VIDEO', CODE: 'CÓDIGO', PRODUCTIVITY: 'PRODUCTIVIDAD' },
    },
    en: {
      htmlLang: 'en',
      title: 'SPARK — Know your shortcuts',
      description: 'Know your shortcuts. Pick a tool, hover a shortcut and watch the keys light up.',
      sidebar: 'Tools explorer',
      toolsNav: 'Tools',
      scPage: 'Tool shortcuts',
      searchTools: 'Search',
      searchShortcuts: 'Search shortcuts',
      back: 'Back to all tools',
      displayHint: 'Hover a shortcut to see its keys',
      kbHint: 'Pick a tool to get started',
      builtWith: 'Built with',
      changelog: 'Changelog',
      contact: 'Contact',
      switchLang: 'Switch to Spanish',
      switchLangFrom: 'Switch to English',
      switchKbWin: 'Switch to Windows keyboard',
      switchKbMac: 'Switch to macOS keyboard',
      cats: { DESIGN: 'DESIGN', VIDEO: 'VIDEO', CODE: 'CODE', PRODUCTIVITY: 'PRODUCTIVITY' },
    },
  };
  const t = (k) => (I18N[lang] && I18N[lang][k] !== undefined ? I18N[lang][k] : I18N.en[k]);

  // ---------- branding por herramienta ----------
  const BRANDS = {
    figma:       { c: '#F24E1E', l: 'F' },
    photoshop:   { c: '#31A8FF', l: 'Ps' },
    illustrator: { c: '#FF9A00', l: 'Ai' },
    indesign:    { c: '#FF3366', l: 'Id' },
    lightroom:   { c: '#7FA8D9', l: 'Lr' },
    blender:     { c: '#F5792A', l: 'Bl' },
    affinity:    { c: '#3A3A3C', l: 'Af' },
    framer:      { c: '#0055FF', l: 'Fr' },
    webflow:     { c: '#146EF5', l: 'Wf' },
    spline:      { c: '#6B48FF', l: 'Sp' },
    aftereffects:{ c: '#6F6FA8', l: 'Ae' },
    davinci:     { c: '#17181B', l: 'Dv' },
    capcut:      { c: '#B3F0F5', l: 'Cc' },
    premiere:    { c: '#6F6FA8', l: 'Pr' },
    cursor:      { c: '#111111', l: 'Cu' },
    vscode:      { c: '#007ACC', l: 'Vs' },
    lovable:     { c: '#E61B1B', l: 'Lv' },
    xcode:       { c: '#147EFB', l: 'Xc' },
    claude:      { c: '#D97757', l: 'Cl' },
    copilot:     { c: '#E10098', l: 'Cp' },
    notion:      { c: '#111111', l: 'Nt' },
    slack:       { c: '#4A154B', l: 'Sl' },
    linear:      { c: '#5E6AD2', l: 'Ln' },
    obsidian:    { c: '#483699', l: 'Ob' },
  };
  const brandOf = (id) => BRANDS[id] || { c: '#0a6cff', l: (id || '?').slice(0, 2) };
  window.SPARK_BRANDS = BRANDS;

  // ---------- logos reales (js/logos.js) ----------
  function isLight(hex) {
    const h = String(hex).replace('#', '');
    if (h.length < 6) return false;
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b > 165;
  }
  const logoColor = (c) => (isLight(c) ? '#0a0a0c' : '#ffffff');
  function logoHtml(id) {
    const lg = window.SPARK_LOGOS && window.SPARK_LOGOS[id];
    if (!lg || !lg.html) return null;
    return `<svg class="bl${lg.st ? ' bl-st' : ''}" viewBox="${lg.vb}" aria-hidden="true">${lg.html}</svg>`;
  }

  // ---------- teclas compartidas (js/keys.js) ----------
  const K = window.SPARK_KEYS;
  const labelFor = (tok) => K.labelFor(platform, tok);
  const isGlyph = K.isGlyph;
  const normTok = (tok) => K.normTok(platform, tok);
  const normArr = (arr) => arr.map(normTok);

  function hotkeyLabel(tokens) {
    const parts = tokens.map(labelFor);
    return platform === 'win' ? parts.join('+') : parts.join('');
  }

  // descompone tokens especiales (mm, arrowkeys, click…) en piezas
  function expandTokens(tokens) {
    const out = [];
    const letterPair = { mm: 'M', ee: 'E', uu: 'U', ll: 'L' };
    for (const tt of tokens || []) {
      const tok = String(tt).toLowerCase();
      if (K.MOUSE_KEYS.has(tok)) { out.push({ kind: 'mouse', label: String(tt).toUpperCase() }); continue; }
      if (letterPair[tok]) { out.push({ kind: 'key', label: letterPair[tok] }, { kind: 'key', label: letterPair[tok] }); continue; }
      if (tok === 'arrowkeys') { out.push({ kind: 'key', label: '↑' }, { kind: 'key', label: '↓' }, { kind: 'key', label: '←' }, { kind: 'key', label: '→' }); continue; }
      if (tok === 'up/downarrow') { out.push({ kind: 'key', label: '↑' }, { kind: 'key', label: '↓' }); continue; }
      if (tok === 'left/rightarrow') { out.push({ kind: 'key', label: '←' }, { kind: 'key', label: '→' }); continue; }
      out.push({ kind: 'key', label: labelFor(tok) });
    }
    return out;
  }

  function keysHtml(tokens, kbdClass) {
    const cls = kbdClass || '';
    return expandTokens(tokens).map((p) => {
      if (p.kind === 'mouse') return `<kbd class="${cls} mouse">${p.label}</kbd>`;
      return `<kbd class="${cls}${isGlyph(p.label) ? ' sym' : ''}">${p.label}</kbd>`;
    }).join('');
  }

  function iconHtml(id) {
    const b = brandOf(id);
    const logo = logoHtml(id) || b.l;
    return `<span class="icon" style="--ic:${b.c};--lc:${logoColor(b.c)}"><span class="tkey"><span class="tinner">${logo}</span></span></span>`;
  }

  // ---------- tira de logos de programas (carrusel infinito) ----------
  function renderBrandStrip() {
    const strip = $('#brand-strip');
    if (!strip) return;
    let track = $('.brand-track', strip);
    if (!track) {
      track = document.createElement('div');
      track.className = 'brand-track';
      strip.appendChild(track);
    }
    track.innerHTML = '';
    const makeChip = (id) => {
      const b = brandOf(id);
      const tool = toolIndex.get(id);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'brand-chip';
      chip.style.setProperty('--bc', b.c);
      chip.style.setProperty('--lc', logoColor(b.c));
      chip.innerHTML = logoHtml(id) || b.l;
      if (tool) chip.title = tool.name;
      chip.addEventListener('click', () => {
        const btn = $('.tool[data-tool="' + id + '"]');
        if (btn) openTool(btn);
      });
      return chip;
    };
    for (let copy = 0; copy < 2; copy++) {
      for (const id of Object.keys(BRANDS)) track.appendChild(makeChip(id));
    }
    const one = Math.max(1, track.scrollWidth / 2);
    track.style.animationDuration = Math.max(16, Math.round(one / 40)) + 's';
  }

  // ---------- sidebar: herramientas ----------
  const catsEl = $('#cats');
  const toolSearch = $('#tool-search');

  let toolButtons = [];
  let toolIndex = new Map(); // id -> {name, hotkey}

  function renderCats() {
    catsEl.innerHTML = '';
    for (const cat of DATA.cats) {
      const section = document.createElement('section');
      section.className = 'cat';
      section.dataset.cat = cat.name;
      const h = document.createElement('h2');
      h.className = 'cat-name';
      h.textContent = (t('cats')[cat.name] || cat.name);
      section.appendChild(h);
      const ul = document.createElement('ul');
      ul.className = 'tools';
      for (const tool of cat.tools) {
        toolIndex.set(tool.id, tool);
        const li = document.createElement('li');
        li.innerHTML = `<button class="tool" data-tool="${tool.id}" type="button">${iconHtml(tool.id)}<span class="name">${esc(tool.name)}</span><span class="hotkey"></span><span class="chev">›</span></button>`;
        li.querySelector('.hotkey').textContent = hotkeyLabel(tool.hotkey.split('+'));
        ul.appendChild(li);
      }
      section.appendChild(ul);
      catsEl.appendChild(section);
    }
    toolButtons = $$('.tool');
    toolButtons.forEach((btn) => btn.addEventListener('click', () => openTool(btn)));
  }

  toolSearch.addEventListener('input', () => {
    const q = toolSearch.value.trim().toLowerCase();
    for (const b of toolButtons) {
      const name = b.dataset.tool ? (toolIndex.get(b.dataset.tool) || {}).name || '' : '';
      b.closest('li').hidden = !name.toLowerCase().includes(q);
    }
    for (const cat of $$('.cat')) cat.hidden = !$('li:not([hidden])', cat);
  });

  // ---------- teclado ----------
  // Teclado "Pure CSS" de ManzDev/twitch-keyboard (js/twboard.js)

  function buildBoard() {
    if (window.SPARK_BOARD) window.SPARK_BOARD.build(platform);
  }

  function lightTokens(tokens) {
    if (window.SPARK_BOARD) window.SPARK_BOARD.light(tokens);
  }

  // ---------- pantalla de atajo ----------
  const dispLabel = $('#kb-display-label');
  const dispKeys = $('#kb-display-keys');

  function showDisplay(label, tokens) {
    dispLabel.textContent = label || (curTool ? t('displayHint') : '');
    dispKeys.innerHTML = tokens && tokens.length ? keysHtml(tokens, 'kbd') : '';
    if (label && tokens) lightTokens(tokens);
    else lightTokens(typingTokens.size ? [...typingTokens] : null);
  }

  // ---------- vista de atajos de una herramienta ----------
  const sidebar = $('.sidebar');
  const scBody = $('#sc-body');
  const scTitle = $('#sc-title');
  const scSearch = $('#sc-search');

  const toolCache = new Map();
  let curTool = null;
  let curRows = [];
  let curGroups = [];
  let typingTokens = new Set();
  let done = new Set();

  function buildToolDom(id) {
    if (toolCache.has(id)) return toolCache.get(id);
    const groups = DATA.tools[id] || [];
    const div = document.createElement('div');
    div.className = 'sc-tool';
    div.dataset.toolId = id;
    let html = '';
    for (const g of groups) {
      const label = g.labelEs || g.label;
      html += `<div class="sc-group" data-label="${esc(g.label)}" data-label-es="${esc(g.labelEs || '')}"><p class="sc-cat">${esc(lang === 'es' ? label : g.label)}</p><ul>`;
      for (const it of g.items) {
        const es = it.actionEs || '';
        html += `<li class="sc" data-keys='${JSON.stringify(it.keys)}' data-action="${esc(fold(it.action))}" data-action-es="${esc(fold(es))}" data-act-raw="${esc(it.action)}" data-act-es-raw="${esc(es)}">
          <span class="sc-action">${esc(lang === 'es' && es ? es : it.action)}</span>
          <span class="sc-keys">${keysHtml(it.keys)}</span>
        </li>`;
      }
      html += '</ul></div>';
    }
    div.innerHTML = html;
    toolCache.set(id, div);
    return div;
  }

  function openTool(btn) {
    const id = btn.dataset.tool;
    if (!id) return;
    toolButtons.forEach((b) => b.classList.toggle('active', b === btn));
    const tool = toolIndex.get(id);
    scTitle.textContent = tool ? tool.name : id;
    scSearch.value = '';
    const dom = buildToolDom(id);
    if (!dom.parentNode) scBody.appendChild(dom);
    $$('.sc-tool', scBody).forEach((d) => d.classList.toggle('on', d === dom));
    curTool = dom;
    curRows = $$('.sc', dom);
    curGroups = $$('.sc-group', dom);
    curRows.forEach((row) => {
      if (done.has(rowKey(row))) row.classList.add('done');
    });
    applyFilters();
    sidebar.dataset.view = 'shortcuts';
    document.body.dataset.bg = 'shortcuts';
    showDisplay('', null);
  }

  function rowKey(row) {
    const d = row.closest('.sc-tool');
    return (d ? d.dataset.toolId : curTool.dataset.toolId) + '|' + row.dataset.action;
  }

  function backToTools() {
    sidebar.dataset.view = 'tools';
    document.body.dataset.bg = 'tools';
    toolButtons.forEach((b) => b.classList.remove('active'));
    curTool = null; curRows = []; curGroups = [];
    showDisplay('', null);
    typingTokens.clear();
    updateTyping();
  }

  $('.back').addEventListener('click', backToTools);

  // hover en filas de atajos
  scBody.addEventListener('mouseover', (e) => {
    const row = e.target.closest('.sc');
    if (!row) return;
    const keys = JSON.parse(row.dataset.keys || '[]');
    showDisplay($('.sc-action', row).textContent, keys);
  });
  scBody.addEventListener('mouseleave', () => showDisplay('', null));

  // búsqueda de atajos
  scSearch.addEventListener('input', applyFilters);

  function applyFilters() {
    const q = fold(scSearch.value.trim());
    for (const row of curRows) {
      let hidden = typingTokens.size > 0;
      if (!hidden && q && !(row.dataset.action.includes(q) || (row.dataset.actionEs && row.dataset.actionEs.includes(q)))) hidden = true;
      if (!hidden && typingTokens.size > 0) {
        const keys = normArr(JSON.parse(row.dataset.keys || '[]'));
        hidden = ![...typingTokens].every((tk) => keys.includes(normTok(tk)));
      }
      row.hidden = hidden;
    }
    for (const g of curGroups) {
      g.hidden = !$('li.sc:not([hidden])', g);
    }
  }

  // ---------- teclado físico ----------
  function codeToToken(code) {
    const c = code;
    if (c === 'MetaLeft' || c === 'MetaRight') return 'cmd';
    if (c === 'ShiftLeft' || c === 'ShiftRight') return 'shift';
    if (c === 'AltLeft' || c === 'AltRight') return 'alt';
    if (c === 'ControlLeft' || c === 'ControlRight') return 'ctrl';
    if (c === 'CapsLock') return 'capslock';
    let m = /^Key([A-Z])$/.exec(c); if (m) return m[1].toLowerCase();
    m = /^Digit([0-9])$/.exec(c); if (m) return m[1];
    if (c === 'Backquote') return '`';
    if (c === 'Minus') return '-';
    if (c === 'Equal') return '=';
    if (c === 'BracketLeft') return '[';
    if (c === 'BracketRight') return ']';
    if (c === 'Backslash') return '\\';
    if (c === 'Semicolon') return ';';
    if (c === 'Quote') return "'";
    if (c === 'Comma') return ',';
    if (c === 'Period') return '.';
    if (c === 'Slash') return '/';
    if (c === 'Enter') return 'enter';
    if (c === 'Escape') return 'esc';
    if (c === 'Tab') return 'tab';
    if (c === 'Space') return 'space';
    if (c === 'Backspace') return 'backspace';
    if (c === 'ArrowUp') return 'up';
    if (c === 'ArrowDown') return 'down';
    if (c === 'ArrowLeft') return 'left';
    if (c === 'ArrowRight') return 'right';
    if (c === 'Home') return 'home';
    if (c === 'End') return 'end';
    m = /^F(\d{1,2})$/.exec(c); if (m) return 'F' + m[1];
    return null;
  }

  function matchShortcut(tokens) {
    if (tokens.length === 0 || !curTool) return null;
    const typed = normArr(tokens).sort().join('+');
    for (const row of $$('.sc', curTool)) {
      const keys = normArr(JSON.parse(row.dataset.keys || '[]')).sort().join('+');
      if (keys === typed) return row;
    }
    return null;
  }

  function updateTyping() {
    const tokens = [...typingTokens];
    lightTokens(tokens.length ? tokens : null);
    if (tokens.length) {
      applyFilters();
      const hit = matchShortcut(tokens);
      if (hit && !hit.classList.contains('done')) {
        hit.classList.add('done');
        done.add(rowKey(hit));
        confettiFrom(hit);
      }
    } else {
      applyFilters();
      showDisplay('', null);
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && sidebar.dataset.view === 'shortcuts') {
      e.preventDefault();
      backToTools();
      return;
    }
    if (sidebar.dataset.view !== 'shortcuts') return;
    if (document.activeElement === scSearch) return;
    const tok = codeToToken(e.code);
    if (!tok) return;
    if (e.repeat) return;
    typingTokens.add(tok);
    if (window.SPARK_BOARD) window.SPARK_BOARD.press([tok]);
    updateTyping();
  });

  window.addEventListener('keyup', (e) => {
    if (sidebar.dataset.view !== 'shortcuts') return;
    const tok = codeToToken(e.code);
    if (!tok) return;
    typingTokens.delete(tok);
    if (tok === 'cmd') typingTokens.clear();
    updateTyping();
  });

  window.addEventListener('blur', () => {
    typingTokens.clear();
    if (sidebar.dataset.view === 'shortcuts') updateTyping();
  });

  // ---------- confetti ----------
  function confettiFrom(el) {
    if (window.BG3D) window.BG3D.flash();
    const layer = $('#confetti-layer');
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'confetti';
      const dx = (Math.random() - 0.5) * 220;
      const dy = (Math.random() - 0.5) * 220;
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  // ---------- controles: idioma y teclado ----------
  function updateLangButton() {
    const target = lang === 'es' ? 'en' : 'es';
    const btn = $('#lang-btn');
    btn.innerHTML = `<svg class="globe" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"></circle><path d="M2.5 8h11M8 2.4c1.9 1.8 1.9 9.4 0 11.2M8 2.4C6.1 4.2 6.1 11.8 8 13.6" stroke="currentColor" stroke-width="1.4"></path></svg><span class="code">${target.toUpperCase()}</span>`;
    const label = target === 'en' ? t('switchLang') : t('switchLangFrom');
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  function updateKbButton() {
    const target = platform === 'mac' ? 'win' : 'mac';
    const btn = $('#kb-btn');
    btn.innerHTML = `<span class="kbd-ico">${target === 'win' ? '⊞' : '⌘'}</span>`;
    const label = target === 'win' ? t('switchKbWin') : t('switchKbMac');
    btn.setAttribute('aria-label', label);
    btn.title = label;
  }

  $('#lang-btn').addEventListener('click', () => {
    lang = lang === 'es' ? 'en' : 'es';
    localStorage.setItem('spark-lang', lang);
    applyI18n();
  });

  $('#kb-btn').addEventListener('click', () => {
    platform = platform === 'mac' ? 'win' : 'mac';
    localStorage.setItem('spark-platform', platform);
    applyPlatform();
  });

  // ---------- aplicar idioma ----------
  function refreshToolTexts() {
    const es = lang === 'es';
    for (const d of toolCache.values()) {
      for (const g of $$('.sc-group', d)) {
        const p = $('.sc-cat', g);
        if (p) p.textContent = es && g.dataset.labelEs ? g.dataset.labelEs : g.dataset.label;
      }
      for (const row of $$('.sc', d)) {
        const a = $('.sc-action', row);
        if (a) a.textContent = es && row.dataset.actEsRaw ? row.dataset.actEsRaw : row.dataset.actRaw;
      }
    }
  }

  function applyI18n() {
    document.documentElement.lang = t('htmlLang');
    document.title = t('title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('description'));
    $('.sidebar').setAttribute('aria-label', t('sidebar'));
    $('#sc-page').setAttribute('aria-label', t('scPage'));
    $('#cats').setAttribute('aria-label', t('toolsNav'));
    toolSearch.placeholder = t('searchTools');
    toolSearch.setAttribute('aria-label', t('searchTools'));
    scSearch.placeholder = t('searchShortcuts');
    scSearch.setAttribute('aria-label', t('searchShortcuts'));
    $('.back-text').textContent = t('back');
    $('#kb-hint').textContent = t('kbHint');
    $('.sidebar-credit').innerHTML = `${t('builtWith')} <span style="opacity:.8">⌘</span> · <a href="#changelog">${t('changelog')}</a> <span class="sep">·</span> <a href="#" target="_blank" rel="noopener">${t('contact')}</a>`;
    $('.credit').innerHTML = `SPARK · <a href="#changelog">${t('changelog')}</a>`;
    updateLangButton();
    updateKbButton();
    renderCats();
    toolSearch.dispatchEvent(new Event('input'));
    refreshToolTexts();
    renderBrandStrip();
    showDisplay('', typingTokens.size ? [...typingTokens] : null);
  }

  // ---------- aplicar plataforma ----------
  function applyPlatform() {
    buildBoard();
    for (const btn of toolButtons) {
      const tool = toolIndex.get(btn.dataset.tool);
      if (tool) btn.querySelector('.hotkey').textContent = hotkeyLabel(tool.hotkey.split('+'));
    }
    for (const d of toolCache.values()) {
      for (const row of $$('.sc', d)) {
        const keys = JSON.parse(row.dataset.keys || '[]');
        row.querySelector('.sc-keys').innerHTML = keysHtml(keys);
      }
    }
    if (curTool) {
      applyFilters();
      if (typingTokens.size) lightTokens([...typingTokens]);
    }
    updateKbButton();
  }

  // ---------- init ----------
  applyI18n();
  applyPlatform();
  backToTools();
})();

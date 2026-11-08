/* ═════════════ Tabs ═════════════ */
const TABS = ['lernen', 'uebungen', 'test', 'karten'];
const TOPIC = { zs: 'Zahlen & Werkzeuge', ws: 'Ohm & Wechselstrom', lst: 'Leistung & USV' };
function showTab(t) {
  if (!TABS.includes(t)) t = 'lernen';
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t));
  document.querySelectorAll('main > section').forEach(s => s.hidden = s.id !== t);
  if (t === 'karten') renderCards();
  if (t === 'test' && !testState) renderTestStart();
  store.set('tab', t);
  const tabs = document.querySelector('.tabs');
  if (window.scrollY > tabs.offsetTop) window.scrollTo({ top: tabs.offsetTop });
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => { if (location.hash === '#' + b.dataset.tab) showTab(b.dataset.tab); else location.hash = b.dataset.tab; }));
window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
function updBadge() {
  const n = deckIds('open').length, b = document.getElementById('cardBadge');
  b.hidden = !n; b.textContent = n;
}

/* Theme */
(function () {
  const t = store.get('theme', null);
  if (t) document.documentElement.dataset.theme = t;
  document.getElementById('themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nx = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nx; store.set('theme', nx);
  });
})();
function toTop() { const tabs = document.querySelector('.tabs'); if (window.scrollY > tabs.offsetTop) window.scrollTo({ top: tabs.offsetTop }); }

/* ═════════════ LERNEN ═════════════ */
const MERK_ID = 'merk';
let curModule = store.get('module', 'm1');
if (curModule !== MERK_ID && !MODULES.some(m => m.id === curModule)) curModule = 'm1';
function doneSet() { return new Set(store.get('done', [])); }
function renderLearnNav() {
  const nav = document.getElementById('learnNav'); nav.innerHTML = '';
  const done = doneSet();
  MODULES.forEach((m, i) => nav.append(h('li', null, h('button', { class: (m.id === curModule ? 'cur' : done.has(m.id) ? 'ok' : ''), title: m.title, onclick: () => openModule(m.id) }, `${done.has(m.id) ? '✓ ' : ''}${i + 1} ${m.title.split(/[:&,]/)[0].trim()}`))));
  nav.append(h('li', null, h('button', { class: 'star' + (curModule === MERK_ID ? ' cur' : ''), onclick: () => openModule(MERK_ID) }, '★ Alle Merkhilfen')));
  const n = MODULES.filter(m => done.has(m.id)).length, pct = Math.round(100 * n / MODULES.length);
  document.getElementById('learnProg').innerHTML = `<span><b>${n}</b> von ${MODULES.length} Kapiteln sitzen</span><div class="bar"><span style="width:${pct}%"></span></div>`;
}
function openModule(id) {
  curModule = id; store.set('module', id);
  renderLearnNav();
  const box = document.getElementById('learnBody'); box.innerHTML = '';
  if (id === MERK_ID) { renderMerk(box); toTop(); return; }
  const i = MODULES.findIndex(m => m.id === id), m = MODULES[i];
  const done = doneSet();
  box.append(h('p', { class: 'crumb' }, m.part),
    h('div', { class: 'th' + (done.has(id) ? ' done' : '') }, h('span', { class: 'num' }, i + 1), h('h2', null, m.title)),
    h('div', { class: 'mod', html: m.html }));
  if (m.mini && m.mini.length) {
    const mc = h('div', { class: 'mini' }, h('h4', null, 'Mini-Check'));
    m.mini.forEach((q, qi) => {
      const fb = h('div', { class: 'fb hidden' });
      const opts = h('div', { class: 'opts' });
      q.o.forEach((o, oi) => opts.append(h('button', { class: 'opt', onclick: e => {
        opts.querySelectorAll('.opt').forEach((b, bi) => { b.disabled = true; if (bi === q.a) b.classList.add('right'); });
        if (oi !== q.a) e.currentTarget.classList.add('wrong');
        fb.classList.remove('hidden');
        feedback(fb, oi === q.a, oi === q.a ? 'Richtig!' : 'Leider falsch.', [q.why + ' ' + S(q.src[0], q.src[1])]);
      } }, o)));
      mc.append(h('div', { class: 'miniq' }, h('p', { class: 'q' }, `${qi + 1}. ${q.q}`), opts, fb));
    });
    box.append(mc);
  }
  const cb = h('label', { class: 'donebox' }, h('input', { type: 'checkbox', checked: done.has(id), onchange: e => {
    const d = doneSet(); e.target.checked ? d.add(id) : d.delete(id); store.set('done', [...d]); renderLearnNav();
    box.querySelector('.th').classList.toggle('done', e.target.checked);
  } }), 'Kapitel sitzt');
  const nav = h('div', { class: 'modnav' },
    i > 0 ? h('button', { class: 'btn ghost', onclick: () => openModule(MODULES[i - 1].id) }, '← Zurück') : h('span'),
    cb,
    i < MODULES.length - 1 ? h('button', { class: 'btn', onclick: () => { const d = doneSet(); d.add(id); store.set('done', [...d]); openModule(MODULES[i + 1].id); } }, `Weiter: ${MODULES[i + 1].title.split(/[:&]/)[0].trim()} →`)
      : h('button', { class: 'btn', onclick: () => openModule(MERK_ID) }, 'Zu den Merkhilfen ★'));
  box.append(nav);
  toTop();
}
function renderMerk(box) {
  box.append(h('p', { class: 'crumb' }, 'Wiederholen'), h('div', { class: 'th' }, h('span', { class: 'num' }, '★'), h('h2', null, 'Alle Merkhilfen')));
  let hide = store.get('merkHide', false);
  const list = h('div', { class: 'merklist' + (hide ? ' cover' : '') });
  const tgl = h('label', { class: 'donebox' }, h('input', { type: 'checkbox', checked: hide, onchange: e => { hide = e.target.checked; store.set('merkHide', hide); list.classList.toggle('cover', hide); } }), 'Abdeckmodus');
  box.append(h('p', null, 'Alle Merke-Kästen aus den Kapiteln an einem Ort. Mit dem Abdeckmodus lernst du sie wie Karteikarten: Überschrift lesen, Formel aufsagen, dann antippen zum Aufdecken.'), tgl);
  MODULES.forEach((m, i) => {
    const t = document.createElement('template'); t.innerHTML = m.html;
    const ms = t.content.querySelectorAll('.merke');
    if (!ms.length) return;
    list.append(h('h3', null, `${i + 1} · ${m.title}`));
    ms.forEach(el => {
      const lb = el.querySelector('.lbl'); const head = lb ? lb.textContent.replace(/^Merke\s*·\s*/, '') : 'Merkhilfe';
      const body = el.cloneNode(true); const bl = body.querySelector('.lbl'); if (bl) bl.remove();
      body.querySelectorAll('.src').forEach(s => s.remove());
      const card = h('div', { class: 'merkcard', onclick: () => card.classList.toggle('open') },
        h('div', { class: 'mh' }, head), h('div', { class: 'mb', html: body.innerHTML }),
        h('button', { class: 'linkbtn', onclick: e => { e.stopPropagation(); openModule(m.id); } }, '→ zum Kapitel'));
      list.append(card);
    });
  });
  box.append(list);
}

/* ═════════════ ÜBUNGEN ═════════════ */
function exStats() { return store.get('exstats', {}); }
/* Übungen: pro Thema ein Untertab, alle Aufgaben untereinander */
const EX_BATCH = 5;
let exCur = store.get('exTab', EXERCISES[0].id);
if (!EXERCISES.some(e => e.id === exCur)) exCur = EXERCISES[0].id;
function exTasksFor(ex, nRand) {
  if (ex.items && !ex.fixed) return ex.items.map((it, i) => ({ task: { it }, label: `Frage ${i + 1} von ${ex.items.length}` }));
  const fixed = (ex.fixed || []).map(t => ({ task: t, label: t.label || (t.fromScript ? 'Beispiel aus dem Skript' : 'Aus dem Unterricht') }));
  const rand = ex.random ? Array.from({ length: nRand }, () => ({ task: ex.random(), label: 'Zufallsaufgabe' })) : [];
  return fixed.concat(rand);
}
function renderExercises() {
  const toc = document.getElementById('exToc'); toc.innerHTML = '';
  toc.setAttribute('role', 'tablist');
  EXERCISES.forEach((ex, i) => toc.append(h('button', { class: 'subtab' + (ex.id === exCur ? ' on' : '') + (ex.imp ? ' imp' : ''), role: 'tab', 'aria-selected': String(ex.id === exCur), title: ex.imp ? 'wichtig – kommt oft dran' : null,
    onclick: () => { exCur = ex.id; store.set('exTab', ex.id); renderExercises(); const t = document.getElementById('exToc'); if (t.getBoundingClientRect().top < 0) t.scrollIntoView(); }, html: `${ex.imp ? '★ ' : ''}${i + 1} ${ex.title}` })));
  const wrap = document.getElementById('exList'); wrap.innerHTML = '';
  const n = EXERCISES.findIndex(e => e.id === exCur), ex = EXERCISES[n];
  const st = h('span', { class: 'stat' });
  const updStat = () => { const s = exStats()[ex.id] || { r: 0, t: 0 }; st.textContent = s.t ? `${s.r}/${s.t} richtig` : ''; };
  updStat();
  const list = h('div', { class: 'tasklist' });
  wrap.append(h('div', { class: 'excard' }, h('div', { class: 'exhead' }, h('h3', { html: `${n + 1}. ${ex.title}${ex.imp ? ' <span class="tag imp">★ wichtig</span>' : ''}` }), st), h('p', { class: 'small', html: ex.intro + ' ' + srcList(ex.src) }), list));
  let num = 0;
  const addTask = ({ task, label }) => {
    num++;
    const card = h('div', { class: 'taskcard' });
    const c = { area: h('div', { class: 'exarea' }), fb: h('div', { class: 'fb hidden' }) };
    card.append(h('div', { class: 'tasklabel' }, `Aufgabe ${num} · ${label}`));
    ex.render(task, c);
    const sol = h('div', { class: 'sol hidden' });
    card.append(c.area, c.fb, sol);
    const ctr = h('div', { class: 'ctrls' });
    let counted = false;
    const count = ok => { if (counted || ok === null) return; counted = true; const s = exStats(); s[ex.id] = s[ex.id] || { r: 0, t: 0 }; s[ex.id].t++; if (ok) s[ex.id].r++; store.set('exstats', s); updStat(); };
    if (c.selfAssess) {
      const rate = ok => { count(ok); yes.disabled = no.disabled = true; card.classList.add(ok ? 'done-ok' : 'done-bad'); };
      const yes = h('button', { class: 'btn ok sm', disabled: true, onclick: () => rate(true) }, '✓ Gewusst');
      const no = h('button', { class: 'btn bad sm', disabled: true, onclick: () => rate(false) }, '✗ Nicht gewusst');
      ctr.append(h('button', { class: 'btn ghost', onclick: () => { c.fb.className = 'fb info'; c.fb.innerHTML = c.selfAssess.answer; if (!counted) yes.disabled = no.disabled = false; } }, 'Musterantwort zeigen'), yes, no);
    } else {
      const solBtn = h('button', { class: 'btn ghost', onclick: () => { sol.classList.toggle('hidden'); if (!sol.innerHTML) sol.innerHTML = '<h4>Lösungsweg – Schritt für Schritt</h4>' + c.solution(); solBtn.classList.remove('pulse'); } }, 'Lösungsweg anzeigen');
      const chk = () => { c.fb.classList.remove('hidden'); const ok = c.onCheck(); count(ok); if (ok === false) solBtn.classList.add('pulse'); if (ok !== null) card.classList.toggle('done-ok', ok === true), card.classList.toggle('done-bad', ok === false); };
      ctr.append(h('button', { class: 'btn', onclick: chk }, 'Prüfen'), solBtn);
      c.area.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') chk(); }));
    }
    card.append(ctr); list.append(card);
  };
  exTasksFor(ex, ex.imp ? 10 : 6).forEach(addTask);
  if (ex.random && !(ex.items && !ex.fixed)) wrap.append(h('div', { class: 'ctrls morebar' },
    h('button', { class: 'btn ghost', onclick: () => { for (let i = 0; i < EX_BATCH; i++) addTask({ task: ex.random(), label: 'Zufallsaufgabe' }); } }, `+ ${EX_BATCH} weitere Zufallsaufgaben`),
    h('button', { class: 'btn ghost', onclick: renderExercises }, '↻ Zufallsaufgaben neu würfeln')));
}

/* ═════════════ TEST ═════════════ */
let testState = null;
const GRADES = [[87.5, 1, 'Sehr gut'], [75, 2, 'Gut'], [62.5, 3, 'Befriedigend'], [50, 4, 'Genügend'], [0, 5, 'Nicht genügend']];
function gradeOf(p) { return GRADES.find(g => p >= g[0]); }
function checkAns(q, val) {
  if (q.type === 'mc') return val === q.a;
  if (val == null || String(val).trim() === '') return false;
  if (q.base) return q.acc.some(a => normBase(a) === normBase(val));
  return near(parseDec(val), q.val, q.tol || 0.01);
}
function ansText(q, val) {
  if (val == null || val === '') return '— (keine Antwort)';
  return q.type === 'mc' ? q.o[val] : val + (q.unit && !q.base && !/[a-zA-Zµ°%Ω]/.test(val) ? ' ' + q.unit : '');
}
function rightText(q) { return q.type === 'mc' ? q.o[q.a] : q.show; }

function renderTestStart0() {
  testState = null;
  const box = document.getElementById('testBody'); box.innerHTML = '';
  const hist = store.get('tests', []);
  box.append(
    h('div', { class: 'panel' },
      h('h2', null, 'Test auf ein Sehr gut'),
      h('p', null, 'Jeder Test zieht ', h('b', null, '10 Aufgaben'), ' aus einem Pool von ', h('b', null, `${POOL.length} Aufgaben`), ': 3 × Zahlen & Werkzeuge, 3 × Ohm & Wechselstrom, 4 × Leistung & USV. Rechenaufgaben darfst du auf 2 Nachkommastellen runden. Am Ende wird benotet, falsche Fragen landen automatisch bei den Karteikarten.'),
      h('button', { class: 'btn big', onclick: startTest }, 'Neuen Test starten')),
    h('h3', null, 'Notenschlüssel'),
    h('div', { class: 'scroll', html: '<table class="tbl"><tr><th>Richtig</th><th>Prozent</th><th>Note</th></tr><tr><td>9–10</td><td>≥ 87,5 %</td><td>1 · Sehr gut</td></tr><tr><td>8</td><td>≥ 75 %</td><td>2 · Gut</td></tr><tr><td>7</td><td>≥ 62,5 %</td><td>3 · Befriedigend</td></tr><tr><td>5–6</td><td>≥ 50 %</td><td>4 · Genügend</td></tr><tr><td>0–4</td><td>&lt; 50 %</td><td>5 · Nicht genügend</td></tr></table>' }));
  if (hist.length) {
    box.append(h('h3', null, 'Deine letzten Tests'));
    const t = h('table', { class: 'tbl' }, h('tr', null, h('th', null, 'Datum'), h('th', null, 'Punkte'), h('th', null, 'Note')));
    hist.slice(-10).reverse().forEach(r => t.append(h('tr', null, h('td', null, new Date(r.d).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })), h('td', null, `${r.s}/${r.n}`), h('td', null, h('span', { class: 'grade g' + r.g }, r.g)))));
    box.append(h('div', { class: 'scroll' }, t));
  }
}
/* ★ = wichtig (w > 1): kommt im Test öfter dran (gewichtete Zufallsauswahl) */
function wPick(arr, k) { return arr.map(q => ({ q, key: -Math.log(1 - Math.random()) / (q.w || 1) })).sort((x, y) => x.key - y.key).slice(0, k).map(x => x.q); }
let poolTab = store.get('poolTab', Object.keys(TOPIC)[0]);
if (!TOPIC[poolTab]) poolTab = Object.keys(TOPIC)[0];
function renderTestStart() { renderTestStart0(); renderPoolView(document.getElementById('testBody')); }
function renderPoolView(box) {
  const sec = h('div', { class: 'poolview' });
  const draw = () => {
    sec.innerHTML = '';
    const nImp = POOL.filter(q => q.w > 1).length;
    sec.append(h('h3', null, 'Alle Testfragen ansehen'), h('p', { class: 'small' }, `Alle ${POOL.length} Fragen aus dem Pool, nach Thema. ★ = wichtig (${nImp} Fragen) – die kommen im Test ungefähr dreimal so oft dran. Antippen zeigt die Lösung.`));
    const bar = h('div', { class: 'toc' });
    Object.entries(TOPIC).forEach(([k, l]) => bar.append(h('button', { class: 'subtab' + (k === poolTab ? ' on' : ''), onclick: () => { poolTab = k; store.set('poolTab', k); draw(); } }, `${l} (${POOL.filter(q => q.t === k).length})`)));
    sec.append(bar);
    POOL.filter(q => q.t === poolTab).forEach((q, i) => sec.append(h('details', { class: 'qa' },
      h('summary', null, `${q.w > 1 ? '★ ' : ''}${i + 1}. ${q.q}`),
      h('div', { class: 'in', html: (q.type === 'mc' ? '<ul class="cardopts">' + q.o.map((o, j) => `<li class="${j === q.a ? 'right' : ''}">${o}</li>`).join('') + '</ul>' : '') + `<p><b>Antwort:</b> ${rightText(q)}</p><div class="why">${q.why}<br>${srcList(q.src)}</div>` }))));
  };
  draw(); box.append(sec);
}
function startTest() {
  const by = (t, k) => wPick(POOL.filter(q => q.t === t), k);
  const qs = [...by('zs', 3), ...by('ws', 3), ...by('lst', 4)];
  testState = { qs: qs.map(q => ({ q, order: q.type === 'mc' ? shuffle(q.o.map((_, i) => i)) : null, val: null })), done: false };
  renderTest();
}
function renderTest() {
  const box = document.getElementById('testBody'); box.innerHTML = '';
  const prog = h('div', { class: 'testprog' });
  const updProg = () => { const n = testState.qs.filter(x => x.val !== null && x.val !== '').length; prog.innerHTML = `<div class="bar"><span style="width:${n * 10}%"></span></div><span class="small">${n}/10 beantwortet</span>`; };
  box.append(prog);
  testState.qs.forEach((it, n) => {
    const q = it.q;
    const card = h('div', { class: 'tq' }, h('div', { class: 'tqn' }, `Aufgabe ${n + 1}`, h('span', { class: 'tag' }, TOPIC[q.t])), h('p', { class: 'q' }, q.q));
    if (q.type === 'mc') {
      const opts = h('div', { class: 'opts col' });
      it.order.forEach(oi => opts.append(h('button', { class: 'opt' + (it.val === oi ? ' sel' : ''), onclick: e => { it.val = oi; opts.querySelectorAll('.opt').forEach(b => b.classList.remove('sel')); e.currentTarget.classList.add('sel'); updProg(); } }, q.o[oi])));
      card.append(opts);
    } else {
      const inp = h('input', { class: 'inp' + (q.base ? ' mono' : ''), value: it.val || '', inputmode: q.base ? 'text' : 'decimal', placeholder: 'Antwort eingeben', autocomplete: 'off', spellcheck: 'false', oninput: e => { it.val = e.target.value; updProg(); } });
      card.append(h('div', { class: 'unitin', style: 'max-width:340px' }, inp, q.unit ? h('span', null, q.unit) : null));
    }
    box.append(card);
  });
  updProg();
  box.append(h('div', { class: 'ctrls' }, h('button', { class: 'btn big', onclick: () => submitTest() }, 'Abgeben & benoten'), h('button', { class: 'btn ghost', onclick: () => askConfirm('Test wirklich abbrechen? Deine Antworten gehen verloren.', 'Abbrechen', renderTestStart) }, 'Abbrechen')));
  toTop();
}
function submitTest(force) {
  const open = testState.qs.filter(x => x.val === null || x.val === '').length;
  if (open && force !== true) return askConfirm(`${open} Aufgabe(n) sind noch offen. Trotzdem abgeben?`, 'Trotzdem abgeben', () => submitTest(true));
  const cards = store.get('cards', {});
  let s = 0;
  testState.qs.forEach(it => {
    it.ok = checkAns(it.q, it.val);
    if (it.ok) s++;
    else { const c = cards[it.q.id] || { wrong: 0 }; c.wrong++; c.box = 'open'; c.at = Date.now(); cards[it.q.id] = c; }
  });
  store.set('cards', cards); updBadge();
  const pct = s * 10, g = gradeOf(pct);
  const hist = store.get('tests', []); hist.push({ d: Date.now(), s, n: 10, g: g[1], wrong: testState.qs.filter(x => !x.ok).map(x => x.q.id) }); store.set('tests', hist);
  testState.done = true;
  const box = document.getElementById('testBody'); box.innerHTML = '';
  box.append(h('div', { class: 'result-hero g' + g[1] },
    h('div', { class: 'big-grade' }, g[1]),
    h('div', null, h('div', { class: 'gname' }, g[2]), h('div', null, `${s} von 10 richtig (${pct} %)`),
      h('div', { class: 'small' }, s < 10 ? `${10 - s} falsche Frage(n) sind jetzt bei den Karteikarten markiert.` : 'Alles richtig – stark!'))));
  box.append(h('div', { class: 'ctrls' },
    s < 10 ? h('button', { class: 'btn', onclick: () => { cardDeck = 'open'; location.hash = 'karten'; } }, 'Falsche als Karteikarten lernen') : null,
    h('button', { class: 'btn ghost', onclick: startTest }, 'Neuer Test'),
    h('label', { class: 'donebox' }, h('input', { type: 'checkbox', onchange: e => box.classList.toggle('onlywrong', e.target.checked) }), 'nur falsche zeigen')));
  testState.qs.forEach((it, n) => {
    const q = it.q;
    box.append(h('div', { class: 'tq review ' + (it.ok ? 'ok' : 'bad') },
      h('div', { class: 'tqn' }, `${it.ok ? '✔' : '✘'} Aufgabe ${n + 1}`, h('span', { class: 'tag' + (it.ok ? '' : ' bad') }, it.ok ? 'richtig' : 'falsch – markiert')),
      h('p', { class: 'q' }, q.q),
      h('p', null, h('span', { class: 'lbl2' }, 'Deine Antwort: '), h('span', { class: it.ok ? 'right-t' : 'wrong-t' }, ansText(q, it.val))),
      it.ok ? null : h('p', null, h('span', { class: 'lbl2' }, 'Richtig: '), h('b', { class: 'right-t' }, rightText(q))),
      h('div', { class: 'why', html: '<b>Warum?</b> ' + q.why + '<br>' + srcList(q.src) })));
  });
  toTop();
}

/* ═════════════ KARTEIKARTEN ═════════════ */
let cardDeck = 'open', cardQueue = [], cardFlip = false;
function deckIds(deck) {
  const cards = store.get('cards', {});
  if (deck === 'all') return POOL.map(q => q.id);
  return POOL.filter(q => cards[q.id] && (cards[q.id].box || 'open') === deck).map(q => q.id);
}
function renderCards(rebuild = true) {
  const box = document.getElementById('cardBody'); box.innerHTML = '';
  const cards = store.get('cards', {});
  const nOpen = deckIds('open').length, nKnown = deckIds('known').length;
  updBadge();
  box.append(h('div', { class: 'seg' },
    [['open', `Noch üben (${nOpen})`], ['known', `Kann ich (${nKnown})`], ['all', `Alle ${POOL.length}`]].map(([k, l]) =>
      h('button', { class: cardDeck === k ? 'on' : '', onclick: () => { cardDeck = k; renderCards(); } }, l))));
  if (rebuild) { cardQueue = shuffle(deckIds(cardDeck)); cardFlip = false; }
  if (!cardQueue.length) {
    box.append(h('div', { class: 'empty' }, cardDeck === 'open'
      ? (nKnown ? '🎉 Keine offenen Karten mehr – alles gelernt! Mach einen neuen Test oder wiederhole „Alle“.' : 'Noch keine Karten. Falsche Antworten aus dem Test landen automatisch hier. Du kannst aber jederzeit „Alle“ üben.')
      : 'Noch keine Karte als „Kann ich“ markiert.'));
    return;
  }
  const id = cardQueue[0], q = POOL.find(x => x.id === id), meta = cards[id] || {};
  const card = h('div', { class: 'flash' + (cardFlip ? ' flipped' : '') });
  card.append(h('div', { class: 'tqn' }, `Karte · noch ${cardQueue.length} im Stapel`, h('span', { class: 'tag' }, TOPIC[q.t]), meta.wrong ? h('span', { class: 'tag bad' }, `${meta.wrong}× falsch`) : null));
  card.append(h('p', { class: 'q' }, q.q));
  if (q.type === 'mc') card.append(h('ul', { class: 'cardopts' }, q.o.map((o, i) => h('li', { class: cardFlip && i === q.a ? 'right' : '' }, o))));
  if (!cardFlip) {
    card.append(h('div', { class: 'ctrls' }, h('button', { class: 'btn big', onclick: () => { cardFlip = true; renderCards(false); } }, 'Antwort aufdecken')));
  } else {
    card.append(h('div', { class: 'back' }, h('p', null, h('span', { class: 'lbl2' }, 'Antwort: '), h('b', null, rightText(q))), h('div', { class: 'why', html: q.why + '<br>' + srcList(q.src) })));
    const rate = known => {
      const c = store.get('cards', {}); const m = c[id] || { wrong: 0 };
      if (known) m.box = 'known'; else { m.box = 'open'; if (cardDeck === 'all') m.wrong = (m.wrong || 0) + 1; }
      c[id] = m; store.set('cards', c);
      cardQueue.shift(); if (!known && cardDeck !== 'all') cardQueue.push(id);
      cardFlip = false; renderCards(false);
    };
    card.append(h('div', { class: 'ctrls' },
      h('button', { class: 'btn bad', onclick: () => rate(false) }, '✗ Kann ich noch nicht'),
      h('button', { class: 'btn ok', onclick: () => rate(true) }, '✓ Kann ich')));
  }
  box.append(card);
  box.append(h('p', { class: 'small' }, '„Kann ich noch nicht“ legt die Karte hinten in den Stapel zurück. „Kann ich“ verschiebt sie zu „Kann ich“. ',
    h('button', { class: 'linkbtn', onclick: () => askConfirm('Alle Karteikarten-Markierungen löschen?', 'Löschen', () => { store.set('cards', {}); renderCards(); }) }, 'Alles zurücksetzen')));
}

/* ═════════════ Start ═════════════ */
renderLearnNav();
openModule(curModule);
renderExercises();
updBadge();
showTab(location.hash.slice(1) || store.get('tab', 'lernen'));
window.scrollTo({ top: 0 });

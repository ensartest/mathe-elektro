/* kleine Helfer */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const store = {
  get(k, d) { try { const v = localStorage.getItem('mel_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('mel_' + k, JSON.stringify(v)); } catch (e) { /* privat-Modus */ } }
};
function rnd(n) { return Math.floor(Math.random() * n); }
function rint(a, b) { return a + rnd(b - a + 1); }
function pick(arr) { return arr[rnd(arr.length)]; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function round(x, d = 2) { const f = Math.pow(10, d); return Math.round(x * f) / f; }
function srcList(src) { return (src || []).map(([k, p]) => S(k, p)).join(' '); }
const RAD = Math.PI / 180;

/* Zahl schön auf Deutsch: 3841,5 · 0,0034 · 1 016,48 */
function fmt(x, d = 2) {
  if (x == null || !isFinite(x)) return '–';
  const a = Math.abs(x);
  let dd = d;
  if (a !== 0 && a < 0.1) dd = Math.max(d, -Math.floor(Math.log10(a)) + 2);
  return x.toLocaleString('de-AT', { maximumFractionDigits: Math.min(dd, 12), minimumFractionDigits: 0 }).replace(/[  ]/g, ' ');
}
/* Zahl mit fester Nachkommazahl (für Rechenwege) */
function fx(x, d) { return x.toLocaleString('de-AT', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/[  ]/g, ' '); }
/* Zehnerpotenz hübsch: 10<sup>-6</sup> */
function p10(e) { return `10<sup>${String(e).replace('-', '−')}</sup>`; }

/* Eingabe → Zahl. Akzeptiert 3,84 · 3.84 · 1 234,5 · 2,5·10^3 · 2,5e3 · 2,5*10^-3 · Einheiten hinten werden ignoriert */
function parseDec(raw) {
  let s = String(raw == null ? '' : raw).trim().replace(/[−–]/g, '-').replace(/[×·x]/g, '*').replace(/ | /g, ' ');
  s = s.replace(/\s*(1\/s|s⁻¹|s\^-1)$/i, '');
  if (!s) return NaN;
  const m = s.match(/^([+-]?(?:\d{1,3}(?: \d{3})+(?:[.,]\d+)?|[\d.,]*\d))\s*(?:\*\s*10\s*(?:\^|\*\*)\s*\(?\s*([+-]?\d+)\s*\)?|[eE]\s*([+-]?\d+))?\s*[^\d]*$/);
  if (!m) return NaN;
  let man = m[1].replace(/\s/g, '');
  if (man.includes(',')) man = man.replace(/\./g, '').replace(',', '.');
  else if ((man.match(/\./g) || []).length > 1) man = man.replace(/\./g, '');
  const v = parseFloat(man);
  const e = m[2] != null ? +m[2] : m[3] != null ? +m[3] : 0;
  return v * Math.pow(10, e);
}
/* liegt v nahe genug am exakten Wert? (Standard: 1 % – Rundung auf dem Weg ist erlaubt) */
function near(v, exact, rel = 0.01) {
  if (!isFinite(v)) return false;
  if (exact === 0) return Math.abs(v) < 0.006;
  return Math.abs(v - exact) <= Math.max(rel * Math.abs(exact), 0.0051);
}

function feedback(el, ok, title, msgs, partial) {
  el.innerHTML = '';
  el.className = 'fb ' + (ok ? 'ok' : partial ? 'partial' : 'bad');
  el.append(h('div', { class: 'fb-t', html: (ok ? '✔ ' : partial ? '≈ ' : '✘ ') + title }));
  if (msgs && msgs.length) el.append(h('ul', null, msgs.map(m => h('li', { html: m }))));
}
/* Bestätigung direkt auf der Seite (confirm() ist in manchen Ansichten gesperrt) */
function askConfirm(msg, yesLabel, onYes) {
  const close = () => ov.remove();
  const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' },
    h('div', { class: 'dialog' }, h('p', null, msg),
      h('div', { class: 'ctrls' },
        h('button', { class: 'btn', onclick: () => { close(); onYes(); } }, yesLabel),
        h('button', { class: 'btn ghost', onclick: close }, 'Zurück'))));
  document.body.append(ov);
  ov.querySelector('.btn').focus();
}

/* Bausteine für Rechenwege */
function eq(s) { return `<div class="eq">${s}</div>`; }
function steps(list) {
  return '<ol class="steps">' + list.filter(Boolean).map(([t, b]) => `<li><span class="step-t">${t}</span>${b}</li>`).join('') + '</ol>';
}
function result(s) { return `<p class="result">${s}</p>`; }

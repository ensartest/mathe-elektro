/* Übungen: feste Aufgaben aus Mitschrift/Skript + Zufallsgenerator, mit Fehlerdiagnose und Rechenweg */
const N = (x, d = 2) => fmt(x, d);
const SQ2 = Math.SQRT2, PI2 = 2 * Math.PI;

/* ───────── Zahlenfelder: Prüfen & Fehler erkennen ───────── */
function diagnose(v, f) {
  for (const [tv, msg] of f.traps || []) if (isFinite(tv) && near(v, tv, 0.006)) return msg;
  const r = v / f.exact;
  for (const [fac, txt] of [[1e3, '1000'], [1e6, '1 000 000'], [1e9, '10⁹'], [1e-3, '1/1000'], [1e-6, '1/1 000 000'], [1e-9, '10⁻⁹']])
    if (near(r, fac, 0.01)) return `Dein Wert ist genau Faktor ${txt} daneben → Vorsilbe/Einheit nicht umgerechnet. Gefragt ist die Einheit <b>${f.unit}</b>.`;
  if (near(r, 60, 0.01) || near(r, 1 / 60, 0.01)) return 'Faktor 60 daneben → Stunden und Minuten verwechselt?';
  if (near(r, 100, 0.01) || near(r, 0.01, 0.01)) return 'Faktor 100 daneben → Prozent (85 %) und Dezimalzahl (0,85) verwechselt?';
  if (near(-v, f.exact)) return 'Das Vorzeichen stimmt nicht.';
  if (Math.abs(r - 1) < 0.05) return 'Knapp daneben → wahrscheinlich zu früh gerundet. Rechne mit allen Kommastellen weiter und runde erst am Ende.';
  return 'Stimmt nicht. Schau dir den Lösungsweg an.';
}
function fieldInput(f) {
  const inp = h('input', { class: 'inp', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', placeholder: 'Zahl' });
  const lab = h('label', null, h('span', { html: f.label }), h('span', { class: 'unitin' }, inp, h('span', { html: f.unit })));
  return { lab, inp };
}
function renderNum(task, c) {
  c.area.append(h('div', { class: 'tasktext', html: task.text }));
  if (task.fig) c.area.append(h('figure', { html: task.fig, style: 'max-width:320px' }));
  if (task.given && task.given.length) c.area.append(h('div', { class: 'given' }, task.given.map(g => h('span', { html: g }))));
  const grid = h('div', { class: 'fields' });
  const ins = task.fields.map(f => { const x = fieldInput(f); grid.append(x.lab); return x.inp; });
  c.area.append(grid);
  c.onCheck = () => {
    const msgs = []; let good = 0, empty = 0;
    task.fields.forEach((f, i) => {
      const inp = ins[i], raw = inp.value.trim();
      inp.classList.remove('right', 'wrong');
      if (!raw) { empty++; msgs.push(`<b>${f.label}</b>: noch leer.`); return; }
      const v = parseDec(raw);
      if (!isFinite(v)) { inp.classList.add('wrong'); msgs.push(`<b>${f.label}</b>: „${raw}“ ist keine Zahl. Schreib z. B. 3,84 oder 2,5·10^3.`); return; }
      if (near(v, f.exact, f.tol || 0.01)) { good++; inp.classList.add('right'); msgs.push(`<b>${f.label}</b> = ${N(f.exact, f.d || 2)} ${f.unit} ✓`); }
      else { inp.classList.add('wrong'); msgs.push(`<b>${f.label}</b>: du hast ${N(v, 4)} ${f.unit}. ${diagnose(v, f)}`); }
    });
    const all = good === task.fields.length;
    feedback(c.fb, all, all ? 'Alles richtig!' : good ? `${good} von ${task.fields.length} richtig.` : empty === task.fields.length ? 'Du hast noch nichts eingegeben.' : 'Noch nicht richtig.', msgs, good > 0 && !all);
    if (empty === task.fields.length) return null;
    return all;
  };
  c.solution = () => task.sol;
}

/* ═════════════ 1  Zahlensysteme ═════════════ */
const DIG = '0123456789ABCDEF';
function normBase(s) {
  s = String(s || '').toUpperCase().replace(/[\s_.]/g, '').replace(/^0[BX]/, '').replace(/[₀-₉]+$/, '').replace(/(\(\d+\)|\d?_?\d*)$/, m => /^\(/.test(m) ? '' : m);
  s = s.replace(/^0+(?=.)/, '');
  return s;
}
function divTable(n, b) {
  let rows = '', x = n;
  do { const q = Math.floor(x / b), r = x - q * b; rows += `<tr><td>${x} : ${b}</td><td>${q}</td><td>${b === 16 && r > 9 ? `${r} = <b>${DIG[r]}</b>` : r}${b === 16 && x >= 16 ? ` <span class="small">(${q} · 16 = ${q * 16}, ${x} − ${q * 16} = ${r})</span>` : ''}</td></tr>`; x = q; } while (x > 0);
  return `<div class="scroll"><table class="vt"><tr><th>Rechnung</th><th>Ergebnis</th><th>Rest</th></tr>${rows}</table></div>`;
}
function placeTable(str, b) {
  const L = str.length;
  const head = [...str].map((_, i) => `<td>${b === 2 ? Math.pow(2, L - 1 - i) : '16' + (L - 1 - i ? `<sup>${L - 1 - i}</sup>` : '<sup>0</sup>') + ' = ' + Math.pow(16, L - 1 - i)}</td>`).join('');
  return `<div class="scroll"><table class="vt"><tr><th>Stellenwert</th>${head}</tr><tr><th>Ziffer</th>${[...str].map(d => `<td>${d}</td>`).join('')}</tr></table></div>`;
}
function nib(d) { return parseInt(d, 16).toString(2).padStart(4, '0'); }
function makeBase(kind, n, label) {
  const bin = n.toString(2), hex = n.toString(16).toUpperCase();
  const T = {
    d2b: { q: `Rechne <b>${n}<sub>10</sub></b> ins <b>Binärsystem</b> um.`, ans: bin, to: 2, sol: () => steps([
      ['Immer durch 2 teilen und den Rest notieren', divTable(n, 2)],
      ['Reste von unten nach oben lesen', eq(`${n}<sub>10</sub> = <span class="r">${bin}<sub>2</sub></span>`)],
      ['Probe mit den Stellenwerten', eq([...bin].map((d, i) => d === '1' ? Math.pow(2, bin.length - 1 - i) : null).filter(x => x != null).join(' + ') + ' = ' + n + ' ✓')]]) },
    b2d: { q: `Rechne <b>${bin}<sub>2</sub></b> ins <b>Dezimalsystem</b> um.`, ans: String(n), to: 10, sol: () => steps([
      ['Stellenwerte von rechts aufschreiben: 1, 2, 4, 8, …', placeTable(bin, 2)],
      ['Nur die Stellenwerte addieren, wo eine 1 steht', eq([...bin].map((d, i) => d === '1' ? Math.pow(2, bin.length - 1 - i) : null).filter(x => x != null).join(' + ') + ` = <span class="r">${n}<sub>10</sub></span>`)]]) },
    d2h: { q: `Rechne <b>${n}<sub>10</sub></b> ins <b>Hexadezimalsystem</b> um.`, ans: hex, to: 16, sol: () => steps([
      ['Immer durch 16 teilen, Rest notieren (Rest = Zahl − Ergebnis · 16)', divTable(n, 16)],
      ['Reste über 9 als Buchstaben: 10 = A, 11 = B, 12 = C, 13 = D, 14 = E, 15 = F', ''],
      ['Reste von unten nach oben lesen', eq(`${n}<sub>10</sub> = <span class="r">${hex}<sub>16</sub></span>`)],
      ['Probe', eq([...hex].map((d, i) => `${parseInt(d, 16)}·${Math.pow(16, hex.length - 1 - i)}`).join(' + ') + ` = ${n} ✓`)]]) },
    h2d: { q: `Rechne <b>${hex}<sub>16</sub></b> ins <b>Dezimalsystem</b> um.`, ans: String(n), to: 10, sol: () => steps([
      ['Stellenwerte 1, 16, 256, 4096 von rechts', placeTable(hex, 16)],
      ['Buchstaben in Zahlen übersetzen', /[A-F]/.test(hex) ? eq([...hex].filter(d => /[A-F]/.test(d)).map(d => `${d} = ${parseInt(d, 16)}`).join(', ')) : '<p>Keine Buchstaben dabei.</p>'],
      ['Jede Ziffer mal Stellenwert, dann addieren', eq([...hex].map((d, i) => `${parseInt(d, 16)} · ${Math.pow(16, hex.length - 1 - i)}`).join(' + ') + ` = <span class="r">${n}<sub>10</sub></span>`)]]) },
    h2b: { q: `Rechne <b>${hex}<sub>16</sub></b> ins <b>Binärsystem</b> um (ohne Umweg über Dezimal).`, ans: bin, to: 2, sol: () => steps([
      ['Jede Hex-Ziffer einzeln in genau 4 Bit übersetzen', `<div class="scroll"><table class="vt"><tr><th>Hex</th>${[...hex].map(d => `<td>${d}</td>`).join('')}</tr><tr><th>Dezimal</th>${[...hex].map(d => `<td>${parseInt(d, 16)}</td>`).join('')}</tr><tr><th>4 Bit (8 4 2 1)</th>${[...hex].map(d => `<td>${nib(d)}</td>`).join('')}</tr></table></div>`],
      ['Blöcke hintereinander schreiben (führende Nullen darf man weglassen)', eq(`${hex}<sub>16</sub> = ${[...hex].map(nib).join(' ')} = <span class="r">${bin}<sub>2</sub></span>`)]]) },
    b2h: { q: `Rechne <b>${bin}<sub>2</sub></b> ins <b>Hexadezimalsystem</b> um (ohne Umweg über Dezimal).`, ans: hex, to: 16, sol: () => {
      const pad = bin.padStart(Math.ceil(bin.length / 4) * 4, '0'), grp = pad.match(/.{4}/g);
      return steps([
        ['Von rechts in 4er-Gruppen teilen, vorne mit Nullen auffüllen', eq(grp.join(' '))],
        ['Jede Gruppe mit 8 4 2 1 ausrechnen', `<div class="scroll"><table class="vt"><tr><th>4 Bit</th>${grp.map(g => `<td>${g}</td>`).join('')}</tr><tr><th>Wert</th>${grp.map(g => `<td>${parseInt(g, 2)}</td>`).join('')}</tr><tr><th>Hex</th>${grp.map(g => `<td><b>${DIG[parseInt(g, 2)]}</b></td>`).join('')}</tr></table></div>`],
        ['Ergebnis', eq(`${bin}<sub>2</sub> = <span class="r">${hex}<sub>16</sub></span>`)]]); } }
  }[kind];
  return { kind, n, label, ...T };
}
function baseDiag(t, u) {
  const rev = [...u].reverse().join('');
  if (t.to === 2 && /[^01]/.test(u)) return 'Binärzahlen bestehen nur aus 0 und 1.';
  if (t.to === 10 && /[^0-9]/.test(u)) return 'Gefragt ist eine Dezimalzahl, also nur Ziffern 0–9.';
  if (t.to !== 10 && normBase(rev) === t.ans) return 'Genau verkehrt herum! Die Reste werden <b>von unten nach oben</b> gelesen.';
  if (t.kind === 'h2b') { const loose = [...t.n.toString(16).toUpperCase()].map(d => parseInt(d, 16).toString(2)).join(''); if (normBase(loose) === normBase(u)) return 'Jede Hex-Ziffer braucht <b>genau 4 Bit</b>. Fehlende Nullen innen auffüllen (z. B. 3 → 0011, nicht 11).'; }
  if (t.kind === 'b2d' && +u === parseInt([...t.n.toString(2)].reverse().join(''), 2)) return 'Die Stellenwerte fangen <b>rechts</b> mit 1 an, nicht links.';
  if (t.kind === 'h2d' && u === t.n.toString(16).toUpperCase()) return 'Du hast die Hex-Zahl nur abgeschrieben. Jede Ziffer muss mit 16, 256 … multipliziert werden.';
  if (t.to === 16 && u === String(t.n)) return 'Das ist die Dezimalzahl, gefragt ist Hex.';
  if (t.to === 16 && /^\d+$/.test(u) && /[A-F]/.test(t.ans)) { const asDec = [...t.ans].map(d => parseInt(d, 16)).join(''); if (asDec === u) return 'Reste über 9 schreibt man als Buchstaben: 10 = A, 11 = B, 12 = C, 13 = D, 14 = E, 15 = F.'; }
  if (t.to === 10 && Math.abs(+u - t.n) <= 2) return 'Knapp daneben → nachzählen, ob du einen Stellenwert vergessen oder doppelt gezählt hast.';
  return 'Stimmt nicht. Schau dir den Lösungsweg an.';
}

/* ═════════════ 2  Linux-Rechte ═════════════ */
const RWX = d => (d & 4 ? 'r' : '-') + (d & 2 ? 'w' : '-') + (d & 1 ? 'x' : '-');
function makeRights(kind, oct) {
  const ds = [...oct].map(Number), sym = ds.map(RWX).join('');
  const tbl = `<div class="scroll"><table class="vt"><tr><th></th><th>Besitzer</th><th>Gruppe</th><th>Andere</th></tr><tr><th>Symbol</th>${ds.map(d => `<td>${RWX(d)}</td>`).join('')}</tr><tr><th>r=4 w=2 x=1</th>${ds.map(d => `<td>${[d & 4 ? 4 : 0, d & 2 ? 2 : 0, d & 1 ? 1 : 0].join('+')} = <b>${d}</b></td>`).join('')}</tr></table></div>`;
  return kind === 's2o'
    ? { kind, q: `Welche Zahl gehört zu den Rechten <code>${sym}</code>? (für <code>chmod</code>)`, ans: oct, sol: () => steps([['In 3 Dreiergruppen teilen: Besitzer, Gruppe, Andere', eq(sym.match(/.{3}/g).join(' | '))], ['Je Gruppe r = 4, w = 2, x = 1 addieren, „-“ zählt 0', tbl], ['Ergebnis', result(`chmod ${oct}`)]]) }
    : { kind, q: `Was bedeutet <code>chmod ${oct}</code>? Schreib die Rechte als 9 Zeichen (z. B. rwxr-x---).`, ans: sym, sol: () => steps([['Jede Ziffer ist eine Gruppe: Besitzer, Gruppe, Andere', eq(ds.join(' | '))], ['Ziffer in 4 + 2 + 1 zerlegen: 4 = r, 2 = w, 1 = x', tbl], ['Ergebnis', result(sym)]]) };
}

/* ═════════════ 3  Notation ═════════════ */
const PFX = { 9: 'G', 6: 'M', 3: 'k', 0: '', '-3': 'm', '-6': 'µ', '-9': 'n', '-12': 'p' };
/* D = Ziffernfolge ohne führende/abschließende Nullen; k = Anzahl Stellen vor dem Komma */
function place(D, k) {
  let s;
  if (k <= 0) s = '0,' + '0'.repeat(-k) + D;
  else if (k >= D.length) s = D + '0'.repeat(k - D.length);
  else s = D.slice(0, k) + ',' + D.slice(k);
  const [ip, dp] = s.split(',');
  const g = ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dp ? g + ',' + dp : g;
}
const pv = s => parseFloat(s.replace(/\s/g, '').replace(',', '.'));
function makeNot(kind, D, e, unit, label) {
  const pe = 3 * Math.floor(e / 3);
  const sciM = place(D, 1), techM = place(D, e - pe + 1), plain = place(D, e + 1);
  const pre = PFX[pe];
  const u = unit ? ' ' + unit : '';
  if (kind === 'wiss' || kind === 'tech') {
    const giv = kind === 'wiss' ? `${techM} ${pre}${unit}` : `${plain}${u}`;
    const tgt = kind === 'wiss' ? { m: sciM, e } : { m: techM, e: pe };
    const sol = kind === 'wiss' ? steps([
      [pre ? 'Vorsilbe durch Zehnerpotenz ersetzen' : 'Zahl aufschreiben', eq(pre ? `${pre} = ${p10(pe)} → ${techM} · ${p10(pe)}${u}` : `${techM}${u} = ${techM} · ${p10(0)}`)],
      ['Komma verschieben, bis genau eine Ziffer (1–9) davor steht', eq(`${techM} → ${sciM}`) + `<p>Das Komma wandert um <b>${Math.abs(e - pe)}</b> Stelle(n) nach <b>${e - pe >= 0 ? 'links' : 'rechts'}</b> → Exponent ${e - pe >= 0 ? '+' : '−'}${Math.abs(e - pe)}.</p>`],
      ['Exponent anpassen', eq(`${p10(pe)} → ${p10(e)}`)],
      ['Ergebnis', result(`${sciM} · ${p10(e)}${u}`)]])
      : steps([
      ['Komma so verschieben, dass vorne 1 bis 3 Ziffern stehen und der Exponent durch 3 teilbar ist', `<p>Zähle, um wie viele Stellen das Komma wandert. Nach <b>links</b> → Exponent wird größer, nach <b>rechts</b> → kleiner.</p>` + eq(`${plain} = ${techM} · ${p10(pe)}`)],
      ['Exponent prüfen', `<p>${pe} ist durch 3 teilbar ✓ ${pre ? `und passt zur Vorsilbe <b>${pre}</b>` : ''}</p>`],
      ['Ergebnis', result(`${techM} · ${p10(pe)}${u}${pre ? ` = ${techM} ${pre}${unit}` : ''}`)]]);
    return { kind, label, q: kind === 'wiss' ? `Schreib <b>${giv}</b> in <b>wissenschaftlicher Notation</b> (in ${unit || 'der Grundeinheit'}).` : `Schreib <b>${giv}</b> in <b>technischer Notation</b> (Exponent durch 3 teilbar).`, tgt, val: pv(sciM) * Math.pow(10, e), unit, sol };
  }
  return { kind, label, q: `Schreib <b>${sciM} · ${p10(e)}${u}</b> als ganz normale Zahl (ohne Zehnerpotenz).`, ans: pv(plain), plain, unit, sol: steps([
    [`Exponent ${e} ${e >= 0 ? 'positiv → Komma nach rechts' : 'negativ → Komma nach links'}`, `<p>Das Komma wandert um <b>${Math.abs(e)}</b> Stellen nach ${e >= 0 ? 'rechts' : 'links'}, fehlende Stellen mit Nullen auffüllen.</p>`],
    ['Ergebnis', result(`${plain}${u}`)]]) };
}
function randNot(kind) {
  let D = String(rint(1, 9)); const len = pick([1, 2, 2, 3, 3, 4]);
  for (let i = 1; i < len; i++) D += rint(0, 9);
  D = D.replace(/0+$/, '') || '1';
  const e = kind === 'dez' ? pick([-6, -5, -4, -3, 3, 4, 5, 6, 7, 8]) : rint(-11, 10);
  return makeNot(kind, D, e, pick(['Hz', 'A', 'V', 'W', 'Ω', 'F']));
}

/* ═════════════ 4  Ohm & Leistung ═════════════ */
function makeOhm(kind, U, R, I, ask, label) {
  /* U in V, R in Ω, I in A (exakt); Darstellung mit Präfix */
  const showI = I < 1 ? `${N(I * 1000)} mA` : `${N(I)} A`, showR = R >= 1000 ? `${N(R / 1000)} kΩ` : `${N(R)} Ω`;
  const P = U * I;
  const giv = { UI: [`U = ${N(U)} V`, `I = ${showI}`], UR: [`U = ${N(U)} V`, `R = ${showR}`], RI: [`R = ${showR}`, `I = ${showI}`] }[kind];
  const conv = [I < 1 ? `I = ${showI} = ${N(I, 6)} A` : null, R >= 1000 ? `R = ${showR} = ${N(R)} Ω` : null].filter(Boolean);
  const F = {
    R: { label: 'Widerstand R', unit: 'Ω', exact: R, traps: [[I / U, 'Umgekehrt! R = U / I (Spannung durch Strom).'], [U * I, 'Das ist U · I = Leistung, nicht der Widerstand.']] },
    I: { label: 'Strom I', unit: 'A', exact: I, traps: [[R / U, 'Umgekehrt! I = U / R.'], [U * R, 'Nicht mal: I = U / R (im Dreieck stehen U und R übereinander).']] },
    U: { label: 'Spannung U', unit: 'V', exact: U, traps: [[R / I, 'Nicht teilen: U = R · I.'], [I / R, 'Nicht teilen: U = R · I.']] },
    P: { label: 'Leistung P', unit: 'W', exact: P, traps: [[U / I, 'P = U · I (mal, nicht geteilt).'], [U * R, 'P = U · I, nicht U · R.'], [R * I, 'R · I ist die Spannung, nicht die Leistung. P = U · I.']] }
  };
  const want = ask || ({ UI: ['R', 'P'], UR: ['I', 'P'], RI: ['U', 'P'] }[kind]);
  const miss = { UI: 'R', UR: 'I', RI: 'U' }[kind];
  const formula = { R: `R = U / I = ${N(U)} V / ${N(I, 6)} A = <span class="r">${N(R)} Ω</span>`, I: `I = U / R = ${N(U)} V / ${N(R)} Ω = <span class="r">${N(I, 6)} A</span>${I < 1 ? ` = ${N(I * 1000)} mA` : ''}`, U: `U = R · I = ${N(R)} Ω · ${N(I, 6)} A = <span class="r">${N(U)} V</span>` }[miss];
  const sol = steps([
    ['Gegebene Werte in Grundeinheiten (V, A, Ω) umrechnen', conv.length ? eq(conv.join(' &nbsp;·&nbsp; ')) : '<p>Alles ist schon in V, A und Ω.</p>'],
    want.includes(miss) ? ['Ohmsches Dreieck: gesuchte Größe zuhalten', eq(formula)] : null,
    ['Leistung: P = U · I', eq(`P = ${N(U)} V · ${N(I, 6)} A = <span class="r">${N(P, 4)} W</span>${P >= 1000 ? ` = ${N(P / 1000, 4)} kW` : P < 1 ? ` = ${N(P * 1000)} mW` : ''}`)]]);
  return { label, text: 'Berechne die fehlenden Größen.', given: giv, fields: want.map(k => F[k]), sol };
}
function randOhm() {
  const kind = pick(['UI', 'UR', 'RI']);
  const U = pick([3.3, 5, 9, 12, 24, 48, 230, 230, 400]);
  const R = pick([10, 22, 47, 100, 220, 470, 1000, 2200, 4700, 15, 68, 330]);
  const I = pick([0.012, 0.02, 0.05, 0.1, 0.25, 0.5, 1.5, 2, 3, 4.5]);
  if (kind === 'UI') return makeOhm(kind, U, U / I, I);
  if (kind === 'RI') return makeOhm(kind, R * I, R, I);
  return makeOhm(kind, U, R, U / R);
}

/* ═════════════ 5  Widerstände ═════════════ */
const E12 = [10, 15, 22, 33, 47, 68, 100, 150, 220, 330, 470, 680, 1000];
function makeRes(kind, Rs, U, label) {
  let Rg, sol1;
  const par = a => 1 / a.reduce((s, r) => s + 1 / r, 0);
  if (kind === 'reihe') { Rg = Rs.reduce((a, b) => a + b, 0); sol1 = ['Reihe: einfach addieren', eq(`R<sub>g</sub> = ${Rs.map(r => r + ' Ω').join(' + ')} = <span class="r">${N(Rg)} Ω</span>`)]; }
  else if (kind === 'parallel') {
    Rg = par(Rs);
    sol1 = ['Parallel: Kehrwerte addieren, dann wieder Kehrwert', eq(`1/R<sub>g</sub> = ${Rs.map(r => '1/' + r).join(' + ')} = ${N(1 / Rg, 5)} 1/Ω`) + eq(`R<sub>g</sub> = 1 / ${N(1 / Rg, 5)} = <span class="r">${N(Rg)} Ω</span>`) + (Rs.length === 2 ? `<p>Kurzformel für zwei: R₁·R₂/(R₁+R₂) = ${Rs[0] * Rs[1]}/${Rs[0] + Rs[1]} = ${N(Rg)} Ω.</p>` : '') + `<p>Probe: ${N(Rg)} Ω ist kleiner als der kleinste Widerstand (${Math.min(...Rs)} Ω) ✓</p>`];
  } else {
    const p = par([Rs[1], Rs[2]]); Rg = Rs[0] + p;
    sol1 = ['Zuerst die Parallelgruppe R₂ ∥ R₃, dann R₁ in Reihe dazu', eq(`R₂₃ = ${Rs[1]}·${Rs[2]} / (${Rs[1]}+${Rs[2]}) = ${N(p)} Ω`) + eq(`R<sub>g</sub> = R₁ + R₂₃ = ${Rs[0]} + ${N(p)} = <span class="r">${N(Rg)} Ω</span>`)];
  }
  const I = U / Rg;
  const txt = { reihe: `${Rs.length} Widerstände sind <b>in Reihe</b> geschaltet.`, parallel: `${Rs.length} Widerstände sind <b>parallel</b> geschaltet.`, gruppe: `R₁ liegt <b>in Reihe</b> zu einer <b>Parallelschaltung</b> aus R₂ und R₃.` }[kind];
  const sum = Rs.reduce((a, b) => a + b, 0);
  return { label, text: txt + ` Es liegt U = ${U} V an. Berechne Gesamtwiderstand und Gesamtstrom.`,
    given: Rs.map((r, i) => `R${'₁₂₃'[i]} = ${r} Ω`).concat(`U = ${U} V`),
    fields: [
      { label: 'Gesamtwiderstand R<sub>g</sub>', unit: 'Ω', exact: Rg, traps: kind === 'reihe' ? [] : [[sum, 'Du hast einfach addiert – das gilt nur in Reihe. Parallel werden die Kehrwerte addiert.'], [1 / Rg, 'Das ist 1/R<sub>g</sub>. Am Ende noch den Kehrwert bilden (1/x)!']] },
      { label: 'Gesamtstrom I', unit: 'A', exact: I, traps: [[U * Rg, 'I = U / R, nicht U · R.'], [Rg / U, 'Umgekehrt: I = U / R.']] }],
    sol: steps([sol1, ['Strom mit dem Ohmschen Gesetz', eq(`I = U / R<sub>g</sub> = ${U} V / ${N(Rg)} Ω = <span class="r">${N(I, 4)} A</span>`)]]) };
}
function randRes() {
  const kind = pick(['reihe', 'parallel', 'parallel', 'gruppe']);
  const n = kind === 'gruppe' ? 3 : pick([2, 2, 3]);
  return makeRes(kind, Array.from({ length: n }, () => pick(E12)), pick([9, 12, 24, 230]));
}

/* ═════════════ 6  Pythagoras ═════════════ */
function makePy(kind, a, b, c, gv, unit, label, txt) {
  /* kind 'c' → c gesucht aus a,b; 'kat' → fehlende Kathete aus c und einer Kathete. a,b,c in der Ziel-Einheit */
  const tgt = kind === 'c' ? c : b;
  const name = kind === 'c' ? 'Hypotenuse c' : 'Kathete b';
  const conv = gv.conv ? ['Zuerst alles in dieselbe Einheit', eq(gv.conv)] : null;
  const sol = kind === 'c' ? steps([conv,
    ['Gesucht ist die Hypotenuse → Formel mit Plus', eq('c = √(a² + b²)')],
    ['Einsetzen und quadrieren', eq(`c = √(${N(a)}² + ${N(b)}²) = √(${N(a * a)} + ${N(b * b)}) = √${N(a * a + b * b)}`)],
    ['Wurzel ziehen', result(`c = ${N(c)} ${unit}`)]])
    : steps([conv,
    ['Gesucht ist eine Kathete → Formel mit Minus', eq('b = √(c² − a²)')],
    ['Einsetzen und quadrieren', eq(`b = √(${N(c)}² − ${N(a)}²) = √(${N(c * c)} − ${N(a * a)}) = √${N(c * c - a * a)}`)],
    ['Wurzel ziehen', result(`b = ${N(b)} ${unit}`)]]);
  const traps = kind === 'c' ? [[a + b, 'Seiten nicht einfach addieren! c = √(a² + b²).'], [a * a + b * b, 'Das ist c². Jetzt noch die Wurzel ziehen.']]
    : [[Math.sqrt(c * c + a * a), 'Bei einer Kathete wird subtrahiert: b = √(c² − a²).'], [c - a, 'Nicht einfach abziehen. Erst quadrieren: b = √(c² − a²).'], [c * c - a * a, 'Das ist b². Jetzt noch die Wurzel ziehen.']];
  return { label, text: txt || `Rechtwinkliges Dreieck: berechne die ${name}.`, fig: SVG_TRI, given: gv.list, fields: [{ label: name, unit, exact: tgt, traps }], sol };
}
function randPy() {
  const u = pick(['cm', 'm', 'mm']);
  const a = round(rint(20, 150) / 10, 1), b = round(rint(20, 150) / 10, 1);
  const c = Math.sqrt(a * a + b * b);
  if (Math.random() < .5) return makePy('c', a, b, c, { list: [`a = ${N(a)} ${u}`, `b = ${N(b)} ${u}`] }, u);
  const cR = round(c, 1); const bb = Math.sqrt(cR * cR - a * a);
  return makePy('kat', a, bb, cR, { list: [`c = ${N(cR)} ${u}`, `a = ${N(a)} ${u}`] }, u);
}

/* ═════════════ 7  Winkelfunktionen ═════════════ */
function makeTrig(kind, o, label, txt) {
  /* o: {a, b, c, al} vollständig; kind 'w-ab' | 'w-ac' | 'w-bc' (Winkel aus zwei Seiten) | 's-c' | 's-a' | 's-b' (Seiten aus α und einer Seite) */
  const { a, b, c, al } = o, be = 90 - al, u = o.u || 'cm';
  const deg = x => `${N(x)}°`;
  if (kind[0] === 'w') {
    const pair = kind.slice(2);
    const fn = { ab: ['tan', 'a', 'b', a / b, 'Gegenkathete und Ankathete → tan'], ac: ['sin', 'a', 'c', a / c, 'Gegenkathete und Hypotenuse → sin'], bc: ['cos', 'b', 'c', b / c, 'Ankathete und Hypotenuse → cos'] }[pair];
    const v = { a, b, c };
    return { label, text: txt || 'Berechne die beiden spitzen Winkel α und β (Taschenrechner auf DEG).', fig: SVG_TRI,
      given: [`${fn[1]} = ${N(v[fn[1]])} ${u}`, `${fn[2]} = ${N(v[fn[2]])} ${u}`],
      fields: [{ label: 'Winkel α', unit: '°', exact: al, tol: 0.005, traps: [[al * RAD, 'Das ist das Ergebnis im <b>RAD</b>-Modus. Stell den Taschenrechner auf DEG!'], [be, 'Das ist β, nicht α. Gegen- und Ankathete von α aus sehen!']] },
        { label: 'Winkel β', unit: '°', exact: be, tol: 0.005, traps: [[al, 'Das ist α. β = 90° − α.'], [180 - al, 'Im rechtwinkligen Dreieck gilt β = 90° − α (nicht 180° − α).']] }],
      sol: steps([['Seiten von α aus benennen', `<p>a liegt <b>gegenüber</b> von α (Gegenkathete), b liegt <b>an</b> α (Ankathete), c ist die Hypotenuse. Gegeben sind ${fn[1]} und ${fn[2]}: <b>${fn[4]}</b>.</p>`],
        ['Verhältnis ausrechnen', eq(`${fn[0]} α = ${fn[1]} / ${fn[2]} = ${N(v[fn[1]])} / ${N(v[fn[2]])} = ${N(fn[3], 4)}`)],
        ['Umkehrfunktion (SHIFT + ' + fn[0] + ')', eq(`α = ${fn[0]}⁻¹(${N(fn[3], 4)}) = <span class="r">${deg(al)}</span>`)],
        ['Zweiter Winkel: alle Winkel zusammen 180°', eq(`β = 90° − ${deg(al)} = <span class="r">${deg(be)}</span>`)]]) };
  }
  const g = kind.slice(2), s = Math.sin(al * RAD), co = Math.cos(al * RAD), t = Math.tan(al * RAD);
  const sr = Math.sin(al), cr = Math.cos(al);
  const spec = {
    c: { giv: `c = ${N(c)} ${u}`, f: [{ label: 'Seite a', unit: u, exact: a, traps: [[c * co, 'Vertauscht: a = c · <b>sin</b> α (Gegenkathete gehört zu sin).'], [c * sr, 'RAD-Modus! Taschenrechner auf DEG stellen.']] }, { label: 'Seite b', unit: u, exact: b, traps: [[c * s, 'Vertauscht: b = c · <b>cos</b> α (Ankathete gehört zu cos).'], [c * cr, 'RAD-Modus! Taschenrechner auf DEG stellen.']] }],
      st: [['a: Gegenkathete und Hypotenuse → sin', eq(`sin α = a / c → a = c · sin α = ${N(c)} · sin ${N(al)}° = ${N(c)} · ${N(s, 4)} = <span class="r">${N(a)} ${u}</span>`)], ['b: Ankathete und Hypotenuse → cos', eq(`cos α = b / c → b = c · cos α = ${N(c)} · ${N(co, 4)} = <span class="r">${N(b)} ${u}</span>`)]] },
    a: { giv: `a = ${N(a)} ${u}`, f: [{ label: 'Seite b', unit: u, exact: b, traps: [[a * t, 'Umgekehrt umgeformt: tan α = a / b → b = a / tan α.']] }, { label: 'Hypotenuse c', unit: u, exact: c, traps: [[a * s, 'Umgekehrt umgeformt: sin α = a / c → c = a / sin α.'], [a / co, 'Das ist mit cos gerechnet. a ist die Gegenkathete → sin.']] }],
      st: [['b: Gegen- und Ankathete → tan', eq(`tan α = a / b → b = a / tan α = ${N(a)} / ${N(t, 4)} = <span class="r">${N(b)} ${u}</span>`)], ['c: Gegenkathete und Hypotenuse → sin', eq(`sin α = a / c → c = a / sin α = ${N(a)} / ${N(s, 4)} = <span class="r">${N(c)} ${u}</span>`)], ['Probe mit Pythagoras', eq(`√(${N(a)}² + ${N(b)}²) = ${N(Math.hypot(a, b))} ✓`)]] },
    b: { giv: `b = ${N(b)} ${u}`, f: [{ label: 'Seite a', unit: u, exact: a, traps: [[b / t, 'Umgekehrt umgeformt: tan α = a / b → a = b · tan α.']] }, { label: 'Hypotenuse c', unit: u, exact: c, traps: [[b * co, 'Umgekehrt umgeformt: cos α = b / c → c = b / cos α.']] }],
      st: [['a: Gegen- und Ankathete → tan', eq(`tan α = a / b → a = b · tan α = ${N(b)} · ${N(t, 4)} = <span class="r">${N(a)} ${u}</span>`)], ['c: Ankathete und Hypotenuse → cos', eq(`cos α = b / c → c = b / cos α = ${N(b)} / ${N(co, 4)} = <span class="r">${N(c)} ${u}</span>`)]] }
  }[g];
  return { label, text: txt || 'Berechne die fehlenden Seiten und den Winkel β (Taschenrechner auf DEG).', fig: SVG_TRI, given: [`α = ${N(al)}°`, spec.giv],
    fields: spec.f.concat({ label: 'Winkel β', unit: '°', exact: be, tol: 0.005, traps: [[180 - al, 'β = 90° − α.']] }),
    sol: steps([['Seiten von α aus benennen', '<p>a = Gegenkathete, b = Ankathete, c = Hypotenuse (siehe Skizze).</p>'], ...spec.st, ['Winkel β', eq(`β = 90° − ${N(al)}° = <span class="r">${N(be)}°</span>`)]]) };
}
function trigFrom(al, side, val, u) {
  const s = Math.sin(al * RAD), co = Math.cos(al * RAD);
  const c = side === 'c' ? val : side === 'a' ? val / s : val / co;
  return { a: c * s, b: c * co, c, al, u };
}
function randTrig() {
  const u = pick(['cm', 'm', 'dm']);
  if (Math.random() < .5) {
    const a = rint(2, 15), b = rint(2, 15), c = Math.hypot(a, b), al = Math.atan2(a, b) / RAD;
    const kind = pick(['w-ab', 'w-ac', 'w-bc']);
    const o = { a, b, c, al, u };
    if (kind !== 'w-ab') { o.c = round(c, 2); if (kind === 'w-ac') { o.al = Math.asin(a / o.c) / RAD; o.b = Math.sqrt(o.c * o.c - a * a); } else { o.al = Math.acos(b / o.c) / RAD; o.a = Math.sqrt(o.c * o.c - b * b); } }
    return makeTrig(kind, o);
  }
  const side = pick(['a', 'b', 'c']);
  return makeTrig('s-' + side, trigFrom(rint(15, 75), side, round(rint(20, 150) / 10, 1), u));
}

/* ═════════════ 8  Wechselspannung ═════════════ */
function makeAC(vk, vv, tk, tv, label) {
  /* vk: 'eff' | 'hat' | 'ss'; tk: 'f' | 'T' (T in ms) */
  const hat = vk === 'eff' ? vv * SQ2 : vk === 'ss' ? vv / 2 : vv;
  const eff = hat / SQ2, ss = 2 * hat;
  const f = tk === 'f' ? tv : 1000 / tv, T = 1000 / f, w = PI2 * f;
  const VN = { eff: 'U<sub>eff</sub>', hat: 'Û', ss: 'U<sub>ss</sub>' };
  const F = {
    eff: { label: 'Effektivwert U<sub>eff</sub>', unit: 'V', exact: eff, traps: [[hat * SQ2, 'Umgekehrt! U<sub>eff</sub> ist <b>kleiner</b> als Û: U<sub>eff</sub> = Û / √2.'], [ss / 2, 'Das ist Û. U<sub>eff</sub> = Û / √2.'], [ss / SQ2, 'Erst U<sub>ss</sub> halbieren (= Û), dann durch √2.']] },
    hat: { label: 'Scheitelwert Û', unit: 'V', exact: hat, traps: [[eff / SQ2, 'Umgekehrt! Û ist <b>größer</b> als U<sub>eff</sub>: Û = U<sub>eff</sub> · √2.'], [ss, 'Das ist U<sub>ss</sub>. Û ist die Hälfte davon.']] },
    ss: { label: 'Spitze-Spitze U<sub>ss</sub>', unit: 'V', exact: ss, traps: [[2 * eff, 'U<sub>ss</sub> = 2 · <b>Û</b>, nicht 2 · U<sub>eff</sub>.'], [hat, 'Das ist nur Û. U<sub>ss</sub> = 2 · Û.']] },
    f: { label: 'Frequenz f', unit: 'Hz', exact: f, traps: [] },
    T: { label: 'Periodendauer T', unit: 'ms', exact: T, traps: [] },
    w: { label: 'Kreisfrequenz ω', unit: '1/s', exact: w, traps: [[Math.PI * f, 'ω = <b>2</b>π · f – die 2 fehlt.'], [2 * f, 'ω = 2<b>π</b> · f – π fehlt.'], [PI2 / f, 'ω = 2π · f (mal, nicht geteilt).']] }
  };
  const vAsk = ['eff', 'hat', 'ss'].filter(k => k !== vk), tAsk = tk === 'f' ? 'T' : 'f';
  const st = [];
  if (vk === 'eff') st.push(['Scheitelwert aus dem Effektivwert', eq(`Û = U<sub>eff</sub> · √2 = ${N(vv)} V · 1,4142 = <span class="r">${N(hat)} V</span>`)], ['Spitze-Spitze', eq(`U<sub>ss</sub> = 2 · Û = 2 · ${N(hat)} V = <span class="r">${N(ss)} V</span>`)]);
  if (vk === 'hat') st.push(['Effektivwert', eq(`U<sub>eff</sub> = Û / √2 = ${N(vv)} V / 1,4142 = <span class="r">${N(eff)} V</span>`)], ['Spitze-Spitze', eq(`U<sub>ss</sub> = 2 · Û = 2 · ${N(vv)} V = <span class="r">${N(ss)} V</span>`)]);
  if (vk === 'ss') st.push(['Zuerst Û: Spitze-Spitze halbieren', eq(`Û = U<sub>ss</sub> / 2 = ${N(vv)} V / 2 = <span class="r">${N(hat)} V</span>`)], ['Effektivwert', eq(`U<sub>eff</sub> = Û / √2 = ${N(hat)} V / 1,4142 = <span class="r">${N(eff)} V</span>`)]);
  if (tk === 'f') st.push(['Periodendauer: T = 1 / f', eq(`T = 1 / ${N(f)} Hz = ${N(1 / f, 6)} s = <span class="r">${N(T, 4)} ms</span>`) + '<p>Sekunden mal 1000 = Millisekunden.</p>']);
  else st.push(['Zuerst T in Sekunden: ms durch 1000', eq(`T = ${N(tv, 4)} ms = ${N(tv / 1000, 6)} s`)], ['Frequenz: f = 1 / T', eq(`f = 1 / ${N(tv / 1000, 6)} s = <span class="r">${N(f)} Hz</span>`)]);
  st.push(['Kreisfrequenz: ω = 2π · f', eq(`ω = 2 · π · ${N(f)} Hz = <span class="r">${N(w)} 1/s</span>`)]);
  return { label, text: 'Sinusförmige Wechselspannung. Berechne die fehlenden Kenngrößen.', given: [`${VN[vk]} = ${N(vv)} V`, tk === 'f' ? `f = ${N(tv)} Hz` : `T = ${N(tv, 4)} ms`],
    fields: [...vAsk.map(k => F[k]), F[tAsk], F.w], sol: steps(st) };
}
function randAC() {
  const vk = pick(['eff', 'eff', 'hat', 'ss']);
  const vv = vk === 'eff' ? pick([230, 12, 24, 6, 110, 400, 9, 48]) : vk === 'hat' ? pick([10, 12, 15, 5, 100, 325, 20]) : pick([10, 20, 30, 50, 100, 650]);
  return Math.random() < .5 ? makeAC(vk, vv, 'f', pick([50, 60, 100, 400, 1000, 2000, 250])) : makeAC(vk, vv, 'T', pick([20, 10, 2.5, 1, 0.5, 0.2, 5]));
}

/* ═════════════ 9  Blindwiderstand ═════════════ */
function makeX(kind, o, label) {
  const st = [];
  if (kind === 'C' || kind === 'L') {
    const isC = kind === 'C';
    const base = isC ? o.C : o.L; /* in F bzw. H */
    const show = isC ? (o.C >= 1e-6 ? `${N(o.C * 1e6)} µF` : `${N(o.C * 1e9)} nF`) : (o.L >= 1 ? `${N(o.L)} H` : `${N(o.L * 1000)} mH`);
    const w = PI2 * o.f, X = isC ? 1 / (w * base) : w * base, I = o.U / X;
    st.push(['In Grundeinheiten umrechnen', eq(`${isC ? 'C' : 'L'} = ${show} = ${N(base, 9)} ${isC ? 'F' : 'H'}`)]);
    st.push([isC ? 'Kapazitiver Blindwiderstand: X<sub>C</sub> = 1 / (2π · f · C)' : 'Induktiver Blindwiderstand: X<sub>L</sub> = 2π · f · L',
      isC ? eq(`X<sub>C</sub> = 1 / (2 · π · ${N(o.f)} Hz · ${N(base, 9)} F) = 1 / ${N(w * base, 6)} = <span class="r">${N(X)} Ω</span>`) + '<p>Am Taschenrechner: <b>1 ÷ (</b>2 × π × f × C<b>)</b> – Klammer nicht vergessen!</p>'
        : eq(`X<sub>L</sub> = 2 · π · ${N(o.f)} Hz · ${N(base, 6)} H = <span class="r">${N(X)} Ω</span>`)]);
    st.push(['Strom wie beim Ohmschen Gesetz: I = U / X', eq(`I = ${N(o.U)} V / ${N(X)} Ω = ${N(I, 6)} A = <span class="r">${N(I * 1000)} mA</span>`)]);
    const xl = isC ? 'X<sub>C</sub>' : 'X<sub>L</sub>';
    return { label, text: `${isC ? 'Ein Kondensator' : 'Eine (ideale) Spule'} liegt an Wechselspannung. Berechne Blindwiderstand und Strom.`, given: [`${isC ? 'C' : 'L'} = ${show}`, `f = ${N(o.f)} Hz`, `U = ${N(o.U)} V`],
      fields: [{ label: 'Blindwiderstand ' + xl, unit: 'Ω', exact: X, traps: isC ? [[w * base, 'Kehrwert vergessen: X<sub>C</sub> = <b>1 /</b> (2π f C).'], [1 / (o.f * base), '2π vergessen: X<sub>C</sub> = 1 / (<b>2π</b> · f · C).'], [1 / (2 * o.f * base), 'π vergessen: X<sub>C</sub> = 1 / (2<b>π</b> · f · C).']] : [[o.f * base, '2π vergessen: X<sub>L</sub> = <b>2π</b> · f · L.'], [1 / (w * base), 'Das ist die Kondensator-Formel. Bei der Spule: X<sub>L</sub> = 2π · f · L (ohne Kehrwert).']] },
        { label: 'Strom I', unit: 'mA', exact: I * 1000, traps: [[o.U * X * 1000, 'I = U / X, nicht U · X.'], [X / o.U * 1000, 'Umgekehrt: I = U / X.']] }],
      sol: steps(st) };
  }
  /* Frequenz gesucht */
  const isC = kind === 'fC';
  const f = isC ? 1 / (PI2 * o.C * o.X) : o.X / (PI2 * o.L);
  return { label, text: `${isC ? 'Ein Kondensator' : 'Eine Spule'} hat bei einer bestimmten Frequenz den angegebenen Blindwiderstand. Bei welcher Frequenz?`,
    given: [isC ? `C = ${N(o.C * 1e6)} µF` : `L = ${N(o.L * 1000)} mH`, `X${isC ? '<sub>C</sub>' : '<sub>L</sub>'} = ${N(o.X)} Ω`],
    fields: [{ label: 'Frequenz f', unit: 'Hz', exact: f, traps: isC ? [[PI2 * o.C * o.X, 'Kehrwert vergessen: f = <b>1 /</b> (2π · C · X<sub>C</sub>).']] : [[PI2 * o.L * o.X, 'Umgekehrt: f = X<sub>L</sub> / (2π · L).']] }],
    sol: steps([['Formel nach f umstellen', isC ? eq('X<sub>C</sub> = 1 / (2π f C) → f = 1 / (2π · C · X<sub>C</sub>)') : eq('X<sub>L</sub> = 2π f L → f = X<sub>L</sub> / (2π · L)')],
      ['Einheiten: µF bzw. mH in F bzw. H', eq(isC ? `C = ${N(o.C, 9)} F` : `L = ${N(o.L, 6)} H`)],
      ['Einsetzen', eq(isC ? `f = 1 / (2 · π · ${N(o.C, 9)} F · ${N(o.X)} Ω) = <span class="r">${N(f)} Hz</span>` : `f = ${N(o.X)} Ω / (2 · π · ${N(o.L, 6)} H) = <span class="r">${N(f)} Hz</span>`)]]) };
}
function randX() {
  const k = pick(['C', 'C', 'L', 'L', 'fC', 'fL']);
  if (k === 'C') return makeX('C', { C: pick([1, 2.2, 4.7, 10, 0.47, 0.1]) * 1e-6, f: pick([50, 100, 1000, 400]), U: pick([230, 12, 24, 5]) });
  if (k === 'L') return makeX('L', { L: pick([0.1, 0.5, 1, 2, 10, 0.022]), f: pick([50, 100, 1000, 400]), U: pick([230, 12, 24]) });
  if (k === 'fC') return makeX('fC', { C: pick([1, 2.2, 4.7, 10]) * 1e-6, X: pick([100, 318, 50, 680, 1000]) });
  return makeX('fL', { L: pick([10, 22, 47, 100, 220]) / 1000, X: pick([100, 50, 314, 680, 1000]) });
}

/* ═════════════ 10  Leistungsdreieck ═════════════ */
function makeLD(kind, o, label) {
  const k = o.k ? 1000 : 1, pre = o.k ? 'k' : '';
  let U = o.U, I = o.I, P, Q, S, cos;
  if (kind === 'UIcos') { S = U * I; cos = o.cos; P = S * cos; Q = Math.sqrt(S * S - P * P); }
  if (kind === 'UIP') { S = U * I; P = o.P; Q = Math.sqrt(S * S - P * P); cos = P / S; }
  if (kind === 'PQ') { P = o.P; Q = o.Q; S = Math.hypot(P, Q); cos = P / S; }
  if (kind === 'SP') { S = o.S; P = o.P; Q = Math.sqrt(S * S - P * P); cos = P / S; }
  if (kind === 'Pcos') { P = o.P; cos = o.cos; S = P / cos; Q = Math.sqrt(S * S - P * P); I = S * k / U; }
  const phi = Math.acos(cos) / RAD;
  const F = {
    S: { label: 'Scheinleistung S', unit: pre + 'VA', exact: S, traps: [[P + Q, 'S ≠ P + Q! Die Leistungen stehen im rechten Winkel → Pythagoras: S = √(P² + Q²).'], [P * cos, 'S = P / cos φ (geteilt, S ist größer als P).']] },
    P: { label: 'Wirkleistung P', unit: pre + 'W', exact: P, traps: [[S * Math.sin(phi * RAD), 'Das ist Q (mit sin). Wirkleistung: P = S · <b>cos</b> φ.'], [S / cos, 'P = S · cos φ (mal, nicht geteilt).']] },
    Q: { label: 'Blindleistung Q', unit: pre + 'var', exact: Q, traps: [[S - P, 'Q ≠ S − P! Pythagoras: Q = √(S² − P²).'], [S * cos, 'Das ist P. Für Q brauchst du sin φ oder √(S² − P²).'], [Math.sqrt(S * S + P * P), 'Bei Q wird subtrahiert: Q = √(S² − P²).']] },
    cos: { label: 'Leistungsfaktor cos φ', unit: '', exact: cos, tol: 0.012, d: 3, traps: [[S / P, 'Umgekehrt: cos φ = P / S (Ergebnis muss ≤ 1 sein).'], [Q / S, 'Das ist sin φ = Q / S. cos φ = P / S.']] },
    phi: { label: 'Winkel φ', unit: '°', exact: phi, tol: 0.01, traps: [[phi * RAD, 'RAD-Modus! Auf DEG umstellen.'], [90 - phi, 'Das ist 90° − φ. φ = cos⁻¹(P/S).']] },
    I: { label: 'Strom I', unit: 'A', exact: I, traps: [[P * k / U, 'I = <b>S</b> / U, nicht P / U. Der Strom hängt an der Scheinleistung.'], [S * k * U, 'I = S / U (geteilt).']] }
  };
  const ask = { UIcos: ['S', 'P', 'Q', 'phi'], UIP: ['S', 'Q', 'cos'], PQ: ['S', 'cos', 'phi'], SP: ['Q', 'cos'], Pcos: ['S', 'Q', 'I'] }[kind];
  const giv = { UIcos: [`U = ${N(U)} V`, `I = ${N(I)} A`, `cos φ = ${N(o.cos, 3)}`], UIP: [`U = ${N(U)} V`, `I = ${N(I)} A`, `P = ${N(P)} ${pre}W`], PQ: [`P = ${N(P)} ${pre}W`, `Q = ${N(Q)} ${pre}var`], SP: [`S = ${N(S)} ${pre}VA`, `P = ${N(P)} ${pre}W`], Pcos: [`P = ${N(P)} ${pre}W`, `cos φ = ${N(cos, 3)}`, `U = ${N(U)} V`] }[kind];
  const u = x => pre + x;
  const st = [];
  if (kind === 'UIcos' || kind === 'UIP') st.push(['Scheinleistung: S = U · I', eq(`S = ${N(U)} V · ${N(I)} A = <span class="r">${N(S)} VA</span>`)]);
  if (kind === 'UIcos') st.push(['Wirkleistung: P = S · cos φ', eq(`P = ${N(S)} VA · ${N(cos, 3)} = <span class="r">${N(P)} W</span>`)]);
  if (kind === 'PQ') st.push(['Scheinleistung mit Pythagoras', eq(`S = √(P² + Q²) = √(${N(P)}² + ${N(Q)}²) = √${N(P * P + Q * Q)} = <span class="r">${N(S)} ${u('VA')}</span>`)]);
  if (kind === 'Pcos') st.push(['Scheinleistung: S = P / cos φ', eq(`S = ${N(P)} ${u('W')} / ${N(cos, 3)} = <span class="r">${N(S)} ${u('VA')}</span>`)]);
  if (ask.includes('Q')) st.push(['Blindleistung mit Pythagoras: Q = √(S² − P²)', eq(`Q = √(${N(S)}² − ${N(P)}²) = √(${N(S * S)} − ${N(P * P)}) = √${N(S * S - P * P)} = <span class="r">${N(Q)} ${u('var')}</span>`)]);
  if (ask.includes('cos')) st.push(['Leistungsfaktor: cos φ = P / S', eq(`cos φ = ${N(P)} / ${N(S)} = <span class="r">${N(cos, 3)}</span>`)]);
  if (ask.includes('phi')) st.push(['Winkel: φ = cos⁻¹(cos φ) im DEG-Modus', eq(`φ = cos⁻¹(${N(cos, 4)}) = <span class="r">${N(phi)}°</span>`)]);
  if (ask.includes('I')) st.push(['Strom: I = S / U (mit S in VA!)', eq(`I = ${N(S * k)} VA / ${N(U)} V = <span class="r">${N(I)} A</span>`)]);
  st.push(['Einheiten-Check', '<p>P in <b>W</b>, Q in <b>var</b>, S in <b>VA</b>. cos φ hat keine Einheit und liegt zwischen 0 und 1.</p>']);
  return { label, text: 'Berechne die fehlenden Größen im Leistungsdreieck.', fig: SVG_LD, given: giv, fields: ask.map(x => F[x]), sol: steps(st) };
}
function randLD() {
  const kind = pick(['UIcos', 'UIP', 'PQ', 'SP', 'Pcos']);
  const U = pick([230, 230, 400, 110]), I = round(rint(10, 200) / 10, 1), cos = pick([0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]);
  if (kind === 'UIcos') return makeLD(kind, { U, I, cos });
  if (kind === 'UIP') return makeLD(kind, { U, I, P: round(U * I * cos, 0) });
  if (kind === 'PQ') return Math.random() < .5 ? makeLD(kind, { P: rint(1, 20), Q: rint(1, 15), k: true }) : makeLD(kind, { P: rint(100, 3000), Q: rint(50, 2000) });
  if (kind === 'SP') { const S = rint(500, 5000); return makeLD(kind, { S, P: round(S * cos, 0) }); }
  return makeLD(kind, { P: rint(200, 3500), cos, U });
}

/* ═════════════ 11  Kompensation ═════════════ */
function makeKomp(o, label) {
  const { P, cos, QC, U } = o; /* P in kW, QC in kvar */
  const S1 = P / cos, Q1 = Math.sqrt(S1 * S1 - P * P), Q2 = Q1 - QC, S2 = Math.hypot(P, Q2), cos2 = P / S2, I1 = S1 * 1000 / U, I2 = S2 * 1000 / U;
  return { label, text: `Ein induktiver Verbraucher (Motor) wird mit einem Kondensator <b>parallel</b> kompensiert. Berechne die Werte vor und nach der Kompensation.`, fig: SVG_KOMP,
    given: [`P = ${N(P)} kW`, `cos φ<sub>vorher</sub> = ${N(cos, 2)}`, `Q<sub>C</sub> = ${N(QC)} kvar`, `U = ${U} V`],
    fields: [
      { label: 'Q<sub>L</sub> vorher', unit: 'kvar', exact: Q1, traps: [[S1 - P, 'Q ≠ S − P. Q = √(S² − P²).']] },
      { label: 'S vorher', unit: 'kVA', exact: S1, traps: [[P * cos, 'S = P / cos φ (geteilt!).']] },
      { label: 'S nachher', unit: 'kVA', exact: S2, traps: [[Math.hypot(P, Q1 + QC), 'Der Kondensator <b>verkleinert</b> Q: Q<sub>neu</sub> = Q<sub>L</sub> − Q<sub>C</sub>.'], [S1 - QC, 'Nicht S − Q<sub>C</sub>! Erst Q<sub>neu</sub> = Q<sub>L</sub> − Q<sub>C</sub>, dann S = √(P² + Q<sub>neu</sub>²).']] },
      { label: 'cos φ nachher', unit: '', exact: cos2, tol: 0.006, d: 3, traps: [[S2 / P, 'Umgekehrt: cos φ = P / S.']] },
      { label: 'Strom I nachher', unit: 'A', exact: I2, traps: [[P * 1000 / U, 'I = S / U, nicht P / U.'], [I1, 'Das ist der Strom <b>vorher</b>.']] }],
    sol: steps([
      ['Vorher: Scheinleistung aus P und cos φ', eq(`S<sub>1</sub> = P / cos φ = ${N(P)} kW / ${N(cos)} = <span class="r">${N(S1)} kVA</span>`)],
      ['Vorher: Blindleistung (Pythagoras)', eq(`Q<sub>L</sub> = √(S² − P²) = √(${N(S1)}² − ${N(P)}²) = <span class="r">${N(Q1)} kvar</span>`) + `<p>Strom vorher: I = ${N(S1 * 1000)} VA / ${U} V = ${N(I1)} A</p>`],
      ['Kondensator zieht Q<sub>C</sub> ab', eq(`Q<sub>neu</sub> = Q<sub>L</sub> − Q<sub>C</sub> = ${N(Q1)} − ${N(QC)} = ${N(Q2)} kvar`)],
      ['Nachher: neue Scheinleistung (P bleibt gleich!)', eq(`S<sub>2</sub> = √(${N(P)}² + ${N(Q2)}²) = <span class="r">${N(S2)} kVA</span>`)],
      ['Nachher: Leistungsfaktor', eq(`cos φ = P / S<sub>2</sub> = ${N(P)} / ${N(S2)} = <span class="r">${N(cos2, 3)}</span>`)],
      ['Nachher: Strom', eq(`I = ${N(S2 * 1000)} VA / ${U} V = <span class="r">${N(I2)} A</span>`) + `<p>Der Strom sinkt um ${N(I1 - I2)} A (${N(100 * (1 - I2 / I1), 1)} %), obwohl der Motor gleich viel leistet. Genau das ist der Sinn der Kompensation.</p>`]]) };
}
function randKomp() {
  const P = pick([2, 3, 4, 5, 7.5, 10, 15]), cos = pick([0.6, 0.65, 0.7, 0.75, 0.8]);
  const Q1 = P / cos * Math.sin(Math.acos(cos));
  return makeKomp({ P, cos, QC: round(Q1 * (0.4 + Math.random() * 0.5), 1), U: pick([230, 400]) });
}

/* ═════════════ 12  Wirkungsgrad & Energie ═════════════ */
function makeEta(kind, o, label, txt) {
  if (kind === 'motor') {
    const { Pab, eta, cos, U } = o; /* Pab in kW, eta als Dezimalzahl */
    const Pzu = Pab / eta, Pv = Pzu - Pab, S = Pzu / cos, I = S * 1000 / U;
    return { label, text: txt || 'Ein Motor gibt die Leistung P<sub>ab</sub> ab. Berechne die aufgenommene Leistung, die Verluste, die Scheinleistung und den Strom.',
      given: [`P<sub>ab</sub> = ${N(Pab)} kW`, `η = ${N(eta * 100)} %`, `cos φ = ${N(cos)}`, `U = ${U} V`],
      fields: [
        { label: 'P<sub>zu</sub>', unit: 'kW', exact: Pzu, traps: [[Pab * eta, 'Multipliziert statt geteilt! P<sub>zu</sub> = P<sub>ab</sub> / η. Probe: P<sub>zu</sub> muss größer als P<sub>ab</sub> sein.']] },
        { label: 'Verluste P<sub>V</sub>', unit: 'kW', exact: Pv, traps: [[Pab - Pab * eta, 'Das wäre mit falschem P<sub>zu</sub> gerechnet. P<sub>V</sub> = P<sub>zu</sub> − P<sub>ab</sub>.']] },
        { label: 'Scheinleistung S', unit: 'kVA', exact: S, traps: [[Pab / cos, 'Du hast mit P<sub>ab</sub> gerechnet. Das Netz liefert P<sub>zu</sub> → S = P<sub>zu</sub> / cos φ.'], [Pzu * cos, 'S = P / cos φ (geteilt).']] },
        { label: 'Strom I', unit: 'A', exact: I, traps: [[Pzu * 1000 / U, 'I = S / U, nicht P / U.'], [Pab * 1000 / cos / U, 'Mit P<sub>ab</sub> statt P<sub>zu</sub> gerechnet.']] }],
      sol: steps([
        ['Aufgenommene Leistung: durch η teilen', eq(`P<sub>zu</sub> = P<sub>ab</sub> / η = ${N(Pab)} kW / ${N(eta, 3)} = <span class="r">${N(Pzu, 3)} kW</span>`) + '<p>η = ' + N(eta * 100) + ' % → als Dezimalzahl ' + N(eta, 3) + '. P<sub>zu</sub> ist größer als P<sub>ab</sub> ✓</p>'],
        ['Verluste', eq(`P<sub>V</sub> = P<sub>zu</sub> − P<sub>ab</sub> = ${N(Pzu, 3)} − ${N(Pab)} = <span class="r">${N(Pv, 3)} kW</span>`)],
        ['Scheinleistung (mit P<sub>zu</sub>, denn das zieht der Motor aus dem Netz)', eq(`S = P<sub>zu</sub> / cos φ = ${N(Pzu, 4)} kW / ${N(cos)} = <span class="r">${N(S, 3)} kVA</span>`)],
        ['Strom: S in VA durch U', eq(`I = ${N(S * 1000)} VA / ${U} V = <span class="r">${N(I)} A</span>`)]]) };
  }
  if (kind === 'eta') {
    const { Pzu, Pab } = o;
    return { label, text: txt || 'Berechne den Wirkungsgrad und die Verlustleistung.', given: [`P<sub>zu</sub> = ${N(Pzu)} kW`, `P<sub>ab</sub> = ${N(Pab)} kW`],
      fields: [{ label: 'Wirkungsgrad η', unit: '%', exact: Pab / Pzu * 100, traps: [[Pzu / Pab * 100, 'Umgekehrt: η = P<sub>ab</sub> / P<sub>zu</sub> (Nutzen durch Aufwand). η ist immer unter 100 %.']] },
        { label: 'Verluste P<sub>V</sub>', unit: 'kW', exact: Pzu - Pab }],
      sol: steps([['η = Nutzen / Aufwand', eq(`η = P<sub>ab</sub> / P<sub>zu</sub> = ${N(Pab)} / ${N(Pzu)} = ${N(Pab / Pzu, 4)}`)], ['In Prozent: mal 100', eq(`η = <span class="r">${N(Pab / Pzu * 100)} %</span>`)], ['Verluste', eq(`P<sub>V</sub> = ${N(Pzu)} − ${N(Pab)} = <span class="r">${N(Pzu - Pab)} kW</span>`)]]) };
  }
  if (kind === 'energie') {
    const { P, t } = o; /* P in W, t in h */
    const W = P * t / 1000;
    return { label, text: txt || 'Ein Gerät läuft mit konstanter Leistung. Wie viel Energie braucht es?', given: [`P = ${N(P)} W`, `t = ${N(t)} h`],
      fields: [{ label: 'Energie W', unit: 'kWh', exact: W }, { label: 'Energie W', unit: 'MJ', exact: W * 3.6, traps: [[W * 3600, 'Das sind kJ. 1 kWh = 3600 kJ = 3,6 MJ.']] }],
      sol: steps([['Leistung in kW', eq(`P = ${N(P)} W = ${N(P / 1000, 4)} kW`)], ['W = P · t', eq(`W = ${N(P / 1000, 4)} kW · ${N(t)} h = <span class="r">${N(W, 3)} kWh</span>`)], ['In Megajoule: 1 kWh = 3,6 MJ', eq(`W = ${N(W, 3)} · 3,6 = <span class="r">${N(W * 3.6, 3)} MJ</span>`)]]) };
  }
  const { W, P, uW, uP } = o; /* zeit: W in uW·h, P in uP */
  const t = W / P;
  return { label, text: txt || 'Wie lange reicht die Energie?', given: [`W = ${N(W)} ${uW}Wh`, `P = ${N(P)} ${uP}`],
    fields: [{ label: 'Zeit t', unit: 'h', exact: t, traps: [[P / W, 'Umgekehrt: t = W / P.'], [W * P, 't = W / P (geteilt).']] }, { label: 'Zeit t', unit: 'min', exact: t * 60, traps: [[t * 100, 'Stunden mal <b>60</b>, nicht 100!']] }],
    sol: steps([['W = P · t umstellen nach t', eq('t = W / P')], ['Einsetzen (gleiche Vorsilbe oben und unten)', eq(`t = ${N(W)} ${uW}Wh / ${N(P)} ${uP} = <span class="r">${N(t, 3)} h</span>`)], ['In Minuten: mal 60', eq(`${N(t, 4)} h · 60 = <span class="r">${N(t * 60)} min</span>`)]]) };
}
const ETA_SPECIAL = (() => {
  const Pab = 3.4, S = 4.85, eta = 0.92, Pzu = Pab / eta, cos = Pzu / S, Q = Math.sqrt(S * S - Pzu * Pzu);
  return { label: 'Mitschrift', text: 'Ein Motor gibt P<sub>ab</sub> ab und nimmt die Scheinleistung S auf. Berechne P<sub>zu</sub>, cos φ und Q.',
    given: [`P<sub>ab</sub> = 3,4 kW`, `S = 4,85 kVA`, `η = 92 %`],
    fields: [{ label: 'P<sub>zu</sub>', unit: 'kW', exact: Pzu, traps: [[Pab * eta, 'Multipliziert statt geteilt! P<sub>zu</sub> = P<sub>ab</sub> / η (so steht es auch falsch in einer Version der Mitschrift).']] },
      { label: 'cos φ', unit: '', exact: cos, tol: 0.006, d: 3, traps: [[Pab / S, 'Mit P<sub>ab</sub> gerechnet. Ins Leistungsdreieck gehört P<sub>zu</sub>.'], [Pab * eta / S, 'Mit dem falschen P<sub>zu</sub> (mal η) gerechnet.']] },
      { label: 'Blindleistung Q', unit: 'kvar', exact: Q, traps: [[Math.sqrt(S * S - Pab * Pab), 'Mit P<sub>ab</sub> gerechnet (3,46 kvar wie in der Mitschrift). Richtig ist P<sub>zu</sub> = 3,70 kW.'], [Math.sqrt(S * S - (Pab * eta) ** 2), 'Mit dem falschen P<sub>zu</sub> (mal η) gerechnet.']] }],
    sol: steps([['P<sub>zu</sub> = P<sub>ab</sub> / η', eq(`P<sub>zu</sub> = 3,4 kW / 0,92 = <span class="r">${N(Pzu, 3)} kW</span>`)],
      ['cos φ = P<sub>zu</sub> / S', eq(`cos φ = ${N(Pzu, 4)} / 4,85 = <span class="r">${N(cos, 3)}</span>`)],
      ['Q = √(S² − P<sub>zu</sub>²)', eq(`Q = √(4,85² − ${N(Pzu, 4)}²) = √(${N(S * S, 4)} − ${N(Pzu * Pzu, 4)}) = <span class="r">${N(Q)} kvar</span>`)],
      ['Achtung Mitschrift', '<p>In deiner Mitschrift steht Q = 3,46 kvar. Das kommt heraus, wenn man P<sub>ab</sub> = 3,4 kW statt P<sub>zu</sub> einsetzt. Ins Leistungsdreieck gehört aber die Leistung, die aus dem Netz kommt.</p>']]) };
})();
function randEta() {
  const k = pick(['motor', 'motor', 'eta', 'energie', 'zeit']);
  if (k === 'motor') return makeEta(k, { Pab: pick([0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5]), eta: pick([0.65, 0.7, 0.75, 0.8, 0.85, 0.9]), cos: pick([0.7, 0.75, 0.8, 0.85, 0.9]), U: pick([230, 400]) });
  if (k === 'eta') { const Pzu = rint(10, 100) / 10; return makeEta(k, { Pzu, Pab: round(Pzu * pick([0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95]), 2) }); }
  if (k === 'energie') return makeEta(k, { P: pick([60, 450, 800, 1200, 1800, 2000, 2500]), t: pick([0.5, 1.5, 2, 3, 4, 8, 24]) });
  return makeEta(k, { W: pick([500, 1240, 92.16, 276.48, 1200]), P: pick([258, 300, 150, 400, 600]), uW: 'k', uP: 'kW' });
}

/* ═════════════ 13  USV ═════════════ */
function makeUSV(o, label) {
  const Ss = o.dev.map(d => d.P / d.cos), Sg = Ss.reduce((a, b) => a + b, 0), Pg = o.dev.reduce((a, d) => a + d.P, 0);
  const E = o.n * o.Ub * o.Ah, t = E / Sg, last = Sg / o.usv * 100;
  return { label, text: `An einer USV mit <b>${o.usv} VA</b> hängen die folgenden Geräte. Die Batterie besteht aus <b>${o.n} Akku${o.n > 1 ? 's' : ''} à ${N(o.Ub)} V / ${N(o.Ah)} Ah</b>. Rechne wie im Unterricht mit der Scheinleistung.`,
    given: o.dev.map(d => `${d.n}: ${N(d.P)} W, cos φ = ${N(d.cos)}`),
    fields: [
      { label: 'Gesamt-Scheinleistung S<sub>ges</sub>', unit: 'VA', exact: Sg, traps: [[Pg, 'Du hast die <b>Wirkleistungen</b> addiert. Zuerst jedes Gerät: S = P / cos φ.'], [o.dev.reduce((a, d) => a + d.P * d.cos, 0), 'S = P / cos φ (geteilt, nicht mal).']] },
      { label: 'Auslastung der USV', unit: '%', exact: last },
      { label: 'Batterieenergie E', unit: 'Wh', exact: E, traps: [[o.Ub * o.Ah, `Das ist nur <b>ein</b> Akku. Es sind ${o.n} Stück → mal ${o.n}.`]] },
      { label: 'Betriebsdauer t', unit: 'min', exact: t * 60, traps: [[t, 'Das sind Stunden. Mal 60 für Minuten!'], [t * 100, 'Stunden mal <b>60</b>, nicht 100.'], [E / Pg * 60, 'Mit der Wirkleistung gerechnet. Im Unterricht nehmt ihr S<sub>ges</sub> (sichere Abschätzung).'], [o.Ub * o.Ah / Sg * 60, `Mit nur einem Akku gerechnet. E = ${o.n} · U · Ah.`]] }],
    sol: steps([
      ['Scheinleistung jedes Geräts: S = P / cos φ', o.dev.map((d, i) => eq(`S<sub>${d.n}</sub> = ${N(d.P)} W / ${N(d.cos)} = ${N(Ss[i])} VA`)).join('')],
      ['Zusammenzählen', eq(`S<sub>ges</sub> = ${Ss.map(s => N(s)).join(' + ')} = <span class="r">${N(Sg)} VA</span>`)],
      ['Passt die USV?', eq(`Auslastung = ${N(Sg)} VA / ${o.usv} VA · 100 = <span class="r">${N(last)} %</span>`) + (last <= 100 ? `<p>${N(Sg)} VA ≤ ${o.usv} VA → <b>die USV reicht</b> ✓</p>` : `<p class="c-red">${N(Sg)} VA &gt; ${o.usv} VA → <b>USV überlastet!</b> Man bräuchte eine größere USV.</p>`)],
      ['Batterieenergie: Anzahl · Volt · Ah = Wh', eq(`E = ${o.n} · ${N(o.Ub)} V · ${N(o.Ah)} Ah = <span class="r">${N(E)} Wh</span>`)],
      ['Betriebsdauer: t = E / S<sub>ges</sub>', eq(`t = ${N(E)} Wh / ${N(Sg)} VA = ${N(t, 4)} h`) + eq(`${N(t, 4)} h · 60 = <span class="r">${N(t * 60)} min</span>`)],
      ['Zum Vergleich', `<p>Mit der Wirkleistung (${N(Pg)} W) wären es ${N(E / Pg * 60)} min. Berücksichtigt man noch den Wirkungsgrad des Wechselrichters, wird es wieder weniger (t = E · η / P).</p>`]]) };
}
const DEVS = [['Server', 250, 600, [0.9, 0.95, 0.98]], ['NAS', 40, 120, [0.6, 0.65, 0.7]], ['Switch', 30, 150, [0.7, 0.8, 0.9]], ['Router', 15, 60, [0.6, 0.7]], ['Firewall', 40, 100, [0.8, 0.85, 0.9]], ['Monitor', 25, 60, [0.6, 0.65, 0.9]]];
function randUSV() {
  const n = pick([2, 2, 3]);
  const dev = shuffle(DEVS).slice(0, n).map(([nm, a, b, cs]) => ({ n: nm, P: Math.round(rint(a, b) / 5) * 5, cos: pick(cs) }));
  return makeUSV({ dev, usv: pick([500, 750, 1000, 1500]), n: pick([1, 2, 2, 3, 4]), Ub: pick([12, 12.8]), Ah: pick([7, 7.2, 9, 12]) });
}

/* ═════════════ 14  Fehler in der Mitschrift ═════════════ */
const MS_ERR = [
  { line: 'S = √(4² + 3²) = 5 kvar', q: 'Was ist an dieser Zeile falsch?', o: ['Die Rechnung: S = 4 + 3 = 7', 'Die Einheit: Scheinleistung hat kVA', 'Die Wurzel: S = 25', 'Nichts, alles richtig'], a: 1,
    why: 'Rechnung stimmt (√25 = 5), aber S hat die Einheit <b>VA</b> bzw. <b>kVA</b>. var gehört zur Blindleistung Q.' },
  { line: 'S = 782 V/A', q: 'Was stimmt an der Einheit nicht?', o: ['Nichts', 'Es heißt VA = Volt mal Ampere, V/A wäre Ohm', 'Es muss W heißen', 'Es muss var heißen'], a: 1,
    why: 'S = U · I, also <b>Volt mal Ampere = VA</b>. Volt durch Ampere (V/A) ist die Einheit des Widerstands, also Ω.' },
  { line: 'U<sub>ss</sub> = 2 · 325,27 V = 650,34 V', q: 'Stimmt das Ergebnis?', o: ['Ja', 'Nein, 2 · 325,27 = 650,54 V', 'Nein, U_ss = 325,27 · √2', 'Nein, U_ss = 230 · 2'], a: 1,
    why: 'Die Formel stimmt, aber 2 · 325,27 = <b>650,54 V</b>. Ein Rechenfehler.' },
  { line: 'P<sub>zu</sub> = P<sub>ab</sub> · η = 3,4 kW · 0,92 = 3,13 kW', q: 'Was ist hier falsch?', o: ['Nichts', 'Man muss durch η teilen: 3,70 kW', 'η muss 92 sein, nicht 0,92', 'P_zu = P_ab + η'], a: 1,
    why: 'Die zugeführte Leistung ist <b>größer</b> als die abgegebene. P<sub>zu</sub> = P<sub>ab</sub> / η = 3,4 / 0,92 = <b>3,70 kW</b>.' },
  { line: 't = 184,32 Wh / 875 W = 0,21 h ≈ 21 min', q: 'Was ist falsch?', o: ['Die Division', '0,21 h sind 12,6 min, nicht 21 min', 'Es muss Wh · W heißen', 'Nichts'], a: 1,
    why: 'Stunden mal 60: 0,21 h · 60 = <b>12,6 min</b>. Kommastellen von Stunden sind keine Minuten!' },
  { line: 'P<sub>ab</sub> = 3,4 kW, η = 92 %, S = 4,85 kVA → Q = √(4,85² − 3,4²) = 3,46 kvar', q: 'Welcher Fehler steckt drin?', o: ['Keiner', 'Ins Dreieck gehört P_zu = 3,70 kW → Q = 3,14 kvar', 'Es muss 4,85 + 3,4 heißen', 'Q hat die Einheit VA'], a: 1,
    why: 'Das Netz liefert P<sub>zu</sub>, nicht P<sub>ab</sub>. Q = √(4,85² − 3,696²) = <b>3,14 kvar</b>.' },
  { line: 'Einphasig, 380 V: I = S / (√3 · U)', q: 'Was gilt im Unterricht für Einphasen-Wechselstrom?', o: ['I = S / (√3 · U) ist richtig', 'I = S / U', 'I = P / U', 'I = S · U'], a: 1,
    why: 'Wie in der Mitschrift korrigiert: Für <b>einphasigen</b> Wechselstrom gilt I = S / U. Der Faktor √3 gehört zum Drehstrom und ist hier nicht gefragt.' },
  { line: 'S = P + Q = 4 kW + 3 kvar = 7 kVA', q: 'Ist das richtig?', o: ['Ja', 'Nein, S = √(P² + Q²) = 5 kVA', 'Nein, S = P − Q = 1 kVA', 'Nein, S = P · Q'], a: 1,
    why: 'P und Q stehen im rechten Winkel. Darum Pythagoras: S = √(16 + 9) = <b>5 kVA</b>.' }
];

/* ═════════════ Übungsliste ═════════════ */
function baseEx(id, title, intro, src, fixed, rand) { return { id, title, intro, src, fixed, random: rand, render: renderNum }; }
const EXERCISES = [
  { id: 'base', title: 'Zahlensysteme umrechnen', src: [['MS', 'Zahlensysteme 15.09.']],
    intro: 'Dezimal, Binär und Hex in alle Richtungen. Eingabe ohne Index (also 111111, nicht 111111₂).',
    fixed: [makeBase('d2b', 63, 'Mitschrift'), makeBase('b2d', 53, 'Mitschrift'), makeBase('d2h', 4739, 'Mitschrift'), makeBase('h2d', 0x33, 'Mitschrift'), makeBase('h2b', 0x33, 'Mitschrift')],
    random() { const k = pick(['d2b', 'b2d', 'd2h', 'h2d', 'h2b', 'b2h']); return makeBase(k, k === 'd2h' || k === 'h2d' ? rint(100, 9999) : k === 'h2b' || k === 'b2h' ? rint(17, 4095) : rint(5, 255)); },
    render(t, c) {
      c.area.append(h('p', { class: 'tasktext', html: t.q }));
      const inp = h('input', { class: 'inp mono', autocomplete: 'off', spellcheck: 'false', placeholder: t.to === 2 ? 'z. B. 101101' : t.to === 16 ? 'z. B. 1A3F' : 'z. B. 53', style: 'max-width:260px' });
      c.area.append(inp);
      c.onCheck = () => {
        const u = normBase(inp.value); if (!u) { feedback(c.fb, false, 'Noch keine Antwort.', []); return null; }
        const ok = u === t.ans; inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok);
        feedback(c.fb, ok, ok ? `Richtig: ${t.ans}` : 'Leider falsch.', ok ? [] : [baseDiag(t, u)]); return ok;
      };
      c.solution = t.sol;
    } },
  { id: 'rights', title: 'Linux-Rechte (Oktal)', src: [['MS', 'Zahlensysteme 15.09.']],
    intro: 'Zahlensysteme in der Praxis: r = 4, w = 2, x = 1 je Gruppe (Besitzer, Gruppe, Andere).',
    fixed: [makeRights('o2s', '750'), makeRights('o2s', '644')],
    random() { const o = Array.from({ length: 3 }, (_, i) => pick(i === 0 ? [7, 6, 7, 5] : [7, 5, 4, 0, 6])).join(''); return makeRights(pick(['s2o', 'o2s']), o); },
    render(t, c) {
      c.area.append(h('p', { class: 'tasktext', html: t.q }));
      const inp = h('input', { class: 'inp mono', autocomplete: 'off', spellcheck: 'false', placeholder: t.kind === 's2o' ? 'z. B. 755' : 'z. B. rwxr-xr-x', style: 'max-width:260px' });
      c.area.append(inp);
      c.onCheck = () => {
        const u = inp.value.trim().replace(/^chmod\s*/i, '').replace(/\s/g, '').toLowerCase();
        if (!u) { feedback(c.fb, false, 'Noch keine Antwort.', []); return null; }
        const ok = u === t.ans; inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok);
        let m = 'Schau dir den Lösungsweg an.';
        if (t.kind === 'o2s' && u.length !== 9) m = 'Es sind genau 9 Zeichen: 3 Gruppen à r w x, fehlende Rechte als „-“.';
        if (t.kind === 's2o' && u.length !== 3) m = 'Es sind genau 3 Ziffern: Besitzer, Gruppe, Andere.';
        feedback(c.fb, ok, ok ? 'Richtig!' : 'Leider falsch.', ok ? [] : [m]); return ok;
      };
      c.solution = t.sol;
    } },
  { id: 'not', title: 'Technische & wissenschaftliche Notation', src: [['MS', 'Notation']],
    intro: 'Zehnerpotenzen und Vorsilben. Mantisse (Zahl vor dem ·10) und Exponent getrennt eingeben.',
    fixed: [makeNot('wiss', '2573', 8, 'Hz', 'Mitschrift'), makeNot('wiss', '43', -5, 'A', 'Mitschrift'), makeNot('dez', '274', 7, '', 'Mitschrift'), makeNot('tech', '274', 7, 'Hz', 'Mitschrift')],
    random() { return randNot(pick(['wiss', 'wiss', 'tech', 'dez'])); },
    render(t, c) {
      c.area.append(h('p', { class: 'tasktext', html: t.q }));
      if (t.kind === 'dez') {
        const inp = h('input', { class: 'inp mono', inputmode: 'decimal', autocomplete: 'off', placeholder: 'z. B. 27 400 000 oder 0,00043', style: 'max-width:320px' });
        c.area.append(h('div', { class: 'unitin', style: 'max-width:360px' }, inp, h('span', null, t.unit)));
        c.onCheck = () => {
          const raw = inp.value.trim(); if (!raw) { feedback(c.fb, false, 'Noch keine Antwort.', []); return null; }
          const v = parseDec(raw); const ok = isFinite(v) && Math.abs(v - t.ans) <= Math.abs(t.ans) * 1e-9;
          inp.classList.toggle('right', ok); inp.classList.toggle('wrong', !ok);
          let m = 'Zähl die Stellen nochmal. Schau dir den Lösungsweg an.';
          if (isFinite(v)) { const r = Math.log10(Math.abs(v / t.ans)); if (Math.abs(r - Math.round(r)) < 1e-9 && Math.round(r) !== 0) m = `Du bist ${Math.abs(Math.round(r))} Stelle(n) daneben. Exponent ${t.plain.includes(',') ? 'negativ → Komma nach links' : 'positiv → Komma nach rechts'}, pro Stelle eine Null.`; }
          feedback(c.fb, ok, ok ? `Richtig: ${t.plain}` : 'Leider falsch.', ok ? [] : [m]); return ok;
        };
      } else {
        const m = h('input', { class: 'inp mono', inputmode: 'decimal', autocomplete: 'off', placeholder: 'Zahl' });
        const e = h('input', { class: 'inp mono exp', inputmode: 'numeric', autocomplete: 'off', placeholder: 'Exp.' });
        c.area.append(h('div', { class: 'sci' }, m, h('span', null, '· 10^'), e, h('span', null, t.unit)));
        c.onCheck = () => {
          if (!m.value.trim() || !e.value.trim()) { feedback(c.fb, false, 'Bitte Zahl und Exponent eingeben.', []); return null; }
          const mv = parseDec(m.value), ev = parseInt(e.value.replace(/[−–]/, '-'), 10);
          const ok = isFinite(mv) && ev === t.tgt.e && Math.abs(mv - pv(t.tgt.m)) < 1e-9 * Math.max(1, Math.abs(mv));
          const same = isFinite(mv) && isFinite(ev) && Math.abs(mv * Math.pow(10, ev) / t.val - 1) < 1e-9;
          [m, e].forEach(x => { x.classList.toggle('right', ok); x.classList.toggle('wrong', !ok); });
          let msg = 'Schau dir den Lösungsweg an.';
          if (same && t.kind === 'wiss') msg = 'Der <b>Wert</b> stimmt, aber wissenschaftlich muss genau <b>eine Ziffer (1–9) vor dem Komma</b> stehen.';
          else if (same) msg = 'Der <b>Wert</b> stimmt, aber technisch muss der Exponent <b>durch 3 teilbar</b> sein und 1–3 Ziffern vor dem Komma stehen.';
          else if (isFinite(ev) && ev === -t.tgt.e && ev !== 0) msg = 'Vorzeichen des Exponenten falsch: kleine Zahl (unter 1) → negativer Exponent, große Zahl → positiver.';
          else if (isFinite(ev) && Math.abs(mv - pv(t.tgt.m)) < 1e-9 * Math.abs(mv)) msg = `Die Ziffern stimmen, aber der Exponent nicht. Zähl, um wie viele Stellen das Komma wandert.`;
          feedback(c.fb, ok, ok ? `Richtig: ${t.tgt.m} · 10^${t.tgt.e} ${t.unit}` : same ? 'Fast!' : 'Leider falsch.', ok ? [] : [msg], same); return ok;
        };
      }
      c.solution = () => t.sol;
    } },
  baseEx('ohm', 'Ohmsches Gesetz & Leistung', 'U = R · I und P = U · I. Achte auf mA und kΩ!', [['MS', 'Ohm & Leistung']],
    [makeOhm('UI', 230, 230 / 16.7, 16.7, ['P'], 'Mitschrift'), makeOhm('UI', 3.2, 3.2 / 0.034, 0.034, ['P'], 'Mitschrift'), makeOhm('UI', 72, 72 / 40, 40, ['P'], 'Mitschrift')], randOhm),
  baseEx('res', 'Reihen- & Parallelschaltung', 'Gesamtwiderstand bestimmen, dann den Strom.', [['MS', 'Ohm & Leistung']], [], randRes),
  baseEx('py', 'Satz des Pythagoras', 'Hypotenuse oder Kathete berechnen. Einheiten vorher angleichen!', [['MS', 'Pythagoras']],
    [makePy('c', 305, 137, Math.hypot(305, 137), { list: ['a = 305 cm', 'b = 137 cm'] }, 'cm', 'Mitschrift'),
     makePy('kat', 980, Math.sqrt(5720 ** 2 - 980 ** 2), 5720, { list: ['c = 5,72 kW', 'a = 980 W'], conv: 'c = 5,72 kW = 5720 W' }, 'W', 'Mitschrift', 'Die Hypotenuse ist c = 5,72 kW, eine Kathete a = 980 W. Berechne die Kathete b in W.'),
     makePy('c', 3400, 370, Math.hypot(3400, 370), { list: ['a = 3,4 kHz', 'b = 370 Hz'], conv: 'a = 3,4 kHz = 3400 Hz' }, 'Hz', 'Mitschrift', 'Die Katheten sind a = 3,4 kHz und b = 370 Hz. Berechne die Hypotenuse c in Hz.'),
     makePy('kat', 240, Math.sqrt(470 ** 2 - 240 ** 2), 470, { list: ['c = 470 W', 'a = 240 W'] }, 'W', 'Mitschrift'),
     makePy('c', 7.4, 3.8, Math.hypot(7.4, 3.8), { list: ['a = 7,4 cm', 'b = 3,8 cm'] }, 'cm', 'Mitschrift')], randPy),
  baseEx('trig', 'Winkelfunktionen sin, cos, tan', 'Winkel aus zwei Seiten oder Seiten aus Winkel und Seite. Taschenrechner auf DEG!', [['MS', 'Winkelfunktionen']],
    [makeTrig('w-ab', { a: 3, b: 4, c: 5, al: Math.atan2(3, 4) / RAD }, 'Beispiel 3-4-5'), makeTrig('s-a', trigFrom(37, 'a', 4, 'cm'), 'Mitschrift'),
     makeTrig('s-c', trigFrom(37, 'c', 9.8, 'dm'), 'Mitschrift', 'Gegeben ist c = 9,8 dm und β = 53°, also α = 90° − 53° = 37°. Berechne a, b und kontrolliere β.')], randTrig),
  baseEx('ac', 'Wechselspannung: Kenngrößen', 'Û, U<sub>eff</sub>, U<sub>ss</sub>, f, T und ω aus zwei Angaben.', [['MS', 'Kenngrößen'], ['WS', 11]],
    [makeAC('eff', 230, 'f', 50, 'Mitschrift A1'), makeAC('hat', 12, 'T', 2.5, 'Mitschrift A2'), makeAC('ss', 30, 'T', 0.2, 'Kippels S. 11')], randAC),
  baseEx('x', 'Blindwiderstand X<sub>C</sub> & X<sub>L</sub>', 'Kondensator und Spule an Wechselspannung. Strom in mA eingeben.', [['WS', 14], ['WS', 16]],
    [makeX('L', { L: 10, f: 50, U: 12 }, 'Kippels S. 16'), makeX('fC', { C: 1e-6, X: 318 }, 'Kippels S. 17')], randX),
  baseEx('ld', 'Leistungsdreieck P, Q, S, cos φ', 'Aus zwei bekannten Größen alle anderen. P in W, Q in var, S in VA.', [['LD', 2], ['LD', 3], ['MS', 'Aufgaben Leistung']],
    [makeLD('UIcos', { U: 230, I: 3.4, cos: 0.96 }, 'Mitschrift'), makeLD('UIP', { U: 230, I: 3.2, P: 460 }, 'Mitschrift Aufgabe 2'), makeLD('PQ', { P: 4, Q: 3, k: true }, 'Mitschrift Aufgabe 5')], randLD),
  baseEx('komp', 'Blindleistungskompensation', 'Vorher – nachher: Was macht der Kondensator mit Q, S, cos φ und I?', [['WS', 53]],
    [makeKomp({ P: 4, cos: 0.8, QC: 2, U: 230 }, 'Beispiel aus Kapitel 8')], randKomp),
  baseEx('eta', 'Wirkungsgrad & Energie', 'η = P<sub>ab</sub>/P<sub>zu</sub>, W = P · t. Achtung: P<sub>zu</sub> = P<sub>ab</sub> / η!', [['LD', 5], ['LD', 6], ['MS', 'Aufgaben Leistung']],
    [makeEta('motor', { Pab: 1.5, eta: 0.65, cos: 0.7, U: 230 }, 'Mitschrift'), makeEta('motor', { Pab: 4.7, eta: 0.86, cos: 0.84, U: 380 }, 'Mitschrift', 'Ein Motor (einphasig gerechnet) gibt 4,7 kW ab. Berechne P<sub>zu</sub>, Verluste, S und I.'), ETA_SPECIAL,
     makeEta('eta', { Pzu: 4, Pab: 3.6 }, 'Mitschrift Aufgabe 5'), makeEta('energie', { P: 1800, t: 4 }, 'Skript S. 6', 'Ein Heizofen mit 1800 W läuft 4 Stunden.'),
     makeEta('zeit', { W: 1240, P: 258, uW: 'M', uP: 'MW' }, 'Mitschrift', 'Ein Rechenzentrum braucht 258 MW. Der Energiespeicher hat 1240 MWh. Wie lange reicht er?')], randEta),
  baseEx('usv', 'USV-Berechnung', 'Scheinleistung, Auslastung, Batterieenergie und Betriebsdauer, alles in einer Aufgabe.', [['MS', 'USV']],
    [makeUSV({ dev: [{ n: 'Server', P: 400, cos: 0.95 }, { n: 'NAS', P: 65, cos: 0.65 }], usv: 1000, n: 3, Ub: 12.8, Ah: 7.2 }, 'Mitschrift'),
     makeUSV({ dev: [{ n: 'Gerät 1', P: 750, cos: 0.91 }, { n: 'Gerät 2', P: 125, cos: 0.65 }], usv: 750, n: 2, Ub: 12.8, Ah: 7.2 }, 'Mitschrift')], randUSV),
  { id: 'err', title: 'Fehler in der Mitschrift finden', src: [['MS', 'Aufgaben Leistung'], ['MS', 'USV']],
    intro: 'Diese Zeilen stehen (fast) so in deiner Mitschrift oder sind typische Fehler. Finde, was falsch ist.',
    items: MS_ERR, fixedFromItems: true,
    render(t, c) {
      const it = t.it;
      c.area.append(h('div', { class: 'eq', html: it.line }), h('p', { class: 'q' }, it.q));
      const opts = h('div', { class: 'opts col' }); let sel = null;
      it.o.forEach((o, i) => opts.append(h('button', { class: 'opt', onclick: e => { sel = i; opts.querySelectorAll('.opt').forEach(b => b.classList.remove('sel')); e.currentTarget.classList.add('sel'); } }, o)));
      c.area.append(opts);
      c.onCheck = () => {
        if (sel == null) { feedback(c.fb, false, 'Wähle zuerst eine Antwort.', []); return null; }
        opts.querySelectorAll('.opt').forEach((b, i) => { b.disabled = true; b.classList.toggle('right', i === it.a); b.classList.toggle('wrong', i === sel && i !== it.a); });
        feedback(c.fb, sel === it.a, sel === it.a ? 'Richtig erkannt!' : 'Nicht ganz.', [it.why]); return sel === it.a;
      };
      c.solution = () => `<p>${it.why}</p>`;
    } },
  { id: 'theo', title: 'Theoriefragen der Schularbeit', src: [['TF', 'Liste']],
    intro: 'Antworte zuerst selbst (laut oder auf Papier), dann Musterantwort aufdecken und ehrlich bewerten.',
    items: THEORY, fixedFromItems: true,
    render(t, c) {
      c.area.append(h('p', { class: 'tasktext', html: `<span class="tag">${t.it.g}</span>` }), h('p', { class: 'q', html: t.it.q }));
      c.selfAssess = { answer: t.it.a };
    } }
];

/* ★ wichtige Übungsarten: mehr Zufallsaufgaben in der Liste */
IMP_EX.forEach(id => { const e = EXERCISES.find(x => x.id === id); if (e) e.imp = true; });

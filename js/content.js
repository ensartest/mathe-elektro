/* Lerninhalte – aufbauend (roter Faden). Quellen:
   LD = R. Scheumann, Skriptum „Leistungsdreieck“ (APEC3/INFT3)
   WS = W. Kippels, „Grundlagen der Wechselstromtechnik“
   MS = Mitschrift (Fotos aus dem Unterricht)
   TF = Liste „Theoriefragen zur Schularbeit“ */
const SKRIPT = { LD: 'Skript Leistungsdreieck', WS: 'Kippels Wechselstrom', MS: 'Mitschrift', TF: 'Theoriefragen' };
function S(k, p) {
  const where = typeof p === 'number' ? 'S. ' + p : p;
  return `<span class="src${k === 'MS' ? ' ms' : ''}" title="Quelle: ${SKRIPT[k]}, ${where}">${k === 'MS' ? '✎' : '📄'} ${SKRIPT[k]} · ${where}</span>`;
}
function box(kind, label, inner) { return `<div class="box ${kind}"><span class="lbl">${label}</span>${inner}</div>`; }

/* ───── SVG-Helfer ───── */
function arrow(x1, y1, x2, y2, c, both, w = 1.8) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = 9, W = 4.5;
  const head = (x, y, an) => { const bx = x - L * Math.cos(an), by = y - L * Math.sin(an), px = -Math.sin(an) * W, py = Math.cos(an) * W;
    return `<polygon points="${x},${y} ${(bx + px).toFixed(1)},${(by + py).toFixed(1)} ${(bx - px).toFixed(1)},${(by - py).toFixed(1)}" class="f-${c}"/>`; };
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="cv s-${c}" style="stroke-width:${w}"/>` + head(x2, y2, a) + (both ? head(x1, y1, a + Math.PI) : '');
}
function sinePath(x0, w, yc, A, periods, phase = 0) {
  let d = '';
  for (let i = 0; i <= 160; i++) { const t = i / 160; const x = x0 + t * w; const y = yc - A * Math.sin(2 * Math.PI * periods * t + phase); d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); }
  return d;
}

const SVG_OHM = `<svg class="pl" viewBox="0 0 200 170" role="img" aria-label="Ohmsches Dreieck: U oben, R und I unten">
<polygon points="100,10 10,160 190,160" class="f-soft s-ink" style="stroke-width:2"/>
<line x1="49" y1="95" x2="151" y2="95" class="ax"/><line x1="100" y1="95" x2="100" y2="160" class="ax"/>
<text x="100" y="80" text-anchor="middle" style="font:600 30px var(--serif)" class="f-ink">U</text>
<text x="66" y="143" text-anchor="middle" style="font:600 26px var(--serif)" class="f-red">R</text>
<text x="134" y="143" text-anchor="middle" style="font:600 26px var(--serif)" class="f-grn">I</text></svg>`;

const SVG_SINE = (() => {
  const yc = 110, A = 80, x0 = 40, w = 320, eff = yc - A / Math.SQRT2;
  return `<svg class="pl" viewBox="0 0 430 235" role="img" aria-label="Sinusspannung mit Scheitelwert, Effektivwert, Spitze-Spitze-Wert und Periodendauer">
<rect x="0" y="0" width="430" height="235" rx="8" class="bgr"/>
<line x1="30" y1="${yc}" x2="372" y2="${yc}" class="ax"/><polygon points="378,${yc} 369,${yc - 4} 369,${yc + 4}" class="axh"/>
<text x="380" y="${yc + 16}" class="tm">t</text>
<line x1="40" y1="200" x2="40" y2="18" class="ax"/><polygon points="40,12 36,21 44,21" class="axh"/><text x="48" y="22" class="tm">u</text>
<line x1="40" y1="30" x2="416" y2="30" class="dash s-mut"/><line x1="40" y1="190" x2="416" y2="190" class="dash s-mut"/>
<line x1="40" y1="${eff.toFixed(1)}" x2="360" y2="${eff.toFixed(1)}" class="dash s-grn"/>
<path d="${sinePath(x0, w, yc, A, 1)}" class="cv s-ink"/>
${arrow(120, yc, 120, 32, 'red')}<text x="127" y="78" class="f-red">Û</text>
${arrow(410, 32, 410, 188, 'amb', true)}<text x="382" y="88" class="f-amb">U<tspan dy="4" font-size="10">ss</tspan></text>
<text x="190" y="${(eff - 6).toFixed(1)}" class="f-grn">U<tspan dy="4" font-size="10">eff</tspan><tspan dy="-4"> ≈ 0,707 · Û</tspan></text>
${arrow(40, 218, 360, 218, 'vio', true)}<text x="200" y="213" class="f-vio" text-anchor="middle">T (eine Periode)</text>
</svg>`;
})();

function triSvg(lbl) {
  /* rechtwinkliges Dreieck: A links unten, C rechts unten (90°), B rechts oben */
  return `<svg class="pl" viewBox="0 0 360 215" role="img" aria-label="${lbl.aria}">
<polygon points="30,180 320,180 320,40" class="f-soft"/>
<line x1="30" y1="180" x2="320" y2="180" class="cv ${lbl.cb}" /><line x1="320" y1="180" x2="320" y2="40" class="cv ${lbl.ca}"/><line x1="30" y1="180" x2="320" y2="40" class="cv ${lbl.cc}"/>
<polyline points="302,180 302,162 320,162" class="ax"/>
<path d="M 82,180 A 52,52 0 0 0 76.8,157.4" class="ax"/>
<text x="90" y="172" class="tx">${lbl.alpha}</text>
<text x="175" y="203" text-anchor="middle" class="${lbl.tb}">${lbl.b}</text>
<text x="312" y="146" text-anchor="end" class="${lbl.ta}">${lbl.a}</text>
<text x="160" y="96" text-anchor="middle" class="${lbl.tc}">${lbl.c}</text>
</svg>`;
}
const SVG_TRI = triSvg({ aria: 'Rechtwinkliges Dreieck mit Hypotenuse c, Katheten a und b, Winkel Alpha', alpha: 'α', cb: 's-mut', ca: 's-mut', cc: 's-ink', tb: 'tx', ta: 'tx', tc: 'f-ink',
  b: 'b = Ankathete von α', a: 'a = Gegenkathete', c: 'c = Hypotenuse' });
const SVG_LD = triSvg({ aria: 'Leistungsdreieck: P waagrecht, Q senkrecht, S schräg, Winkel phi', alpha: 'φ', cb: 's-grn', ca: 's-red', cc: 's-ink', tb: 'f-grn', ta: 'f-red', tc: 'f-ink',
  b: 'P  Wirkleistung in W', a: 'Q in var', c: 'S  Scheinleistung in VA' });

const SVG_KOMP = `<svg class="pl" viewBox="0 0 360 230" role="img" aria-label="Kompensation: Kondensator-Blindleistung verkleinert Q und damit S">
<line x1="30" y1="200" x2="300" y2="200" class="cv s-grn"/>
<line x1="300" y1="200" x2="300" y2="40" class="cv s-red"/>
<line x1="30" y1="200" x2="300" y2="40" class="cv s-ink" style="opacity:.45"/>
${arrow(318, 40, 318, 140, 'vio')}
<line x1="30" y1="200" x2="300" y2="140" class="cv s-ink"/>
<text x="150" y="222" text-anchor="middle" class="f-grn">P bleibt gleich</text>
<text x="262" y="100" class="f-red" text-anchor="end">Q<tspan dy="4" font-size="10">L</tspan></text>
<text x="326" y="95" class="f-vio">Q<tspan dy="4" font-size="10">C</tspan></text>
<text x="120" y="98" class="tm">S vorher</text>
<text x="160" y="180" class="f-ink">S nachher (kleiner)</text>
</svg>`;

const SVG_USV = `<svg class="pl" viewBox="0 0 400 170" role="img" aria-label="USV: Netz, Gleichrichter, Batterie, Wechselrichter, Verbraucher">
${[['Netz ~', 10], ['Gleich-\nrichter', 105], ['Wechsel-\nrichter', 200], ['Server', 300]].map(([t, x]) => `<rect x="${x}" y="20" width="${x === 300 ? 90 : 78}" height="54" rx="7" class="f-soft s-ink" style="stroke-width:1.5"/>` +
  t.split('\n').map((l, i, a) => `<text x="${x + (x === 300 ? 45 : 39)}" y="${48 + (i - (a.length - 1) / 2) * 16 + 4}" text-anchor="middle" class="tx">${l}</text>`).join('')).join('')}
${arrow(88, 47, 103, 47, 'mut')}${arrow(183, 47, 198, 47, 'mut')}${arrow(278, 47, 298, 47, 'mut')}
<rect x="140" y="112" width="100" height="44" rx="7" class="s-amb" style="fill:var(--amber-soft);stroke-width:1.5"/>
<text x="190" y="139" text-anchor="middle" class="tx">Batterie (Ah)</text>
${arrow(170, 74, 170, 110, 'amb')}${arrow(215, 110, 215, 76, 'amb')}
<text x="100" y="100" class="tm">lädt</text><text x="222" y="100" class="tm">speist bei Ausfall</text>
</svg>`;

/* ═════════════ Module ═════════════ */
const MODULES = [
/* ─────────────── 1 ─────────────── */
{ id: 'm1', part: 'Teil A · Mathe-Werkzeuge', title: 'Zahlensysteme: Dezimal, Binär, Hex',
html: `
${box('faden', 'Roter Faden', `<p>Bevor wir Strom und Leistung rechnen, brauchen wir die <b>Werkzeuge</b>: Zahlensysteme (Kapitel 1), Zehnerpotenzen (2) und das rechtwinklige Dreieck (3). Alles Spätere baut darauf auf. Zahlensysteme sind der IT-Teil: Computer rechnen binär, wir Menschen dezimal, und Hex ist die Kurzschrift dazwischen.</p>`)}
<p>Jedes Zahlensystem funktioniert gleich: Es gibt eine <b>Basis</b>, und jede Stelle ist eine Potenz dieser Basis wert. ${S('MS', 'Zahlensysteme 15.09.')}</p>
<div class="scroll"><table class="tbl">
<tr><th>System</th><th>Basis</th><th>Ziffern</th><th>Stellenwerte (von rechts)</th><th>Kennzeichen</th></tr>
<tr><td><b>Dezimal</b></td><td>10</td><td>0–9</td><td>1, 10, 100, 1000 …</td><td>53<sub>10</sub></td></tr>
<tr><td><b>Binär</b> (Dual)</td><td>2</td><td>0, 1</td><td>1, 2, 4, 8, 16, 32, 64, 128 …</td><td>110101<sub>2</sub> oder <code>0b110101</code></td></tr>
<tr><td><b>Hexadezimal</b></td><td>16</td><td>0–9, A–F</td><td>1, 16, 256, 4096 …</td><td>33<sub>16</sub> oder <code>0x33</code></td></tr>
</table></div>
<p>Bei Hex gehen die Ziffern über 9 hinaus: <b>A = 10, B = 11, C = 12, D = 13, E = 14, F = 15</b>. ${S('MS', 'Zahlensysteme 15.09.')}</p>
${box('merke', 'Merke · Stellenwerte Binär', `<p>Von rechts nach links immer <b>verdoppeln</b>:</p>${eq('128 · 64 · 32 · 16 · 8 · 4 · 2 · 1')}<p>Ein Byte = 8 Bit → größte Zahl 1111 1111<sub>2</sub> = 255.</p>`)}

<h3>Binär → Dezimal: Stellenwerte addieren</h3>
<p>Schreib die Stellenwerte über die Bits und addiere nur dort, wo eine <b>1</b> steht.</p>
<div class="scroll"><table class="vt"><tr><th>Stellenwert</th><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td><td>1</td></tr><tr><th>Bit</th><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr></table></div>
${eq('110101<sub>2</sub> = 32 + 16 + 4 + 1 = <span class="r">53<sub>10</sub></span>')}
<p>${S('MS', 'Zahlensysteme 15.09.')}</p>

<h3>Dezimal → Binär: immer durch 2 (Restwertmethode)</h3>
<ol class="steps"><li>Zahl durch 2 teilen, den <b>Rest</b> (0 oder 1) notieren.</li><li>Mit dem Ergebnis weitermachen, bis 0 herauskommt.</li><li>Die Reste <b>von unten nach oben</b> lesen.</li></ol>
<div class="scroll"><table class="vt"><tr><th>Rechnung</th><th>Ergebnis</th><th>Rest</th></tr>
<tr><td>63 : 2</td><td>31</td><td>1</td></tr><tr><td>31 : 2</td><td>15</td><td>1</td></tr><tr><td>15 : 2</td><td>7</td><td>1</td></tr><tr><td>7 : 2</td><td>3</td><td>1</td></tr><tr><td>3 : 2</td><td>1</td><td>1</td></tr><tr><td>1 : 2</td><td>0</td><td>1 ↑</td></tr></table></div>
${eq('63<sub>10</sub> = <span class="r">111111<sub>2</sub></span>')}
${box('tipp', 'Tipp · Schneller Weg', `<p>Zieh den größten Stellenwert ab, der hineinpasst: 53 − 32 = 21, 21 − 16 = 5, 5 − 4 = 1, 1 − 1 = 0 → Einsen bei 32, 16, 4, 1 → 110101. Das ist oft schneller als Teilen.</p>`)}

<h3>Hex ↔ Dezimal</h3>
<p><b>Hex → Dez:</b> jede Ziffer mal ihren Stellenwert (1, 16, 256, 4096).</p>
${eq('33<sub>16</sub> = 3 · 16 + 3 · 1 = <span class="r">51<sub>10</sub></span>')}
<p><b>Dez → Hex:</b> wie bei Binär, nur <b>durch 16</b> teilen. Reste über 9 werden zu Buchstaben.</p>
<div class="scroll"><table class="vt"><tr><th>Rechnung</th><th>Ergebnis</th><th>Rest</th></tr>
<tr><td>4739 : 16</td><td>296</td><td>3 (296 · 16 = 4736)</td></tr><tr><td>296 : 16</td><td>18</td><td>8 (18 · 16 = 288)</td></tr><tr><td>18 : 16</td><td>1</td><td>2</td></tr><tr><td>1 : 16</td><td>0</td><td>1 ↑</td></tr></table></div>
${eq('4739<sub>10</sub> = <span class="r">1283<sub>16</sub></span> &nbsp; Probe: 1·4096 + 2·256 + 8·16 + 3 = 4739 ✓')}
<p>${S('MS', 'Zahlensysteme 15.09.')}</p>
${box('falle', 'Falle · Rest beim Teilen', `<p>Den Rest bekommst du am Taschenrechner so: 4739 : 16 = 296,1875 → ganze Zahl 296 → 296 · 16 = 4736 → Rest = 4739 − 4736 = <b>3</b>. Die Kommastellen (0,1875) sind <b>nicht</b> der Rest!</p>`)}

<h3>Hex ↔ Binär: 1 Hex-Ziffer = 4 Bit</h3>
<p>Das ist der eigentliche Grund für Hex: <b>jede Hex-Ziffer entspricht genau 4 Bit</b> (ein „Nibble“). Man übersetzt Ziffer für Ziffer, ohne über Dezimal zu gehen.</p>
${eq('3<sub>16</sub> = 0011 &nbsp;→&nbsp; 33<sub>16</sub> = <span class="r">0011 0011<sub>2</sub></span>')}
${eq('1101 0110<sub>2</sub> → 1101 = 13 = D, 0110 = 6 → <span class="r">D6<sub>16</sub></span>')}
${box('merke', 'Merke · Hex und Binär', `<p><b>1 Hex-Ziffer = 4 Bit, 2 Hex-Ziffern = 1 Byte.</b> Beim Gruppieren von <b>rechts</b> in 4er-Blöcke teilen und vorne mit Nullen auffüllen.</p>`)}

<h3>Wo wird was in der IT verwendet?</h3>
<dl class="defs">
<dt>Binär</dt><dd>Intern im Computer: Speicher, Prozessor, Datenübertragung. Bits und Bytes, IP-Adressen und Subnetzmasken im Detail.</dd>
<dt>Hexadezimal</dt><dd>Kurzschrift für Binär: MAC-Adressen (<code>00:1A:2B:…</code>), IPv6-Adressen, Farbcodes (<code>#FF8800</code>), Speicheradressen, Fehlercodes.</dd>
<dt>Oktal (Basis 8)</dt><dd>Linux-Dateirechte: r = 4, w = 2, x = 1. <code>chmod 750</code> = Besitzer rwx (4+2+1), Gruppe r-x (4+1), Andere nichts. <code>644</code> = rw-r--r--. ${S('MS', 'Zahlensysteme 15.09.')}</dd>
<dt>Dezimal</dt><dd>Für Menschen: Eingaben, Anzeigen, Preise, Messwerte.</dd>
</dl>
${box('merke', 'Merke · Warum binär?', `<p>Ein Computer kennt nur <b>zwei Zustände</b>: Spannung an / aus (1 / 0). Zwei Zustände sind mit Transistoren leicht zu bauen, sehr <b>störsicher</b> (ein bisschen Rauschen macht aus „an“ nicht „aus“) und mit einfacher Logik (UND, ODER, NICHT) zu verarbeiten.</p>`)}
`,
mini: [
  { q: 'Wie viel ist 1011₂ im Dezimalsystem?', o: ['11', '13', '1011', '7'], a: 0, why: '8 + 0 + 2 + 1 = 11.', src: ['MS', 'Zahlensysteme 15.09.'] },
  { q: 'Wie viele Bit entsprechen einer Hex-Ziffer?', o: ['2', '4', '8', '16'], a: 1, why: '16 = 2⁴, also genau 4 Bit pro Hex-Ziffer.', src: ['MS', 'Zahlensysteme 15.09.'] },
  { q: 'Linux: Was bedeutet chmod 640 für die Gruppe?', o: ['rwx', 'r-x', 'r--', 'rw-'], a: 2, why: 'Die mittlere Ziffer 4 = nur r (lesen).', src: ['MS', 'Zahlensysteme 15.09.'] }
] },

/* ─────────────── 2 ─────────────── */
{ id: 'm2', part: 'Teil A · Mathe-Werkzeuge', title: 'Technische & wissenschaftliche Notation',
html: `
${box('faden', 'Roter Faden', `<p>In der Elektrotechnik kommen winzige (43 µA) und riesige Zahlen (258 MW) vor. Damit man nicht Nullen zählen muss, schreibt man sie mit <b>Zehnerpotenzen</b> und <b>Vorsilben</b>. Das brauchst du ab jetzt in jeder Rechnung.</p>`)}
<h3>Die Vorsilben (Präfixe)</h3>
<p>Jeder Schritt ist <b>Faktor 1000 = 10³</b>. ${S('MS', 'Notation')}</p>
<div class="rules">
<div><b>G</b> Giga<small>10⁹</small></div><div><b>M</b> Mega<small>10⁶</small></div><div><b>k</b> Kilo<small>10³</small></div><div><b>–</b> Grundeinheit<small>10⁰ = 1</small></div><div><b>m</b> Milli<small>10⁻³</small></div><div><b>µ</b> Mikro<small>10⁻⁶</small></div><div><b>n</b> Nano<small>10⁻⁹</small></div><div><b>p</b> Piko<small>10⁻¹²</small></div>
</div>
${box('merke', 'Merke · Präfixe', `<p><b>„G-M-k – m-µ-n“</b>: jeweils Faktor 1000. Nach oben: 10³, 10⁶, 10⁹. Nach unten: 10⁻³, 10⁻⁶, 10⁻⁹.</p>`)}

<h3>Wissenschaftliche Notation</h3>
<p>Form <b>a · 10<sup>n</sup></b> mit <b>genau einer Ziffer (1–9) vor dem Komma</b>, also 1 ≤ a &lt; 10.</p>
<h3>Technische Notation</h3>
<p>Form <b>a · 10<sup>n</sup></b>, aber der <b>Exponent ist durch 3 teilbar</b> (…, −6, −3, 0, 3, 6, …). Dafür dürfen 1 bis 3 Ziffern vor dem Komma stehen (1 ≤ a &lt; 1000). Vorteil: Der Exponent passt direkt zu einer Vorsilbe. ${S('MS', 'Notation')}</p>
<div class="scroll"><table class="tbl">
<tr><th>Wert</th><th>technisch</th><th>wissenschaftlich</th></tr>
<tr><td>257,3 MHz</td><td>257,3 · 10⁶ Hz</td><td>2,573 · 10⁸ Hz</td></tr>
<tr><td>43 µA</td><td>43 · 10⁻⁶ A</td><td>4,3 · 10⁻⁵ A</td></tr>
<tr><td>27 400 000</td><td>27,4 · 10⁶</td><td>2,74 · 10⁷</td></tr>
</table></div>
<p>${S('MS', 'Notation')}</p>
${box('merke', 'Merke · Komma verschieben', `<p><b>Komma nach links → Exponent wird größer.</b> &nbsp; <b>Komma nach rechts → Exponent wird kleiner.</b><br>Pro Stelle genau um 1. Der Wert der Zahl bleibt gleich.</p>`)}
<div class="box bsp"><span class="lbl">Beispiel Schritt für Schritt</span>
<p>257,3 MHz wissenschaftlich:</p><ol class="steps"><li>Vorsilbe ersetzen: M = 10⁶ → 257,3 · 10⁶ Hz</li><li>Komma so verschieben, dass nur eine Ziffer davor steht: 257,3 → 2,573 (2 Stellen nach <b>links</b>)</li><li>Nach links → Exponent <b>+2</b>: 10⁶ → 10⁸</li><li>Ergebnis: <b>2,573 · 10⁸ Hz</b></li></ol></div>
${box('falle', 'Falle · kleine Zahlen', `<p>Zahlen kleiner als 1 haben einen <b>negativen</b> Exponenten: 0,000043 A = 4,3 · 10⁻⁵ A. Wenn du bei einer kleinen Zahl einen positiven Exponenten bekommst, hast du in die falsche Richtung geschoben.</p>`)}
${box('tipp', 'Tipp · Taschenrechner', `<p>Mit der Taste <b>×10<sup>x</sup></b> bzw. <b>EXP</b> gibst du Zehnerpotenzen ein (43 EXP −6). Die Taste <b>ENG</b> zeigt das Ergebnis in technischer Notation.</p>`)}
`,
mini: [
  { q: 'Wie lautet 0,0047 A in wissenschaftlicher Notation?', o: ['4,7 · 10⁻³ A', '47 · 10⁻⁴ A', '4,7 · 10³ A', '0,47 · 10⁻²  A'], a: 0, why: 'Komma 3 Stellen nach rechts → Exponent −3, eine Ziffer vor dem Komma.', src: ['MS', 'Notation'] },
  { q: 'Welche Schreibweise ist technische Notation?', o: ['2,573 · 10⁸ Hz', '257,3 · 10⁶ Hz', '25,73 · 10⁷ Hz', '0,2573 · 10⁹ Hz'], a: 1, why: 'Technisch: Exponent durch 3 teilbar (10⁶ = Mega).', src: ['MS', 'Notation'] }
] },

/* ─────────────── 3 ─────────────── */
{ id: 'm3', part: 'Teil A · Mathe-Werkzeuge', title: 'Pythagoras & Winkelfunktionen',
html: `
${box('faden', 'Roter Faden', `<p>Das rechtwinklige Dreieck ist <b>das</b> Werkzeug für das Leistungsdreieck (Kapitel 7): P, Q und S bilden genau so ein Dreieck. Wer Pythagoras und sin/cos/tan kann, kann später jede Leistungsaufgabe.</p>`)}
<figure>${SVG_TRI}<figcaption>Die <b>Hypotenuse c</b> liegt immer gegenüber dem rechten Winkel und ist die längste Seite. Die Katheten heißen je nach Winkel <b>Gegenkathete</b> (gegenüber) oder <b>Ankathete</b> (liegt an).</figcaption></figure>
<h3>Satz des Pythagoras</h3>
${box('merke', 'Merke · Pythagoras', `${eq('c² = a² + b²')}<p>Hypotenuse gesucht: ${'<b>c = √(a² + b²)</b>'} &nbsp;·&nbsp; Kathete gesucht: <b>a = √(c² − b²)</b></p><p>Hypotenuse → <b>plus</b>, Kathete → <b>minus</b>.</p>`)}
<p>${S('MS', 'Pythagoras')}</p>
<div class="box bsp"><span class="lbl">Beispiel aus der Mitschrift</span>
<p>a = 305 cm, b = 137 cm, gesucht c:</p>
${eq('c = √(305² + 137²) = √(93 025 + 18 769) = √111 794 = <span class="r">334,36 cm</span>')}
<p>c = 5,72 kW, a = 980 W, gesucht b. Zuerst <b>gleiche Einheit</b>: 5,72 kW = 5720 W.</p>
${eq('b = √(5720² − 980²) = √(32 718 400 − 960 400) = √31 758 000 = <span class="r">5635,42 W</span>')}
</div>
${box('falle', 'Falle · Pythagoras', `<ul><li><b>c ≠ a + b</b>: Man darf die Seiten nicht einfach addieren. Erst quadrieren, dann addieren, dann Wurzel.</li><li><b>Wurzel nicht vergessen</b>: c² = 111 794 ist noch nicht c.</li><li><b>Einheiten angleichen</b> (kW und W, cm und m), bevor du quadrierst.</li></ul>`)}

<h3>Winkelfunktionen: sin, cos, tan</h3>
${box('merke', 'Merke · SOH-CAH-TOA', `<p><b>S</b>inus = <b>G</b>egenkathete / <b>H</b>ypotenuse · <b>C</b>osinus = <b>A</b>nkathete / <b>H</b>ypotenuse · <b>T</b>angens = <b>G</b>egenkathete / <b>A</b>nkathete</p>${eq('sin α = a/c &nbsp; cos α = b/c &nbsp; tan α = a/b')}<p>Eselsbrücke: <b>„GHAHGA“</b> – sin: G/H, cos: A/H, tan: G/A.</p>`)}
<p>${S('MS', 'Winkelfunktionen')}</p>
<p><b>Winkel gesucht?</b> Dann brauchst du die Umkehrfunktion: am Taschenrechner <b>SHIFT + sin</b> (= sin⁻¹ bzw. arcsin), genauso für cos⁻¹ und tan⁻¹.</p>
<div class="box bsp"><span class="lbl">Beispiel</span>
<p>a = 3, b = 4, c = 5. Gesucht α:</p>
${eq('tan α = a/b = 3/4 = 0,75 → α = tan⁻¹(0,75) = <span class="r">36,87°</span>')}
<p>Der zweite Winkel: im Dreieck sind alle Winkel zusammen 180°, also <b>β = 90° − α = 53,13°</b>.</p></div>
${box('falle', 'Falle · DEG statt RAD', `<p>Der Taschenrechner muss auf <b>DEG</b> (Grad) stehen. Steht er auf RAD, kommt bei sin(37) statt 0,602 der Wert −0,644 heraus, und alles ist falsch. Schau oben im Display, ob „D“ oder „DEG“ steht.</p>`)}
${box('tipp', 'Tipp · Welche Funktion?', `<ol><li>Markiere den Winkel, um den es geht.</li><li>Benenne die Seiten von diesem Winkel aus: gegenüber = G, daneben = A, längste = H.</li><li>Welche zwei Seiten kommen vor (gegeben + gesucht)? G und H → sin, A und H → cos, G und A → tan.</li></ol>`)}
<h3>Die Brücke zum Leistungsdreieck</h3>
<p>Im Leistungsdreieck ist der Winkel <b>φ</b> (phi). <b>P</b> liegt am Winkel (Ankathete), <b>Q</b> gegenüber (Gegenkathete), <b>S</b> ist die Hypotenuse. Darum gilt später <b>cos φ = P/S</b> und <b>sin φ = Q/S</b>.</p>
`,
mini: [
  { q: 'Katheten 6 cm und 8 cm. Wie lang ist die Hypotenuse?', o: ['14 cm', '10 cm', '48 cm', '7 cm'], a: 1, why: '√(36 + 64) = √100 = 10 cm. Nicht 6 + 8!', src: ['MS', 'Pythagoras'] },
  { q: 'Gegeben sind Ankathete und Hypotenuse. Welche Funktion?', o: ['sin', 'cos', 'tan', 'Pythagoras ohne Winkel'], a: 1, why: 'cos = Ankathete / Hypotenuse.', src: ['MS', 'Winkelfunktionen'] }
] },

/* ─────────────── 4 ─────────────── */
{ id: 'm4', part: 'Teil B · Gleichstrom-Grundlagen', title: 'Ohmsches Gesetz & elektrische Leistung',
html: `
${box('faden', 'Roter Faden', `<p>Jetzt geht es um Strom. Zuerst die einfachste Welt: <b>Gleichstrom</b>. Hier hängen Spannung, Strom und Widerstand über das Ohmsche Gesetz zusammen, und die Leistung ist einfach <b>U · I</b>. Bei Wechselstrom (Teil C) wird genau diese Leistung in drei Teile zerlegt.</p>`)}
<dl class="defs">
<dt>Spannung U</dt><dd>in Volt (V). Der „Druck“, der die Elektronen antreibt.</dd>
<dt>Strom I</dt><dd>in Ampere (A). Wie viel Ladung pro Sekunde fließt.</dd>
<dt>Widerstand R</dt><dd>in Ohm (Ω). Wie stark der Stromfluss gebremst wird.</dd>
</dl>
<div class="split"><div>
${box('merke', 'Merke · Ohmsches Gesetz', `${eq('U = R · I &nbsp;&nbsp; R = U / I &nbsp;&nbsp; I = U / R')}<p>Dreieck: <b>U oben, R und I unten</b>. Gesuchte Größe zuhalten: steht der Rest nebeneinander → mal, übereinander → geteilt.</p>`)}
<p>Bei gleichem Widerstand gilt: <b>doppelte Spannung → doppelter Strom</b> (Strom und Spannung sind proportional). ${S('MS', 'Ohm & Leistung')}</p>
</div><figure>${SVG_OHM}<figcaption>Das Ohmsche Dreieck aus der Mitschrift.</figcaption></figure></div>

<h3>Elektrische Leistung</h3>
<p>Leistung ist Energie pro Zeit. Elektrisch: <b>Spannung mal Strom</b>, Einheit <b>Watt (W)</b>. ${S('MS', 'Ohm & Leistung')}</p>
${box('merke', 'Merke · Leistung', `${eq('P = U · I &nbsp;&nbsp; P = I² · R &nbsp;&nbsp; P = U² / R')}<p>Die zwei hinteren Formeln entstehen, wenn man U = R · I bzw. I = U/R in P = U · I einsetzt.</p>`)}
<div class="box bsp"><span class="lbl">Beispiele aus der Mitschrift</span>
${eq('230 V · 16,7 A = <span class="r">3841 W = 3,841 kW</span>')}
${eq('3,2 V · 34 mA = 3,2 V · 0,034 A = <span class="r">0,1088 W = 108,8 mW</span>')}
${eq('72 V · 40 A = <span class="r">2880 W = 2,88 kW</span>')}</div>
${box('falle', 'Falle · Vorsilben umrechnen', `<p>34 mA sind <b>0,034 A</b>, nicht 34 A. Rechne immer zuerst in die Grundeinheit (V, A, Ω) um, dann einsetzen. Sonst ist das Ergebnis um Faktor 1000 daneben.</p>`)}

<h3>Reihen- und Parallelschaltung</h3>
<dl class="defs">
<dt>Reihe</dt><dd>Widerstände hintereinander, <b>gleicher Strom</b> überall. <b>R<sub>g</sub> = R₁ + R₂ + R₃</b>. Der Gesamtwiderstand wird größer.</dd>
<dt>Parallel</dt><dd>Widerstände nebeneinander, <b>gleiche Spannung</b> an allen. <b>1/R<sub>g</sub> = 1/R₁ + 1/R₂ + …</b>. Für genau zwei: <b>R<sub>g</sub> = R₁·R₂ / (R₁+R₂)</b>. Der Gesamtwiderstand ist <b>kleiner als der kleinste</b> Einzelwiderstand.</dd>
<dt>Gruppenschaltung</dt><dd>Gemischt: zuerst die Parallel-Gruppe zu einem Ersatzwiderstand zusammenfassen, dann den Rest in Reihe dazuzählen.</dd>
</dl>
<p>${S('MS', 'Ohm & Leistung')}</p>
${box('falle', 'Falle · Parallel', `<p>Bei 1/R<sub>g</sub> = 1/R₁ + 1/R₂ kommt zuerst <b>1/R<sub>g</sub></b> heraus. Am Ende noch den <b>Kehrwert</b> bilden (1/x-Taste)! Probe: R<sub>g</sub> muss kleiner sein als der kleinste Widerstand.</p>`)}

<h3>Welche Leistung zählt bei IT-Geräten?</h3>
<p>Bei Gleichstrom (z. B. 12 V im PC) ist es einfach P = U · I. Am Wechselstromnetz gibt es drei Leistungen (Kapitel 7). Für IT gilt: Die <b>Wirkleistung P in W</b> ist das, was das Gerät wirklich verbraucht und als Wärme abgibt, also Stromrechnung und Kühlung im Serverraum. Für Netzteile, Leitungen, Sicherungen und vor allem die <b>USV</b> zählt die <b>Scheinleistung S in VA</b>, weil Schaltnetzteile einen Leistungsfaktor unter 1 haben und mehr Strom ziehen, als P vermuten lässt. ${S('LD', 2)} ${S('MS', 'USV')}</p>
`,
mini: [
  { q: 'U = 12 V, R = 4 Ω. Wie groß ist I?', o: ['48 A', '3 A', '0,33 A', '16 A'], a: 1, why: 'I = U/R = 12/4 = 3 A.', src: ['MS', 'Ohm & Leistung'] },
  { q: 'Zwei Widerstände 100 Ω parallel ergeben …', o: ['200 Ω', '100 Ω', '50 Ω', '0,02 Ω'], a: 2, why: '100·100/(100+100) = 50 Ω, kleiner als der kleinste.', src: ['MS', 'Ohm & Leistung'] },
  { q: '5 V und 400 mA – welche Leistung?', o: ['2000 W', '2 W', '0,08 W', '80 W'], a: 1, why: '400 mA = 0,4 A → 5 · 0,4 = 2 W.', src: ['MS', 'Ohm & Leistung'] }
] },

/* ─────────────── 5 ─────────────── */
{ id: 'm5', part: 'Teil C · Wechselstrom', title: 'Wechselspannung: Û, Ueff, Uss, T und f',
html: `
${box('faden', 'Roter Faden', `<p>Aus der Steckdose kommt kein Gleichstrom, sondern <b>Wechselspannung</b>: Sie schwingt als Sinus 50-mal pro Sekunde hin und her. Um damit rechnen zu können, brauchen wir Kenngrößen. Die wichtigste ist der <b>Effektivwert</b>, weil man mit ihm genauso rechnen kann wie mit Gleichstrom.</p>`)}
<figure>${SVG_SINE}<figcaption>Eine Periode einer Sinusspannung u(t) = Û · sin(ωt). ${S('WS', 4)}</figcaption></figure>
<dl class="defs">
<dt>Û (Scheitelwert)</dt><dd>Auch Amplitude, Spitzenwert, U<sub>s</sub> oder U<sub>p</sub> (peak). Der höchste Wert, von der Nulllinie aus gemessen. ${S('WS', 4)}</dd>
<dt>U<sub>ss</sub> (Spitze-Spitze)</dt><dd>Auch U<sub>pp</sub> (peak-to-peak). Vom tiefsten bis zum höchsten Punkt: <b>U<sub>ss</sub> = 2 · Û</b>. ${S('WS', 5)}</dd>
<dt>U<sub>eff</sub> (Effektivwert)</dt><dd>Auch U<sub>RMS</sub>. Der Wert einer Gleichspannung, die in einem Widerstand <b>gleich viel Wärme</b> erzeugen würde. <b>U<sub>eff</sub> = Û / √2 ≈ 0,707 · Û</b>. ${S('WS', 8)}</dd>
<dt>T (Periodendauer)</dt><dd>Zeit für eine volle Schwingung, in Sekunden (oft ms). ${S('WS', 5)}</dd>
<dt>f (Frequenz)</dt><dd>Schwingungen pro Sekunde, in Hertz (Hz). <b>f = 1/T</b> und <b>T = 1/f</b>. ${S('WS', 5)}</dd>
<dt>ω (Kreisfrequenz)</dt><dd><b>ω = 2π · f</b>, Einheit 1/s. Braucht man für X<sub>C</sub> und X<sub>L</sub>. ${S('WS', 5)}</dd>
</dl>
${box('merke', 'Merke · Kenngrößen', `${eq('U<sub>eff</sub> = Û / √2 &nbsp;&nbsp; Û = U<sub>eff</sub> · √2 &nbsp;&nbsp; U<sub>ss</sub> = 2 · Û')}${eq('f = 1 / T &nbsp;&nbsp; T = 1 / f &nbsp;&nbsp; ω = 2π · f')}<p>Reihenfolge der Größe: <b>U<sub>eff</sub> &lt; Û &lt; U<sub>ss</sub></b> (230 V &lt; 325 V &lt; 650 V).</p>`)}
<p>${S('MS', 'Kenngrößen')}</p>
<div class="box bsp"><span class="lbl">Beispiel Steckdose (Mitschrift A1)</span>
<p>U<sub>eff</sub> = 230 V, f = 50 Hz.</p>
${eq('Û = 230 V · √2 = <span class="r">325,27 V</span>')}
${eq('U<sub>ss</sub> = 2 · 325,27 V = <span class="r">650,54 V</span>')}
${eq('T = 1 / 50 Hz = 0,02 s = <span class="r">20 ms</span>')}
${eq('ω = 2π · 50 Hz = <span class="r">314,16 s⁻¹</span>')}</div>
<div class="box bsp"><span class="lbl">Beispiel Mitschrift A2</span>
<p>T = 2,5 ms, Û = 12 V.</p>
${eq('f = 1 / 0,0025 s = <span class="r">400 Hz</span> &nbsp;&nbsp; U<sub>eff</sub> = 12 V / √2 = <span class="r">8,49 V</span>')}</div>
${box('falle', 'Falle · ms und Hz', `<p>Für f = 1/T muss T in <b>Sekunden</b> stehen: 2,5 ms = 0,0025 s. Wer 1/2,5 rechnet, bekommt 0,4 statt 400 Hz.</p>`)}

<h3>Warum Effektivwerte statt Maximalwerte?</h3>
<p>Mit dem Effektivwert kann man <b>rechnen wie bei Gleichstrom</b>: P = U<sub>eff</sub> · I<sub>eff</sub> gibt direkt die Wärmeleistung. Alle Messgeräte zeigen den Effektivwert an, und auch „230 V“ auf der Steckdose ist ein Effektivwert. Den Scheitelwert braucht man nur, wenn es um die <b>Spannungsfestigkeit</b> von Bauteilen und Isolierung geht (die müssen 325 V aushalten). ${S('WS', 7)} ${S('WS', 10)}</p>

<h3>Zusatz: Gleichrichtwert (Mittelwert)</h3>
<p>Über eine ganze Periode ist der Mittelwert eines Sinus 0 (die positive und negative Halbwelle heben sich auf). Über eine Halbwelle gilt <b>U<sub>M</sub> = (2/π) · Û ≈ 0,637 · Û</b>. ${S('WS', 7)}</p>
`,
mini: [
  { q: 'Û = 100 V. Wie groß ist U_eff?', o: ['141,4 V', '70,7 V', '200 V', '50 V'], a: 1, why: 'U_eff = Û/√2 = 100/1,414 = 70,7 V.', src: ['WS', 8] },
  { q: 'f = 1 kHz. Wie groß ist T?', o: ['1 s', '1 ms', '1000 s', '6,28 ms'], a: 1, why: 'T = 1/1000 Hz = 0,001 s = 1 ms.', src: ['WS', 5] },
  { q: 'Was zeigt ein normales Multimeter bei Wechselspannung an?', o: ['Scheitelwert', 'Spitze-Spitze', 'Effektivwert', 'Mittelwert über eine Periode (0)'], a: 2, why: 'Messgeräte und Typenschilder geben Effektivwerte an.', src: ['WS', 10] }
] },

/* ─────────────── 6 ─────────────── */
{ id: 'm6', part: 'Teil C · Wechselstrom', title: 'Blindwiderstand: Kondensator & Spule',
html: `
${box('faden', 'Roter Faden', `<p>Bei Gleichstrom bremst nur der ohmsche Widerstand R. Bei Wechselstrom bremsen auch <b>Kondensatoren</b> und <b>Spulen</b>, aber anders: Sie verbrauchen keine Energie, sondern <b>speichern sie kurz und geben sie zurück</b>. Dabei verschieben sie Strom und Spannung gegeneinander. Daraus entsteht in Kapitel 7 die Blindleistung.</p>`)}
<div class="scroll"><table class="tbl">
<tr><th>Bauteil</th><th>Widerstand</th><th>Strom und Spannung</th><th>Frequenz steigt →</th></tr>
<tr><td><b>Ohmscher Widerstand R</b></td><td>R (fest)</td><td>in Phase (gleichzeitig)</td><td>bleibt gleich</td></tr>
<tr><td><b>Kondensator C</b></td><td class="c-ink">X<sub>C</sub> = 1 / (2π·f·C)</td><td>Strom <b>eilt 90° voraus</b></td><td>X<sub>C</sub> wird <b>kleiner</b></td></tr>
<tr><td><b>Spule L</b></td><td class="c-red">X<sub>L</sub> = 2π·f·L</td><td>Strom <b>hinkt 90° nach</b></td><td>X<sub>L</sub> wird <b>größer</b></td></tr>
</table></div>
<p>${S('WS', 12)} ${S('WS', 14)} ${S('WS', 15)}</p>
${box('merke', 'Merke · Wer eilt vor?', `<p><b>„Beim Kondensator der Strom eilt vor, bei Induktivitäten die Ströme sich verspäten.“</b> ${S('WS', 14)}</p><p>Oder kurz: <b>CIVIL</b> – bei <b>C</b> kommt <b>I</b> vor <b>V</b> (Spannung), bei <b>L</b> kommt <b>V</b> vor <b>I</b>.</p>`)}
${box('merke', 'Merke · Blindwiderstände', `${eq('X<sub>C</sub> = 1 / (ω·C) = 1 / (2π·f·C) &nbsp;&nbsp; X<sub>L</sub> = ω·L = 2π·f·L')}<p>Einheit beide Male <b>Ω</b>. Strom wie beim Ohmschen Gesetz: <b>I = U / X</b>.</p>`)}
<h3>Was passiert bei der Frequenz?</h3>
<ul>
<li><b>Kondensator:</b> f steht im <b>Nenner</b> → höhere Frequenz, kleinerer X<sub>C</sub>. Bei Gleichstrom (f = 0) ist X<sub>C</sub> unendlich: <b>Kondensator sperrt Gleichstrom</b>.</li>
<li><b>Spule:</b> f steht im <b>Zähler</b> → höhere Frequenz, größerer X<sub>L</sub>. Bei Gleichstrom ist X<sub>L</sub> = 0: eine ideale Spule ist dann nur ein Draht.</li>
</ul>
<div class="box bsp"><span class="lbl">Beispiel nach Kippels S. 16</span>
<p>Spule L = 10 H an U = 12 V, f = 50 Hz. Wie groß ist I?</p>
${eq('X<sub>L</sub> = 2π · 50 Hz · 10 H = 3141,59 Ω')}
${eq('I = U / X<sub>L</sub> = 12 V / 3141,59 Ω = 0,00382 A = <span class="r">3,82 mA</span>')}
<p>Kondensator C = 1 µF hat X<sub>C</sub> = 318 Ω. Bei welcher Frequenz? Formel nach f umstellen:</p>
${eq('f = 1 / (2π · C · X<sub>C</sub>) = 1 / (2π · 0,000001 F · 318 Ω) = <span class="r">≈ 500 Hz</span>')}
<p>${S('WS', 16)} ${S('WS', 17)}</p></div>
${box('falle', 'Falle · Kondensator', `<ul><li>Den <b>Kehrwert</b> nicht vergessen: X<sub>C</sub> = <b>1 /</b> (2π f C). Am Taschenrechner Klammer setzen!</li><li>µF in F umrechnen: 1 µF = 10⁻⁶ F = 0,000001 F.</li></ul>`)}
<h3>Warum heißt das „Blind“widerstand?</h3>
<p>Ein ohmscher Widerstand wandelt Energie in Wärme um (Wirkleistung). Kondensator und Spule <b>speichern</b> Energie eine Viertelperiode lang (im elektrischen bzw. magnetischen Feld) und <b>geben sie in der nächsten Viertelperiode zurück</b>. Die Energie pendelt hin und her, es wird nichts verbraucht. Trotzdem fließt Strom durch die Leitungen. ${S('WS', 13)}</p>
`,
mini: [
  { q: 'Die Frequenz wird verdoppelt. Was passiert mit X_C?', o: ['verdoppelt sich', 'halbiert sich', 'bleibt gleich', 'wird null'], a: 1, why: 'f steht bei X_C im Nenner → doppelte f, halber X_C.', src: ['WS', 14] },
  { q: 'Bei welchem Bauteil hinkt der Strom der Spannung 90° nach?', o: ['Widerstand', 'Kondensator', 'Spule', 'bei keinem'], a: 2, why: '„Bei Induktivitäten die Ströme sich verspäten.“', src: ['WS', 15] }
] },

/* ─────────────── 7 ─────────────── */
{ id: 'm7', part: 'Teil C · Wechselstrom', title: 'Leistungsdreieck: P, Q, S und cos φ',
html: `
${box('faden', 'Roter Faden', `<p>Hier kommt alles zusammen: Weil Kondensatoren und Spulen Strom und Spannung verschieben (Kap. 6), ist U · I bei Wechselstrom nicht mehr nur die echte Leistung. Sie teilt sich auf in einen <b>Wirkanteil</b> und einen <b>Blindanteil</b>, und die drei bilden ein rechtwinkliges Dreieck, also Pythagoras und Winkelfunktionen aus Kapitel 3.</p>`)}
<dl class="defs">
<dt class="c-grn">Wirkleistung P</dt><dd>in <b>Watt (W)</b>. Wird wirklich in Wärme, Licht, Bewegung umgewandelt. Das zahlt man auf der Stromrechnung. ${S('LD', 2)}</dd>
<dt class="c-red">Blindleistung Q</dt><dd>in <b>var</b> (Volt-Ampere reaktiv). Pendelt zwischen Netz und Kondensator/Spule hin und her und verrichtet keine Arbeit, belastet aber Leitungen und Netz. ${S('WS', 13)}</dd>
<dt class="c-ink">Scheinleistung S</dt><dd>in <b>VA</b> (Voltampere). <b>S = U · I</b>, also das, was das Netz insgesamt liefern muss. Danach werden Generatoren, Transformatoren, Leitungen und USVs ausgelegt. ${S('LD', 2)}</dd>
</dl>
<figure>${SVG_LD}<figcaption>Das Leistungsdreieck: P waagrecht, Q senkrecht, S als Hypotenuse. φ ist der Phasenverschiebungswinkel. ${S('LD', 2)}</figcaption></figure>
${box('merke', 'Merke · Leistungsdreieck', `${eq('S² = P² + Q² &nbsp;→&nbsp; S = √(P² + Q²)')}${eq('P = S · cos φ = U · I · cos φ &nbsp;&nbsp; Q = S · sin φ = √(S² − P²)')}${eq('cos φ = P / S &nbsp;&nbsp; S = U · I')}<p>Einheiten: <b>P in W, Q in var, S in VA</b>. Pythagoras, denn S ist die „geometrische Summe“, nicht P + Q! ${S('LD', 2)}</p>`)}
<p>${S('MS', 'Leistungsformeln')}</p>

<h3>Der Leistungsfaktor cos φ</h3>
<p>Der Leistungsfaktor λ sagt, welcher <b>Anteil</b> der Scheinleistung wirklich als Wirkleistung genutzt wird: <b>λ = P / S</b>. Bei sinusförmigem Strom ist λ = cos φ. ${S('LD', 3)}</p>
<div class="scroll"><table class="tbl">
<tr><th>cos φ</th><th>φ</th><th>Bedeutung</th><th>Beispiele</th></tr>
<tr><td><b>1</b></td><td>0°</td><td>nur Wirkleistung, S = P, Strom und Spannung in Phase</td><td>Heizgerät, Glühlampe, Wasserkocher</td></tr>
<tr><td><b>0,9</b></td><td>≈ 26°</td><td>kleiner Blindanteil</td><td>gute Netzteile</td></tr>
<tr><td><b>0,7</b></td><td>≈ 45°</td><td>großer Blindanteil, viel mehr Strom nötig</td><td>Motoren, ältere Vorschaltgeräte</td></tr>
<tr><td><b>0</b></td><td>90°</td><td>nur Blindleistung, P = 0</td><td>idealer Kondensator, ideale Spule</td></tr>
</table></div>
<p>${S('LD', 3)} ${S('LD', 4)} Hinter dem Wert steht oft „ind.“ (induktiv, Spule/Motor) oder „kap.“ (kapazitiv).</p>
${box('merke', 'Merke · Leistungsfaktor', `<p>cos φ liegt immer <b>zwischen 0 und 1</b>. <b>Je näher an 1, desto besser</b>: Für dieselbe Wirkleistung braucht man dann weniger Scheinleistung und weniger Strom.</p>`)}
${box('falle', 'Falle · cos φ ist nicht η', `<p>Der Leistungsfaktor cos φ = P/S (Wirk- zu Scheinleistung) ist <b>nicht</b> der Wirkungsgrad η = P<sub>ab</sub>/P<sub>zu</sub> (Nutzen zu Aufwand, Kap. 9). Beide sind höchstens 1, aber sie messen Verschiedenes. ${S('LD', 4)}</p>`)}

<h3>Aus zwei Größen die dritte – Schritt für Schritt</h3>
<div class="box bsp"><span class="lbl">Mitschrift: U = 230 V, I = 3,4 A, cos φ = 0,96</span>
${eq('S = U · I = 230 V · 3,4 A = <span class="r">782 VA</span>')}
${eq('P = S · cos φ = 782 VA · 0,96 = <span class="r">750,72 W</span>')}
${eq('Q = √(S² − P²) = √(782² − 750,72²) = <span class="r">218,96 var</span>')}</div>
<div class="box bsp"><span class="lbl">Mitschrift Aufgabe 2: U = 230 V, I = 3,2 A, P = 460 W</span>
${eq('S = 230 V · 3,2 A = <span class="r">736 VA</span>')}
${eq('Q = √(736² − 460²) = √(541 696 − 211 600) = √330 096 = <span class="r">574,54 var</span>')}
${eq('cos φ = P / S = 460 / 736 = <span class="r">0,625 ≈ 0,63</span>')}</div>
<div class="box bsp"><span class="lbl">Mitschrift Aufgabe 5: P = 4 kW, Q = 3 kvar</span>
${eq('S = √(4² + 3²) kVA = √25 kVA = <span class="r">5 kVA</span> &nbsp;&nbsp; cos φ = 4 / 5 = <span class="r">0,8</span>')}
<p>In deiner Mitschrift steht bei S die Einheit „kvar“. Richtig ist <b>kVA</b>: S hat immer VA. ${S('MS', 'Aufgaben Leistung')}</p></div>
${box('falle', 'Falle · Leistungsdreieck', `<ul><li><b>S ≠ P + Q</b>. 4 kW + 3 kvar ergibt nicht 7 kVA, sondern 5 kVA (Pythagoras).</li><li>Für Q brauchst du <b>sin φ</b>, nicht cos φ. Oder einfacher: Q = √(S² − P²).</li><li>Winkel aus cos φ: <b>φ = cos⁻¹(…)</b> im DEG-Modus.</li></ul>`)}
`,
mini: [
  { q: 'P = 6 kW, Q = 8 kvar. Wie groß ist S?', o: ['14 kVA', '10 kVA', '2 kVA', '48 kVA'], a: 1, why: 'S = √(36 + 64) = 10 kVA.', src: ['LD', 2] },
  { q: 'In welcher Einheit wird die Scheinleistung angegeben?', o: ['W', 'var', 'VA', 'Wh'], a: 2, why: 'S in VA, P in W, Q in var.', src: ['LD', 2] },
  { q: 'Welcher Verbraucher hat cos φ ≈ 1?', o: ['Elektromotor', 'Heizlüfter', 'idealer Kondensator', 'Leuchtstofflampe mit Drossel'], a: 1, why: 'Rein ohmsche Verbraucher wie Heizgeräte haben cos φ = 1.', src: ['LD', 4] }
] },

/* ─────────────── 8 ─────────────── */
{ id: 'm8', part: 'Teil C · Wechselstrom', title: 'Blindleistung & Kompensation',
html: `
${box('faden', 'Roter Faden', `<p>Wir wissen jetzt, dass Blindleistung keine Arbeit verrichtet. Trotzdem ist sie ein Problem fürs Netz. Die Lösung heißt <b>Kompensation</b>: Man gleicht induktive Blindleistung mit kapazitiver aus (die beiden sind ja genau gegenläufig, Kap. 6).</p>`)}
<h3>Warum ist Blindleistung unerwünscht?</h3>
<ul>
<li>Der <b>Strom</b> durch die Leitungen ist größer, als für die Wirkleistung nötig wäre (I = S/U, und S ist größer als P).</li>
<li>Mehr Strom heißt mehr <b>Leitungsverluste</b> (Wärme I² · R) und mehr Spannungsabfall.</li>
<li>Kabel, Transformatoren und Generatoren müssen <b>größer</b> (teurer) ausgelegt werden, weil sie nach S dimensioniert werden. ${S('LD', 2)}</li>
<li>Energieversorger verrechnen Industriekunden die Blindleistung bzw. Blindarbeit extra. ${S('WS', 53)}</li>
</ul>
${box('merke', 'Merke · Blindleistung', `<p>Blindleistung <b>pendelt</b> zwischen Netz und Verbraucher, wird nicht verbraucht, <b>belastet aber das Netz</b> mit zusätzlichem Strom. ${S('WS', 13)}</p>`)}
<h3>Wie funktioniert Kompensation?</h3>
<p>Die meisten Verbraucher in Industrie und Gewerbe (Motoren, Transformatoren, Drosseln) sind <b>induktiv</b>. Man schaltet einen <b>Kondensator parallel</b> zum Verbraucher. Der Kondensator braucht kapazitive Blindleistung, die genau gegenläufig ist. Die Energie pendelt dann nur noch zwischen Spule und Kondensator, nicht mehr über das ganze Netz. ${S('WS', 53)}</p>
<div class="split"><div>
${eq('Q<sub>neu</sub> = Q<sub>L</sub> − Q<sub>C</sub>')}
<p>Ist Q<sub>C</sub> = Q<sub>L</sub>, verhält sich die Schaltung wie ein <b>reiner Wirkwiderstand</b>: Q = 0, S = P, cos φ = 1. ${S('WS', 53)}</p>
<p><b>Parallel</b> und nicht in Reihe, damit am Verbraucher weiterhin die volle Netzspannung anliegt. ${S('WS', 53)}</p>
</div><figure>${SVG_KOMP}<figcaption>Q<sub>C</sub> zieht Q<sub>L</sub> nach unten, S wird kürzer, P bleibt.</figcaption></figure></div>
${box('merke', 'Merke · Kompensation', `<p><b>Kondensator parallel zum induktiven Verbraucher.</b> Danach: <b>Q ↓, S ↓, I ↓, cos φ ↑ (Richtung 1), P bleibt gleich.</b></p>`)}
<div class="box bsp"><span class="lbl">Beispiel</span>
<p>Motor: P = 4 kW, Q<sub>L</sub> = 3 kvar, U = 230 V.</p>
${eq('vorher: S = √(4² + 3²) = 5 kVA &nbsp; cos φ = 0,8 &nbsp; I = 5000 VA / 230 V = 21,74 A')}
<p>Kondensator mit Q<sub>C</sub> = 2 kvar parallel:</p>
${eq('nachher: Q = 3 − 2 = 1 kvar &nbsp; S = √(4² + 1²) = 4,12 kVA &nbsp; cos φ = 4 / 4,12 = 0,97 &nbsp; I = 17,93 A')}
<p>Der Motor leistet dasselbe (4 kW), aber das Netz muss <b>18 % weniger Strom</b> liefern.</p></div>
${box('falle', 'Falle · Überkompensation', `<p>Nimmt man einen zu großen Kondensator (Q<sub>C</sub> &gt; Q<sub>L</sub>), wird die Schaltung <b>kapazitiv</b>, und cos φ sinkt wieder. Ziel ist cos φ knapp unter 1.</p>`)}
<h3>Was bedeutet das für das Stromnetz?</h3>
<p>Ein Leistungsfaktor nahe 1 heißt: Das Netz transportiert fast nur Energie, die auch genutzt wird. Weniger Strom bedeutet geringere Verluste, weniger Erwärmung der Leitungen, stabilere Spannung, und es passen mehr Verbraucher auf dieselbe Leitung. ${S('LD', 3)}</p>
`,
mini: [
  { q: 'Was wird zur Kompensation einer induktiven Last verwendet?', o: ['Spule in Reihe', 'Kondensator parallel', 'Widerstand parallel', 'Gleichrichter'], a: 1, why: 'Ein Kondensator parallel liefert die gegenläufige kapazitive Blindleistung.', src: ['WS', 53] },
  { q: 'Was bleibt bei der Kompensation gleich?', o: ['S', 'Q', 'I', 'P'], a: 3, why: 'Die Wirkleistung des Verbrauchers ändert sich nicht, nur Q, S und I sinken.', src: ['WS', 53] }
] },

/* ─────────────── 9 ─────────────── */
{ id: 'm9', part: 'Teil D · Anwendung', title: 'Wirkungsgrad η & elektrische Energie',
html: `
${box('faden', 'Roter Faden', `<p>Kein Gerät gibt die ganze zugeführte Leistung als Nutzen ab. Ein Teil wird immer zu Wärme. Das beschreibt der <b>Wirkungsgrad</b>. Und wenn eine Leistung eine Zeit lang wirkt, wird daraus <b>Energie</b>, z. B. in einer Batterie (Kap. 10).</p>`)}
<h3>Wirkungsgrad</h3>
${box('merke', 'Merke · Wirkungsgrad', `${eq('η = Nutzen / Aufwand = P<sub>ab</sub> / P<sub>zu</sub> &nbsp;&nbsp; η in % = η · 100')}${eq('P<sub>zu</sub> = P<sub>ab</sub> / η &nbsp;&nbsp; P<sub>ab</sub> = P<sub>zu</sub> · η &nbsp;&nbsp; P<sub>Verlust</sub> = P<sub>zu</sub> − P<sub>ab</sub>')}<p>η ist immer <b>kleiner als 1</b> (unter 100 %). ${S('LD', 5)}</p>`)}
<p>η = 0,7 bedeutet: 70 % der zugeführten Leistung werden genutzt, 30 % gehen als Verluste verloren (Wärme in den Kupferwicklungen I²·R, im Eisen, durch Reibung). Zähler und Nenner müssen <b>dieselbe Einheit</b> haben. ${S('LD', 5)}</p>
${box('falle', 'Falle · P_zu teilen, nicht multiplizieren', `<p>Die <b>zugeführte</b> Leistung ist <b>immer größer</b> als die abgegebene. Darum <b>P<sub>zu</sub> = P<sub>ab</sub> / η</b>. In deiner Mitschrift wurde bei einer Aufgabe P<sub>ab</sub> · η gerechnet, das gibt einen zu kleinen Wert. Probe: P<sub>zu</sub> muss größer als P<sub>ab</sub> sein! ${S('MS', 'Aufgaben Leistung')}</p>`)}
<div class="box bsp"><span class="lbl">Mitschrift: Motor P<sub>ab</sub> = 1,5 kW, η = 65 %, cos φ = 0,7, U = 230 V</span>
<ol class="steps">
<li>Zugeführte Wirkleistung: ${eq('P<sub>zu</sub> = 1,5 kW / 0,65 = <span class="r">2,31 kW</span>')}</li>
<li>Scheinleistung (das Netz liefert P<sub>zu</sub>): ${eq('S = P<sub>zu</sub> / cos φ = 2307,7 W / 0,7 = <span class="r">3296,7 VA ≈ 3,3 kVA</span>')}</li>
<li>Strom: ${eq('I = S / U = 3296,7 VA / 230 V = <span class="r">14,33 A</span>')}</li>
</ol>
<p>Merke die Reihenfolge: <b>P<sub>ab</sub> → (η) → P<sub>zu</sub> → (cos φ) → S → (U) → I</b>. ${S('MS', 'Aufgaben Leistung')}</p></div>
${box('falle', 'Falle · Welches P im Leistungsdreieck?', `<p>Das Leistungsdreieck gilt für die Leistung, die das Gerät <b>aus dem Netz</b> zieht, also für <b>P<sub>zu</sub></b>, nicht für die mechanische P<sub>ab</sub>. Rechne S, Q und cos φ immer mit P<sub>zu</sub>.</p>`)}

<h3>Elektrische Energie (Arbeit)</h3>
${box('merke', 'Merke · Energie', `${eq('W = P · t &nbsp;&nbsp; t = W / P &nbsp;&nbsp; P = W / t')}${eq('1 Ws = 1 J &nbsp;&nbsp; 1 Wh = 3600 Ws &nbsp;&nbsp; 1 kWh = 3,6 MJ')}<p>Leistung in kW mal Zeit in h ergibt direkt kWh. ${S('LD', 6)}</p>`)}
<div class="box bsp"><span class="lbl">Beispiele</span>
${eq('Heizofen 1800 W, 4 h: W = 1,8 kW · 4 h = <span class="r">7,2 kWh</span>')}
<p>${S('LD', 6)}</p>
${eq('Rechenzentrum 258 MW, Energiespeicher 1240 MWh: t = 1240 MWh / 258 MW = <span class="r">4,81 h</span>')}
<p>${S('MS', 'Aufgaben Leistung')}</p></div>
`,
mini: [
  { q: 'Ein Netzteil nimmt 200 W auf und gibt 170 W ab. η = ?', o: ['1,18', '85 %', '30 W', '15 %'], a: 1, why: 'η = 170/200 = 0,85 = 85 %. Die 30 W sind die Verluste.', src: ['LD', 5] },
  { q: 'P_ab = 900 W, η = 90 %. Wie groß ist P_zu?', o: ['810 W', '990 W', '1000 W', '900 W'], a: 2, why: 'P_zu = 900/0,9 = 1000 W. Nicht mal η!', src: ['LD', 5] }
] },

/* ─────────────── 10 ─────────────── */
{ id: 'm10', part: 'Teil D · Anwendung', title: 'USV: Scheinleistung, Batterie & Betriebsdauer',
html: `
${box('faden', 'Roter Faden', `<p>Die USV ist die Prüfungsaufgabe, in der alles vorkommt: <b>Leistungsfaktor</b> (Kap. 7) für die Scheinleistung, <b>Energie</b> (Kap. 9) für die Batterie und der <b>Wirkungsgrad</b>. Wenn du diese Aufgabe kannst, kannst du den Stoff.</p>`)}
<p><b>USV</b> = Unterbrechungsfreie Stromversorgung. Sie hält Server und Netzwerkgeräte bei einem Stromausfall am Laufen, bis sie sauber herunterfahren oder ein Generator anspringt. ${S('MS', 'USV')}</p>
<figure>${SVG_USV}<figcaption>Prinzip: Der Gleichrichter lädt die Batterie, der Wechselrichter macht daraus wieder 230 V Wechselspannung.</figcaption></figure>
<h3>Die Rechnung in 5 Schritten</h3>
<ol class="steps">
<li><b>Scheinleistung jedes Geräts:</b> S = P / cos φ</li>
<li><b>Gesamt-Scheinleistung:</b> S<sub>ges</sub> = S₁ + S₂ + … (so rechnet ihr im Unterricht)</li>
<li><b>Passt die USV?</b> S<sub>ges</sub> ≤ Nennleistung der USV (in VA). Auslastung = S<sub>ges</sub> / S<sub>USV</sub> · 100 %</li>
<li><b>Batterieenergie:</b> E = Anzahl · U · Kapazität (V · Ah = Wh)</li>
<li><b>Betriebsdauer:</b> t = E / S<sub>ges</sub> in h, mal 60 → Minuten</li>
</ol>
<p>${S('MS', 'USV')}</p>
${box('merke', 'Merke · USV', `${eq('S = P / cos φ &nbsp;&nbsp; E = n · U · Ah (in Wh) &nbsp;&nbsp; t = E / S')}<p>Die USV wird in <b>VA</b> ausgelegt. Batterie: <b>Volt mal Amperestunden = Wattstunden</b>.</p>`)}
<div class="box bsp"><span class="lbl">Mitschrift: Server und NAS an einer 1000-VA-USV</span>
<p>Server 400 W, cos φ = 0,95. NAS 65 W, cos φ = 0,65. Batterie: 3 Akkus à 12,8 V / 7,2 Ah.</p>
<ol class="steps">
<li>${eq('S<sub>Server</sub> = 400 W / 0,95 = 421,05 VA &nbsp;&nbsp; S<sub>NAS</sub> = 65 W / 0,65 = 100 VA')}</li>
<li>${eq('S<sub>ges</sub> = 421,05 + 100 = <span class="r">521,05 VA</span>')}</li>
<li>${eq('521,05 VA ≤ 1000 VA ✓ &nbsp; Auslastung 52 %')}</li>
<li>${eq('E = 3 · 12,8 V · 7,2 Ah = <span class="r">276,48 Wh</span>')}</li>
<li>${eq('t = 276,48 Wh / 521,05 VA = 0,5306 h · 60 = <span class="r">31,8 min</span>')}</li>
</ol></div>
${box('tipp', 'Tipp · Halbe Last, doppelte Zeit', `<p>t = E / S: Die Zeit ist umgekehrt proportional zur Last. Nur 75 % der Last → t = 0,5306 h / 0,75 = 42,45 min. 55 % → 57,9 min. ${S('MS', 'USV')}</p>`)}
${box('falle', 'Falle · Stunden in Minuten', `<p>0,21 h sind <b>nicht</b> 21 min! 0,21 h · 60 = <b>12,6 min</b>. Stunden mit Komma immer mal 60 nehmen. (In der Mitschrift steht bei einer Aufgabe „0,21 h ≈ 21 min“, das ist falsch.) ${S('MS', 'USV')}</p>`)}
<div class="box bsp"><span class="lbl">Mitschrift: Überlastete USV</span>
<p>Gerät 1: 750 W, cos φ = 0,91. Gerät 2: 125 W, cos φ = 0,65. USV 750 VA, 2 Akkus à 12,8 V / 7,2 Ah.</p>
${eq('S = 750/0,91 + 125/0,65 = 824,18 + 192,31 = <span class="r">1016,48 VA</span> &gt; 750 VA → <b>USV überlastet!</b>')}
${eq('E = 2 · 12,8 · 7,2 = 184,32 Wh &nbsp;&nbsp; t = 184,32 / 1016,48 = 0,181 h = <span class="r">10,9 min</span>')}
<p>Mit der Wirkleistung (875 W) gerechnet wären es 184,32 / 875 = 0,21 h = 12,6 min. ${S('MS', 'USV')}</p></div>
<h3>Warum Scheinleistung?</h3>
<p>Die Bauteile der USV (Wechselrichter, Leitungen) müssen den <b>ganzen Strom</b> liefern, I = S / U, also auch den Blindanteil. Würde man nur nach Watt auslegen, wäre die USV bei Geräten mit schlechtem cos φ überlastet. Darum steht auf jeder USV die Nennleistung in <b>VA</b> (oft zusätzlich in W). ${S('LD', 2)} ${S('MS', 'USV')}</p>
<h3>Warum ist der Wirkungsgrad wichtig?</h3>
<ul>
<li>Der Wechselrichter hat Verluste: Von der Batterieenergie kommt nur der Anteil η bei den Geräten an. Genauer gilt <b>t = E · η / P</b>, die Laufzeit wird also kürzer.</li>
<li>Eine Online-USV läuft <b>24/7</b>. Jeder Prozent Verlust kostet dauerhaft Strom und erzeugt <b>Wärme</b>, die im Serverraum wieder weggekühlt werden muss.</li>
</ul>
<div class="box bsp"><span class="lbl">Kleine Rechnung</span>
${eq('USV 230 V, 20 VA: I = S / U = 20 / 230 = 0,087 A &nbsp; Z = U / I = 2645 Ω')}
<p>${S('MS', 'USV')}</p></div>
`,
mini: [
  { q: 'Akku 12 V, 9 Ah. Wie viel Energie speichert er?', o: ['21 Wh', '108 Wh', '0,75 Wh', '108 Ah'], a: 1, why: 'E = U · Ah = 12 · 9 = 108 Wh.', src: ['MS', 'USV'] },
  { q: 'Ein Gerät hat 300 W bei cos φ = 0,6. Welche Scheinleistung muss die USV liefern?', o: ['180 VA', '300 VA', '500 VA', '360 VA'], a: 2, why: 'S = P / cos φ = 300/0,6 = 500 VA.', src: ['MS', 'USV'] },
  { q: '0,45 h sind …', o: ['45 min', '27 min', '4,5 min', '0,75 min'], a: 1, why: '0,45 · 60 = 27 min.', src: ['MS', 'USV'] }
] },

/* ─────────────── 11 ─────────────── */
{ id: 'm11', part: 'Teil E · Schularbeit', title: 'Theoriefragen mit Musterantworten',
get html() { return `
${box('faden', 'Roter Faden', `<p>Das sind alle Theoriefragen von der Liste zur Schularbeit. Lies die Frage, antworte zuerst <b>laut oder schriftlich selbst</b>, dann klapp die Musterantwort auf. Die Antworten sind so kurz, dass du sie in der Schularbeit hinschreiben kannst. ${S('TF', 'Liste')}</p>`)}
${THEORY_HTML()}
`; },
mini: [] }
];

/* ═════════════ Theoriefragen (auch für die Übung „Theorie“) ═════════════ */
function THEORY_HTML() {
  let out = '', last = '';
  THEORY.forEach(t => {
    if (t.g !== last) { out += `<h3>${t.g}</h3>`; last = t.g; }
    out += `<details class="qa"><summary>${t.q}</summary><div class="in">${t.a}</div></details>`;
  });
  return out;
}
var THEORY = [
{ g: 'Zahlensysteme & Darstellung', q: 'Was ist der Unterschied zwischen Binär-, Dezimal- und Hexadezimalsystem? Wo werden sie in der IT verwendet?',
  a: `<p>Sie unterscheiden sich in der <b>Basis</b>: Dezimal 10 (Ziffern 0–9), Binär 2 (0 und 1), Hex 16 (0–9 und A–F). Jede Stelle ist eine Potenz der Basis wert.</p><p><b>Binär:</b> intern im Computer (Speicher, CPU, Übertragung, Subnetzmasken). <b>Hex:</b> kompakte Schreibweise für Binär, 1 Ziffer = 4 Bit (MAC-Adressen, IPv6, Farbcodes, Speicheradressen). <b>Dezimal:</b> für Menschen (Ein- und Ausgabe).</p>` },
{ g: 'Zahlensysteme & Darstellung', q: 'Warum arbeiten Computer mit dem Binärsystem?',
  a: `<p>Weil elektronische Schaltungen (Transistoren) nur <b>zwei Zustände</b> sicher unterscheiden müssen: Spannung an = 1, aus = 0. Das ist einfach zu bauen, <b>störsicher</b> und lässt sich mit einfacher Logik (UND, ODER, NICHT) verarbeiten und speichern.</p>` },
{ g: 'Zahlensysteme & Darstellung', q: 'Was bedeutet es, eine Zahl in technischer oder wissenschaftlicher Notation darzustellen?',
  a: `<p>Man schreibt sie als <b>a · 10<sup>n</sup></b>. <b>Wissenschaftlich:</b> genau eine Ziffer vor dem Komma (1 ≤ a &lt; 10), z. B. 2,573 · 10⁸ Hz. <b>Technisch:</b> Exponent durch 3 teilbar, passend zu den Vorsilben k, M, G, m, µ, n, z. B. 257,3 · 10⁶ Hz = 257,3 MHz. So liest und vergleicht man sehr große und sehr kleine Zahlen ohne Nullen zu zählen.</p>` },
{ g: 'Ohmsches Gesetz & Leistung', q: 'Erkläre den Zusammenhang zwischen Spannung, Strom und Widerstand (Ohmsches Gesetz).',
  a: `<p><b>U = R · I</b>. Bei konstantem Widerstand ist der Strom proportional zur Spannung (doppelte Spannung → doppelter Strom). Bei konstanter Spannung gilt: größerer Widerstand → kleinerer Strom (I = U/R).</p>` },
{ g: 'Ohmsches Gesetz & Leistung', q: 'Was versteht man unter elektrischer Leistung? Wie wird sie berechnet?',
  a: `<p>Leistung ist die pro Zeit umgesetzte Energie, Einheit Watt. <b>P = U · I</b>, umgeformt auch P = I² · R und P = U²/R. Bei Wechselstrom: Wirkleistung <b>P = U · I · cos φ</b>.</p>` },
{ g: 'Ohmsches Gesetz & Leistung', q: 'Welche Leistung ist bei IT-Geräten hauptsächlich relevant und warum?',
  a: `<p>Für Verbrauch, Stromkosten und Kühlung die <b>Wirkleistung P (W)</b>, denn sie wird wirklich in Wärme umgesetzt. Für die Auslegung von Netzteilen, Leitungen, Sicherungen und <b>USVs</b> die <b>Scheinleistung S (VA)</b>, weil Schaltnetzteile einen cos φ unter 1 haben und den ganzen Strom I = S/U ziehen.</p>` },
{ g: 'Wechselspannung – Kenngrößen', q: 'Was ist der Unterschied zwischen Amplitude, Effektivwert und Peak-to-Peak-Spannung?',
  a: `<p><b>Amplitude Û</b>: höchster Wert ab der Nulllinie. <b>Peak-to-Peak U<sub>ss</sub></b>: vom tiefsten zum höchsten Punkt, U<sub>ss</sub> = 2 · Û. <b>Effektivwert U<sub>eff</sub></b>: Gleichspannung mit gleicher Wärmewirkung, U<sub>eff</sub> = Û/√2 ≈ 0,707 · Û. Netz: 230 V eff, 325 V Scheitel, 650 V Spitze-Spitze.</p>` },
{ g: 'Wechselspannung – Kenngrößen', q: 'Warum verwenden wir in der Praxis Effektivwerte statt Maximalwerte?',
  a: `<p>Weil man mit Effektivwerten <b>wie mit Gleichstrom rechnen</b> kann: P = U<sub>eff</sub> · I<sub>eff</sub> gibt direkt die Leistung bzw. Wärme. Messgeräte und Typenschilder zeigen Effektivwerte. Der Maximalwert ist nur für die Spannungsfestigkeit (Isolierung, Bauteile) wichtig.</p>` },
{ g: 'Wechselspannung – Kenngrößen', q: 'Was ist die Periodendauer und wie hängt sie mit der Frequenz zusammen?',
  a: `<p>Die Periodendauer <b>T</b> ist die Zeit für eine vollständige Schwingung. Die Frequenz f ist die Anzahl der Schwingungen pro Sekunde. Sie sind Kehrwerte: <b>f = 1/T</b>, <b>T = 1/f</b>. 50 Hz → T = 20 ms.</p>` },
{ g: 'Blindwiderstand, Blindleistung, Kompensation', q: 'Was versteht man unter Blindleistung? Wie unterscheidet sie sich von Wirkleistung?',
  a: `<p><b>Blindleistung Q (var)</b> entsteht durch Kondensatoren und Spulen: Energie wird kurz im Feld gespeichert und wieder ans Netz zurückgegeben, sie pendelt hin und her und <b>verrichtet keine Arbeit</b>. <b>Wirkleistung P (W)</b> wird wirklich in Wärme, Licht oder Bewegung umgewandelt.</p>` },
{ g: 'Blindwiderstand, Blindleistung, Kompensation', q: 'Was ist der Blindwiderstand eines Kondensators bzw. einer Spule? Wie verändert er sich mit der Frequenz?',
  a: `<p>Der Widerstand, den C bzw. L dem Wechselstrom entgegensetzen, ohne Energie zu verbrauchen. <b>X<sub>C</sub> = 1/(2π f C)</b>: sinkt mit steigender Frequenz (bei Gleichstrom unendlich). <b>X<sub>L</sub> = 2π f L</b>: steigt mit der Frequenz (bei Gleichstrom 0). Beim Kondensator eilt der Strom 90° vor, bei der Spule 90° nach.</p>` },
{ g: 'Blindwiderstand, Blindleistung, Kompensation', q: 'Warum ist Blindleistung in elektrischen Netzen unerwünscht?',
  a: `<p>Sie erhöht den <b>Strom</b> in den Leitungen ohne Nutzen. Folgen: mehr Leitungsverluste (I²·R), größerer Spannungsabfall, Leitungen, Transformatoren und Generatoren müssen größer ausgelegt werden. Industriebetriebe müssen Blindleistung bezahlen.</p>` },
{ g: 'Blindwiderstand, Blindleistung, Kompensation', q: 'Was bedeutet Blindleistungskompensation und wie funktioniert sie technisch?',
  a: `<p>Man gleicht die (meist induktive) Blindleistung eines Verbrauchers durch gegenläufige Blindleistung aus: <b>Kondensatoren werden parallel</b> zum induktiven Verbraucher geschaltet. Die Blindenergie pendelt dann nur noch zwischen Spule und Kondensator statt über das Netz. Bei voller Kompensation wirkt die Schaltung wie ein reiner Wirkwiderstand.</p>` },
{ g: 'Blindwiderstand, Blindleistung, Kompensation', q: 'Wie verändert sich der Leistungsfaktor durch Kompensation und was bedeutet das für das Stromnetz?',
  a: `<p>Der Leistungsfaktor <b>steigt Richtung 1</b>. Q, S und der Strom I werden kleiner, P bleibt gleich. Fürs Netz: weniger Verluste und Erwärmung, stabilere Spannung, Leitungen und Trafos werden entlastet.</p>` },
{ g: 'Leistungsdreieck', q: 'Welche Leistungen treten im Leistungsdreieck auf und wie hängen sie zusammen?',
  a: `<p>Wirkleistung <b>P</b> (W, waagrecht), Blindleistung <b>Q</b> (var, senkrecht), Scheinleistung <b>S</b> (VA, Hypotenuse). Pythagoras: <b>S² = P² + Q²</b>. Mit dem Winkel φ: P = S · cos φ, Q = S · sin φ.</p>` },
{ g: 'Leistungsdreieck', q: 'Was sagt der Leistungsfaktor aus? Warum ist ein hoher Leistungsfaktor wünschenswert?',
  a: `<p><b>cos φ = P/S</b> gibt an, welcher Anteil der Scheinleistung als Wirkleistung genutzt wird (0 bis 1). Ein hoher Wert (nahe 1) bedeutet wenig Blindleistung, also <b>weniger Strom für dieselbe Leistung</b>, kleinere Verluste und kleinere, billigere Anlagen.</p>` },
{ g: 'Leistungsdreieck', q: 'Wie kann man aus zwei der drei Leistungen (P, Q, S) die dritte berechnen?',
  a: `<p>Mit Pythagoras: <b>S = √(P² + Q²)</b>, <b>P = √(S² − Q²)</b>, <b>Q = √(S² − P²)</b>. Danach den Leistungsfaktor: cos φ = P/S.</p>` },
{ g: 'USV & Speicheranwendungen', q: 'Welche Größen spielen bei der Berechnung der USV-Betriebsdauer eine Rolle?',
  a: `<p>Die <b>Last</b> (Wirkleistung P und cos φ der Geräte bzw. Scheinleistung S), die <b>Batterieenergie</b> (Anzahl, Spannung, Kapazität in Ah) und der <b>Wirkungsgrad</b> des Wechselrichters. t = E / S (bzw. genauer t = E · η / P).</p>` },
{ g: 'USV & Speicheranwendungen', q: 'Wie berechnet man die Energie, die eine Batterie liefern kann?',
  a: `<p><b>E = U · Q</b>: Spannung (V) mal Kapazität (Ah) ergibt Wattstunden (Wh). Bei mehreren Akkus mal Anzahl: 3 · 12,8 V · 7,2 Ah = 276,48 Wh.</p>` },
{ g: 'USV & Speicheranwendungen', q: 'Warum ist bei USV-Systemen der Wirkungsgrad wichtig?',
  a: `<p>Verluste im Gleich- und Wechselrichter <b>verkürzen die Laufzeit</b> (nur E · η kommt bei den Geräten an), und weil die USV dauernd läuft, verursachen sie <b>laufende Stromkosten und Wärme</b>, die zusätzlich gekühlt werden muss.</p>` },
{ g: 'USV & Speicheranwendungen', q: 'Was versteht man unter Scheinleistung und warum ist sie bei USV-Berechnungen relevant?',
  a: `<p>Die Scheinleistung <b>S = U · I</b> (VA) ist die geometrische Summe aus Wirk- und Blindleistung, also die Leistung, die die Quelle insgesamt bereitstellen muss. Die USV muss den <b>ganzen Strom</b> liefern, auch den Blindanteil. Darum wird sie in VA ausgelegt, und man rechnet S = P / cos φ für jedes Gerät.</p>` }
];

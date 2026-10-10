/* All the artwork for the game, drawn in code as SVG.
   Every creature is built from the same handful of shapes so they all feel like one family:
   chunky outlines, big shiny eyes and rosy cheeks. */
(function () {
  const OL = '#3d2c46';
  let uid = 0;

  const s = (fill, w = 4) => `fill="${fill}" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const ln = (w = 4, c = OL) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const mir = g => g + `<g transform="matrix(-1 0 0 1 200 0)">${g}</g>`;
  const rot = (a, x, y) => `transform="rotate(${a} ${x} ${y})"`;
  const shadow = (rx = 54, y = 190) => `<ellipse cx="100" cy="${y}" rx="${rx}" ry="7" fill="${OL}" opacity=".13"/>`;
  const f1 = n => n.toFixed(1);

  // A filled shape with markings clipped inside it and a clean outline on top.
  function blob(shape, fill, marks = '', w = 4) {
    const id = 'k' + (++uid);
    return `<clipPath id="${id}">${shape}</clipPath>` +
      shape.replace('/>', ` fill="${fill}"/>`) +
      (marks ? `<g clip-path="url(#${id})">${marks}</g>` : '') +
      shape.replace('/>', ` fill="none" stroke="${OL}" stroke-width="${w}" stroke-linejoin="round"/>`);
  }

  // An outlined tube, for necks, trunks, tails and tentacles.
  const tube = (d, c, w = 16) => `<path d="${d}" ${ln(w + 8)}/><path d="${d}" ${ln(w, c)}/>`;

  function eyes(y = 86, gap = 22, r = 9.5, cx = 100, ring) {
    const one = x => (ring ? `<circle cx="${x}" cy="${y}" r="${r + 3.5}" fill="${ring}"/>` : '') +
      `<ellipse cx="${x}" cy="${y}" rx="${r * .82}" ry="${r}" fill="${OL}"/>` +
      `<circle cx="${f1(x + r * .3)}" cy="${f1(y - r * .38)}" r="${f1(r * .36)}" fill="#fff"/>` +
      `<circle cx="${f1(x - r * .3)}" cy="${f1(y + r * .42)}" r="${f1(r * .16)}" fill="#fff"/>`;
    return one(cx - gap) + one(cx + gap);
  }
  const sleepyEyes = (y = 86, gap = 22, w = 9, cx = 100, c = OL) =>
    [cx - gap, cx + gap].map(x => `<path d="M${x - w} ${y} Q${x} ${y + 8} ${x + w} ${y}" ${ln(4.5, c)}/>`).join('');
  const cheeks = (y = 102, gap = 38, c = '#ff7f9f', cx = 100, rx = 9) =>
    [cx - gap, cx + gap].map(x => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f1(rx * .62)}" fill="${c}" opacity=".55"/>`).join('');
  const wMouth = (y = 104, w = 7, cx = 100) =>
    `<path d="M${cx - w} ${y} Q${cx - w / 2} ${y + 6} ${cx} ${y} Q${cx + w / 2} ${y + 6} ${cx + w} ${y}" ${ln(3.5)}/>`;
  const smile = (y = 104, w = 10, cx = 100, d = 9) => `<path d="M${cx - w} ${y} Q${cx} ${y + d} ${cx + w} ${y}" ${ln(3.5)}/>`;
  const nose = (y = 98, c = OL, rx = 6, ry = 4.5, cx = 100) =>
    `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><ellipse cx="${f1(cx - rx * .3)}" cy="${f1(y - ry * .35)}" rx="${f1(rx * .35)}" ry="${f1(ry * .3)}" fill="#fff" opacity=".7"/>`;
  const whiskers = (y = 102, x = 64) => mir(`<path d="M${x} ${y} L${x - 20} ${y - 5} M${x} ${y + 6} L${x - 20} ${y + 9}" ${ln(2.5)}/>`);
  const sparkle = (x, y, r, c = '#ffd84d') =>
    `<path d="M${x} ${y - r} Q${f1(x + r * .18)} ${f1(y - r * .18)} ${x + r} ${y} Q${f1(x + r * .18)} ${f1(y + r * .18)} ${x} ${y + r} Q${f1(x - r * .18)} ${f1(y + r * .18)} ${x - r} ${y} Q${f1(x - r * .18)} ${f1(y - r * .18)} ${x} ${y - r} Z" fill="${c}" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>`;
  function star(x, y, r, c = '#ffd84d', w = 2.5) {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .48 : r;
      p.push(f1(x + rr * Math.cos(a)) + ',' + f1(y + rr * Math.sin(a)));
    }
    return `<polygon points="${p.join(' ')}" ${s(c, w)}/>`;
  }
  // A ring of bumps, for wool, manes and clouds.
  function cloud(cx, cy, rx, ry, n, r, fill, w = 4) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = 2 * Math.PI * i / n;
      out += `<circle cx="${f1(cx + rx * Math.cos(a))}" cy="${f1(cy + ry * Math.sin(a))}" r="${r}" ${s(fill, w)}/>`;
    }
    return out + `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
  }
  // Points round an arc, alternating between two radii (spines, fur, flames).
  function zigzag(cx, cy, rx1, ry1, rx2, ry2, a0, a1, n) {
    const pts = [];
    for (let i = 0; i <= n * 2; i++) {
      const a = (a0 + (a1 - a0) * i / (n * 2)) * Math.PI / 180;
      const rx = i % 2 ? rx1 : rx2, ry = i % 2 ? ry1 : ry2;
      pts.push(f1(cx + rx * Math.cos(a)) + ',' + f1(cy + ry * Math.sin(a)));
    }
    return pts.join(' ');
  }

  const head = (c, marks = '', rx = 54, ry = 48, cy = 84, cx = 100) => blob(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`, c, marks);

  // The chubby sitting body most of the animals share.
  function body(c, o = {}) {
    const { y = 146, rx = 44, ry = 38, belly, feet = c, arms = c, marks = '', over = '', noArms } = o;
    return blob(`<ellipse cx="100" cy="${y}" rx="${rx}" ry="${ry}"/>`, c,
      marks + (belly ? `<ellipse cx="100" cy="${f1(y + ry * .38)}" rx="${f1(rx * .62)}" ry="${f1(ry * .78)}" fill="${belly}"/>` : '') + over) +
      mir(`<ellipse cx="${f1(100 - rx * .52)}" cy="${y + ry - 3}" rx="15" ry="10" ${s(feet)}/>`) +
      (noArms ? '' : mir(`<ellipse cx="${f1(100 - rx * .5)}" cy="${y - 2}" rx="11" ry="15" ${s(arms)} ${rot(-18, f1(100 - rx * .5), y - 2)}/>`));
  }

  const EAR = {
    round: (c, i, x = 58, y = 44, r = 18, ir = .5) => `<circle cx="${x}" cy="${y}" r="${r}" ${s(c)}/>` +
      (i ? `<circle cx="${x + 1}" cy="${y + 1}" r="${f1(r * ir)}" fill="${i}"/>` : ''),
    pointy: (c, i) => `<path d="M52 66 Q46 32 56 10 Q78 20 94 42 Z" ${s(c)}/>` +
      (i ? `<path d="M60 54 Q57 36 61 24 Q73 31 82 42 Z" fill="${i}"/>` : ''),
    long: (c, i) => `<ellipse cx="76" cy="32" rx="14" ry="31" ${s(c)} ${rot(-12, 76, 32)}/>` +
      `<ellipse cx="76" cy="35" rx="6.5" ry="21" fill="${i}" ${rot(-12, 76, 35)}/>`,
    big: (c, i) => `<path d="M58 74 Q22 46 20 8 Q62 10 90 50 Z" ${s(c)}/>` +
      `<path d="M58 62 Q34 42 32 20 Q60 22 78 50 Z" fill="${i}"/>`,
  };

  const EGG_SHAPE = `<path d="M100 30 C152 30 160 92 156 128 C152 170 128 184 100 184 C72 184 48 170 44 128 C40 92 48 30 100 30 Z"/>`;

  // ---------- Shared builders ----------

  function bunny(o) {
    const { c, b, p, back = '', front = '', tail = '#fff' } = o;
    return shadow() + `<circle cx="146" cy="174" r="13" ${s(tail)}/>` + body(c, { belly: b, feet: b }) + back +
      mir(EAR.long(c, p)) + head(c) + eyes(82) + cheeks(100, 40) +
      `<rect x="95" y="104" width="10" height="13" rx="2.5" ${s('#fff', 2.5)}/><path d="M100 108 V116" ${ln(2)}/>` +
      mir(`<ellipse cx="91" cy="103" rx="10" ry="8" fill="${b}"/>`) +
      nose(97, '#ff7d9c', 5.5, 4) + whiskers(104, 72) + front;
  }

  function foxy(o) {
    const { c, w, d, inner = w, tailTip = w, tail = true, back = '', headMarks = '', front = '', ear = EAR.pointy, headR = [54, 48, 84], eyeY = 82 } = o;
    return shadow() +
      (tail ? blob(`<path d="M126 172 Q192 176 184 116 Q180 90 160 80 Q170 124 132 146 Z"/>`, c, `<circle cx="172" cy="84" r="22" fill="${tailTip}"/>`) : '') +
      back + body(c, { belly: w, feet: d }) +
      mir(ear(c, inner)) +
      head(c, mir(`<ellipse cx="70" cy="${headR[2] + 34}" rx="36" ry="28" fill="${w}"/>`) + headMarks, ...headR) +
      eyes(eyeY) + cheeks(eyeY + 18, 40) + nose(eyeY + 20, OL, 7, 5) + wMouth(eyeY + 26, 6) + front;
  }

  function cavy(w, o, br, extra = '') {
    return shadow(60) +
      blob(`<ellipse cx="100" cy="148" rx="58" ry="38"/>`, w,
        `<ellipse cx="150" cy="140" rx="30" ry="40" fill="${o}"/><ellipse cx="52" cy="172" rx="30" ry="22" fill="${br}"/>`) +
      mir(`<ellipse cx="72" cy="184" rx="12" ry="7" ${s('#ffc2cc', 3.5)}/>`) +
      `<path d="M58 62 Q34 58 38 36 Q56 28 72 46 Z" ${s(br)}/>` + `<path d="M142 62 Q166 58 162 36 Q144 28 128 46 Z" ${s(o)}/>` +
      head(w, `<path d="M100 26 Q54 30 40 76 Q50 106 84 98 Q102 70 100 26 Z" fill="${br}"/><ellipse cx="148" cy="66" rx="30" ry="32" fill="${o}"/>`, 58, 48, 86) +
      eyes(86, 24) + cheeks(104, 42) + nose(101, '#ff9db2', 6, 4.5) + wMouth(107, 6) + extra;
  }

  function whaleBody(c, belly, extraMarks = '') {
    return blob(`<path d="M138 128 Q166 118 164 94 Q150 84 150 68 Q168 70 176 84 Q186 70 196 70 Q194 94 178 102 Q176 130 148 148 Z"/>`, c) +
      blob(`<ellipse cx="90" cy="124" rx="68" ry="50"/>`, c,
        `<ellipse cx="90" cy="170" rx="58" ry="32" fill="${belly}"/>` + extraMarks) +
      `<path d="M54 148 Q32 164 40 174 Q56 172 70 154 Z" ${s(c, 3.5)}/>`;
  }
  const waves = (y, c = '#9ed8ff') => `<path d="M-4 ${y} Q21 ${y - 10} 46 ${y} T96 ${y} T146 ${y} T196 ${y} T246 ${y} V204 H-4 Z" ${s(c, 3.5)}/>`;

  // ---------- The creatures ----------

  const C = {};

  C.rabbit = () => bunny({ c: '#d6ae86', b: '#fff6ea', p: '#ffaec0' });

  C.lop = () => {
    const c = '#f6ead9', p = '#b98458', b = '#fffaf2';
    return shadow() + `<circle cx="146" cy="174" r="13" ${s('#fff')}/>` +
      body(c, { belly: b, marks: `<circle cx="140" cy="128" r="26" fill="${p}"/>` }) +
      head(c, `<ellipse cx="130" cy="66" rx="28" ry="26" fill="${p}"/>`, 54, 48, 86) +
      eyes(84) + cheeks(102, 38) +
      `<rect x="95" y="106" width="10" height="12" rx="2.5" ${s('#fff', 2.5)}/><path d="M100 110 V117" ${ln(2)}/>` +
      mir(`<ellipse cx="91" cy="105" rx="10" ry="8" fill="${b}"/>`) + nose(99, '#ff7d9c', 5.5, 4) +
      mir(`<ellipse cx="50" cy="100" rx="16" ry="36" ${s(p)} ${rot(14, 50, 100)}/><ellipse cx="52" cy="104" rx="7" ry="25" fill="#e9a98a" ${rot(14, 52, 104)}/>`);
  };

  C.fox = () => foxy({ c: '#f27b2c', w: '#fff4e6', d: '#4a3540' });

  C.guineapig = () => cavy('#fffaf3', '#f0a24f', '#7a4b33');

  C.hedgehog = () => {
    const sp = '#8b5a3c', f = '#f4dcc0';
    return shadow(60) +
      `<polygon points="${zigzag(100, 118, 86, 86, 68, 68, 160, 380, 13)} 160,176 40,176" ${s(sp)}/>` +
      `<path d="M70 52 l6 12 M100 40 v12 M130 52 l-6 12 M48 82 l12 6 M152 82 l-12 6" ${ln(4, '#b07a55')}/>` +
      `<ellipse cx="100" cy="160" rx="36" ry="26" ${s(f)}/>` + mir(`<ellipse cx="78" cy="184" rx="13" ry="8" ${s('#e8b9a0')}/>`) +
      mir(EAR.round(f, '#e8b9a0', 62, 76, 11)) +
      head(f, '', 46, 40, 108) + eyes(102, 20, 8.5) + cheeks(118, 32) + nose(119, OL, 7, 5.5) + smile(127, 6, 100, 5);
  };

  C.badger = () => {
    const g = '#8f8b9c', k = '#3a3443', w = '#fbf8f3';
    return shadow() + body(g, { belly: '#b9b5c4', feet: k, arms: k }) +
      mir(EAR.round(k, w, 54, 52, 14, .55)) +
      head(w, mir(`<ellipse cx="78" cy="70" rx="15" ry="52" fill="${k}" ${rot(-16, 78, 70)}/>`)) +
      eyes(86, 21, 8.5, 100, '#fff') + cheeks(104, 42) + nose(110, k, 9, 6) + wMouth(117, 6);
  };

  C.owl = () => {
    const c = '#b67e52', f = '#fcefdc', w = '#8d5b3a', o = '#f6a634';
    return shadow(48) + mir(`<path d="M62 60 L52 18 L90 40 Z" ${s(c)}/>`) +
      mir(`<ellipse cx="88" cy="186" rx="9" ry="5" ${s(o, 3)}/>`) +
      blob(EGG_SHAPE, c, `<ellipse cx="100" cy="152" rx="36" ry="36" fill="${f}"/>` +
        `<path d="M86 140 l5 5 l5 -5 M104 140 l5 5 l5 -5 M95 156 l5 5 l5 -5 M80 158 l4 4 l4 -4 M112 158 l4 4 l4 -4" ${ln(2.5, '#d9b48f')}/>`) +
      mir(`<path d="M48 104 Q28 140 56 172 Q68 146 62 108 Z" ${s(w)}/>`) +
      mir(`<circle cx="76" cy="86" r="25" ${s(f, 3)}/>`) +
      eyes(86, 24, 12) + `<path d="M92 104 L108 104 L100 117 Z" ${s(o, 3)}/>` + cheeks(110, 44);
  };

  C.squirrel = () => {
    const c = '#d6642c', b = '#fff0dc';
    return shadow() +
      blob(`<path d="M124 172 C178 180 198 130 176 96 C162 74 166 50 186 50 C178 26 134 34 142 74 C146 104 152 130 118 150 Z"/>`, c,
        `<path d="M146 156 C172 146 182 116 166 92" ${ln(7, '#ec8a4f')}/>`) +
      body(c, { belly: b }) +
      mir(EAR.pointy(c, '#f2a07a')) + mir(`<path d="M56 12 L52 2 M57 12 L62 3" ${ln(4)}/>`) +
      `<ellipse cx="100" cy="160" rx="12" ry="14" ${s('#c08443', 3)}/><path d="M86 154 Q100 136 114 154 Z" ${s('#7a4e2c', 3)}/><path d="M100 142 v-6" ${ln(3)}/>` +
      head(c, mir(`<ellipse cx="74" cy="114" rx="30" ry="22" fill="${b}"/>`)) +
      eyes(82) + cheeks(100, 40) + nose(100, OL, 6, 4.5) + wMouth(106, 6);
  };

  C.duck = () => {
    const c = '#ffd84a', o = '#ff9f2e';
    return shadow(50) + mir(`<ellipse cx="82" cy="184" rx="14" ry="7" ${s(o)}/>`) +
      blob(`<ellipse cx="100" cy="146" rx="50" ry="38"/>`, c, `<ellipse cx="100" cy="168" rx="32" ry="22" fill="#fff0a8"/>`) +
      mir(`<path d="M52 128 Q32 146 50 168 Q68 160 66 136 Z" ${s('#ffc93a')}/>`) +
      `<path d="M100 42 C92 26 98 12 110 16 C102 20 104 30 112 38" ${s(c, 3.5)}/>` +
      head(c, '', 48, 46, 84) + eyes(80, 20) + cheeks(100, 36) +
      `<ellipse cx="100" cy="102" rx="19" ry="8.5" ${s(o, 3.5)}/><path d="M84 102 Q100 106 116 102" ${ln(2.5)}/>`;
  };

  C.frog = () => {
    const c = '#7fcf5c', b = '#e2f6b4';
    return shadow(58) + mir(`<ellipse cx="62" cy="184" rx="22" ry="8" ${s(c)}/>`) +
      blob(`<ellipse cx="100" cy="152" rx="46" ry="34"/>`, c, `<ellipse cx="100" cy="166" rx="30" ry="24" fill="${b}"/>`) +
      mir(`<ellipse cx="72" cy="160" rx="9" ry="13" ${s(c)} ${rot(-20, 72, 160)}/>`) +
      mir(`<circle cx="66" cy="62" r="22" ${s(c)}/>`) + head(c, '', 64, 40, 100) + mir(`<circle cx="66" cy="62" r="20" fill="${c}"/>`) +
      eyes(62, 34, 10) + `<path d="M64 106 Q100 130 136 106" ${ln(4)}/>` + cheeks(112, 50) +
      `<circle cx="90" cy="84" r="2.5" fill="${OL}"/><circle cx="110" cy="84" r="2.5" fill="${OL}"/>`;
  };

  C.mouse = () => {
    const c = '#bfb8cf', p = '#ffb3c4';
    return shadow() + `<path d="M136 172 Q176 186 178 160 Q180 138 192 132" ${ln(9)}/><path d="M136 172 Q176 186 178 160 Q180 138 192 132" ${ln(4, p)}/>` +
      body(c, { belly: '#e9e5f0', feet: p }) + mir(EAR.round(c, p, 52, 46, 27, .62)) +
      head(c, '', 50, 44, 90) + eyes(88, 20, 9) + cheeks(104, 36) + nose(102, p, 6.5, 5) + wMouth(108, 5) + whiskers(104, 70);
  };

  C.pig = () => {
    const c = '#ffb7c7', d = '#ff8fab';
    return shadow() + `<path d="M140 162 Q162 162 160 146 Q158 134 149 138 Q142 143 151 151" ${ln(9)}/><path d="M140 162 Q162 162 160 146 Q158 134 149 138 Q142 143 151 151" ${ln(4, c)}/>` +
      body(c, { belly: '#ffd3dd', feet: d }) +
      mir(`<path d="M58 58 L48 18 L90 40 Z" ${s(c)}/><path d="M61 50 L55 28 L80 41 Z" fill="${d}"/>`) +
      head(c) + eyes(78, 24) + cheeks(98, 42) +
      `<ellipse cx="100" cy="102" rx="20" ry="14" ${s(d, 3.5)}/><ellipse cx="93" cy="102" rx="3.5" ry="5.5" fill="${OL}"/><ellipse cx="107" cy="102" rx="3.5" ry="5.5" fill="${OL}"/>` +
      smile(121, 8, 100, 6);
  };

  C.lamb = () => {
    const wl = '#fffaf0', f = '#f4d6bd', k = '#5a4650';
    return shadow() + mir(`<rect x="68" y="164" width="15" height="26" rx="7" ${s(k)}/>`) +
      cloud(100, 146, 42, 26, 12, 17, wl) +
      mir(`<ellipse cx="54" cy="88" rx="20" ry="10" ${s(f)} ${rot(24, 54, 88)}/>`) +
      head(f, '', 40, 38, 92) + cloud(100, 56, 24, 10, 8, 12, wl) +
      eyes(92, 18, 8.5) + cheeks(108, 28) + nose(106, '#c98f8f', 5, 3.5) + wMouth(111, 5);
  };

  C.bee = () => {
    const y = '#ffd23f';
    return shadow(48) +
      mir(`<ellipse cx="54" cy="62" rx="22" ry="32" fill="#e6f6ff" stroke="${OL}" stroke-width="3.5" ${rot(-35, 54, 62)}/><path d="M50 48 Q56 62 54 76" ${ln(2.5, '#b8dff5')}/>`) +
      mir(`<path d="M86 60 Q80 36 68 24" ${ln(4)}/><circle cx="68" cy="24" r="7" fill="${OL}"/>`) +
      `<path d="M90 176 L100 196 L110 176 Z" ${s(OL, 3)}/>` +
      mir(`<ellipse cx="80" cy="182" rx="10" ry="6" ${s(OL, 3)}/>`) +
      blob(`<circle cx="100" cy="120" r="62"/>`, y,
        `<path d="M20 146 Q100 166 180 146" ${ln(15, OL)}/><path d="M20 176 Q100 196 180 176" ${ln(15, OL)}/>`) +
      mir(`<ellipse cx="44" cy="128" rx="9" ry="12" ${s(y)} ${rot(30, 44, 128)}/>`) +
      eyes(104, 22) + cheeks(120, 40) + smile(118, 9, 100, 8);
  };

  C.panda = () => {
    const w = '#fbfbfd', k = '#2f2a38';
    return shadow() + body(w, { feet: k, arms: k, marks: `<rect x="40" y="104" width="120" height="24" fill="${k}"/>` }) +
      `<path d="M128 178 L150 118" ${ln(14)}/><path d="M128 178 L150 118" ${ln(8, '#8ad46a')}/><path d="M150 118 Q164 104 172 108 Q162 120 150 118 Z" ${s('#6cc04a', 3)}/>` +
      mir(EAR.round(k, '', 56, 44, 18)) +
      head(w, mir(`<ellipse cx="76" cy="88" rx="15" ry="20" fill="${k}" ${rot(35, 76, 88)}/>`)) +
      eyes(88, 23, 7.5, 100, '#fff') + cheeks(106, 42) + nose(104, k, 7, 5) + wMouth(110, 6);
  };

  C.koala = () => {
    const c = '#a9adbb', i = '#f3f0f6';
    return shadow() + body(c, { belly: '#dcdde6' }) + mir(EAR.round(c, i, 48, 60, 28, .6)) +
      head(c, '', 52, 46, 86) + eyes(82, 30, 8.5) + cheeks(106, 40) +
      `<ellipse cx="100" cy="100" rx="13" ry="17" ${s('#4a4454', 3)}/><ellipse cx="96" cy="92" rx="4" ry="5" fill="#fff" opacity=".5"/>` +
      smile(122, 7, 100, 5);
  };

  C.kangaroo = () => {
    const c = '#d99a5c', b = '#f6d6ad';
    return shadow(62) + blob(`<path d="M66 170 Q30 186 8 180 Q22 162 70 146 Z"/>`, c) +
      body(c, { belly: b, y: 146 }) +
      `<circle cx="100" cy="150" r="13" ${s(c, 3.5)}/>` + mir(`<ellipse cx="90" cy="139" rx="4" ry="6" ${s(c, 3)}/>`) +
      `<circle cx="95" cy="149" r="2.2" fill="${OL}"/><circle cx="105" cy="149" r="2.2" fill="${OL}"/>` +
      `<path d="M72 156 Q100 188 128 156 Z" fill="${b}"/><path d="M72 156 Q100 188 128 156" ${ln(3.5)}/>` +
      mir(`<ellipse cx="72" cy="30" rx="11" ry="28" ${s(c)} ${rot(-14, 72, 30)}/><ellipse cx="72" cy="33" rx="5" ry="18" fill="#f2b49a" ${rot(-14, 72, 33)}/>`) +
      head(c, `<ellipse cx="100" cy="116" rx="30" ry="20" fill="${b}"/>`, 48, 46, 84) +
      eyes(80, 20) + cheeks(98, 36) + nose(102, OL, 7, 5) + wMouth(108, 5);
  };

  C.lion = () => {
    const c = '#f7bd4f', m = '#c9682c', b = '#fff1cf';
    return shadow() + `<path d="M140 170 Q176 172 176 140" ${ln(10)}/><path d="M140 170 Q176 172 176 140" ${ln(4, c)}/><circle cx="176" cy="134" r="10" ${s(m)}/>` +
      body(c, { belly: b }) + cloud(100, 84, 56, 50, 14, 22, m) +
      mir(EAR.round(c, '#f59b6b', 60, 48, 15)) +
      head(c, '', 46, 42, 90) + eyes(86, 20, 9) + cheeks(104, 34) +
      mir(`<ellipse cx="91" cy="110" rx="11" ry="9" fill="${b}"/>`) +
      `<path d="M92 99 L108 99 L100 107 Z" ${s('#8a4a3a', 3)}/>` + whiskers(110, 76);
  };

  C.elephant = () => {
    const c = '#a9bad6', p = '#f6bccb';
    return shadow() + body(c, { belly: '#c6d3e8' }) +
      mir(`<ellipse cx="44" cy="82" rx="32" ry="40" ${s(c)} ${rot(-12, 44, 82)}/><ellipse cx="47" cy="84" rx="20" ry="27" fill="${p}" ${rot(-12, 47, 84)}/>`) +
      head(c, '', 46, 44, 80) + eyes(74, 21, 9) + cheeks(94, 34) +
      tube('M100 92 Q96 128 110 144 Q122 154 134 140', c, 18) + `<circle cx="100" cy="92" r="9" fill="${c}"/>` +
      `<path d="M93 112 h12 M95 124 h12" ${ln(2.5)}/>`;
  };

  C.giraffe = () => {
    const c = '#f6c75e', sp = '#cf7a3a', m = '#f9e3b8', k = '#7a4b33';
    const spots = `<ellipse cx="80" cy="140" rx="9" ry="7" fill="${sp}"/><ellipse cx="104" cy="150" rx="10" ry="8" fill="${sp}"/><ellipse cx="130" cy="146" rx="9" ry="8" fill="${sp}"/><ellipse cx="88" cy="164" rx="8" ry="6" fill="${sp}"/><ellipse cx="120" cy="168" rx="9" ry="6" fill="${sp}"/><ellipse cx="144" cy="164" rx="6" ry="5" fill="${sp}"/>`;
    return shadow(58) +
      [70, 92, 118, 138].map(x => `<rect x="${x - 7}" y="160" width="14" height="28" rx="6" ${s(c)}/><rect x="${x - 7}" y="180" width="14" height="9" rx="4" fill="${k}"/>`).join('') +
      `<path d="M150 150 Q164 158 168 172" ${ln(4)}/><ellipse cx="168" cy="176" rx="5" ry="7" fill="${k}"/>` +
      `<path d="M116 70 C118 98 122 122 128 146" ${ln(10, '#c9682c')}/>` +
      blob(`<path d="M84 160 C84 124 86 98 88 70 L114 70 C114 98 118 124 124 152 Z"/>`, c,
        `<ellipse cx="96" cy="96" rx="7" ry="6" fill="${sp}"/><ellipse cx="110" cy="116" rx="7" ry="6" fill="${sp}"/><ellipse cx="94" cy="132" rx="7" ry="6" fill="${sp}"/>`) +
      blob(`<ellipse cx="108" cy="158" rx="48" ry="25"/>`, c, spots) +
      mir(`<path d="M90 28 L86 10" ${ln(6)}/><circle cx="86" cy="9" r="6" ${s(k, 3)}/>`) +
      mir(`<ellipse cx="62" cy="40" rx="15" ry="7" ${s(c)} ${rot(-20, 62, 40)}/>`) +
      head(c, `<ellipse cx="128" cy="34" rx="7" ry="6" fill="${sp}"/>`, 36, 30, 50) +
      `<ellipse cx="100" cy="68" rx="25" ry="14" ${s(m, 3.5)}/>` +
      `<ellipse cx="93" cy="64" rx="2.5" ry="3.5" fill="${OL}"/><ellipse cx="107" cy="64" rx="2.5" ry="3.5" fill="${OL}"/>` +
      eyes(44, 15, 7.5) + cheeks(58, 27, '#ff7f9f', 100, 7) + smile(72, 7, 100, 5);
  };

  C.zebra = () => {
    const w = '#fdfdfd', k = '#33293b', mz = '#6d6375';
    const bs = [62, 80, 120, 138].map(x => `<path d="M${x} 108 Q${x + (x < 100 ? -8 : 8)} 140 ${x} 176" ${ln(9, k)}/>`).join('');
    return shadow() + `<path d="M140 170 Q172 168 172 146" ${ln(8)}/><path d="M140 170 Q172 168 172 146" ${ln(3, w)}/><path d="M172 146 l-6 -12 l12 2 Z" ${s(k, 3)}/>` +
      body(w, { feet: k, marks: bs }) +
      `<path d="M72 44 L76 22 L88 36 L96 16 L104 34 L112 18 L118 38 L128 24 L130 46 Z" ${s(k)}/>` +
      mir(`<path d="M56 64 Q50 36 60 20 Q76 30 86 46 Z" ${s(w)}/><path d="M62 54 Q59 38 63 30 Q71 36 77 46 Z" fill="${k}"/>`) +
      head(w, `<path d="M70 40 L100 54 L130 40" ${ln(8, k)}/>` +
        mir(`<path d="M44 76 Q56 82 58 96 M48 104 Q58 104 62 114" ${ln(8, k)}/>`), 48, 46, 82) +
      eyes(80, 21, 9) +
      `<ellipse cx="100" cy="112" rx="30" ry="18" ${s(mz, 3.5)}/>` +
      `<ellipse cx="90" cy="106" rx="3" ry="4.5" fill="${OL}"/><ellipse cx="110" cy="106" rx="3" ry="4.5" fill="${OL}"/>` +
      smile(117, 9, 100, 6) + cheeks(98, 40);
  };

  C.hippo = () => {
    const c = '#a99ad0', m = '#c7bbe6';
    return shadow() + body(c, { belly: m }) + mir(EAR.round(c, '#f2b6c8', 64, 44, 11)) +
      head(c, '', 50, 40, 76) + eyes(68, 22, 8.5) +
      blob(`<ellipse cx="100" cy="110" rx="48" ry="26"/>`, m) +
      mir(`<ellipse cx="86" cy="101" rx="4" ry="6" fill="${OL}"/>`) + cheeks(114, 34) + smile(118, 14, 100, 8) +
      mir(`<rect x="84" y="120" width="8" height="8" rx="2" ${s('#fff', 2.5)}/>`);
  };

  C.monkey = () => {
    const c = '#9b6244', f = '#f3cba5';
    return shadow() + tube('M136 170 Q180 174 176 140 Q172 118 156 122 Q146 128 156 138', c, 9) +
      body(c, { belly: f }) +
      `<path d="M82 150 Q100 170 122 144 Q120 162 100 168 Q84 164 82 150 Z" ${s('#ffd94d', 3)}/>` +
      mir(EAR.round(c, f, 46, 84, 17, .6)) + head(c, '', 50, 46, 82) +
      `<path d="M100 72 C88 50 56 54 58 84 C58 100 68 106 72 110 Q100 134 128 110 C132 106 142 100 142 84 C144 54 112 50 100 72 Z" ${s(f, 3)}/>` +
      eyes(84, 18, 8.5) + cheeks(104, 30) +
      `<circle cx="96" cy="100" r="2.5" fill="${OL}"/><circle cx="104" cy="100" r="2.5" fill="${OL}"/>` + smile(110, 10, 100, 8);
  };

  C.tiger = () => {
    const c = '#f59a30', w = '#fff6e6', k = OL;
    return shadow() + tube('M138 172 Q178 176 178 140', c, 10) + `<path d="M162 172 l-2 -12 M174 160 l-10 -4 M178 146 l-10 0" ${ln(4, k)}/>` +
      body(c, { belly: w, marks: mir(`<path d="M56 122 Q66 128 62 140 M56 148 Q66 152 64 164" ${ln(6, k)}/>`) }) +
      mir(EAR.round(c, w, 58, 46, 16)) +
      head(c, mir(`<ellipse cx="80" cy="118" rx="26" ry="20" fill="${w}"/>`) +
        `<path d="M100 36 v14 M86 39 l4 11 M114 39 l-4 11" ${ln(6, k)}/>` +
        mir(`<path d="M44 76 h16 M46 92 h12" ${ln(6, k)}/>`)) +
      eyes(80, 22) + cheeks(98, 38) + nose(100, '#ff8fa0', 7, 5) + wMouth(106, 6) + whiskers(106, 70);
  };

  C.penguin = () => {
    const k = '#33395a', w = '#fffdf7', o = '#ffa733';
    return shadow(46) + mir(`<ellipse cx="84" cy="185" rx="14" ry="7" ${s(o)}/>`) +
      mir(`<path d="M50 108 Q26 136 38 160 Q56 150 58 120 Z" ${s(k)}/>`) +
      blob(EGG_SHAPE, k, `<ellipse cx="100" cy="148" rx="40" ry="42" fill="${w}"/><circle cx="80" cy="88" r="26" fill="${w}"/><circle cx="120" cy="88" r="26" fill="${w}"/><ellipse cx="100" cy="114" rx="38" ry="30" fill="${w}"/>`) +
      eyes(86, 20) + cheeks(102, 36) + `<path d="M90 100 Q100 94 110 100 L100 112 Z" ${s(o, 3)}/>`;
  };

  C.polarbear = () => {
    const c = '#f6f3ec', sc = '#5aa9e6';
    return shadow() + body(c, { belly: '#ffffff' }) + mir(EAR.round(c, '#e4dccf', 58, 46, 17)) +
      head(c) + `<ellipse cx="100" cy="106" rx="24" ry="17" ${s('#fff', 3)}/>` +
      eyes(82, 24) + cheeks(100, 42) + nose(99, OL, 9, 6) + wMouth(108, 5) +
      `<path d="M56 126 Q100 146 144 126 L146 138 Q100 160 54 138 Z" ${s(sc, 3.5)}/>` +
      `<path d="M116 144 L120 172 L134 170 L130 140 Z" ${s(sc, 3.5)}/><path d="M120 172 l1 6 M127 171 l1 6 M134 170 l1 6" ${ln(3, sc)}/>` +
      `<path d="M70 134 l4 6 M90 140 l2 6 M110 140 l-2 6" ${ln(2.5, '#9fd0f5')}/>`;
  };

  C.sloth = () => {
    const c = '#b8936d', f = '#f1dfc5', k = '#6b4a33';
    return `<rect x="6" y="16" width="188" height="14" rx="7" ${s('#9a6a45')}/>` +
      `<path d="M30 28 Q24 44 34 50 Q40 40 30 28 Z M160 28 Q170 42 162 50 Q154 40 160 28 Z" ${s('#7cc75a', 3)}/>` +
      shadow(44) +
      mir(tube('M68 132 Q56 80 68 26', c, 18) + `<path d="M62 18 q2 10 0 16 M70 16 q2 10 0 16 M78 18 q2 10 0 14" ${ln(3.5)}/>`) +
      body(c, { noArms: true, belly: '#d7bc98', y: 150 }) +
      head(c, `<ellipse cx="100" cy="100" rx="40" ry="32" fill="${f}"/>` + mir(`<ellipse cx="80" cy="94" rx="15" ry="9" fill="${k}" ${rot(18, 80, 94)}/>`), 50, 44, 92) +
      sleepyEyes(93, 20, 7, 100, f) + cheeks(110, 34) + nose(106, k, 7, 5) + smile(115, 10, 100, 8);
  };

  C.toucan = () => {
    const k = '#2d2a3c', w = '#fff6d2', b = '#5ec4ff';
    return shadow(46) + mir(`<ellipse cx="86" cy="186" rx="10" ry="5" ${s('#5ec4ff', 3)}/>`) +
      mir(`<path d="M48 104 Q28 140 56 172 Q68 146 62 108 Z" ${s('#1f1d2c')}/>`) +
      blob(EGG_SHAPE, k, `<ellipse cx="100" cy="124" rx="38" ry="28" fill="${w}"/><ellipse cx="100" cy="182" rx="34" ry="14" fill="#ff5a5a"/>`) +
      `<circle cx="80" cy="80" r="15" fill="${b}"/><circle cx="116" cy="80" r="15" fill="${b}"/>` + eyes(80, 18, 9, 98) +
      blob(`<path d="M86 94 Q100 84 118 92 Q160 96 176 120 Q152 128 112 118 Q90 112 86 94 Z"/>`, '#ff9a2e',
        `<path d="M84 96 Q130 92 176 112" ${ln(8, '#ffd23f')}/><ellipse cx="178" cy="120" rx="16" ry="20" fill="#ff5a3c"/>`) +
      cheeks(100, 32, '#ff7f9f', 98);
  };

  C.llama = () => {
    const c = '#f4e3c6';
    return shadow(56) + mir(`<rect x="66" y="160" width="14" height="28" rx="6" ${s(c)}/><rect x="66" y="180" width="14" height="9" rx="4" fill="#8a6a54"/>`) +
      blob(`<path d="M80 160 L82 80 Q100 72 118 80 L120 160 Z"/>`, c) +
      cloud(100, 158, 42, 16, 10, 14, c) +
      `<path d="M64 144 Q100 134 136 144 L132 170 Q100 178 68 170 Z" ${s('#ff7aa2', 3.5)}/>` +
      `<path d="M66 154 Q100 145 134 154" ${ln(5, '#ffcf4d')}/><path d="M67 162 Q100 154 133 162" ${ln(5, '#5ec4c9')}/>` +
      `<path d="M74 172 v8 M88 175 v8 M102 176 v8 M116 175 v8 M128 172 v8" ${ln(3.5, '#ff7aa2')}/>` +
      mir(`<path d="M78 42 Q60 22 66 4 Q84 12 90 36 Z" ${s(c)}/><path d="M79 34 Q68 22 70 12 Q80 18 84 32 Z" fill="#f2b49a"/>`) +
      head(c, '', 34, 30, 58) + cloud(100, 32, 14, 5, 6, 9, c) +
      `<ellipse cx="100" cy="74" rx="20" ry="13" ${s('#fbf1e0', 3)}/>` +
      `<path d="M94 70 l2 3 M106 70 l-2 3" ${ln(3)}/>` + smile(78, 6, 100, 5) +
      eyes(54, 15, 8) + cheeks(68, 27, '#ff7f9f', 100, 7);
  };

  C.turtle = () => {
    const sh = '#56a865', p = '#8fd19a', sk = '#a9dc8f';
    return shadow(62) +
      mir(`<ellipse cx="38" cy="112" rx="28" ry="12" ${s(sk)} ${rot(-30, 38, 112)}/><ellipse cx="52" cy="172" rx="20" ry="10" ${s(sk)} ${rot(20, 52, 172)}/>`) +
      head(sk, '', 32, 30, 56) + eyes(52, 13, 7.5) + cheeks(64, 22, '#ff7f9f', 100, 7) + smile(66, 7, 100, 5) +
      blob(`<ellipse cx="100" cy="130" rx="66" ry="50"/>`, sh,
        `<ellipse cx="100" cy="176" rx="70" ry="14" fill="${p}"/><ellipse cx="100" cy="124" rx="22" ry="18" fill="${p}"/>` +
        [[-48, -12], [48, -12], [-44, 22], [44, 22], [0, -40], [0, 38]].map(([dx, dy]) => `<ellipse cx="${100 + dx}" cy="${124 + dy}" rx="16" ry="12" fill="${p}"/>`).join(''));
  };

  C.octopus = () => {
    const c = '#f58cc4', d = '#ffc7e3';
    const arms = mir(tube('M64 126 Q38 150 30 168 Q24 184 38 182 Q46 178 40 170', c, 14) +
      tube('M78 136 Q66 164 64 178 Q64 192 78 188 Q84 182 76 176', c, 14) +
      tube('M94 140 Q92 168 96 182 Q100 192 108 186', c, 14));
    return shadow(60) + arms + mir(`<circle cx="36" cy="174" r="2.5" fill="${d}"/><circle cx="72" cy="182" r="2.5" fill="${d}"/>`) +
      blob(`<ellipse cx="100" cy="88" rx="58" ry="56"/>`, c,
        `<circle cx="70" cy="50" r="7" fill="${d}"/><circle cx="128" cy="44" r="5" fill="${d}"/><circle cx="140" cy="66" r="8" fill="${d}"/><circle cx="58" cy="76" r="4" fill="${d}"/>`) +
      eyes(94, 24, 10) + cheeks(112, 42) + smile(112, 9, 100, 8);
  };

  C.flamingo = () => {
    const p = '#ff9ec0', d = '#ff6f9f', lg = '#ff86ae';
    return `<ellipse cx="106" cy="190" rx="30" ry="6" fill="${OL}" opacity=".13"/>` +
      `<path d="M106 138 L106 188 M100 188 L114 188" ${ln(10)}/><path d="M106 138 L106 188 M100 188 L114 188" ${ln(5, lg)}/>` +
      `<path d="M116 140 L134 158 L112 164" ${ln(10)}/><path d="M116 140 L134 158 L112 164" ${ln(5, lg)}/>` +
      `<path d="M146 112 L170 102 L164 116 L174 122 L150 128 Z" ${s(d, 3.5)}/>` +
      blob(`<ellipse cx="114" cy="122" rx="44" ry="28" ${rot(-10, 114, 122)}/>`, p) +
      `<path d="M100 112 Q128 98 152 114 Q132 136 104 128 Z" ${s(d, 3.5)}/>` +
      tube('M82 118 Q58 98 72 76 Q88 56 78 40', p, 16) +
      `<circle cx="78" cy="38" r="23" ${s(p)}/>` +
      blob(`<path d="M94 32 Q116 30 118 48 Q118 62 106 68 Q108 52 94 46 Z"/>`, '#fff3f6', `<path d="M104 56 L126 50 L118 74 Z" fill="${OL}"/>`, 3.5) +
      eyes(34, 8, 6, 78) + cheeks(46, 14, '#ff5f8f', 78, 6);
  };

  C.otter = () => {
    const c = '#946145', f = '#ecd0b0';
    return shadow() + blob(`<path d="M70 170 Q30 182 14 168 Q38 156 72 148 Z"/>`, c) +
      body(c, { belly: f }) +
      `<path d="M84 162 L100 136 L116 162 Q100 170 84 162 Z" ${s('#ffb3c7', 3)}/><path d="M92 162 L100 142 M100 166 V140 M108 162 L100 142" ${ln(2, '#e07a9a')}/>` +
      mir(EAR.round(c, '#c48a6a', 56, 54, 11)) +
      head(c, `<ellipse cx="100" cy="112" rx="38" ry="26" fill="${f}"/>`, 52, 46, 86) +
      eyes(82, 22) + cheeks(102, 38) + nose(100, OL, 8, 6) + wMouth(108, 6) + whiskers(104, 68);
  };

  C.raccoon = () => {
    const g = '#9fa2b0', k = '#3a3443', w = '#f6f4f8';
    return shadow() +
      blob(`<path d="M126 172 Q192 176 184 116 Q180 90 160 80 Q170 124 132 146 Z"/>`, g,
        `<path d="M170 82 L188 88 M164 108 L190 108 M150 134 L186 132 M134 160 L176 168" ${ln(10, k)}/>`) +
      body(g, { belly: '#d3d5de', feet: k, arms: k }) +
      mir(EAR.pointy(g, w)) +
      head(g, `<ellipse cx="100" cy="118" rx="36" ry="22" fill="${w}"/>` +
        mir(`<ellipse cx="74" cy="62" rx="16" ry="7" fill="${w}" ${rot(-10, 74, 62)}/>`) +
        `<path d="M40 86 Q70 64 100 82 Q130 64 160 86 Q140 106 100 96 Q60 106 40 86 Z" fill="${k}"/>`) +
      eyes(84, 24, 8.5, 100, '#fff') + cheeks(104, 42) + nose(104, k, 7, 5) + wMouth(110, 6);
  };

  C.bear = () => {
    const c = '#9b6440', m = '#e9c39d';
    return shadow() + body(c, { belly: '#c99067' }) +
      `<path d="M78 150 Q74 182 100 184 Q126 182 122 150 Z" ${s('#e8a33d', 3.5)}/>` +
      `<rect x="76" y="142" width="48" height="11" rx="5" ${s('#c27a2a', 3.5)}/>` +
      `<path d="M84 153 q0 9 4 9 q4 0 4 -9 M108 153 q0 6 3 6 q3 0 3 -6" fill="#ffd23f" stroke="${OL}" stroke-width="2.5"/>` +
      mir(EAR.round(c, '#d99a7a')) + head(c) +
      `<ellipse cx="100" cy="106" rx="24" ry="17" ${s(m, 3)}/>` +
      eyes(82, 24) + cheeks(100, 42) + nose(100, OL, 8, 5.5) + wMouth(108, 5);
  };

  C.whale = () => {
    const c = '#5d93e6', b = '#d6e8ff';
    return `<path d="M86 72 Q80 50 62 42 M90 70 Q94 46 112 38 M88 72 V36" ${ln(6, '#7fc8ff')}/>` +
      `<circle cx="60" cy="40" r="5" fill="#7fc8ff"/><circle cx="114" cy="36" r="5" fill="#7fc8ff"/><circle cx="88" cy="32" r="5" fill="#7fc8ff"/>` +
      whaleBody(c, b, `<path d="M48 150 Q90 160 132 150 M54 162 Q90 170 126 162" ${ln(2.5, '#a8c8f0')}/>`) +
      eyes(112, 20, 9, 86) + cheeks(128, 38, '#ff7f9f', 86) + smile(128, 11, 86, 9) + waves(178);
  };

  // ---------- Rare ----------

  C.redpanda = () => {
    const c = '#cf5b2c', w = '#fff8ee', d = '#4a2b2e', t = '#efa06a';
    return shadow() +
      blob(`<path d="M126 172 Q192 176 184 116 Q180 90 160 80 Q170 124 132 146 Z"/>`, c,
        `<path d="M170 82 L188 88 M164 108 L190 108 M150 134 L186 132 M134 160 L176 168" ${ln(10, t)}/>`) +
      body(c, { belly: d, feet: d, arms: d }) +
      mir(`<path d="M50 70 Q42 34 64 26 Q86 28 92 46 Z" ${s(w)}/><path d="M58 60 Q54 40 66 34 Q80 36 84 48 Z" fill="#8a3a26"/>`) +
      head(c, `<ellipse cx="100" cy="116" rx="30" ry="20" fill="${w}"/>` +
        mir(`<ellipse cx="60" cy="104" rx="16" ry="14" fill="${w}"/><ellipse cx="80" cy="64" rx="9" ry="6" fill="${w}"/><path d="M80 94 Q76 108 70 118" ${ln(7, '#8a3a26')}/>`)) +
      eyes(84, 22) + cheeks(104, 44) + nose(106, OL, 7, 5) + wMouth(112, 6);
  };

  C.fennec = () => foxy({ c: '#f1cd8f', w: '#fffaf0', d: '#c99a5e', inner: '#ffd6c4', tailTip: '#6b4a3a', ear: EAR.big, headR: [50, 42, 92], eyeY: 90 });

  C.arcticfox = () => foxy({
    c: '#eef3fb', w: '#ffffff', d: '#c9d6ea', inner: '#d6e2f5', tailTip: '#ffffff',
    front: sparkle(28, 40, 9, '#bfe3ff') + sparkle(176, 160, 6, '#bfe3ff') + sparkle(22, 120, 5, '#bfe3ff'),
  });

  C.axolotl = () => {
    const c = '#ffb6d3', g = '#ff6fa8', b = '#ffd8e8';
    return shadow(56) + blob(`<path d="M130 160 Q176 150 190 118 Q190 162 138 182 Z"/>`, c, `<path d="M150 160 Q176 150 186 130" ${ln(4, b)}/>`) +
      blob(`<ellipse cx="100" cy="150" rx="42" ry="32"/>`, c, `<ellipse cx="100" cy="164" rx="26" ry="20" fill="${b}"/>`) +
      mir(`<ellipse cx="74" cy="182" rx="13" ry="7" ${s(c)}/><ellipse cx="68" cy="150" rx="9" ry="12" ${s(c)} ${rot(-20, 68, 150)}/>`) +
      mir(`<ellipse cx="40" cy="62" rx="19" ry="7.5" ${s(g, 3.5)} ${rot(30, 40, 62)}/><ellipse cx="32" cy="88" rx="19" ry="7.5" ${s(g, 3.5)}/><ellipse cx="40" cy="114" rx="19" ry="7.5" ${s(g, 3.5)} ${rot(-30, 40, 114)}/>`) +
      head(c, `<circle cx="74" cy="56" r="4" fill="${b}"/><circle cx="128" cy="52" r="5" fill="${b}"/><circle cx="112" cy="62" r="3" fill="${b}"/>`, 60, 44, 88) +
      eyes(84, 32, 7.5) + cheeks(100, 46) + smile(100, 22, 100, 12);
  };

  C.platypus = () => {
    const c = '#8d5c3e', bl = '#4f5670';
    return shadow(60) + `<ellipse cx="150" cy="174" rx="34" ry="14" ${s('#6e4630')} ${rot(-20, 150, 174)}/>` +
      `<path d="M134 170 L166 160 M140 182 L172 170 M150 160 L156 180" ${ln(2, '#4f3322')}/>` +
      body(c, { belly: '#c4946c', feet: bl }) +
      head(c, '', 48, 42, 80) + eyes(74, 22, 8.5) + cheeks(94, 42) +
      blob(`<ellipse cx="100" cy="108" rx="36" ry="17"/>`, bl) +
      `<circle cx="94" cy="100" r="2.5" fill="#2c2f40"/><circle cx="106" cy="100" r="2.5" fill="#2c2f40"/>` +
      `<path d="M74 110 Q100 120 126 110" ${ln(2.5, '#2c2f40')}/>`;
  };

  C.snowleopard = () => {
    const c = '#e9e8f0', sp = '#6d6879', w = '#fff';
    const ros = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${sp}" stroke-width="3"/>`;
    return shadow() +
      body(c, { belly: w, marks: ros(64, 128) + ros(136, 130) + ros(58, 154, 4) + ros(142, 156, 4) }) +
      tube('M140 158 Q166 188 110 188 Q72 190 60 176', c, 22) +
      `<circle cx="124" cy="186" r="3.5" fill="${sp}"/><circle cx="96" cy="188" r="3.5" fill="${sp}"/><circle cx="74" cy="184" r="3.5" fill="${sp}"/><circle cx="150" cy="168" r="3.5" fill="${sp}"/>` +
      mir(EAR.round(c, '#d9cdd8', 60, 46, 15)) +
      head(c, `<ellipse cx="100" cy="114" rx="28" ry="20" fill="${w}"/>` + ros(70, 54) + ros(130, 54) + ros(100, 44, 4) + ros(54, 100, 4) + ros(146, 100, 4)) +
      eyes(82, 22, 9, 100, '#cfe6ff') + cheeks(102, 40) + nose(102, '#e9a3ad', 7, 5) + wMouth(108, 6) + whiskers(106, 72);
  };

  C.narwhal = () => {
    const c = '#93acd0', b = '#e8f0fa', sp = '#7590b8';
    return `<path d="M70 84 L40 8 L88 76 Z" ${s('#fff4d6', 3.5)}/>` +
      `<path d="M60 70 L78 64 M52 50 L70 46 M46 30 L60 28" ${ln(2.5)}/>` +
      whaleBody(c, b, `<circle cx="120" cy="96" r="5" fill="${sp}"/><circle cx="138" cy="114" r="4" fill="${sp}"/><circle cx="104" cy="84" r="3.5" fill="${sp}"/><circle cx="46" cy="104" r="4" fill="${sp}"/>`) +
      eyes(112, 20, 9, 86) + cheeks(128, 38, '#ff7f9f', 86) + smile(128, 11, 86, 9) + waves(178, '#b5e3ff');
  };

  C.chameleon = () => {
    const c = '#6fd17a', st = '#b8f06a';
    return `<path d="M4 168 Q100 156 196 164" ${ln(18)}/><path d="M4 168 Q100 156 196 164" ${ln(11, '#9a6a45')}/>` +
      `<path d="M30 160 Q22 140 38 134 Q44 150 30 160 Z" ${s('#7cc75a', 3)}/>` +
      tube('M136 130 Q172 130 170 158 Q168 182 148 178 Q132 172 140 160 Q148 152 154 162', c, 12) +
      `<path d="M70 140 L66 162 M86 148 L84 162 M120 146 L124 160 M136 140 L140 160" ${ln(16)}/>` +
      `<path d="M70 140 L66 162 M86 148 L84 162 M120 146 L124 160 M136 140 L140 160" ${ln(9, c)}/>` +
      `<polyline points="${zigzag(104, 120, 50, 40, 42, 32, 200, 340, 7)}" ${s('#4fb85e', 3.5)}/>` +
      blob(`<ellipse cx="104" cy="120" rx="46" ry="32"/>`, c, `<path d="M80 92 L74 150 M104 90 L104 152 M128 92 L134 150" ${ln(8, st)}/>`) +
      blob(`<path d="M80 92 Q72 60 44 66 Q20 74 24 104 Q30 132 64 134 Q86 130 88 112 Z"/>`, c, `<path d="M30 112 Q50 118 74 112" ${ln(8, st)}/>`) +
      `<circle cx="56" cy="92" r="17" ${s(c)}/><circle cx="52" cy="92" r="9" fill="${OL}"/><circle cx="55" cy="88" r="3.5" fill="#fff"/>` +
      `<path d="M26 112 Q44 124 66 116" ${ln(3.5)}/><ellipse cx="64" cy="122" rx="7" ry="4" fill="#ff7f9f" opacity=".6"/>`;
  };

  C.peacock = () => {
    const b = '#2f7fd6', g = '#3cae7c';
    let fan = '';
    for (const a of [-72, 72, -54, 54, -36, 36, -18, 18, 0]) {
      fan += `<g ${rot(a, 100, 140)}><path d="M100 140 Q80 86 100 42 Q120 86 100 140 Z" ${s(g, 3.5)}/>` +
        `<ellipse cx="100" cy="60" rx="11" ry="13" ${s('#ffcf4d', 2.5)}/><ellipse cx="100" cy="62" rx="6" ry="7" fill="#1f4fa8"/></g>`;
    }
    return shadow(40) + fan + mir(`<path d="M90 176 L86 188 M90 176 L94 188" ${ln(4, '#e0a050')}/>`) +
      blob(`<ellipse cx="100" cy="148" rx="30" ry="34"/>`, b, `<ellipse cx="100" cy="160" rx="18" ry="22" fill="#4f9be6"/>`) +
      mir(`<path d="M72 138 Q66 160 78 174 Q86 160 82 140 Z" ${s('#2667b5', 3.5)}/>`) +
      mir(`<path d="M92 60 L84 38" ${ln(3.5)}/><circle cx="84" cy="37" r="5" ${s(b, 3)}/>`) + `<path d="M100 58 V34" ${ln(3.5)}/><circle cx="100" cy="33" r="5" ${s(b, 3)}/>` +
      head(b, mir(`<path d="M72 78 Q84 70 94 80" ${ln(5, '#fff')}/>`), 32, 30, 88) +
      eyes(88, 13, 7.5) + cheeks(100, 22, '#ff7f9f', 100, 6) + `<path d="M94 98 L106 98 L100 108 Z" ${s('#f2b05a', 3)}/>`;
  };

  // ---------- Legendary ----------

  C.unicorn = () => {
    const c = '#fffaff', M = ['#ff8fb6', '#ffcf5c', '#86dcae', '#86c8ff', '#bb9cff'];
    const tail = [[178, 106, 10, 4], [178, 124, 12, 3], [170, 142, 13, 2], [158, 158, 14, 1], [142, 168, 14, 0]]
      .map(([x, y, r, i]) => `<circle cx="${x}" cy="${y}" r="${r}" ${s(M[i], 3.5)}/>`).join('');
    return shadow() + tail + body(c, { feet: '#d9c2ff' }) +
      mir(`<path d="M60 62 Q54 34 62 20 Q78 30 86 46 Z" ${s(c)}/><path d="M64 54 Q61 38 65 30 Q73 36 78 46 Z" fill="#ffc8da"/>`) +
      head(c, '', 50, 46, 86) +
      `<path d="M90 42 L100 2 L110 42 Q100 48 90 42 Z" ${s('#ffd76b', 3.5)}/><path d="M93 32 L107 27 M95 21 L105 17 M97 11 L103 9" ${ln(2.5)}/>` +
      `<circle cx="116" cy="46" r="11" ${s(M[4], 3.5)}/><circle cx="84" cy="44" r="12" ${s(M[0], 3.5)}/><circle cx="68" cy="52" r="11" ${s(M[1], 3.5)}/>` +
      `<circle cx="56" cy="66" r="11" ${s(M[2], 3.5)}/><circle cx="50" cy="84" r="10" ${s(M[3], 3.5)}/><circle cx="52" cy="102" r="9" ${s(M[4], 3.5)}/>` +
      blob(`<ellipse cx="100" cy="114" rx="30" ry="17"/>`, '#ffe1ec', '', 3.5) +
      `<ellipse cx="92" cy="110" rx="2.5" ry="3.5" fill="${OL}"/><ellipse cx="108" cy="110" rx="2.5" ry="3.5" fill="${OL}"/>` + smile(119, 7, 100, 5) +
      eyes(84, 22, 10) + mir(`<path d="M69 80 l-6 -4 M71 75 l-4 -6" ${ln(3)}/>`) + cheeks(100, 40) +
      sparkle(26, 30, 9) + sparkle(178, 64, 7, '#ff8fb6') + sparkle(166, 20, 5, '#86c8ff');
  };

  C.dragon = () => {
    const c = '#5ccfa8', b = '#ffe9a3', wg = '#3aa889', mem = '#a8f0d4';
    return shadow() +
      mir(`<path d="M68 126 Q34 84 14 70 Q22 96 16 114 Q30 110 34 124 Q44 118 54 134 Z" ${s(mem)}/><path d="M66 124 Q38 92 16 72 M44 104 L34 124 M40 100 L20 112" ${ln(3, wg)}/>`) +
      tube('M136 170 Q178 176 180 144', c, 14) + `<path d="M180 146 L166 132 L182 112 L196 132 Z" ${s(wg)}/>` +
      body(c, { belly: b, over: `<path d="M74 148 Q100 154 126 148 M72 164 Q100 170 128 164" ${ln(3, '#e8c56a')}/>` }) +
      mir(`<path d="M66 52 Q50 26 58 10 Q66 30 82 42 Z" ${s('#fff2c4')}/>`) +
      mir(`<path d="M50 78 L24 68 L42 94 Z" ${s(wg)}/>`) +
      `<path d="M90 42 L100 26 L110 42 Z" ${s(wg, 3)}/>` +
      head(c, '', 52, 46, 86) +
      blob(`<ellipse cx="100" cy="112" rx="28" ry="16"/>`, '#86e0c0', '', 3) +
      `<ellipse cx="92" cy="106" rx="2.5" ry="3.5" fill="${OL}"/><ellipse cx="108" cy="106" rx="2.5" ry="3.5" fill="${OL}"/>` +
      smile(116, 9, 100, 6) + `<path d="M104 120 l3 6 l3 -6" ${s('#fff', 2)}/>` +
      eyes(82, 24, 10) + cheeks(102, 42);
  };

  C.phoenix = () => {
    const r = '#ff5a3c', o = '#ff9a2e', y = '#ffd23f';
    return shadow(48) +
      mir(`<path d="M84 160 Q60 194 34 188 Q56 176 62 152 Z" ${s(r)}/>`) + `<path d="M90 166 Q100 202 110 166 Z" ${s(y)}/>` +
      mir(`<path d="M64 120 Q30 112 10 72 Q28 82 36 76 Q28 60 32 42 Q48 64 56 60 Q56 80 72 98 Z" ${s(o)}/><path d="M62 112 Q38 102 26 82 Q40 88 46 84 Q44 74 46 66 Q56 82 66 98 Z" fill="${y}"/>`) +
      `<path d="M100 36 Q86 20 100 0 Q114 20 100 36 Z" ${s(y, 3.5)}/>` +
      `<path d="M92 38 Q72 30 76 10 Q88 24 98 30 Z" ${s(r, 3.5)}/><path d="M108 38 Q128 30 124 10 Q112 24 102 30 Z" ${s(r, 3.5)}/>` +
      blob(EGG_SHAPE, o, `<ellipse cx="100" cy="150" rx="36" ry="38" fill="${y}"/><path d="M76 40 Q100 56 124 40" ${ln(10, r)}/>`) +
      eyes(84, 20) + cheeks(100, 36) + `<path d="M92 98 L108 98 L100 112 Z" ${s(y, 3)}/>` +
      sparkle(20, 140, 7, y) + sparkle(182, 132, 6, o) + sparkle(160, 24, 5, y);
  };

  C.griffin = () => {
    const t = '#e3aa52', h = '#fffaf0', bk = '#ffc93c', wg = '#b77a3e';
    return shadow() +
      mir(`<path d="M70 124 Q34 104 16 62 Q38 68 44 60 Q50 72 58 68 Q62 86 82 112 Z" ${s(wg)}/><path d="M60 110 Q42 96 32 76 M68 104 Q58 92 52 78" ${ln(3, '#8a5a2c')}/>`) +
      tube('M138 172 Q176 174 174 144', t, 9) + `<path d="M174 146 Q164 130 174 124 Q184 130 174 146 Z" ${s(wg, 3)}/>` +
      body(t, { belly: '#f3cc85' }) +
      `<path d="M50 118 L60 136 L70 124 L80 140 L90 126 L100 142 L110 126 L120 140 L130 124 L140 136 L150 118 Z" ${s(h)}/>` +
      mir(`<path d="M62 56 L46 22 L86 40 Z" ${s(h)}/>`) +
      head(h, '', 48, 44, 82) +
      eyes(78, 22, 9.5) + cheeks(96, 38) +
      `<path d="M86 92 Q100 84 114 92 Q114 110 100 122 Q86 110 86 92 Z" ${s(bk)}/><path d="M90 100 Q100 104 110 100" ${ln(2.5)}/>`;
  };

  C.kitsune = () => {
    const c = '#fffaf5', tip = '#ffb3c7', red = '#ff4f6a';
    let tails = '';
    for (const a of [-104, 104, -84, 84, -64, 64, -44, 44, 0]) {
      tails += `<g ${rot(a, 100, 150)}>` + blob(`<path d="M100 156 C68 124 74 78 100 52 C126 78 132 124 100 156 Z"/>`, c, `<ellipse cx="100" cy="62" rx="24" ry="20" fill="${tip}"/>`, 3.5) + '</g>';
    }
    return foxy({
      c, w: '#ffffff', d: '#ffd3de', inner: '#ffc2d1', tail: false, back: '',
      headMarks: `<path d="M100 40 Q92 52 100 62 Q108 52 100 40 Z" fill="${red}"/>` + mir(`<path d="M60 76 Q52 72 46 80" ${ln(4, red)}/>`),
      front: sparkle(22, 40, 7, '#8fd3ff') + sparkle(180, 40, 7, '#8fd3ff'),
    }).replace(shadow(), shadow() + tails);
  };

  C.jackalope = () => bunny({
    c: '#c99a6b', b: '#fbeedd', p: '#ffb0c0',
    back: mir(`<path d="M88 44 Q80 24 70 6 M79 26 Q66 22 58 14 M75 16 Q80 8 86 4" ${ln(11)}/><path d="M88 44 Q80 24 70 6 M79 26 Q66 22 58 14 M75 16 Q80 8 86 4" ${ln(5, '#e8cfa6')}/>`),
  }).replace(mir(EAR.long('#c99a6b', '#ffb0c0')),
    mir(`<ellipse cx="60" cy="44" rx="11" ry="24" ${s('#c99a6b')} ${rot(-40, 60, 44)}/><ellipse cx="60" cy="46" rx="5" ry="16" fill="#ffb0c0" ${rot(-40, 60, 46)}/>`));

  C.nessie = () => {
    const c = '#6cc690', sp = '#4fa877';
    return `<path d="M-4 130 Q21 122 46 130 T96 130 T146 130 T196 130 T246 130 V204 H-4 Z" fill="#cdeeff"/>` +
      blob(`<path d="M118 172 Q138 112 158 172 Z"/>`, c, `<circle cx="136" cy="140" r="4" fill="${sp}"/><circle cx="144" cy="154" r="3" fill="${sp}"/>`) +
      blob(`<path d="M158 174 Q174 136 192 174 Z"/>`, c, `<circle cx="174" cy="156" r="3" fill="${sp}"/>`) +
      tube('M84 178 Q72 132 90 100 Q100 82 100 66', c, 26) +
      `<circle cx="84" cy="140" r="4" fill="${sp}"/><circle cx="90" cy="114" r="3.5" fill="${sp}"/>` +
      mir(`<path d="M82 34 L78 22" ${ln(5)}/><circle cx="78" cy="21" r="5" ${s('#9ee0b6', 3)}/>`) +
      head(c, `<circle cx="132" cy="44" r="4" fill="${sp}"/>`, 38, 27, 54) +
      `<ellipse cx="94" cy="60" rx="2.5" ry="3" fill="${OL}"/><ellipse cx="106" cy="60" rx="2.5" ry="3" fill="${OL}"/>` +
      eyes(46, 16, 8) + cheeks(60, 28, '#ff7f9f', 100, 7) + smile(66, 9, 100, 6) +
      waves(170);
  };

  C.yeti = () => {
    const f = '#f4f7ff', fc = '#9cc4ef';
    return shadow(60) +
      mir(tube('M52 120 Q30 150 40 172', f, 22) + `<ellipse cx="78" cy="186" rx="20" ry="9" ${s(fc)}/>`) +
      `<polygon points="${zigzag(100, 116, 76, 74, 66, 64, 0, 360, 18)}" ${s(f)}/>` +
      blob(`<ellipse cx="100" cy="100" rx="40" ry="34"/>`, fc) +
      eyes(96, 17, 8.5) + cheeks(110, 30, '#ff9fbf') +
      `<path d="M84 112 Q100 132 116 112 Z" ${s('#7a4060', 3)}/><path d="M88 113 l3 6 l3 -6 Z M106 113 l3 6 l3 -6 Z" fill="#fff"/>` +
      sparkle(24, 30, 7, '#cfe6ff') + sparkle(176, 34, 9, '#cfe6ff');
  };

  C.starpig = () => cavy('#efe6ff', '#ffc2df', '#a9d4ff',
    star(100, 48, 13) + sparkle(24, 34, 9, '#ffd84d') + sparkle(176, 30, 7, '#ff8fb6') + sparkle(184, 112, 5, '#86c8ff'));

  // ---------- Eggs ----------

  const EGG_STYLES = {
    common: { base: '#fff3dc', spots: ['#8fd19a', '#5ec4c9'], band: null },
    rare: { base: '#d9ecff', spots: ['#9b8cff', '#5ea8ff'], band: '#ffffff' },
    legendary: { base: '#ffe48a', spots: ['#ff8fb6', '#bb9cff'], band: 'rainbow' },
  };
  function egg(rarity = 'common', cracks = 0) {
    const st = EGG_STYLES[rarity];
    const shape = `<path d="M100 14 C148 14 172 96 172 130 C172 172 140 194 100 194 C60 194 28 172 28 130 C28 96 52 14 100 14 Z"/>`;
    let marks = `<circle cx="72" cy="80" r="11" fill="${st.spots[0]}"/><circle cx="128" cy="62" r="8" fill="${st.spots[1]}"/><circle cx="140" cy="140" r="12" fill="${st.spots[0]}"/><circle cx="62" cy="152" r="9" fill="${st.spots[1]}"/><circle cx="104" cy="172" r="7" fill="${st.spots[0]}"/><circle cx="104" cy="40" r="5" fill="${st.spots[0]}"/>`;
    if (st.band === 'rainbow') {
      marks += ['#ff8fb6', '#ffcf5c', '#86dcae', '#86c8ff'].map((col, i) => `<path d="M20 ${108 + i * 9} L40 ${100 + i * 9} L60 ${112 + i * 9} L80 ${100 + i * 9} L100 ${112 + i * 9} L120 ${100 + i * 9} L140 ${112 + i * 9} L160 ${100 + i * 9} L180 ${112 + i * 9}" ${ln(9, col)}/>`).join('');
    } else if (st.band) {
      marks += `<path d="M20 112 L40 100 L60 116 L80 100 L100 116 L120 100 L140 116 L160 100 L180 112" ${ln(12, st.band)}/>`;
    }
    marks += `<ellipse cx="66" cy="60" rx="10" ry="18" fill="#fff" opacity=".55" ${rot(25, 66, 60)}/>`;
    let out = blob(shape, st.base, marks, 5);
    if (rarity === 'legendary') out += sparkle(24, 40, 9) + sparkle(178, 76, 7, '#ff8fb6') + sparkle(170, 22, 5, '#86c8ff');
    if (rarity === 'rare') out += sparkle(176, 50, 7, '#ffffff');
    const crackLines = [
      'M96 46 L106 60 L96 70 L108 82',
      'M40 120 L56 116 L60 128 L76 124',
      'M150 110 L138 118 L144 130 L130 136',
    ];
    for (let i = 0; i < Math.min(cracks, 3); i++) out += `<path d="${crackLines[i]}" ${ln(4)}/>`;
    return out;
  }

  // ---------- Category icons ----------

  const ICONS = {
    outside: () => `<circle cx="100" cy="100" r="40" ${s('#ffd23f', 10)}/>` +
      [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M100 36 V14" ${ln(12, OL)} ${rot(a, 100, 100)}/>`).join(''),
    house: () => `<path d="M30 96 L100 30 L170 96 L152 96 L152 172 L48 172 L48 96 Z" ${s('#ff8f6b', 10)}/><rect x="84" y="118" width="32" height="54" rx="6" ${s('#ffd23f', 8)}/>`,
    friends: () => `<path d="M100 170 C40 130 20 100 26 70 C32 40 72 30 100 64 C128 30 168 40 174 70 C180 100 160 130 100 170 Z" ${s('#ff7fa6', 10)}/>`,
    art: () => `<path d="M100 22 C40 22 18 76 26 116 C34 160 86 182 110 166 C126 156 104 138 122 126 C140 116 176 132 180 98 C184 56 150 22 100 22 Z" ${s('#ffdf9e', 10)}/>` +
      `<circle cx="66" cy="70" r="13" fill="#ff5a5a"/><circle cx="104" cy="56" r="13" fill="#5ea8ff"/><circle cx="142" cy="78" r="13" fill="#5cc96b"/><circle cx="60" cy="116" r="13" fill="#bb7cff"/>`,
    explore: () => `<circle cx="100" cy="100" r="76" ${s('#9fdcff', 10)}/><path d="M100 36 L120 100 L100 164 L80 100 Z" ${s('#ff5a5a', 8)}/><path d="M80 100 L100 164 L120 100 Z" ${s('#ffffff', 8)}/>`,
    nature: () => `<path d="M40 166 C30 90 80 30 170 30 C172 120 120 170 40 166 Z" ${s('#6cc04a', 10)}/><path d="M48 158 Q100 110 140 62" ${ln(10)}/>`,
    learning: () => `<path d="M100 50 Q60 30 20 44 L20 160 Q60 146 100 166 Q140 146 180 160 L180 44 Q140 30 100 50 Z" ${s('#7fb5ff', 10)}/><path d="M100 50 V166" ${ln(10)}/>`,
    music: () => `<path d="M74 140 V46 L156 30 V122" ${ln(12)}/><path d="M74 46 L156 30 V54 L74 70 Z" fill="${OL}"/><ellipse cx="56" cy="144" rx="24" ry="19" ${s('#bb7cff', 10)}/><ellipse cx="138" cy="126" rx="24" ry="19" ${s('#bb7cff', 10)}/>`,
    dice: () => `<rect x="26" y="26" width="148" height="148" rx="34" ${s('#ffffff', 12)}/>` +
      [[64, 64], [136, 64], [100, 100], [64, 136], [136, 136]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="${OL}"/>`).join(''),
    album: () => `<rect x="36" y="20" width="128" height="160" rx="18" ${s('#ffcf5c', 12)}/><path d="M36 50 H164" ${ln(10)}/>` + `<circle cx="100" cy="112" r="34" ${s('#fff', 10)}/><circle cx="88" cy="106" r="6" fill="${OL}"/><circle cx="112" cy="106" r="6" fill="${OL}"/>`,
    back: () => `<path d="M120 36 L56 100 L120 164" ${ln(26)}/>`,
    tick: () => `<path d="M40 104 L82 146 L162 56" ${ln(28)}/>`,
    close: () => `<path d="M50 50 L150 150 M150 50 L50 150" ${ln(26)}/>`,
    soundOn: () => `<path d="M30 76 H62 L106 36 V164 L62 124 H30 Z" ${s('#fff', 12)}/><path d="M130 70 Q150 100 130 130 M152 50 Q186 100 152 150" ${ln(12)}/>`,
    soundOff: () => `<path d="M30 76 H62 L106 36 V164 L62 124 H30 Z" ${s('#fff', 12)}/><path d="M134 76 L178 124 M178 76 L134 124" ${ln(12)}/>`,
    gear: () => `<polygon points="${zigzag(100, 100, 82, 82, 64, 64, 0, 360, 8)}" ${s('#d6dbe6', 10)}/><circle cx="100" cy="100" r="22" ${s('#fff', 10)}/>`,
  };

  const svg = (inner, vb = '0 0 200 200') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;
  const url = markup => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);
  const cache = {};
  function creatureUrl(id) {
    if (!cache[id]) cache[id] = url(svg(C[id]()));
    return cache[id];
  }
  const eggUrl = (rarity, cracks = 0) => url(svg(egg(rarity, cracks), '0 0 200 206'));
  const iconSvg = name => svg(ICONS[name]());

  window.Art = { creatures: C, creatureUrl, eggUrl, iconSvg, svg, url };
})();

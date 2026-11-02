// 地理 第10講「地域調査の手法」の図（地形図・地図記号・主題図など）
import * as d3c from 'd3-contour';
import * as d3 from 'd3-geo';
import fs from 'fs';

const C = { ink: '#1d2a33', con: '#8a5a2b', water: '#3f7fb5', sea: '#eef4f8' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 12;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.3"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.3"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 15}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const planar = d3.geoPath();  // 平面の座標をそのまま描く
const pd = g => (planar(g) || '').replace(/(\d+\.\d)\d+/g, '$1');

// ---------- 地図記号（1つずつ、24×24の枠で描く） ----------
const K = C.ink, SW = 1.6;
const SYM = {
  shiyakusho: ['市役所', `<circle cx="12" cy="12" r="8.5" fill="none" stroke="${K}" stroke-width="${SW}"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="${K}" stroke-width="${SW}"/>`],
  gakko: ['小・中学校', `<text x="12" y="13" font-size="19" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${K}">文</text>`],
  koko: ['高等学校', `<circle cx="12" cy="12" r="10" fill="none" stroke="${K}" stroke-width="${SW}"/><text x="12" y="12.8" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${K}">文</text>`],
  yubin: ['郵便局', `<circle cx="12" cy="12" r="10" fill="none" stroke="${K}" stroke-width="${SW}"/><path d="M7 7.5 H17 M7 11 H17 M12 11 V18.5" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  koban: ['交番', `<path d="M6 6 L18 18 M18 6 L6 18" stroke="${K}" stroke-width="${SW + 0.4}"/>`],
  keisatsu: ['警察署', `<circle cx="12" cy="12" r="10" fill="none" stroke="${K}" stroke-width="${SW}"/><path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="${K}" stroke-width="${SW}"/>`],
  shobo: ['消防署', `<path d="M5 4 L12 12 L19 4 M12 12 V21" stroke="${K}" stroke-width="${SW + 0.4}" fill="none"/>`],
  jinja: ['神社', `<path d="M3 6.5 H21 M5.5 10 H18.5 M8 6.5 V21 M16 6.5 V21" stroke="${K}" stroke-width="${SW + 0.2}" fill="none"/>`],
  tera: ['寺院', `<text x="12" y="13" font-size="20" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${K}">卍</text>`],
  toshokan: ['図書館', `<path d="M12 7 Q7 4 3 6 V19 Q7 17 12 20 Q17 17 21 19 V6 Q17 4 12 7 Z M12 7 V20" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  hakubutsukan: ['博物館・美術館', `<path d="M3 10 L12 4 L21 10 Z M5 20 H19 M7 10 V20 M12 10 V20 M17 10 V20" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  rojin: ['老人ホーム', `<path d="M4 12 L12 5 L20 12 M6 11 V20 H18 V11" stroke="${K}" stroke-width="${SW}" fill="none"/><path d="M11 20 V13 Q11 11 13.5 11" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  kojo: ['工場', `<circle cx="12" cy="12" r="5" fill="none" stroke="${K}" stroke-width="${SW}"/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<line x1="${r1(12 + 6 * Math.cos(a))}" y1="${r1(12 + 6 * Math.sin(a))}" x2="${r1(12 + 9.5 * Math.cos(a))}" y2="${r1(12 + 9.5 * Math.sin(a))}" stroke="${K}" stroke-width="${SW + 0.6}"/>`; }).join('')}`],
  onsen: ['温泉', `<text x="12" y="13" font-size="21" text-anchor="middle" dominant-baseline="middle" fill="${K}">♨</text>`],
  shiroato: ['城跡', `<path d="M4 20 V9 H7 V12 H10 V9 H14 V12 H17 V9 H20 V20" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  bochi: ['墓地', `<path d="M12 5 V18 M6 18 H18" stroke="${K}" stroke-width="${SW + 0.3}" fill="none"/>`],
  ta: ['田', `<path d="M8 6 V18 M16 6 V18" stroke="${K}" stroke-width="${SW + 0.2}"/>`],
  hatake: ['畑', `<path d="M6 7 Q12 9 12 18 Q12 9 18 7" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  kajuen: ['果樹園', `<circle cx="12" cy="14" r="5.5" fill="none" stroke="${K}" stroke-width="${SW}"/><path d="M12 8.5 V4" stroke="${K}" stroke-width="${SW}"/>`],
  chabatake: ['茶畑', `<circle cx="12" cy="7" r="2.6" fill="${K}"/><circle cx="7" cy="16" r="2.6" fill="${K}"/><circle cx="17" cy="16" r="2.6" fill="${K}"/>`],
  koyoju: ['広葉樹林', `<circle cx="12" cy="9.5" r="5.5" fill="none" stroke="${K}" stroke-width="${SW}"/><path d="M12 15 V21" stroke="${K}" stroke-width="${SW}"/>`],
  shinyoju: ['針葉樹林', `<path d="M5 15 L12 5 L19 15 M12 15 V21" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  arechi: ['荒地', `<path d="M12 6 V18 M7 10 V18 M17 10 V18 M4 18 H20" stroke="${K}" stroke-width="${SW}" fill="none"/>`],
  sankaku: ['三角点', `<path d="M12 4 L20 18 H4 Z" fill="none" stroke="${K}" stroke-width="${SW}"/><circle cx="12" cy="13" r="1.6" fill="${K}"/>`],
};
const useSym = (k, x, y, s = 1) => `<g transform="translate(${r1(x - 12 * s)} ${r1(y - 12 * s)}) scale(${s})">${SYM[k][1]}</g>`;

function symbolTable(keys, mode, cols = 6) {
  const cw = 104, ch = 74, w = cols * cw, rows = Math.ceil(keys.length / cols), h = rows * ch;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  keys.forEach((k, i) => {
    const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
    s += `<rect x="${x + 2}" y="${y + 2}" width="${cw - 4}" height="${ch - 4}" rx="4" fill="#fff" stroke="#aaa"/>`;
    s += useSym(k, x + cw / 2, y + 28, 1.35);
    s += mode === 'label' ? txt(x + cw / 2, y + ch - 13, SYM[k][0], { size: 13, noHalo: true }) : badge(x + 14, y + 14, i + 1, { r: 10, size: 12 }) + `<rect x="${x + 12}" y="${y + ch - 24}" width="${cw - 24}" height="16" fill="none" stroke="#ccc" stroke-dasharray="3 2"/>`;
  });
  return svg(w, h, s);
}

// ---------- 等高線のしくみ（上から見た図と断面図） ----------
function contourDiagram(mode) {
  const w = 560, h = 420;
  const N = 140, M = 70;  // 格子
  const z = (i, j) => { const x = i / N, y = j / M; const dx = x - 0.42, dy = y - 0.5; return 120 * Math.exp(-((dx < 0 ? dx / 0.13 : dx / 0.32) ** 2 + (dy / 0.36) ** 2)); };
  const vals = []; for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) vals.push(z(i, j));
  const cs = d3c.contours().size([N, M]).thresholds([20, 40, 60, 80, 100])(vals);
  const sx = 520 / N, sy = 220 / M, ox = 20, oy = 14;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/><g transform="translate(${ox} ${oy}) scale(${sx} ${sy})">`;
  cs.forEach(c => { s += `<path d="${pd(c)}" fill="none" stroke="${C.con}" stroke-width="${c.value === 100 ? 2.6 : 1.7}" vector-effect="non-scaling-stroke"/>`; });
  s += '</g>';
  // 断面の線 A-B
  const yAB = oy + 0.5 * 220;
  s += `<line x1="${ox}" y1="${r1(yAB)}" x2="${ox + 520}" y2="${r1(yAB)}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="5 4"/>`;
  s += txt(ox + 4, yAB - 10, 'A', { size: 15, anchor: 'start' }) + txt(ox + 516, yAB - 10, 'B', { size: 15, anchor: 'end' });
  // 等高線の数字
  [20, 60, 100].forEach(v => { let best = null; for (let i = 0; i < 0.42 * N; i += 0.05) { if (Math.abs(z(i, M * 0.5) - v) < 0.6) { best = i; break; } } if (best != null) s += txt(ox + best * sx - 2, yAB + 12, String(v), { size: 11, weight: 400, anchor: 'end' }); });
  // 断面図
  const top = 270, bot = 400, H = bot - top;
  s += `<line x1="${ox}" y1="${bot}" x2="${ox + 520}" y2="${bot}" stroke="${C.ink}"/>`;
  for (let v = 20; v <= 120; v += 20) { const y = bot - v / 130 * H; s += `<line x1="${ox}" y1="${r1(y)}" x2="${ox + 520}" y2="${r1(y)}" stroke="#ddd"/>` + txt(ox + 524, y, `${v}m`, { size: 10, weight: 400, anchor: 'start', noHalo: true }); }
  let p = `M${ox} ${bot}`; for (let i = 0; i <= N; i++) p += ` L${r1(ox + i * sx)} ${r1(bot - z(i, M * 0.5) / 130 * H)}`; p += ` L${ox + 520} ${bot} Z`;
  s += `<path d="${p}" fill="#e8dfcc" stroke="${C.ink}" stroke-width="1.4"/>`;
  s += txt(ox + 4, bot + 11, 'A', { size: 13, anchor: 'start', noHalo: true }) + txt(ox + 516, bot + 11, 'B', { size: 13, anchor: 'end', noHalo: true });
  if (mode === 'label') {
    s += txt(ox + 0.06 * 520, top + 26, '等高線の間がせまい', { size: 13, fill: '#8a3a28', anchor: 'start' }) + txt(ox + 0.06 * 520, top + 44, '→ 急な斜面', { size: 13, fill: '#8a3a28', anchor: 'start' });
    s += txt(ox + 0.80 * 520, top + 26, '等高線の間が広い', { size: 13, fill: '#2f5f45' }) + txt(ox + 0.80 * 520, top + 44, '→ ゆるやかな斜面', { size: 13, fill: '#2f5f45' });
    s += txt(w / 2, 258, '▲ 上の図の A─B で切った断面図', { size: 12, weight: 400, noHalo: true });
  } else {
    s += badge(ox + 0.30 * 520, top + 18, 'ア') + badge(ox + 0.70 * 520, top + 40, 'イ');
    s += txt(w / 2, 258, '▲ 上の図の A─B で切った断面図', { size: 12, weight: 400, noHalo: true });
  }
  return svg(w, h, s);
}

// ---------- 架空の地形図（2万5千分の1） ----------
// 1km＝200（図の単位）。地図上の4cmが1km。
const TW = 600, TH = 480;
const riverX = y => 300 + 40 * Math.sin(y / 120) + (y > 300 ? (y - 300) * 0.35 : 0);
function elev(x, y) {
  const hw = 182 * Math.exp(-(((x - 150) / 68) ** 2 + ((y - 140) / 74) ** 2) / 2);
  const he = 124 * Math.exp(-(((x - 470) / 105) ** 2 + ((y - 120) / 105) ** 2) / 2);
  const base = Math.max(0, 22 - y * 0.03);
  const valley = 14 * Math.exp(-(((x - riverX(y)) / 40) ** 2));
  return Math.max(2, hw + he + base - valley);
}
function topoMap(mode) {
  const N = 150, M = 120, sx = TW / N, sy = TH / M;
  const vals = []; for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) vals.push(elev(i * sx, j * sy));
  const ths = []; for (let v = 10; v <= 180; v += 10) ths.push(v);
  const cs = d3c.contours().size([N, M]).smooth(true).thresholds(ths)(vals);
  let s = `<defs><clipPath id="tm${mode}"><rect width="${TW}" height="${TH}"/></clipPath></defs><rect width="${TW}" height="${TH}" fill="#fffdf6"/><g clip-path="url(#tm${mode})">`;
  // 田（川ぞいの低地）
  const taCells = [];
  for (let y = 330; y < TH - 10; y += 26) for (let x = 20; x < TW - 10; x += 30) { const e = elev(x, y); const rx = riverX(y); if (e < 12 && Math.abs(x - rx) > 34 && !(x > 120 && x < 300 && y > 380 && y < 450)) taCells.push([x, y]); }
  taCells.forEach(([x, y]) => { s += useSym('ta', x, y, 0.55); });
  s += `<g transform="scale(${sx} ${sy})">`;
  cs.forEach(c => { const thick = c.value % 50 === 0; s += `<path d="${pd(c)}" fill="none" stroke="${C.con}" stroke-width="${thick ? 1.6 : 0.7}" vector-effect="non-scaling-stroke"/>`; });
  s += '</g>';
  // 川
  let rv = ''; for (let y = 0; y <= TH; y += 6) rv += (y ? ' L' : 'M') + r1(riverX(y)) + ' ' + y;
  s += `<path d="${rv}" fill="none" stroke="${C.water}" stroke-width="5"/>`;
  // 道路
  s += `<path d="M0 410 C 150 400, 260 420, 330 405 S 520 380, 600 395" fill="none" stroke="#444" stroke-width="5"/><path d="M0 410 C 150 400, 260 420, 330 405 S 520 380, 600 395" fill="none" stroke="#fff" stroke-width="3"/>`;
  // 鉄道（JR線）
  const rail = 'M0 450 C 200 445, 350 460, 600 440';
  s += `<path d="${rail}" fill="none" stroke="${K}" stroke-width="5"/><path d="${rail}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="12 12"/>`;
  // 駅
  s += `<rect x="210" y="442" width="34" height="12" fill="${K}"/>`;
  // 町の建物（市街地）
  for (let y = 360; y < 440; y += 12) for (let x = 130; x < 300; x += 14) { if ((x * 7 + y * 3) % 5 < 3 && Math.abs(x - riverX(y)) > 26) s += `<rect x="${x}" y="${y}" width="8" height="6" fill="#bbb"/>`; }
  // 土地利用の記号
  const place = (k, pts, sc = 0.6) => pts.forEach(([x, y]) => { s += useSym(k, x, y, sc); });
  place('shinyoju', [[120, 90], [170, 70], [200, 120], [100, 160], [150, 210], [210, 190]]);
  place('koyoju', [[440, 70], [500, 90], [430, 150], [520, 160], [480, 210]]);
  place('kajuen', [[390, 260], [430, 285], [470, 265], [510, 290], [550, 270]]);
  place('chabatake', [[60, 270], [95, 300], [40, 320]]);
  s += '</g>';
  // 施設（記号を少し大きく）
  const FAC = [['shiyakusho', 182, 395], ['gakko', 262, 372], ['yubin', 150, 430], ['keisatsu', 230, 410], ['jinja', 100, 320], ['tera', 360, 350], ['koban', 255, 432], ['toshokan', 140, 372]];
  FAC.forEach(([k, x, y]) => { s += `<circle cx="${x}" cy="${y}" r="11" fill="#fffdf6"/>` + useSym(k, x, y, 0.75); });
  // 三角点と標高
  s += useSym('sankaku', 150, 140, 0.6) + txt(150, 158, '182.4', { size: 12, weight: 400 });
  s += `<circle cx="470" cy="120" r="2.2" fill="${K}"/>` + txt(470, 134, '124', { size: 12, weight: 400 });
  // 計曲線の数字
  const lab = (v, x0, y0, dx, dy) => { for (let t = 0; t < 400; t++) { const x = x0 + dx * t, y = y0 + dy * t; if (elev(x, y) >= v) return txt(x, y, String(v), { size: 11, weight: 400 }); } return ''; };
  s += lab(50, 150, 300, 0, -1) + lab(100, 150, 300, 0, -1) + lab(50, 470, 320, 0, -1) + lab(100, 470, 320, 0, -1);
  // 縮尺
  s += `<rect x="${TW - 230}" y="${TH - 28}" width="220" height="22" fill="#fff" stroke="#999"/>` + `<line x1="${TW - 220}" y1="${TH - 12}" x2="${TW - 120}" y2="${TH - 12}" stroke="${K}" stroke-width="3"/>` + txt(TW - 170, TH - 21, '500m', { size: 10, weight: 400, noHalo: true }) + txt(TW - 66, TH - 17, '2万5千分の1', { size: 11, noHalo: true });
  if (mode === 'q') {
    s += badge(150, 116, 'ア', { r: 11, size: 14 });
    // 50mの計曲線上の点
    let p50 = null; for (let t = 0; t < 400; t++) { if (elev(150, 300 - t) >= 50) { p50 = [150, 300 - t]; break; } }
    s += `<circle cx="${p50[0] + 1}" cy="${r1(p50[1])}" r="3.5" fill="#b5513c"/>` + badge(p50[0] + 18, p50[1] + 4, 'イ', { r: 11, size: 14 });
    s += badge(470, 98, 'ウ', { r: 11, size: 14 });
    // 傾斜をくらべる線（X：西の山の東側、Y：東の山の西側）
    s += `<line x1="190" y1="140" x2="240" y2="140" stroke="#b5513c" stroke-width="2.4"/>` + txt(215, 128, 'X', { size: 14, fill: '#8a3a28' });
    s += `<line x1="350" y1="120" x2="400" y2="120" stroke="#2f5f45" stroke-width="2.4"/>` + txt(375, 108, 'Y', { size: 14, fill: '#2f5f45' });
    s += badge(227, 466, 'エ', { r: 10, size: 13 });
  }
  return svg(TW, TH, `<rect width="${TW}" height="${TH}" fill="none" stroke="${K}" stroke-width="1.5"/>` + s + `<rect width="${TW}" height="${TH}" fill="none" stroke="${K}" stroke-width="1.5"/>`);
}

// ---------- 主題図の表し方 ----------
const REGIONS = [ // 架空の6つの市町村（多角形）
  [[10, 10], [110, 10], [120, 70], [60, 95], [10, 80]], [[110, 10], [230, 10], [220, 80], [120, 70]],
  [[10, 80], [60, 95], [70, 170], [10, 170]], [[60, 95], [120, 70], [220, 80], [200, 130], [130, 170], [70, 170]],
  [[220, 80], [230, 10], [290, 10], [290, 170], [200, 130]], [[130, 170], [200, 130], [290, 170]],
];
const POP = [8, 3, 2, 12, 5, 4]; // 人口（万人・架空）
const pc = rr => [rr.reduce((a, p) => a + p[0], 0) / rr.length, rr.reduce((a, p) => a + p[1], 0) / rr.length];
function thematic(kind, mode) {
  const w = 300, h = 210;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const shade = v => v >= 10 ? '#3c6e9a' : v >= 5 ? '#8fb0cf' : v >= 3 ? '#cfdeea' : '#f3f6f9';
  REGIONS.forEach((rr, i) => {
    const d = 'M' + rr.map(p => p.join(' ')).join(' L') + ' Z';
    s += `<path d="${d}" fill="${kind === 'choro' ? shade(POP[i]) : '#f6f5f1'}" stroke="${C.ink}" stroke-width="1"/>`;
  });
  if (kind === 'dot') {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    REGIONS.forEach((rr, i) => { const [cx, cy] = pc(rr); for (let k = 0; k < POP[i] * 2; k++) { const x = cx + (rnd() - 0.5) * 50, y = cy + (rnd() - 0.5) * 36; s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="2.4" fill="${C.ink}"/>`; } });
  }
  if (kind === 'circle') REGIONS.forEach((rr, i) => { const [cx, cy] = pc(rr); s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(Math.sqrt(POP[i]) * 7)}" fill="#e9a98f" stroke="#8a3a28" stroke-width="1"/>`; });
  const T = { dot: ['ドットマップ', '点の数で分布を表す'], choro: ['階級区分図', '数値の大きさを色のこさで表す'], circle: ['図形表現図', '円などの大きさで量を表す'] }[kind];
  s += mode === 'label' ? txt(w / 2, 186, T[0], { size: 15, noHalo: true }) + txt(w / 2, 203, T[1], { size: 11.5, weight: 400, noHalo: true }) : txt(w / 2, 192, { dot: 'A', choro: 'B', circle: 'C' }[kind], { size: 16, noHalo: true });
  return svg(w, h, s);
}

// ---------- グラフの使い分け ----------
function graphs(mode) {
  const w = 600, h = 190;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  // 折れ線
  const L = [30, 45, 40, 60, 72, 68, 85];
  s += `<rect x="10" y="30" width="180" height="110" fill="#fafafa" stroke="#bbb"/>`;
  s += `<polyline points="${L.map((v, i) => `${20 + i * 27},${130 - v}`).join(' ')}" fill="none" stroke="#b33a2c" stroke-width="2.4"/>` + L.map((v, i) => `<circle cx="${20 + i * 27}" cy="${130 - v}" r="3" fill="#b33a2c"/>`).join('');
  // 棒
  const B = [80, 55, 40, 30, 20];
  s += `<rect x="210" y="30" width="180" height="110" fill="#fafafa" stroke="#bbb"/>` + B.map((v, i) => `<rect x="${222 + i * 34}" y="${136 - v}" width="22" height="${v}" fill="#3c6e9a"/>`).join('');
  // 円
  const P = [[0.45, '#3c6e9a'], [0.3, '#9dbcdc'], [0.15, '#f0cf72'], [0.1, '#e6e1d6']];
  let a0 = -Math.PI / 2; const cx = 500, cy = 85, R = 50;
  P.forEach(([v, col]) => { const a1 = a0 + v * 2 * Math.PI; s += `<path d="M${cx} ${cy} L${r1(cx + R * Math.cos(a0))} ${r1(cy + R * Math.sin(a0))} A${R} ${R} 0 ${v > 0.5 ? 1 : 0} 1 ${r1(cx + R * Math.cos(a1))} ${r1(cy + R * Math.sin(a1))} Z" fill="${col}" stroke="#fff" stroke-width="1.5"/>`; a0 = a1; });
  const lb = mode === 'label' ? [['折れ線グラフ', '移り変わり（変化）を見る'], ['棒グラフ', '量の大小をくらべる'], ['円グラフ・帯グラフ', '割合（全体の中の内わけ）を見る']] : [['ア', ''], ['イ', ''], ['ウ', '']];
  [100, 300, 500].forEach((x, i) => { s += txt(x, 160, lb[i][0], { size: mode === 'label' ? 15 : 17, noHalo: true }) + (lb[i][1] ? txt(x, 178, lb[i][1], { size: 12, weight: 400, noHalo: true }) : ''); });
  return svg(w, h, s);
}

// ---------- 調査の流れ（ルートマップの例） ----------
function routeMap() {
  const w = 420, h = 260;
  let s = `<rect width="${w}" height="${h}" fill="#fffdf6" stroke="#999"/>`;
  s += `<path d="M30 220 L150 220 L150 120 L300 120 L300 40 L390 40" fill="none" stroke="#b5513c" stroke-width="3" stroke-dasharray="8 5"/>`;
  s += `<path d="M0 230 H420 M140 0 V260 M290 0 V260 M0 130 H420 M0 50 H420" stroke="#ddd" stroke-width="10"/>`;
  s += `<path d="M30 220 L150 220 L150 120 L300 120 L300 40 L390 40" fill="none" stroke="#b5513c" stroke-width="3" stroke-dasharray="8 5"/>`;
  const P = [[30, 220, '学校（出発）'], [150, 170, '①商店街'], [225, 120, '②神社'], [300, 80, '③公園'], [390, 40, '④川の土手']];
  P.forEach(([x, y, n], i) => { s += `<circle cx="${x}" cy="${y}" r="6" fill="#fff" stroke="${C.ink}" stroke-width="2"/>` + txt(x + (i === 4 ? -8 : 10), y + (i === 0 ? -14 : i === 4 ? 18 : -12), n, { size: 13, anchor: i === 4 ? 'end' : 'start' }); });
  s += txt(w - 8, h - 12, 'ルートマップの例（歩く道順と調べる場所）', { size: 11, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

function compass() {
  const w = 260, h = 260, c = 130, R = 92;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const D = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
  D.forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 4; const big = i % 2 === 0; const x = c + R * Math.cos(a), y = c + R * Math.sin(a);
    s += `<line x1="${c}" y1="${c}" x2="${r1(c + (R - 22) * Math.cos(a))}" y2="${r1(c + (R - 22) * Math.sin(a))}" stroke="${K}" stroke-width="${big ? 3 : 1.4}"/>`;
    s += txt(x, y, n, { size: big ? 20 : 15 }); });
  s += `<circle cx="${c}" cy="${c}" r="5" fill="${K}"/>`;
  return svg(w, h, s);
}
const SYMS1 = ['shiyakusho', 'gakko', 'koko', 'yubin', 'koban', 'keisatsu', 'shobo', 'jinja', 'tera', 'toshokan', 'hakubutsukan', 'rojin', 'kojo', 'onsen', 'shiroato', 'bochi', 'sankaku'];
const SYMS2 = ['ta', 'hatake', 'kajuen', 'chabatake', 'koyoju', 'shinyoju', 'arechi'];
const SYMQ = ['yubin', 'tera', 'shobo', 'keisatsu', 'toshokan', 'rojin', 'jinja', 'shiyakusho', 'kajuen', 'ta', 'chabatake', 'shinyoju'];
const figs = {
  symBuild: symbolTable(SYMS1, 'label', 6), symLand: symbolTable(SYMS2, 'label', 7),
  symQ: symbolTable(SYMQ, 'q', 6),
  contourLabel: contourDiagram('label'), contourQ: contourDiagram('q'),
  topoLabel: topoMap('label'), topoQ: topoMap('q'),
  thDot: thematic('dot', 'label'), thChoro: thematic('choro', 'label'), thCircle: thematic('circle', 'label'),
  thDotQ: thematic('dot', 'q'), thChoroQ: thematic('choro', 'q'), thCircleQ: thematic('circle', 'q'),
  graphsLabel: graphs('label'), graphsQ: graphs('q'),
  routeMap: routeMap(), compass: compass(),
};
fs.writeFileSync('figs10.json', JSON.stringify(figs));
fs.writeFileSync('tmp/symq_order.json', JSON.stringify(SYMQ.map(k => SYM[k][0])));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));
console.log(SYMQ.map((k, i) => (i + 1) + SYM[k][0]).join(' '));
const K2 = K;

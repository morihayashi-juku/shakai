// 歴史 第3講「縄文・弥生・古墳時代」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.12));
const japan = topojson.merge(jt, jt.objects.japan.geometries);
const wl = require('world-atlas/land-50m.json');
const land = topojson.feature(wl, wl.objects.land);
const C = { ink: '#1d2a33', sea: '#eef4f8', land: '#ece8de' };
const r1 = n => Math.round(n * 10) / 10;
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 12;
  return `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/><text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 15}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };

// 遺跡の地図
const SITES = [
  ['三内丸山遺跡', 140.7, 40.81, '縄文', 'end', -9, 0],
  ['岩宿遺跡', 139.27, 36.4, '旧石器', 'end', -9, -2],
  ['稲荷山古墳', 139.48, 36.13, '古墳', 'start', 9, -6],
  ['大森貝塚', 139.73, 35.59, '縄文', 'start', 9, 4],
  ['登呂遺跡', 138.4, 34.96, '弥生', 'start', 7, 12],
  ['大仙古墳', 135.49, 34.56, '古墳', 'end', -9, 6],
  ['志賀島', 130.3, 33.67, '金印', 'end', -9, -4],
  ['吉野ヶ里遺跡', 130.38, 33.33, '弥生', 'end', -9, 6],
  ['江田船山古墳', 130.6, 32.98, '古墳', 'end', -9, 10],
  ['西都原古墳群', 131.4, 32.12, '古墳', 'start', 9, 2],
];
const COL = { 旧石器: '#7a5c3a', 縄文: '#b5513c', 弥生: '#2f6fb0', 古墳: '#3b6a4c', 金印: '#b8860b' };
function sites(mode) {
  const w = 600, h = 560;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[128.6, 30.8], [142.2, 41.6]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  const qs = 'ABCDEFGHIJ';
  SITES.forEach(([n, lo, la, k, an, dx, dy], i) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="${COL[k]}" stroke="#fff" stroke-width="1.5"/>`;
    s += mode === 'label' ? txt(x + dx, y + dy, `${n}`, { size: 13.5, anchor: an, fill: COL[k] }) : badge(x + (an === 'end' ? -18 : 18), y + dy * 0.5, qs[i], { r: 11, size: 14 });
  });
  if (mode === 'label') {
    let ly = h - 118; s += `<rect x="${w - 150}" y="${ly - 14}" width="140" height="122" fill="#fff" stroke="#999"/>`;
    Object.entries(COL).forEach(([k, c], i) => { const yy = ly + 4 + i * 22; s += `<circle cx="${w - 132}" cy="${yy}" r="6" fill="${c}"/>` + txt(w - 120, yy, k === '金印' ? '金印の発見地' : k + (k === '古墳' ? '' : '時代') + (k === '古墳' ? '（古墳時代）' : ''), { size: 12.5, anchor: 'start', noHalo: true, weight: 400 }); });
  }
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 4〜5世紀の東アジア
function eastAsia(mode) {
  const w = 520, h = 420;
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[119, 31], [136, 42.5]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.6"/><path d="${ps(path, japan)}" fill="#efe3c9" stroke="#888" stroke-width="0.6"/>`;
  const REG = [['高句麗', 126.2, 40.6, '#e7d1c8'], ['百済', 126.8, 36.1, '#d6e3ef'], ['新羅', 128.75, 36.75, '#e0e9d2'], ['加耶', 128.35, 35.1, '#efe1b8']];
  const poly = { 高句麗: [[124.2, 39.8], [125.3, 37.8], [126.1, 37.6], [127.3, 37.6], [128.7, 38.3], [129.6, 40.6], [130.6, 42.6], [128.3, 42.9], [125.6, 42.0], [124.4, 40.6]], 百済: [[125.8, 37.6], [127.3, 37.6], [127.6, 36.6], [127.6, 35.3], [127.0, 34.3], [125.9, 34.3], [126.0, 36.0]], 新羅: [[127.3, 37.6], [128.7, 38.3], [129.7, 37.0], [129.7, 35.9], [128.7, 35.6], [127.9, 35.8], [127.6, 36.6]], 加耶: [[127.6, 35.3], [127.9, 35.8], [128.7, 35.6], [129.4, 35.2], [128.8, 34.6], [127.7, 34.5]] };
  s += `<defs><clipPath id="kl${mode}"><path d="${ps(path, land)}"/></clipPath></defs><g clip-path="url(#kl${mode})">`;
  Object.entries(poly).forEach(([n, c]) => { const col = REG.find(r => r[0] === n)[3]; s += `<path d="M${c.map(ll => proj(ll).map(r1).join(' ')).join(' L')} Z" fill="${col}" fill-opacity="0.85" stroke="#8f4a2f" stroke-width="1" stroke-dasharray="3 2"/>`; });
  s += '</g>';
  const q = { 高句麗: 'A', 百済: 'B', 新羅: 'C', 加耶: 'D' };
  REG.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += mode === 'label' ? txt(x, y, n, { size: 15 }) : badge(x, y, q[n]); });
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  s += mode === 'label' ? L('倭（大和政権）', 133.2, 34.0, { size: 15, fill: '#8f4a2f' }) : badge(...proj([133.2, 34.0]), 'E');
  s += mode === 'label' ? L('中国（南朝）', 120.3, 32.2, { size: 14 }) : badge(...proj([120.3, 32.2]), 'F');
  s += L('日本海', 133.5, 39.5, { size: 13, fill: '#1f4f7a', weight: 400 }) + L('黄海', 123.3, 35.5, { size: 13, fill: '#1f4f7a', weight: 400 });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 道具・建物の絵
function icons(mode) {
  const w = 760, h = 300, cw = 190, chh = 150;
  const items = [
    ['縄文土器', g => `<path d="M-30 -40 Q-34 -50 -24 -52 L-14 -44 L-6 -54 L4 -44 L14 -54 L24 -46 L32 -52 Q36 -44 30 -38 L26 30 Q0 44 -26 30 Z" fill="#c9a27e" stroke="#5a3a24" stroke-width="1.5"/>` + Array.from({ length: 6 }, (_, k) => `<path d="M-26 ${-28 + k * 10} q6 -4 12 0 t12 0 t12 0 t12 0" fill="none" stroke="#5a3a24" stroke-width="1"/>`).join('')],
    ['弥生土器', g => `<path d="M-10 -50 L10 -50 L12 -36 Q34 -20 30 6 Q24 34 0 36 Q-24 34 -30 6 Q-34 -20 -12 -36 Z" fill="#d9946a" stroke="#7a3d1e" stroke-width="1.5"/><path d="M-12 30 L-8 44 L8 44 L12 30" fill="#d9946a" stroke="#7a3d1e" stroke-width="1.5"/>`],
    ['土偶', g => `<circle cx="0" cy="-34" r="14" fill="#c9a27e" stroke="#5a3a24" stroke-width="1.5"/><ellipse cx="-5" cy="-35" rx="4" ry="2" fill="#5a3a24"/><ellipse cx="5" cy="-35" rx="4" ry="2" fill="#5a3a24"/><path d="M-14 -20 L-34 -8 L-30 0 L-12 -6 L-16 30 L-6 44 L0 30 L6 44 L16 30 L12 -6 L30 0 L34 -8 L14 -20 Z" fill="#c9a27e" stroke="#5a3a24" stroke-width="1.5"/>`],
    ['たて穴住居', g => `<path d="M-60 30 L0 -46 L60 30 Z" fill="#b8a07a" stroke="#5a4a2a" stroke-width="1.5"/>` + Array.from({ length: 7 }, (_, k) => `<line x1="${-50 + k * 16}" y1="30" x2="0" y2="-46" stroke="#7a6a4a" stroke-width="0.8"/>`).join('') + `<path d="M-14 30 L-14 12 L14 12 L14 30" fill="#4a3a2a"/><line x1="-70" y1="30" x2="70" y2="30" stroke="#5a4a2a" stroke-width="2"/>`],
    ['石包丁', g => `<path d="M-46 10 Q0 -40 46 10 Z" fill="#a9b1b8" stroke="#444" stroke-width="1.6"/><circle cx="-10" cy="-6" r="4" fill="#fff" stroke="#444"/><circle cx="10" cy="-6" r="4" fill="#fff" stroke="#444"/>`],
    ['高床倉庫', g => `<path d="M-44 -18 L0 -52 L44 -18 Z" fill="#b8a07a" stroke="#5a4a2a" stroke-width="1.5"/><rect x="-34" y="-18" width="68" height="28" fill="#d9c49a" stroke="#5a4a2a" stroke-width="1.5"/>` + [-26, 0, 26].map(x => `<line x1="${x}" y1="10" x2="${x}" y2="42" stroke="#5a4a2a" stroke-width="3"/><ellipse cx="${x}" cy="20" rx="8" ry="3" fill="#7a6a4a"/>`).join('') + `<line x1="-50" y1="42" x2="50" y2="42" stroke="#5a4a2a" stroke-width="2"/><path d="M34 6 L50 42" stroke="#7a6a4a" stroke-width="2"/>`],
    ['銅鐸', g => `<path d="M-8 -48 Q0 -56 8 -48 L8 -40 L22 -40 L34 38 L-34 38 L-22 -40 L-8 -40 Z" fill="#7fa79a" stroke="#2f5a4f" stroke-width="1.5"/><line x1="-28" y1="-4" x2="28" y2="-4" stroke="#2f5a4f"/><line x1="-30" y1="14" x2="30" y2="14" stroke="#2f5a4f"/><line x1="0" y1="-40" x2="0" y2="38" stroke="#2f5a4f"/>`],
    ['前方後円墳', g => `<path d="M-29 -1 A39 39 0 1 1 29 -1 L48 62 L-48 62 Z" transform="translate(0 -12) scale(0.9)" fill="none" stroke="#5b8fbf" stroke-width="6" opacity="0.6"/><path d="M-22 0 A30 30 0 1 1 22 0 L38 54 L-38 54 Z" transform="translate(0 -12)" fill="#9fbf8c" stroke="#3b6a4c" stroke-width="1.5"/>`],
  ];
  const lab = mode === 'label' ? items.map(i => i[0]) : 'ABCDEFGH'.split('');
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  items.forEach(([n, draw], i) => {
    const cx = (i % 4) * cw + cw / 2, cy = Math.floor(i / 4) * chh + 66;
    s += `<g transform="translate(${cx} ${cy}) scale(0.95)">${draw()}</g>`;
    s += mode === 'label' ? txt(cx, cy + 68, n, { size: 15, noHalo: true }) : badge(cx, cy + 68, lab[i], { r: 11, size: 14 });
  });
  return svg(w, h, s);
}
const figs = { sitesLabel: sites('label'), sitesQ: sites('q'), eaLabel: eastAsia('label'), eaQ: eastAsia('q'), iconsLabel: icons('label'), iconsQ: icons('q') };
fs.writeFileSync('figs_h03.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

// 歴史 第17講「第二次世界大戦」の図
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


const arrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;





// 世界恐慌と各国の工業生産
function kyoko(mode) {
  const w = 640, h = 320;
  const Y = [1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937];
  const S = [
    ['ソ連', '#8f4a2f', [100, 131, 161, 183, 198, 238, 293, 382, 424], 'A', ''],
    ['日本', '#c0392b', [100, 95, 92, 98, 113, 128, 142, 151, 170], 'B', '6 3'],
    ['イギリス', '#3b6a4c', [100, 92, 84, 84, 88, 99, 106, 116, 124], '', '2 3'],
    ['ドイツ', '#555', [100, 86, 68, 53, 61, 80, 94, 106, 117], '', '9 4 2 4'],
    ['アメリカ', '#2563a8', [100, 81, 68, 54, 64, 66, 76, 88, 92], 'C', ''],
  ];
  const x0 = 60, y0 = 280, W = 460, H = 250, max = 450;
  const X = i => x0 + 20 + i * (W - 40) / 8, Yv = v => y0 - v / max * H;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  [0, 100, 200, 300, 400].forEach(v => { s += `<line x1="${x0}" y1="${r1(Yv(v))}" x2="${x0 + W}" y2="${r1(Yv(v))}" stroke="${v === 100 ? '#999' : '#ddd'}"/>` + txt(x0 - 6, Yv(v), String(v), { size: 11, anchor: 'end', noHalo: true, weight: 400 }); });
  S.forEach(([n, c, arr, q, dash]) => {
    s += `<path d="M${arr.map((v, i) => r1(X(i)) + ' ' + r1(Yv(v))).join('L')}" fill="none" stroke="${c}" stroke-width="2.8" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
    const ly = { 'ソ連': Yv(424), '日本': 184, 'イギリス': 203, 'ドイツ': 220, 'アメリカ': 240 }[n];
    s += (mode === 'q' && q) ? badge(X(8) + 24, ly, q, { r: 10, size: 13 }) : txt(X(8) + 8, ly, n, { size: 12.5, anchor: 'start', noHalo: true, fill: c });
  });
  Y.forEach((y, i) => { s += txt(X(i), y0 + 16, String(y), { size: 11, noHalo: true, weight: 400 }); });
  s += `<line x1="${x0}" y1="${y0}" x2="${x0 + W}" y2="${y0}" stroke="#333"/>` + txt(x0 + 4, 16, '工業生産（1929年＝100）', { size: 12.5, anchor: 'start', noHalo: true });
  s += txt(w - 4, h - 4, '国際連盟の統計などによるおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// アジア・太平洋の地図
function taiheiyo(mode) {
  const w = 700, h = 520;
  const proj = d3.geoMercator().rotate([-145, 0]).fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: [[92, -12], [-150, 56]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  const P = p => proj(p);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.6"/>`;
  const area = [[119.5, 53], [127, 50], [135, 48], [141.5, 52], [156.5, 51], [173, 53.5], [178, 51], [168, 20], [173, 5], [175, -2], [162, -11], [147, -8], [141, -3], [131, -1.5], [126, -10], [106, -8.5], [95, 3], [93, 16], [97, 26], [104, 22], [108, 22.5], [113, 24], [115, 28], [113, 31], [115, 35], [111, 37.5], [112, 41], [117, 43], [119.5, 47]];
  s += `<path d="M${area.map(p => P(p).map(r1).join(' ')).join('L')}Z" fill="rgba(192,57,43,0.10)" stroke="#c0392b" stroke-width="1.8" stroke-dasharray="7 4"/>`;
  const M = [
    ['柳条湖', 123.4, 41.8, 'A', 'end', -10, 0, '#c0392b'], ['盧溝橋', 116.2, 39.85, 'B', 'end', -10, 0, '#c0392b'], ['真珠湾', -157.95, 21.35, 'C', 'start', 10, 0, '#c0392b'],
    ['マレー半島', 102.0, 4.5, 'D', 'start', 10, 0, '#c0392b'], ['ミッドウェー', -177.37, 28.2, 'E', 'start', 10, 0, '#2563a8'], ['沖縄', 127.7, 26.3, 'F', 'end', -10, 6, '#2563a8'],
    ['広島', 132.45, 34.4, '', 'start', 8, -9, '#333'], ['長崎', 129.87, 32.75, '', 'end', -8, 9, '#333'], ['ガダルカナル島', 160.0, -9.6, '', 'start', 10, 0, '#2563a8'],
  ];
  M.forEach(([n, lo, la, q, an, dx, dy, c]) => {
    const [x, y] = P([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="${c}" stroke="#fff" stroke-width="1.3"/>`;
    s += (mode === 'q' && q) ? badge(x + dx + (an === 'end' ? -10 : 10), y + dy, q, { r: 11, size: 14 }) : txt(x + dx, y + dy, n, { size: 13, anchor: an, weight: 700 });
  });
  if (mode === 'label') s += txt(...P([126, 45]), '満州国', { size: 13.5, fill: '#8e2a1f' }) + txt(...P([110, 32]), '中国', { size: 14 }) + txt(...P([150, 40]), '太平洋', { size: 16, fill: '#2a5a8a', weight: 400 }) + txt(...P([108, 14]), 'フランス領インドシナ', { size: 11.5, weight: 400 });
  const lx = 10, ly = h - 66;
  s += `<rect x="${lx}" y="${ly}" width="270" height="56" fill="#fff" stroke="#999"/><rect x="${lx + 10}" y="${ly + 10}" width="26" height="14" fill="rgba(192,57,43,0.10)" stroke="#c0392b" stroke-dasharray="5 3"/>` + txt(lx + 44, ly + 17, '日本の最大の勢力範囲（1942年ごろ）', { size: 11.5, anchor: 'start', noHalo: true }) + `<circle cx="${lx + 16}" cy="${ly + 40}" r="5" fill="#c0392b"/>` + txt(lx + 26, ly + 40, '戦争の始まり', { size: 11.5, anchor: 'start', noHalo: true }) + `<circle cx="${lx + 120}" cy="${ly + 40}" r="5" fill="#2563a8"/>` + txt(lx + 130, ly + 40, '戦局の転換・敗戦へ', { size: 11.5, anchor: 'start', noHalo: true });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 年表 1929〜1945
function nenpyo(mode) {
  const w = 760, h = 150;
  const E = [['1929', '世界恐慌', 'A'], ['1931', '満州事変', 'B'], ['1933', '国際連盟脱退', ''], ['1937', '日中戦争', 'C'], ['1939', '第二次世界大戦', 'D'], ['1941', '太平洋戦争', 'E'], ['1945', 'ポツダム宣言受諾', '']];
  let s = `<defs>${arrowDefs('ny' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  E.forEach(([y, t, q], i) => {
    const x = 6 + i * 108;
    s += `<rect x="${x}" y="24" width="98" height="96" rx="8" fill="${i === 6 ? '#f3dccc' : '#f6efe4'}" stroke="#8f4a2f" stroke-width="1.2"/>` + txt(x + 49, 42, y + '年', { size: 13.5, noHalo: true, fill: '#8e2a1f' });
    if (mode === 'q' && q) s += badge(x + 49, 78, q, { r: 11, size: 14 });
    else { const n = t.length > 6 ? Math.ceil(t.length / 2) : 6; const parts = []; for (let k = 0; k < t.length; k += n) parts.push(t.slice(k, k + n)); parts.forEach((p, k) => { s += txt(x + 49, 78 + k * 19 - (parts.length - 1) * 9.5, p, { size: 13, noHalo: true }); }); }
    if (i < 6) s += `<line x1="${x + 99}" y1="72" x2="${x + 106}" y2="72" stroke="#8f4a2f" stroke-width="2" marker-end="url(#ny${mode})"/>`;
  });
  s += txt(w / 2, 12, '世界恐慌から敗戦まで', { size: 13.5, noHalo: true });
  return svg(w, h, s);
}
const figs = { kyokoLabel: kyoko('label'), kyokoQ: kyoko('q'), taiheiyoLabel: taiheiyo('label'), taiheiyoQ: taiheiyo('q'), nenpyoLabel: nenpyo('label'), nenpyoQ: nenpyo('q') };
fs.writeFileSync('figs_h17.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

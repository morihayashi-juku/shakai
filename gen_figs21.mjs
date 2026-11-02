// 地理 第21講「北海道地方」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import fs from 'fs';
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.12));
const prefs = topojson.feature(jt, jt.objects.japan).features;
const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33', river: '#3f7fb5' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 12;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 15}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const line = (path, coords) => ps(path, { type: 'LineString', coordinates: coords });



const arrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;

const EXT = [[139.4, 41.35], [145.9, 45.55]];
const ell = (proj, c, rx, ry, rot = 0) => { const [x, y] = proj(c); return `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${r1(x)} ${r1(y)})" fill="#cfe0ee" stroke="${C.river}" stroke-width="0.8"/>`; };
function hkBase(w, h, fill, id) {
  const proj = d3.geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: EXT });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; const isH = n === '北海道'; s += `<path d="${ps(path, f)}" fill="${isH ? fill : '#f6f5f1'}" stroke="${isH ? '#666' : '#aaa'}" stroke-width="${isH ? 0.8 : 0.4}"/>`; }
  s += ell(proj, [140.85, 42.6], 5, 4) + ell(proj, [141.33, 42.76], 4, 3) + ell(proj, [144.33, 43.62], 6, 4) + ell(proj, [144.53, 43.58], 2.5, 2.5) + ell(proj, [143.92, 44.13], 9, 2.6, -28);
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const tri = (x, y) => `<path d="M${r1(x - 7)} ${r1(y + 5)} L${r1(x)} ${r1(y - 6)} L${r1(x + 7)} ${r1(y + 5)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`;
const RIV = {
  ishikari: [[142.9, 43.68], [142.6, 43.75], [142.38, 43.75], [142.05, 43.62], [141.85, 43.45], [141.75, 43.27], [141.55, 43.22], [141.38, 43.24]],
  tokachi: [[142.75, 43.3], [142.95, 43.05], [143.25, 42.93], [143.5, 42.8], [143.66, 42.68]],
};
const CITY = [['札幌', 141.35, 43.06], ['旭川', 142.37, 43.77], ['函館', 140.73, 41.77], ['釧路', 144.38, 42.98], ['帯広', 143.2, 42.92], ['苫小牧', 141.6, 42.63], ['室蘭', 140.97, 42.32], ['網走', 144.27, 44.02], ['稚内', 141.68, 45.42], ['根室', 145.58, 43.33]];
function figMap(mode) {
  const w = 600, h = 470;
  const { s: base, proj, path, close } = hkBase(w, h, C.land, 'hm' + mode);
  let s = base;
  Object.entries(RIV).forEach(([k, c]) => { s += `<path d="${line(path, c)}" fill="none" stroke="${C.river}" stroke-width="2.4"/>`; });
  [[142.75, 42.45], [142.85, 42.72], [142.95, 42.98], [142.87, 43.66], [142.75, 43.55], [144.95, 43.95], [145.1, 44.08]].forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const B = (n, lo, la, sq) => badge(...proj([lo, la]), n, sq ? { square: true } : {});
  if (mode === 'label') {
    s += L('石狩川', 141.95, 43.66, { size: 12, fill: '#1f4f7a', anchor: 'end' }) + L('石狩平野', 141.55, 43.42, { size: 12, anchor: 'end' }) + L('上川盆地', 142.42, 43.95, { size: 11 }) + L('大雪山', 143.0, 43.75, { size: 11, anchor: 'start' });
    s += L('十勝川', 143.6, 42.9, { size: 11, fill: '#1f4f7a', anchor: 'start' }) + L('十勝平野', 143.35, 43.15, { size: 13 }) + L('日高山脈', 143.05, 42.45, { size: 12, anchor: 'start' }) + L('根釧台地', 145.0, 43.35, { size: 13 }) + L('知床半島', 145.0, 44.3, { size: 12, anchor: 'end' });
    s += L('オホーツク海', 143.5, 44.85, { size: 14, fill: '#1f4f7a' }) + L('日本海', 140.2, 43.9, { size: 14, fill: '#1f4f7a' }) + L('太平洋', 144.0, 42.2, { size: 14, fill: '#1f4f7a' }) + L('宗谷岬', 142.05, 45.5, { size: 11, anchor: 'start' }) + L('襟裳岬', 143.3, 41.92, { size: 11, anchor: 'start' });
    s += L('洞爺湖', 140.7, 42.7, { size: 10.5, fill: '#1f4f7a', anchor: 'end' }) + L('サロマ湖', 143.75, 44.25, { size: 10.5, fill: '#1f4f7a', anchor: 'end' }) + L('摩周湖', 144.6, 43.68, { size: 10.5, fill: '#1f4f7a', anchor: 'start' });
    CITY.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="3.5" fill="#333"/>`; });
    const CL = { 札幌: [-6, 10, 'end'], 旭川: [6, 8, 'start'], 函館: [6, 6, 'start'], 釧路: [0, 13, 'middle'], 帯広: [0, 14, 'middle'], 苫小牧: [6, 6, 'start'], 室蘭: [-6, 6, 'end'], 網走: [6, -6, 'start'], 稚内: [-6, 0, 'end'], 根室: [0, 12, 'middle'] };
    CITY.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); const [dx, dy, an] = CL[n]; s += txt(x + dx, y + dy, n, { size: 11, weight: 400, anchor: an }); });
  } else {
    s += B('ア', 142.1, 43.82) + B('イ', 143.6, 42.82) + B('A', 141.55, 43.42, 1) + B('B', 143.3, 43.1, 1) + B('C', 145.0, 43.35, 1) + B('D', 142.6, 42.6, 1) + B('E', 144.85, 44.3, 1) + B('F', 142.42, 43.95, 1) + B('G', 143.5, 44.75, 1);
  }
  return svg(w, h, s);
}
function figCity() {
  const w = 600, h = 470;
  const { s: base, proj, close } = hkBase(w, h, '#efe8d8', 'hc');
  let s = base + close;
  ['札幌', '旭川', '函館', '釧路', '帯広', '苫小牧'].forEach((n, i) => { const c = CITY.find(x => x[0] === n); const [x, y] = proj([c[1], c[2]]); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="3.5" fill="#333"/>` + badge(x + 14, y - 12, i + 1, { r: 11, size: 14 }); });
  return svg(w, h, s);
}
const NORM = {
  sapporo: ['札幌', '日本海側', [-3.2, -2.7, 1.1, 7.3, 13.0, 17.0, 21.1, 22.3, 18.6, 12.1, 5.2, -0.9], [108, 92, 78, 55, 56, 60, 91, 127, 142, 110, 114, 115]],
  abashiri: ['網走', 'オホーツク海側', [-5.5, -6.0, -1.9, 4.1, 8.8, 12.6, 16.8, 19.1, 16.6, 10.6, 3.6, -2.6], [55, 41, 46, 51, 57, 52, 85, 106, 113, 82, 52, 53]],
  kushiro: ['釧路', '太平洋側', [-5.4, -4.7, -0.9, 3.7, 8.1, 11.7, 15.3, 18.0, 16.0, 10.6, 4.3, -2.2], [43, 23, 59, 76, 112, 109, 121, 142, 155, 110, 65, 65]],
};
function climGraph(key, title, sub) {
  const [, , T, P] = NORM[key];
  const w = 236, h = 224, L = 38, R = 194, top = sub ? 52 : 32, bot = h - 24, H = bot - top;
  const yT = v => bot - (v + 10) / 50 * H, yP = v => bot - v / 600 * H, bw = (R - L) / 12;
  let s = `<rect x="${L}" y="${top}" width="${R - L}" height="${H}" fill="#fff" stroke="${C.ink}"/>`;
  for (let v = 0; v <= 30; v += 10) s += `<line x1="${L}" y1="${r1(yT(v))}" x2="${R}" y2="${r1(yT(v))}" stroke="#c9d3da" stroke-width="${v === 0 ? 1 : 0.6}"/>`;
  P.forEach((p, i) => { s += `<rect x="${r1(L + i * bw + 1.5)}" y="${r1(yP(p))}" width="${r1(bw - 3)}" height="${r1(bot - yP(p))}" fill="#7da7c9" stroke="#3d6688" stroke-width="0.5"/>`; });
  s += `<polyline points="${T.map((v, i) => `${r1(L + (i + 0.5) * bw)},${r1(yT(v))}`).join(' ')}" fill="none" stroke="#b33a2c" stroke-width="2.2"/>`;
  T.forEach((v, i) => { s += `<circle cx="${r1(L + (i + 0.5) * bw)}" cy="${r1(yT(v))}" r="2.3" fill="#b33a2c"/>`; });
  for (let v = -10; v <= 40; v += 10) s += txt(L - 4, yT(v), String(v), { size: 12.5, weight: 400, anchor: 'end', noHalo: true });
  for (let v = 0; v <= 600; v += 100) s += txt(R + 4, yP(v), String(v), { size: 12.5, weight: 400, anchor: 'start', noHalo: true });
  [1, 4, 7, 10].forEach(m => { s += txt(L + (m - 0.5) * bw, bot + 11, String(m), { size: 12.5, weight: 400, noHalo: true }); });
  s += txt(L - 4, top - 9, '℃', { size: 12, weight: 400, anchor: 'end', noHalo: true }) + txt(R + 4, top - 9, 'mm', { size: 12, weight: 400, anchor: 'start', noHalo: true });
  s += txt((L + R) / 2, 13, title, { size: 18, noHalo: true });
  if (sub) s += txt((L + R) / 2, 33, sub, { size: 12.5, weight: 400, noHalo: true });
  return svg(w, h, s);
}
function share(title, rows, note, hi, max = 60) {
  const w = 320, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 96, R = 290;
  let s = txt(w / 2, 14, title, { size: 16, noHalo: true });
  for (let v = 0; v <= max; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${n === hi ? '#b5513c' : '#9db7d0'}"/>` + txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, note, { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

function ind(mode) {
  const rows = mode === 'q' ? [['X', P(21, 13, 40, 16, 10)], ['Y', P(14, 45, 10, 16, 15)], ['Z', P(9, 49, 18, 12, 12)]] : [['京浜', P(9, 49, 18, 12, 12)], ['京葉', P(21, 13, 40, 16, 10)], ['北関東', P(14, 45, 10, 16, 15)]];
  return bandRows(mode === 'q' ? '関東地方の工業地帯・地域の製造品出荷額の割合' : '京浜工業地帯・京葉工業地域・北関東工業地域の製造品出荷額の割合', rows, '2019年。工業統計をもとにしたおおよその割合', 'label');
}


// 北海道の割合
function hkShare(mode) {
  const rows = [['てんさい', 100], ['じゃがいも', 80], ['小麦', 65], ['たまねぎ', 60], ['生乳', 57]];
  const w = 380, L = 96, R = 330, top = 40, rowH = 30, h = top + rows.length * rowH + 34;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '全国の生産にしめる北海道の割合', { size: 14, noHalo: true });
  for (let v = 0; v <= 100; v += 25) { const x = L + v / 100 * (R - L); s += `<line x1="${r1(x)}" y1="${top - 4}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#e1e5e8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; const lab = mode === 'q' ? (i === 0 ? 'X' : i === 4 ? 'Y' : n) : n; s += txt(L - 8, y + rowH / 2, lab, { size: 13.5, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${y + 5}" width="${r1(v / 100 * (R - L))}" height="${rowH - 10}" fill="#b5513c"/>` + txt(Math.min(L + v / 100 * (R - L) + 5, R - 44), y + rowH / 2, `約${v}%`, { size: 12, anchor: 'start', noHalo: true, fill: v > 90 ? '#fff' : C.ink }); });
  s += txt(w - 4, h - 6, '2023年ごろ。農林水産省の統計をもとにしたおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 輪作の図
function rinsaku(mode) {
  const w = 340, h = 260, cx = 170, cy = 140, R = 78, RX = 112;
  const crops = mode === 'label' ? ['小麦', 'てんさい', 'じゃがいも', '豆類'] : ['小麦', 'X', 'じゃがいも', '豆類'];
  const col = ['#efd58a', '#d6c9e6', '#e9c3a8', '#cfe0bf'];
  let s = `<defs>${arrowDefs('rk' + mode, '#555')}</defs><rect width="${w}" height="${h}" fill="#fff"/>` + txt(cx, 16, mode === 'label' ? '十勝平野の輪作（例）' : '十勝平野の農業のくふう（例）', { size: 14, noHalo: true });
  [[-90, 0], [0, 1], [90, 2], [180, 3]].forEach(([deg, i]) => { const a = deg * Math.PI / 180, x = cx + RX * Math.cos(a), y = cy + R * Math.sin(a); s += `<rect x="${r1(x - 46)}" y="${r1(y - 16)}" width="92" height="32" rx="6" fill="${col[i]}" stroke="#555"/>` + txt(x, y, crops[i], { size: 14, noHalo: true }); });
  [[-55, -35], [35, 55], [125, 145], [215, 235]].forEach(([a1, a2]) => { const p = d => [cx + (RX - 6) * Math.cos(d * Math.PI / 180), cy + (R - 6) * Math.sin(d * Math.PI / 180)]; const [x1, y1] = p(a1 - 12), [x2, y2] = p(a2 + 12); s += `<path d="M${r1(x1)} ${r1(y1)} A ${RX - 6} ${R - 6} 0 0 1 ${r1(x2)} ${r1(y2)}" fill="none" stroke="#555" stroke-width="2" marker-end="url(#rk${mode})"/>`; });
  s += txt(cx, cy - 6, '年ごとに', { size: 11.5, weight: 400, noHalo: true }) + txt(cx, cy + 10, '作物を変える', { size: 11.5, weight: 400, noHalo: true });
  return svg(w, h, s);
}
// 冬のくらしの工夫
function house(mode) {
  const w = 560, h = 260;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + `<rect x="0" y="222" width="${w}" height="38" fill="#eef3f7"/><g transform="translate(60 0)">`;
  s += `<rect x="130" y="110" width="180" height="112" fill="#f3ead8" stroke="#555"/><path d="M118 112 L220 52 L322 112 Z" fill="#9a6b4f" stroke="#555"/>`;
  s += `<rect x="150" y="135" width="44" height="36" fill="#dbe9f4" stroke="#555"/><rect x="155" y="140" width="34" height="26" fill="none" stroke="#555"/>`;
  s += `<rect x="255" y="150" width="62" height="72" fill="#e6eef2" stroke="#555"/><rect x="270" y="168" width="26" height="54" fill="#c8a27a" stroke="#555"/>`;
  s += `<rect x="78" y="176" width="38" height="30" rx="4" fill="#d9534f" stroke="#555"/><line x1="86" y1="206" x2="86" y2="222" stroke="#555" stroke-width="2"/><line x1="108" y1="206" x2="108" y2="222" stroke="#555" stroke-width="2"/>`;
  s += `<path d="M320 222 L500 222" stroke="#c0392b" stroke-width="3" stroke-dasharray="3 3"/>`;
  s += '</g>';
  const items = mode === 'label'
    ? [['急な屋根（雪が落ちやすい）', 280, 38, 'middle'], ['二重窓（熱を逃がさない）', 200, 120, 'end'], ['灯油タンク', 134, 168, 'end'], ['玄関フード（寒さをふせぐ）', 382, 140, 'start'], ['ロードヒーティング（雪をとかす）', 440, 242, 'middle']]
    : [['A', 280, 38, 'middle'], ['B', 200, 128, 'end'], ['C', 134, 168, 'end'], ['D', 390, 140, 'start'], ['E', 440, 242, 'middle']];
  items.forEach(([n, x, y, an]) => { s += mode === 'label' ? txt(x, y, n, { size: 12, anchor: an }) : badge(an === 'end' ? x - 12 : an === 'start' ? x + 12 : x, y, n, { square: true, r: 11, size: 14 }); });
  return svg(w, h, s);
}
const figs = {
  hkMapLabel: figMap('label'), hkMapQ: figMap('q'), hkCityQ: figCity(), hkShareLabel: hkShare('label'), hkShareQ: hkShare('q'),
  rinsakuLabel: rinsaku('label'), rinsakuQ: rinsaku('q'), houseLabel: house('label'), houseQ: house('q'),
};
['sapporo', 'abashiri', 'kushiro'].forEach(k => { figs['hk_' + k] = climGraph(k, NORM[k][0], NORM[k][1]); });
['kushiro', 'sapporo', 'abashiri'].forEach((k, i) => { figs['hkq_' + k] = climGraph(k, 'ABC'[i], ''); });
fs.writeFileSync('figs21.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

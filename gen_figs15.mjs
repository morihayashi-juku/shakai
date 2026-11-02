// 地理 第15講「九州地方」の図
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
const poly = c => { let p = { type: 'Polygon', coordinates: [c] }; if (d3.geoArea(p) > 2 * Math.PI) p = { type: 'Polygon', coordinates: [c.slice().reverse()] }; return p; };
const KYU = ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'];
const pf = n => prefs.find(f => f.properties.nam_ja === n);
const sub = (f, pred) => ({ ...f, geometry: { type: 'MultiPolygon', coordinates: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).filter(pp => pred(d3.geoCentroid({ type: 'Polygon', coordinates: pp }))) } });

function kyushuBase(w, h, fill, opt = {}) {
  const ext = opt.ext || [[129.4, 30.9], [132.2, 34.0]];
  const proj = d3.geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: ext });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="k${w}${h}${opt.id || ''}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#k${w}${h}${opt.id || ''})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; const isK = KYU.includes(n); const g = sub(f, c => c[1] > 29.5); s += `<path d="${ps(path, g)}" fill="${isK ? fill(n) : '#f6f5f1'}" stroke="${isK ? '#666' : '#aaa'}" stroke-width="${isK ? 0.8 : 0.4}"/>`; }
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const VOL = { 阿蘇山: [131.1, 32.88], 桜島: [130.66, 31.58], 雲仙岳: [130.29, 32.76], 霧島山: [130.87, 31.93], くじゅう連山: [131.25, 33.09] };
const tri = (x, y, k = 1) => `<path d="M${r1(x - 8 * k)} ${r1(y + 6 * k)} L${r1(x)} ${r1(y - 8 * k)} L${r1(x + 8 * k)} ${r1(y + 6 * k)} Z" fill="#b5513c" stroke="#fff" stroke-width="1"/>`;

// ---------- 1. 九州の地形と県 ----------
const CAP = { 福岡県: ['福岡市', 130.4, 33.59], 佐賀県: ['佐賀市', 130.3, 33.25], 長崎県: ['長崎市', 129.87, 32.75], 熊本県: ['熊本市', 130.74, 32.79], 大分県: ['大分市', 131.61, 33.24], 宮崎県: ['宮崎市', 131.42, 31.91], 鹿児島県: ['鹿児島市', 130.56, 31.56] };
const PLBL = { 福岡県: [130.75, 33.55], 佐賀県: [130.1, 33.33], 長崎県: [129.75, 33.0], 熊本県: [130.85, 32.5], 大分県: [131.45, 33.05], 宮崎県: [131.3, 32.3], 鹿児島県: [130.4, 31.75] };
function figTerrain(mode) {
  const w = 560, h = 620;
  const { s: base, proj, path, close } = kyushuBase(w, h, () => C.land);
  let s = base;
  // シラス台地（おおまかな範囲）
  const shirasu = [[130.25, 31.95], [130.7, 32.05], [131.15, 31.85], [131.2, 31.45], [130.95, 31.2], [130.6, 31.25], [130.3, 31.35], [130.2, 31.65], [130.25, 31.95]];
  s += `<defs><pattern id="sh${mode}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#f2e2a6"/><circle cx="3" cy="3" r="1" fill="#b0954a"/></pattern></defs>`;
  s += `<path d="${ps(path, poly(shirasu))}" fill="url(#sh${mode})" stroke="#b0954a" stroke-dasharray="3 2"/>`;
  // 平野
  const chikushi = [[130.2, 33.35], [130.6, 33.42], [130.75, 33.3], [130.5, 33.12], [130.25, 33.15], [130.2, 33.35]];
  const miyazaki = [[131.42, 32.35], [131.6, 32.3], [131.52, 31.85], [131.38, 31.8], [131.3, 32.1], [131.42, 32.35]];
  [chikushi, miyazaki].forEach(c => { s += `<path d="${ps(path, poly(c))}" fill="#d3e6c4" stroke="#7a9a6a" stroke-width="0.8"/>`; });
  // 筑後川
  s += `<path d="${line(path, [[130.94, 33.32], [130.75, 33.35], [130.52, 33.32], [130.38, 33.18]])}" fill="none" stroke="${C.river}" stroke-width="2.4"/>`;
  // 九州山地
  [[131.0, 32.55], [131.15, 32.4], [131.2, 32.2], [130.95, 32.35]].forEach(([lo, la]) => { const [x, y] = proj([lo, la]); s += `<path d="M${r1(x - 9)} ${r1(y + 6)} L${r1(x)} ${r1(y - 7)} L${r1(x + 9)} ${r1(y + 6)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`; });
  s += close;
  Object.entries(VOL).forEach(([, ll]) => { const [x, y] = proj(ll); s += tri(x, y); });
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    const vl = { 阿蘇山: [12, 0, 'start'], 桜島: [-10, 10, 'end'], 雲仙岳: [-10, -12, 'end'], 霧島山: [12, 4, 'start'], くじゅう連山: [12, -4, 'start'] };
    Object.entries(VOL).forEach(([n, ll]) => { const [x, y] = proj(ll); const d = vl[n]; s += txt(x + d[0], y + d[1], n, { size: 13, anchor: d[2], fill: '#8a2a1c' }); });
    s += L('九州山地', 131.35, 32.55, { size: 13, anchor: 'start' }) + L('筑紫平野', 130.45, 33.48, { size: 12 }) + L('筑後川', 130.85, 33.22, { size: 11, fill: '#1f4f7a' }) + L('宮崎平野', 131.75, 32.1, { size: 12, anchor: 'start' }) + L('シラス台地', 130.7, 31.38, { size: 13 });
    s += L('有明海', 130.25, 32.95, { size: 12, fill: '#1f4f7a' }) + L('日向灘', 131.95, 32.4, { size: 13, fill: '#1f4f7a' }) + L('玄界灘', 130.2, 33.85, { size: 12, fill: '#1f4f7a' });
  } else {
    const q = { 阿蘇山: 'ア', 桜島: 'イ', 雲仙岳: 'ウ', 霧島山: 'エ' };
    const vl = { 阿蘇山: [16, 0], 桜島: [-14, 12], 雲仙岳: [-14, -12], 霧島山: [16, 4] };
    Object.entries(q).forEach(([n, k]) => { const [x, y] = proj(VOL[n]); s += badge(x + vl[n][0], y + vl[n][1], k, { r: 11, size: 14 }); });
    s += badge(...proj([130.45, 33.48]), 'A', { square: true, r: 11, size: 14 }) + badge(...proj([131.8, 32.1]), 'B', { square: true, r: 11, size: 14 }) + badge(...proj([130.7, 31.38]), 'C', { square: true, r: 11, size: 14 }) + badge(...proj([130.25, 32.95]), 'X', { square: true, r: 11, size: 14 });
  }
  return svg(w, h, s);
}
function figPrefs(mode) {
  const w = 480, h = 540;
  const COLS = { 福岡県: '#f2d58a', 佐賀県: '#cfe0bf', 長崎県: '#b9cfe3', 熊本県: '#e9c3a8', 大分県: '#d6c9e6', 宮崎県: '#f0b7a4', 鹿児島県: '#e3dcc0' };
  const { s: base, proj, close } = kyushuBase(w, h, n => COLS[n], { id: 'p' + mode });
  let s = base + close;
  KYU.forEach((n, i) => {
    const [x, y] = proj(PLBL[n]);
    if (mode === 'label') s += txt(x, y - 8, n, { size: 14 }) + txt(x, y + 9, `（${CAP[n][0]}）`, { size: 11, weight: 400 });
    else s += badge(x, y, i + 1, { r: 13, size: 16 });
  });
  if (mode === 'label') { const [x, y] = proj([131.42, 31.91]); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="4" fill="${C.ink}"/>`; }
  s += txt(w - 8, h - 10, '（　）は県庁所在地。沖縄県は別に学ぶ', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

// ---------- 2. 畜産の割合 ----------
function livestock(mode) {
  const G = [['肉用若鶏（ブロイラー）', [['鹿児島', 20], ['宮崎', 20], ['岩手', 15], ['その他', 45]]], ['豚', [['鹿児島', 13], ['宮崎', 9], ['北海道', 8], ['その他', 70]]], ['肉用牛', [['北海道', 21], ['鹿児島', 13], ['宮崎', 10], ['その他', 56]]]];
  const w = 560, L = 150, R = 550, top = 36, rowH = 40, h = top + G.length * rowH + 22;
  const col = n => n === '宮崎' ? '#b5513c' : n === '鹿児島' ? '#e9a98f' : n === 'その他' ? '#eeeae0' : '#9dbcdc';
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '飼育数の都道府県別の割合', { size: 15, noHalo: true });
  G.forEach(([n, parts], i) => { const y = top + i * rowH; let x = L; s += txt(L - 8, y + 15, mode === 'label' ? n : 'PQR'[i], { size: 13, anchor: 'end', noHalo: true }); parts.forEach(([p, v]) => { const ww = v / 100 * (R - L); s += `<rect x="${r1(x)}" y="${y}" width="${r1(ww)}" height="30" fill="${col(p)}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + ww / 2, y + 15, ww > 66 ? `${p} ${v}%` : ww > 40 ? `${p}` : '', { size: ww > 66 ? 12 : 10.5, fill: p === '宮崎' ? '#fff' : C.ink, noHalo: true }); x += ww; }); });
  if (mode === 'label') s += txt(L, h - 6, '豚：鹿児島 約13%・宮崎 約9%・北海道 約8%　肉用牛：北海道 約21%・鹿児島 約13%・宮崎 約10%', { size: 10, weight: 400, anchor: 'start', noHalo: true });
  s += txt(w - 4, h + 12, '2023年ごろ。農林水産省の統計をもとにしたおおよその割合', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h + 18, s);
}
// ---------- 3. ピーマンの月別入荷（おおまかな図） ----------
function piman(mode) {
  const M = [[85, 10], [88, 8], [80, 15], [60, 30], [35, 50], [12, 70], [5, 75], [5, 75], [8, 70], [20, 55], [55, 30], [80, 12]];  // [宮崎, 茨城]（割合のイメージ）
  const w = 520, h = 250, L = 46, R = 500, T = 34, B = 206, bw = (R - L) / 12;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '東京の市場に入荷するピーマンの産地（月別）', { size: 14, noHalo: true });
  for (let v = 0; v <= 100; v += 25) { const y = B - v / 100 * (B - T); s += `<line x1="${L}" y1="${r1(y)}" x2="${R}" y2="${r1(y)}" stroke="#e1e5e8"/>` + txt(L - 6, y, v + '%', { size: 10.5, weight: 400, anchor: 'end', noHalo: true }); }
  M.forEach(([a, b], i) => { const x = L + i * bw + 4, ww = bw - 8; const ya = B - a / 100 * (B - T), yb = ya - b / 100 * (B - T), yt = T;
    s += `<rect x="${r1(x)}" y="${r1(ya)}" width="${r1(ww)}" height="${r1(B - ya)}" fill="#b5513c"/><rect x="${r1(x)}" y="${r1(yb)}" width="${r1(ww)}" height="${r1(ya - yb)}" fill="#9dbcdc"/><rect x="${r1(x)}" y="${yt}" width="${r1(ww)}" height="${r1(yb - yt)}" fill="#eeeae0"/>`;
    s += txt(x + ww / 2, B + 11, `${i + 1}月`, { size: 10.5, weight: 400, noHalo: true }); });
  const lg = [[mode === 'label' ? '宮崎県' : 'X県', '#b5513c'], [mode === 'label' ? '茨城県' : 'Y県', '#9dbcdc'], ['その他', '#eeeae0']];
  lg.forEach(([n, c], i) => { s += `<rect x="${L + i * 110}" y="${h - 22}" width="14" height="11" fill="${c}" stroke="${C.ink}" stroke-width="0.5"/>` + txt(L + i * 110 + 18, h - 16, n, { size: 12, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 8, 'おおまかな傾向を表した図', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// ---------- 4. 北九州の工業の変化 ----------
function kitakyu(mode) {
  const rows = [['1960年', [['金属', 43, '#9dbcdc'], ['機械', 9, '#e9a98f'], ['化学', 8, '#c9b3dc'], ['食料品', 17, '#a9cf98'], ['その他', 23, '#eeeae0']]], ['2019年', [['金属', 16, '#9dbcdc'], ['機械', 46, '#e9a98f'], ['化学', 6, '#c9b3dc'], ['食料品', 17, '#a9cf98'], ['その他', 15, '#eeeae0']]]];
  const w = 540, L = 70, R = 530, top = 36, rowH = 42, h = top + 2 * rowH + 22;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '北九州工業地帯（地域）の製造品出荷額の割合', { size: 14, noHalo: true });
  rows.forEach(([y, parts], i) => { let x = L; const yy = top + i * rowH; s += txt(L - 8, yy + 16, y, { size: 13, anchor: 'end', noHalo: true }); parts.forEach(([n, v, c], j) => { const ww = v / 100 * (R - L); const lab = mode === 'label' || j > 1 ? n : 'AB'[j]; s += `<rect x="${r1(x)}" y="${yy}" width="${r1(ww)}" height="32" fill="${c}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + ww / 2, yy + 16, ww > 50 ? `${lab} ${v}%` : `${v}%`, { size: 12, noHalo: true }); x += ww; }); });
  s += txt(w - 4, h - 4, '工業統計をもとにしたおおよその割合', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// ---------- 5. 沖縄の米軍基地 ----------
function okiBase() {
  const w = 520, h = 110, L = 20, R = 500, y = 40;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '日本にあるアメリカ軍専用施設の面積の割合', { size: 14, noHalo: true });
  const a = 0.7 * (R - L);
  s += `<rect x="${L}" y="${y}" width="${r1(a)}" height="34" fill="#b5513c" stroke="${C.ink}" stroke-width="0.6"/><rect x="${r1(L + a)}" y="${y}" width="${r1(R - L - a)}" height="34" fill="#eeeae0" stroke="${C.ink}" stroke-width="0.6"/>`;
  s += txt(L + a / 2, y + 17, '沖縄県　約70%', { size: 14, fill: '#fff', noHalo: true }) + txt(L + a + (R - L - a) / 2, y + 17, 'その他の都道府県', { size: 12, noHalo: true });
  s += txt(w - 4, h - 8, '防衛省の資料をもとにしたおおよその割合', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// ---------- 6. 半導体工場と自動車工場（九州の工業） ----------
function figIndustry(mode) {
  const w = 480, h = 520;
  const { s: base, proj, close } = kyushuBase(w, h, () => C.land, { id: 'i' + mode });
  let s = base + close;
  const IC = [[130.83, 32.9], [130.6, 32.95], [131.6, 33.15], [130.45, 33.35], [131.4, 32.0], [130.75, 31.75], [129.9, 33.05]];
  const CAR = [[130.65, 33.75], [130.48, 33.7], [131.65, 33.55]];
  const STEEL = [[130.82, 33.88], [131.65, 33.25]];
  IC.forEach(ll => { const [x, y] = proj(ll); s += `<rect x="${r1(x - 6)}" y="${r1(y - 6)}" width="12" height="12" fill="#3c6e9a" stroke="#fff"/>`; });
  CAR.forEach(ll => { const [x, y] = proj(ll); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="7" fill="#b5513c" stroke="#fff"/>`; });
  STEEL.forEach(ll => { const [x, y] = proj(ll); s += `<path d="M${r1(x)} ${r1(y - 8)} L${r1(x + 7)} ${r1(y + 6)} L${r1(x - 7)} ${r1(y + 6)} Z" fill="#555" stroke="#fff"/>`; });
  const [kx, ky] = proj([130.82, 33.88]); s += mode === 'label' ? txt(kx + 10, ky - 12, '北九州（八幡）', { size: 12, anchor: 'start' }) : badge(kx + 18, ky - 14, 'ア', { r: 11, size: 14 });
  const [tx, ty] = proj([130.83, 32.9]); s += mode === 'label' ? txt(tx + 10, ty - 10, '熊本（菊陽町）', { size: 12, anchor: 'start' }) : badge(tx + 18, ty - 10, 'イ', { r: 11, size: 14 });
  const lx = 14, ly = h - 86;
  s += `<rect x="${lx - 6}" y="${ly - 12}" width="220" height="80" fill="#fff" stroke="#999" rx="3"/>`;
  s += `<rect x="${lx}" y="${ly - 6}" width="12" height="12" fill="#3c6e9a"/>` + txt(lx + 18, ly, mode === 'label' ? 'IC（半導体）工場' : 'X の工場', { size: 12, anchor: 'start', noHalo: true });
  s += `<circle cx="${lx + 6}" cy="${ly + 22}" r="6" fill="#b5513c"/>` + txt(lx + 18, ly + 22, mode === 'label' ? '自動車工場' : 'Y の工場', { size: 12, anchor: 'start', noHalo: true });
  s += `<path d="M${lx + 6} ${ly + 38} L${lx + 12} ${ly + 50} L${lx} ${ly + 50} Z" fill="#555"/>` + txt(lx + 18, ly + 45, '製鉄所', { size: 12, anchor: 'start', noHalo: true });
  s += txt(w - 8, h - 10, '主な工場の例（おおまかな図）', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

const figs = {
  kyTerrainLabel: figTerrain('label'), kyTerrainQ: figTerrain('q'),
  kyPrefLabel: figPrefs('label'), kyPrefQ: figPrefs('q'),
  livestockLabel: livestock('label'), livestockQ: livestock('q'),
  pimanLabel: piman('label'), pimanQ: piman('q'),
  kitakyuLabel: kitakyu('label'), kitakyuQ: kitakyu('q'),
  okiBase: okiBase(),
  kyIndLabel: figIndustry('label'), kyIndQ: figIndustry('q'),
};
fs.writeFileSync('figs15.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

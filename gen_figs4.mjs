// 地理 第4講「アジア州」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
import * as tsimp from 'topojson-simplify';
let t50 = require('world-atlas/countries-50m.json');
t50 = tsimp.presimplify(t50); t50 = tsimp.simplify(t50, tsimp.quantile(t50, 0.45));
const countries = topojson.feature(t50, t50.objects.countries).features;
const wc = require('world-countries');
const info = {}; wc.forEach(c => { info[c.ccn3] = c; });
const rivers = JSON.parse(fs.readFileSync('data/rivers50.geojson')).features;

const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33', river: '#3f7fb5' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}${o.rot ? ` transform="rotate(${o.rot} ${r1(x)} ${r1(y)})"` : ''}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 13;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 16}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const inBox = (f, [a, b, c, d]) => { const [[x0, y0], [x1, y1]] = d3.geoBounds(f); return !(x1 < a || x0 > c || y1 < b || y0 > d) || (x0 > x1); };

// アジアの地図の土台
const BOX0 = [24, -12, 150, 56];
function asiaBase(w, h, id, fill, BOX = BOX0) {
  const ext = { type: 'MultiPoint', coordinates: [[BOX[0], BOX[1]], [BOX[2], BOX[3]]] };
  const proj = d3.geoMercator().fitExtent([[4, 4], [w - 4, h - 4]], ext);
  const path = d3.geoPath(proj);
  const [x0, y0] = proj([BOX[0], BOX[3]]), [x1, y1] = proj([BOX[2], BOX[1]]);
  let s = `<defs><clipPath id="${id}"><rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}"/></clipPath></defs>`;
  s += `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" fill="${C.sea}"/>`;
  s += `<g clip-path="url(#${id})">`;
  for (const f of countries) {
    if (!inBox(f, [BOX[0] - 5, BOX[1] - 5, BOX[2] + 5, BOX[3] + 5])) continue;
    s += `<path d="${ps(path, f)}" fill="${fill ? fill(f) : C.land}" stroke="#8a8a8a" stroke-width="0.5"/>`;
  }
  return { s, proj, path, close: `</g><rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" fill="none" stroke="${C.line}"/>` };
}

// ---------- 1. アジアの地形 ----------
const RIV = [
  ['長江', ['Chang Jiang', 'Yangtze'], [116.5, 30.2], 'ウ'],
  ['黄河', ['Huang'], [112, 38.6], 'イ'],
  ['メコン川', ['Mekong'], [105.6, 16.3], 'エ'],
  ['ガンジス川', ['Ganges'], [84.5, 23.0], 'オ'],
  ['インダス川', ['Indus'], [69.8, 28.8], 'ア'],
];
function figTerrain(mode) {
  const w = 760, h = 470;
  const { s: base, proj, path, close } = asiaBase(w, h, 'tr' + mode, null, [33, 4, 124, 47]);
  let s = base;
  const names = new Set(RIV.flatMap(r => r[1]).concat(['Tigris', 'Euphrates', 'Brahmaputra']));
  for (const f of rivers) if (names.has(f.properties.name)) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="2.2"/>`;
  // ヒマラヤ山脈（山の記号）
  const him = [[74, 35.2], [77, 33.4], [80, 30.8], [83, 29.3], [86, 28.4], [89, 28.1], [92, 27.9], [95, 28.6]];
  him.forEach(([lo, la]) => { const [x, y] = proj([lo, la]); s += `<path d="M${r1(x - 8)} ${r1(y + 6)} L${r1(x)} ${r1(y - 7)} L${r1(x + 8)} ${r1(y + 6)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`; });
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    RIV.forEach(([n, , p]) => { s += L(n, p[0], p[1], { size: 18, fill: '#1f4f7a' }); });
    s += L('チグリス川・', 39.5, 38.2, { size: 15, fill: '#1f4f7a' }) + L('ユーフラテス川', 39.5, 36.6, { size: 15, fill: '#1f4f7a' });
    s += L('ヒマラヤ山脈', 89, 30.2, { size: 17 });
    s += L('チベット高原', 87, 34.4, { size: 18 });
    s += L('デカン高原', 77.5, 16.5, { size: 16 });
    s += L('ゴビ砂漠', 105, 43.3, { size: 16 });
    s += L('アラビア半島', 46, 22, { size: 17 });
    s += L('インドシナ半島', 101.5, 12.6, { size: 15 });
    s += L('ペルシア湾', 53.2, 27.3, { size: 13, fill: '#1f4f7a' });
    s += L('ベンガル湾', 89, 15.5, { size: 15, fill: '#1f4f7a' });
    s += L('南シナ海', 114, 14, { size: 15, fill: '#1f4f7a' });
  } else {
    RIV.forEach(([, , p, k]) => { const [x, y] = proj(k === 'オ' ? [86.5, 23.6] : p); s += badge(x, y, k, { r: 14, size: 17 }); });
    const [hx, hy] = proj([89, 30.2]); s += badge(hx, hy, 'A', { square: true });
    const [tx, ty] = proj([87, 34.6]); s += badge(tx, ty, 'B', { square: true });
    const [dx, dy] = proj([77.5, 17]); s += badge(dx, dy, 'C', { square: true });
    const [ax, ay] = proj([46, 22]); s += badge(ax, ay, 'D', { square: true });
  }
  return svg(w, h, s);
}

// ---------- 2. アジアの地域区分と国 ----------
const SUB = { 'Eastern Asia': '東アジア', 'South-Eastern Asia': '東南アジア', 'Southern Asia': '南アジア', 'Western Asia': '西アジア', 'Central Asia': '中央アジア' };
const SUBCOL = { '東アジア': '#f2d58a', '東南アジア': '#a9cf98', '南アジア': '#e9a98f', '西アジア': '#d9c2a3', '中央アジア': '#a8bfdc' };
const CNT = [ // [日本語名, ccn3, ラベル位置, 問題の番号]
  ['中国', '156', [103, 35], 1], ['韓国', '410', [128, 36.4], 2], ['モンゴル', '496', [103, 46.5], 3],
  ['インド', '356', [78.5, 22], 4], ['タイ', '764', [101, 15.5], 5], ['ベトナム', '704', [106.6, 21.3], 6],
  ['マレーシア', '458', [102.2, 4.0], 7], ['インドネシア', '360', [114, -1.5], 8], ['フィリピン', '608', [122.5, 13.5], 9],
  ['サウジアラビア', '682', [44.5, 24], 10], ['アラブ首長国連邦', '784', [54.5, 23.6], 11], ['カザフスタン', '398', [67, 48], 12],
];
function subOf(f) {
  const c = info[f.id]; if (!c) return null;
  if (c.cca3 === 'TWN') return '東アジア';
  if (c.region === 'Asia') return SUB[c.subregion] || null;
  return null;
}
function figRegions(mode) {
  const w = 760, h = 560;
  const { s: base, proj, close } = asiaBase(w, h, 'rg' + mode, f => { const sb = subOf(f); return sb ? SUBCOL[sb] : '#f6f5f1'; });
  let s = base + close;
  const off = { '784': [16, 18], '410': [8, 4], '704': [-6, 0] };
  if (mode === 'label') {
    const RL = [['東アジア', 118, 42.5], ['東南アジア', 117, 6], ['南アジア', 74, 30], ['西アジア', 40, 33.5], ['中央アジア', 63, 40.5]];
    RL.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += txt(x, y, n, { size: 22, fill: '#5a3a1c' }); });
    CNT.forEach(([n, id, p]) => {
      const [x, y] = proj(p); const [dx, dy] = off[id] || [0, 0];
      if (id === '784') s += `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x + dx)}" y2="${r1(y + dy - 6)}" stroke="${C.ink}" stroke-width="0.8"/>`;
      s += txt(x + dx, y + dy + (id === '784' ? 4 : 0), n, { size: 15 });
    });
  } else {
    CNT.forEach(([, id, p, k]) => { const [x, y] = proj(p); const [dx, dy] = off[id] || [0, 0]; s += badge(x + dx, y + dy, k, { r: 14, size: k > 9 ? 14 : 17 }); });
  }
  return svg(w, h, s);
}

// ---------- 3. 季節風 ----------
function figMonsoon(season) {
  const w = 380, h = 300;
  const box = [60, -5, 145, 50];
  const proj = d3.geoMercator().fitExtent([[2, 22], [w - 2, h - 2]], { type: 'MultiPoint', coordinates: [[box[0], box[1]], [box[2], box[3]]] });
  const path = d3.geoPath(proj);
  const [x0, y0] = proj([box[0], box[3]]), [x1, y1] = proj([box[2], box[1]]);
  const id = 'ms' + season;
  let s = `<defs><clipPath id="${id}"><rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}"/></clipPath>
    <marker id="${id}a" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${season === 'summer' ? '#b5513c' : '#2f5f8a'}"/></marker></defs>`;
  s += `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of countries) { if (!inBox(f, [50, -15, 155, 60])) continue; s += `<path d="${ps(path, f)}" fill="${C.land}" stroke="#aaa" stroke-width="0.4"/>`; }
  s += `</g><rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" fill="none" stroke="${C.line}"/>`;
  const arrows = season === 'summer'
    ? [[[78, 2], [84, 22]], [[90, 4], [95, 24]], [[118, 8], [114, 26]], [[136, 22], [124, 36]], [[142, 26], [138, 38]]]
    : [[[84, 22], [78, 4]], [[98, 28], [92, 10]], [[112, 42], [114, 18]], [[124, 46], [128, 28]], [[132, 44], [142, 32]]];
  const col = season === 'summer' ? '#b5513c' : '#2f5f8a';
  arrows.forEach(([a, b]) => { const [ax, ay] = proj(a), [bx, by] = proj(b); s += `<line x1="${r1(ax)}" y1="${r1(ay)}" x2="${r1(bx)}" y2="${r1(by)}" stroke="${col}" stroke-width="5" marker-end="url(#${id}a)"/>`; });
  s += txt(w / 2, 11, season === 'summer' ? '夏（6〜8月ごろ）海 → 陸' : '冬（12〜2月ごろ）陸 → 海', { size: 16, noHalo: true });
  return svg(w, h, s);
}

// ---------- 4. 中国（農業と経済特区） ----------
function figChina(mode) {
  const w = 600, h = 480;
  const china = countries.find(f => f.id === '156');
  const twn = countries.find(f => f.id === '158');
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[73, 17], [135, 54]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="cn${mode}"><path d="${ps(path, china)}"/></clipPath></defs>`;
  s += `<rect width="${w}" height="${h}" fill="${C.sea}"/>`;
  for (const f of countries) { if (!inBox(f, [60, 10, 145, 60])) continue; s += `<path d="${ps(path, f)}" fill="#f6f5f1" stroke="#aaa" stroke-width="0.4"/>`; }
  // 農業の区分（おおまかな境界線）
  const pastoral = [[70, 56], [123, 56], [122, 50], [118, 44], [112, 41], [106, 38], [102, 35.5], [102, 31], [99, 28], [97, 20], [70, 20], [70, 56]];
  const north = [[123, 56], [140, 56], [140, 33], [121, 32.3], [118, 33.3], [113, 33.4], [107, 33.6], [104, 33.2], [102, 33], [102, 35.5], [106, 38], [112, 41], [118, 44], [122, 50], [123, 56]];
  const south = [[140, 33], [140, 15], [97, 15], [97, 20], [99, 28], [102, 31], [102, 33], [104, 33.2], [107, 33.6], [113, 33.4], [118, 33.3], [121, 32.3], [140, 33]];
  const poly = c => { let p = { type: 'Polygon', coordinates: [c] }; if (d3.geoArea(p) > 2 * Math.PI) p = { type: 'Polygon', coordinates: [c.slice().reverse()] }; return p; };
  const AG = [['牧畜', pastoral, '#e9dcc0'], ['畑作', north, '#f2d58a'], ['稲作', south, '#a9cf98']];
  s += `<g clip-path="url(#cn${mode})">`;
  AG.forEach(([, c, col]) => { s += `<path d="${ps(path, poly(c))}" fill="${col}" stroke="none"/>`; });
  s += `</g><path d="${ps(path, china)}" fill="none" stroke="${C.ink}" stroke-width="1.2"/><path d="${ps(path, twn)}" fill="#f6f5f1" stroke="#aaa" stroke-width="0.4"/>`;
  // 長江と黄河
  for (const f of rivers) if (['Chang Jiang', 'Yangtze', 'Huang'].includes(f.properties.name)) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="1.8"/>`;
  const AGL = [['牧畜', 88, 39.5, 'P'], ['畑作', 114, 37.5, 'Q'], ['稲作', 112, 27, 'R']];
  AGL.forEach(([n, lo, la, k]) => { const [x, y] = proj([lo, la]); s += mode === 'label' ? txt(x, y, n, { size: 22 }) : badge(x, y, k, { square: true, r: 15, size: 18 }); });
  // 経済特区
  const SEZ = [['シェンチェン', 114.06, 22.55], ['チューハイ', 113.55, 22.27], ['スワトウ', 116.68, 23.35], ['アモイ', 118.09, 24.48], ['ハイナン島', 109.8, 19.2]];
  SEZ.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += `<rect x="${r1(x - 6)}" y="${r1(y - 6)}" width="12" height="12" fill="#b5513c" stroke="#fff" stroke-width="1.2"/>`; });
  const CITY = [['ペキン', 116.4, 39.9, 'ア'], ['シャンハイ', 121.47, 31.23, 'イ'], ['ホンコン', 114.17, 22.3, 'ウ']];
  CITY.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.5" fill="${C.ink}" stroke="#fff" stroke-width="1"/>`; });
  if (mode === 'label') {
    const lbl = (n, lo, la, dx, dy, an = 'start') => { const [x, y] = proj([lo, la]); return txt(x + dx, y + dy, n, { size: 14, anchor: an }); };
    s += lbl('ペキン（首都）', 116.4, 39.9, 8, -10) + lbl('シャンハイ', 121.47, 31.23, 8, 0) + lbl('ホンコン', 114.17, 22.3, -14, 4, 'end');
    s += lbl('長江', 108, 30.6, 0, -10, 'middle') + lbl('黄河', 108.8, 38.8, -14, 0, 'end');
    // 凡例
    s += `<rect x="${w - 190}" y="${h - 46}" width="12" height="12" fill="#b5513c"/>` + txt(w - 172, h - 40, '経済特区', { size: 14, anchor: 'start', noHalo: true });
    s += `<circle cx="${w - 184}" cy="${h - 20}" r="5" fill="${C.ink}"/>` + txt(w - 172, h - 20, '主な都市', { size: 14, anchor: 'start', noHalo: true });
  } else {
    CITY.forEach(([n, lo, la, k]) => { const [x, y] = proj([lo, la]); const d = k === 'ウ' ? [-18, 14] : [18, -6]; s += badge(x + d[0], y + d[1], k, { r: 12, size: 15 }); });
    s += `<rect x="${w - 190}" y="${h - 40}" width="12" height="12" fill="#b5513c"/>` + txt(w - 172, h - 34, '＝ X', { size: 15, anchor: 'start', noHalo: true });
  }
  return svg(w, h, s);
}

// ---------- 5. 生産の割合（棒グラフ） ----------
function share(title, rows, note) {
  const w = 300, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 110, R = 270;
  let s = txt(w / 2, 14, title, { size: 17, noHalo: true });
  const max = 70;
  for (let v = 0; v <= 60; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => {
    const y = top + i * rowH;
    s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true });
    s += `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${i === 0 ? '#3c6e9a' : '#9db7d0'}"/>`;
    s += txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true });
  });
  s += txt(w - 4, h - 6, note, { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const NOTE = '2021年。FAOSTATをもとにしたおおよその値';
const figs = {
  terrainLabel: figTerrain('label'), terrainQ: figTerrain('q'),
  regionsLabel: figRegions('label'), regionsQ: figRegions('q'),
  monsoonSummer: figMonsoon('summer'), monsoonWinter: figMonsoon('winter'),
  chinaLabel: figChina('label'), chinaQ: figChina('q'),
  shareRice: share('米の生産', [['中国', 27], ['インド', 25], ['バングラデシュ', 7], ['インドネシア', 7], ['ベトナム', 5]], NOTE),
  shareRubber: share('天然ゴムの生産', [['タイ', 33], ['インドネシア', 22], ['ベトナム', 9], ['インド', 6], ['中国', 5]], NOTE),
  sharePalm: share('パーム油の生産', [['インドネシア', 58], ['マレーシア', 23], ['タイ', 4], ['コロンビア', 2], ['ナイジェリア', 2]], NOTE),
};
figs.shareRubberQ = share('作物 X の生産', [['タイ', 33], ['インドネシア', 22], ['ベトナム', 9], ['インド', 6], ['中国', 5]], NOTE);
figs.sharePalmQ = share('作物 Y からとれる油の生産', [['インドネシア', 58], ['マレーシア', 23], ['タイ', 4], ['コロンビア', 2], ['ナイジェリア', 2]], NOTE);
fs.writeFileSync('figs4.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

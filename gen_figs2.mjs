// 地理 第2講「日本のすがた」の図
import * as d3g from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const d3 = d3g;
const w50 = require('world-atlas/countries-50m.json');
const world50 = topojson.feature(w50, w50.objects.countries).features;
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt);
jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.25));
const prefs = topojson.feature(jt, jt.objects.japan).features;

const C = { sea: '#eef4f8', land: '#e8e4da', jp: '#cfc4a6', line: '#555', grat: '#9fb3c2', ink: '#1d2a33' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.2" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 11;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 14}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
function parts(f, pred) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const keep = polys.filter(p => pred(d3.geoCentroid({ type: 'Polygon', coordinates: p })));
  return { type: 'Feature', properties: f.properties, geometry: { type: 'MultiPolygon', coordinates: keep } };
}
function mainPart(f) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  let best = null, ba = -1;
  for (const p of polys) { const a = d3.geoArea({ type: 'Polygon', coordinates: p }); if (a > ba) { ba = a; best = p; } }
  return d3.geoCentroid({ type: 'Polygon', coordinates: best });
}
const pref = name => prefs.find(f => f.properties.nam_ja === name);

// ---------- 1. 日本と周りの国（東アジア） ----------
const ISL = { etorofu: [148.75, 45.45], okinotori: [136.07, 20.42], minamitori: [153.98, 24.29], yonaguni: [122.99, 24.46] };
function figEastAsia(mode) {
  const w = 760, h = 640;
  const ext = { type: 'MultiPoint', coordinates: [[117, 15], [158, 52]] };
  const proj = d3.geoMercator().fitExtent([[80, 10], [w - 10, h - 40]], ext);
  const path = d3.geoPath(proj);
  const [x0, y0] = proj([117, 52]), [x1, y1] = proj([158, 15]);
  let s = `<defs><clipPath id="ea${mode}"><rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}"/></clipPath></defs>`;
  s += `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(x1 - x0)}" height="${r1(y1 - y0)}" fill="${C.sea}" stroke="${C.line}"/>`;
  s += `<g clip-path="url(#ea${mode})">`;
  s += `<path d="${ps(path, d3.geoGraticule().extent([[110, 10], [160, 55]]).step([10, 10])())}" fill="none" stroke="${C.grat}" stroke-width="0.8"/>`;
  for (const f of world50) {
    if (f.properties.name === 'Japan') continue;
    const [[a, b], [c, e]] = d3.geoBounds(f); if (c < 110 || a > 165 || e < 10 || b > 56) { if (!(a < 0 && c > 0)) continue; }
    s += `<path d="${ps(path, f)}" fill="${C.land}" stroke="#888" stroke-width="0.5"/>`;
  }
  for (const f of prefs) s += `<path d="${ps(path, f)}" fill="${C.jp}" stroke="#6b6250" stroke-width="0.4"/>`;
  // 沖ノ鳥島（データにないので印で示す）
  const [ox, oy] = proj(ISL.okinotori); s += `<rect x="${r1(ox - 2.5)}" y="${r1(oy - 2.5)}" width="5" height="5" fill="${C.ink}"/>`;
  s += '</g>';
  // 緯度・経度の目もり
  for (let lo = 120; lo <= 150; lo += 10) { const [x] = proj([lo, 15]); s += txt(x, y1 + 20, `東経${lo}°`, { size: 18, weight: 400, noHalo: true }); }
  for (let la = 20; la <= 50; la += 10) { const [, y] = proj([117, la]); s += txt(x0 - 5, y, `北緯${la}°`, { size: 18, weight: 400, anchor: 'end', noHalo: true }); }
  const P = ll => proj(ll);
  const dot = ([x, y]) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="3.6" fill="${C.ink}"/>`;
  if (mode === 'label') {
    const L = [['ロシア', 133, 49], ['中国', 121, 43.5], ['北朝鮮', 126.6, 40.3], ['韓国', 127.9, 36.3], ['フィリピン', 122.5, 16.2]];
    L.forEach(([n, lo, la]) => { const [x, y] = P([lo, la]); s += txt(x, y, n, { size: 24 }); });
    const S = [['日本海', 134.3, 41.2], ['オホーツク海', 150, 50.5], ['太平洋', 148, 32], ['東シナ海', 125.3, 29.5]];
    S.forEach(([n, lo, la]) => { const [x, y] = P([lo, la]); s += txt(x, y, n, { size: 24, fill: '#24557a' }); });
    const I = [['択捉島（北端）', 'etorofu', 4, -18, 'end'], ['沖ノ鳥島（南端）', 'okinotori', 0, 22, 'middle'], ['南鳥島', 'minamitori', 0, 22, 'middle'], ['（東端）', 'minamitori', 0, 44, 'middle'], ['与那国島（西端）', 'yonaguni', 30, 24, 'middle']];
    I.forEach(([n, k, dx, dy, an]) => { const p = P(ISL[k]); if (k !== 'okinotori') s += dot(p); s += txt(p[0] + dx, p[1] + dy, n, { size: 20, anchor: an }); });
    const T = [['北方領土', 146.6, 43.2, 'start', 8, 20], ['竹島', 131.87, 37.24, 'end', -7, 0], ['尖閣諸島', 123.6, 25.8, 'end', -7, -12]];
    T.forEach(([n, lo, la, an, dx, dy]) => { const p = P([lo, la]); if (n !== '北方領土') s += dot(p); s += txt(p[0] + dx, p[1] + dy, n, { size: 19, anchor: an, weight: 700 }); });
  } else {
    const L = [['B', 133, 49], ['D', 121.5, 42], ['C', 126.8, 40.2], ['A', 128.2, 36.4]];
    L.forEach(([n, lo, la]) => { const [x, y] = P([lo, la]); s += badge(x, y, n, { square: true, r: 17, size: 21 }); });
    const S = [['②', 134.5, 40.5], ['①', 149, 50], ['④', 148, 32], ['③', 125.3, 29.5]];
    S.forEach(([n, lo, la]) => { const [x, y] = P([lo, la]); s += badge(x, y, '①②③④'.indexOf(n) + 1, { r: 17, size: 21 }); });
    const I = [['イ', 'etorofu', -22, -18], ['ウ', 'okinotori', 0, 26], ['エ', 'minamitori', 0, 26], ['ア', 'yonaguni', 0, 26]];
    I.forEach(([n, k, dx, dy]) => { const p = P(ISL[k]); if (k !== 'okinotori') s += dot(p); s += badge(p[0] + dx, p[1] + dy, n, { r: 16, size: 20 }); });
  }
  return svg(w, h, s);
}

// ---------- 2. 時差の図 ----------
// [名前, 経度, 日本が正午のときの時刻, 前日か, ラベルの段, 横ずらし]
const CITIES = [['ロサンゼルス', -120, '19時', true, 0, 0], ['ニューヨーク', -75, '22時', true, 1, 0], ['ロンドン', 0, '3時', false, 0, 0], ['カイロ', 30, '5時', false, 1, 0], ['日本（明石）', 135, '12時', false, 0, -24], ['シドニー', 150, '13時', false, 1, 10]];
function figTime(mode) {
  const w = 800, h = mode === 'label' ? 250 : 190, L = 40, R = 760, Y = 124;
  const X = lo => L + (lo + 180) / 360 * (R - L);
  let s = '';
  for (let lo = -180; lo < 180; lo += 15) s += `<rect x="${r1(X(lo))}" y="${Y - 22}" width="${r1(X(lo + 15) - X(lo))}" height="22" fill="${((lo + 180) / 15) % 2 ? '#f1f4f6' : '#e3e9ed'}"/>`;
  s += `<line x1="${L}" y1="${Y}" x2="${R}" y2="${Y}" stroke="${C.ink}" stroke-width="1.6"/>`;
  for (let lo = -180; lo <= 180; lo += 15) {
    const x = X(lo), big = lo % 45 === 0;
    s += `<line x1="${r1(x)}" y1="${Y}" x2="${r1(x)}" y2="${Y + (big ? 9 : 5)}" stroke="${C.ink}" stroke-width="1"/>`;
    if (big) s += txt(x, Y + 19, `${Math.abs(lo)}°`, { size: 13, weight: 400, noHalo: true });
  }
  s += txt(X(-90), Y + 38, '← 西経', { size: 14, noHalo: true }) + txt(X(90), Y + 38, '東経 →', { size: 14, noHalo: true });
  for (const lo of [-180, 180]) s += `<line x1="${r1(X(lo))}" y1="${Y - 30}" x2="${r1(X(lo))}" y2="${Y + 8}" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
  s += txt(L, 12, '帯1つ＝経度15度＝1時間の時差', { size: 12, weight: 400, anchor: 'start', noHalo: true });
  CITIES.forEach(([n, lo, t, prev, lv, dx]) => {
    const x = X(lo), ly = Y - 40 - lv * 36;
    s += `<circle cx="${r1(x)}" cy="${Y}" r="4.5" fill="${C.ink}"/>`;
    s += `<line x1="${r1(x)}" y1="${Y - 4}" x2="${r1(x)}" y2="${ly + 6}" stroke="${C.ink}" stroke-width="0.8"/>`;
    const lon = lo === 0 ? '経度0°' : (lo < 0 ? `西経${-lo}°` : `東経${lo}°`);
    s += txt(x + dx, ly - 4, n, { size: 14 }) + txt(x + dx, ly - 20, lon, { size: 12, weight: 400 });
    if (mode === 'label') {
      const bx = x + (dx < 0 ? -22 : dx > 0 ? 22 : 0);
      s += `<rect x="${r1(bx - 23)}" y="${Y + 52}" width="46" height="${prev ? 40 : 26}" rx="3" fill="#fff" stroke="${C.ink}" stroke-width="1"/>`;
      s += txt(bx, Y + 65, t, { size: 14, noHalo: true });
      if (prev) s += txt(bx, Y + 82, '（前日）', { size: 10, weight: 400, noHalo: true });
    }
  });
  if (mode === 'label') s += txt(L, Y + 62, '日本が', { size: 12, anchor: 'start', noHalo: true }) + txt(L, Y + 78, '正午のとき', { size: 12, anchor: 'start', noHalo: true });
  return svg(w, h, s);
}

// ---------- 3. 国の領域（断面図） ----------
function figRyoiki(mode) {
  const w = 760, h = 318;
  const coast = 190, x12 = 300, x200 = 640, sea = 170, sky = 34;
  let s = '';
  // 空
  s += `<rect x="20" y="${sky}" width="${x12 - 20}" height="${sea - 40 - sky}" fill="#e6eef5" stroke="${C.ink}" stroke-dasharray="5 3" stroke-width="1"/>`;
  // 海
  s += `<rect x="${coast}" y="${sea}" width="${w - 20 - coast}" height="60" fill="${C.sea}" stroke="none"/>`;
  s += `<path d="M20 ${sea - 40} L${coast - 40} ${sea - 40} Q${coast - 10} ${sea - 30} ${coast} ${sea} L${coast + 20} ${sea + 60} L20 ${sea + 60} Z" fill="${C.jp}" stroke="${C.ink}" stroke-width="1.2"/>`;
  s += `<line x1="${coast}" y1="${sea}" x2="${w - 20}" y2="${sea}" stroke="#4a6a85" stroke-width="1.5"/>`;
  // 区切り線
  for (const x of [x12, x200]) s += `<line x1="${x}" y1="${sea - 8}" x2="${x}" y2="${sea + 60}" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
  // 範囲の矢印
  const arrow = (xa, xb, y, label) => `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" stroke="${C.ink}" stroke-width="1.2" marker-start="url(#ah)" marker-end="url(#ah)"/>` + label;
  s = `<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 z" fill="${C.ink}"/></marker></defs>` + s;
  const yA = sea + 82, yB = sea + 112;
  const big = (x, y, t) => txt(x, y, t, { size: 18 });
  if (mode === 'label') {
    s += big((20 + x12) / 2, (sky + sea - 40) / 2, '領空');
    s += txt((20 + x12) / 2, (sky + sea - 40) / 2 + 22, '（領土と領海の上空）', { size: 12, weight: 400 });
    s += big(100, sea + 10, '領土');
    s += big((coast + x12) / 2 + 6, sea + 30, '領海');
    s += big((x12 + x200) / 2, sea + 30, '排他的経済水域');
    s += big((x200 + w - 20) / 2, sea + 30, '公海');
    s += arrow(coast, x12, yA, txt((coast + x12) / 2, yA - 11, '12海里（約22km）', { size: 12, noHalo: true }));
    s += arrow(coast, x200, yB, txt((coast + x200) / 2 + 60, yB - 11, '200海里（約370km）', { size: 12, noHalo: true }));
    s += txt(coast, yB + 18, '海岸線', { size: 12, weight: 400, noHalo: true });
  } else {
    s += badge((20 + x12) / 2, (sky + sea - 40) / 2, 'ア', { r: 14, size: 16 });
    s += badge(100, sea + 10, 'イ', { r: 14, size: 16 });
    s += badge((coast + x12) / 2 + 6, sea + 30, 'ウ', { r: 14, size: 16 });
    s += badge((x12 + x200) / 2, sea + 30, 'エ', { r: 14, size: 16 });
    s += badge((x200 + w - 20) / 2, sea + 30, 'オ', { r: 14, size: 16 });
    s += arrow(coast, x12, yA, badge((coast + x12) / 2, yA - 14, 'X', { square: true, r: 11, size: 14 }) + txt((coast + x12) / 2 + 16, yA - 14, '海里', { size: 12, anchor: 'start', noHalo: true }));
    s += arrow(coast, x200, yB, badge((coast + x200) / 2 + 40, yB - 14, 'Y', { square: true, r: 11, size: 14 }) + txt((coast + x200) / 2 + 56, yB - 14, '海里', { size: 12, anchor: 'start', noHalo: true }));
    s += txt(coast, yB + 18, '海岸線', { size: 12, weight: 400, noHalo: true });
  }
  return svg(w, h, s);
}

// ---------- 4. 7地方区分・都道府県 ----------
const REGIONS = [
  ['北海道地方', [1], '#b9cfe3', [143.2, 43.4]],
  ['東北地方', [2, 3, 4, 5, 6, 7], '#e9dfae', [140.6, 39.6]],
  ['関東地方', [8, 9, 10, 11, 12, 13, 14], '#d6a99a', [139.5, 36.15], [142.6, 35.3]],
  ['中部地方', [15, 16, 17, 18, 19, 20, 21, 22, 23], '#b4cfa2', [137.6, 36.0], [137.3, 36.5]],
  ['近畿地方', [24, 25, 26, 27, 28, 29, 30], '#f1cdd2', [135.7, 34.25], [136.3, 32.9]],
  ['中国・四国地方', [31, 32, 33, 34, 35, 36, 37, 38, 39], '#c3b5dc', [133.0, 34.5], [132.0, 36.2]],
  ['九州地方', [40, 41, 42, 43, 44, 45, 46, 47], '#ecc28f', [130.75, 32.6], [128.6, 34.2]],
];
const regionOf = id => REGIONS.find(r => r[1].includes(id));
function japanMap(opt) {
  const w = 640, h = 640;
  const mainPred = c => c[1] >= 30 && c[0] < 149.5;
  const insetPred = c => c[1] < 30 && c[0] < 132;
  const mains = prefs.map(f => parts(f, mainPred)).filter(f => f.geometry.coordinates.length);
  const proj = d3.geoMercator().fitExtent([[14, 14], [w - 14, h - 14]], { type: 'FeatureCollection', features: mains });
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/>`;
  for (const f of mains) s += `<path d="${ps(path, f)}" fill="${opt.fill(f.properties.id)}" stroke="#6b6b6b" stroke-width="${opt.prefLine ? 0.6 : 0.35}"/>`;
  // 南西諸島の囲み
  const bx = 14, by = 14, bw = 210, bh = 170;
  const ins = prefs.map(f => parts(f, insetPred)).filter(f => f.geometry.coordinates.length);
  const pi = d3.geoMercator().fitExtent([[bx + 8, by + 8], [bx + bw - 8, by + bh - 8]], { type: 'FeatureCollection', features: ins });
  const pathI = d3.geoPath(pi);
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${C.sea}" stroke="${C.ink}" stroke-width="1"/>`;
  for (const f of ins) s += `<path d="${ps(pathI, f)}" fill="${opt.fill(f.properties.id)}" stroke="#6b6b6b" stroke-width="0.35"/>`;
  if (opt.insetLabel) s += txt(bx + bw - 6, by + bh - 14, '南西諸島', { size: 17, anchor: 'end', weight: 400 });
  return { s, proj, pi, w, h };
}
function figRegions(mode) {
  const { s: base, proj, pi, w, h } = japanMap({ fill: id => regionOf(id)[2], insetLabel: true });
  let s = base;
  REGIONS.forEach(([n, , , ll, lab], i) => {
    const [x, y] = proj(ll);
    if (mode === 'label') { const [lx, ly] = proj(lab || ll); s += txt(lx, ly, n, { size: 23 }); }
    else s += badge(x, y, '①②③④⑤⑥⑦'.indexOf(['③', '⑥', '①', '⑦', '④', '②', '⑤'][i]) + 1, { r: 19, size: 23 });
  });
  if (mode === 'label') {
    const [mx, my] = proj(mainPart(pref('宮崎県')));
    s += txt(mx + 2, my + 4, '★', { size: 20 }) + txt(mx + 16, my + 30, '宮崎県', { size: 17, anchor: 'start' });
    const [ix, iy] = pi([127.7, 26.4]); s += txt(ix + 12, iy, '沖縄県', { size: 17, anchor: 'start' });
  }
  return svg(w, h, s);
}
const PREF_Q = [['ア', '宮城県'], ['イ', '愛媛県'], ['ウ', '石川県'], ['エ', '神奈川県'], ['オ', '岩手県'], ['カ', '愛知県']];
function figPrefQ() {
  const { s: base, proj, w, h } = japanMap({ fill: id => ['宮城県', '愛媛県', '石川県', '神奈川県', '岩手県', '愛知県'].includes(prefs.find(f => f.properties.id === id).properties.nam_ja) ? '#cfc4a6' : '#f3f1ea', prefLine: true });
  let s = base;
  const off = { '神奈川県': [20, 18], '宮城県': [8, 4], '愛知県': [2, 8], '愛媛県': [-4, 4] };
  PREF_Q.forEach(([k, n]) => {
    const [x, y] = proj(mainPart(pref(n))); const [dx, dy] = off[n] || [0, 0];
    s += badge(x + dx, y + dy, k, { r: 17, size: 21 });
  });
  const [mx, my] = proj(mainPart(pref('宮崎県')));
  s += txt(mx + 2, my + 4, '★', { size: 26 });
  return svg(w, h, s);
}

const figs = {
  eastAsiaLabel: figEastAsia('label'), eastAsiaQ: figEastAsia('q'),
  timeLabel: figTime('label'), timeQ: figTime('q'),
  ryoikiLabel: figRyoiki('label'), ryoikiQ: figRyoiki('q'),
  regionsLabel: figRegions('label'), regionsQ: figRegions('q'),
  prefQ: figPrefQ(),
};
fs.writeFileSync('figs2.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0) + 'KB').join('  '));

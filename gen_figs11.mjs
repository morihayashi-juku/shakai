// 地理 第11講「日本の自然環境」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const t110 = require('world-atlas/countries-110m.json');
const land110 = topojson.feature(t110, t110.objects.land);
let t50 = require('world-atlas/countries-50m.json');
t50 = tsimp.presimplify(t50); t50 = tsimp.simplify(t50, tsimp.quantile(t50, 0.45));
const countries50 = topojson.feature(t50, t50.objects.countries).features;
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.25));
const prefs = topojson.feature(jt, jt.objects.japan).features;
const rivers10 = JSON.parse(fs.readFileSync('data/rivers10.geojson')).features.filter(f => ['Tone', 'Mogami', 'Ishikari'].includes(f.properties.name));

const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33', river: '#3f7fb5', grat: '#9fb3c2' };
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
const line = (path, coords) => ps(path, { type: 'LineString', coordinates: coords });
const arrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;

// ---------- 1. 世界の造山帯 ----------
const PACIFIC_RIM = [[-70, -55], [-72, -40], [-71, -25], [-77, -8], [-79, 2], [-84, 10], [-92, 15], [-105, 20], [-113, 31], [-122, 40], [-125, 49], [-135, 58], [-150, 61], [-165, 55], [-180, 52], [168, 54], [160, 54], [155, 48], [146, 43], [141, 37], [140, 33], [135, 33], [131, 31], [127, 26], [122, 22], [121, 15], [124, 8], [127, 2], [125, -2], [118, -8], [112, -8], [105, -6], [97, 3], [95, 8], [94, 16]];
const PACIFIC_RIM2 = [[127, 2], [135, -3], [145, -6], [152, -6], [158, -9], [167, -15], [176, -20], [178, -35], [175, -41], [168, -46]];
const ALPS_HIMA = [[-9, 37], [-4, 37], [3, 43], [8, 46], [14, 47], [20, 44], [26, 42], [33, 39], [40, 39], [48, 37], [56, 31], [62, 33], [70, 36], [76, 35], [82, 30], [88, 28], [94, 28], [97, 25], [97, 18], [95, 8]];
function figBelts(mode) {
  const w = 800, h = 410;
  const proj = d3.geoNaturalEarth1().rotate([-150, 0]).fitExtent([[6, 6], [w - 6, h - 6]], { type: 'Sphere' });
  const path = d3.geoPath(proj);
  let s = `<path d="${ps(path, { type: 'Sphere' })}" fill="${C.sea}" stroke="${C.line}"/>`;
  s += `<path d="${ps(path, land110)}" fill="${C.land}" stroke="#888" stroke-width="0.5"/>`;
  s += `<path d="${line(path, PACIFIC_RIM)}" fill="none" stroke="#b5513c" stroke-width="10" stroke-opacity="0.55" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${line(path, PACIFIC_RIM2)}" fill="none" stroke="#b5513c" stroke-width="10" stroke-opacity="0.55" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${line(path, ALPS_HIMA)}" fill="none" stroke="#3c6e9a" stroke-width="10" stroke-opacity="0.55" stroke-linecap="round" stroke-linejoin="round"/>`;
  const L = (n, lo, la, o) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('環太平洋造山帯', -150, 10, { size: 18, fill: '#8a3a28' }) + L('（太平洋を囲む）', -150, 3, { size: 12, weight: 400 });
    s += L('アルプス・ヒマラヤ造山帯', 45, 50, { size: 16, fill: '#24557a' });
    const [jx, jy] = proj([138, 37]); s += txt(jx + 14, jy - 10, '日本', { size: 14, anchor: 'start' });
  } else {
    s += badge(...proj([-150, 10]), 'A', { square: true }) + badge(...proj([45, 50]), 'B', { square: true });
  }
  return svg(w, h, s);
}

// ---------- 2. 日本の地形と海流 ----------
const SHINANO = [[138.73, 35.91], [138.47, 36.25], [138.25, 36.4], [138.19, 36.65], [138.36, 36.85], [138.75, 37.13], [138.79, 37.31], [138.85, 37.45], [139.05, 37.92]];
function jpBase(w, h, id, fill, opt = {}) {
  const ext = opt.ext || [[128, 30], [146, 45.6]];
  const proj = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], { type: 'MultiPoint', coordinates: ext });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of countries50) { if (f.properties.name === 'Japan') continue; const [[a, b], [c, d]] = d3.geoBounds(f); if (c < 115 || a > 160 || d < 20 || b > 55) continue; s += `<path d="${ps(path, f)}" fill="#f2efe8" stroke="#aaa" stroke-width="0.5"/>`; }
  for (const f of prefs) { const p = { ...f, geometry: { type: 'MultiPolygon', coordinates: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).filter(pp => d3.geoCentroid({ type: 'Polygon', coordinates: pp })[1] > (opt.minLat || 30)) } }; s += `<path d="${ps(path, p)}" fill="${fill ? fill(f) : C.land}" stroke="${opt.prefLine ? '#888' : (fill ? '#999' : C.land)}" stroke-width="${opt.prefLine ? 0.5 : 0.3}"/>`; }
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const tri = (proj, [lo, la], k = 1) => { const [x, y] = proj([lo, la]); return `<path d="M${r1(x - 7 * k)} ${r1(y + 6 * k)} L${r1(x)} ${r1(y - 7 * k)} L${r1(x + 7 * k)} ${r1(y + 6 * k)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`; };
function figJapan(mode) {
  const w = 600, h = 620;
  const { s: base, proj, path, close } = jpBase(w, h, 'jt' + mode);
  let s = `<defs>${arrowDefs('wa' + mode, '#b5513c')}${arrowDefs('ca' + mode, '#2f5f8a')}</defs>` + base;
  for (const f of rivers10) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="2"/>`;
  s += `<path d="${line(path, SHINANO)}" fill="none" stroke="${C.river}" stroke-width="2"/>`;
  // 日本アルプス・奥羽山脈
  [[137.6, 36.3], [137.55, 35.9], [137.85, 35.75], [138.15, 35.5], [138.2, 35.2]].forEach(p => { s += tri(proj, p, 0.9); });
  [[140.85, 40.0], [140.75, 39.3], [140.6, 38.6], [140.2, 37.9]].forEach(p => { s += tri(proj, p, 0.9); });
  // フォッサマグナ（おおまかな位置）
  s += `<path d="${line(path, [[137.9, 37.05], [138.2, 36.4], [138.35, 35.5], [138.5, 34.9]])}" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  s += `<path d="${line(path, [[139.6, 37.9], [139.6, 36.5], [139.8, 35.4]])}" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  // 海流
  const cur = (pts, col, mk) => `<path d="${line(path, pts)}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" marker-end="url(#${mk})"/>`;
  s += cur([[127.5, 26.5], [131, 30.2], [134.5, 32.6], [138.5, 33.8], [141.5, 35.6], [144, 36.5]], '#b5513c', 'wa' + mode);  // 黒潮
  s += cur([[148, 44], [145, 41.5], [143, 39.5], [142.5, 37.5]], '#2f5f8a', 'ca' + mode);  // 親潮
  s += cur([[128.4, 33.0], [129.8, 34.6], [131.2, 36.0], [133.6, 36.8], [136.2, 38.0], [138.3, 39.8], [139.2, 42.3], [139.6, 44.2]], '#b5513c', 'wa' + mode);  // 対馬海流
  s += cur([[140.6, 47.5], [138.6, 44.8], [136.3, 42.6], [133.5, 41.0], [131.0, 39.8]], '#2f5f8a', 'ca' + mode);  // リマン海流
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('黒潮（日本海流）', 136, 31.6, { size: 14, fill: '#8a3a28' }) + L('親潮（千島海流）', 146.1, 39.2, { size: 14, fill: '#24557a' });
    s += L('対馬海流', 134.3, 37.9, { size: 14, fill: '#8a3a28' }) + L('リマン海流', 134.6, 42.6, { size: 14, fill: '#24557a' });
    s += L('日本アルプス', 136.3, 36.2, { size: 13, anchor: 'end' }) + L('奥羽山脈', 141.6, 39.4, { size: 12, anchor: 'start' });
    s += L('フォッサマグナ', 138.9, 34.4, { size: 12, anchor: 'start' });
    s += L('信濃川', 138.6, 37.75, { size: 12, fill: '#1f4f7a', anchor: 'end' }) + L('利根川', 140.5, 36.1, { size: 12, fill: '#1f4f7a', anchor: 'start' }) + L('石狩川', 141.4, 43.4, { size: 12, fill: '#1f4f7a', anchor: 'end' }) + L('最上川', 139.7, 38.8, { size: 12, fill: '#1f4f7a', anchor: 'end' });
    s += L('関東平野', 139.6, 36.0, { size: 12 }) + L('石狩平野', 141.6, 43.0, { size: 11, anchor: 'start' });
    s += L('暖流', 131, 30.9, { size: 11, fill: '#8a3a28' }) + L('寒流', 146.5, 42.6, { size: 11, fill: '#24557a' });
  } else {
    s += badge(...proj([136, 31.6]), 'ア') + badge(...proj([146.1, 39.2]), 'イ') + badge(...proj([134.3, 38.0]), 'ウ') + badge(...proj([134.6, 42.6]), 'エ');
    s += badge(...proj([136.6, 36.2]), 'A', { square: true }) + badge(...proj([141.7, 39.4]), 'B', { square: true });
    s += badge(...proj([138.3, 37.7]), 'X', { square: true, r: 11, size: 14 }) + badge(...proj([140.6, 36.1]), 'Y', { square: true, r: 11, size: 14 });
  }
  return svg(w, h, s);
}

// ---------- 3. 日本と世界の川（縦断面のおおまかな形） ----------
const RIV = [['常願寺川', 56, 2600, '#b5513c', true], ['木曽川', 229, 2400, '#c97a3c', true], ['信濃川', 367, 2400, '#8a3a28', true], ['利根川', 322, 1800, '#d9944f', true], ['セーヌ川', 780, 470, '#3c6e9a', false], ['ロアール川', 1010, 1400, '#5a87b0', false], ['コロラド川', 2330, 3100, '#2f5f45', false], ['メコン川', 4350, 4900, '#6b8e5a', false]];
function figRivers(mode) {
  const w = 600, h = 330, L = 64, R = 580, T = 30, B = 290;
  const X = km => L + km / 1300 * (R - L), Y = m => B - m / 3000 * (B - T);
  let s = `<rect width="${w}" height="${h}" fill="#fff"/><defs><clipPath id="rv${mode}"><rect x="${L}" y="${T}" width="${R - L}" height="${B - T}"/></clipPath></defs>`;
  for (let m = 0; m <= 3000; m += 500) s += `<line x1="${L}" y1="${r1(Y(m))}" x2="${R}" y2="${r1(Y(m))}" stroke="#e1e5e8"/>` + txt(L - 6, Y(m), String(m), { size: 11, weight: 400, anchor: 'end', noHalo: true });
  for (let k = 0; k <= 1300; k += 200) s += txt(X(k), B + 12, String(k), { size: 11, weight: 400, noHalo: true });
  s += txt(L - 6, T - 14, '標高(m)', { size: 11, weight: 400, anchor: 'end', noHalo: true }) + txt(R, B + 26, '河口からの距離(km)', { size: 11, weight: 400, anchor: 'end', noHalo: true });
  s += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" fill="none" stroke="#999"/><g clip-path="url(#rv${mode})">`;
  RIV.forEach(([n, len, src, col, jp]) => {
    let p = ''; for (let i = 0; i <= 60; i++) { const t = i / 60; const km = len * (1 - t); const m = src * Math.pow(1 - t, 2.2); p += (i ? ' L' : 'M') + r1(X(km)) + ' ' + r1(Y(m)); }
    s += `<path d="${p}" fill="none" stroke="${col}" stroke-width="${jp ? 2.4 : 2}" ${jp ? '' : 'stroke-dasharray="7 4"'}/>`;
  });
  s += '</g>';
  const lab = mode === 'label';
  const pos = { '常願寺川': [X(56) + 4, Y(2300), 'start'], '木曽川': [X(229) + 4, Y(1500), 'start'], '信濃川': [X(367) - 2, Y(2150), 'start'], '利根川': [X(322) + 4, Y(1150), 'start'], 'セーヌ川': [X(780) + 4, Y(470) - 8, 'start'], 'ロアール川': [X(1010) + 4, Y(1300), 'start'], 'コロラド川': [X(1300) - 4, Y(1250), 'end'], 'メコン川': [X(1300) - 4, Y(380) - 8, 'end'] };
  RIV.forEach(([n, , , col, jp]) => { const [x, y, an] = pos[n]; s += txt(x, y, n, { size: 12, anchor: an, fill: col }); });
  s += txt(w / 2, 14, '日本と世界の主な川（長さと標高のおおまかな形）', { size: 14, noHalo: true });
  return svg(w, h, s);
}

// ---------- 4. 扇状地と三角州 ----------
function figFanDelta(mode) {
  const w = 600, h = 300;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  // 山地
  s += `<path d="M0 0 H200 L170 60 L140 110 L80 140 L0 150 Z" fill="#d9ccb0" stroke="#8a6d5a"/>`;
  for (let i = 0; i < 7; i++) s += `<path d="M${20 + i * 22} ${30 + (i % 2) * 30} l10 -16 l10 16 Z" fill="#8a6d5a"/>`;
  // 扇状地
  s += `<path d="M130 115 Q170 220 280 250 Q300 170 300 120 Q220 80 130 115 Z" fill="#f2e2a6" stroke="#b0954a"/>`;
  for (const [x, y] of [[190, 150], [225, 170], [250, 140], [205, 195], [255, 205], [230, 120]]) s += `<circle cx="${x}" cy="${y + 4}" r="4" fill="none" stroke="#7a5a1c" stroke-width="1.3"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y - 4}" stroke="#7a5a1c" stroke-width="1.3"/>`;
  // 平野
  s += `<path d="M280 250 Q300 170 300 120 L470 140 L520 300 L250 300 Z" fill="#e3efd9" stroke="#9ab88a"/>`;
  // 海
  s += `<path d="M470 140 Q520 120 600 120 V300 H520 Z" fill="${C.sea}" stroke="#4a6a85"/>`;
  // 三角州
  s += `<path d="M470 160 Q505 175 530 210 Q500 230 470 222 Q455 190 470 160 Z" fill="#cfe0bf" stroke="#6f9a5a"/>`;
  // 川
  s += `<path d="M190 0 Q175 70 150 112 Q220 150 300 150 Q380 155 440 170 Q470 180 480 190" fill="none" stroke="${C.river}" stroke-width="4"/>`;
  s += `<path d="M470 185 Q500 190 528 205 M470 185 Q490 205 505 222" fill="none" stroke="${C.river}" stroke-width="2.6"/>`;
  if (mode === 'label') {
    s += txt(60, 172, '山地', { size: 16 });
    s += txt(222, 268, '扇状地', { size: 17 }) + txt(222, 286, '水はけがよく果樹園が多い', { size: 11.5, weight: 400 });
    s += txt(380, 238, '平野', { size: 16 });
    s += txt(500, 255, '三角州', { size: 17 }) + txt(500, 273, '河口にできる。水田や市街地', { size: 11.5, weight: 400 });
    s += txt(555, 145, '海', { size: 15, fill: '#24557a' });
  } else {
    s += badge(222, 268, 'ア') + badge(500, 255, 'イ');
  }
  return svg(w, h, s);
}

// ---------- 5. 気候区分と雨温図 ----------
const RG = {
  hk: ['北海道の気候', '#b9cfe3', [1]],
  js: ['日本海側の気候', '#9dbcdc', [2, 5, 6, 15, 16, 17, 18, 31, 32]],
  ch: ['内陸（中央高地）の気候', '#e9a98f', [19, 20]],
  se: ['瀬戸内の気候', '#f0cf72', [33, 34, 37, 38]],
  nw: ['南西諸島の気候', '#b9d6a3', [47]],
  pc: ['太平洋側の気候', '#e8e1cc', []],
};
const rgOf = id => { for (const [k, v] of Object.entries(RG)) if (v[2].includes(id)) return k; return 'pc'; };
const CITY = [['札幌', 141.35, 43.06, 'hk'], ['金沢', 136.66, 36.56, 'js'], ['宮崎', 131.42, 31.91, 'pc'], ['松本', 137.97, 36.24, 'ch'], ['高松', 134.04, 34.34, 'se'], ['那覇', 127.68, 26.21, 'nw']];
function figRegions(mode) {
  const w = 600, h = 600;
  const { s: base, proj, close } = jpBase(w, h, 'cr' + mode, f => RG[rgOf(f.properties.id)][1], { ext: [[127, 26], [146, 45.6]], minLat: 24, prefLine: true });
  let s = base + close;
  CITY.forEach(([n, lo, la], i) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.5" fill="#fff" stroke="${C.ink}" stroke-width="1.8"/>`;
    const d = [[10, 0, 'start'], [-8, -10, 'end'], [10, 6, 'start'], [10, -8, 'start'], [-8, 12, 'end'], [10, 0, 'start']][i];
    if (mode === 'label') s += txt(x + d[0], y + d[1], n, { size: 14, anchor: d[2] });
    else s += badge(x + d[0] + (d[2] === 'end' ? -10 : 10), y + d[1], 'ABCDEF'[i], { square: true, r: 11, size: 14 });
  });
  const keys = ['hk', 'js', 'pc', 'ch', 'se', 'nw'];
  s += `<rect x="6" y="6" width="${mode === 'label' ? 236 : 110}" height="${keys.length * 22 + 10}" fill="#fff" stroke="#999" rx="3"/>`;
  keys.forEach((k, i) => { const x = 14, y = 12 + i * 22; s += `<rect x="${x}" y="${y}" width="22" height="15" fill="${RG[k][1]}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + 28, y + 8, mode === 'label' ? RG[k][0] : 'PQRSTU'[i], { size: 13, anchor: 'start' }); });
  s += txt(w - 8, h - 10, 'おおまかな区分（都道府県ごとにぬり分け）', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}
const NORM = {
  sapporo: ['札幌', '北海道の気候', [-3.2, -2.7, 1.1, 7.3, 13.0, 17.0, 21.1, 22.3, 18.6, 12.1, 5.2, -0.9], [108, 92, 78, 55, 56, 60, 91, 127, 142, 110, 114, 115]],
  kanazawa: ['金沢', '日本海側の気候', [4.0, 4.3, 7.4, 12.5, 17.6, 21.6, 25.8, 27.3, 23.3, 17.6, 11.9, 6.7], [256, 163, 157, 144, 138, 170, 233, 179, 232, 177, 250, 301]],
  miyazaki: ['宮崎', '太平洋側の気候', [7.8, 8.9, 12.1, 16.1, 20.1, 23.1, 27.0, 27.4, 24.6, 19.9, 14.6, 9.8], [73, 96, 156, 195, 228, 516, 339, 275, 371, 197, 106, 75]],
  matsumoto: ['松本', '内陸（中央高地）の気候', [-0.4, 0.4, 4.3, 10.5, 16.0, 19.9, 23.8, 24.7, 20.6, 14.0, 7.8, 2.3], [36, 44, 80, 76, 100, 126, 138, 92, 127, 106, 55, 31]],
  takamatsu: ['高松', '瀬戸内の気候', [5.9, 6.3, 9.4, 14.7, 19.8, 23.3, 27.5, 28.6, 24.7, 19.0, 13.2, 8.1], [39, 46, 83, 76, 108, 151, 144, 86, 148, 104, 60, 38]],
  naha: ['那覇', '南西諸島の気候', [17.3, 17.5, 19.1, 21.5, 24.2, 27.2, 29.1, 29.0, 27.9, 25.5, 22.5, 19.0], [102, 115, 143, 161, 245, 284, 188, 240, 275, 179, 119, 110]],
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
  const avg = T.reduce((a, b) => a + b) / 12, sum = P.reduce((a, b) => a + b);
  return { svg: svg(w, h, s), avg, sum };
}

// ---------- 6. 冬の季節風と雪（断面のしくみ） ----------
function figWinter(mode) {
  const w = 600, h = 230;
  let s = `<defs>${arrowDefs('wm' + mode, '#2f5f8a')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<rect x="0" y="170" width="200" height="60" fill="${C.sea}"/><path d="M0 170 H200" stroke="#4a6a85"/>`;
  s += `<path d="M200 230 L200 168 L260 160 L330 80 L380 70 L430 120 L500 160 L600 165 V230 Z" fill="#e2dccb" stroke="${C.ink}"/>`;
  s += `<path d="M300 112 L330 80 L380 70 L410 100 Z" fill="#fff" stroke="#999"/>`;
  // 雲と雪
  s += `<ellipse cx="270" cy="60" rx="70" ry="26" fill="#d6dde3"/><ellipse cx="320" cy="48" rx="50" ry="22" fill="#cfd7de"/>`;
  for (let i = 0; i < 14; i++) s += txt(225 + (i % 7) * 16, 98 + Math.floor(i / 7) * 18, '＊', { size: 12, fill: '#5a7da0', noHalo: true });
  // 風
  s += `<path d="M10 120 Q100 110 200 100" fill="none" stroke="#2f5f8a" stroke-width="4" marker-end="url(#wm${mode})"/>`;
  s += `<path d="M420 60 Q500 90 590 120" fill="none" stroke="#2f5f8a" stroke-width="4" marker-end="url(#wm${mode})"/>`;
  if (mode === 'label') {
    s += txt(100, 92, '北西の季節風', { size: 14, fill: '#24557a' }) + txt(100, 200, '日本海（水蒸気をふくむ）', { size: 12 });
    s += txt(270, 140, '雪が多い', { size: 14 }) + txt(240, 220, '日本海側', { size: 14 });
    s += txt(520, 70, 'かわいた風', { size: 13, fill: '#24557a' }) + txt(540, 200, '太平洋側', { size: 14 }) + txt(540, 150, '晴れて乾燥', { size: 13 });
    s += txt(355, 205, '山地', { size: 14 });
  } else {
    s += txt(100, 92, '冬の季節風', { size: 14, fill: '#24557a' }) + badge(240, 205, 'ア') + badge(540, 200, 'イ');
  }
  return svg(w, h, s);
}

// ---------- 7. プレート ----------
function figPlates(mode) {
  const w = 600, h = 560;
  const { s: base, proj, path, close } = jpBase(w, h, 'pl' + mode, null, { ext: [[124, 24], [154, 47]], minLat: 24 });
  let s = base;
  const B = (pts, col = '#b5513c', dash = '') => `<path d="${line(path, pts)}" fill="none" stroke="${col}" stroke-width="3.2" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  s += B([[156, 50], [150, 45], [146.5, 42], [144, 39], [143.6, 36.5], [142.3, 34.6], [141.9, 32], [142.4, 28], [142.5, 24]]);  // 千島・日本海溝・伊豆小笠原海溝
  s += B([[139.4, 34.9], [138.7, 34.2], [136.5, 33.3], [134, 32.6], [132.2, 31.3], [131.2, 29.6], [129.5, 27.5], [127.5, 25], [125, 23.5]]);  // 南海トラフ・南西諸島海溝
  s += B([[141.9, 32], [140, 33.5], [139.4, 34.9]], '#b5513c');  // 相模トラフ付近
  s += B([[140.8, 46], [139.4, 42], [138.8, 39], [138.2, 37.4], [138.1, 36.3], [138.4, 35.3], [138.6, 34.9]], '#7a5ab0', '7 5');  // 北アメリカとユーラシアの境（おおまか）
  s += close;
  const P = [['太平洋プレート', 150, 36.5, 'A'], ['フィリピン海プレート', 136.5, 27.5, 'B'], ['ユーラシアプレート', 129.5, 37.5, 'C'], ['北アメリカプレート', 145.5, 45.4, 'D']];
  P.forEach(([n, lo, la, k]) => { const [x, y] = proj([lo, la]); s += mode === 'label' ? txt(x, y, n, { size: 15 }) : badge(x, y, k, { square: true }); });
  if (mode === 'label') {
    s += txt(...proj([137.3, 31.3]), '南海トラフ', { size: 13, fill: '#8a3a28' });
    s += txt(...proj([146.6, 38.6]), '日本海溝', { size: 13, fill: '#8a3a28' });
    const [mx, my] = proj([131.42, 31.91]); s += `<circle cx="${r1(mx)}" cy="${r1(my)}" r="3.5" fill="${C.ink}"/>` + txt(mx - 8, my - 10, '宮崎', { size: 12, anchor: 'end' });
  }
  s += txt(w - 8, h - 10, 'プレートの境目はおおまかな位置', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

const figs = {
  beltsLabel: figBelts('label'), beltsQ: figBelts('q'),
  jpTerrainLabel: figJapan('label'), jpTerrainQ: figJapan('q'),
  riversLabel: figRivers('label'),
  fanLabel: figFanDelta('label'), fanQ: figFanDelta('q'),
  jpClimLabel: figRegions('label'), jpClimQ: figRegions('q'),
  winterLabel: figWinter('label'), winterQ: figWinter('q'),
  platesLabel: figPlates('label'), platesQ: figPlates('q'),
};
const stats = {};
['sapporo', 'kanazawa', 'miyazaki', 'matsumoto', 'takamatsu', 'naha'].forEach(k => { const g = climGraph(k, NORM[k][0], NORM[k][1]); figs['jcg_' + k] = g.svg; stats[k] = [Math.round(g.avg * 10) / 10, Math.round(g.sum)]; });
const qord = ['takamatsu', 'kanazawa', 'naha', 'sapporo', 'miyazaki', 'matsumoto'];
qord.forEach((k, i) => { figs['jcgq_' + k] = climGraph(k, 'アイウエオカ'[i], '').svg; });
fs.writeFileSync('figs11.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));
console.log(JSON.stringify(stats));

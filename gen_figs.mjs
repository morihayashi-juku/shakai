// 地図・図をSVG文字列で作る（印刷用・白黒コピーでも読めるように明度差をつける）
import * as d3g from 'd3-geo';
const range=(a,b,s)=>{const r=[];for(let x=a;x<b;x+=s)r.push(x);return r;};
const d3={...d3g,range};
import { geoMollweide } from 'd3-geo-projection';
import * as topojson from 'topojson-client';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-110m.json');
const topo50 = require('world-atlas/countries-50m.json');
const wc = require('world-countries');

const land = topojson.feature(topo, topo.objects.land);
const countries = topojson.feature(topo, topo.objects.countries).features;
const countries50 = topojson.feature(topo50, topo50.objects.countries).features;
const regionOf = {};
wc.forEach(c => { regionOf[c.ccn3] = [c.region, c.subregion]; });

const C = {
  sea: '#eef4f8', land: '#e2ddd0', line: '#555', grat: '#9fb3c2', ink: '#1d2a33',
};
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.2" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
function pathStr(path, f) { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; }
function txt(x, y, s, o = {}) {
  const size = o.size || 13, w = o.weight || 700, anchor = o.anchor || 'middle';
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" font-weight="${w}" text-anchor="${anchor}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 10;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 13}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;

// 太平洋中心（日本の教科書に多い形）
function worldProj(w, h) {
  return d3.geoNaturalEarth1().rotate([-150, 0]).fitExtent([[6, 6], [w - 6, h - 6]], { type: 'Sphere' });
}
function baseWorld(proj, opt = {}) {
  const path = d3.geoPath(proj);
  let s = `<path d="${pathStr(path, { type: 'Sphere' })}" fill="${C.sea}" stroke="${C.line}" stroke-width="1"/>`;
  if (opt.grat) s += `<path d="${pathStr(path, d3.geoGraticule().step(opt.grat)())}" fill="none" stroke="${C.grat}" stroke-width="0.6"/>`;
  if (opt.fills) {
    for (const f of countries) s += `<path d="${pathStr(path, f)}" fill="${opt.fills(f) || C.land}" stroke="#777" stroke-width="0.35"/>`;
  } else {
    s += `<path d="${pathStr(path, land)}" fill="${C.land}" stroke="${C.line}" stroke-width="0.6"/>`;
  }
  if (opt.equator) {
    const eq = { type: 'LineString', coordinates: d3.range(-180, 181, 2).map(x => [x, 0]) };
    s += `<path d="${pathStr(path, eq)}" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-dasharray="${opt.equatorDash || ''}"/>`;
  }
  return s;
}
const P = (proj, lon, lat) => proj([lon, lat]);

// ---------- 1. 六大陸・三大洋 ----------
const continents = [
  ['ユーラシア大陸', 88, 52], ['アフリカ大陸', 18, 6], ['北アメリカ大陸', -102, 46],
  ['南アメリカ大陸', -60, -12], ['オーストラリア大陸', 134, -40], ['南極大陸', 150, -79],
];
const oceans = [['太平洋', -165, 8], ['大西洋', -12, -18], ['大西洋', -48, 30], ['インド洋', 75, -25]];
function figContinents(mode) {
  const w = 800, h = 410, proj = worldProj(w, h);
  let s = baseWorld(proj, { equator: true, equatorDash: '6 4' });
  const eqL = P(proj, 104, 0);
  if (mode === 'label') {
    continents.forEach(([n, lo, la]) => { const [x, y] = P(proj, lo, la); s += txt(x, y, n, { size: 17 }); });
    oceans.forEach(([n, lo, la]) => { const [x, y] = P(proj, lo, la); s += txt(x, y, n, { size: 19, fill: '#24557a' }); });
    s += txt(eqL[0], eqL[1] - 11, '赤道', { size: 13, weight: 700 });
  } else {
    const L = ['A', 'B', 'C', 'D', 'E', 'F'];
    const ord = [2, 5, 0, 3, 1, 4]; // 記号の割り当て（大陸の並び順と変える）
    ord.forEach((ci, i) => { const [, lo, la] = continents[ci]; const [x, y] = P(proj, lo, la); s += badge(x, y, L[i], { square: true, r: 12, size: 15 }); });
    const O = { '太平洋': 'イ', '大西洋': 'ウ', 'インド洋': 'ア' };
    oceans.forEach(([n, lo, la]) => { const [x, y] = P(proj, lo, la); s += badge(x, y, O[n], { r: 12, size: 15 }); });
    s += txt(eqL[0], eqL[1] - 11, '赤道', { size: 13 });
  }
  return svg(w, h, s);
}

// ---------- 2. 6つの州 ----------
const STATES = {
  'アジア州': '#f4e2a6', 'ヨーロッパ州': '#9db7d4', 'アフリカ州': '#e3b98f',
  '北アメリカ州': '#a7c493', '南アメリカ州': '#efd0d6', 'オセアニア州': '#b3a6cf',
};
function stateOf(f) {
  const r = regionOf[f.id];
  if (!r) { if (f.properties.name === 'Somaliland') return 'アフリカ州'; return f.properties.name === 'Kosovo' ? 'ヨーロッパ州' : 'アジア州'; }
  const [reg, sub] = r;
  if (reg === 'Asia') return 'アジア州';
  if (reg === 'Europe') return 'ヨーロッパ州';
  if (reg === 'Africa') return 'アフリカ州';
  if (reg === 'Oceania') return 'オセアニア州';
  if (reg === 'Americas') return sub === 'South America' ? '南アメリカ州' : '北アメリカ州';
  return null; // 南極
}
const stateLabel = [
  ['アジア州', 95, 42], ['ヨーロッパ州', 48, 60], ['アフリカ州', 20, 4],
  ['北アメリカ州', -103, 48], ['南アメリカ州', -60, -14], ['オセアニア州', 140, -26],
];
function figStates(mode) {
  const w = 800, h = 410, proj = worldProj(w, h);
  // フランス領ギアナは南アメリカ州の色にする
  const fills = f => {
    const st = stateOf(f); if (!st) return '#f7f7f7';
    return STATES[st];
  };
  let s = baseWorld(proj, { fills });
  // ギアナ部分を上書き
  const fr = countries.find(f => f.properties.name === 'France');
  const gu = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: fr.geometry.coordinates.filter(p => p[0][0][0] < -20) } };
  s += `<path d="${pathStr(d3.geoPath(proj), gu)}" fill="${STATES['南アメリカ州']}" stroke="#777" stroke-width="0.35"/>`;
  const nums = ['④', '①', '⑥', '③', '⑤', '②'];
  stateLabel.forEach(([n, lo, la], i) => {
    const [x, y] = P(proj, lo, la);
    if (mode === 'label') s += txt(x, y, n, { size: 17 });
    else s += badge(x, y, nums[i].replace(/[①-⑥]/, m => '①②③④⑤⑥'.indexOf(m) + 1), { r: 13, size: 16 });
  });
  if (mode === 'label') { const [x, y] = P(proj, 150, -79); s += txt(x, y, '南極大陸（どの州にも入らない）', { size: 13, weight: 400 }); }
  return svg(w, h, s);
}

// ---------- 3. 緯度・経度の地球儀 ----------
function globe(kind) {
  const w = 340, h = 330, R = 128, cx = 170, cy = 168;
  const proj = d3.geoOrthographic().scale(R).translate([cx, cy]).rotate(kind === 'lat' ? [-20, -18] : [-20, -32]).clipAngle(90);
  const path = d3.geoPath(proj);
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.sea}" stroke="${C.line}" stroke-width="1"/>`;
  s += `<path d="${pathStr(path, land)}" fill="${C.land}" stroke="#888" stroke-width="0.5"/>`;
  const line = (coords, sw, dash = '') => `<path d="${pathStr(path, { type: 'LineString', coordinates: coords })}" fill="none" stroke="${C.ink}" stroke-width="${sw}" stroke-dasharray="${dash}"/>`;
  if (kind === 'lat') {
    s += `<path d="${pathStr(path, d3.geoGraticule().stepMinor([360, 30]).extentMinor([[-180, -80], [180, 80.1]])())}" fill="none" stroke="${C.grat}" stroke-width="0.7"/>`;
    for (const la of [-60, -30, 30, 60]) s += line(d3.range(-180, 181, 3).map(x => [x, la]), 1.3);
    s += line(d3.range(-180, 181, 3).map(x => [x, 0]), 2.6);
    const lab = (la, t) => { const [x, y] = P(proj, 55, la); return txt(x + 4, y, t, { size: 13, anchor: 'start' }); };
    s += lab(60, '北緯60°') + lab(30, '北緯30°') + lab(-30, '南緯30°') + lab(-60, '南緯60°');
    const [ex, ey] = P(proj, 55, 0); s += txt(ex + 4, ey, '赤道（緯度0°）', { size: 14, anchor: 'start' });
    const [nx, ny] = P(proj, 0, 90); s += `<circle cx="${r1(nx)}" cy="${r1(ny)}" r="3.5" fill="${C.ink}"/>` + txt(nx, ny - 12, '北極点（北緯90°）', { size: 13 });
    s += txt(cx, h - 8, '緯線＝横の線（赤道と平行）', { size: 13, weight: 400, noHalo: true });
  } else {
    for (let lo = -180; lo < 180; lo += 30) s += line(d3.range(-90, 91, 3).map(y => [lo, y]), lo === 0 ? 2.6 : 1.1);
    s += line(d3.range(-180, 181, 3).map(x => [x, 0]), 0.8, '4 3');
    const [px, py] = P(proj, 0, -42); s += txt(px, py, '本初子午線', { size: 14 }) + txt(px, py + 16, '（経度0°）', { size: 12 });
    const [ex, ey] = P(proj, 60, 8); s += txt(ex, ey, '東経60°', { size: 13 });
    const [wx, wy] = P(proj, -60, 8); s += txt(wx, wy, '西経60°', { size: 13 });
    const [nx, ny] = P(proj, 0, 90); s += `<circle cx="${r1(nx)}" cy="${r1(ny)}" r="3.5" fill="${C.ink}"/>` + txt(nx, ny - 12, '北極点', { size: 13 });
    s += txt(cx, h - 8, '経線＝北極点と南極点を結ぶ縦の線', { size: 13, weight: 400, noHalo: true });
  }
  return svg(w, h, s);
}

// ---------- 4. 緯度・経度を読む地図（正距円筒・本初子午線が中央） ----------
const gridPts = [['ア', 30, 60], ['イ', -90, 30], ['ウ', -60, -30], ['エ', 150, -30]];
function figGrid() {
  const w = 800, h = 480, L = 84, T = 14, W = 700, H = 400; // 経度-180..180, 緯度90..-90 (縦は-80..80を表示)
  const proj = d3.geoEquirectangular().rotate([0, 0]).fitExtent([[L, T], [L + W, T + H]], { type: 'Polygon', coordinates: [[[-180, -80], [-180, 80], [180, 80], [180, -80], [-180, -80]]] });
  // fitExtent on polygon may wrap; set manually instead
  const kx = W / 360, ky = H / 160;
  const pr = ([lo, la]) => [L + (lo + 180) * kx, T + (80 - la) * ky];
  const proj2 = d3.geoEquirectangular().scale(kx * 180 / Math.PI).translate([L + 180 * kx, T + 80 * ky]);
  const path = d3.geoPath(proj2);
  let s = `<defs><clipPath id="gclip"><rect x="${L}" y="${T}" width="${W}" height="${H}"/></clipPath></defs>`;
  s += `<rect x="${L}" y="${T}" width="${W}" height="${H}" fill="${C.sea}" stroke="${C.line}"/>`;
  s += `<g clip-path="url(#gclip)"><path d="${pathStr(path, land)}" fill="${C.land}" stroke="#777" stroke-width="0.5"/></g>`;
  for (let lo = -150; lo <= 150; lo += 30) { const [x] = pr([lo, 0]); s += `<line x1="${r1(x)}" y1="${T}" x2="${r1(x)}" y2="${T + H}" stroke="${lo === 0 ? C.ink : C.grat}" stroke-width="${lo === 0 ? 1.8 : 0.8}"/>`; }
  for (let la = -60; la <= 60; la += 30) { const [, y] = pr([0, la]); s += `<line x1="${L}" y1="${r1(y)}" x2="${L + W}" y2="${r1(y)}" stroke="${la === 0 ? C.ink : C.grat}" stroke-width="${la === 0 ? 1.8 : 0.8}"/>`; }
  for (let lo = -180; lo <= 180; lo += 30) { const [x] = pr([lo, 0]); s += txt(x, T + H + 17, Math.abs(lo) + '°', { size: 17, weight: 400, noHalo: true }); }
  s += txt(L + W * 0.25, T + H + 44, '← 西経', { size: 19, noHalo: true }) + txt(L + W * 0.75, T + H + 44, '東経 →', { size: 19, noHalo: true });
  s += txt(L + W / 2, T + H + 44, '0°の経線', { size: 16, weight: 400, noHalo: true });
  for (let la = -60; la <= 60; la += 30) { const [, y] = pr([0, la]); s += txt(L - 6, y, la === 0 ? '0°' : (la > 0 ? '北緯' : '南緯') + Math.abs(la) + '°', { size: 17, weight: 400, anchor: 'end', noHalo: true }); }
  gridPts.forEach(([n, lo, la]) => {
    const [x, y] = pr([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.5" fill="${C.ink}"/>` + badge(x + 17, y - 17, n, { r: 14, size: 18 });
  });
  return svg(w, h, s);
}

// ---------- 5. 3つの地図（図法） ----------
const TOKYO = [139.7, 35.7];
function figMerc(label) {
  const w = 380, h = 290, LAT = 78;
  const k = (w - 12) / (2 * Math.PI);
  const proj = d3.geoMercator().rotate([-150, 0]).scale(k).translate([w / 2, h / 2]);
  const yTop = proj([150, LAT])[1], yBot = proj([150, -LAT])[1];
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="mclip${label ? 'L' : 'Q'}"><rect x="6" y="${r1(yTop)}" width="${w - 12}" height="${r1(yBot - yTop)}"/></clipPath></defs>`;
  s += `<rect x="6" y="${r1(yTop)}" width="${w - 12}" height="${r1(yBot - yTop)}" fill="${C.sea}" stroke="${C.line}"/>`;
  s += `<g clip-path="url(#mclip${label ? 'L' : 'Q'})"><path d="${pathStr(path, d3.geoGraticule().extent([[-180, -80], [180, 80.01]]).step([30, 20])())}" fill="none" stroke="${C.grat}" stroke-width="0.6"/>`;
  s += `<path d="${pathStr(path, land)}" fill="${C.land}" stroke="${C.line}" stroke-width="0.5"/>`;
  const gl = countries.find(f => f.properties.name === 'Greenland');
  s += `<path d="${pathStr(path, gl)}" fill="#c9bfa6" stroke="${C.ink}" stroke-width="0.8"/></g>`;
  if (label) { const [gx, gy] = proj([-42, 70]); s += txt(gx - 14, gy + 12, 'グリーンランド', { size: 11, anchor: 'end' }); }
  return svg(w, h, s);
}
function figAzeq(label) {
  const w = 300, h = 300;
  const proj = d3.geoAzimuthalEquidistant().rotate([-TOKYO[0], -TOKYO[1]]).clipAngle(179.5).fitExtent([[8, 8], [w - 8, h - 8]], { type: 'Sphere' });
  const path = d3.geoPath(proj);
  let s = `<path d="${pathStr(path, { type: 'Sphere' })}" fill="${C.sea}" stroke="${C.line}"/>`;
  // 中心から1万kmごとの円（目安）
  [[10000, '1万km'], [15000, '1.5万km']].forEach(([km]) => {
    const ang = km / 40000 * 360;
    s += `<path d="${pathStr(path, d3.geoCircle().center(TOKYO).radius(ang)())}" fill="none" stroke="${C.grat}" stroke-width="0.8" stroke-dasharray="3 3"/>`;
  });
  s += `<path d="${pathStr(path, land)}" fill="${C.land}" stroke="${C.line}" stroke-width="0.4"/>`;
  const [cx, cy] = proj(TOKYO);
  s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="3.5" fill="${C.ink}"/>`;
  if (label) {
    s += txt(cx + 5, cy - 10, '東京', { size: 12, anchor: 'start' });
    // 方位
    s += txt(cx, 22, '北', { size: 12 }) + txt(w - 20, cy, '東', { size: 12 }) + txt(cx, h - 20, '南', { size: 12 }) + txt(20, cy, '西', { size: 12 });
  }
  return svg(w, h, s);
}
function figMoll(label) {
  const w = 380, h = 200;
  const proj = geoMollweide().rotate([-150, 0]).fitExtent([[6, 6], [w - 6, h - 6]], { type: 'Sphere' });
  const path = d3.geoPath(proj);
  let s = `<path d="${pathStr(path, { type: 'Sphere' })}" fill="${C.sea}" stroke="${C.line}"/>`;
  s += `<path d="${pathStr(path, d3.geoGraticule().step([30, 30])())}" fill="none" stroke="${C.grat}" stroke-width="0.6"/>`;
  s += `<path d="${pathStr(path, land)}" fill="${C.land}" stroke="${C.line}" stroke-width="0.4"/>`;
  const gl = countries.find(f => f.properties.name === 'Greenland');
  s += `<path d="${pathStr(path, gl)}" fill="#c9bfa6" stroke="${C.ink}" stroke-width="0.8"/>`;
  return svg(w, h, s);
}

// ---------- 6. 面積の大きい国 ----------
const bigCountries = [ // 番号の割り当て（面積順と変える）
  ['Canada', '①', 'カナダ', -105, 58], ['Brazil', '②', 'ブラジル', -52, -10], ['Russia', '③', 'ロシア連邦', 95, 62],
  ['Australia', '④', 'オーストラリア', 134, -25], ['China', '⑤', '中国', 102, 34], ['United States of America', '⑥', 'アメリカ合衆国', -100, 39],
];
function figBig(mode) {
  const w = 800, h = 410, proj = worldProj(w, h);
  const names = new Set(bigCountries.map(b => b[0]));
  let s = baseWorld(proj, { fills: f => names.has(f.properties.name) ? '#b9ad8f' : (f.id === '010' ? '#f4f4f4' : '#ece8de') });
  bigCountries.forEach(([, num, jp, lo, la]) => {
    const [x, y] = P(proj, lo, la);
    if (mode === 'label') s += txt(x, y, jp, { size: 16 });
    else s += badge(x, y, '①②③④⑤⑥'.indexOf(num) + 1, { r: 13, size: 16 });
  });
  if (mode === 'label') {
    const jp = P(proj, 140, 37); s += txt(jp[0] + 14, jp[1] + 2, '日本', { size: 12, anchor: 'start' });
  }
  return svg(w, h, s);
}

// ---------- 7. アフリカの国境 ----------
function figAfrica() {
  const w = 300, h = 320;
  const af = countries50.filter(f => (regionOf[f.id] || [])[0] === 'Africa' || f.properties.name === 'Somaliland' || f.properties.name === 'W. Sahara');
  const proj = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], { type: 'FeatureCollection', features: af.filter(f => !['Mauritius', 'Seychelles', 'Cabo Verde', 'São Tomé and Principe', 'Comoros'].includes(f.properties.name)) });
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/>`;
  const fl = new Set(['Egypt', 'Libya', 'Sudan', 'Algeria', 'Mali', 'Niger', 'Chad', 'Mauritania', 'W. Sahara', 'Namibia', 'Botswana']);
  for (const f of countries50) {
    const [[a, b], [c, e]] = d3.geoBounds(f); if (c < -30 || a > 62 || e < -40 || b > 42) continue;
    const d = pathStr(path, f); if (!d) continue;
    s += `<path d="${d}" fill="${C.land}" stroke="#666" stroke-width="0.5"/>`;
  }
  const lab = [['エジプト', 30.5, 27], ['リビア', 15, 27], ['スーダン', 30, 15]];
  lab.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += txt(x, y, n, { size: 11 }); });
  // 北緯22度の線を強調
  const l22 = { type: 'LineString', coordinates: [[24.5, 22], [37, 22]] };
  s += `<path d="${pathStr(path, l22)}" fill="none" stroke="${C.ink}" stroke-width="2.2"/>`;
  const [qx, qy] = proj([37.5, 22]); s += txt(qx + 3, qy, '北緯22°', { size: 11, anchor: 'start' });
  return svg(w, h, s);
}

const figs = {
  continentsLabel: figContinents('label'), continentsQ: figContinents('q'),
  statesLabel: figStates('label'), statesQ: figStates('q'),
  globeLat: globe('lat'), globeLon: globe('lon'),
  grid: figGrid(),
  merc: figMerc(true), azeq: figAzeq(true), moll: figMoll(true),
  mercQ: figMerc(false), azeqQ: figAzeq(false), mollQ: figMoll(false),
  bigLabel: figBig('label'), bigQ: figBig('q'),
  africa: figAfrica(),
};
fs.mkdirSync('figs', { recursive: true });
for (const [k, v] of Object.entries(figs)) fs.writeFileSync(`figs/${k}.svg`, v);
fs.writeFileSync('figs.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0) + 'KB').join('  '));

// 東京から真東へ進むとどこに着くか（確認用）
const east = d3.geoInterpolate; // not used

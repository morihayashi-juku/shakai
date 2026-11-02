// 地理 第14講「日本の交通・通信」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const t110 = require('world-atlas/countries-110m.json');
const land110 = topojson.feature(t110, t110.objects.land);
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.25));
const prefs = topojson.feature(jt, jt.objects.japan).features;

const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33' };
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

function jpMap(w, h, ext) {
  const mains = prefs.map(f => ({ ...f, geometry: { type: 'MultiPolygon', coordinates: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).filter(pp => { const c = d3.geoCentroid({ type: 'Polygon', coordinates: pp }); return c[1] > 30.5 && c[0] < 149.5; }) } }));
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: ext });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="jc${w}${h}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#jc${w}${h})">`;
  mains.forEach(f => { s += `<path d="${ps(path, f)}" fill="#f3f0e8" stroke="#aaa" stroke-width="0.45"/>`; });
  return { s: s, proj, path, close: '</g>' };
}

// ---------- 1. 新幹線と主な交通 ----------
const ST = { 東京: [139.77, 35.68], 大宮: [139.62, 35.91], 名古屋: [136.88, 35.17], 新大阪: [135.5, 34.73], 岡山: [133.92, 34.67], 広島: [132.47, 34.4], 博多: [130.42, 33.59], 熊本: [130.69, 32.79], 鹿児島中央: [130.54, 31.58], 仙台: [140.88, 38.26], 盛岡: [141.14, 39.7], 新青森: [140.69, 40.83], 新函館北斗: [140.65, 41.9], 新潟: [139.06, 37.91], 高崎: [139.01, 36.32], 長野: [138.19, 36.64], 金沢: [136.65, 36.58], 敦賀: [136.08, 35.65], 武雄温泉: [130.02, 33.2], 長崎: [129.87, 32.75], 宮崎: [131.42, 31.92] };
const LINES = [
  ['東海道新幹線', ['東京', '名古屋', '新大阪'], '#b5513c'], ['山陽新幹線', ['新大阪', '岡山', '広島', '博多'], '#b5513c'], ['九州新幹線', ['博多', '熊本', '鹿児島中央'], '#b5513c'],
  ['東北新幹線', ['東京', '大宮', '仙台', '盛岡', '新青森'], '#3c6e9a'], ['北海道新幹線', ['新青森', '新函館北斗'], '#3c6e9a'],
  ['上越新幹線', ['大宮', '高崎', '新潟'], '#3c7a5a'], ['北陸新幹線', ['高崎', '長野', '金沢', '敦賀'], '#3c7a5a'], ['西九州新幹線', ['武雄温泉', '長崎'], '#b5513c'],
];
function figShinkansen(mode) {
  const w = 600, h = 600;
  const { s: base, proj, path, close } = jpMap(w, h, [[129, 31], [145.6, 45.4]]);
  let s = base;
  // 本州四国連絡橋
  const BR = [[[134.99, 34.6], [134.75, 34.35], [134.62, 34.23]], [[133.8, 34.47], [133.82, 34.36], [133.85, 34.3]], [[133.2, 34.4], [133.08, 34.2], [133.0, 34.07]]];
  BR.forEach(b => { s += `<path d="${line(path, b)}" fill="none" stroke="${C.ink}" stroke-width="3.4" stroke-dasharray="3 2"/>`; });
  LINES.forEach(([, st, col]) => { s += `<path d="${line(path, st.map(k => ST[k]))}" fill="none" stroke="${col}" stroke-width="4.2" stroke-linejoin="round"/>`; });
  // 青函トンネル・関門
  s += `<path d="${line(path, [[140.4, 41.15], [140.25, 41.45]])}" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>`;
  s += close;
  ['東京', '名古屋', '新大阪', '博多', '鹿児島中央', '仙台', '新青森', '新函館北斗', '新潟', '金沢', '長崎', '宮崎'].forEach(k => { const [x, y] = proj(ST[k]); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${k === '宮崎' ? 4 : 3.6}" fill="#fff" stroke="${C.ink}" stroke-width="1.6"/>`; });
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('東京', 140.1, 35.5, { size: 12, anchor: 'start' }) + L('名古屋', 136.9, 35.45, { size: 12 }) + L('新大阪', 135.6, 35.0, { size: 12 }) + L('博多', 130.25, 33.85, { size: 12, anchor: 'end' }) + L('鹿児島中央', 130.3, 31.35, { size: 12, anchor: 'end' }) + L('仙台', 141.15, 38.25, { size: 12, anchor: 'start' }) + L('新青森', 141.0, 40.85, { size: 12, anchor: 'start' }) + L('新函館北斗', 141.0, 41.95, { size: 12, anchor: 'start' }) + L('新潟', 139.0, 38.15, { size: 12, anchor: 'end' }) + L('金沢', 136.45, 36.8, { size: 12, anchor: 'end' }) + L('長崎', 129.75, 32.55, { size: 12, anchor: 'end' }) + L('宮崎', 131.65, 31.92, { size: 12, anchor: 'start' });
    s += L('東海道新幹線', 137.6, 34.55, { size: 12, fill: '#8a3a28' }) + L('山陽新幹線', 133.0, 35.15, { size: 12, fill: '#8a3a28' }) + L('九州新幹線', 129.9, 32.3, { size: 11, fill: '#8a3a28', anchor: 'end' });
    s += L('東北新幹線', 142.2, 39.4, { size: 12, fill: '#24557a', anchor: 'start' }) + L('北陸新幹線', 137.6, 37.15, { size: 11, fill: '#2f5f45' }) + L('上越新幹線', 138.2, 37.35, { size: 11, fill: '#2f5f45', anchor: 'start' });
    s += L('青函トンネル', 139.6, 41.35, { size: 11, anchor: 'end' }) + L('本州四国連絡橋', 133.6, 33.75, { size: 12 });
  } else {
    s += badge(...proj([137.6, 34.5]), 'ア') + badge(...proj([133.0, 35.15]), 'イ') + badge(...proj([129.8, 32.3]), 'ウ') + badge(...proj([142.0, 39.4]), 'エ') + badge(...proj([137.6, 37.15]), 'オ');
    s += badge(...proj([139.7, 41.4]), 'X', { square: true }) + badge(...proj([133.6, 33.7]), 'Y', { square: true });
  }
  s += txt(w - 8, h - 12, '主な新幹線（おおまかな図）。点線は本州四国連絡橋', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

// ---------- 2. 時間距離の短縮 ----------
function timeFig() {
  const D = [['1889年', '東海道線が全線開通', 20], ['1958年', '特急「こだま」', 6.8], ['1964年', '東海道新幹線が開業', 4], ['現在', '新幹線「のぞみ」', 2.4]];
  const w = 520, L = 150, R = 420, rowH = 34, top = 38, h = top + D.length * rowH + 30;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '東京〜大阪の移動時間の変化', { size: 15, noHalo: true });
  for (let v = 0; v <= 20; v += 5) { const x = L + v / 20 * (R - L); s += `<line x1="${r1(x)}" y1="${top - 4}" x2="${r1(x)}" y2="${top + D.length * rowH}" stroke="#e1e5e8"/>` + txt(x, top + D.length * rowH + 11, v, { size: 11, weight: 400, noHalo: true }); }
  s += txt(R + 6, top + D.length * rowH + 11, '時間', { size: 11, weight: 400, anchor: 'start', noHalo: true });
  D.forEach(([y, n, v], i) => { const yy = top + i * rowH; s += txt(L - 8, yy + 10, y, { size: 13, anchor: 'end', noHalo: true }) + txt(L - 8, yy + 25, n, { size: 10.5, weight: 400, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${yy + 5}" width="${r1(v / 20 * (R - L))}" height="${rowH - 10}" fill="${i === 3 ? '#b5513c' : '#9db7d0'}"/>` + txt(L + v / 20 * (R - L) + 5, yy + rowH / 2, v === 2.4 ? '約2時間20分' : v === 6.8 ? '約6時間50分' : `約${v}時間`, { size: 12, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 4, 'おおよその時間', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

// ---------- 3. 国内の貨物輸送の割合 ----------
function cargoFig(mode) {
  const rows = [['1960年', [['鉄道', 39, '#9dbcdc'], ['自動車', 15, '#e9a98f'], ['船', 46, '#a9cf98']]], ['2020年', [['鉄道', 5, '#9dbcdc'], ['自動車', 55, '#e9a98f'], ['船', 40, '#a9cf98']]]];
  const w = 520, L = 70, R = 510, top = 36, rowH = 42, h = top + rows.length * rowH + 22;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '国内の貨物輸送の割合（輸送量×距離）', { size: 15, noHalo: true });
  rows.forEach(([y, parts], i) => { let x = L; const yy = top + i * rowH; s += txt(L - 8, yy + 16, y, { size: 13, anchor: 'end', noHalo: true }); parts.forEach(([n, v, col], j) => { const ww = v / 100 * (R - L); s += `<rect x="${r1(x)}" y="${yy}" width="${r1(ww)}" height="32" fill="${col}" stroke="${C.ink}" stroke-width="0.6"/>`; s += txt(x + ww / 2, yy + 16, ww > 60 ? `${mode === 'label' ? n : 'ABC'[j]} ${v}%` : `${v}%`, { size: 12, noHalo: true }); x += ww; }); });
  if (mode === 'q') s += txt(L, h - 6, '※航空はわずかなので省略', { size: 10, weight: 400, anchor: 'start', noHalo: true });
  s += txt(w - 4, h - 4, '国土交通省の資料をもとにしたおおよその割合', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

// ---------- 4. 主な貿易港・空港 ----------
const PORTS = [['成田国際空港', 140.39, 35.77, 26, 'air'], ['名古屋港', 136.85, 35.05, 22, 'sea'], ['東京港', 139.8, 35.62, 19, 'sea'], ['横浜港', 139.65, 35.45, 14, 'sea'], ['関西国際空港', 135.24, 34.43, 11, 'air'], ['神戸港', 135.19, 34.67, 10, 'sea'], ['大阪港', 135.43, 34.64, 9, 'sea']];
function portsFig(mode) {
  const w = 600, h = 420;
  const { s: base, proj, close } = jpMap(w, h, [[133.6, 33.2], [141.4, 37.0]]);
  let s = base + close;
  PORTS.forEach(([n, lo, la, v, t], i) => {
    const [x, y] = proj([lo, la]); const r = Math.sqrt(v) * 4.2;
    s += t === 'air' ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${r1(2 * r)}" height="${r1(2 * r)}" fill="#b5513c" fill-opacity="0.75" stroke="#fff"/>` : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="#3c6e9a" fill-opacity="0.7" stroke="#fff"/>`;
    const d = { '成田国際空港': [10, -32, 'end'], '名古屋港': [0, 30, 'middle'], '東京港': [-18, -26, 'end'], '横浜港': [-14, 22, 'end'], '関西国際空港': [-6, 28, 'middle'], '神戸港': [-14, -20, 'end'], '大阪港': [14, -22, 'start'] }[n];
    s += mode === 'label' ? txt(x + d[0], y + d[1], `${n} 約${v}兆円`, { size: 12.5, anchor: d[2] }) : badge(x + d[0] + (d[2] === 'start' ? 10 : d[2] === 'end' ? -10 : 0), y + d[1], 'アイウエオカキ'[i], { r: 11, size: 14 });
  });
  const lx = w - 260, ly = h - 90;
  s += `<rect x="${lx}" y="${ly}" width="250" height="54" fill="#fff" stroke="#999" rx="3"/><rect x="${lx + 8}" y="${ly + 8}" width="14" height="14" fill="#b5513c"/>` + txt(lx + 28, ly + 15, '空港', { size: 12, anchor: 'start', noHalo: true }) + `<circle cx="${lx + 15}" cy="${ly + 38}" r="7" fill="#3c6e9a"/>` + txt(lx + 28, ly + 38, '港（大きさは貿易額）', { size: 12, anchor: 'start', noHalo: true });
  s += txt(w - 8, h - 10, '2023年ごろ。輸出入額の合計。おおよその値', { size: 10.5, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

// ---------- 5. 海底ケーブル ----------
function cableFig() {
  const w = 600, h = 300;
  const proj = d3.geoNaturalEarth1().rotate([-160, 0]).fitExtent([[6, 6], [w - 6, h - 6]], { type: 'Sphere' });
  const path = d3.geoPath(proj);
  let s = `<path d="${ps(path, { type: 'Sphere' })}" fill="${C.sea}" stroke="${C.line}"/><path d="${ps(path, land110)}" fill="${C.land}" stroke="#999" stroke-width="0.5"/>`;
  const CB = [[[140, 35], [170, 40], [-150, 40], [-122, 37]], [[140, 35], [160, 20], [-158, 21]], [[136, 34], [125, 25], [114, 14], [104, 1.3]], [[130, 33], [127, 35]], [[140, 35], [148, 12], [152, -15], [151, -34]]];
  CB.forEach(c => { s += `<path d="${ps(path, { type: 'LineString', coordinates: c })}" fill="none" stroke="#b5513c" stroke-width="2.4"/>`; });
  const [jx, jy] = proj([139, 36]); s += `<circle cx="${r1(jx)}" cy="${r1(jy)}" r="5" fill="${C.ink}"/>` + txt(jx - 8, jy - 12, '日本', { size: 13, anchor: 'end' });
  s += txt(w / 2, h - 14, '日本と世界を結ぶ主な海底ケーブル（例・おおまかな図）', { size: 12, weight: 400 });
  return svg(w, h, s);
}

const figs = {
  shinLabel: figShinkansen('label'), shinQ: figShinkansen('q'),
  timeFig: timeFig(), cargoLabel: cargoFig('label'), cargoQ: cargoFig('q'),
  portsLabel: portsFig('label'), portsQ: portsFig('q'),
  cableFig: cableFig(),
};
fs.writeFileSync('figs14.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

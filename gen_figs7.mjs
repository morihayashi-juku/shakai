// 地理 第7講「北アメリカ州」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let t50 = require('world-atlas/countries-50m.json');
t50 = tsimp.presimplify(t50); t50 = tsimp.simplify(t50, tsimp.quantile(t50, 0.45));
const countries = topojson.feature(t50, t50.objects.countries).features;
const wc = require('world-countries');
const iso = {}; wc.forEach(c => { iso[c.ccn3] = c.cca3; });
const rivers = JSON.parse(fs.readFileSync('data/rivers50.geojson')).features;
const lakes = JSON.parse(fs.readFileSync('data/lakes50.geojson')).features.filter(f => ['Lake Superior', 'Lake Michigan', 'Lake Huron', 'Lake Erie', 'Lake Ontario'].includes(f.properties.name));

const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33', river: '#3f7fb5' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}${o.rot ? ` transform="rotate(${o.rot} ${r1(x)} ${r1(y)})"` : ''}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 14;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 17}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const inBox = (f, [a, b, c, d]) => { const [[x0, y0], [x1, y1]] = d3.geoBounds(f); return !(x1 < a || x0 > c || y1 < b || y0 > d) || (x0 > x1); };
const poly = c => { let p = { type: 'Polygon', coordinates: [c] }; if (d3.geoArea(p) > 2 * Math.PI) p = { type: 'Polygon', coordinates: [c.slice().reverse()] }; return p; };

function naBase(w, h, id, box, fill, opt = {}) {
  const proj = d3.geoConicConformal().rotate([opt.lon0 || 100, 0]).parallels(opt.par || [25, 55]).fitExtent([[4, 4], [w - 4, h - 4]], { type: 'MultiPoint', coordinates: [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]], [(box[0] + box[2]) / 2, box[3] + (opt.topPad || 2)], [(box[0] + box[2]) / 2, box[1]]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of countries) {
    if (!inBox(f, [box[0] - 30, box[1] - 15, box[2] + 30, box[3] + 15])) continue;
    s += `<path d="${ps(path, f)}" fill="${fill ? fill(f) : C.land}" stroke="#8a8a8a" stroke-width="0.5"/>`;
  }
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const tri = (proj, [lo, la], k = 1) => { const [x, y] = proj([lo, la]); return `<path d="M${r1(x - 8 * k)} ${r1(y + 6 * k)} L${r1(x)} ${r1(y - 7 * k)} L${r1(x + 8 * k)} ${r1(y + 6 * k)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`; };

// ---------- 1. 北アメリカの地形と国 ----------
function figMap(mode) {
  const w = 640, h = 600;
  const box = [-128, 14, -60, 60];
  const { s: base, proj, path, close } = naBase(w, h, 'nm' + mode, box);
  let s = base;
  for (const f of lakes) s += `<path d="${ps(path, f)}" fill="#cfe0ee" stroke="${C.river}" stroke-width="0.6"/>`;
  const RV = new Set(['Mississippi', 'Missouri', 'Ohio']);
  for (const f of rivers) if (RV.has(f.properties.name)) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="${f.properties.name === 'Mississippi' ? 2.6 : 1.6}"/>`;
  [[-114, 48], [-112, 45], [-109.5, 42], [-107, 39], [-106, 36], [-118, 52], [-121, 55]].forEach(p => { s += tri(proj, p); });
  [[-84, 35.2], [-81, 37.3], [-78.5, 39.5], [-76, 41.5]].forEach(p => { s += tri(proj, p, 0.8); });
  // 西経100度
  const m100 = { type: 'LineString', coordinates: Array.from({ length: 41 }, (_, i) => [-100, 22 + i]) };
  s += `<path d="${ps(path, m100)}" fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-dasharray="6 4"/>`;
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const [lx, ly] = proj([-100, 57.5]); s += txt(lx, ly, '西経100度', { size: 13 });
  if (mode === 'label') {
    s += L('アメリカ合衆国', -97, 36.3, { size: 18 }) + L('カナダ', -100, 54, { size: 20 }) + L('メキシコ', -102, 24, { size: 17 }) + L('キューバ', -79, 21.2, { size: 13 });
    s += L('ロッキー山脈', -119.5, 47.5, { size: 15, anchor: 'end' });
    s += L('アパラチア山脈', -78.6, 35.6, { size: 13, anchor: 'start' });
    s += L('ミシシッピ川', -88, 33.2, { size: 14, fill: '#1f4f7a', anchor: 'start' });
    s += L('五大湖', -84.5, 47.6, { size: 15, fill: '#1f4f7a' });
    s += L('グレートプレーンズ', -103.5, 45, { size: 13 });
    s += L('プレーリー', -94.2, 41.2, { size: 13 });
    s += L('メキシコ湾', -90, 25.3, { size: 15, fill: '#1f4f7a' }) + L('カリブ海', -76, 16, { size: 14, fill: '#1f4f7a' });
    s += L('太平洋', -124, 30, { size: 17, fill: '#1f4f7a' }) + L('大西洋', -63, 29, { size: 17, fill: '#1f4f7a' });
  } else {
    s += badge(...proj([-97, 36.3]), 1) + badge(...proj([-100, 54]), 2) + badge(...proj([-102, 24]), 3);
    s += badge(...proj([-116.5, 44.5]), 'A', { square: true }) + badge(...proj([-80.5, 37.8]), 'B', { square: true });
    s += badge(...proj([-90.6, 33]), 'ア') + badge(...proj([-84.5, 47.6]), 'イ');
    s += badge(...proj([-103.5, 45]), 'C', { square: true }) + badge(...proj([-90, 25.3]), 'X', { square: true, r: 12, size: 15 });
  }
  return svg(w, h, s);
}

// ---------- 2. アメリカの農業地域（おおまかな図） ----------
const USBOX = [-125, 24, -66, 50];
const ZONE = {
  graze: ['放牧', '#e9dcc0', [[-125, 50], [-100, 50], [-101, 44], [-102, 40], [-102, 32], [-104, 29], [-118, 31], [-125, 40], [-125, 50]]],
  springW: ['小麦（春小麦）', '#f2d58a', [[-110, 49.5], [-96.5, 49.5], [-97, 45], [-101, 44], [-110, 46], [-110, 49.5]]],
  winterW: ['小麦（冬小麦）', '#f2d58a', [[-102, 40], [-96.5, 40], [-96.5, 35], [-102, 34], [-102, 40]]],
  corn: ['とうもろこし・大豆', '#a9cf98', [[-97, 44.5], [-89, 43.5], [-82, 41.5], [-81, 39.5], [-86, 38], [-91, 38.3], [-96.5, 39], [-97, 44.5]]],
  dairy: ['酪農', '#9dbcdc', [[-97, 49.5], [-89, 48.5], [-84, 46.5], [-80, 45], [-67, 47.5], [-69, 41.5], [-75, 40.5], [-82, 41.5], [-89, 43.5], [-97, 44.5], [-97, 49.5]]],
  cotton: ['綿花', '#e9a98f', [[-102, 34], [-96.5, 35], [-91, 35.5], [-86, 35], [-81, 34], [-77, 36], [-80, 31.5], [-85, 30.5], [-91, 29.5], [-97, 27.5], [-102, 30], [-102, 34]]],
  fruit: ['果樹・野菜', '#c9b3dc', [[-124, 42], [-120, 42], [-118, 35], [-116, 33], [-119, 33.5], [-122.5, 37], [-124, 40], [-124, 42]]],
  fruitF: ['果樹・野菜', '#c9b3dc', [[-83, 30], [-80, 30], [-79.8, 25], [-82, 25], [-83, 30]]],
};
function figAgri(mode) {
  const w = 640, h = 410;
  const us = countries.find(f => f.id === '840');
  const { s: base, proj, path, close } = naBase(w, h, 'ua' + mode, USBOX, f => (f.id === '840' ? '#f6f5f1' : '#f6f5f1'), { par: [29, 45], topPad: 0.5 });
  let s = base + `<defs><clipPath id="usc${mode}"><path d="${ps(path, us)}"/></clipPath></defs><g clip-path="url(#usc${mode})">`;
  Object.values(ZONE).forEach(([, col, c]) => { s += `<path d="${ps(path, poly(c))}" fill="${col}"/>`; });
  s += '</g>';
  for (const f of lakes) s += `<path d="${ps(path, f)}" fill="#cfe0ee" stroke="${C.river}" stroke-width="0.5"/>`;
  s += `<path d="${ps(path, us)}" fill="none" stroke="${C.ink}" stroke-width="0.9"/>`;
  const m100 = { type: 'LineString', coordinates: Array.from({ length: 26 }, (_, i) => [-100, 25 + i]) };
  s += `<path d="${ps(path, m100)}" fill="none" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="6 4"/>`;
  s += close;
  const keys = ['dairy', 'corn', 'springW', 'cotton', 'graze', 'fruit'];
  const qk = { dairy: 'P', corn: 'Q', springW: 'R', cotton: 'S' };
  if (mode === 'label') {
    const LP = { dairy: [-79, 43.6], corn: [-89.5, 40.8], springW: [-104, 47.5], winterW: [-99.3, 37.5], cotton: [-89, 32.3], graze: [-112, 40], fruit: [-121.2, 38.6] };
    const NM = { dairy: '酪農', corn: 'とうもろこし・大豆', springW: '小麦', winterW: '小麦', cotton: '綿花', graze: '放牧', fruit: '果樹' };
    Object.entries(LP).forEach(([k, ll]) => { const [x, y] = proj(ll); s += txt(x, y, NM[k], { size: k === 'corn' ? 14 : 16 }); });
  } else {
    Object.entries({ dairy: [-79, 43.6], corn: [-89.5, 40.8], springW: [-104, 47.5], cotton: [-89, 32.3] }).forEach(([k, ll]) => { s += badge(...proj(ll), qk[k], { square: true }); });
    s += badge(...proj([-99.3, 37.5]), 'R', { square: true, r: 12, size: 15 });
  }
  const [mx, my] = proj([-100, 26.5]); s += txt(mx + 6, my, '西経100度', { size: 12, anchor: 'start' });
  s += txt(w - 8, h - 12, 'おおまかな分布', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

// ---------- 3. 工業（サンベルト） ----------
const CITIES = [['デトロイト', -83.05, 42.33, '自動車', 'ア'], ['ピッツバーグ', -79.99, 40.44, '鉄鋼', 'イ'], ['シリコンバレー', -121.9, 37.35, 'ICT産業', 'ウ'], ['ヒューストン', -95.37, 29.76, '航空宇宙・石油化学', 'エ'], ['シアトル', -122.33, 47.6, '航空機', 'オ']];
function figIndustry(mode) {
  const w = 640, h = 410;
  const us = countries.find(f => f.id === '840');
  const { s: base, proj, path, close } = naBase(w, h, 'ui' + mode, USBOX, () => '#f6f5f1', { par: [29, 45], topPad: 0.5 });
  let s = `<defs><pattern id="sb${mode}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#f6e6c4"/><rect width="2.4" height="7" fill="#e3b86a"/></pattern></defs>` + base;
  s += `<defs><clipPath id="uic${mode}"><path d="${ps(path, us)}"/></clipPath></defs><g clip-path="url(#uic${mode})">`;
  const sbc = []; for (let lo = -126; lo <= -60; lo += 1) sbc.push([lo, 37]); for (let lo = -60; lo >= -126; lo -= 1) sbc.push([lo, 20]); sbc.push([-126, 37]);
  s += `<path d="${ps(path, poly(sbc))}" fill="url(#sb${mode})"/>`;
  s += '</g>';
  for (const f of lakes) s += `<path d="${ps(path, f)}" fill="#cfe0ee" stroke="${C.river}" stroke-width="0.5"/>`;
  s += `<path d="${ps(path, us)}" fill="none" stroke="${C.ink}" stroke-width="0.9"/>`;
  const l37 = { type: 'LineString', coordinates: Array.from({ length: 61 }, (_, i) => [-125 + i, 37]) };
  s += `<path d="${ps(path, l37)}" fill="none" stroke="#b5513c" stroke-width="1.4" stroke-dasharray="6 4"/>`;
  s += close;
  const [lx, ly] = proj([-106, 37]); s += txt(lx, ly - 11, '北緯37度', { size: 13, fill: '#8a3a28' });
  const off = { 'デトロイト': [8, -14, 'start'], 'ピッツバーグ': [8, 12, 'start'], 'シリコンバレー': [8, 14, 'start'], 'ヒューストン': [-8, 14, 'end'], 'シアトル': [8, 8, 'start'] };
  CITIES.forEach(([n, lo, la, ind, q]) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="${C.ink}" stroke="#fff" stroke-width="1.2"/>`;
    const [dx, dy, an] = off[n];
    if (mode === 'label') s += txt(x + dx, y + dy, `${n}（${ind}）`, { size: 13, anchor: an });
    else s += badge(x + dx + (an === 'end' ? -10 : 10), y + dy, q, { r: 12, size: 15 });
  });
  if (mode === 'label') { const [sx, sy] = proj([-95, 33]); s += txt(sx, sy, 'サンベルト', { size: 20, fill: '#7a4a10' }); }
  else { const [sx, sy] = proj([-95, 33]); s += badge(sx, sy, 'Z', { square: true }); }
  return svg(w, h, s);
}

// ---------- 4. グラフ ----------
function share(title, rows, note, max = 60) {
  const w = 320, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 112, R = 290;
  let s = txt(w / 2, 14, title, { size: 17, noHalo: true });
  for (let v = 0; v <= max; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => {
    const y = top + i * rowH;
    s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true });
    s += `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${n === 'アメリカ' ? '#3c6e9a' : '#9db7d0'}"/>`;
    s += txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true });
  });
  s += txt(w - 4, h - 6, note, { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
function ethnic() {
  const rows = [['ヨーロッパ系', 58, '#9dbcdc'], ['ヒスパニック', 19, '#f0cf72'], ['アフリカ系', 12, '#e9a98f'], ['アジア系', 6, '#b9d6a3'], ['その他', 5, '#e6e1d6']];
  const w = 560, h = 132, L = 10, R = 550, y = 38;
  let s = txt(w / 2, 14, 'アメリカ合衆国の人々の構成', { size: 17, noHalo: true });
  let x = L;
  rows.forEach(([n, v, col], i) => {
    const ww = v / 100 * (R - L);
    s += `<rect x="${r1(x)}" y="${y}" width="${r1(ww)}" height="40" fill="${col}" stroke="${C.ink}" stroke-width="0.6"/>`;
    if (v >= 12) s += txt(x + ww / 2, y + 13, n, { size: 14, noHalo: true }) + txt(x + ww / 2, y + 29, `約${v}%`, { size: 13, noHalo: true });
    else { s += `<line x1="${r1(x + ww / 2)}" y1="${y + 40}" x2="${r1(x + ww / 2)}" y2="${y + 50 + (i - 3) * 16}" stroke="${C.ink}" stroke-width="0.7"/>` + txt(x + ww / 2 - 4, y + 56 + (i - 3) * 16, `${n} 約${v}%`, { size: 12, anchor: 'end', noHalo: true }); }
    x += ww;
  });
  s += txt(10, h - 6, '2020年の国勢調査をもとにしたおおよその割合', { size: 10.5, weight: 400, anchor: 'start', noHalo: true });
  return svg(w, h, s);
}
const NOTE = '2022年。FAOSTATをもとにしたおおよその値';
const figs = {
  naMapLabel: figMap('label'), naMapQ: figMap('q'),
  usAgriLabel: figAgri('label'), usAgriQ: figAgri('q'),
  usIndLabel: figIndustry('label'), usIndQ: figIndustry('q'),
  shareCorn: share('とうもろこしの生産', [['アメリカ', 30], ['中国', 24], ['ブラジル', 9], ['アルゼンチン', 5], ['インド', 3]], NOTE),
  shareSoy: share('大豆の生産', [['ブラジル', 35], ['アメリカ', 33], ['アルゼンチン', 13], ['中国', 6], ['インド', 3]], NOTE),
  usEthnic: ethnic(),
};
fs.writeFileSync('figs7.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

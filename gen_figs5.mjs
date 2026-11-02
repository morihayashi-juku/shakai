// 地理 第5講「ヨーロッパ州」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let t50 = require('world-atlas/countries-50m.json');
t50 = tsimp.presimplify(t50); t50 = tsimp.simplify(t50, tsimp.quantile(t50, 0.45));
const countries = topojson.feature(t50, t50.objects.countries).features;
const land = topojson.feature(t50, t50.objects.land);
const wc = require('world-countries');
const iso = {}; wc.forEach(c => { iso[c.ccn3] = c.cca3; });
const rivers = JSON.parse(fs.readFileSync('data/rivers50.geojson')).features;

const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33', river: '#3f7fb5', grat: '#9fb3c2' };
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

const EBOX = [-12, 34, 42, 71];
function euroBase(w, h, id, fill, opt = {}) {
  const box = opt.box || EBOX;
  const proj = d3.geoConicConformal().rotate([-15, 0]).parallels([40, 65]).fitExtent([[4, 4], [w - 4, h - 4]], { type: 'MultiPoint', coordinates: [[box[0], box[1]], [box[2], box[1]], [box[0], box[3]], [box[2], box[3]], [15, box[3] + 1]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect x="0" y="0" width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  if (opt.grat) s += `<path d="${ps(path, d3.geoGraticule().extent([[-40, 30], [70, 80.01]]).step([10, 10])())}" fill="none" stroke="${C.grat}" stroke-width="0.7"/>`;
  for (const f of countries) {
    if (!inBox(f, [box[0] - 25, box[1] - 10, box[2] + 30, box[3] + 10])) continue;
    s += `<path d="${ps(path, f)}" fill="${fill ? fill(f) : C.land}" stroke="#8a8a8a" stroke-width="0.5"/>`;
  }
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}

// ---------- 1. ヨーロッパの地形 ----------
function figTerrain(mode) {
  const w = 640, h = 600;
  const { s: base, proj, path, close } = euroBase(w, h, 'et' + mode, null, { grat: true, box: [-11, 35, 32, 68] });
  let s = base;
  const RV = { Rhine: 'ライン川', Rhein: 'ライン川', Rhin: 'ライン川', Danube: 'ドナウ川', Donau: 'ドナウ川' };
  for (const f of rivers) if (RV[f.properties.name]) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="2.4"/>`;
  const tri = ([lo, la]) => { const [x, y] = proj([lo, la]); return `<path d="M${r1(x - 8)} ${r1(y + 6)} L${r1(x)} ${r1(y - 7)} L${r1(x + 8)} ${r1(y + 6)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`; };
  [[6.5, 45.6], [8.5, 46.3], [10.5, 46.5], [12.5, 47.0], [14.5, 47.2]].forEach(p => { s += tri(p); });  // アルプス
  s += close;
  // 緯線の目もり
  for (const la of [40, 50, 60]) {
    // 左はしで緯線が通る位置を探す
    let best = null; for (let lo = -40; lo <= 40; lo += 0.25) { const [x, y] = proj([lo, la]); if (x >= 6 && (!best || x < best[0])) best = [x, y]; }
    if (best && best[1] > 10 && best[1] < h - 10) s += txt(8, best[1] - 9, `北緯${la}°`, { size: 13, weight: 400, anchor: 'start' });
  }
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('アルプス山脈', 10.5, 44.6, { size: 17 });
    s += L('ライン川', 4.3, 50.6, { size: 15, fill: '#1f4f7a' });
    s += L('ドナウ川', 22.5, 46.5, { size: 15, fill: '#1f4f7a' });
    s += L('スカンディナビア半島', 15, 64.5, { size: 15, rot: 52 });
    s += L('イベリア半島', -4, 40, { size: 15 });
    s += L('地中海', 18.5, 38.6, { size: 17, fill: '#1f4f7a' });
    s += L('北海', 3, 56.5, { size: 15, fill: '#1f4f7a' });
    s += L('バルト海', 19.3, 57.5, { size: 13, fill: '#1f4f7a' });
    s += L('大西洋', -10, 50, { size: 17, fill: '#1f4f7a' });
    s += L('黒海', 31, 43.5, { size: 14, fill: '#1f4f7a' });
    s += L('フィヨルド', 6.5, 61.5, { size: 13, anchor: 'end' });
  } else {
    const [ax, ay] = proj([10.5, 44.6]); s += badge(ax, ay, 'A', { square: true });
    const [bx, by] = proj([15, 64.5]); s += badge(bx, by, 'B', { square: true });
    const [cx, cy] = proj([-4, 40]); s += badge(cx, cy, 'C', { square: true });
    const [rx, ry] = proj([5.2, 50.6]); s += badge(rx, ry, 'ア');
    const [ux, uy] = proj([22.5, 46.4]); s += badge(ux, uy, 'イ');
    const [mx, my] = proj([18.5, 38.6]); s += badge(mx, my, 'X', { square: true, r: 12, size: 15 });
    const [nx, ny] = proj([3, 56.5]); s += badge(nx, ny, 'Y', { square: true, r: 12, size: 15 });
  }
  return svg(w, h, s);
}

// ---------- 2. 言語（民族）の分布 ----------
const LANG = {
  ger: 'GBR IRL DEU AUT CHE NLD BEL LUX DNK NOR SWE ISL',
  lat: 'FRA ITA ESP PRT ROU MDA AND MCO SMR',
  sla: 'RUS UKR BLR POL CZE SVK SVN HRV BIH SRB MNE MKD BGR',
};
const LSET = Object.fromEntries(Object.entries(LANG).map(([k, v]) => [k, new Set(v.split(' '))]));
const LCOL = { ger: '#9dbcdc', lat: '#f0cf72', sla: '#b9d6a3', oth: '#e6e1d6', out: '#f6f5f1' };
function langOf(f) {
  const c = iso[f.id]; const n = f.properties.name;
  if (n === 'Kosovo') return 'oth';
  for (const k of ['ger', 'lat', 'sla']) if (c && LSET[k].has(c)) return k;
  if (c && 'FIN EST LVA LTU HUN GRC ALB CYP MLT'.split(' ').includes(c)) return 'oth';
  return 'out';
}
function figLang(mode) {
  const w = 640, h = 560;
  const { s: base, proj, close } = euroBase(w, h, 'lg' + mode, f => LCOL[langOf(f)], { box: [-12, 35, 40, 70] });
  let s = base + close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('ゲルマン系', 9.5, 52.5, { size: 20 }) + L('（英語・ドイツ語など）', 9.5, 51.2, { size: 12, weight: 400 });
    s += L('ラテン系', 1.8, 45.8, { size: 20 }) + L('（フランス語・イタリア語・', 1.8, 44.6, { size: 12, weight: 400 }) + L('スペイン語など）', 1.8, 43.6, { size: 12, weight: 400 });
    s += L('スラブ系', 30, 53, { size: 20 }) + L('（ロシア語・ポーランド語など）', 30, 51.7, { size: 12, weight: 400 });
  } else {
    s += badge(...proj([9.5, 52]), 'A', { square: true }) + badge(...proj([1.8, 45.5]), 'B', { square: true }) + badge(...proj([30, 53]), 'C', { square: true });
  }
  s += `<rect x="10" y="${h - 30}" width="20" height="14" fill="${LCOL.oth}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(36, h - 22, 'その他の言語（ギリシャ語・フィンランド語など）', { size: 12, anchor: 'start', weight: 400 });
  return svg(w, h, s);
}

// ---------- 3. EU加盟国とユーロ ----------
const EU = 'AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE'.split(' ');
const NOEURO = new Set('CZE DNK HUN POL ROU SWE'.split(' '));
function figEU(mode) {
  const w = 640, h = 560;
  const fill = f => { const c = iso[f.id]; if (!c || !EU.includes(c)) return '#f6f5f1'; return NOEURO.has(c) ? '#b7cde3' : `url(#eu${mode}h)`; };
  const { s: base, proj, close } = euroBase(w, h, 'eu' + mode, fill, { box: [-12, 35, 40, 70] });
  let s = `<defs><pattern id="eu${mode}h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#b7cde3"/><rect width="3" height="7" fill="#3c6e9a"/></pattern></defs>` + base + close;
  const lg = (y, f, t) => `<rect x="12" y="${y}" width="22" height="15" fill="${f}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(40, y + 8, t, { size: 13, anchor: 'start', weight: 700 });
  s += lg(h - 66, `url(#eu${mode}h)`, 'EU加盟国で、ユーロを使っている国') + lg(h - 44, '#b7cde3', 'EU加盟国で、ユーロを使っていない国') + lg(h - 22, '#f6f5f1', 'EUに加盟していない国');
  if (mode === 'label') {
    const L = (n, lo, la) => { const [x, y] = proj([lo, la]); return txt(x, y, n, { size: 13 }); };
    s += L('イギリス', -2, 53.3) + L('（2020年に離脱）', -2, 52.2) + L('フランス', 2.5, 46.8) + L('ドイツ', 10.3, 51) + L('イタリア', 12.5, 42.6) + L('スペイン', -3.6, 40) + L('ポーランド', 19.5, 52) + L('スウェーデン', 15.5, 62.5) + L('ノルウェー', 9, 61.5) + L('スイス', 8.2, 46.7) + L('ロシア', 36, 57);
  } else {
    const Q = [['①', -2, 53.3], ['②', 2.5, 46.8], ['③', 10.3, 51], ['④', 8.2, 46.7]];
    Q.forEach(([k, lo, la]) => { const [x, y] = proj([lo, la]); s += badge(x, y, '①②③④'.indexOf(k) + 1, { r: 12, size: 15 }); });
  }
  return svg(w, h, s);
}

// ---------- 4. 農業の分布（おおまかな図） ----------
function figAgri(mode) {
  const w = 640, h = 560;
  const { s: base, proj, path, close } = euroBase(w, h, 'ag' + mode, () => '#f6f5f1', { box: [-12, 35, 40, 70] });
  const poly = c => { let p = { type: 'Polygon', coordinates: [c] }; if (d3.geoArea(p) > 2 * Math.PI) p = { type: 'Polygon', coordinates: [c.slice().reverse()] }; return p; };
  // 地中海式：地中海沿岸
  const medi = [[-11, 44], [-6, 43.3], [-1.5, 43.2], [3, 43.6], [7, 44.2], [9.5, 44.5], [12.5, 44.8], [14, 45.6], [17, 44], [20, 42.8], [23, 42], [27, 41.5], [30, 41], [36, 40], [36, 30], [-11, 30], [-11, 44]];
  // 酪農：北海・バルト海の周りとアルプス
  const dairy1 = [[-11, 58], [-11, 50], [-5, 49.6], [2, 50.8], [4.5, 51.6], [7, 53], [10, 54], [14, 54.3], [19, 54.6], [24, 56], [28, 58], [30, 62], [26, 66], [18, 64], [12, 60], [5, 59], [-11, 58]];
  const alps = [[6, 45.6], [7.5, 47.6], [10, 47.8], [13, 47.9], [15.5, 47.6], [15, 46.3], [11, 46], [8, 45.6], [6, 45.6]];
  const mixed = [[-11, 50], [-11, 35], [60, 35], [60, 57], [28, 58], [24, 56], [19, 54.6], [14, 54.3], [10, 54], [7, 53], [4.5, 51.6], [2, 50.8], [-5, 49.6], [-11, 50]];
  const AG = { mixed: '#f2d58a', dairy: '#9dbcdc', medi: '#e9a98f' };
  let s = base;
  const near = countries.filter(f => inBox(f, [-25, 25, 60, 75]));
  s += `<defs><clipPath id="agl${mode}">${near.map(f => `<path d="${ps(path, f)}"/>`).join('')}</clipPath></defs><g clip-path="url(#agl${mode})">`;
  s += `<path d="${ps(path, poly(mixed))}" fill="${AG.mixed}"/>`;
  s += `<path d="${ps(path, poly(medi))}" fill="${AG.medi}"/>`;
  s += `<path d="${ps(path, poly(dairy1))}" fill="${AG.dairy}"/><path d="${ps(path, poly(alps))}" fill="${AG.dairy}"/>`;
  s += `</g>`;
  for (const f of countries) { if (!inBox(f, [-40, 25, 75, 81])) continue; s += `<path d="${ps(path, f)}" fill="none" stroke="#777" stroke-width="0.45"/>`; }
  s += close;
  const items = [['mixed', '混合農業', 'P'], ['dairy', '酪農', 'Q'], ['medi', '地中海式農業', 'R']];
  items.forEach(([k, n, q], i) => {
    const y = h - 70 + i * 22;
    s += `<rect x="12" y="${y}" width="22" height="15" fill="${AG[k]}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(40, y + 8, mode === 'label' ? n : q, { size: 14, anchor: 'start' });
  });
  s += txt(w - 8, h - 12, 'おおまかな分布', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

// ---------- 5. 雨温図（パリと札幌） ----------
const GR = {
  paris: ['パリ（北緯49度）', [5.0, 5.6, 8.8, 11.5, 15.2, 18.3, 20.5, 20.3, 16.9, 13.0, 8.3, 5.5], [47, 41, 50, 52, 63, 50, 62, 53, 48, 62, 51, 58]],
  sapporo: ['札幌（北緯43度）', [-3.2, -2.7, 1.1, 7.3, 13.0, 17.0, 21.1, 22.3, 18.6, 12.1, 5.2, -0.9], [108, 92, 78, 55, 56, 60, 91, 127, 142, 110, 114, 115]],
  rome: ['ローマ（北緯42度）', [7.5, 8.4, 10.9, 13.7, 18.0, 22.0, 24.8, 24.9, 21.4, 17.4, 12.4, 8.6], [69, 76, 59, 62, 48, 30, 16, 26, 67, 102, 107, 82]],
};
function climGraph(key, title) {
  const [, T, P] = GR[key];
  const w = 236, h = 214, L = 38, R = 194, top = 34, bot = h - 24, H = bot - top;
  const yT = v => bot - (v + 30) / 60 * H, yP = v => bot - v / 600 * H, bw = (R - L) / 12;
  let s = `<rect x="${L}" y="${top}" width="${R - L}" height="${H}" fill="#fff" stroke="${C.ink}"/>`;
  for (let v = -20; v <= 20; v += 10) s += `<line x1="${L}" y1="${r1(yT(v))}" x2="${R}" y2="${r1(yT(v))}" stroke="#c9d3da" stroke-width="${v === 0 ? 1 : 0.6}"/>`;
  P.forEach((p, i) => { s += `<rect x="${r1(L + i * bw + 1.5)}" y="${r1(yP(p))}" width="${r1(bw - 3)}" height="${r1(bot - yP(p))}" fill="#7da7c9" stroke="#3d6688" stroke-width="0.5"/>`; });
  s += `<polyline points="${T.map((v, i) => `${r1(L + (i + 0.5) * bw)},${r1(yT(v))}`).join(' ')}" fill="none" stroke="#b33a2c" stroke-width="2.2"/>`;
  T.forEach((v, i) => { s += `<circle cx="${r1(L + (i + 0.5) * bw)}" cy="${r1(yT(v))}" r="2.3" fill="#b33a2c"/>`; });
  for (let v = -30; v <= 30; v += 10) s += txt(L - 4, yT(v), String(v), { size: 12.5, weight: 400, anchor: 'end', noHalo: true });
  for (let v = 0; v <= 600; v += 100) s += txt(R + 4, yP(v), String(v), { size: 12.5, weight: 400, anchor: 'start', noHalo: true });
  [1, 4, 7, 10].forEach(m => { s += txt(L + (m - 0.5) * bw, bot + 11, String(m), { size: 12.5, weight: 400, noHalo: true }); });
  s += txt(R + 4, bot + 11, '月', { size: 12.5, weight: 400, anchor: 'start', noHalo: true });
  s += txt(L - 4, top - 9, '℃', { size: 12, weight: 400, anchor: 'end', noHalo: true }) + txt(R + 4, top - 9, 'mm', { size: 12, weight: 400, anchor: 'start', noHalo: true });
  s += txt((L + R) / 2, 13, title, { size: 17, noHalo: true });
  return svg(w, h, s);
}

// ---------- 6. 航空機の国際分業 ----------
function figAirbus(mode) {
  const w = 520, h = 400;
  const { s: base, proj, close } = euroBase(w, h, 'ab' + mode, f => (['GBR', 'DEU', 'ESP', 'FRA'].includes(iso[f.id]) ? '#e9dfbf' : '#f6f5f1'), { box: [-10, 36, 16, 57] });
  let s = `<defs><marker id="ab${mode}m" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#b5513c"/></marker></defs>` + base + close;
  const T = proj([1.44, 43.6]);
  const src = [['イギリス', '主翼', [-3, 53.2]], ['ドイツ', '胴体', [10, 52.3]], ['スペイン', '尾翼', [-4, 40.2]]];
  src.forEach(([c, part, ll], i) => {
    const [x, y] = proj(ll);
    s += `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(T[0] + (x - T[0]) * 0.08)}" y2="${r1(T[1] + (y - T[1]) * 0.08)}" stroke="#b5513c" stroke-width="3.5" marker-end="url(#ab${mode}m)"/>`;
    s += txt(x, y - 12, c, { size: 15 }) + txt(x, y + 8, mode === 'label' ? part : '（　　）', { size: 14, fill: '#8a3a28' });
  });
  s += `<circle cx="${r1(T[0])}" cy="${r1(T[1])}" r="7" fill="${C.ink}" stroke="#fff" stroke-width="1.5"/>`;
  s += txt(T[0] + 12, T[1] + 18, mode === 'label' ? 'トゥールーズ（フランス）で組み立て' : 'フランスの都市 Z で組み立て', { size: 14, anchor: 'start' });
  return svg(w, h, s);
}

const figs = {
  eTerrainLabel: figTerrain('label'), eTerrainQ: figTerrain('q'),
  langLabel: figLang('label'), langQ: figLang('q'),
  euLabel: figEU('label'), euQ: figEU('q'),
  agriLabel: figAgri('label'), agriQ: figAgri('q'),
  cgParis: climGraph('paris', 'パリ（北緯49度）'), cgSapporo: climGraph('sapporo', '札幌（北緯43度）'), cgRome: climGraph('rome', 'ローマ（北緯42度）'),
  cgParisQ: climGraph('paris', 'A（北緯49度）'), cgSapporoQ: climGraph('sapporo', 'B（北緯43度）'),
  airbusLabel: figAirbus('label'), airbusQ: figAirbus('q'),
};
fs.writeFileSync('figs5.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

// 地理 第12講「日本の人口」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
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
  const r = o.r || 13;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 16}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;

// ---------- 1. 人口ピラミッドの3つの型（形の例） ----------
const SHAPES = {
  fuji: ['富士山型', '子どもが多く、高齢者が少ない（発展途上国に多い）', a => 10 - a * 0.95],
  bell: ['つりがね型', '子どもと大人がほぼ同じ（人口があまり変わらない）', a => (a < 6 ? 6.2 : 6.2 - (a - 6) * 1.5)],
  tsubo: ['つぼ型', '子どもが少なく、高齢者が多い（日本など少子高齢化）', a => (a < 3 ? 3.4 + a * 0.6 : a < 7 ? 5.2 + (a - 3) * 0.1 : 5.6 - (a - 7) * 1.4)],
};
function pyramid(key, mode, letter) {
  const w = 240, h = 230, cx = 120, top = 30, bot = 190, rows = 10, rh = (bot - top) / rows;
  const [name, desc, f] = SHAPES[key];
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  for (let i = 0; i < rows; i++) {
    const v = Math.max(0.4, f(i)), y = bot - (i + 1) * rh, ww = v * 9;
    s += `<rect x="${r1(cx - ww - 2)}" y="${r1(y + 1)}" width="${r1(ww)}" height="${r1(rh - 2)}" fill="#7da7c9"/><rect x="${cx + 2}" y="${r1(y + 1)}" width="${r1(ww)}" height="${r1(rh - 2)}" fill="#e9a98f"/>`;
  }
  s += `<line x1="${cx}" y1="${top}" x2="${cx}" y2="${bot}" stroke="${C.ink}"/>` + txt(cx - 60, top - 10, '男', { size: 12, weight: 400, noHalo: true }) + txt(cx + 60, top - 10, '女', { size: 12, weight: 400, noHalo: true });
  s += txt(14, bot - 6, '0歳', { size: 10, weight: 400, anchor: 'start', noHalo: true }) + txt(14, top + 6, '高齢', { size: 10, weight: 400, anchor: 'start', noHalo: true });
  if (mode === 'label') s += txt(cx, 206, name, { size: 16, noHalo: true }) + txt(cx, 223, desc.length > 18 ? desc.slice(0, desc.indexOf('（')) : desc, { size: 10.5, weight: 400, noHalo: true });
  else s += badge(cx, 210, letter);
  return svg(w, h, s);
}

// ---------- 2. 日本の人口と高齢化率の移り変わり ----------
const POP = [[1950, 8320, 4.9], [1970, 10467, 7.1], [1990, 12361, 12.1], [2010, 12806, 23.0], [2020, 12615, 28.6], [2040, 11284, 34.8]];
function popTrend(mode) {
  const w = 560, h = 280, L = 56, R = 500, T = 34, B = 236, maxP = 14000, maxA = 40;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, mode === 'label' ? '日本の人口と高齢化率（65歳以上の割合）' : '日本の人口と、ある割合の移り変わり', { size: 15, noHalo: true });
  for (let v = 0; v <= 14000; v += 2000) { const y = B - v / maxP * (B - T); s += `<line x1="${L}" y1="${r1(y)}" x2="${R}" y2="${r1(y)}" stroke="#e1e5e8"/>` + txt(L - 6, y, v === 0 ? '0' : (v / 10000).toFixed(1).replace(/\.0$/, ''), { size: 11, weight: 400, anchor: 'end', noHalo: true }); }
  s += txt(L - 6, T - 14, '億人', { size: 11, weight: 400, anchor: 'end', noHalo: true });
  for (let a = 0; a <= 40; a += 10) { const y = B - a / maxA * (B - T); s += txt(R + 6, y, a + '%', { size: 11, weight: 400, anchor: 'start', noHalo: true }); }
  const bw = (R - L) / POP.length;
  POP.forEach(([yr, p, a], i) => {
    const x = L + i * bw + 10, y = B - p / maxP * (B - T), pred = yr === 2040;
    s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(bw - 20)}" height="${r1(B - y)}" fill="${pred ? '#fff' : '#9dbcdc'}" stroke="#3c6e9a" ${pred ? 'stroke-dasharray="4 3"' : ''}/>`;
    const lbl = p >= 10000 ? `1億${p - 10000}万` : `${p}万`; s += txt(x + (bw - 20) / 2, y + 12, lbl, { size: 10, noHalo: true });
    s += txt(x + (bw - 20) / 2, B + 12, yr + (pred ? '予測' : ''), { size: 11, weight: 400, noHalo: true });
  });
  const pts = POP.map(([, , a], i) => [L + i * bw + bw / 2, B - a / maxA * (B - T)]);
  s += `<polyline points="${pts.map(p => p.map(r1).join(',')).join(' ')}" fill="none" stroke="#b33a2c" stroke-width="2.6"/>`;
  pts.forEach(([x, y], i) => { s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="3.6" fill="#b33a2c"/>` + txt(x, y - 12, POP[i][2] + '%', { size: 11.5, fill: '#8a2a1c' }); });
  s += txt(w - 4, h - 6, '国勢調査と将来推計をもとにしたおおよその値', { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  s += `<rect x="${L + 6}" y="${T + 2}" width="14" height="10" fill="#9dbcdc" stroke="#3c6e9a"/>` + txt(L + 24, T + 7, '人口（左の目もり）', { size: 11, anchor: 'start', noHalo: true });
  s += `<line x1="${L + 150}" y1="${T + 7}" x2="${L + 166}" y2="${T + 7}" stroke="#b33a2c" stroke-width="2.6"/>` + txt(L + 170, T + 7, mode === 'label' ? '高齢化率（右の目もり）' : 'Xの割合（右の目もり）', { size: 11, anchor: 'start', noHalo: true });
  return svg(w, h, s);
}

// ---------- 3. 人口の分布（三大都市圏・地方中枢都市・人口が増えた都県） ----------
const INC = new Set(['東京都', '神奈川県', '埼玉県', '千葉県', '愛知県', '滋賀県', '福岡県', '沖縄県']);
function jpMap(w, h, fill, minLat = 30.5) {
  const mains = prefs.map(f => ({ ...f, geometry: { type: 'MultiPolygon', coordinates: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).filter(pp => { const c = d3.geoCentroid({ type: 'Polygon', coordinates: pp }); return c[1] > minLat && c[0] < 149.5; }) } }));
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'FeatureCollection', features: mains.filter(f => f.geometry.coordinates.length) });
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/>`;
  mains.forEach(f => { s += `<path d="${ps(path, f)}" fill="${fill(f)}" stroke="#888" stroke-width="0.5"/>`; });
  // 沖縄（囲み）
  const ok = prefs.find(f => f.properties.nam_ja === '沖縄県');
  const bx = 14, by = 14, bw = 120, bh = 90;
  const po = d3.geoMercator().fitExtent([[bx + 8, by + 8], [bx + bw - 8, by + bh - 8]], { type: 'MultiPoint', coordinates: [[126.6, 26], [128.4, 27]] });
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${C.sea}" stroke="${C.ink}"/><path d="${ps(d3.geoPath(po), ok)}" fill="${fill(ok)}" stroke="#888" stroke-width="0.5"/>` + txt(bx + bw - 6, by + bh - 10, '沖縄県', { size: 11, weight: 400, anchor: 'end' });
  return { s, proj };
}
const CITIES = [['東京', 139.69, 35.69], ['大阪', 135.5, 34.69], ['名古屋', 136.91, 35.18], ['札幌', 141.35, 43.06], ['仙台', 140.87, 38.27], ['広島', 132.46, 34.4], ['福岡', 130.4, 33.59]];
function figDist(mode) {
  const w = 600, h = 600;
  const { s: base, proj } = jpMap(w, h, f => INC.has(f.properties.nam_ja) ? '#e9a98f' : '#f3f0e8');
  let s = base;
  CITIES.forEach(([n, lo, la], i) => {
    const [x, y] = proj([lo, la]); const big = i < 3;
    s += big ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${i === 0 ? 30 : 20}" fill="none" stroke="#b5513c" stroke-width="2.4" stroke-dasharray="5 3"/>` : '';
    s += `<rect x="${r1(x - 4.5)}" y="${r1(y - 4.5)}" width="9" height="9" fill="${big ? '#b5513c' : C.ink}"/>`;
    if (mode === 'label') { const d = { '東京': [34, 0, 'start'], '大阪': [-24, 14, 'end'], '名古屋': [8, 26, 'start'], '札幌': [10, 0, 'start'], '仙台': [10, 0, 'start'], '広島': [-6, -14, 'end'], '福岡': [-8, -12, 'end'] }[n]; s += txt(x + d[0], y + d[1], n, { size: 14, anchor: d[2] }); }
    else { const d = { '東京': [42, 0], '大阪': [-30, 16], '名古屋': [14, 32], '札幌': [20, 0], '仙台': [20, 0], '広島': [-16, -16], '福岡': [-20, -12] }[n]; s += badge(x + d[0], y + d[1], 'アイウエオカキ'[i], { r: 12, size: 14 }); }
  });
  const ly = h - 74, lx = w - 310;
  s += `<rect x="${lx - 8}" y="${ly - 8}" width="300" height="70" fill="#fff" stroke="#999" rx="3"/>`;
  s += `<rect x="${lx}" y="${ly}" width="20" height="13" fill="#e9a98f" stroke="${C.ink}" stroke-width="0.5"/>` + txt(lx + 26, ly + 7, '2015年から2020年に人口が増えた都県', { size: 12, anchor: 'start', noHalo: true });
  s += `<circle cx="${lx + 10}" cy="${ly + 28}" r="8" fill="none" stroke="#b5513c" stroke-width="2" stroke-dasharray="4 2"/>` + txt(lx + 26, ly + 28, mode === 'label' ? '三大都市圏の中心' : 'Xの中心都市', { size: 12, anchor: 'start', noHalo: true });
  s += `<rect x="${lx + 5}" y="${ly + 44}" width="9" height="9" fill="${C.ink}"/>` + txt(lx + 26, ly + 49, mode === 'label' ? '地方中枢都市' : 'Yの都市', { size: 12, anchor: 'start', noHalo: true });
  return svg(w, h, s);
}

// ---------- 4. 過密と過疎（しくみ） ----------
function figKamitsu(mode) {
  const w = 600, h = 200;
  let s = `<defs><marker id="km${mode}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${C.ink}"/></marker></defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, title, lines, col) => `<rect x="${x}" y="30" width="230" height="150" rx="6" fill="${col}" stroke="${C.ink}"/>` + txt(x + 115, 50, title, { size: 16, noHalo: true }) + lines.map((l, i) => txt(x + 14, 78 + i * 22, '・' + l, { size: 12.5, weight: 400, anchor: 'start', noHalo: true })).join('');
  if (mode === 'label') {
    s += box(10, '過疎（農村・山間部・離島）', ['若い人がへり、高齢者の割合が高い', '学校・病院・バスの路線がへる', '地域の行事や農林業の担い手不足'], '#eef4f8');
    s += box(360, '過密（大都市）', ['交通渋滞・通勤ラッシュ', '住宅の不足、地価が高い', 'ごみの増加、大気汚染'], '#fbeee8');
  } else {
    s += box(10, 'ア（農村・山間部・離島）', ['若い人がへり、高齢者の割合が高い', '学校・病院・バスの路線がへる', '地域の行事や農林業の担い手不足'], '#eef4f8');
    s += box(360, 'イ（大都市）', ['交通渋滞・通勤ラッシュ', '住宅の不足、地価が高い', 'ごみの増加、大気汚染'], '#fbeee8');
  }
  s += `<line x1="248" y1="105" x2="352" y2="105" stroke="${C.ink}" stroke-width="2.4" marker-end="url(#km${mode})"/>` + txt(300, 90, '仕事や学校を', { size: 12, noHalo: true }) + txt(300, 124, '求めて移動', { size: 12, noHalo: true });
  return svg(w, h, s);
}

function worldPop() {
  const D = [[1900, 16], [1950, 25], [1975, 41], [2000, 61], [2022, 80], [2050, 97]];
  const w = 520, h = 230, L = 50, R = 510, T = 34, B = 196, max = 100;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '世界の人口の移り変わり', { size: 15, noHalo: true });
  for (let v = 0; v <= 100; v += 20) { const y = B - v / max * (B - T); s += `<line x1="${L}" y1="${r1(y)}" x2="${R}" y2="${r1(y)}" stroke="#e1e5e8"/>` + txt(L - 6, y, String(v), { size: 11, weight: 400, anchor: 'end', noHalo: true }); }
  s += txt(L - 6, T - 14, '億人', { size: 11, weight: 400, anchor: 'end', noHalo: true });
  const bw = (R - L) / D.length;
  D.forEach(([yr, v], i) => { const x = L + i * bw + 12, y = B - v / max * (B - T), pred = yr === 2050; s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(bw - 24)}" height="${r1(B - y)}" fill="${pred ? '#fff' : '#3c6e9a'}" stroke="#3c6e9a" ${pred ? 'stroke-dasharray="4 3"' : ''}/>` + txt(x + (bw - 24) / 2, y - 9, `約${v}億`, { size: 11.5, noHalo: true }) + txt(x + (bw - 24) / 2, B + 12, yr + (pred ? '予測' : ''), { size: 11, weight: 400, noHalo: true }); });
  s += txt(w - 4, h - 4, '国連の推計・予測をもとにしたおおよその値', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const figs = {
  worldPop: worldPop(),
  pyrFuji: pyramid('fuji', 'label'), pyrBell: pyramid('bell', 'label'), pyrTsubo: pyramid('tsubo', 'label'),
  pyrFujiQ: pyramid('fuji', 'q', 'ウ'), pyrBellQ: pyramid('bell', 'q', 'ア'), pyrTsuboQ: pyramid('tsubo', 'q', 'イ'),
  popTrendLabel: popTrend('label'), popTrendQ: popTrend('q'),
  distLabel: figDist('label'), distQ: figDist('q'),
  kamitsuLabel: figKamitsu('label'), kamitsuQ: figKamitsu('q'),
};
fs.writeFileSync('figs12.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

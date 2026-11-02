// 地理 第6講「アフリカ州」の図
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
const isoOf = f => iso[f.id] || ({ Somaliland: 'SOL', 'W. Sahara': 'ESH' }[f.properties.name]);
const rivers = JSON.parse(fs.readFileSync('data/rivers50.geojson')).features;

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

// 正距円筒図法（気候の画像と重ねるため）
const BOX = [-20, -36, 53, 38];
function afBase(w, id, fill, opt = {}) {
  const k = w / (BOX[2] - BOX[0]); const h = Math.round((BOX[3] - BOX[1]) * k);
  const proj = d3.geoEquirectangular().scale(k * 180 / Math.PI).translate([-BOX[0] * k, BOX[3] * k]);
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/>`;
  if (opt.under) s += opt.under(w, h);
  s += `<g clip-path="url(#${id})">`;
  for (const f of countries) {
    if (!inBox(f, [BOX[0] - 10, BOX[1] - 10, BOX[2] + 10, BOX[3] + 10])) continue;
    s += `<path d="${ps(path, f)}" fill="${fill ? fill(f) : C.land}" stroke="${opt.stroke || '#8a8a8a'}" stroke-width="${opt.sw || 0.5}"/>`;
  }
  const eq = proj([0, 0])[1];
  s += `<line x1="0" y1="${r1(eq)}" x2="${w}" y2="${r1(eq)}" stroke="${C.ink}" stroke-width="1.2" stroke-dasharray="7 5"/>`;
  return { s, proj, path, h, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` + txt(w - 8, eq - 10, '赤道', { size: 14, anchor: 'end' }) };
}
const AFR = new Set(wc.filter(c => c.region === 'Africa').map(c => c.cca3).concat(['SOL', 'ESH']));
const isAfr = f => AFR.has(isoOf(f));

// ---------- 1. 地形と国 ----------
const CNT = [
  ['エジプト', 'EGY', [29.5, 26.5], 1], ['ナイジェリア', 'NGA', [8, 9.5], 2], ['ガーナ', 'GHA', [-1.2, 7.8], 3],
  ['コートジボワール', 'CIV', [-5.6, 7.6], 4], ['エチオピア', 'ETH', [39.5, 8.5], 5], ['ケニア', 'KEN', [37.9, 0.6], 6],
  ['コンゴ民主共和国', 'COD', [23.5, -2.5], 7], ['ザンビア', 'ZMB', [27, -13.8], 8], ['ボツワナ', 'BWA', [24, -22.3], 9],
  ['南アフリカ共和国', 'ZAF', [24.5, -30], 10],
];
function figMap(mode) {
  const w = 600;
  const { s: base, proj, path, h, close } = afBase(w, 'am' + mode, f => isAfr(f) ? C.land : '#f6f5f1');
  let s = base;
  const RV = { Nile: 'ナイル川', Congo: 'コンゴ川', Niger: 'ニジェール川' };
  for (const f of rivers) if (RV[f.properties.name] || /^Nile|White Nile|Blue Nile/.test(f.properties.name || '')) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="2.2"/>`;
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const [kx, ky] = proj([37.35, -3.07]);
  s += `<path d="M${r1(kx - 8)} ${r1(ky + 6)} L${r1(kx)} ${r1(ky - 8)} L${r1(kx + 8)} ${r1(ky + 6)} Z" fill="#8a6d5a" stroke="#4f3b2e"/>`;
  if (mode === 'label') {
    s += L('サハラ砂漠', 8, 22, { size: 24, fill: '#7a5a20' });
    s += L('ナイル川', 33.5, 18.5, { size: 15, fill: '#1f4f7a', anchor: 'start' });
    s += L('コンゴ川', 17.5, 1.8, { size: 14, fill: '#1f4f7a' });
    s += L('ニジェール川', 0, 15.6, { size: 13, fill: '#1f4f7a' });
    s += L('キリマンジャロ山', 39.2, -3.5, { size: 13, anchor: 'start' });
    s += L('地中海', 18, 35, { size: 15, fill: '#1f4f7a' }) + L('大西洋', -13, -8, { size: 17, fill: '#1f4f7a' }) + L('インド洋', 46, -10, { size: 17, fill: '#1f4f7a' }) + L('ギニア湾', 3, 2.5, { size: 13, fill: '#1f4f7a' });
    CNT.forEach(([n, , p]) => { const [x, y] = proj(p); s += txt(x, y, n, { size: n.length > 6 ? 12 : 13 }); });
  } else {
    CNT.forEach(([, , p, k]) => { const [x, y] = proj(p); s += badge(x, y, k, { r: 13, size: k > 9 ? 13 : 16 }); });
    s += badge(...proj([8, 22]), 'A', { square: true }) + badge(...proj([32.6, 19]), 'ア') + badge(...proj([20.5, 1.5]), 'イ') + badge(...proj([39.5, -4]), 'B', { square: true });
  }
  return svg(w, h, s);
}

// ---------- 2. 気候帯 ----------
const png = fs.readFileSync('data/climate_africa.png').toString('base64');
const ZONES = [['熱帯雨林気候', '#2f7d4f'], ['サバナ気候', 'dotg'], ['砂漠気候', '#f4dc8a'], ['ステップ気候', 'doty'], ['温帯', '#e7a77a'], ['高山・その他', '#d6e2ec']];
function figClimate(mode) {
  const w = 520;
  const { s: base, h, close } = afBase(w, 'ac' + mode, f => isAfr(f) ? 'none' : '#f6f5f1', {
    under: (W, H) => `<image href="data:image/png;base64,${png}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" style="image-rendering:pixelated"/>`,
    stroke: '#555', sw: 0.6,
  });
  let s = `<defs><pattern id="dg${mode}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#96c478"/><rect width="2" height="2" fill="#3c6e3c"/></pattern><pattern id="dy${mode}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#ecbe6e"/><rect width="2" height="2" fill="#966e32"/></pattern></defs>` + base + close;
  const lh = 24, top = h + 8;
  ZONES.forEach(([n, col], i) => {
    const x = 10 + (i % 3) * (w / 3), y = top + Math.floor(i / 3) * lh;
    const f = col === 'dotg' ? `url(#dg${mode})` : col === 'doty' ? `url(#dy${mode})` : col;
    s += `<rect x="${r1(x)}" y="${y}" width="24" height="16" fill="${f}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + 30, y + 8.5, mode === 'label' ? n : (i < 4 ? 'PQRS'[i] : n), { size: 14, anchor: 'start', noHalo: true });
  });
  return svg(w, top + 2 * lh + 4, s);
}

// ---------- 3. 植民地（1914年ごろ・おおまかな図） ----------
const COL = {
  uk: ['イギリス', '#e9a98f', 'EGY SDN SSD UGA KEN ZAF LSO SWZ BWA ZWE ZMB MWI NGA GHA SLE GMB SOL'],
  fr: ['フランス', '#9dbcdc', 'MAR DZA TUN MRT SEN MLI GIN CIV BFA NER TCD BEN CAF COG GAB MDG DJI'],
  de: ['ドイツ', '#b9b0d3', 'TZA NAM CMR TGO RWA BDI'],
  be: ['ベルギー', '#b9d6a3', 'COD'],
  pt: ['ポルトガル', '#f0cf72', 'AGO MOZ GNB'],
  it: ['イタリア', '#d6c2a3', 'LBY ERI SOM'],
  es: ['スペイン', '#e6dcc8', 'ESH GNQ'],
  ind: ['独立国', '#ffffff', 'ETH LBR'],
};
const colOf = c => { for (const [k, v] of Object.entries(COL)) if (v[2].split(' ').includes(c)) return k; return null; };
function figColony(mode) {
  const w = 520;
  const fill = f => { if (!isAfr(f)) return '#f6f5f1'; const k = colOf(isoOf(f)); return k ? (k === 'ind' ? `url(#ind${mode})` : COL[k][1]) : C.land; };
  const { s: base, proj, h, close } = afBase(w, 'co' + mode, fill);
  let s = `<defs><pattern id="ind${mode}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><rect width="1.6" height="6" fill="#555"/></pattern></defs>` + base + close;
  const keys = mode === 'label' ? ['uk', 'fr', 'de', 'be', 'pt', 'it', 'es', 'ind'] : ['uk', 'fr'];
  const top = h + 8;
  keys.forEach((k, i) => {
    const x = 10 + (i % 4) * (w / 4), y = top + Math.floor(i / 4) * 24;
    s += `<rect x="${r1(x)}" y="${y}" width="22" height="16" fill="${k === 'ind' ? `url(#ind${mode})` : COL[k][1]}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + 28, y + 8.5, mode === 'label' ? COL[k][0] : 'XY'[i], { size: 14, anchor: 'start', noHalo: true });
  });
  if (mode === 'q') s += txt(10 + w / 2, top + 8.5, '（そのほかの国は省略）', { size: 12, weight: 400, anchor: 'start', noHalo: true });
  const rows = Math.ceil(keys.length / 4);
  return svg(w, top + rows * 24 + 4, s);
}

// ---------- 4. グラフ ----------
function share(title, rows, note, max = 60) {
  const w = 320, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 122, R = 290;
  let s = txt(w / 2, 14, title, { size: 17, noHalo: true });
  for (let v = 0; v <= max; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => {
    const y = top + i * rowH;
    s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true });
    s += `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${i < 2 ? '#3c6e9a' : '#9db7d0'}"/>`;
    s += txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true });
  });
  s += txt(w - 4, h - 6, note, { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 輸出品の割合（帯グラフ）
function exports(mode) {
  const rows = [['ナイジェリア', '原油', 75, 'X'], ['ザンビア', '銅', 75, 'Y'], ['ボツワナ', 'ダイヤモンド', 85, 'Z']];
  const w = 560, L = 110, R = 540, rowH = 46, top = 34, h = top + rows.length * rowH + 26;
  let s = txt(w / 2, 13, '主な国の輸出品の割合', { size: 17, noHalo: true });
  rows.forEach(([c, item, v, q], i) => {
    const y = top + i * rowH, x1 = L + v / 100 * (R - L);
    s += txt(L - 8, y + 16, c, { size: 15, anchor: 'end', noHalo: true });
    s += `<rect x="${L}" y="${y}" width="${r1(x1 - L)}" height="32" fill="#3c6e9a" stroke="${C.ink}" stroke-width="0.6"/><rect x="${r1(x1)}" y="${y}" width="${r1(R - x1)}" height="32" fill="#e6e1d6" stroke="${C.ink}" stroke-width="0.6"/>`;
    s += txt((L + x1) / 2, y + 16, `${mode === 'label' ? item : q}　約${v}%`, { size: 15, fill: '#fff', noHalo: true });
    s += txt((x1 + R) / 2, y + 16, 'その他', { size: 13, weight: 400, noHalo: true });
  });
  s += txt(w - 4, h - 6, '2020年代はじめごろ。おおよその割合', { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
function popGraph() {
  const data = [[1950, 2.3], [1980, 4.8], [2000, 8.2], [2020, 13.6], [2050, 24.9]];
  const w = 320, h = 230, L = 46, R = 300, top = 40, bot = 196, max = 25;
  const bw = (R - L) / data.length;
  let s = txt(w / 2, 14, 'アフリカの人口の変化', { size: 17, noHalo: true });
  for (let v = 0; v <= 25; v += 5) { const y = bot - v / max * (bot - top); s += `<line x1="${L}" y1="${r1(y)}" x2="${R}" y2="${r1(y)}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(L - 6, y, String(v), { size: 11, weight: 400, anchor: 'end', noHalo: true }); }
  s += txt(L - 6, top - 14, '億人', { size: 11, weight: 400, anchor: 'end', noHalo: true });
  data.forEach(([yr, v], i) => {
    const x = L + i * bw + 8, y = bot - v / max * (bot - top);
    s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(bw - 16)}" height="${r1(bot - y)}" fill="${yr === 2050 ? '#fff' : '#3c6e9a'}" stroke="#3c6e9a" stroke-width="1.4" ${yr === 2050 ? 'stroke-dasharray="4 3"' : ''}/>`;
    s += txt(x + (bw - 16) / 2, y - 9, String(v), { size: 12, noHalo: true });
    s += txt(x + (bw - 16) / 2, bot + 12, yr + (yr === 2050 ? '予測' : ''), { size: 11.5, weight: 400, noHalo: true });
  });
  s += txt(w - 4, h - 4, '国連の推計・予測をもとにしたおおよその値', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

const NOTE = '2022年ごろ。FAOSTATをもとにしたおおよその値';
const figs = {
  afMapLabel: figMap('label'), afMapQ: figMap('q'),
  afClimateLabel: figClimate('label'), afClimateQ: figClimate('q'),
  colonyLabel: figColony('label'), colonyQ: figColony('q'),
  shareCacao: share('カカオ豆の生産', [['コートジボワール', 38], ['ガーナ', 14], ['インドネシア', 11], ['エクアドル', 6], ['カメルーン', 5]], NOTE),
  shareCacaoQ: share('作物 W の生産', [['コートジボワール', 38], ['ガーナ', 14], ['インドネシア', 11], ['エクアドル', 6], ['カメルーン', 5]], NOTE),
  exportsLabel: exports('label'), exportsQ: exports('q'),
  afPop: popGraph(),
};
fs.writeFileSync('figs6.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

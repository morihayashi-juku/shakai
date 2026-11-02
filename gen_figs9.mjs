// 地理 第9講「オセアニア州」の図
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
const poly = c => { let p = { type: 'Polygon', coordinates: [c] }; if (d3.geoArea(p) > 2 * Math.PI) p = { type: 'Polygon', coordinates: [c.slice().reverse()] }; return p; };
const near = (f, lon0, lat0, R) => { const c = d3.geoCentroid(f); return d3.geoDistance(c, [lon0, lat0]) < R || d3.geoBounds(f)[0][0] > d3.geoBounds(f)[1][0]; };

// ---------- 1. オセアニア全体 ----------
function figOceania(mode) {
  const w = 720, h = 520;
  const proj = d3.geoMercator().rotate([-165, 0]).fitExtent([[4, 4], [w - 4, h - 4]], { type: 'MultiPoint', coordinates: [[110, 20], [-130, -50]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="oc${mode}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#oc${mode})">`;
  for (const f of countries) {
    if (!near(f, 165, -15, 1.4)) continue;
    const c = iso[f.id];
    const fill = ['AUS', 'NZL'].includes(c) ? '#e1d6bd' : C.land;
    s += `<path d="${ps(path, f)}" fill="${fill}" stroke="#777" stroke-width="0.5"/>`;
  }
  // 太平洋の島々の3つの地域（おおまかな範囲）
  const REG = [
    ['ミクロネシア', [[130, 20], [175, 20], [178, 0], [168, -2], [130, 0], [130, 20]], '#3c6e9a', [152, 13]],
    ['メラネシア', [[131, -1], [168, -2], [180, -12], [178, -22], [165, -24], [150, -12], [131, -9], [131, -1]], '#3c7a5a', [168, -16]],
    ['ポリネシア', [[-178, 27], [-150, 26], [-140, 0], [-125, -22], [-140, -32], [-170, -36], [172, -50], [165, -48], [170, -38], [178, -24], [180, -12], [179, 3], [-178, 27]], '#b5513c', [-158, -10]],
  ];
  REG.forEach(([n, c, col]) => { s += `<path d="${ps(path, poly(c))}" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="7 5"/>`; });
  const eq = proj([165, 0])[1];
  s += `<line x1="0" y1="${r1(eq)}" x2="${w}" y2="${r1(eq)}" stroke="${C.ink}" stroke-width="1" stroke-dasharray="3 4"/>`;
  s += `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` + txt(8, eq - 10, '赤道', { size: 13, anchor: 'start' });
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    REG.forEach(([n, , col, p]) => { s += L(n, p[0], p[1], { size: 17, fill: col }); });
    s += L('オーストラリア', 134, -25, { size: 20 }) + L('ニュージーランド', 174, -44, { size: 14, anchor: 'start' }) + L('パプアニューギニア', 144, -4.6, { size: 13 });
    s += L('フィジー', 178, -18.3, { size: 12, anchor: 'start' }) + L('ツバル', 179.2, -8.5, { size: 12, anchor: 'start' }) + L('ハワイ（アメリカ）', -157, 23.5, { size: 12 });
    s += L('太平洋', -170, 8, { size: 18, fill: '#1f4f7a' });
  } else {
    s += badge(...proj([134, -25]), 'A', { square: true }) + badge(...proj([172, -42]), 'B', { square: true });
    REG.forEach(([, , , p], i) => { s += badge(...proj(p), 'アイウ'[i]); });
  }
  return svg(w, h, s);
}

// ---------- 2. オーストラリアの気候 ----------
const png = fs.readFileSync('data/climate_aus.png').toString('base64');
const ABOX = [110, -48, 180, -8];
function ausBase(w, id, fill, opt = {}) {
  const box = opt.box || ABOX;
  const k = w / (box[2] - box[0]); const h = Math.round((box[3] - box[1]) * k);
  const proj = d3.geoEquirectangular().scale(k * 180 / Math.PI).translate([-box[0] * k, box[3] * k]);
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/>`;
  if (opt.under) s += opt.under(w, h);
  s += `<g clip-path="url(#${id})">`;
  for (const f of countries) { if (!near(f, 145, -28, 0.6)) continue; s += `<path d="${ps(path, f)}" fill="${fill(f)}" stroke="${opt.stroke || '#777'}" stroke-width="0.6"/>`; }
  return { s, proj, path, h, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const CITY = [['シドニー', 151.2, -33.87], ['メルボルン', 144.96, -37.81], ['パース', 115.86, -31.95], ['ダーウィン', 130.84, -12.46], ['キャンベラ', 149.13, -35.28]];
function figClimate(mode) {
  const w = 600;
  const { s: base, proj, h, close } = ausBase(w, 'acl' + mode, f => (['AUS', 'NZL'].includes(iso[f.id]) ? 'none' : '#f6f5f1'), {
    under: (W, H) => `<image href="data:image/png;base64,${png}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" style="image-rendering:pixelated"/>`, stroke: '#444',
  });
  let s = `<defs><pattern id="ady${mode}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#ecbe6e"/><rect width="2" height="2" fill="#966e32"/></pattern></defs>` + base + close;
  CITY.forEach(([n, lo, la]) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="4" fill="#fff" stroke="${C.ink}" stroke-width="1.6"/>`;
    if (mode === 'label') { const d = { 'シドニー': [8, 0, 'start'], 'メルボルン': [-8, 8, 'end'], 'パース': [-8, 0, 'end'], 'ダーウィン': [0, -13, 'middle'], 'キャンベラ': [8, 9, 'start'] }[n]; s += txt(x + d[0], y + d[1], n + (n === 'キャンベラ' ? '（首都）' : ''), { size: 13, anchor: d[2] }); }
  });
  const items = [['熱帯', '#2f7d4f', 'P'], ['砂漠気候', '#f4dc8a', 'Q'], ['ステップ気候', `url(#ady${mode})`, 'R'], ['温帯', '#e7a77a', 'S']];
  items.forEach(([n, f, q], i) => { const x = 12 + i * 140, y = h + 8; s += `<rect x="${x}" y="${y}" width="24" height="16" fill="${f}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + 30, y + 8.5, mode === 'label' ? n : q, { size: 14, anchor: 'start', noHalo: true }); });
  if (mode === 'label') { const [x, y] = proj([133, -26]); s += txt(x, y, '乾燥帯が国土の約3分の2', { size: 15 }); }
  return svg(w, h + 32, s);
}

// ---------- 3. 農業と鉱産資源 ----------
function figResources(mode) {
  const w = 600;
  const box = [111, -45, 156, -9];
  const aus = countries.find(f => iso[f.id] === 'AUS');
  const { s: base, proj, path, h, close } = ausBase(w, 'ars' + mode, f => '#f6f5f1', { box });
  let s = base + `<defs><clipPath id="ausc${mode}"><path d="${ps(path, aus)}"/></clipPath></defs><g clip-path="url(#ausc${mode})">`;
  s += `<path d="${ps(path, aus)}" fill="#f7efd9"/>`;  // 砂漠など（利用が少ない）
  const Z = {
    cattle: ['牛の放牧', '#e9a98f', [[114, -10], [155, -10], [154, -25], [150, -28], [142, -26], [136, -22], [128, -20], [121, -19], [114, -21], [114, -10]]],
    sheep: ['羊の放牧', '#b9d6a3', [[150, -28], [142, -26], [136, -27], [134, -32], [138, -35.5], [146, -37], [150, -34], [150, -28]]],
    sheepW: ['羊の放牧', '#b9d6a3', [[121, -26], [117, -26], [115, -30], [117, -34], [123, -33], [124, -30], [121, -26]]],
    wheat: ['小麦', '#f2d58a', [[150, -28.5], [147.5, -28.5], [145, -32], [142, -34.5], [141.5, -36.5], [144, -36.3], [148.5, -34], [150, -31], [150, -28.5]]],
    wheatW: ['小麦', '#f2d58a', [[116, -28], [115, -30], [116.5, -33.5], [119.5, -33.8], [121, -32], [119, -29], [116, -28]]],
    dairy: ['酪農', '#9dbcdc', [[141, -38.5], [146, -38.8], [150, -37.5], [153, -30], [151, -30], [148, -36], [141, -37.5], [141, -38.5]]],
  };
  Object.values(Z).forEach(([, col, c]) => { s += `<path d="${ps(path, poly(c))}" fill="${col}"/>`; });
  s += `</g><path d="${ps(path, aus)}" fill="none" stroke="${C.ink}" stroke-width="0.9"/>`;
  s += close;
  // 鉱産資源
  const MIN = [['鉄鉱石', [118.5, -22.6], 'tri', '#b5513c'], ['鉄鉱石', [117.3, -21.2], 'tri', '#b5513c'], ['石炭', [148.5, -22.5], 'sq', C.ink], ['石炭', [151, -32.4], 'sq', C.ink], ['ボーキサイト', [141.9, -12.6], 'dia', '#7a5ab0'], ['ボーキサイト', [136.8, -12.2], 'dia', '#7a5ab0'], ['金', [121.47, -30.75], 'cir', '#c99a1c']];
  const mark = (t, x, y, col) => t === 'tri' ? `<path d="M${r1(x)} ${r1(y - 8)} L${r1(x + 8)} ${r1(y + 6)} L${r1(x - 8)} ${r1(y + 6)} Z" fill="${col}" stroke="#fff"/>` : t === 'sq' ? `<rect x="${r1(x - 6)}" y="${r1(y - 6)}" width="12" height="12" fill="${col}" stroke="#fff"/>` : t === 'dia' ? `<path d="M${r1(x)} ${r1(y - 8)} L${r1(x + 7)} ${r1(y)} L${r1(x)} ${r1(y + 8)} L${r1(x - 7)} ${r1(y)} Z" fill="${col}" stroke="#fff"/>` : `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="${col}" stroke="#fff"/>`;
  MIN.forEach(([, ll, t, col]) => { const [x, y] = proj(ll); s += mark(t, x, y, col); });
  // 凡例（地図の下）
  const LEG = mode === 'label'
    ? [['box', '#e9a98f', '牛の放牧'], ['box', '#b9d6a3', '羊の放牧'], ['box', '#f2d58a', '小麦'], ['box', '#9dbcdc', '酪農'], ['tri', '#b5513c', '鉄鉱石'], ['sq', C.ink, '石炭'], ['dia', '#7a5ab0', 'ボーキサイト'], ['cir', '#c99a1c', '金']]
    : [['box', '#e9a98f', 'K'], ['box', '#b9d6a3', 'L'], ['box', '#f2d58a', 'M'], ['box', '#9dbcdc', '酪農'], ['tri', '#b5513c', 'X'], ['sq', C.ink, 'Y'], ['dia', '#7a5ab0', 'ボーキサイト'], ['cir', '#c99a1c', '金']];
  LEG.forEach(([t, col, n], i) => { const lx = 14 + (i % 4) * 148, ly = h + 16 + Math.floor(i / 4) * 24; s += (t === 'box' ? `<rect x="${lx}" y="${ly - 7}" width="18" height="13" fill="${col}" stroke="${C.ink}" stroke-width="0.5"/>` : mark(t, lx + 9, ly, col)) + txt(lx + 26, ly, n, { size: 14, anchor: 'start', noHalo: true }); });
  return svg(w, h + 62, s);
}

// ---------- 4. グラフ ----------
function trade() {
  const rows = [['1960年', [['イギリス', 26, '#9dbcdc'], ['日本', 17, '#e9a98f'], ['アメリカ', 8, '#b9d6a3'], ['その他', 49, '#eeeae0']]], ['2022年', [['中国', 30, '#f0cf72'], ['日本', 17, '#e9a98f'], ['韓国', 8, '#c9b3dc'], ['その他', 45, '#eeeae0']]]];
  const w = 600, h = 150, L = 70, R = 590;
  let s = txt(w / 2, 14, 'オーストラリアの輸出相手国の変化', { size: 17, noHalo: true });
  rows.forEach(([yr, parts], i) => {
    const y = 36 + i * 50; let x = L;
    s += txt(L - 8, y + 18, yr, { size: 14, anchor: 'end', noHalo: true });
    parts.forEach(([n, v, col]) => { const ww = v / 100 * (R - L); s += `<rect x="${r1(x)}" y="${y}" width="${r1(ww)}" height="36" fill="${col}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + ww / 2, y + 18, v >= 12 ? `${n} ${v}%` : `${n}`, { size: v >= 12 ? 13 : 11, noHalo: true }); x += ww; });
  });
  s += txt(w - 4, h - 6, 'おおよその割合', { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
function japanImports(mode) {
  const rows = [['石炭', 65], ['鉄鉱石', 60], ['液化天然ガス', 40]];
  const w = 340, rowH = 36, top = 42, L = 120, R = 300, h = top + rows.length * rowH + 30;
  let s = txt(w / 2, 14, mode === 'label' ? '日本の輸入にしめるオーストラリアの割合' : '日本の輸入にしめる国 Z の割合', { size: 15, noHalo: true });
  for (let v = 0; v <= 100; v += 25) { const x = L + v / 100 * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${y + 6}" width="${r1(v / 100 * (R - L))}" height="${rowH - 12}" fill="#3c6e9a"/>` + txt(L + v / 100 * (R - L) + 5, y + rowH / 2, `約${v}%`, { size: 13, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, '2023年ごろ。おおよその割合', { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// ---------- 5. 島のでき方 ----------
function islands(mode) {
  const w = 560, h = 190;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const sea = 120;
  // 火山島
  s += `<rect x="10" y="${sea}" width="250" height="60" fill="${C.sea}"/><path d="M30 180 L110 70 L130 62 L150 70 L240 180 Z" fill="#b8a07a" stroke="${C.ink}"/><line x1="10" y1="${sea}" x2="260" y2="${sea}" stroke="#4a6a85" stroke-width="1.5"/>`;
  s += `<path d="M100 82 Q130 40 160 82" fill="none" stroke="#999" stroke-dasharray="3 3"/>`;
  // サンゴ礁の島
  s += `<rect x="300" y="${sea}" width="250" height="60" fill="${C.sea}"/><path d="M330 180 L360 ${sea + 2} L392 ${sea - 6} L412 ${sea + 2} L438 ${sea + 2} L458 ${sea - 6} L490 ${sea + 2} L520 180 Z" fill="#f2e7cf" stroke="${C.ink}"/><line x1="300" y1="${sea}" x2="550" y2="${sea}" stroke="#4a6a85" stroke-width="1.5"/>`;
  s += `<line x1="300" y1="${sea - 14}" x2="550" y2="${sea - 14}" stroke="#b5513c" stroke-width="1.4" stroke-dasharray="6 4"/>` + txt(546, sea - 24, '海面が上がると…', { size: 12, anchor: 'end', fill: '#8a3a28' });
  if (mode === 'label') {
    s += txt(135, 22, '火山島', { size: 16, noHalo: true }) + txt(135, 42, '火山の噴火でできた、高い島', { size: 12, weight: 400, noHalo: true });
    s += txt(425, 22, 'サンゴ礁の島', { size: 16, noHalo: true }) + txt(425, 42, 'サンゴがつくった、低く平らな島', { size: 12, weight: 400, noHalo: true });
  } else {
    s += badge(135, 30, 'ア') + badge(425, 30, 'イ');
  }
  return svg(w, h, s);
}

const figs = {
  oceLabel: figOceania('label'), oceQ: figOceania('q'),
  ausClimLabel: figClimate('label'), ausClimQ: figClimate('q'),
  ausResLabel: figResources('label'), ausResQ: figResources('q'),
  ausTrade: trade(), jpImpLabel: japanImports('label'), jpImpQ: japanImports('q'),
  islandsLabel: islands('label'), islandsQ: islands('q'),
};
fs.writeFileSync('figs9.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

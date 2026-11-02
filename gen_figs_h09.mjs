// 歴史 第9講「ヨーロッパ人の来航と全国統一」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.12));
const japan = topojson.merge(jt, jt.objects.japan.geometries);
const wl = require('world-atlas/land-50m.json');
const w110 = require('world-atlas/land-110m.json');
const land110 = topojson.feature(w110, w110.objects.land);
const land = topojson.feature(wl, wl.objects.land);
const C = { ink: '#1d2a33', sea: '#eef4f8', land: '#ece8de' };
const r1 = n => Math.round(n * 10) / 10;
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 12;
  return `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/><text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 15}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };


const arrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;

// 大航海時代の航路
function voyages(mode) {
  const w = 760, h = 400;
  const proj = d3.geoNaturalEarth1().rotate([-20, 0]).fitExtent([[0, 0], [w, h]], { type: 'Sphere' });
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('v1' + mode, '#c0392b')}${arrowDefs('v2' + mode, '#2563a8')}${arrowDefs('v3' + mode, '#3b6a4c')}<clipPath id="sp${mode}"><path d="${path({ type: 'Sphere' })}"/></clipPath></defs><rect width="${w}" height="${h}" fill="#fff"/><path d="${path({ type: 'Sphere' })}" fill="${C.sea}" stroke="#888"/><g clip-path="url(#sp${mode})"><path d="${ps(path, land110)}" fill="#ece8de" stroke="#999" stroke-width="0.5"/></g>`;
  const R = (pts, col, mk) => `<path d="${ps(path, { type: 'LineString', coordinates: pts })}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linejoin="round" marker-end="url(#${mk})"/>`;
  const colum = [[-6.0, 37.0], [-16, 28], [-40, 24], [-62, 22], [-74.5, 24.0]];
  const gama = [[-9.1, 38.7], [-18, 20], [-12, 0], [5, -25], [18.5, -35.5], [33, -28], [40, -15], [45, -2], [60, 8], [75.8, 11.3]];
  const mag = [[-6.0, 37.0], [-20, 20], [-35, -5], [-50, -30], [-68.5, -52.5], [-80, -45], [-100, -20], [-150, 5], [170, 13], [140, 13], [123.8, 10.3]];
  const mag2 = [[123.8, 10.3], [110, -8], [80, -20], [40, -36], [18.5, -35.5], [-5, -5], [-15, 20], [-7, 36.5]];
  s += R(colum, '#c0392b', 'v1' + mode) + R(gama, '#2563a8', 'v2' + mode) + R(mag, '#3b6a4c', 'v3' + mode) + `<path d="${ps(path, { type: 'LineString', coordinates: mag2 })}" fill="none" stroke="#3b6a4c" stroke-width="2.6" stroke-dasharray="6 4"/>`;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('コロンブス（1492年）', -42, 31, { size: 12.5, fill: '#c0392b' }) + L('バスコ・ダ・ガマ（1498年）', 60, 0, { size: 12.5, fill: '#2563a8' }) + L('マゼランの船隊（1519〜22年）', -110, -8, { size: 12.5, fill: '#3b6a4c' });
    s += L('スペイン', 0, 44, { size: 11.5, anchor: 'start' }) + L('ポルトガル', -12, 38, { size: 11.5, anchor: 'end' }) + L('インド', 79, 20, { size: 12 }) + L('西インド諸島', -78, 16, { size: 11.5 }) + L('喜望峰', 20, -40, { size: 11.5 }) + L('日本', 140, 37, { size: 12 });
  } else {
    s += L('A', -42, 31, { size: 16, fill: '#c0392b' }) + L('B', 60, 0, { size: 16, fill: '#2563a8' }) + L('C', -110, -8, { size: 16, fill: '#3b6a4c' }) + L('X', 20, -40, { size: 14 });
  }
  return svg(w, h, s);
}
// 戦国〜安土桃山の地図
const P9 = [
  ['種子島（鉄砲）', 130.98, 30.6, '#c0392b', 'start', 10, 0, 'A'],
  ['鹿児島（ザビエル）', 130.55, 31.6, '#7a3fa0', 'start', 10, 6, 'B'],
  ['長崎', 129.87, 32.75, '#2f6fb0', 'end', -10, 6, 'C'],
  ['平戸', 129.55, 33.37, '#2f6fb0', 'end', -10, -4, 'D'],
  ['堺', 135.47, 34.57, '#2f6fb0', 'end', -10, 10, 'E'],
  ['安土城', 136.14, 35.15, '#8f4a2f', 'start', 10, -10, 'F'],
  ['桶狭間', 136.99, 35.07, '#3b6a4c', 'start', 10, -4, 'G'],
  ['長篠', 137.55, 34.92, '#3b6a4c', 'start', 10, 10, 'H'],
  ['大阪城', 135.53, 34.69, '#8f4a2f', 'end', -10, -8, 'I'],
  ['小田原', 139.15, 35.25, '#3b6a4c', 'start', 10, 8, 'J'],
];
function sengokuMap(mode) {
  const w = 600, h = 460;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[128.6, 30.3], [140.4, 36.6]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  P9.forEach(([n, lo, la, col, an, dx, dy, q]) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="5.5" fill="${col}" stroke="#fff" stroke-width="1.4"/>`;
    s += mode === 'label' ? txt(x + dx, y + dy, n, { size: 12.5, anchor: an, fill: col }) : badge(x + (an === 'end' ? -20 : 20), y + dy, q, { r: 10, size: 13 });
  });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 兵農分離
function heino(mode) {
  const w = 720, h = 210;
  let s = `<defs>${arrowDefs('hn' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, y, bw, bh, t, sub, fill, q) => `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${fill}" stroke="#8f4a2f" stroke-width="1.4"/>` + (mode === 'q' && q ? badge(x + bw / 2, y + 22, q, { r: 11, size: 14 }) : txt(x + bw / 2, y + 22, t, { size: 17, noHalo: true })) + sub.map((l, i) => txt(x + bw / 2, y + 48 + i * 18, l, { size: 12, weight: 400, noHalo: true })).join('');
  s += box(20, 20, 250, 96, '太閤検地', ['田畑の面積やよしあしを調べ、', '収穫量を石高で表す', '耕す農民を検地帳に登録'], '#f6efe4', 'A');
  s += box(20, 126, 250, 74, '刀狩', ['農民から刀や鉄砲を取り上げる', '（一揆を防ぐ）'], '#f6efe4', 'B');
  s += `<path d="M275 68 L400 100" stroke="#8f4a2f" stroke-width="2.4" marker-end="url(#hn${mode})"/><path d="M275 163 L400 128" stroke="#8f4a2f" stroke-width="2.4" marker-end="url(#hn${mode})"/>`;
  s += box(410, 60, 290, 96, '兵農分離', ['武士と農民の身分が', 'はっきり分かれる'], '#f3dccc', 'C');
  return svg(w, h, s);
}
const figs = { voyLabel: voyages('label'), voyQ: voyages('q'), sgMapLabel: sengokuMap('label'), sgMapQ: sengokuMap('q'), heinoLabel: heino('label'), heinoQ: heino('q') };
fs.writeFileSync('figs_h09.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

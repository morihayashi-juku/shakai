// 歴史 第11講「江戸時代の産業と文化」の図
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

// 耕地面積の変化
function kochi(mode) {
  const rows = [['室町時代の中ごろ', 95], ['1600年ごろ', 164], ['18世紀の初め', 297]];
  const w = 520, L = 140, R = 470, top = 40, rowH = 38, h = top + rows.length * rowH + 36, max = 320;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '全国の耕地面積の変化（おおよそ）', { size: 14, noHalo: true });
  for (let v = 0; v <= 300; v += 100) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 4}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#e1e5e8"/>` + txt(x, top + rows.length * rowH + 11, v + '万町歩', { size: 10.5, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 13, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${y + 7}" width="${r1(v / max * (R - L))}" height="${rowH - 14}" fill="${i === 2 ? '#b5513c' : '#9db7d0'}"/>` + txt(L + v / max * (R - L) + 5, y + rowH / 2, `約${v}万`, { size: 12.5, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, '1町歩は約1ヘクタール。歴史統計をもとにしたおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 新しい農具
function nogu(mode) {
  const w = 760, h = 200, cw = 190;
  const items = [
    ['備中ぐわ', '深く耕す', `<line x1="0" y1="-50" x2="0" y2="10" stroke="#7a5c3a" stroke-width="5"/><path d="M-26 10 L26 10" stroke="#555" stroke-width="5"/>` + [-22, -7, 7, 22].map(x => `<path d="M${x} 10 L${x * 1.1} 46" stroke="#555" stroke-width="4"/>`).join('')],
    ['千歯こき', '稲の穂から実を落とす', `<rect x="-50" y="-10" width="100" height="10" fill="#7a5c3a"/>` + Array.from({ length: 13 }, (_, k) => `<line x1="${-45 + k * 7.5}" y1="-10" x2="${-45 + k * 7.5}" y2="-42" stroke="#555" stroke-width="2"/>`).join('') + `<path d="M-46 0 L-56 44 M46 0 L56 44 M-40 0 L-40 44 M40 0 L40 44" stroke="#7a5c3a" stroke-width="4"/>`],
    ['唐箕', '風でもみがらを分ける', `<path d="M-50 -10 Q-50 -44 -16 -44 Q18 -44 18 -10 Q18 22 -16 22 Q-50 22 -50 -10 Z" fill="#c9a27e" stroke="#5a3a24" stroke-width="1.5"/><rect x="18" y="-24" width="48" height="26" fill="#c9a27e" stroke="#5a3a24" stroke-width="1.5"/><path d="M-6 -44 L-14 -62 L14 -62 L6 -44" fill="#c9a27e" stroke="#5a3a24"/><line x1="-16" y1="-10" x2="-40" y2="-26" stroke="#5a3a24" stroke-width="3"/><path d="M-36 22 L-40 46 M10 22 L14 46 M60 2 L62 46" stroke="#5a3a24" stroke-width="3"/>`],
    ['千石どおし', 'もみと米を選び分ける', `<path d="M-60 -40 L50 20" stroke="#7a5c3a" stroke-width="6"/><path d="M-60 -30 L50 30" stroke="#7a5c3a" stroke-width="6"/>` + Array.from({ length: 9 }, (_, k) => `<line x1="${-55 + k * 12}" y1="${-37 + k * 6.6}" x2="${-55 + k * 12}" y2="${-27 + k * 6.6}" stroke="#888" stroke-width="1.5"/>`).join('') + `<path d="M-50 -30 L-50 44 M40 26 L40 44" stroke="#7a5c3a" stroke-width="3"/>`],
  ];
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  items.forEach(([n, u, d], i) => {
    const cx = i * cw + cw / 2, cy = 84;
    s += `<g transform="translate(${cx} ${cy})">${d}</g>`;
    s += mode === 'label' ? txt(cx, 156, n, { size: 16, noHalo: true }) : badge(cx, 156, 'ABCD'[i], { r: 11, size: 14 });
    s += txt(cx, 182, u, { size: 12, weight: 400, noHalo: true });
  });
  return svg(w, h, s);
}
// 交通の発達
const ROUTES = {
  tokaido: [[139.77, 35.68], [139.15, 35.25], [139.03, 35.2], [138.38, 34.97], [137.73, 34.71], [136.9, 35.12], [136.68, 35.06], [135.96, 35.02], [135.77, 35.0]],
  nakasendo: [[139.77, 35.68], [139.62, 35.9], [139.0, 36.32], [138.63, 36.35], [138.08, 36.08], [137.69, 35.84], [137.5, 35.49], [136.47, 35.36], [135.96, 35.02]],
  koshu: [[139.77, 35.68], [139.32, 35.66], [138.57, 35.66], [138.08, 36.08]],
  nikko: [[139.77, 35.68], [139.88, 36.56], [139.6, 36.75]],
  oshu: [[139.88, 36.56], [140.21, 37.13]],
};
const SEA = {
  nishi: [[139.84, 38.92], [139.0, 38.3], [137.2, 37.6], [135.9, 35.9], [133.0, 35.75], [131.3, 34.6], [130.95, 33.96], [132.3, 33.9], [133.6, 34.3], [135.0, 34.5], [135.42, 34.64]],
  higashi: [[139.84, 38.92], [139.6, 40.2], [140.3, 41.55], [141.6, 41.4], [142.2, 39.6], [141.6, 38.0], [141.2, 36.8], [140.95, 35.8], [140.2, 35.1], [139.78, 35.5]],
  nankai: [[135.42, 34.64], [135.1, 34.0], [135.7, 33.4], [137.0, 34.0], [138.6, 34.35], [139.6, 34.85], [139.78, 35.55]],
};
function kotsu(mode) {
  const w = 600, h = 560;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[130.3, 33.2], [142.5, 41.9]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('k1' + mode, '#2563a8')}${arrowDefs('k2' + mode, '#3b6a4c')}${arrowDefs('k3' + mode, '#7a3fa0')}</defs><rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  const ln = (pts, col, wd, dash, mk) => `<path d="${ps(path, { type: 'LineString', coordinates: pts })}" fill="none" stroke="${col}" stroke-width="${wd}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linejoin="round" ${mk ? `marker-end="url(#${mk})"` : ''}/>`;
  s += ln(SEA.nishi, '#2563a8', 2.4, '7 4', 'k1' + mode) + ln(SEA.higashi, '#3b6a4c', 2.4, '7 4', 'k2' + mode) + ln(SEA.nankai, '#7a3fa0', 2.4, '7 4', 'k3' + mode);
  Object.entries(ROUTES).forEach(([k, pts]) => { s += ln(pts, k === 'tokaido' ? '#c0392b' : '#8f4a2f', k === 'tokaido' ? 3.4 : 2.4); });
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const dot = (lo, la, r = 5) => { const [x, y] = proj([lo, la]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#333" stroke="#fff" stroke-width="1.3"/>`; };
  s += dot(139.77, 35.68, 6) + dot(135.42, 34.64, 6) + dot(135.77, 35.0) + dot(139.84, 38.92);
  const [hx, hy] = proj([139.03, 35.2]); s += `<rect x="${r1(hx - 5)}" y="${r1(hy - 5)}" width="10" height="10" fill="#fff" stroke="#c0392b" stroke-width="2"/>`;
  if (mode === 'label') {
    s += L('江戸（日本橋）', 139.95, 35.62, { size: 12.5, anchor: 'start' }) + L('大阪', 135.3, 34.75, { size: 12.5, anchor: 'end' }) + L('京都', 135.65, 35.15, { size: 12, anchor: 'end' }) + L('酒田', 139.95, 39.05, { size: 12, anchor: 'start' }) + L('箱根の関所', 138.95, 35.0, { size: 11, anchor: 'end', fill: '#c0392b' });
    s += L('東海道', 137.6, 34.5, { size: 13, fill: '#c0392b' }) + L('中山道', 137.6, 36.1, { size: 12, fill: '#8f4a2f' }) + L('甲州道中', 138.9, 35.85, { size: 10.5, fill: '#8f4a2f' }) + L('日光道中', 140.1, 36.75, { size: 10.5, fill: '#8f4a2f', anchor: 'start' }) + L('奥州道中', 140.35, 37.2, { size: 10.5, fill: '#8f4a2f', anchor: 'start' });
    s += L('西廻り航路', 134.0, 36.2, { size: 13, fill: '#2563a8' }) + L('東廻り航路', 142.5, 38.4, { size: 13, fill: '#3b6a4c', anchor: 'end' }) + L('南海路', 137.0, 33.6, { size: 13, fill: '#7a3fa0' });
  } else {
    s += L('ア', 137.6, 34.5, { size: 16, fill: '#c0392b' }) + L('イ', 137.6, 36.1, { size: 16, fill: '#8f4a2f' }) + badge(...proj([134.0, 36.2]), 'A') + badge(...proj([142.2, 38.4]), 'B') + badge(...proj([137.0, 33.6]), 'C') + L('X', 138.95, 35.0, { size: 14, anchor: 'end', fill: '#c0392b' }) + L('Y', 139.95, 35.62, { size: 14, anchor: 'start' }) + L('Z', 135.3, 34.75, { size: 14, anchor: 'end' });
  }
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
const figs = { kochiLabel: kochi('label'), noguLabel: nogu('label'), noguQ: nogu('q'), kotsuLabel: kotsu('label'), kotsuQ: kotsu('q') };
fs.writeFileSync('figs_h11.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

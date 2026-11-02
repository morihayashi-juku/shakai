// 歴史 第8講「室町時代」の図
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

// 室町幕府のしくみ
function shikumi(mode) {
  const w = 720, h = 250;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, y, bw, t, sub, fill, q) => `<rect x="${x}" y="${y}" width="${bw}" height="42" rx="5" fill="${fill}" stroke="#8f4a2f" stroke-width="1.3"/>` + (mode === 'q' && q ? badge(x + bw / 2, y + 21, q, { r: 11, size: 14 }) : txt(x + bw / 2, y + (sub ? 14 : 21), t, { size: 14.5, noHalo: true })) + (sub && !(mode === 'q' && q) ? txt(x + bw / 2, y + 31, sub, { size: 10.5, weight: 400, noHalo: true }) : '');
  const ln = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#555" stroke-width="1.5" fill="none"/>`;
  s += box(260, 12, 120, '将軍', '', '#f3dccc');
  s += ln(320, 54, 320, 70) + box(250, 70, 140, '管領', '将軍を補佐（有力な守護大名）', '#f6efe4', 'A');
  s += ln(320, 112, 320, 126) + ln(130, 126, 510, 126);
  [[70, '侍所', '京都の警備'], [260, '政所', '財政'], [450, '問注所', '記録など']].forEach(([x, t, sub]) => { s += ln(x + 60, 126, x + 60, 140) + box(x, 140, 120, t, sub, '#f6efe4'); });
  s += ln(380, 33, 560, 33) + ln(560, 33, 560, 50) + box(490, 50, 180, '鎌倉府', '関東を支配', '#e6eef2', 'B');
  s += `<line x1="20" y1="196" x2="700" y2="196" stroke="#bbb" stroke-dasharray="4 3"/>` + txt(40, 218, '地方', { size: 13, noHalo: true, fill: '#8f4a2f', anchor: 'start' });
  s += box(110, 202, 300, '守護', '国を支配し、守護大名とよばれた', '#e6eef2', 'C') + box(450, 202, 160, '地頭', '', '#e6eef2');
  return svg(w, h, s);
}
// 勘合
function kango(mode) {
  const w = 520, h = 190;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<rect x="40" y="40" width="200" height="90" fill="#f6efe0" stroke="#7a5c3a" stroke-width="1.5"/><rect x="280" y="40" width="200" height="90" fill="#f6efe0" stroke="#7a5c3a" stroke-width="1.5"/>`;
  s += `<rect x="180" y="50" width="60" height="70" fill="none" stroke="#c0392b" stroke-width="2"/><rect x="280" y="50" width="60" height="70" fill="none" stroke="#c0392b" stroke-width="2"/>`;
  s += txt(210, 85, '本字', { size: 18, noHalo: true, fill: '#c0392b' }) + txt(310, 85, '壱號', { size: 18, noHalo: true, fill: '#c0392b' });
  s += `<line x1="260" y1="30" x2="260" y2="140" stroke="#555" stroke-dasharray="5 4"/>`;
  s += txt(140, 155, mode === 'label' ? '日本の船が持っていく' : '日本の船が持っていく', { size: 12.5, noHalo: true, weight: 400 }) + txt(380, 155, '明の役所にある台帳', { size: 12.5, noHalo: true, weight: 400 });
  s += txt(w / 2, 16, mode === 'label' ? '勘合（2つを合わせて正式な貿易船かどうかを確かめた）' : '日明貿易で使われた合い札', { size: 13.5, noHalo: true });
  s += txt(w / 2, 178, mode === 'label' ? '→ 倭寇と区別するため' : '', { size: 12.5, noHalo: true, fill: '#8f4a2f' });
  return svg(w, h, s);
}
// 15世紀の東アジア
function ea15(mode) {
  const w = 620, h = 460;
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[110, 21], [146, 46]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('e1' + mode, '#c0392b')}${arrowDefs('e2' + mode, '#2563a8')}${arrowDefs('e3' + mode, '#3b6a4c')}</defs><rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.6"/><path d="${ps(path, japan)}" fill="#efe3c9" stroke="#888" stroke-width="0.6"/>`;
  const r = (pts, col, mk) => `<path d="${ps(path, { type: 'LineString', coordinates: pts })}" fill="none" stroke="${col}" stroke-width="2.4" stroke-dasharray="6 4" marker-end="url(#${mk})"/>`;
  s += r([[130.4, 33.6], [127, 31.5], [122.0, 29.9]], '#c0392b', 'e1' + mode);
  s += r([[130.0, 34.0], [129.0, 35.0]], '#2563a8', 'e2' + mode);
  s += r([[127.7, 26.2], [122, 24], [116, 22.0]], '#3b6a4c', 'e3' + mode);
  s += `<ellipse cx="${r1(proj([125.5, 33.0])[0])}" cy="${r1(proj([125.5, 33.0])[1])}" rx="58" ry="34" fill="#c0392b" fill-opacity="0.08" stroke="#c0392b" stroke-dasharray="3 3"/>`;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const dot = (lo, la) => { const [x, y] = proj([lo, la]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="#333" stroke="#fff" stroke-width="1.3"/>`; };
  s += dot(127.7, 26.2);
  if (mode === 'label') {
    s += L('明', 115.5, 33, { size: 22 }) + L('朝鮮', 127.3, 38.6, { size: 16 }) + L('日本（室町幕府）', 136.5, 35.8, { size: 14, fill: '#8f4a2f' }) + L('琉球王国', 127.9, 25.3, { size: 14, fill: '#3b6a4c' }) + L('首里', 128.4, 26.4, { size: 11, anchor: 'start' });
    s += L('蝦夷地（アイヌの人々）', 142.8, 44.2, { size: 12.5 }) + L('倭寇が活動', 125.5, 34.6, { size: 12, fill: '#c0392b' });
    s += L('日明貿易（勘合貿易）', 124.8, 30.4, { size: 12, fill: '#c0392b' }) + L('日朝貿易', 130.3, 35.0, { size: 11.5, fill: '#2563a8', anchor: 'start' }) + L('東南アジアへ（中継貿易）', 118, 23.5, { size: 11.5, fill: '#3b6a4c' });
  } else {
    s += badge(...proj([115.5, 33]), 'A') + badge(...proj([127.3, 38.6]), 'B') + badge(...proj([127.9, 25.3]), 'C') + badge(...proj([142.8, 44.2]), 'D') + L('X', 124.8, 30.4, { size: 15, fill: '#c0392b' }) + L('Y の活動範囲', 125.5, 34.6, { size: 12, fill: '#c0392b' });
  }
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 一揆・都市・戦国大名の地図
const PTS = [
  ['京都（応仁の乱）', 135.76, 35.02, '#8f4a2f', 'end', -10, -14, 'A'],
  ['正長の土一揆（近江）', 136.1, 35.1, '#c0392b', 'start', 10, -8, 'B'],
  ['山城国一揆', 135.8, 34.85, '#c0392b', 'start', 10, 12, 'C'],
  ['加賀の一向一揆', 136.55, 36.45, '#c0392b', 'end', -10, 0, 'D'],
  ['堺（自治都市）', 135.47, 34.57, '#2f6fb0', 'end', -10, 12, 'E'],
  ['博多（自治都市）', 130.4, 33.6, '#2f6fb0', 'start', 10, -10, 'F'],
];
const DAI = [['伊達', 140.9, 38.1], ['上杉', 138.4, 37.3], ['武田', 138.45, 35.85], ['北条', 139.6, 35.55], ['今川', 138.2, 34.85], ['織田', 136.9, 35.3], ['毛利', 132.3, 34.6], ['長宗我部', 133.5, 33.6], ['大友', 131.5, 33.2], ['龍造寺', 130.2, 33.25], ['伊東', 131.35, 32.25], ['島津', 130.5, 31.6]];
function ikkiMap(mode) {
  const w = 600, h = 470;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[130.2, 32.8], [139.2, 37.0]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  PTS.forEach(([n, lo, la, col, an, dx, dy, q]) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="${col}" stroke="#fff" stroke-width="1.5"/>`;
    s += mode === 'label' ? txt(x + dx, y + dy, n, { size: 13, anchor: an, fill: col }) : badge(x + (an === 'end' ? -20 : 20), y + dy, q, { r: 11, size: 14 });
  });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
function daimyoMap(mode) {
  const w = 600, h = 470;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[129.5, 31.0], [141.8, 39.0]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  DAI.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += `<rect x="${r1(x - n.length * 7.5 - 4)}" y="${r1(y - 11)}" width="${n.length * 15 + 8}" height="22" rx="4" fill="${['伊東', '島津', '大友'].includes(n) ? '#f3dccc' : '#fff'}" stroke="#8f4a2f"/>` + txt(x, y, n, { size: 14, noHalo: true }); });
  s += txt(w - 12, h - 14, mode === 'label' ? '16世紀なかごろのおもな戦国大名' : '', { size: 12, noHalo: true, anchor: 'end', weight: 400 });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
const figs = { mmShikumiLabel: shikumi('label'), mmShikumiQ: shikumi('q'), kangoLabel: kango('label'), kangoQ: kango('q'), ea15Label: ea15('label'), ea15Q: ea15('q'), ikkiLabel: ikkiMap('label'), ikkiQ: ikkiMap('q'), daimyoLabel: daimyoMap('label') };
fs.writeFileSync('figs_h08.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

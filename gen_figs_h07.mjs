// 歴史 第7講「鎌倉時代」の図
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
// 御恩と奉公
function goon(mode) {
  const w = 680, h = 230;
  let s = `<defs>${arrowDefs('g1' + mode, '#c0392b')}${arrowDefs('g2' + mode, '#2563a8')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<rect x="30" y="70" width="150" height="80" rx="10" fill="#f3dccc" stroke="#8f4a2f" stroke-width="1.5"/>` + (mode === 'q' ? badge(105, 110, 'A') : txt(105, 110, '将軍', { size: 22, noHalo: true }));
  s += `<rect x="500" y="70" width="150" height="80" rx="10" fill="#e6eef2" stroke="#2f5f8a" stroke-width="1.5"/>` + (mode === 'q' ? badge(575, 110, 'B') : txt(575, 110, '御家人', { size: 22, noHalo: true }));
  s += `<path d="M185 88 L495 88" stroke="#c0392b" stroke-width="3" marker-end="url(#g1${mode})"/>` + (mode === 'q' ? badge(340, 66, 'X', { r: 11, size: 14 }) : txt(340, 66, '御恩', { size: 18, noHalo: true, fill: '#c0392b' }));
  s += txt(340, 30, '先祖からの領地を守る・手がらに応じて新しい領地をあたえる', { size: 12.5, noHalo: true, weight: 400 });
  s += `<path d="M495 134 L185 134" stroke="#2563a8" stroke-width="3" marker-end="url(#g2${mode})"/>` + (mode === 'q' ? badge(340, 156, 'Y', { r: 11, size: 14 }) : txt(340, 156, '奉公', { size: 18, noHalo: true, fill: '#2563a8' }));
  s += txt(340, 192, '戦いのときは命がけで戦う・京都や鎌倉の警備をする（「いざ鎌倉」）', { size: 12.5, noHalo: true, weight: 400 });
  s += txt(w / 2, h - 12, mode === 'label' ? '土地を仲立ちとした主従関係（封建制度）' : '', { size: 12.5, noHalo: true, fill: '#8f4a2f' });
  return svg(w, h, s);
}
// 鎌倉幕府のしくみ
function shikumi(mode) {
  const w = 720, h = 270;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, y, bw, t, sub, fill, q) => `<rect x="${x}" y="${y}" width="${bw}" height="42" rx="5" fill="${fill}" stroke="#8f4a2f" stroke-width="1.3"/>` + (mode === 'q' && q ? badge(x + bw / 2, y + 21, q, { r: 11, size: 14 }) : txt(x + bw / 2, y + (sub ? 14 : 21), t, { size: 14.5, noHalo: true })) + (sub && !(mode === 'q' && q) ? txt(x + bw / 2, y + 31, sub, { size: 10.5, weight: 400, noHalo: true }) : '');
  const ln = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#555" stroke-width="1.5" fill="none"/>`;
  s += box(300, 12, 120, '将軍', '', '#f3dccc');
  s += ln(360, 54, 360, 70) + box(290, 70, 140, '執権', '将軍を補佐（北条氏）', '#f6efe4', 'A');
  s += ln(360, 112, 360, 126) + ln(110, 126, 610, 126);
  [[50, '侍所', '御家人の統率', 'B'], [200, '政所', '財政など', ''], [350, '問注所', '裁判', ''], [520, '六波羅探題', '朝廷の監視（京都）', 'C']].forEach(([x, t, sub, q], i) => { const bw = i === 3 ? 160 : 120; s += ln(x + bw / 2, 126, x + bw / 2, 140) + box(x, 140, bw, t, sub, '#f6efe4', q); });
  s += `<line x1="20" y1="200" x2="700" y2="200" stroke="#bbb" stroke-dasharray="4 3"/>` + txt(40, 222, '地方', { size: 13, noHalo: true, fill: '#8f4a2f', anchor: 'start' });
  s += box(110, 210, 220, '守護', '国ごとに置く・軍事や警察', '#e6eef2', 'D') + box(380, 210, 240, '地頭', '荘園・公領ごとに置く・年貢の取り立て', '#e6eef2', 'E');
  return svg(w, h, s);
}
// 元寇の地図
function genko(mode) {
  const w = 620, h = 440;
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[114, 28], [134.5, 41.5]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('gk1' + mode, '#c0392b')}${arrowDefs('gk2' + mode, '#7a3fa0')}</defs><rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.6"/><path d="${ps(path, japan)}" fill="#efe3c9" stroke="#888" stroke-width="0.6"/>`;
  const r = (pts, col, mk, dash) => `<path d="${ps(path, { type: 'LineString', coordinates: pts })}" fill="none" stroke="${col}" stroke-width="2.6" ${dash ? 'stroke-dasharray="7 4"' : ''} marker-end="url(#${mk})"/>`;
  s += r([[128.6, 35.1], [129.3, 34.5], [129.7, 33.8], [130.3, 33.65]], '#c0392b', 'gk1' + mode, false);
  s += r([[121.6, 29.9], [125.0, 31.0], [128.0, 32.6], [129.6, 33.35]], '#7a3fa0', 'gk2' + mode, true);
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const dot = (lo, la, c = '#333') => { const [x, y] = proj([lo, la]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="${c}" stroke="#fff" stroke-width="1.3"/>`; };
  s += dot(116.4, 39.9) + dot(130.4, 33.6, '#c0392b') + dot(139.55, 35.32);
  if (mode === 'label') {
    s += L('元', 117.5, 35.5, { size: 22 }) + L('大都（元の都）', 116.4, 39.3, { size: 12 }) + L('高麗', 127.2, 37.6, { size: 15 }) + L('日本', 133.0, 34.8, { size: 16, fill: '#8f4a2f' });
    s += L('博多湾', 130.55, 33.95, { size: 13, fill: '#c0392b', anchor: 'start' }) + L('対馬', 129.45, 34.45, { size: 11, anchor: 'start' }) + L('壱岐', 129.6, 33.8, { size: 11, anchor: 'end' });
    s += L('朝鮮半島から（文永の役・弘安の役）', 124.0, 34.8, { size: 11.5, fill: '#c0392b' }) + L('中国の南部から（弘安の役）', 123.5, 30.0, { size: 11.5, fill: '#7a3fa0' });
  } else {
    s += badge(...proj([117.5, 35.5]), 'A') + badge(...proj([127.2, 37.6]), 'B');
    const [x, y] = proj([130.4, 33.6]); s += badge(x + 22, y - 10, 'X', { r: 11, size: 14 });
  }
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
const figs = { goonLabel: goon('label'), goonQ: goon('q'), kmShikumiLabel: shikumi('label'), kmShikumiQ: shikumi('q'), genkoLabel: genko('label'), genkoQ: genko('q') };
fs.writeFileSync('figs_h07.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

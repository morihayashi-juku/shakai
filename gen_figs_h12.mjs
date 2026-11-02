// 歴史 第12講「江戸幕府の改革」の図
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

// 改革の流れ（年代の帯）
function kaikaku(mode) {
  const w = 760, h = 200, L = 30, R = 730, Y0 = 1680, Y1 = 1860;
  const X = y => L + (y - Y0) / (Y1 - Y0) * (R - L);
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<line x1="${L}" y1="150" x2="${R}" y2="150" stroke="#333" stroke-width="1.6"/>`;
  for (let y = 1700; y <= 1850; y += 50) s += `<line x1="${r1(X(y))}" y1="144" x2="${r1(X(y))}" y2="156" stroke="#333"/>` + txt(X(y), 170, y + '年', { size: 12, weight: 400, noHalo: true });
  const B = [['綱吉の政治', '徳川綱吉', 1680, 1709, '#e9e2d4', ''], ['享保の改革', '徳川吉宗', 1716, 1745, '#f3dccc', 'A'], ['田沼の政治', '田沼意次', 1767, 1786, '#e4e8f2', 'B'], ['寛政の改革', '松平定信', 1787, 1793, '#e2eedf', 'C'], ['天保の改革', '水野忠邦', 1841, 1843, '#f3ead0', 'D']];
  B.forEach(([n, p, a, b, c, q], i) => {
    const x1 = X(a), x2 = Math.max(X(b), x1 + 8), y = i % 2 ? 76 : 30;
    s += `<rect x="${r1(x1)}" y="${y + 34}" width="${r1(x2 - x1)}" height="12" fill="#8f4a2f"/>` + `<line x1="${r1((x1 + x2) / 2)}" y1="${y + 46}" x2="${r1((x1 + x2) / 2)}" y2="144" stroke="#8f4a2f" stroke-dasharray="3 3"/>`;
    const cx = Math.min(Math.max((x1 + x2) / 2, 70), w - 70);
    s += `<rect x="${r1(cx - 62)}" y="${y - 4}" width="124" height="38" rx="6" fill="${c}" stroke="#8f4a2f"/>`;
    s += mode === 'q' && q ? badge(cx, y + 6, q, { r: 9, size: 12 }) + txt(cx, y + 24, p, { size: 12, noHalo: true, weight: 400 }) : txt(cx, y + 8, n, { size: 13.5, noHalo: true }) + txt(cx, y + 24, p, { size: 12, noHalo: true, weight: 400 });
  });
  s += txt(w - 8, h - 8, mode === 'label' ? '帯は政治・改革が行われた期間（おおよそ）' : '', { size: 10.5, anchor: 'end', noHalo: true, weight: 400 });
  return svg(w, h, s);
}
// 外国船の接近
function gaikoku(mode) {
  const w = 560, h = 560;
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[127.5, 30.5], [149.5, 53.5]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('gk' + mode, '#c0392b')}</defs><rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.6"/><path d="${ps(path, japan)}" fill="#efe3c9" stroke="#888" stroke-width="0.6"/>`;
  const P = [['根室', 145.58, 43.33, 'ラクスマン（ロシア）1792年', 'end', -10, 22, 'A'], ['長崎', 129.87, 32.75, 'レザノフ（ロシア）1804年・フェートン号（イギリス）1808年', 'start', 10, 16, 'B'], ['浦賀', 139.72, 35.23, 'モリソン号（アメリカ）1837年', 'start', 10, 6, 'C']];
  P.forEach(([n, lo, la, t, an, dx, dy, q]) => { const [x, y] = proj([lo, la]); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="#c0392b" stroke="#fff" stroke-width="1.4"/>` + (mode === 'label' ? txt(x + dx, y + dy - 8, n, { size: 13, anchor: an }) + txt(x + dx, y + dy + 8, t, { size: 11, anchor: an, fill: '#c0392b' }) : badge(x + 18, y + dy * 0.5, q, { r: 11, size: 14 })); });
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  s += L('樺太', 142.6, 50.5, { size: 13 }) + (mode === 'label' ? L('間宮林蔵が調査（1808〜09年）', 141.0, 52.6, { size: 11, fill: '#3b6a4c', anchor: 'end' }) : '');
  s += L('ロシア', 136, 49, { size: 16 }) + L('蝦夷地', 142.7, 43.4, { size: 12 });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
const figs = { kaikakuLabel: kaikaku('label'), kaikakuQ: kaikaku('q'), gaikokuLabel: gaikoku('label'), gaikokuQ: gaikoku('q') };
fs.writeFileSync('figs_h12.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

// 歴史 第13講「欧米の近代化と開国」の図
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

// 三角貿易
function sankaku(mode) {
  const w = 620, h = 300;
  let s = `<defs>${arrowDefs('sk' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  const node = (x, y, t, q) => `<circle cx="${x}" cy="${y}" r="44" fill="#f6efe4" stroke="#8f4a2f" stroke-width="1.6"/>` + (mode === 'q' && q ? badge(x, y, q) : txt(x, y, t, { size: 18, noHalo: true }));
  s += node(110, 70, 'イギリス', 'A') + node(510, 70, '清', 'B') + node(310, 240, 'インド', 'C');
  const ar = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8f4a2f" stroke-width="2.6" marker-end="url(#sk${mode})"/>`;
  s += ar(140, 104, 270, 205) + ar(352, 220, 475, 108) + ar(462, 66, 160, 66);
  s += txt(175, 165, mode === 'q' ? 'X' : '綿織物', { size: 15, noHalo: true, fill: '#2563a8', anchor: 'end' }) + txt(450, 165, mode === 'q' ? 'Y' : 'アヘン', { size: 15, noHalo: true, fill: '#c0392b', anchor: 'start' }) + txt(310, 50, mode === 'q' ? 'Z' : '茶（銀で支払い）', { size: 15, noHalo: true, fill: '#3b6a4c' });
  s += txt(310, 290, mode === 'label' ? '19世紀のイギリス・インド・清の三角貿易' : '19世紀の貿易', { size: 12.5, noHalo: true, weight: 400 });
  return svg(w, h, s);
}
// 開港地
function kaiko(mode) {
  const w = 560, h = 560;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[129.3, 32.3], [142.0, 42.4]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  const P = [['函館', 140.73, 41.77, 'both', 'start', 10, 0, 'A'], ['下田', 138.94, 34.68, 'wa', 'start', 10, 8, 'B'], ['神奈川（横浜）', 139.64, 35.44, 'tsu', 'end', -10, -10, 'C'], ['新潟', 139.02, 37.92, 'tsu', 'end', -10, 0, 'D'], ['兵庫（神戸）', 135.18, 34.69, 'tsu', 'end', -10, -8, 'E'], ['長崎', 129.87, 32.75, 'tsu', 'start', 10, 0, 'F']];
  P.forEach(([n, lo, la, k, an, dx, dy, q]) => {
    const [x, y] = proj([lo, la]);
    s += k === 'wa' ? `<rect x="${r1(x - 6)}" y="${r1(y - 6)}" width="12" height="12" fill="#c0392b" stroke="#fff" stroke-width="1.3"/>` : k === 'both' ? `<rect x="${r1(x - 7)}" y="${r1(y - 7)}" width="14" height="14" fill="#c0392b" stroke="#fff"/><circle cx="${r1(x)}" cy="${r1(y)}" r="4" fill="#2563a8"/>` : `<circle cx="${r1(x)}" cy="${r1(y)}" r="6.5" fill="#2563a8" stroke="#fff" stroke-width="1.3"/>`;
    s += mode === 'label' ? txt(x + dx, y + dy, n, { size: 13, anchor: an }) : badge(x + (an === 'end' ? -20 : 20), y + dy, q, { r: 11, size: 14 });
  });
  const [ux, uy] = proj([139.72, 35.23]); s += `<path d="M${r1(ux)} ${r1(uy - 7)} L${r1(ux + 6)} ${r1(uy + 5)} L${r1(ux - 6)} ${r1(uy + 5)} Z" fill="#333"/>` + (mode === 'label' ? txt(ux + 9, uy + 10, '浦賀', { size: 13, anchor: 'start' }) : txt(ux + 9, uy + 10, 'X', { size: 14, anchor: 'start' }));
  const lx = w - 210, ly = h - 80;
  s += `<rect x="${lx}" y="${ly}" width="200" height="70" fill="#fff" stroke="#999"/><rect x="${lx + 10}" y="${ly + 14}" width="12" height="12" fill="#c0392b"/>` + txt(lx + 30, ly + 20, mode === 'label' ? '日米和親条約で開港' : '1854年の条約で開港', { size: 12, anchor: 'start', noHalo: true }) + `<circle cx="${lx + 16}" cy="${ly + 48}" r="6.5" fill="#2563a8"/>` + txt(lx + 30, ly + 48, mode === 'label' ? '日米修好通商条約で開港' : '1858年の条約で開港', { size: 12, anchor: 'start', noHalo: true });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 幕末の流れ
function bakumatsu(mode) {
  const w = 760, h = 150;
  const E = [['1853', 'ペリー来航', ''], ['1854', '日米和親条約', 'A'], ['1858', '日米修好通商条約', 'B'], ['1860', '桜田門外の変', 'C'], ['1866', '薩長同盟', 'D'], ['1867', '大政奉還', 'E'], ['1868', '戊辰戦争', '']];
  let s = `<defs>${arrowDefs('bk' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  E.forEach(([y, t, q], i) => {
    const x = 6 + i * 108;
    s += `<rect x="${x}" y="24" width="98" height="96" rx="8" fill="${i === 5 ? '#f3dccc' : '#f6efe4'}" stroke="#8f4a2f" stroke-width="1.2"/>` + txt(x + 49, 42, y + '年', { size: 13.5, noHalo: true, fill: '#8e2a1f' });
    if (mode === 'q' && q) s += badge(x + 49, 78, q, { r: 11, size: 14 });
    else { const parts = t.length > 6 ? [t.slice(0, Math.ceil(t.length / 2)), t.slice(Math.ceil(t.length / 2))] : [t]; parts.forEach((p, k) => { s += txt(x + 49, 76 + k * 20 - (parts.length - 1) * 10, p, { size: 13.5, noHalo: true }); }); }
    if (i < 6) s += `<line x1="${x + 99}" y1="72" x2="${x + 106}" y2="72" stroke="#8f4a2f" stroke-width="2" marker-end="url(#bk${mode})"/>`;
  });
  s += txt(w / 2, 12, '開国から江戸幕府の滅亡まで', { size: 13.5, noHalo: true });
  return svg(w, h, s);
}
// 開国直後の貿易
function boeki(mode) {
  const w = 700, h = 170;
  const EX = [['生糸', 79, '#e9a98f'], ['茶', 11, '#a9cf98'], ['その他', 10, '#eeeae0']];
  const IM = [['毛織物', 40, '#9dbcdc'], ['綿織物', 34, '#e9c98f'], ['武器', 7, '#c0a0a0'], ['艦船', 6, '#a0b8a0'], ['その他', 13, '#eeeae0']];
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '1865年の日本のおもな輸出品と輸入品（金額の割合）', { size: 13.5, noHalo: true });
  const row = (y, lab, arr, qi) => { let x = 80; let r = txt(70, y + 18, lab, { size: 14, anchor: 'end', noHalo: true }); arr.forEach(([n, v, c], i) => { const ww = v / 100 * 600; const t = mode === 'q' && i === 0 ? qi : n; r += `<rect x="${r1(x)}" y="${y}" width="${r1(ww)}" height="36" fill="${c}" stroke="#333" stroke-width="0.6"/>` + (ww > 54 ? txt(x + ww / 2, y + 18, `${t} ${v}%`, { size: 13, noHalo: true }) : txt(x + ww / 2, y + 48, `${t}`, { size: 10.5, noHalo: true })); x += ww; }); return r; };
  s += row(32, '輸出', EX, 'X') + row(100, '輸入', IM, 'Y');
  s += txt(w - 4, h - 4, '石井孝『幕末貿易史の研究』などをもとにしたおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const figs = { sankakuLabel: sankaku('label'), sankakuQ: sankaku('q'), kaikoLabel: kaiko('label'), kaikoQ: kaiko('q'), bakuLabel: bakumatsu('label'), bakuQ: bakumatsu('q'), boekiLabel: boeki('label'), boekiQ: boeki('q') };
fs.writeFileSync('figs_h13.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

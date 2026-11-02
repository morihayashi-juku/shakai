// 歴史 第15講「日清・日露戦争」の図
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



// 日清・日露戦争の地図
function senso(mode) {
  const w = 560, h = 640;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[116.5, 21.5], [146.0, 51.5]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  const P = p => proj(p);
  let s = `<defs>${arrowDefs('ss' + mode, '#333')}<pattern id="hat${mode}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#c0392b" stroke-width="2"/></pattern></defs>`;
  s += `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.6"/>`;
  // 樺太南部（北緯50度以南）を斜線
  const sak = { type: 'Polygon', coordinates: [[[141.5, 45.8], [141.5, 50], [144.8, 50], [144.8, 45.8], [141.5, 45.8]]] };
  s += `<clipPath id="sk${mode}"><path d="${path(sak)}"/></clipPath><path d="${ps(path, land)}" fill="url(#hat${mode})" clip-path="url(#sk${mode})"/>`;
  const [ax, ay] = P([141.6, 50]), [bx, by] = P([144.6, 50]);
  s += `<line x1="${r1(ax)}" y1="${r1(ay)}" x2="${r1(bx)}" y2="${r1(by)}" stroke="#c0392b" stroke-width="1.6"/>` + (mode === 'label' ? txt(bx + 4, by, '北緯50度', { size: 11, anchor: 'start' }) : '');
  // 台湾を斜線（clipで）
  const tw = { type: 'Polygon', coordinates: [[[119.2, 21.8], [119.2, 25.4], [122.2, 25.4], [122.2, 21.8], [119.2, 21.8]]] };
  s += `<clipPath id="tw${mode}"><path d="${path(tw)}"/></clipPath><path d="${ps(path, land)}" fill="url(#hat${mode})" clip-path="url(#tw${mode})"/>`;
  // 南満州鉄道
  const rail = [[125.3, 43.9], [124.4, 43.2], [123.4, 41.8], [122.8, 40.7], [121.6, 38.92], [121.25, 38.81]].map(P);
  s += `<path d="M${rail.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L')}" fill="none" stroke="#222" stroke-width="3.2"/><path d="M${rail.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L')}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 5"/>`;
  const dot = (p, r = 4.5, fill = '#c0392b') => { const [x, y] = P(p); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${fill}" stroke="#fff" stroke-width="1.2"/>`; };
  s += dot([121.25, 38.81]) + dot([123.4, 41.8]) + dot([130.95, 33.95], 4.5, '#2563a8');
  const [tx, ty] = P([130.0, 34.55]); s += `<path d="M${r1(tx)} ${r1(ty - 7)} L${r1(tx + 7)} ${r1(ty + 5)} L${r1(tx - 7)} ${r1(ty + 5)} Z" fill="#333"/>`;
  const lab = (p, t, q, dx, dy, an = 'start', size = 13.5) => { const [x, y] = P(p); return mode === 'label' ? txt(x + dx, y + dy, t, { size, anchor: an, weight: 700 }) : (q ? badge(x + dx + (an === 'end' ? -10 : 10), y + dy, q, { r: 11, size: 14 }) : txt(x + dx, y + dy, t, { size, anchor: an, weight: 700 })); };
  s += lab([121.0, 23.6], '台湾', 'A', 14, 0);
  s += lab([121.25, 38.81], '旅順', 'B', -8, 10, 'end');
  s += lab([122.3, 40.0], '遼東半島', '', -6, 0, 'end', 12.5);
  s += lab([123.4, 41.8], '奉天', 'C', -8, 0, 'end');
  s += lab([124.6, 43.3], '南満州鉄道', 'D', 10, -4, 'start', 12.5);
  s += lab([143.0, 48.0], '樺太南部', 'E', 18, 0);
  s += lab([130.0, 34.55], '日本海海戦', 'F', -10, -10, 'end', 12.5);
  s += lab([130.95, 33.95], '下関', '', 8, 14, 'start', 12);
  if (mode === 'label') s += txt(...P([127.6, 37.6]), '朝鮮（韓国）', { size: 13 }) + txt(...P([116.8, 33.0]).map((v, i) => i ? v : v + 26), '清', { size: 14 }) + txt(...P([129.0, 47.0]), 'ロシア', { size: 14 }) + txt(...P([139.0, 37.5]), '日本', { size: 14 });
  const lx = w - 200, ly = h - 88;
  s += `<rect x="${lx}" y="${ly}" width="190" height="78" fill="#fff" stroke="#999"/><rect x="${lx + 10}" y="${ly + 10}" width="22" height="14" fill="url(#hat${mode})" stroke="#c0392b"/>` + txt(lx + 40, ly + 17, '戦争で日本の領土に', { size: 11.5, anchor: 'start', noHalo: true }) + `<line x1="${lx + 10}" y1="${ly + 40}" x2="${lx + 32}" y2="${ly + 40}" stroke="#222" stroke-width="3.2"/><line x1="${lx + 10}" y1="${ly + 40}" x2="${lx + 32}" y2="${ly + 40}" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 5"/>` + txt(lx + 40, ly + 40, '鉄道', { size: 11.5, anchor: 'start', noHalo: true }) + `<path d="M${lx + 21} ${ly + 56} L${lx + 28} ${ly + 68} L${lx + 14} ${ly + 68} Z" fill="#333"/>` + txt(lx + 40, ly + 63, '海戦', { size: 11.5, anchor: 'start', noHalo: true });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 日清・日露戦争の比較グラフ
function hikaku(mode) {
  const w = 640, h = 250;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const panel = (x0, title, unit, v1, v2, max, l1, l2) => {
    let r = txt(x0 + 95, 16, title, { size: 13.5, noHalo: true });
    const base = 200, H = 150;
    [[v1, '#9dbcdc', mode === 'q' ? 'X' : '日清戦争', l1], [v2, '#e9a98f', mode === 'q' ? 'Y' : '日露戦争', l2]].forEach(([v, c, n, l], i) => {
      const x = x0 + 30 + i * 90, hh = v / max * H;
      r += `<rect x="${x}" y="${r1(base - hh)}" width="60" height="${r1(hh)}" fill="${c}" stroke="#333" stroke-width="0.7"/>` + txt(x + 30, base - hh - 10, l, { size: 12.5, noHalo: true }) + txt(x + 30, base + 16, n, { size: 13, noHalo: true });
    });
    r += `<line x1="${x0 + 15}" y1="${base}" x2="${x0 + 195}" y2="${base}" stroke="#333"/>`;
    return r;
  };
  s += panel(5, '戦費', '億円', 2.0, 17.2, 17.2, '約2億円', '約17億円') + panel(215, '戦死者・病死者', '万人', 1.4, 8.4, 8.4, '約1.4万人', '約8.4万人') + panel(425, '賠償金', '億円', 3.1, 0, 3.6, '約3.1億円', 'なし');
  s += txt(w - 4, h - 6, 'おおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 日露戦争前の国際関係
function kankei(mode) {
  const w = 600, h = 230;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const node = (x, y, t, q, fill) => `<rect x="${x - 60}" y="${y - 24}" width="120" height="48" rx="8" fill="${fill}" stroke="#555" stroke-width="1.3"/>` + (mode === 'q' && q ? badge(x, y, q, { r: 12, size: 15 }) : txt(x, y, t, { size: 16, noHalo: true }));
  s += node(90, 60, 'イギリス', 'A', '#eef3f8') + node(90, 180, '日本', '', '#f3dccc') + node(510, 180, 'ロシア', 'B', '#f6efe4') + node(510, 60, 'フランス', '', '#f6efe4') + node(300, 60, 'アメリカ', '', '#eef6ee');
  s += `<line x1="90" y1="86" x2="90" y2="154" stroke="#2563a8" stroke-width="5"/>` + txt(100, 120, mode === 'q' ? 'C（1902年）' : '日英同盟（1902年）', { size: 13, anchor: 'start', noHalo: true, fill: '#2563a8' });
  s += `<line x1="510" y1="86" x2="510" y2="154" stroke="#8f4a2f" stroke-width="5"/>` + txt(500, 120, '露仏同盟', { size: 13, anchor: 'end', noHalo: true, fill: '#8f4a2f' });
  s += `<line x1="152" y1="180" x2="448" y2="180" stroke="#c0392b" stroke-width="2.4" stroke-dasharray="10 6"/>` + txt(300, 168, '対立（満州・韓国をめぐる）', { size: 12.5, noHalo: true, fill: '#c0392b' });
  s += `<line x1="300" y1="86" x2="300" y2="166" stroke="#3b6a4c" stroke-width="1.6" stroke-dasharray="4 3"/>` + txt(308, 112, mode === 'q' ? '講和を仲介' : '講和を仲介', { size: 12, anchor: 'start', noHalo: true, fill: '#3b6a4c' });
  return svg(w, h, s);
}
const figs = { sensoLabel: senso('label'), sensoQ: senso('q'), hikakuLabel: hikaku('label'), hikakuQ: hikaku('q'), kankeiLabel: kankei('label'), kankeiQ: kankei('q') };
fs.writeFileSync('figs_h15.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

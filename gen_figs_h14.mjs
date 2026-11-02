// 歴史 第14講「明治維新」の図
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


// 明治初期の国境
function kokkyo(mode) {
  const w = 560, h = 620;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[122.5, 24.0], [157.5, 51.5]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.6"/>`;
  // 千島列島（日本領）をうすく強調
  const line = (pts, opt = '') => { const d = pts.map((p, i) => { const [x, y] = proj(p); return (i ? 'L' : 'M') + r1(x) + ' ' + r1(y); }).join(''); return `<path d="${d}" fill="none" ${opt}/>`; };
  s += line([[141.2, 45.72], [142.1, 45.70], [142.9, 45.85]], 'stroke="#c0392b" stroke-width="2.4" stroke-dasharray="7 4"');
  s += line([[155.9, 50.95], [156.9, 51.15], [157.4, 51.2]], 'stroke="#c0392b" stroke-width="2.4" stroke-dasharray="7 4"');
  const [ox, oy] = proj([142.2, 27.1]); s += `<circle cx="${r1(ox)}" cy="${r1(oy)}" r="5" fill="#555"/><circle cx="${r1(ox + 3)}" cy="${r1(oy + 9)}" r="3.5" fill="#555"/>`;
  const L = [
    ['樺太', 142.8, 49.2, 'A', 'ロシア領に'], ['千島列島', 151.8, 47.4, 'B', '日本領に'], ['小笠原諸島', 142.2, 27.1, 'C', '日本領と確認'], ['沖縄（琉球）', 127.8, 26.4, 'D', '沖縄県を設置'],
  ];
  L.forEach(([n, lo, la, q, sub]) => {
    let [x, y] = proj([lo, la]);
    if (q === 'C') x += 12; if (q === 'D') { x += 10; y += 4; }
    const an = q === 'A' ? 'start' : 'start';
    const dx = q === 'A' ? 20 : 8;
    if (mode === 'label') s += txt(x + dx, y, n, { size: 14, anchor: an, weight: 700 }) + txt(x + dx, y + 18, sub, { size: 11.5, anchor: an, fill: '#8e2a1f' });
    else s += badge(x + dx + 10, y, q, { r: 11, size: 14 });
  });
  if (mode === 'label') {
    s += txt(...proj([126.7, 37.6]), '朝鮮', { size: 13 }) + txt(...proj([117.5, 37.2]).map((v, i) => i ? v : v + 30), '清', { size: 13 });
    s += txt(...proj([139.0, 43.3]), '北海道', { size: 12.5 });
  }
  const lx = 12, ly = 12;
  s += `<rect x="${lx}" y="${ly}" width="250" height="58" fill="#fff" stroke="#999"/>` + line([], '') + `<line x1="${lx + 10}" y1="${ly + 18}" x2="${lx + 44}" y2="${ly + 18}" stroke="#c0392b" stroke-width="2.4" stroke-dasharray="7 4"/>` + txt(lx + 52, ly + 18, mode === 'label' ? '樺太・千島交換条約（1875年）' : '1875年の条約による国境', { size: 12, anchor: 'start', noHalo: true }) + txt(lx + 10, ly + 42, '明治初期に定まった日本の領域', { size: 12, anchor: 'start', noHalo: true });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 大日本帝国憲法のしくみ
function kenpo(mode) {
  const w = 620, h = 330;
  let s = `<defs>${arrowDefs('kp' + mode, '#555')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, y, ww, hh, t, q, fill = '#f6efe4', size = 15) => `<rect x="${x}" y="${y}" width="${ww}" height="${hh}" rx="6" fill="${fill}" stroke="#8f4a2f" stroke-width="1.4"/>` + (mode === 'q' && q ? badge(x + ww / 2, y + hh / 2, q, { r: 12, size: 15 }) : (Array.isArray(t) ? t.map((tt, k) => txt(x + ww / 2, y + hh / 2 + (k - (t.length - 1) / 2) * 19, tt, { size: k ? size - 3 : size, noHalo: true, weight: k ? 400 : 700 })).join('') : txt(x + ww / 2, y + hh / 2, t, { size, noHalo: true })));
  const ar = (x1, y1, x2, y2, lab, side = 'start') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#555" stroke-width="1.6" marker-end="url(#kp${mode})"/>` + (lab ? txt((x1 + x2) / 2 + (side === 'start' ? 6 : -6), (y1 + y2) / 2, lab, { size: 11.5, noHalo: true, anchor: side, weight: 400 }) : '');
  s += box(230, 10, 160, 54, ['天皇', '主権者・元首'], 'A', '#f3dccc', 18);
  s += box(20, 130, 150, 60, ['陸軍・海軍', '天皇が直接率いる'], 'B');
  s += box(185, 130, 120, 60, '内閣', 'C');
  s += box(320, 104, 160, 96, '', '', '#f6efe4');
  s += box(330, 132, 140, 26, '貴族院', 'D', '#fff', 13.5) + box(330, 166, 140, 26, '衆議院', 'E', '#fff', 13.5);
  s += txt(400, 118, mode === 'q' ? '' : '帝国議会', { size: 13, noHalo: true });
  s += box(495, 130, 110, 60, '裁判所', '');
  s += ar(260, 66, 100, 128, '統帥', 'end') + ar(290, 66, 245, 128, '') + ar(345, 66, 380, 102, '協賛', 'start') + ar(390, 52, 550, 128, '');
  s += box(230, 260, 160, 54, ['国民（臣民）', '法律の範囲内で権利'], 'F', '#eef3f8', 15);
  s += ar(380, 258, 400, 194, '選挙（一部の男子のみ）', 'start');
  return svg(w, h, s);
}
// 自由民権運動から憲法・議会へ
function minken(mode) {
  const w = 760, h = 150;
  const E = [['1874', '民撰議院設立の建白書', 'A'], ['1877', '西南戦争', 'B'], ['1880', '国会期成同盟', ''], ['1881', '国会開設の勅諭', 'C'], ['1885', '内閣制度', 'D'], ['1889', '大日本帝国憲法', 'E'], ['1890', '第1回帝国議会', '']];
  let s = `<defs>${arrowDefs('mk' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  E.forEach(([y, t, q], i) => {
    const x = 6 + i * 108;
    s += `<rect x="${x}" y="24" width="98" height="96" rx="8" fill="${i === 5 ? '#f3dccc' : '#f6efe4'}" stroke="#8f4a2f" stroke-width="1.2"/>` + txt(x + 49, 42, y + '年', { size: 13.5, noHalo: true, fill: '#8e2a1f' });
    if (mode === 'q' && q) s += badge(x + 49, 78, q, { r: 11, size: 14 });
    else { const n = t.length > 6 ? Math.ceil(t.length / Math.ceil(t.length / 6)) : 6; const parts = []; for (let k = 0; k < t.length; k += n) parts.push(t.slice(k, k + n)); parts.forEach((p, k) => { s += txt(x + 49, 78 + k * 19 - (parts.length - 1) * 9.5, p, { size: 13, noHalo: true }); }); }
    if (i < 6) s += `<line x1="${x + 99}" y1="72" x2="${x + 106}" y2="72" stroke="#8f4a2f" stroke-width="2" marker-end="url(#mk${mode})"/>`;
  });
  s += txt(w / 2, 12, '自由民権運動から立憲政治へ', { size: 13.5, noHalo: true });
  return svg(w, h, s);
}
const figs = { kokkyoLabel: kokkyo('label'), kokkyoQ: kokkyo('q'), kenpoLabel: kenpo('label'), kenpoQ: kenpo('q'), minkenLabel: minken('label'), minkenQ: minken('q') };
fs.writeFileSync('figs_h14.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

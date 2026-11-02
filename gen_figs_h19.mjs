// 歴史 まとめ「時代の移り変わり年表」の図
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







// 時代の帯
function jidai(mode) {
  const E = [
    ['旧石器', ['', ''], 0, ''], ['縄文', ['約1万', '年前'], 0, 'A'], ['弥生', ['紀元前', '4世紀'], 0, ''],
    ['古墳', ['3世紀', '後半'], 1, 'B'], ['飛鳥', ['592'], 1, ''], ['奈良', ['710'], 1, 'C'], ['平安', ['794'], 1, ''],
    ['鎌倉', ['1185'], 2, 'D'], ['室町', ['1338'], 2, 'E'], ['戦国', ['1467'], 2, ''],
    ['安土桃山', ['1573'], 3, ''], ['江戸', ['1603'], 3, 'F'],
    ['明治', ['1868'], 4, 'G'], ['大正', ['1912'], 4, ''], ['昭和', ['1926'], 4, ''], ['昭和', ['1945'], 5, ''], ['平成', ['1989'], 5, ''], ['令和', ['2019'], 5, ''],
  ];
  const K = [['原始', '#eceae3', ''], ['古代', '#f3e6d6', 'ア'], ['中世', '#e6eef3', 'イ'], ['近世', '#e9f1e4', 'ウ'], ['近代', '#f6e3df', 'エ'], ['現代', '#eee8f3', '']];
  const w = 760, h = 220, x0 = 8, bw = (w - 16) / E.length;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  // 区分
  K.forEach(([n, c, q], k) => {
    const idx = E.map((e, i) => e[2] === k ? i : -1).filter(i => i >= 0);
    const xa = x0 + idx[0] * bw, xb = x0 + (idx[idx.length - 1] + 1) * bw;
    s += `<rect x="${r1(xa + 1)}" y="8" width="${r1(xb - xa - 2)}" height="30" rx="5" fill="${c}" stroke="#777" stroke-width="0.8"/>`;
    s += (mode === 'q' && q) ? badge((xa + xb) / 2, 23, q, { r: 10, size: 13 }) : txt((xa + xb) / 2, 23, n, { size: 14, noHalo: true });
  });
  E.forEach(([n, yr, k, q], i) => {
    const x = x0 + i * bw;
    const dashed = n === '戦国';
    s += `<rect x="${r1(x + 1)}" y="46" width="${r1(bw - 2)}" height="100" fill="${K[k][1]}" stroke="#555" stroke-width="${dashed ? 0.8 : 1}" ${dashed ? 'stroke-dasharray="4 3"' : ''}/>`;
    if (mode === 'q' && q) s += badge(x + bw / 2, 96, q, { r: 10, size: 13 });
    else { const ch = [...n]; const fs0 = ch.length >= 4 ? 13.5 : 15; ch.forEach((c, j) => { s += txt(x + bw / 2, 96 + (j - (ch.length - 1) / 2) * (fs0 + 3), c, { size: fs0, noHalo: true, weight: dashed ? 400 : 700 }); }); }
    yr.forEach((t, j) => { if (t) s += txt(x + 1, 160 + j * 14, t, { size: 10.5, noHalo: true, weight: 400, anchor: 'start' }); });
    s += `<line x1="${r1(x + 1)}" y1="146" x2="${r1(x + 1)}" y2="152" stroke="#555"/>`;
  });
  s += txt(x0, 200, '数字は時代が始まった年（目安）。戦国時代は室町時代の後半にあたる。昭和は1945年を境に近代と現代に分けた。', { size: 10.5, noHalo: true, weight: 400, anchor: 'start', fill: '#555' });
  return svg(w, h, s);
}
const figs = { jidaiLabel: jidai('label'), jidaiQ: jidai('q') };
fs.writeFileSync('figs_h19.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

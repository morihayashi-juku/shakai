// 歴史 第18講「戦後の日本と現代」の図
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






// 冷戦の対立
function reisen(mode) {
  const w = 660, h = 310;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const side = (x, col, fill, title, q, lines) => {
    let r = `<rect x="${x}" y="30" width="250" height="244" rx="12" fill="${fill}" stroke="${col}" stroke-width="1.4"/>`;
    r += txt(x + 125, 16, title, { size: 15, noHalo: true, fill: col });
    lines.forEach(([t, qq], i) => { if (mode === 'q' && qq === '-') return; r += (mode === 'q' && qq) ? badge(x + 125, 60 + i * 38, qq, { r: 11, size: 14 }) : txt(x + 125, 60 + i * 38, t, { size: i === 0 ? 16 : 13.5, noHalo: true, weight: i === 0 ? 700 : 400 }); });
    return r;
  };
  s += side(10, '#2563a8', '#eef3f8', '西側（資本主義の国々）', '', [['アメリカが中心', 'A'], ['イギリス・フランス・西ドイツなど', ''], ['軍事同盟：北大西洋条約機構', 'C'], ['（NATO・1949年）', '-'], ['日本も日米安全保障条約で', ''], ['西側の一員に', '']]);
  s += side(400, '#c0392b', '#fbeee6', '東側（社会主義の国々）', '', [['ソ連が中心', 'B'], ['東ドイツ・ポーランドなど', ''], ['軍事同盟：ワルシャワ条約機構', 'D'], ['（1955年）', '-'], ['中華人民共和国（1949年）も', ''], ['社会主義の国に', '']]);
  s += `<line x1="268" y1="140" x2="392" y2="140" stroke="#555" stroke-width="2" stroke-dasharray="8 5"/>` + txt(330, 124, mode === 'q' ? 'X' : '冷戦', { size: 17, noHalo: true }) + txt(330, 160, '直接は戦わない', { size: 11.5, noHalo: true, weight: 400 }) + txt(330, 178, 'きびしい対立', { size: 11.5, noHalo: true, weight: 400 });
  s += `<rect x="150" y="280" width="360" height="26" rx="6" fill="#fff8e8" stroke="#b07a1a"/>` + txt(330, 293, '分断された国：ドイツ（東西）、朝鮮（南北）', { size: 12.5, noHalo: true });
  return svg(w, h, s);
}
// 経済成長率（時期ごとの平均）
function seicho(mode) {
  const w = 560, h = 260;
  const D = [['1956〜73年', 9.1, mode === 'q' ? 'X' : '高度経済成長', '#e9a98f'], ['1974〜90年', 4.2, '安定成長', '#9dbcdc'], ['1991〜2020年', 0.8, 'バブル崩壊後', '#c9d3dc']];
  const x0 = 70, y0 = 200, H = 160, max = 10;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '日本の経済成長率（年平均・実質）', { size: 13.5, noHalo: true });
  [0, 2, 4, 6, 8, 10].forEach(v => { const y = y0 - v / max * H; s += `<line x1="${x0}" y1="${r1(y)}" x2="${w - 20}" y2="${r1(y)}" stroke="#e3e3e3"/>` + txt(x0 - 6, y, v + '%', { size: 11, anchor: 'end', noHalo: true, weight: 400 }); });
  D.forEach(([p, v, n, c], i) => {
    const x = x0 + 30 + i * 150, hh = v / max * H;
    s += `<rect x="${x}" y="${r1(y0 - hh)}" width="90" height="${r1(hh)}" fill="${c}" stroke="#333" stroke-width="0.7"/>` + txt(x + 45, y0 - hh - 10, '約' + Math.round(v) + '%', { size: 13, noHalo: true });
    s += txt(x + 45, y0 + 16, p, { size: 12.5, noHalo: true }) + txt(x + 45, y0 + 34, n, { size: 12, noHalo: true, weight: 400, fill: '#8e2a1f' });
  });
  s += `<line x1="${x0}" y1="${y0}" x2="${w - 20}" y2="${y0}" stroke="#333"/>` + txt(w - 4, h - 4, '内閣府の統計によるおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 家庭電化製品などの普及率
function kaden(mode) {
  const w = 640, h = 320;
  const S = [
    ['白黒テレビ', '#555', [[1957, 7.8], [1960, 44.7], [1963, 88.7], [1965, 90.0], [1970, 90.2], [1975, 48.7], [1980, 22.8]], 'A', [1961.2, 60, 'end']],
    ['電気洗濯機', '#2563a8', [[1957, 20.2], [1960, 40.6], [1965, 68.5], [1970, 91.4], [1975, 97.6], [1980, 98.8]], 'B', [1965.6, 64, 'start']],
    ['電気冷蔵庫', '#3b6a4c', [[1957, 2.8], [1960, 10.1], [1965, 51.4], [1970, 89.1], [1975, 96.7], [1980, 99.1]], '', [1966.6, 46, 'start']],
    ['カラーテレビ', '#c0392b', [[1966, 0.3], [1970, 26.3], [1975, 90.3], [1980, 98.2]], 'C', [1971.6, 35, 'end']],
    ['乗用車', '#8f4a2f', [[1961, 2.8], [1965, 9.2], [1970, 22.1], [1975, 41.2], [1980, 57.2]], '', [1976.5, 52, 'end']],
  ];
  const x0 = 60, y0 = 270, W = 520, H = 230;
  const X = y => x0 + (y - 1955) / 25 * W, Yv = v => y0 - v / 100 * H;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(x0 + 4, 16, '家庭電化製品などの普及率（%）', { size: 13, anchor: 'start', noHalo: true });
  [0, 20, 40, 60, 80, 100].forEach(v => { s += `<line x1="${x0}" y1="${r1(Yv(v))}" x2="${x0 + W}" y2="${r1(Yv(v))}" stroke="#e3e3e3"/>` + txt(x0 - 6, Yv(v), String(v), { size: 11, anchor: 'end', noHalo: true, weight: 400 }); });
  [1955, 1960, 1965, 1970, 1975, 1980].forEach(y => { s += txt(X(y), y0 + 16, y + '年', { size: 11, noHalo: true, weight: 400 }); });
  S.forEach(([n, c, pts, q, [ly, lv, an]]) => {
    s += `<path d="M${pts.map(([y, v]) => r1(X(y)) + ' ' + r1(Yv(v))).join('L')}" fill="none" stroke="${c}" stroke-width="2.6"/>`;
    s += (mode === 'q' && q) ? badge(X(ly) + (an === 'end' ? -14 : 14), Yv(lv), q, { r: 10, size: 13 }) : txt(X(ly), Yv(lv), n, { size: 12.5, anchor: an, noHalo: false, fill: c });
  });
  s += `<line x1="${x0}" y1="${y0}" x2="${x0 + W}" y2="${y0}" stroke="#333"/>` + txt(w - 4, h - 4, '内閣府「消費動向調査」によるおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 四大公害病
function kogai(mode) {
  const w = 560, h = 440;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[129.3, 31.0], [141.0, 38.8]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.6"/>`;
  const P = [['水俣病', '熊本県・鹿児島県（八代海沿岸）', 130.4, 32.2, 'A', 'start', 12, 0], ['新潟水俣病', '新潟県（阿賀野川流域）', 139.2, 37.85, 'B', 'end', -12, 0], ['イタイイタイ病', '富山県（神通川流域）', 137.2, 36.6, 'C', 'end', -12, -6], ['四日市ぜんそく', '三重県（四日市市）', 136.62, 34.97, 'D', 'start', 12, 10]];
  P.forEach(([n, pl, lo, la, q, an, dx, dy]) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="7" fill="#c0392b" stroke="#fff" stroke-width="1.5"/>`;
    if (mode === 'label') s += txt(x + dx, y + dy - 8, n, { size: 14.5, anchor: an, weight: 700 }) + txt(x + dx, y + dy + 10, pl, { size: 11.5, anchor: an, weight: 400 });
    else s += badge(x + dx + (an === 'end' ? -10 : 10), y + dy, q, { r: 11, size: 14 });
  });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
const figs = { reisenLabel: reisen('label'), reisenQ: reisen('q'), seichoLabel: seicho('label'), seichoQ: seicho('q'), kadenLabel: kaden('label'), kadenQ: kaden('q'), kogaiLabel: kogai('label'), kogaiQ: kogai('q') };
fs.writeFileSync('figs_h18.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

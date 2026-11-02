// 歴史 第16講「第一次世界大戦と大正時代」の図
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




// 第一次世界大戦前の国際関係
function domei(mode) {
  const w = 640, h = 300;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const node = (x, y, t, q, fill) => `<rect x="${x - 58}" y="${y - 22}" width="116" height="44" rx="8" fill="${fill}" stroke="#555" stroke-width="1.3"/>` + (mode === 'q' && q ? badge(x, y, q, { r: 12, size: 15 }) : txt(x, y, t, { size: 15.5, noHalo: true }));
  s += `<rect x="12" y="34" width="220" height="250" rx="12" fill="#f6efe4" stroke="#8f4a2f" stroke-dasharray="6 4"/>` + txt(122, 20, mode === 'q' ? 'X' : '三国同盟', { size: 15, noHalo: true, fill: '#8f4a2f' });
  s += `<rect x="408" y="34" width="220" height="250" rx="12" fill="#eef3f8" stroke="#2563a8" stroke-dasharray="6 4"/>` + txt(518, 20, mode === 'q' ? 'Y' : '三国協商', { size: 15, noHalo: true, fill: '#2563a8' });
  s += node(122, 80, 'ドイツ', 'A', '#fff') + node(122, 160, 'オーストリア', '', '#fff') + node(122, 240, 'イタリア', '', '#fff');
  s += node(518, 80, 'イギリス', 'B', '#fff') + node(518, 160, 'フランス', '', '#fff') + node(518, 240, 'ロシア', 'C', '#fff');
  s += node(290, 80, '日本', '', '#f3dccc');
  s += `<line x1="348" y1="80" x2="460" y2="80" stroke="#2563a8" stroke-width="4"/>` + txt(404, 66, mode === 'q' ? 'Z' : '日英同盟', { size: 12.5, noHalo: true, fill: '#2563a8' });
  s += `<line x1="180" y1="160" x2="460" y2="160" stroke="#c0392b" stroke-width="2.4" stroke-dasharray="10 6"/>` + txt(320, 148, '対立', { size: 13, noHalo: true, fill: '#c0392b' });
  s += `<rect x="248" y="194" width="144" height="64" rx="8" fill="#fff8e8" stroke="#b07a1a"/>` + txt(320, 214, mode === 'q' ? 'D' : 'バルカン半島', { size: 14, noHalo: true }) + txt(320, 238, '「ヨーロッパの火薬庫」', { size: 11.5, noHalo: true, weight: 400 });
  s += txt(122, 272, '※大戦中に協商国側で参戦', { size: 10.5, noHalo: true, weight: 400, fill: '#555' });
  return svg(w, h, s);
}
// 大戦景気（輸出入額）
function keiki(mode) {
  const w = 640, h = 300;
  const Y = [1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920];
  const EX = [527, 632, 591, 708, 1127, 1603, 1962, 2099, 1948];
  const IM = [619, 729, 595, 532, 756, 1036, 1668, 2173, 2336];
  const x0 = 60, y0 = 250, W = 540, H = 200, max = 2500;
  const X = i => x0 + 30 + i * (W - 60) / 8, Yv = v => y0 - v / max * H;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  [0, 500, 1000, 1500, 2000, 2500].forEach(v => { s += `<line x1="${x0}" y1="${r1(Yv(v))}" x2="${x0 + W}" y2="${r1(Yv(v))}" stroke="#ddd"/>` + txt(x0 - 6, Yv(v), String(v / 100 * 1) === '0' ? '0' : String(v / 100), { size: 11, anchor: 'end', noHalo: true, weight: 400 }); });
  s += txt(x0 - 6, 30, '(億円)', { size: 11, anchor: 'end', noHalo: true, weight: 400 });
  s += `<rect x="${r1(X(3) - 22)}" y="${Yv(max)}" width="${r1(X(6) - X(3) + 44)}" height="${H}" fill="#fbeee6"/>` + txt((X(3) + X(6)) / 2, Yv(max) + 14, mode === 'q' ? '' : '輸出が輸入を上回る', { size: 12, noHalo: true, fill: '#8e2a1f' });
  const line = (arr, c, dash) => `<path d="M${arr.map((v, i) => r1(X(i)) + ' ' + r1(Yv(v))).join('L')}" fill="none" stroke="${c}" stroke-width="3" ${dash ? 'stroke-dasharray="7 4"' : ''}/>` + arr.map((v, i) => `<circle cx="${r1(X(i))}" cy="${r1(Yv(v))}" r="3.5" fill="${c}"/>`).join('');
  s += line(IM, '#2563a8', true) + line(EX, '#c0392b', false);
  Y.forEach((y, i) => { s += txt(X(i), y0 + 16, String(y), { size: 11.5, noHalo: true, weight: 400 }); });
  s += `<line x1="${x0}" y1="${y0}" x2="${x0 + W}" y2="${y0}" stroke="#333"/>`;
  s += `<line x1="${x0 + 20}" y1="40" x2="${x0 + 50}" y2="40" stroke="#c0392b" stroke-width="3"/>` + txt(x0 + 56, 40, '輸出額', { size: 12.5, anchor: 'start', noHalo: true }) + `<line x1="${x0 + 120}" y1="40" x2="${x0 + 150}" y2="40" stroke="#2563a8" stroke-width="3" stroke-dasharray="7 4"/>` + txt(x0 + 156, 40, '輸入額', { size: 12.5, anchor: 'start', noHalo: true });
  s += `<rect x="${r1(X(2) - 4)}" y="${y0 + 26}" width="${r1(X(6) - X(2) + 8)}" height="4" fill="#555"/>` + txt((X(2) + X(6)) / 2, y0 + 42, mode === 'q' ? 'A（1914〜1918年）' : '第一次世界大戦（1914〜1918年）', { size: 12, noHalo: true });
  s += txt(w - 4, h - 4, 'おおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 有権者の割合
function senkyo(mode) {
  const w = 680, h = 330;
  const D = [['1889', 1.1, '15円以上', '25歳以上', '男子'], ['1900', 2.2, '10円以上', '25歳以上', '男子'], ['1919', 5.5, '3円以上', '25歳以上', '男子'], ['1925', 20.8, '制限なし', '25歳以上', '男子'], ['1945', 48.7, '制限なし', '20歳以上', '男女']];
  const x0 = 150, y0 = 210, H = 170, max = 50;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '選挙法の改正年と、有権者が総人口にしめる割合', { size: 13.5, noHalo: true });
  D.forEach(([y, v, tax, age, sex], i) => {
    const x = x0 + i * 104, hh = v / max * H;
    const isQ = mode === 'q' && y === '1925';
    s += `<rect x="${x}" y="${r1(y0 - hh)}" width="64" height="${r1(hh)}" fill="${y === '1925' ? '#e9a98f' : '#9dbcdc'}" stroke="#333" stroke-width="0.7"/>` + txt(x + 32, y0 - hh - 10, v + '%', { size: 13, noHalo: true });
    s += txt(x + 32, y0 + 16, y + '年', { size: 13, noHalo: true });
    s += txt(x + 32, y0 + 42, isQ ? '（ア）' : tax, { size: 12, noHalo: true, weight: 400 }) + txt(x + 32, y0 + 64, age, { size: 12, noHalo: true, weight: 400 }) + txt(x + 32, y0 + 86, mode === 'q' && y === '1945' ? '（イ）' : sex, { size: 12, noHalo: true, weight: 400 });
  });
  s += `<line x1="${x0 - 20}" y1="${y0}" x2="${w - 10}" y2="${y0}" stroke="#333"/>`;
  s += txt(x0 - 26, y0 + 42, '直接国税', { size: 12, anchor: 'end', noHalo: true }) + txt(x0 - 26, y0 + 64, '年齢', { size: 12, anchor: 'end', noHalo: true }) + txt(x0 - 26, y0 + 86, '性別', { size: 12, anchor: 'end', noHalo: true });
  s += txt(x0 + 3 * 104 + 32, y0 + 106, mode === 'q' ? '' : '普通選挙法', { size: 12, noHalo: true, fill: '#8e2a1f' });
  s += txt(w - 4, h - 4, '総務省資料などによる', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const figs = { domeiLabel: domei('label'), domeiQ: domei('q'), keikiLabel: keiki('label'), keikiQ: keiki('q'), senkyoLabel: senkyo('label'), senkyoQ: senkyo('q') };
fs.writeFileSync('figs_h16.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

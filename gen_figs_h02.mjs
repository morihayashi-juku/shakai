// 歴史 第2講「人類の出現と文明のおこり」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const topo = require('world-atlas/land-50m.json');
const land = topojson.feature(topo, topo.objects.land);
const rivers = JSON.parse(fs.readFileSync('data/rivers50.geojson')).features.filter(f => /^(Nile|Tigris|Euphrates|Indus|Huang|Chang Jiang|Yangtze)$/.test(f.properties.name || ''));
const C = { ink: '#1d2a33', sea: '#eef4f8', land: '#ece8de', river: '#2f6fb0' };
const r1 = n => Math.round(n * 10) / 10;
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 12;
  const shape = o.circle ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>` : `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 15}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
const arrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;

function baseMap(w, h, id) {
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[-12, 6], [128, 52]] }).clipExtent([[-5, -5], [w + 5, h + 5]]);
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  s += `<path d="${ps(path, land)}" fill="${C.land}" stroke="#999" stroke-width="0.5"/>`;
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="#555"/>` };
}
// 四大文明の地図
function bunmei(mode) {
  const w = 760, h = 330;
  const { s: base, proj, path, close } = baseMap(w, h, 'bm' + mode);
  let s = base;
  const CIV = [['エジプト文明', 31.2, 27.5, 'A', 'ナイル川', 26, 18, 'end'], ['メソポタミア文明', 44.5, 33.3, 'B', 'チグリス川・ユーフラテス川', 39, 36.3, 'end'], ['インダス文明', 68.5, 27.3, 'C', 'インダス川', 71.5, 24.2, 'start'], ['中国文明', 113, 35.3, 'D', '黄河・長江', 104, 29.5, 'end']];
  CIV.forEach(([n, lo, la]) => { const [x, y] = proj([lo, la]); s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="26" ry="20" fill="#c0392b" fill-opacity="0.22" stroke="#c0392b" stroke-width="1.2"/>`; });
  for (const f of rivers) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="1.8"/>`;
  s += close;
  CIV.forEach(([n, lo, la, b, rv, rlo, rla, an], i) => {
    const [x, y] = proj([lo, la]);
    if (mode === 'label') {
      s += txt(x, y - 30, n, { size: 14, fill: '#8e2a1f' });
      const [rx, ry] = proj([rlo, rla]); s += txt(rx, ry, rv, { size: 11.5, fill: '#1f4f7a', anchor: an });
    } else s += badge(x, y, b);
  });
  if (mode === 'label') { const L = (n, lo, la) => { const [x, y] = proj([lo, la]); return txt(x, y, n, { size: 12, weight: 400, fill: '#1f4f7a' }); }; s += L('地中海', 18, 35) + L('インド洋', 72, 12) + L('ペルシア湾', 51, 27.8); }
  return svg(w, h, s);
}
// 古代の世界と宗教
function sekai(mode) {
  const w = 760, h = 330;
  const { s: base, proj, path, close } = baseMap(w, h, 'sk' + mode);
  let s = `<defs>${arrowDefs('ar' + mode, '#8a5a2b')}</defs>` + base;
  const silk = [[108.9, 34.3], [103.8, 36.1], [94.7, 40.1], [87.6, 43.8], [76, 39.5], [67, 39.7], [62, 37.6], [51.4, 35.7], [44.6, 33.1], [36.2, 36.2]];
  s += `<path d="${ps(path, { type: 'LineString', coordinates: silk })}" fill="none" stroke="#8a5a2b" stroke-width="2.6" stroke-dasharray="7 4"/>`;
  s += close;
  const P = [
    ['ローマ', 12.5, 41.9, 'A', '#2563a8', 'end', -8, -10], ['アテネ', 23.7, 38.0, 'B', '#2563a8', 'start', 8, 10],
    ['エルサレム（キリスト教）', 35.2, 31.8, 'C', '#7a3fa0', 'end', -8, 14], ['メッカ（イスラム教）', 39.8, 21.4, 'D', '#1f7a4a', 'start', 8, 4],
    ['ブッダガヤ（仏教）', 85, 24.7, 'E', '#c0392b', 'start', 8, 10], ['長安（漢の都）', 108.9, 34.3, 'F', '#8e2a1f', 'start', 8, 12],
  ];
  P.forEach(([n, lo, la, b, col, an, dx, dy]) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="5.5" fill="${col}" stroke="#fff" stroke-width="1.4"/>`;
    s += mode === 'label' ? txt(x + dx, y + dy, n, { size: 12.5, anchor: an, fill: col }) : badge(x + (an === 'end' ? -16 : 16), y + dy * 0.6, b, { r: 11, size: 14 });
  });
  const [gx, gy] = proj([82, 41.5]);
  s += mode === 'label' ? txt(gx, gy - 14, 'シルクロード（絹の道）', { size: 13, fill: '#8a5a2b' }) : badge(gx, gy - 14, 'X', { r: 11, size: 14, circle: true });
  const [wx, wy] = proj([111, 41.5]); const [wx2] = proj([100, 39]);
  s += `<path d="M${r1(wx2)} ${r1(wy + 14)} Q ${r1((wx + wx2) / 2)} ${r1(wy - 6)} ${r1(wx + 30)} ${r1(wy + 2)}" fill="none" stroke="#6b4a2b" stroke-width="3"/>`;
  s += mode === 'label' ? txt(wx + 20, wy - 12, '万里の長城', { size: 12, fill: '#6b4a2b' }) : badge(wx + 20, wy - 14, 'Y', { r: 11, size: 14, circle: true });
  return svg(w, h, s);
}
// 人類の進化と石器
function jinrui(mode) {
  const w = 760, h = 250;
  const steps = [['猿人', '約700万年前', ['アフリカに出現', '直立二足歩行', '手で道具を使う'], '#f2dcc0'], ['原人', '約200万年前', ['火や言葉を使う', '打製石器をつくる'], '#e9d6c6'], ['新人', '約20万年前', ['ホモ・サピエンス', '現在の人類の祖先', '世界中に広がる'], '#d6e3ef']];
  const qn = ['A', 'B', 'C'];
  let s = `<defs>${arrowDefs('jr' + mode, '#555')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  steps.forEach(([n, t, f, col], i) => {
    const x = 20 + i * 190;
    s += `<rect x="${x}" y="20" width="170" height="130" rx="8" fill="${col}" stroke="#888"/>`;
    s += mode === 'label' ? txt(x + 85, 42, n, { size: 18, noHalo: true }) : badge(x + 85, 42, qn[i]);
    s += txt(x + 85, 66, t, { size: 13, noHalo: true, fill: '#8e2a1f' });
    f.forEach((l, k) => { s += txt(x + 85, 90 + k * 19, mode === 'q' && i === 2 && k === 0 ? '（　　　）' : mode === 'q' && l === '打製石器をつくる' ? '石器をつくる' : l, { size: 12.5, weight: 400, noHalo: true }); });
    if (i < 2) s += `<line x1="${x + 172}" y1="85" x2="${x + 188}" y2="85" stroke="#555" stroke-width="2.4" marker-end="url(#jr${mode})"/>`;
  });
  s += `<rect x="590" y="20" width="150" height="130" rx="8" fill="#dfeedd" stroke="#888"/>` + txt(665, 42, '約1万年前', { size: 13, noHalo: true, fill: '#8e2a1f' });
  ['氷河時代が終わる', '農耕・牧畜が始まる', '土器をつくる', '定住する'].forEach((l, k) => { s += txt(665, 66 + k * 19, l, { size: 12.5, weight: 400, noHalo: true }); });
  s += `<rect x="20" y="168" width="550" height="34" fill="#efe6d6" stroke="#8f4a2f"/>` + txt(295, 185, mode === 'label' ? '旧石器時代（打製石器・狩りや採集・移動生活）' : '［ア］時代（［イ］石器・狩りや採集・移動生活）', { size: 14, fill: '#8f4a2f', noHalo: true });
  s += `<rect x="590" y="168" width="150" height="34" fill="#e3efe0" stroke="#3b6a4c"/>` + txt(665, 185, mode === 'label' ? '新石器時代' : '［ウ］時代', { size: 14, fill: '#3b6a4c', noHalo: true });
  s += txt(665, 222, mode === 'label' ? '（磨製石器・土器）' : '（［エ］石器・土器）', { size: 12.5, noHalo: true, fill: '#3b6a4c' });
  return svg(w, h, s);
}
const figs = { bunmeiLabel: bunmei('label'), bunmeiQ: bunmei('q'), sekaiLabel: sekai('label'), sekaiQ: sekai('q'), jinruiLabel: jinrui('label'), jinruiQ: jinrui('q') };
fs.writeFileSync('figs_h02.json', JSON.stringify(figs));
console.log(rivers.length, Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

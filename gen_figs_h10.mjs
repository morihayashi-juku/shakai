// 歴史 第10講「江戸幕府の成立」の図
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

// 江戸幕府のしくみ
function shikumi(mode) {
  const w = 720, h = 250;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, y, bw, t, sub, fill, q) => `<rect x="${x}" y="${y}" width="${bw}" height="40" rx="5" fill="${fill}" stroke="#8f4a2f" stroke-width="1.3"/>` + (mode === 'q' && q ? badge(x + bw / 2, y + 20, q, { r: 11, size: 14 }) : txt(x + bw / 2, y + (sub ? 13 : 20), t, { size: 14, noHalo: true })) + (sub && !(mode === 'q' && q) ? txt(x + bw / 2, y + 30, sub, { size: 10.5, weight: 400, noHalo: true }) : '');
  const ln = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#555" stroke-width="1.5" fill="none"/>`;
  s += box(300, 10, 120, '将軍', '', '#f3dccc');
  s += ln(360, 50, 360, 64) + ln(120, 64, 620, 64);
  s += ln(120, 64, 120, 76) + box(50, 76, 140, '大老', '必要なときに置く', '#f6efe4');
  s += ln(300, 64, 300, 76) + box(230, 76, 140, '老中', '政治をまとめる', '#f6efe4', 'A');
  s += ln(450, 64, 450, 76) + box(390, 76, 120, '若年寄', '老中を補佐', '#f6efe4');
  s += ln(620, 64, 620, 76) + box(540, 76, 160, '寺社奉行', '寺社の取りしまり', '#f6efe4');
  s += ln(300, 116, 300, 132) + ln(90, 132, 530, 132);
  [[30, '大目付', '大名の監視', 'B'], [180, '町奉行', '江戸の町の政治', 'C'], [330, '勘定奉行', '幕府の財政', 'D'], [470, '遠国奉行', '長崎など', '']].forEach(([x, t, sub, q]) => { s += ln(x + 60, 132, x + 60, 146) + box(x, 146, 120, t, sub, '#f6efe4', q); });
  s += box(30, 200, 200, '京都所司代', '朝廷・西日本の大名の監視', '#e6eef2', 'E') + box(260, 200, 160, '大阪城代', '西日本の守り', '#e6eef2');
  return svg(w, h, s);
}
// 大名の配置
const DMY = [
  ['江戸', 139.77, 35.68, 'E'],
  ['尾張', 136.9, 35.18, 'S'], ['紀伊', 135.17, 34.23, 'S'], ['水戸', 140.47, 36.37, 'S'],
  ['彦根', 136.25, 35.27, 'F'], ['小田原', 139.15, 35.25, 'F'], ['会津', 139.93, 37.49, 'S'], ['姫路', 134.69, 34.84, 'F'], ['川越', 139.48, 35.92, 'F'],
  ['加賀（前田）', 136.65, 36.56, 'T'], ['薩摩（島津）', 130.55, 31.6, 'T'], ['長州（毛利）', 131.4, 34.4, 'T'], ['仙台（伊達）', 140.87, 38.26, 'T'], ['土佐（山内）', 133.53, 33.56, 'T'], ['肥後（細川）', 130.7, 32.8, 'T'], ['福岡（黒田）', 130.4, 33.6, 'T'],
];
const DC = { S: '#c0392b', F: '#2f6fb0', T: '#3b6a4c', E: '#333' };
function daimyo(mode) {
  const w = 600, h = 470;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[129.5, 31.0], [141.8, 39.6]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  DMY.forEach(([n, lo, la, k]) => {
    const [x, y] = proj([lo, la]);
    s += k === 'E' ? `<rect x="${r1(x - 7)}" y="${r1(y - 7)}" width="14" height="14" fill="#333"/>` + txt(x + 10, y + 10, '江戸', { size: 13, anchor: 'start' }) : (k === 'S' ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="7" fill="${DC[k]}" stroke="#fff" stroke-width="1.5"/>` : k === 'F' ? `<path d="M${r1(x)} ${r1(y - 8)} L${r1(x + 7)} ${r1(y + 5)} L${r1(x - 7)} ${r1(y + 5)} Z" fill="${DC[k]}" stroke="#fff" stroke-width="1.2"/>` : `<rect x="${r1(x - 6)}" y="${r1(y - 6)}" width="12" height="12" transform="rotate(45 ${r1(x)} ${r1(y)})" fill="${DC[k]}" stroke="#fff" stroke-width="1.2"/>`);
    if (mode === 'label' && k === 'T') s += txt(x + 10, y + 1, n, { size: 11.5, anchor: 'start', fill: DC[k] });
    if (mode === 'label' && k === 'S' && n !== '会津') s += txt(x + 10, y + 1, n, { size: 11.5, anchor: 'start', fill: DC[k] });
  });
  const lx = w - 168, ly = h - 102;
  s += `<rect x="${lx}" y="${ly}" width="158" height="92" fill="#fff" stroke="#999"/>`;
  const leg = mode === 'label' ? ['親藩（徳川一族）', '譜代大名', '外様大名'] : ['A', 'B', 'C'];
  s += `<circle cx="${lx + 16}" cy="${ly + 20}" r="7" fill="${DC.S}"/>` + txt(lx + 30, ly + 20, leg[0], { size: 13, anchor: 'start', noHalo: true });
  s += `<path d="M${lx + 16} ${ly + 38} L${lx + 23} ${ly + 51} L${lx + 9} ${ly + 51} Z" fill="${DC.F}"/>` + txt(lx + 30, ly + 46, leg[1], { size: 13, anchor: 'start', noHalo: true });
  s += `<rect x="${lx + 10}" y="${ly + 66}" width="12" height="12" transform="rotate(45 ${lx + 16} ${ly + 72})" fill="${DC.T}"/>` + txt(lx + 30, ly + 72, leg[2], { size: 13, anchor: 'start', noHalo: true });
  s += txt(14, 16, mode === 'label' ? '17世紀なかごろのおもな大名の配置（一部）' : 'おもな大名の配置（一部）', { size: 12, anchor: 'start', noHalo: true });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 身分の割合
function mibun(mode) {
  const w = 620, h = 130;
  const rows = [['百姓', 85, '#a9cf98'], ['武士', 7, '#e9a98f'], ['町人', 5, '#9dbcdc'], ['その他', 3, '#eeeae0']];
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '江戸時代の身分ごとの人口の割合（おおよそ）', { size: 13.5, noHalo: true });
  let x = 20; const W = 580;
  const q = { 百姓: 'A', 武士: 'B', 町人: 'C' };
  let lx = 20;
  rows.forEach(([n, v, c]) => { const ww = v / 100 * W; s += `<rect x="${r1(x)}" y="34" width="${r1(ww)}" height="44" fill="${c}" stroke="#333" stroke-width="0.7"/>`; const lab = mode === 'q' && q[n] ? q[n] : n; if (ww > 60) s += txt(x + ww / 2, 56, `${lab} 約${v}%`, { size: 15, noHalo: true }); else { s += `<rect x="${lx}" y="92" width="14" height="14" fill="${c}" stroke="#333" stroke-width="0.7"/>` + txt(lx + 20, 99, `${lab} 約${v}%`, { size: 13, anchor: 'start', noHalo: true }); lx += 120; } x += ww; });
  s += txt(w - 6, h - 6, '19世紀なかばの推計をもとにしたおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// 鎖国下の4つの窓口
function mado(mode) {
  const w = 600, h = 470;
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[118, 24], [146, 46]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('md' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.6"/><path d="${ps(path, japan)}" fill="#efe3c9" stroke="#888" stroke-width="0.6"/>`;
  const ar = (a, b) => { const [x1, y1] = proj(a), [x2, y2] = proj(b); return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="#8f4a2f" stroke-width="2.6" marker-end="url(#md${mode})"/>`; };
  s += ar([129.87, 32.75], [123.5, 30.5]) + ar([129.3, 34.4], [128.5, 35.6]) + ar([130.6, 31.4], [127.9, 26.8]) + ar([140.1, 41.5], [142.0, 43.2]);
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const dot = (lo, la) => { const [x, y] = proj([lo, la]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="#c0392b" stroke="#fff" stroke-width="1.4"/>`; };
  s += dot(129.87, 32.75) + dot(129.3, 34.4) + dot(130.55, 31.6) + dot(140.1, 41.45);
  if (mode === 'label') {
    s += L('長崎（幕府）', 130.1, 32.4, { size: 12.5, anchor: 'start' }) + L('オランダ・中国', 122.5, 30.0, { size: 13, fill: '#8f4a2f' });
    s += L('対馬藩', 129.0, 34.5, { size: 12.5, anchor: 'end' }) + L('朝鮮', 127.5, 37.0, { size: 15, fill: '#8f4a2f' });
    s += L('薩摩藩', 131.0, 31.3, { size: 12.5, anchor: 'start' }) + L('琉球王国', 127.8, 26.0, { size: 14, fill: '#8f4a2f' });
    s += L('松前藩', 140.0, 41.2, { size: 12.5, anchor: 'end' }) + L('蝦夷地（アイヌの人々）', 143.0, 44.3, { size: 12.5, fill: '#8f4a2f' });
  } else {
    s += badge(...proj([131.0, 32.5]), 'A', { r: 11, size: 14 }) + badge(...proj([128.6, 34.3]), 'B', { r: 11, size: 14 }) + badge(...proj([131.4, 31.2]), 'C', { r: 11, size: 14 }) + badge(...proj([139.5, 41.0]), 'D', { r: 11, size: 14 });
    s += L('オランダ・中国', 122.5, 30.0, { size: 13, fill: '#8f4a2f' }) + L('朝鮮', 127.5, 37.0, { size: 15, fill: '#8f4a2f' }) + L('琉球王国', 127.8, 26.0, { size: 14, fill: '#8f4a2f' }) + L('蝦夷地', 143.0, 44.3, { size: 12.5, fill: '#8f4a2f' });
  }
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 鎖国への流れ
function sakoku(mode) {
  const w = 760, h = 150;
  const E = [['1612', '禁教令（幕府領）', ''], ['1624', 'スペイン船の来航を禁止', 'A'], ['1635', '日本人の海外渡航・帰国を禁止', ''], ['1637', '島原・天草一揆', 'B'], ['1639', 'ポルトガル船の来航を禁止', 'C'], ['1641', 'オランダ商館を出島へ', 'D']];
  let s = `<defs>${arrowDefs('sk' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  E.forEach(([y, t, q], i) => {
    const x = 6 + i * 126;
    s += `<rect x="${x}" y="22" width="114" height="104" rx="8" fill="${i === 5 ? '#f3dccc' : '#f6efe4'}" stroke="#8f4a2f" stroke-width="1.2"/>`;
    s += txt(x + 57, 40, y + '年', { size: 14, noHalo: true, fill: '#8e2a1f' });
    if (mode === 'q' && q) s += badge(x + 57, 80, q, { r: 11, size: 14 });
    else { const parts = t.length > 8 ? [t.slice(0, Math.ceil(t.length / 2)), t.slice(Math.ceil(t.length / 2))] : [t]; parts.forEach((p, k) => { s += txt(x + 57, 72 + k * 20 - (parts.length - 1) * 10, p, { size: 13, noHalo: true }); }); }
    if (i < 5) s += `<line x1="${x + 115}" y1="74" x2="${x + 124}" y2="74" stroke="#8f4a2f" stroke-width="2.2" marker-end="url(#sk${mode})"/>`;
  });
  s += txt(w / 2, 12, mode === 'label' ? '鎖国への流れ' : '1641年に完成した体制への流れ', { size: 13.5, noHalo: true }) + txt(w / 2, 141, mode === 'label' ? '→ 鎖国の完成' : '', { size: 12.5, noHalo: true, fill: '#8f4a2f' });
  return svg(w, h, s);
}
const figs = { edShikumiLabel: shikumi('label'), edShikumiQ: shikumi('q'), edDaimyoLabel: daimyo('label'), edDaimyoQ: daimyo('q'), mibunLabel: mibun('label'), mibunQ: mibun('q'), madoLabel: mado('label'), madoQ: mado('q'), sakokuLabel: sakoku('label'), sakokuQ: sakoku('q') };
fs.writeFileSync('figs_h10.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

// 歴史 第6講「平安時代」の図
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
// 平安時代の地図
const PL = [
  ['平安京', 135.76, 35.02, '#8f4a2f', 'start', 9, -8, 'A'],
  ['平将門の乱', 139.95, 35.95, '#c0392b', 'start', 9, 0, 'B'],
  ['藤原純友の乱', 132.6, 33.75, '#c0392b', 'start', 9, 10, 'C'],
  ['前九年・後三年合戦', 141.1, 39.4, '#c0392b', 'end', -9, 0, 'D'],
  ['平泉', 141.1, 38.99, '#3b6a4c', 'end', -9, 6, 'E'],
  ['大輪田泊', 135.19, 34.66, '#2f6fb0', 'start', 8, 14, 'F'],
  ['厳島神社', 132.32, 34.3, '#2f6fb0', 'end', -9, -8, 'G'],
  ['壇ノ浦', 130.96, 33.96, '#7a3fa0', 'end', -9, -6, 'H'],
  ['島津荘', 131.06, 31.72, '#b8860b', 'start', 9, 6, 'I'],
];
function heianMap(mode) {
  const w = 600, h = 520;
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], { type: 'MultiPoint', coordinates: [[128.8, 30.9], [142.2, 41.3]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#aaa" stroke-width="0.5"/><path d="${ps(path, japan)}" fill="${C.land}" stroke="#777" stroke-width="0.7"/>`;
  PL.forEach(([n, lo, la, col, an, dx, dy, q]) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="${col}" stroke="#fff" stroke-width="1.5"/>`;
    s += mode === 'label' ? txt(x + dx, y + dy, n, { size: 13, anchor: an, fill: col }) : badge(x + (an === 'end' ? -18 : 18), y + dy * 0.6, q, { r: 11, size: 14 });
  });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 藤原氏と天皇の関係
function sekkan(mode) {
  const w = 720, h = 250;
  let s = `<defs>${arrowDefs('sk' + mode, '#555')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, y, bw, t, fill, q) => `<rect x="${x}" y="${y}" width="${bw}" height="38" rx="6" fill="${fill}" stroke="#8f4a2f" stroke-width="1.3"/>` + (mode === 'q' && q ? badge(x + bw / 2, y + 19, q, { r: 11, size: 14 }) : txt(x + bw / 2, y + 19, t, { size: 15, noHalo: true }));
  s += box(30, 26, 150, '藤原道長', '#f3dccc', 'A');
  s += `<line x1="105" y1="64" x2="105" y2="100" stroke="#555" stroke-width="1.6"/>` + txt(115, 82, '娘', { size: 12, anchor: 'start', noHalo: true, weight: 400 });
  s += box(30, 100, 150, '娘（きさき）', '#f6efe4');
  s += `<line x1="180" y1="119" x2="240" y2="119" stroke="#555" stroke-width="3" stroke-dasharray="0"/><line x1="180" y1="124" x2="240" y2="124" stroke="#555" stroke-width="1"/>`;
  s += box(240, 100, 130, '天皇', '#e6eef2');
  s += `<line x1="200" y1="138" x2="200" y2="176" stroke="#555" stroke-width="1.6"/>` + txt(210, 158, '生まれた子', { size: 12, anchor: 'start', noHalo: true, weight: 400 });
  s += box(130, 176, 150, '幼い天皇（孫）', '#e6eef2');
  s += `<path d="M30 50 Q 4 150 128 194" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#sk${mode})"/>` + txt(290, 190, '← 祖父として', { size: 12.5, anchor: 'start', noHalo: true, fill: '#c0392b' }) + txt(290, 207, '　 実権をにぎる', { size: 12.5, anchor: 'start', noHalo: true, fill: '#c0392b' });
  s += `<rect x="430" y="40" width="270" height="170" rx="8" fill="#f9f6ef" stroke="#999"/>`;
  s += txt(565, 60, mode === 'label' ? '摂関政治' : '藤原氏の政治', { size: 15, noHalo: true, fill: '#8f4a2f' });
  s += txt(450, 96, '天皇が幼いとき', { size: 13, anchor: 'start', noHalo: true, weight: 400 }) + (mode === 'q' ? badge(640, 96, 'B', { r: 11, size: 14 }) : txt(640, 96, '→ 摂政', { size: 15, noHalo: true }));
  s += txt(450, 136, '天皇が成人したあと', { size: 13, anchor: 'start', noHalo: true, weight: 400 }) + (mode === 'q' ? badge(640, 136, 'C', { r: 11, size: 14 }) : txt(640, 136, '→ 関白', { size: 15, noHalo: true }));
  s += txt(565, 180, '天皇にかわって政治を行う', { size: 12.5, noHalo: true, weight: 400 });
  return svg(w, h, s);
}
// かな文字の成り立ち
function kana(mode) {
  const w = 720, h = 170;
  const H = [['安', 'あ'], ['以', 'い'], ['宇', 'う'], ['衣', 'え'], ['於', 'お']];
  const K = [['阿', 'ア'], ['伊', 'イ'], ['宇', 'ウ'], ['江', 'エ'], ['於', 'オ']];
  let s = `<defs>${arrowDefs('kn' + mode, '#555')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  s += txt(180, 16, mode === 'label' ? 'ひらがな（漢字をくずす）' : 'X（漢字をくずす）', { size: 14, noHalo: true, fill: '#8f4a2f' }) + txt(540, 16, mode === 'label' ? 'カタカナ（漢字の一部をとる）' : 'Y（漢字の一部をとる）', { size: 14, noHalo: true, fill: '#8f4a2f' });
  const col = (arr, x0) => arr.map(([a, b], i) => { const x = x0 + i * 66; return txt(x, 62, a, { size: 28, noHalo: true, weight: 400 }) + `<line x1="${x}" y1="82" x2="${x}" y2="106" stroke="#555" stroke-width="1.6" marker-end="url(#kn${mode})"/>` + txt(x, 132, b, { size: 28, noHalo: true }); }).join('');
  s += col(H, 48) + col(K, 408) + `<line x1="360" y1="30" x2="360" y2="${h - 6}" stroke="#ccc"/>`;
  return svg(w, h, s);
}
// 時代の流れ
function flow(mode) {
  const w = 760, h = 132;
  const E = [['8世紀末〜', '律令政治の立て直し', '桓武天皇'], ['10〜11世紀', '摂関政治', '藤原氏'], ['11世紀末〜', '院政', '上皇'], ['12世紀後半', '平氏の政治', '平清盛']];
  const q = ['', 'A', 'B', 'C'];
  let s = `<defs>${arrowDefs('fl' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  E.forEach(([y, t, p], i) => {
    const x = 10 + i * 188;
    s += `<rect x="${x}" y="22" width="168" height="92" rx="8" fill="${['#f6e7d8', '#efe0e6', '#e4e8f2', '#e2eedf'][i]}" stroke="#8f4a2f" stroke-width="1.2"/>`;
    s += txt(x + 84, 42, y, { size: 13, noHalo: true, fill: '#8e2a1f' });
    s += mode === 'q' && q[i] ? badge(x + 84, 70, q[i], { r: 11, size: 14 }) : txt(x + 84, 70, t, { size: 16, noHalo: true });
    s += txt(x + 84, 98, `（${p}）`, { size: 13, noHalo: true, weight: 400 });
    if (i < 3) s += `<line x1="${x + 170}" y1="68" x2="${x + 186}" y2="68" stroke="#8f4a2f" stroke-width="2.4" marker-end="url(#fl${mode})"/>`;
  });
  return svg(w, h, s);
}
const figs = { heianMapLabel: heianMap('label'), heianMapQ: heianMap('q'), sekkanLabel: sekkan('label'), sekkanQ: sekkan('q'), kanaLabel: kana('label'), kanaQ: kana('q'), hflowLabel: flow('label'), hflowQ: flow('q') };
fs.writeFileSync('figs_h06.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

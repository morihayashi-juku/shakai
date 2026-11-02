// 歴史 第5講「奈良時代」の図
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

// 遣唐使の道
function kentoshi(mode) {
  const w = 620, h = 420;
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[107, 29], [137.5, 41]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('kn' + mode, '#2563a8')}${arrowDefs('ks' + mode, '#c0392b')}<clipPath id="kc${mode}"><path d="${ps(path, land)}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.6"/><path d="${ps(path, japan)}" fill="#efe3c9" stroke="#888" stroke-width="0.6"/>`;
  const sil = [[124.2, 39.8], [125.3, 37.8], [125.8, 37.6], [125.9, 34.3], [129.7, 34.6], [129.7, 37.0], [129.6, 40.6], [128.6, 40.8], [126.0, 40.0]];
  s += `<g clip-path="url(#kc${mode})"><path d="M${sil.map(ll => proj(ll).map(r1).join(' ')).join(' L')} Z" fill="#e0e9d2" stroke="#8f4a2f" stroke-dasharray="3 2"/></g>`;
  const north = [[135.5, 34.67], [131.0, 33.95], [130.4, 33.6], [129.6, 34.4], [128.6, 35.0], [126.6, 35.0], [125.5, 36.6], [122.5, 37.4], [119.5, 37.0], [117.5, 36.0], [112.45, 34.62], [108.9, 34.3]];
  const south = [[135.5, 34.67], [131.0, 33.95], [130.4, 33.6], [129.0, 32.8], [125.0, 31.5], [121.8, 31.7], [119.4, 32.4], [114.0, 33.6], [108.9, 34.3]];
  s += `<path d="${ps(path, { type: 'LineString', coordinates: north })}" fill="none" stroke="#2563a8" stroke-width="2.4" stroke-dasharray="6 4" marker-end="url(#kn${mode})"/>`;
  s += `<path d="${ps(path, { type: 'LineString', coordinates: south })}" fill="none" stroke="#c0392b" stroke-width="2.4" stroke-dasharray="6 4" marker-end="url(#ks${mode})"/>`;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const dot = (lo, la) => { const [x, y] = proj([lo, la]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="#333" stroke="#fff" stroke-width="1.3"/>`; };
  s += dot(108.9, 34.3) + dot(135.8, 34.69) + dot(130.52, 33.52);
  if (mode === 'label') {
    s += L('唐', 113.5, 37.5, { size: 20 }) + L('長安', 108.9, 33.6, { size: 13 }) + L('新羅', 128.0, 36.6, { size: 14 }) + L('平城京', 135.6, 35.3, { size: 12.5 }) + L('大宰府', 130.4, 33.15, { size: 12, anchor: 'end' });
    s += L('北路（朝鮮半島ぞい）', 120.5, 38.3, { size: 12.5, fill: '#2563a8' }) + L('南路（東シナ海を横切る）', 123.5, 30.3, { size: 12.5, fill: '#c0392b' });
  } else {
    s += badge(...proj([113.5, 37.5]), 'A') + badge(...proj([128.0, 36.6]), 'B') + L('北路', 120.5, 38.3, { size: 12.5, fill: '#2563a8' }) + L('南路', 123.5, 30.3, { size: 12.5, fill: '#c0392b' });
    const [x, y] = proj([108.9, 34.3]); s += badge(x, y + 20, 'X', { r: 11, size: 14 });
    const [x2, y2] = proj([135.8, 34.69]); s += badge(x2 + 18, y2 + 14, 'Y', { r: 11, size: 14 });
  }
  s += L('日本海', 133.5, 39.5, { size: 13, fill: '#1f4f7a', weight: 400 }) + L('東シナ海', 125, 29.6, { size: 12, fill: '#1f4f7a', weight: 400 });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 平城京の図
function heijo(mode) {
  const w = 560, h = 470;
  const X0 = 60, Y0 = 40, cw = 36, rh = 40; // 8列(右京4・左京4)+外京2, 9段
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  for (let c = 0; c < 8; c++) for (let r = 0; r < 9; r++) s += `<rect x="${X0 + c * cw}" y="${Y0 + r * rh}" width="${cw}" height="${rh}" fill="#f7f2e7" stroke="#c9bda3" stroke-width="0.8"/>`;
  for (let c = 8; c < 11; c++) for (let r = 0; r < 5; r++) s += `<rect x="${X0 + c * cw}" y="${Y0 + r * rh}" width="${cw}" height="${rh}" fill="#f7f2e7" stroke="#c9bda3" stroke-width="0.8"/>`;
  const mid = X0 + 4 * cw;
  s += `<rect x="${mid - 36}" y="${Y0}" width="72" height="${rh * 2}" fill="#e7c9b8" stroke="#8f4a2f" stroke-width="1.6"/>`;
  s += `<line x1="${mid}" y1="${Y0 + rh * 2}" x2="${mid}" y2="${Y0 + rh * 9}" stroke="#8f4a2f" stroke-width="4"/>`;
  const sq = (c, r, col) => `<rect x="${X0 + c * cw + 4}" y="${Y0 + r * rh + 4}" width="${cw - 8}" height="${rh - 8}" fill="${col}" stroke="#555"/>`;
  s += sq(1, 6, '#d6e3ef') + sq(6, 6, '#d6e3ef');
  s += `<circle cx="${X0 + 9 * cw + 18}" cy="${Y0 + rh * 1.5}" r="9" fill="#c9b3dc" stroke="#555"/>`;
  s += `<rect x="${X0 + 11 * cw + 14}" y="${Y0 + 10}" width="44" height="34" fill="#c9b3dc" stroke="#555"/>`;
  s += `<circle cx="${X0 + 1 * cw + 18}" cy="${Y0 + rh * 4.5}" r="9" fill="#c9b3dc" stroke="#555"/><circle cx="${X0 + 1 * cw + 18}" cy="${Y0 + rh * 7.5}" r="9" fill="#c9b3dc" stroke="#555"/>`;
  const T = (x, y, t, o = {}) => txt(x, y, t, { size: 13, ...o });
  if (mode === 'label') {
    s += T(mid, Y0 + rh, '平城宮', { size: 14 }) + T(mid + 12, Y0 + rh * 5.5, '朱雀大路', { anchor: 'start', size: 12.5, fill: '#8f4a2f' });
    s += T(X0 + 2 * cw, Y0 + rh * 9 + 16, '右京', { size: 14 }) + T(X0 + 6 * cw, Y0 + rh * 9 + 16, '左京', { size: 14 }) + T(X0 + 9.5 * cw, Y0 + rh * 5 + 16, '外京', { size: 13 });
    s += T(X0 + 1.5 * cw, Y0 + rh * 6.5, '西市', { size: 11.5 }) + T(X0 + 6.5 * cw, Y0 + rh * 6.5, '東市', { size: 11.5 });
    s += T(X0 + 9.5 * cw, Y0 + rh * 2.25, '興福寺', { size: 11.5 }) + T(X0 + 11 * cw + 36, Y0 + 56, '東大寺', { size: 12 });
    s += T(X0 + 1.5 * cw, Y0 + rh * 4.05, '唐招提寺', { size: 11 }) + T(X0 + 1.5 * cw, Y0 + rh * 7.05, '薬師寺', { size: 11 });
    s += T(w / 2, 16, '平城京（長安にならい、碁盤の目のように区切られた）', { size: 13 });
  } else {
    s += badge(mid, Y0 + rh, 'A') + badge(mid + 22, Y0 + rh * 5.5, 'B', { r: 11, size: 14 }) + badge(X0 + 6.5 * cw, Y0 + rh * 6.5, 'C', { r: 10, size: 13 }) + badge(X0 + 11 * cw + 36, Y0 + 27, 'D', { r: 11, size: 14 });
    s += T(X0 + 2 * cw, Y0 + rh * 9 + 16, '右京', { size: 14 }) + T(X0 + 6 * cw, Y0 + rh * 9 + 16, '左京', { size: 14 });
    s += T(w / 2, 16, '奈良時代の都', { size: 13 });
  }
  s += `<text x="${w - 18}" y="${h - 12}" font-size="11" text-anchor="end" fill="#555">北が上</text>`;
  return svg(w, h, s);
}
// 農民の負担
function futan(mode) {
  const w = 740, h = 250;
  let s = `<defs>${arrowDefs('fu' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<rect x="20" y="88" width="120" height="74" rx="10" fill="#f3dccc" stroke="#8f4a2f" stroke-width="1.4"/>` + txt(80, 112, '農民', { size: 17, noHalo: true }) + txt(80, 138, '口分田を耕す', { size: 12, weight: 400, noHalo: true });
  const items = [['租', '稲（収穫の約3%）', '国に納める', 'A'], ['調', '地方の特産物', '都に運ぶ', 'B'], ['庸', '労役のかわりに布', '都に運ぶ', 'C'], ['雑徭', '地方で労役（年60日以内）', '国のために働く', 'D'], ['兵役', '防人（九州の守り）など', '兵士になる', 'E']];
  items.forEach(([n, a, b, q], i) => {
    const y = 14 + i * 46;
    s += `<line x1="142" y1="125" x2="200" y2="${y + 18}" stroke="#8f4a2f" stroke-width="1.6" marker-end="url(#fu${mode})"/>`;
    s += `<rect x="204" y="${y}" width="74" height="36" rx="5" fill="#f6efe4" stroke="#8f4a2f"/>` + (mode === 'q' ? badge(241, y + 18, q, { r: 11, size: 14 }) : txt(241, y + 18, n, { size: 16, noHalo: true }));
    s += txt(290, y + 18, a, { size: 13.5, anchor: 'start', noHalo: true }) + txt(560, y + 18, b, { size: 12.5, anchor: 'start', noHalo: true, fill: '#555', weight: 400 });
  });
  return svg(w, h, s);
}
const figs = { kentoLabel: kentoshi('label'), kentoQ: kentoshi('q'), heijoLabel: heijo('label'), heijoQ: heijo('q'), futanLabel: futan('label'), futanQ: futan('q') };
fs.writeFileSync('figs_h05.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

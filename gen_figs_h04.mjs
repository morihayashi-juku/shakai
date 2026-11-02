// 歴史 第4講「飛鳥時代」の図
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
// 7世紀の東アジア
function ea7(mode) {
  const w = 620, h = 430;
  const proj = d3.geoMercator().fitExtent([[0, 0], [w, h]], { type: 'MultiPoint', coordinates: [[107, 30], [137.5, 42]] }).clipExtent([[0, 0], [w, h]]);
  const path = d3.geoPath(proj);
  let s = `<defs>${arrowDefs('kz' + mode, '#8f4a2f')}<clipPath id="kl${mode}"><path d="${ps(path, land)}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><path d="${ps(path, land)}" fill="#f4f1ea" stroke="#999" stroke-width="0.6"/><path d="${ps(path, japan)}" fill="#efe3c9" stroke="#888" stroke-width="0.6"/>`;
  const poly = { 高句麗: [[124.2, 39.8], [125.3, 37.8], [126.1, 37.6], [127.3, 37.6], [128.7, 38.3], [129.6, 40.6], [130.6, 42.6], [128.3, 42.9], [125.6, 42.0], [124.4, 40.6]], 百済: [[125.8, 37.6], [127.3, 37.6], [127.6, 36.6], [127.6, 35.3], [127.0, 34.3], [125.9, 34.3], [126.0, 36.0]], 新羅: [[127.3, 37.6], [128.7, 38.3], [129.7, 37.0], [129.7, 35.9], [129.4, 35.2], [128.8, 34.6], [127.7, 34.5], [127.6, 35.3], [127.6, 36.6]] };
  const col = { 高句麗: '#e7d1c8', 百済: '#d6e3ef', 新羅: '#e0e9d2' };
  s += `<g clip-path="url(#kl${mode})">` + Object.entries(poly).map(([n, c]) => `<path d="M${c.map(ll => proj(ll).map(r1).join(' ')).join(' L')} Z" fill="${col[n]}" stroke="#8f4a2f" stroke-width="1" stroke-dasharray="3 2"/>`).join('') + `</g>`;
  const route = [[135.5, 34.67], [133.5, 34.3], [131.0, 33.95], [130.4, 33.6], [129.6, 34.4], [128.6, 35.0], [126.6, 35.0], [125.5, 36.6], [122.5, 37.4], [119.5, 37.0], [117.5, 36.0], [112.45, 34.62]];
  s += `<path d="${ps(path, { type: 'LineString', coordinates: route })}" fill="none" stroke="#8f4a2f" stroke-width="2.4" stroke-dasharray="6 4" marker-end="url(#kz${mode})"/>`;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const dot = (lo, la, c = '#333') => { const [x, y] = proj([lo, la]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" fill="${c}" stroke="#fff" stroke-width="1.3"/>`; };
  s += dot(108.9, 34.3) + dot(126.75, 36.0, '#c0392b') + dot(130.52, 33.52) + dot(135.82, 34.47);
  if (mode === 'label') {
    s += L('隋・唐', 112, 37.5, { size: 17 }) + L('長安（都）', 108.9, 33.6, { size: 12 }) + L('高句麗', 126.2, 40.6, { size: 14 }) + L('百済', 126.8, 36.6, { size: 13 }) + L('新羅', 128.75, 36.75, { size: 13 });
    s += L('白村江', 126.6, 35.5, { size: 12.5, fill: '#c0392b', anchor: 'end' }) + L('大宰府', 130.4, 33.2, { size: 12, anchor: 'end' }) + L('飛鳥', 135.9, 34.2, { size: 12.5, anchor: 'start' }) + L('倭（日本）', 134.0, 35.6, { size: 15, fill: '#8f4a2f' });
    s += L('遣隋使・遣唐使の道（例）', 119.5, 38.0, { size: 12, fill: '#8f4a2f' });
  } else {
    s += badge(...proj([112, 37.5]), 'A') + badge(...proj([126.2, 40.6]), 'B') + badge(...proj([126.6, 36.75]), 'C') + badge(...proj([128.75, 36.75]), 'D');
    const [bx, by] = proj([126.75, 36.0]); s += badge(bx - 18, by + 10, 'X', { r: 11, size: 14 });
    const [dx, dy] = proj([130.52, 33.52]); s += badge(dx - 18, dy + 6, 'Y', { r: 11, size: 14 });
    s += L('Zの使いの道（例）', 119.5, 38.0, { size: 12, fill: '#8f4a2f' });
  }
  s += L('日本海', 133.5, 39.5, { size: 13, fill: '#1f4f7a', weight: 400 }) + L('黄海', 123.3, 35.3, { size: 13, fill: '#1f4f7a', weight: 400 });
  s += `<rect width="${w}" height="${h}" fill="none" stroke="#555"/>`;
  return svg(w, h, s);
}
// 冠位十二階
function kani(mode) {
  const w = 720, h = 150;
  const R = [['徳', '#7b4fa0'], ['仁', '#2f6fb0'], ['礼', '#c0392b'], ['信', '#d9b400'], ['義', '#ffffff'], ['智', '#333333']];
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, mode === 'label' ? '冠位十二階（冠の色で位を区別した）' : '聖徳太子が定めた役人の位の制度（冠の色で区別）', { size: 14, noHalo: true });
  R.forEach(([n, c], i) => {
    const x = 20 + i * 117;
    s += `<rect x="${x}" y="32" width="105" height="60" rx="6" fill="${c}" stroke="#555"/>`;
    const tc = (c === '#ffffff' || c === '#d9b400') ? '#222' : '#fff';
    s += txt(x + 52, 50, `大${n}`, { size: 16, noHalo: true, fill: tc }) + txt(x + 52, 76, `小${n}`, { size: 16, noHalo: true, fill: tc });
  });
  s += `<line x1="20" y1="112" x2="700" y2="112" stroke="#555" stroke-width="1.5"/>` + txt(20, 128, '← 位が高い', { size: 12.5, anchor: 'start', noHalo: true }) + txt(700, 128, '位が低い →', { size: 12.5, anchor: 'end', noHalo: true });
  s += txt(w / 2, 136, mode === 'label' ? '家柄ではなく、才能や功績で役人に取り立てる' : '', { size: 12.5, noHalo: true, fill: '#8e2a1f' });
  return svg(w, h, s);
}
// 律令国家のしくみ
function ritsuryo(mode) {
  const w = 720, h = 290;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, y, bw, bh, t, sub, fill = '#f6efe4', q) => `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" fill="${fill}" stroke="#8f4a2f" stroke-width="1.3"/>` + (mode === 'q' && q ? badge(x + bw / 2, y + bh / 2, q, { r: 11, size: 14 }) : txt(x + bw / 2, y + (sub ? bh / 2 - 8 : bh / 2), t, { size: 14, noHalo: true })) + (sub && !(mode === 'q' && q) ? txt(x + bw / 2, y + bh / 2 + 10, sub, { size: 11, weight: 400, noHalo: true }) : '');
  const ln = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#555" stroke-width="1.6" fill="none"/>`;
  s += txt(180, 14, '中央', { size: 14, noHalo: true, fill: '#8f4a2f' }) + txt(540, 14, '地方', { size: 14, noHalo: true, fill: '#8f4a2f' });
  s += box(130, 28, 100, 34, '天皇', '', '#f3dccc');
  s += ln(180, 62, 180, 78) + ln(90, 78, 270, 78) + ln(90, 78, 90, 90) + ln(270, 78, 270, 90);
  s += box(30, 90, 120, 44, '神祇官', '祭りを担当') + box(200, 90, 140, 44, '太政官', '政治を担当', '#f6efe4', 'A');
  s += ln(270, 134, 270, 150) + box(190, 150, 160, 40, '八省', '仕事を分担');
  s += txt(180, 222, '二官八省', { size: 15, noHalo: true, fill: '#8f4a2f' });
  s += `<line x1="380" y1="24" x2="380" y2="${h - 10}" stroke="#bbb" stroke-dasharray="4 3"/>`;
  s += box(420, 28, 130, 44, '国', '国司（都から派遣）', '#e6eef2', 'B') + ln(485, 72, 485, 86) + box(420, 86, 130, 44, '郡', '郡司（地方の豪族）', '#e6eef2') + ln(485, 130, 485, 144) + box(420, 144, 130, 44, '里', '里長', '#e6eef2');
  s += box(566, 28, 146, 60, '大宰府', '九州の政治・外交・防衛', '#f3e6d6', 'C');
  s += txt(w / 2, h - 30, mode === 'label' ? '律（刑罰のきまり）と令（政治のきまり）にもとづいて国を治める ＝ 律令国家' : '', { size: 13, noHalo: true, fill: '#8e2a1f' });
  return svg(w, h, s);
}
// 流れ図
function flow(mode) {
  const w = 760, h = 150;
  const E = [['593', '聖徳太子が政治に参加', 'A'], ['645', '大化の改新', 'B'], ['663', '白村江の戦い', 'C'], ['672', '壬申の乱', 'D'], ['701', '大宝律令', 'E']];
  let s = `<defs>${arrowDefs('fl' + mode, '#8f4a2f')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  E.forEach(([y, t, q], i) => {
    const x = 10 + i * 150;
    s += `<rect x="${x}" y="30" width="134" height="76" rx="8" fill="${['#f6e7d8', '#efe0e6', '#e4e8f2', '#e2eedf', '#f3ead0'][i]}" stroke="#8f4a2f" stroke-width="1.2"/>`;
    s += txt(x + 67, 50, y + '年', { size: 15, noHalo: true, fill: '#8e2a1f' });
    s += mode === 'q' ? badge(x + 67, 80, q, { r: 11, size: 14 }) : txt(x + 67, 80, t, { size: t.length > 8 ? 12 : 14, noHalo: true });
    if (i < 4) s += `<line x1="${x + 136}" y1="68" x2="${x + 148}" y2="68" stroke="#8f4a2f" stroke-width="2.4" marker-end="url(#fl${mode})"/>`;
  });
  s += txt(w / 2, 14, '飛鳥時代の流れ', { size: 14, noHalo: true }) + txt(w / 2, 128, mode === 'label' ? '天皇を中心とする国づくり → 律令国家へ' : '', { size: 13, noHalo: true, fill: '#8f4a2f' });
  return svg(w, h, s);
}
const figs = { ea7Label: ea7('label'), ea7Q: ea7('q'), kaniLabel: kani('label'), kaniQ: kani('q'), ritsuLabel: ritsuryo('label'), ritsuQ: ritsuryo('q'), flowLabel: flow('label'), flowQ: flow('q') };
fs.writeFileSync('figs_h04.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

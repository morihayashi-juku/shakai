// 地理 第17講「近畿地方」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import fs from 'fs';
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.12));
const prefs = topojson.feature(jt, jt.objects.japan).features;
const lakes = JSON.parse(fs.readFileSync('data/lakes50.geojson')).features.filter(f => f.properties.name === 'Biwa-ko' || f.properties.name === 'Lake Biwa' || /Biwa/.test(f.properties.name || ''));
const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33', river: '#3f7fb5' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 12;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 15}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const line = (path, coords) => ps(path, { type: 'LineString', coordinates: coords });
const KK = ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'];
const CAP = { 三重県: ['津市', [136.35, 34.6]], 滋賀県: ['大津市', [136.2, 35.05]], 京都府: ['京都市', [135.5, 35.3]], 大阪府: ['大阪市', [135.47, 34.55]], 兵庫県: ['神戸市', [134.85, 35.05]], 奈良県: ['奈良市', [135.85, 34.25]], 和歌山県: ['和歌山市', [135.45, 33.85]] };

function kkBase(w, h, fill, id) {
  const proj = d3.geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: [[134.2, 33.4], [136.9, 35.8]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; const isK = KK.includes(n); s += `<path d="${ps(path, f)}" fill="${isK ? fill(n) : '#f6f5f1'}" stroke="${isK ? '#666' : '#aaa'}" stroke-width="${isK ? 0.8 : 0.4}"/>`; }
  for (const f of lakes) s += `<path d="${ps(path, f)}" fill="#cfe0ee" stroke="${C.river}" stroke-width="0.8"/>`;
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const tri = (x, y) => `<path d="M${r1(x - 8)} ${r1(y + 6)} L${r1(x)} ${r1(y - 7)} L${r1(x + 8)} ${r1(y + 6)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`;

function figMap(mode) {
  const w = 560, h = 560;
  const { s: base, proj, path, close } = kkBase(w, h, () => C.land, 'km' + mode);
  let s = base;
  s += `<path d="${line(path, [[135.87, 34.97], [135.75, 34.9], [135.6, 34.8], [135.45, 34.7]])}" fill="none" stroke="${C.river}" stroke-width="2.6"/>`;  // 淀川
  [[135.85, 34.1], [136.05, 34.0], [135.65, 34.0], [135.9, 33.85]].forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  [[135.5, 35.25], [135.3, 35.15]].forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('琵琶湖', 136.35, 35.4, { size: 14, fill: '#1f4f7a', anchor: 'start' }) + L('淀川', 135.55, 34.92, { size: 12, fill: '#1f4f7a', anchor: 'end' });
    s += L('大阪平野', 135.6, 34.62, { size: 12, anchor: 'start' }) + L('紀伊山地', 135.85, 34.25, { size: 14 }) + L('紀伊半島', 136.3, 33.75, { size: 14 }) + L('丹波高地', 135.4, 35.38, { size: 12 });
    s += L('若狭湾', 135.75, 35.72, { size: 13, fill: '#1f4f7a' }) + L('大阪湾', 135.15, 34.45, { size: 12, fill: '#1f4f7a' }) + L('志摩半島', 136.95, 34.4, { size: 12, anchor: 'end' }) + L('淡路島', 134.7, 34.25, { size: 12, anchor: 'end' }) + L('潮岬', 135.8, 33.42, { size: 12 });
    const [kx, ky] = proj([135.24, 34.43]); s += `<rect x="${r1(kx - 5)}" y="${r1(ky - 5)}" width="10" height="10" fill="#b5513c"/>` + txt(kx + 8, ky + 10, '関西国際空港', { size: 11, anchor: 'start' });
  } else {
    s += badge(...proj([136.35, 35.4]), 'ア') + badge(...proj([135.5, 34.95]), 'イ') + badge(...proj([135.85, 34.25]), 'A', { square: true }) + badge(...proj([135.75, 35.72]), 'B', { square: true }) + badge(...proj([136.85, 34.35]), 'C', { square: true }) + badge(...proj([134.7, 34.3]), 'D', { square: true });
  }
  return svg(w, h, s);
}
function figPrefs(mode) {
  const w = 520, h = 520;
  const COLS = { 三重県: '#f2d58a', 滋賀県: '#cfe0bf', 京都府: '#e9c3a8', 大阪府: '#f0b7a4', 兵庫県: '#b9cfe3', 奈良県: '#d6c9e6', 和歌山県: '#c6e0d6' };
  const { s: base, proj, close } = kkBase(w, h, n => COLS[n], 'kp' + mode);
  let s = base + close;
  KK.forEach((n, i) => { const [x, y] = proj(CAP[n][1]); s += mode === 'label' ? txt(x, y - 8, n, { size: 14 }) + txt(x, y + 9, `（${CAP[n][0]}）`, { size: 11, weight: 400 }) : badge(x, y, i + 1, { r: 13, size: 16 }); });
  s += txt(w - 8, h - 10, '（　）は府県庁所在地', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

const NORM = {
  maizuru: ['舞鶴', '北部（日本海側）', [4.2, 4.5, 7.6, 12.9, 17.9, 21.9, 26.0, 27.3, 23.3, 17.5, 11.9, 6.8], [185, 147, 138, 108, 135, 155, 198, 131, 227, 147, 138, 206]],
  osaka: ['大阪', '中央部（瀬戸内）', [6.2, 6.6, 9.9, 15.2, 20.1, 23.6, 27.7, 29.0, 25.2, 19.5, 13.8, 8.7], [47, 60, 104, 103, 145, 185, 174, 113, 153, 124, 70, 51]],
  shiono: ['潮岬', '南部（太平洋側）', [8.4, 9.0, 11.7, 15.6, 19.2, 22.3, 25.8, 26.9, 24.9, 20.9, 15.9, 10.9], [101, 118, 195, 212, 251, 342, 265, 232, 327, 247, 156, 104]],
};
function climGraph(key, title, sub) {
  const [, , T, P] = NORM[key];
  const w = 236, h = 224, L = 38, R = 194, top = sub ? 52 : 32, bot = h - 24, H = bot - top;
  const yT = v => bot - (v + 10) / 50 * H, yP = v => bot - v / 600 * H, bw = (R - L) / 12;
  let s = `<rect x="${L}" y="${top}" width="${R - L}" height="${H}" fill="#fff" stroke="${C.ink}"/>`;
  for (let v = 0; v <= 30; v += 10) s += `<line x1="${L}" y1="${r1(yT(v))}" x2="${R}" y2="${r1(yT(v))}" stroke="#c9d3da" stroke-width="${v === 0 ? 1 : 0.6}"/>`;
  P.forEach((p, i) => { s += `<rect x="${r1(L + i * bw + 1.5)}" y="${r1(yP(p))}" width="${r1(bw - 3)}" height="${r1(bot - yP(p))}" fill="#7da7c9" stroke="#3d6688" stroke-width="0.5"/>`; });
  s += `<polyline points="${T.map((v, i) => `${r1(L + (i + 0.5) * bw)},${r1(yT(v))}`).join(' ')}" fill="none" stroke="#b33a2c" stroke-width="2.2"/>`;
  T.forEach((v, i) => { s += `<circle cx="${r1(L + (i + 0.5) * bw)}" cy="${r1(yT(v))}" r="2.3" fill="#b33a2c"/>`; });
  for (let v = -10; v <= 40; v += 10) s += txt(L - 4, yT(v), String(v), { size: 12.5, weight: 400, anchor: 'end', noHalo: true });
  for (let v = 0; v <= 600; v += 100) s += txt(R + 4, yP(v), String(v), { size: 12.5, weight: 400, anchor: 'start', noHalo: true });
  [1, 4, 7, 10].forEach(m => { s += txt(L + (m - 0.5) * bw, bot + 11, String(m), { size: 12.5, weight: 400, noHalo: true }); });
  s += txt(L - 4, top - 9, '℃', { size: 12, weight: 400, anchor: 'end', noHalo: true }) + txt(R + 4, top - 9, 'mm', { size: 12, weight: 400, anchor: 'start', noHalo: true });
  s += txt((L + R) / 2, 13, title, { size: 18, noHalo: true });
  if (sub) s += txt((L + R) / 2, 33, sub, { size: 12.5, weight: 400, noHalo: true });
  return svg(w, h, s);
}
function bandRows(title, rows, note, mode) {
  const w = 560, L = 76, R = 550, top = 36, rowH = 42, h = top + rows.length * rowH + 22;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, title, { size: 14, noHalo: true });
  rows.forEach(([y, parts], i) => { let x = L; const yy = top + i * rowH; s += txt(L - 8, yy + 16, y, { size: 13, anchor: 'end', noHalo: true }); parts.forEach(([n, v, c], j) => { const ww = v / 100 * (R - L); const lab = mode === 'q' && j === 0 && i === 0 ? 'X' : n; s += `<rect x="${r1(x)}" y="${yy}" width="${r1(ww)}" height="32" fill="${c}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + ww / 2, yy + 16, ww > 52 ? `${lab} ${v}%` : `${v}%`, { size: 12, noHalo: true }); x += ww; }); });
  s += txt(w - 4, h - 4, note, { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const P = (m, k, c, f, o) => [['金属', m, '#9dbcdc'], ['機械', k, '#e9a98f'], ['化学', c, '#c9b3dc'], ['食料品', f, '#a9cf98'], ['その他', o, '#eeeae0']];
function hanshin(mode) {
  return bandRows('阪神工業地帯と中京工業地帯の製造品出荷額の割合', [[mode === 'q' ? 'Y' : '阪神', P(21, 38, 16, 11, 14)], [mode === 'q' ? 'Z' : '中京', P(9, 69, 6, 5, 11)]], '2019年。工業統計をもとにしたおおよその割合', 'label');
}
function wakayama(mode) {
  const rows = [['うめ', 65], ['みかん', 21], ['かき', 21]];
  const w = 360, L = 70, R = 320, rowH = 32, top = 40, h = top + rows.length * rowH + 34;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, mode === 'label' ? '和歌山県が生産1位の果物と全国にしめる割合' : '県Xが生産1位の果物と全国にしめる割合', { size: 13, noHalo: true });
  for (let v = 0; v <= 75; v += 25) { const x = L + v / 75 * (R - L); s += `<line x1="${r1(x)}" y1="${top - 4}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#e1e5e8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${y + 5}" width="${r1(v / 75 * (R - L))}" height="${rowH - 10}" fill="#b5513c"/>` + txt(L + v / 75 * (R - L) + 5, y + rowH / 2, `約${v}%`, { size: 12, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, '2023年ごろ。農林水産省の統計をもとにしたおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

const figs = {
  kkMapLabel: figMap('label'), kkMapQ: figMap('q'), kkPrefLabel: figPrefs('label'), kkPrefQ: figPrefs('q'),
  hanshinLabel: hanshin('label'), hanshinQ: hanshin('q'), wakaLabel: wakayama('label'), wakaQ: wakayama('q'),
};
['maizuru', 'osaka', 'shiono'].forEach(k => { figs['kk_' + k] = climGraph(k, NORM[k][0], NORM[k][1]); });
['shiono', 'maizuru', 'osaka'].forEach((k, i) => { figs['kkq_' + k] = climGraph(k, 'ABC'[i], ''); });
fs.writeFileSync('figs17.json', JSON.stringify(figs));
console.log(lakes.length, Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

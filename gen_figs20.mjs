// 地理 第20講「東北地方」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import fs from 'fs';
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.12));
const prefs = topojson.feature(jt, jt.objects.japan).features;
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



const TH = ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'];
const CAP = { 青森県: ['青森市', [140.95, 40.62]], 岩手県: ['盛岡市', [141.4, 39.65]], 宮城県: ['仙台市', [140.9, 38.5]], 秋田県: ['秋田市', [140.4, 39.6]], 山形県: ['山形市', [140.05, 38.55]], 福島県: ['福島市', [140.35, 37.4]] };
const EXT = [[139.3, 36.85], [142.15, 41.55]];
const lake = (proj, c, rx, ry) => { const [x, y] = proj(c); return `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${rx}" ry="${ry}" fill="#cfe0ee" stroke="${C.river}" stroke-width="0.8"/>`; };
function thBase(w, h, fill, id, ext = EXT) {
  const proj = d3.geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: ext });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; const isT = TH.includes(n); s += `<path d="${ps(path, f)}" fill="${isT ? fill(n) : '#f6f5f1'}" stroke="${isT ? '#666' : '#aaa'}" stroke-width="${isT ? 0.8 : 0.4}"/>`; }
  s += lake(proj, [140.9, 40.47], 5, 4) + lake(proj, [140.08, 37.48], 6, 5) + lake(proj, [140.66, 39.72], 3, 3);
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const tri = (x, y) => `<path d="M${r1(x - 7)} ${r1(y + 5)} L${r1(x)} ${r1(y - 6)} L${r1(x + 7)} ${r1(y + 5)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`;
const RIV = {
  kitakami: [[141.2, 40.05], [141.15, 39.7], [141.1, 39.3], [141.15, 38.9], [141.22, 38.6], [141.3, 38.43]],
  mogami: [[140.05, 37.85], [140.15, 38.15], [140.3, 38.4], [140.35, 38.68], [140.22, 38.8], [139.95, 38.84], [139.84, 38.92]],
  omono: [[140.5, 39.2], [140.45, 39.45], [140.2, 39.6], [140.07, 39.73]],
  abukuma: [[140.2, 37.15], [140.4, 37.5], [140.5, 37.8], [140.75, 38.0], [140.92, 38.12]],
  iwaki: [[140.2, 40.55], [140.38, 40.8], [140.43, 41.0]],
};
const MTS = [[140.85, 40.25], [140.82, 39.9], [140.78, 39.55], [140.72, 39.2], [140.6, 38.85], [140.48, 38.5], [140.3, 38.15], [140.15, 37.8], [140.22, 39.95], [140.15, 39.25], [141.55, 40.0], [141.62, 39.55], [141.55, 39.15], [140.15, 40.45]];
function figMap(mode) {
  const w = 480, h = 640;
  const { s: base, proj, path, close } = thBase(w, h, () => C.land, 'tm' + mode);
  let s = base;
  Object.entries(RIV).forEach(([k, c]) => { s += `<path d="${line(path, c)}" fill="none" stroke="${C.river}" stroke-width="${k === 'kitakami' || k === 'mogami' ? 2.6 : 1.6}"/>`; });
  MTS.forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const B = (n, lo, la, sq) => badge(...proj([lo, la]), n, sq ? { square: true } : {});
  if (mode === 'label') {
    s += L('奥羽山脈', 140.62, 39.05, { size: 13, anchor: 'end' }) + L('出羽山地', 140.3, 39.95, { size: 11, anchor: 'start' }) + L('北上高地', 141.7, 39.85, { size: 12, anchor: 'start' }) + L('白神山地', 140.05, 40.33, { size: 11, anchor: 'end' });
    s += L('北上川', 141.25, 39.25, { size: 12, fill: '#1f4f7a', anchor: 'start' }) + L('最上川', 140.42, 38.65, { size: 12, fill: '#1f4f7a', anchor: 'start' }) + L('雄物川', 140.2, 39.5, { size: 11, fill: '#1f4f7a', anchor: 'end' }) + L('阿武隈川', 140.6, 37.7, { size: 11, fill: '#1f4f7a', anchor: 'start' }) + L('十和田湖', 141.0, 40.47, { size: 11, fill: '#1f4f7a', anchor: 'start' }) + L('猪苗代湖', 140.0, 37.38, { size: 11, fill: '#1f4f7a', anchor: 'end' });
    s += L('津軽平野', 140.3, 40.85, { size: 11, anchor: 'end' }) + L('秋田平野', 139.98, 39.75, { size: 11, anchor: 'end' }) + L('庄内平野', 139.72, 38.85, { size: 11, anchor: 'end' }) + L('仙台平野', 141.0, 38.25, { size: 12, anchor: 'start' }) + L('北上盆地', 141.22, 39.95, { size: 10.5, anchor: 'start' }) + L('山形盆地', 140.2, 38.3, { size: 10.5, anchor: 'end' });
    s += L('下北半島', 141.35, 41.42, { size: 12, anchor: 'start' }) + L('津軽半島', 140.3, 41.15, { size: 11, anchor: 'end' }) + L('男鹿半島', 139.72, 40.02, { size: 11, anchor: 'end' }) + L('陸奥湾', 140.95, 41.0, { size: 11, fill: '#1f4f7a' }) + L('三陸海岸', 141.95, 39.15, { size: 13, anchor: 'start' });
    s += L('日本海', 139.55, 40.6, { size: 14, fill: '#1f4f7a' }) + L('太平洋', 141.75, 37.8, { size: 14, fill: '#1f4f7a' });
  } else {
    s += B('ア', 141.25, 39.25) + B('イ', 140.42, 38.65) + B('A', 140.5, 39.05, 1) + B('B', 141.75, 39.75, 1) + B('C', 140.05, 40.33, 1) + B('D', 140.3, 40.85, 1) + B('E', 139.72, 38.85, 1) + B('F', 141.0, 38.25, 1) + B('G', 141.95, 39.15, 1) + B('H', 141.35, 41.42, 1);
  }
  return svg(w, h, s);
}
function figPrefs(mode) {
  const w = 460, h = 610;
  const COLS = { 青森県: '#cfe0bf', 岩手県: '#f2d58a', 宮城県: '#b9cfe3', 秋田県: '#e9c3a8', 山形県: '#d6c9e6', 福島県: '#f0b7a4' };
  const { s: base, proj, close } = thBase(w, h, n => COLS[n], 'tp' + mode);
  let s = base + close;
  TH.forEach((n, i) => { const [x, y] = proj(CAP[n][1]); s += mode === 'label' ? txt(x, y - 8, n, { size: 13.5 }) + txt(x, y + 9, `（${CAP[n][0]}）`, { size: 11, weight: 400 }) : badge(x, y, i + 1, { r: 13, size: 16 }); });
  if (mode === 'label') s += txt(w - 8, h - 10, '（　）は県庁所在地', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}
// 海流とやませ
const arrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;
function figSea(mode) {
  const w = 520, h = 520;
  const { s: base, proj, path, close } = thBase(w, h, () => C.land, 'ts' + mode, [[137.8, 36.6], [145.2, 42.6]]);
  let s = `<defs>${arrowDefs('wr' + mode, '#c0392b')}${arrowDefs('cb' + mode, '#2563a8')}${arrowDefs('gy' + mode, '#6b7a86')}</defs>` + base + close;
  const cur = (pts, col, mk, wd = 5, dash = '') => `<path d="${line(path, pts)}" fill="none" stroke="${col}" stroke-width="${wd}" stroke-linecap="round" ${dash} marker-end="url(#${mk})"/>`;
  s += cur([[145.0, 42.3], [143.6, 41.0], [142.6, 39.6], [142.25, 38.4]], '#2563a8', 'cb' + mode);
  s += cur([[140.9, 36.7], [142.0, 37.3], [143.3, 37.8], [144.8, 38.2]], '#c0392b', 'wr' + mode);
  s += cur([[137.9, 37.6], [138.7, 38.8], [139.25, 40.2], [139.6, 41.6], [140.2, 42.4]], '#c0392b', 'wr' + mode);
  const [ax, ay] = proj([142.75, 38.3]), [bx, by] = proj([143.9, 38.85]);
  s += `<line x1="${r1(ax)}" y1="${r1(ay)}" x2="${r1(bx)}" y2="${r1(by)}" stroke="#333" stroke-width="2" stroke-dasharray="5 4"/>`;
  s += cur([[144.6, 40.9], [143.3, 40.45], [142.1, 40.1]], '#6b7a86', 'gy' + mode, 9);
  s += cur([[144.4, 39.9], [143.1, 39.55], [142.15, 39.3]], '#6b7a86', 'gy' + mode, 9);
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const B = (n, lo, la) => badge(...proj([lo, la]), n, { square: true });
  if (mode === 'label') {
    s += L('親潮（千島海流）', 144.3, 42.2, { size: 12, fill: '#2563a8', anchor: 'end' }) + L('寒流', 144.5, 42.0, { size: 11, fill: '#2563a8', anchor: 'start' });
    s += L('黒潮（日本海流）', 143.3, 37.45, { size: 12, fill: '#c0392b', anchor: 'start' }) + L('暖流', 142.1, 36.95, { size: 11, fill: '#c0392b', anchor: 'start' });
    s += L('対馬海流', 138.35, 39.2, { size: 12, fill: '#c0392b', anchor: 'end' }) + L('暖流', 138.6, 38.6, { size: 11, fill: '#c0392b', anchor: 'end' });
    s += L('潮目（潮境）', 144.0, 38.95, { size: 12, anchor: 'start' }) + L('やませ（夏）', 144.2, 40.35, { size: 13, fill: '#3f4b55' }) + L('冷たく湿った北東の風', 144.15, 40.05, { size: 10.5, weight: 400, fill: '#3f4b55' });
  } else {
    s += B('A', 144.3, 42.05) + B('B', 143.7, 37.45) + B('C', 138.35, 39.2) + B('D', 144.0, 39.0) + B('E', 144.2, 40.3);
  }
  return svg(w, h, s);
}
const NORM = {
  akita: ['秋田', '日本海側', [0.4, 0.9, 4.1, 9.4, 14.9, 19.3, 23.0, 24.9, 21.0, 14.6, 8.4, 2.9], [119, 99, 99, 104, 124, 127, 197, 185, 161, 176, 189, 160]],
  morioka: ['盛岡', '内陸', [-1.6, -0.9, 2.6, 8.4, 14.0, 18.2, 21.9, 23.4, 19.4, 12.7, 6.4, 0.9], [49, 49, 82, 85, 107, 113, 185, 186, 158, 106, 83, 76]],
  miyako: ['宮古', '太平洋側', [0.5, 0.7, 3.9, 8.7, 13.1, 16.2, 20.0, 22.2, 19.8, 14.6, 8.9, 3.4], [71, 61, 104, 103, 119, 136, 165, 177, 228, 152, 75, 63]],
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
function share(title, rows, note, hi, max = 60) {
  const w = 320, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 96, R = 290;
  let s = txt(w / 2, 14, title, { size: 16, noHalo: true });
  for (let v = 0; v <= max; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${n === hi ? '#b5513c' : '#9db7d0'}"/>` + txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, note, { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

function ind(mode) {
  const rows = mode === 'q' ? [['X', P(21, 13, 40, 16, 10)], ['Y', P(14, 45, 10, 16, 15)], ['Z', P(9, 49, 18, 12, 12)]] : [['京浜', P(9, 49, 18, 12, 12)], ['京葉', P(21, 13, 40, 16, 10)], ['北関東', P(14, 45, 10, 16, 15)]];
  return bandRows(mode === 'q' ? '関東地方の工業地帯・地域の製造品出荷額の割合' : '京浜工業地帯・京葉工業地域・北関東工業地域の製造品出荷額の割合', rows, '2019年。工業統計をもとにしたおおよその割合', 'label');
}

const NOTE = '2023年ごろ。農林水産省の統計をもとにしたおおよその値';
const RINGO = [['青森', 60], ['長野', 18], ['岩手', 6], ['山形', 5], ['福島', 3]];
const SAKU = [['山形', 70], ['北海道', 12], ['山梨', 6], ['その他', 12]];
const KOME = [['新潟', 8], ['北海道', 8], ['秋田', 7], ['山形', 5], ['宮城', 5]];
const figs = {
  thMapLabel: figMap('label'), thMapQ: figMap('q'), thPrefLabel: figPrefs('label'), thPrefQ: figPrefs('q'), seaLabel: figSea('label'), seaQ: figSea('q'),
  ringo: share('りんごの生産', RINGO, NOTE, '青森', 80), sakuranbo: share('さくらんぼの生産', SAKU, NOTE, '山形', 80), kome: share('米の生産', KOME, NOTE, '秋田', 20),
  ringoQ: share('果物 P の生産', RINGO, NOTE, '青森', 80), sakuranboQ: share('果物 Q の生産', SAKU, NOTE, '山形', 80),
};

// 祭りと伝統的工芸品の地図
function figCult() {
  const w = 460, h = 610;
  const COLS = { 青森県: '#e3eed9', 岩手県: '#f6e7bd', 宮城県: '#dbe6f1', 秋田県: '#f3e1d4', 山形県: '#e9e2f1', 福島県: '#f6dbd1' };
  const { s: base, proj, close } = thBase(w, h, n => COLS[n], 'tc');
  let s = base + close;
  const F = [['青森ねぶた祭', 140.74, 40.82, 'start', 8, -10], ['秋田竿燈まつり', 140.1, 39.72, 'end', -8, -10], ['仙台七夕まつり', 140.87, 38.27, 'start', 9, 0], ['山形花笠まつり', 140.34, 38.25, 'end', -9, 13]];
  const K = [['津軽塗', 140.46, 40.6, 'end', -9, 6], ['南部鉄器', 141.15, 39.7, 'start', 9, 0], ['大館曲げわっぱ', 140.56, 40.27, 'start', 9, 0], ['天童将棋駒', 140.38, 38.36, 'end', -9, -7], ['宮城伝統こけし', 140.6, 38.75, 'end', -9, 0], ['会津塗', 139.93, 37.49, 'end', -9, 0]];
  F.forEach(([n, lo, la, an, dx, dy]) => { const [x, y] = proj([lo, la]); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="#c0392b" stroke="#fff" stroke-width="1.4"/>` + txt(x + dx, y + dy, n, { size: 12.5, anchor: an, fill: '#8e2a1f' }); });
  K.forEach(([n, lo, la, an, dx, dy]) => { const [x, y] = proj([lo, la]); s += `<rect x="${r1(x - 5.5)}" y="${r1(y - 5.5)}" width="11" height="11" fill="#2563a8" stroke="#fff" stroke-width="1.2"/>` + txt(x + dx, y + dy, n, { size: 12, anchor: an, fill: '#1d3f6b' }); });
  const [px, py] = proj([141.1, 38.99]); s += `<path d="M${r1(px)} ${r1(py - 8)} L${r1(px + 7)} ${r1(py + 5)} L${r1(px - 7)} ${r1(py + 5)} Z" fill="#d9a400" stroke="#fff"/>` + txt(px + 10, py + 2, '平泉（世界遺産）', { size: 12, anchor: 'start', fill: '#7a5c00' });
  s += `<circle cx="22" cy="${h - 52}" r="6" fill="#c0392b"/>` + txt(32, h - 52, '夏祭り', { size: 12, anchor: 'start', noHalo: true }) + `<rect x="16.5" y="${h - 35.5}" width="11" height="11" fill="#2563a8"/>` + txt(32, h - 30, '伝統的工芸品', { size: 12, anchor: 'start', noHalo: true });
  return svg(w, h, s);
}
figs.cultLabel = figCult();
['akita', 'morioka', 'miyako'].forEach(k => { figs['th_' + k] = climGraph(k, NORM[k][0], NORM[k][1]); });
['miyako', 'akita', 'morioka'].forEach((k, i) => { figs['thq_' + k] = climGraph(k, 'ABC'[i], ''); });
fs.writeFileSync('figs20.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

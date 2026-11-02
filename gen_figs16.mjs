// 地理 第16講「中国・四国地方」の図
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
const CS = ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県'];
const CAP = { 鳥取県: ['鳥取市', 134.24, 35.5, [134.0, 35.38]], 島根県: ['松江市', 133.05, 35.47, [132.6, 35.1]], 岡山県: ['岡山市', 133.93, 34.66, [133.8, 34.95]], 広島県: ['広島市', 132.46, 34.4, [132.75, 34.6]], 山口県: ['山口市', 131.47, 34.19, [131.5, 34.32]], 徳島県: ['徳島市', 134.56, 34.07, [134.2, 33.9]], 香川県: ['高松市', 134.05, 34.34, [133.9, 34.22]], 愛媛県: ['松山市', 132.77, 33.84, [132.75, 33.55]], 高知県: ['高知市', 133.53, 33.56, [133.2, 33.3]] };

function csBase(w, h, fill, id) {
  const proj = d3.geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: [[130.8, 32.7], [134.8, 35.75]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; const isC = CS.includes(n); s += `<path d="${ps(path, f)}" fill="${isC ? fill(n) : '#f6f5f1'}" stroke="${isC ? '#666' : '#aaa'}" stroke-width="${isC ? 0.8 : 0.4}"/>`; }
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const CHUGOKU = [[131.4, 34.45], [132.2, 34.75], [132.9, 35.0], [133.6, 35.2], [134.3, 35.25], [134.75, 35.2]];
const SHIKOKU = [[132.6, 33.35], [133.1, 33.65], [133.6, 33.8], [134.1, 33.85], [134.5, 33.85]];
const tri = (x, y) => `<path d="M${r1(x - 8)} ${r1(y + 6)} L${r1(x)} ${r1(y - 7)} L${r1(x + 8)} ${r1(y + 6)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`;

// ---------- 1. 地形と3つの地域 ----------
function figMap(mode) {
  const w = 640, h = 520;
  const { s: base, proj, path, close } = csBase(w, h, () => C.land, 'cm' + mode);
  let s = base;
  s += `<path d="${line(path, CHUGOKU)}" fill="none" stroke="#8a6d5a" stroke-width="2" stroke-dasharray="7 4"/><path d="${line(path, SHIKOKU)}" fill="none" stroke="#8a6d5a" stroke-width="2" stroke-dasharray="7 4"/>`;
  [CHUGOKU[1], CHUGOKU[3], CHUGOKU[4]].forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  [SHIKOKU[1], SHIKOKU[3]].forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  // 吉野川
  s += `<path d="${line(path, [[133.55, 33.85], [133.85, 34.0], [134.15, 34.05], [134.6, 34.1]])}" fill="none" stroke="${C.river}" stroke-width="2.2"/>`;
  // 本州四国連絡橋
  [[[135.0, 34.62], [134.75, 34.35], [134.62, 34.24]], [[133.8, 34.47], [133.82, 34.36], [133.85, 34.3]], [[133.2, 34.4], [133.08, 34.2], [133.0, 34.07]]].forEach(b => { s += `<path d="${line(path, b)}" fill="none" stroke="${C.ink}" stroke-width="3.4" stroke-dasharray="3 2"/>`; });
  s += close;
  // 鳥取砂丘
  const [dx, dy] = proj([134.23, 35.54]); s += `<circle cx="${r1(dx)}" cy="${r1(dy)}" r="5" fill="#e3c97a" stroke="${C.ink}"/>`;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    s += L('山陰', 133.0, 35.55, { size: 20, fill: '#24557a' }) + L('瀬戸内', 132.7, 34.15, { size: 20, fill: '#8a6a10' }) + L('南四国', 133.6, 33.1, { size: 20, fill: '#2f5f45' });
    s += L('中国山地', 133.1, 34.92, { size: 14 }) + L('四国山地', 133.0, 33.5, { size: 14 });
    s += L('瀬戸内海', 133.4, 34.32, { size: 13, fill: '#1f4f7a' }) + L('日本海', 132.0, 35.6, { size: 15, fill: '#1f4f7a' }) + L('太平洋', 134.4, 33.15, { size: 15, fill: '#1f4f7a' });
    s += L('吉野川', 134.2, 34.17, { size: 12, fill: '#1f4f7a' }) + L('鳥取砂丘', 134.25, 35.66, { size: 12 }) + L('讃岐平野', 133.9, 34.2, { size: 11 }) + L('高知平野', 133.6, 33.47, { size: 11 });
    s += L('本州四国連絡橋', 134.95, 34.75, { size: 12, anchor: 'end' });
  } else {
    s += badge(...proj([133.0, 35.55]), 'P', { square: true }) + badge(...proj([132.7, 34.15]), 'Q', { square: true }) + badge(...proj([133.6, 33.1]), 'R', { square: true });
    s += badge(...proj([133.1, 34.95]), 'ア') + badge(...proj([133.0, 33.5]), 'イ') + badge(...proj([133.4, 34.34]), 'ウ') + badge(...proj([134.25, 35.66]), 'エ') + badge(...proj([134.2, 34.18]), 'オ');
  }
  return svg(w, h, s);
}
function figPrefs(mode) {
  const w = 600, h = 470;
  const COLS = { 鳥取県: '#f2d58a', 島根県: '#cfe0bf', 岡山県: '#e9c3a8', 広島県: '#b9cfe3', 山口県: '#d6c9e6', 徳島県: '#f0b7a4', 香川県: '#e3dcc0', 愛媛県: '#c6e0d6', 高知県: '#f2e2a6' };
  const { s: base, proj, close } = csBase(w, h, n => COLS[n], 'cp' + mode);
  let s = base + close;
  CS.forEach((n, i) => { const [x, y] = proj(CAP[n][3]); s += mode === 'label' ? txt(x, y - 8, n, { size: 14 }) + txt(x, y + 9, `（${CAP[n][0]}）`, { size: 11, weight: 400 }) : badge(x, y, i + 1, { r: 13, size: 16 }); });
  s += txt(w - 8, h - 10, '（　）は県庁所在地', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}

// ---------- 2. 雨温図と瀬戸内のしくみ ----------
const NORM = {
  tottori: ['鳥取', '山陰（日本海側）', [4.2, 4.7, 7.8, 12.9, 17.8, 21.6, 25.9, 27.1, 23.2, 17.5, 12.0, 6.9], [202, 154, 144, 102, 123, 147, 201, 116, 227, 145, 153, 218]],
  takamatsu: ['高松', '瀬戸内', [5.9, 6.3, 9.4, 14.7, 19.8, 23.3, 27.5, 28.6, 24.7, 19.0, 13.2, 8.1], [39, 46, 83, 76, 108, 151, 144, 86, 148, 104, 60, 38]],
  kochi: ['高知', '南四国（太平洋側）', [6.7, 8.0, 11.4, 15.8, 19.8, 22.9, 27.0, 27.8, 25.2, 20.3, 14.6, 9.1], [59, 107, 174, 225, 280, 359, 328, 284, 385, 201, 129, 77]],
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
function setouchi(mode) {
  const w = 600, h = 230;
  let s = `<defs><marker id="so${mode}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#2f5f8a"/></marker><marker id="sr${mode}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#b5513c"/></marker></defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<rect x="0" y="180" width="${w}" height="50" fill="${C.sea}"/>`;
  s += `<path d="M60 180 L60 172 L150 150 L190 100 L230 150 L250 172 L250 180 Z" fill="#e2dccb" stroke="${C.ink}"/>`;   // 中国山地
  s += `<path d="M350 180 L350 172 L380 150 L420 100 L460 150 L540 172 L540 180 Z" fill="#e2dccb" stroke="${C.ink}"/>`;  // 四国山地
  s += `<path d="M10 70 Q120 60 182 92" fill="none" stroke="#2f5f8a" stroke-width="3.6" marker-end="url(#so${mode})"/>`;
  s += `<path d="M590 70 Q480 60 428 92" fill="none" stroke="#b5513c" stroke-width="3.6" marker-end="url(#sr${mode})"/>`;
  for (let i = 0; i < 5; i++) s += txt(110 + i * 16, 125, '＊', { size: 11, fill: '#5a7da0', noHalo: true }) + txt(470 + i * 16, 125, '｜', { size: 11, fill: '#5a7da0', noHalo: true });
  if (mode === 'label') {
    s += txt(80, 50, '冬の北西の季節風', { size: 13, fill: '#24557a' }) + txt(520, 50, '夏の南東の季節風', { size: 13, fill: '#8a3a28' });
    s += txt(30, 205, '日本海', { size: 13 }) + txt(150, 205, '山陰（冬に雪）', { size: 12 }) + txt(300, 160, '瀬戸内', { size: 16 }) + txt(300, 205, '瀬戸内海', { size: 12, fill: '#24557a' }) + txt(470, 205, '南四国（夏に雨）', { size: 12 }) + txt(575, 205, '太平洋', { size: 13, anchor: 'end' });
    s += txt(190, 166, '中国山地', { size: 12 }) + txt(430, 166, '四国山地', { size: 12 }) + txt(300, 128, '季節風が山地にさえぎられ', { size: 12 }) + txt(300, 144, '一年中雨が少ない', { size: 12 });
  } else {
    s += badge(150, 205, 'ア') + badge(300, 160, 'イ') + badge(470, 205, 'ウ');
  }
  return svg(w, h, s);
}

// ---------- 3. グラフ ----------
function share(title, rows, note, hi, max = 60) {
  const w = 320, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 96, R = 290;
  let s = txt(w / 2, 14, title, { size: 16, noHalo: true });
  for (let v = 0; v <= max; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${n === hi ? '#b5513c' : '#9db7d0'}"/>` + txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, note, { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
function setoInd(mode) {
  const parts = [['機械', 35, '#e9a98f'], ['化学', 22, '#c9b3dc'], ['金属', 17, '#9dbcdc'], ['食料品', 8, '#a9cf98'], ['せんい', 2, '#f0cf72'], ['その他', 16, '#eeeae0']];
  const w = 540, L = 10, R = 530, y = 38, h = 104;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '瀬戸内工業地域の製造品出荷額の割合', { size: 14, noHalo: true });
  let x = L;
  parts.forEach(([n, v, c], i) => { const ww = v / 100 * (R - L); s += `<rect x="${r1(x)}" y="${y}" width="${r1(ww)}" height="34" fill="${c}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(x + ww / 2, y + 17, ww > 50 ? `${mode === 'q' && i === 1 ? 'X' : n} ${v}%` : `${v}%`, { size: 12, noHalo: true }); x += ww; });
  s += txt(w - 4, h - 6, '2019年。工業統計をもとにしたおおよその割合', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const NOTE = '2023年ごろ。農林水産省の統計をもとにしたおおよその値';
const figs = {
  csMapLabel: figMap('label'), csMapQ: figMap('q'),
  csPrefLabel: figPrefs('label'), csPrefQ: figPrefs('q'),
  setoLabel: setouchi('label'), setoQ: setouchi('q'),
  shareMikan: share('みかんの生産', [['和歌山', 21], ['愛媛', 16], ['静岡', 13], ['熊本', 11], ['長崎', 6]], NOTE, '愛媛', 40),
  shareKaki: share('養殖かきの収獲量', [['広島', 60], ['宮城', 12], ['岡山', 9], ['兵庫', 6], ['岩手', 3]], NOTE, '広島', 80),
  shareMikanQ: share('果物 X の生産', [['和歌山', 21], ['愛媛', 16], ['静岡', 13], ['熊本', 11], ['長崎', 6]], NOTE, '愛媛', 40),
  shareKakiQ: share('養殖 Y の収獲量', [['広島', 60], ['宮城', 12], ['岡山', 9], ['兵庫', 6], ['岩手', 3]], NOTE, '広島', 80),
  setoIndLabel: setoInd('label'), setoIndQ: setoInd('q'),
};
['tottori', 'takamatsu', 'kochi'].forEach(k => { figs['cs_' + k] = climGraph(k, NORM[k][0], NORM[k][1]); });
['kochi', 'tottori', 'takamatsu'].forEach((k, i) => { figs['csq_' + k] = climGraph(k, 'ABC'[i], ''); });
fs.writeFileSync('figs16.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

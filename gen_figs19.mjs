// 地理 第19講「関東地方」の図
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


const KT = ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'];
const CAP = { 茨城県: ['水戸市', [140.25, 36.35]], 栃木県: ['宇都宮市', [139.75, 36.68]], 群馬県: ['前橋市', [138.95, 36.55]], 埼玉県: ['さいたま市', [139.3, 36.03]], 千葉県: ['千葉市', [140.2, 35.5]], 東京都: ['東京', [139.38, 35.72]], 神奈川県: ['横浜市', [139.3, 35.43]] };
const EXT = [[138.45, 34.9], [140.95, 37.15]];
function ktBase(w, h, fill, id) {
  const proj = d3.geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: EXT });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; const isK = KT.includes(n); s += `<path d="${ps(path, f)}" fill="${isK ? fill(n) : '#f6f5f1'}" stroke="${isK ? '#666' : '#aaa'}" stroke-width="${isK ? 0.8 : 0.4}"/>`; }
  const lake = c => `<path d="M${c.map(ll => proj(ll).map(r1).join(' ')).join(' L')} Z" fill="#cfe0ee" stroke="${C.river}" stroke-width="0.8"/>`;
  s += lake([[140.18, 36.13], [140.3, 36.1], [140.42, 36.03], [140.5, 35.97], [140.45, 35.94], [140.35, 35.98], [140.25, 36.0], [140.16, 36.04]]);
  s += lake([[140.53, 36.13], [140.58, 36.08], [140.6, 35.96], [140.57, 35.95], [140.54, 36.05], [140.51, 36.12]]);
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const tri = (x, y) => `<path d="M${r1(x - 7)} ${r1(y + 5)} L${r1(x)} ${r1(y - 6)} L${r1(x + 7)} ${r1(y + 5)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`;
const RIV = {
  tone: [[139.05, 36.85], [139.03, 36.55], [139.1, 36.3], [139.4, 36.2], [139.75, 36.1], [140.0, 35.95], [140.3, 35.88], [140.55, 35.84], [140.85, 35.74]],
  ara: [[138.95, 35.95], [139.2, 36.05], [139.45, 35.98], [139.6, 35.82], [139.82, 35.64]],
  tama: [[138.9, 35.8], [139.25, 35.7], [139.55, 35.6], [139.78, 35.53]],
};
function figMap(mode) {
  const w = 560, h = 540;
  const { s: base, proj, path, close } = ktBase(w, h, () => C.land, 'km' + mode);
  let s = base;
  Object.entries(RIV).forEach(([k, c]) => { s += `<path d="${line(path, c)}" fill="none" stroke="${C.river}" stroke-width="${k === 'tone' ? 2.8 : 1.6}"/>`; });
  [[138.85, 35.95], [138.95, 35.75], [139.1, 35.85], [138.8, 36.1]].forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  [[139.05, 36.95], [139.35, 36.95], [139.2, 37.05]].forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const B = (n, lo, la, sq) => badge(...proj([lo, la]), n, sq ? { square: true } : {});
  const sq = (lo, la) => { const [x, y] = proj([lo, la]); return `<rect x="${r1(x - 5)}" y="${r1(y - 5)}" width="10" height="10" fill="#b5513c"/>`; };
  if (mode === 'label') {
    s += L('関東平野', 139.6, 36.28, { size: 16 }) + L('関東山地', 138.85, 35.65, { size: 12 }) + L('越後山脈', 139.2, 36.83, { size: 12 });
    s += L('利根川', 139.9, 36.06, { size: 13, fill: '#1f4f7a' }) + L('荒川', 139.35, 36.1, { size: 11, fill: '#1f4f7a' }) + L('多摩川', 139.2, 35.62, { size: 11, fill: '#1f4f7a' }) + L('霞ケ浦', 140.25, 36.18, { size: 12, fill: '#1f4f7a', anchor: 'end' });
    s += L('房総半島', 140.15, 35.2, { size: 13 }) + L('三浦半島', 139.71, 35.17, { size: 11, anchor: 'start' }) + L('東京湾', 139.88, 35.45, { size: 12, fill: '#1f4f7a' }) + L('相模湾', 139.3, 35.03, { size: 12, fill: '#1f4f7a' }) + L('太平洋', 140.6, 35.25, { size: 14, fill: '#1f4f7a' }) + L('九十九里浜', 140.55, 35.55, { size: 11, anchor: 'start' });
    s += L('武蔵野台地', 139.5, 35.78, { size: 10.5 }) + L('下総台地', 140.15, 35.72, { size: 10.5 });
    s += sq(140.39, 35.77) + L('成田国際空港', 140.43, 35.8, { size: 10.5, anchor: 'start' }) + sq(139.78, 35.55) + L('東京国際空港（羽田）', 139.83, 35.6, { size: 10.5, anchor: 'start' });
  } else {
    s += B('ア', 139.9, 36.06) + B('イ', 140.25, 36.18) + B('A', 139.6, 36.28, 1) + B('B', 138.85, 35.65, 1) + B('C', 140.15, 35.2, 1) + B('D', 139.64, 35.22, 1) + B('E', 139.88, 35.45, 1) + sq(140.39, 35.77) + B('F', 140.5, 35.85, 1);
  }
  return svg(w, h, s);
}
function figPrefs(mode) {
  const w = 540, h = 520;
  const COLS = { 茨城県: '#cfe0bf', 栃木県: '#f2d58a', 群馬県: '#b9cfe3', 埼玉県: '#e9c3a8', 千葉県: '#d6c9e6', 東京都: '#f0b7a4', 神奈川県: '#c6e0d6' };
  const { s: base, proj, close } = ktBase(w, h, n => COLS[n], 'kp' + mode);
  let s = base + close;
  KT.forEach((n, i) => { const [x, y] = proj(CAP[n][1]); s += mode === 'label' ? txt(x, y - 8, n, { size: 13.5 }) + txt(x, y + 9, `（${CAP[n][0]}）`, { size: 11, weight: 400 }) : badge(x, y, i + 1, { r: 13, size: 16 }); });
  s += txt(w - 8, h - 10, mode === 'label' ? '（　）は都県庁所在地。東京都庁は新宿区にある' : '', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}
const NORM = {
  tokyo: ['東京', '関東の南部', [5.4, 6.1, 9.4, 14.3, 18.8, 21.9, 25.7, 26.9, 23.3, 18.0, 12.5, 7.7], [60, 57, 116, 134, 140, 168, 156, 155, 225, 235, 96, 58]],
  maebashi: ['前橋', '関東の内陸', [3.7, 4.5, 8.0, 13.5, 18.6, 22.0, 25.7, 26.8, 22.9, 17.2, 11.4, 6.3], [30, 27, 58, 75, 99, 147, 202, 196, 204, 142, 44, 24]],
  chichijima: ['父島', '小笠原諸島', [18.6, 18.1, 19.0, 20.7, 22.8, 25.5, 27.4, 27.7, 27.4, 26.0, 23.7, 20.9], [59, 49, 80, 109, 148, 124, 78, 118, 138, 148, 121, 97]],
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
// 昼夜間人口比率
function chuya(mode) {
  const rows = [['東京都', 119], ['神奈川県', 90], ['埼玉県', 88], ['千葉県', 88]];
  const w = 380, L = 92, R = 350, top = 40, rowH = 32, h = top + rows.length * rowH + 40, max = 130, X = v => L + (v - 60) / (max - 60) * (R - L);
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '昼間人口 ÷ 夜間人口 ×100（昼夜間人口比率）', { size: 13, noHalo: true });
  for (let v = 60; v <= 130; v += 10) s += `<line x1="${r1(X(v))}" y1="${top - 4}" x2="${r1(X(v))}" y2="${top + rows.length * rowH}" stroke="${v === 100 ? '#333' : '#e1e5e8'}" stroke-width="${v === 100 ? 1.4 : 0.8}" ${v === 100 ? 'stroke-dasharray="4 3"' : ''}/>` + txt(X(v), top + rows.length * rowH + 11, String(v), { size: 11, weight: 400, noHalo: true });
  rows.forEach(([n, v], i) => { const y = top + i * rowH; const lab = mode === 'q' && i === 0 ? 'X' : n; s += txt(L - 8, y + rowH / 2, lab, { size: 13.5, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${y + 6}" width="${r1(X(v) - L)}" height="${rowH - 12}" fill="${i === 0 ? '#b5513c' : '#9db7d0'}"/>` + txt(X(v) + 5, y + rowH / 2, String(v), { size: 12.5, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, '2020年国勢調査をもとにしたおおよその値。100より大きいと昼の人口が多い', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const NOTE = '2023年ごろ。農林水産省の統計をもとにしたおおよその値';
const ICHIGO = [['栃木', 15], ['福岡', 10], ['熊本', 8], ['愛知', 7], ['長崎', 7]];
const RAKKA = [['千葉', 84], ['茨城', 10], ['その他', 6]];
const CABB = [['群馬', 19], ['愛知', 18], ['千葉', 8], ['茨城', 8], ['長野', 5]];
const figs = {
  ktMapLabel: figMap('label'), ktMapQ: figMap('q'), ktPrefLabel: figPrefs('label'), ktPrefQ: figPrefs('q'),
  ktIndLabel: ind('label'), ktIndQ: ind('q'), chuyaLabel: chuya('label'), chuyaQ: chuya('q'),
  ichigo: share('いちごの生産', ICHIGO, NOTE, '栃木', 40), rakka: share('らっかせいの生産', RAKKA, NOTE, '千葉', 100), cabbage: share('キャベツの生産', CABB, NOTE, '群馬', 40),
  ichigoQ: share('果物 P の生産', ICHIGO, NOTE, '栃木', 40), rakkaQ: share('作物 Q の生産', RAKKA, NOTE, '千葉', 100), cabbageQ: share('野菜 R の生産', CABB, NOTE, '群馬', 40),
};

// 都心・副都心・新都心の地図
function toshin(mode) {
  const w = 460, h = 470;
  const proj = d3.geoMercator().fitExtent([[6, 6], [w - 6, h - 6]], { type: 'MultiPoint', coordinates: [[139.35, 35.38], [140.2, 36.13]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="ts${mode}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#ts${mode})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; s += `<path d="${ps(path, f)}" fill="${n === '東京都' ? '#f4ddd3' : KT.includes(n) ? C.land : '#f6f5f1'}" stroke="#777" stroke-width="0.7"/>`; }
  s += `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>`;
  const pt = (lo, la, r = 5, c = '#b5513c') => { const [x, y] = proj([lo, la]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="${c}" stroke="#fff" stroke-width="1.2"/>`; };
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const [tx, ty] = proj([139.767, 35.681]);
  s += `<circle cx="${r1(tx)}" cy="${r1(ty)}" r="9" fill="#333"/>` + txt(tx + 12, ty + 2, '都心', { size: 12, anchor: 'start' });
  [[139.70, 35.69], [139.70, 35.658], [139.711, 35.73]].forEach(([a, b]) => { s += pt(a, b, 4.5, '#3d6688'); });
  const spots = [['臨海副都心', 139.78, 35.625, 'A'], ['みなとみらい21', 139.632, 35.457, 'B'], ['幕張新都心', 140.05, 35.65, 'C'], ['さいたま新都心', 139.633, 35.894, 'D'], ['筑波研究学園都市', 140.11, 36.08, 'E']];
  spots.forEach(([n, lo, la]) => { s += pt(lo, la, 6); });
  if (mode === 'label') {
    s += L('新宿', 139.66, 35.695, { size: 11, anchor: 'end' }) + L('渋谷', 139.66, 35.655, { size: 11, anchor: 'end' }) + L('池袋', 139.68, 35.75, { size: 11, anchor: 'end' }) + L('副都心', 139.6, 35.71, { size: 11, fill: '#3d6688', anchor: 'end' });
    s += L('臨海副都心', 139.8, 35.6, { size: 12, anchor: 'start' }) + L('みなとみらい21', 139.66, 35.44, { size: 12, anchor: 'start' }) + L('幕張新都心', 140.07, 35.63, { size: 12, anchor: 'start' }) + L('さいたま新都心', 139.66, 35.91, { size: 12, anchor: 'start' }) + L('筑波研究学園都市', 140.09, 36.1, { size: 12, anchor: 'end' });
    s += L('東京湾', 139.92, 35.5, { size: 13, fill: '#1f4f7a' });
  } else {
    spots.forEach(([n, lo, la, b]) => { const [x, y] = proj([lo, la]); s += badge(x + 18, y - 14, b, { square: true, r: 11, size: 14 }); });
    s += L('東京湾', 139.92, 35.5, { size: 13, fill: '#1f4f7a' });
  }
  return svg(w, h, s);
}
figs.toshinLabel = toshin('label'); figs.toshinQ = toshin('q');
['tokyo', 'maebashi', 'chichijima'].forEach(k => { figs['kt_' + k] = climGraph(k, NORM[k][0], NORM[k][1]); });
['chichijima', 'tokyo', 'maebashi'].forEach((k, i) => { figs['ktq_' + k] = climGraph(k, 'ABC'[i], ''); });
fs.writeFileSync('figs19.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

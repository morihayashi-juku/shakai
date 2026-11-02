// 地理 第18講「中部地方」の図
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

const CB = ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'];
const CAP = { 新潟県: ['新潟市', [139.15, 37.45]], 富山県: ['富山市', [137.25, 36.6]], 石川県: ['金沢市', [136.62, 36.45]], 福井県: ['福井市', [136.25, 35.88]], 山梨県: ['甲府市', [138.6, 35.6]], 長野県: ['長野市', [138.05, 36.2]], 岐阜県: ['岐阜市', [137.05, 35.85]], 静岡県: ['静岡市', [138.25, 35.05]], 愛知県: ['名古屋市', [137.25, 35.05]] };
const EXT = [[135.5, 34.45], [139.95, 38.45]];
function cbBase(w, h, fill, id) {
  const proj = d3.geoMercator().fitExtent([[8, 8], [w - 8, h - 8]], { type: 'MultiPoint', coordinates: EXT });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of prefs) { const n = f.properties.nam_ja; const isC = CB.includes(n); s += `<path d="${ps(path, f)}" fill="${isC ? fill(n) : '#f6f5f1'}" stroke="${isC ? '#666' : '#aaa'}" stroke-width="${isC ? 0.8 : 0.4}"/>`; }
  return { s, proj, path, close: `</g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` };
}
const tri = (x, y, k = 1) => `<path d="M${r1(x - 7 * k)} ${r1(y + 5 * k)} L${r1(x)} ${r1(y - 6 * k)} L${r1(x + 7 * k)} ${r1(y + 5 * k)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`;
const RIV = {
  shinano: [[138.25, 36.2], [138.27, 36.65], [138.45, 36.9], [138.7, 37.1], [138.82, 37.32], [138.95, 37.6], [139.05, 37.93]],
  kiso: [[137.72, 35.9], [137.6, 35.65], [137.35, 35.5], [137.05, 35.42], [136.85, 35.33], [136.75, 35.05]],
  nagara: [[136.95, 35.95], [136.88, 35.6], [136.78, 35.38], [136.7, 35.05]],
  ibi: [[136.45, 35.7], [136.6, 35.45], [136.65, 35.25], [136.67, 35.05]],
  tenryu: [[138.08, 36.03], [137.95, 35.7], [137.85, 35.35], [137.8, 35.0], [137.8, 34.68]],
  fuji: [[138.55, 35.75], [138.45, 35.45], [138.5, 35.25], [138.62, 35.12]],
};
const MTS = { hida: [[137.6, 36.85], [137.65, 36.6], [137.6, 36.35], [137.55, 36.1]], kiso: [[137.85, 35.85], [137.82, 35.62]], akaishi: [[138.25, 35.72], [138.15, 35.45], [138.1, 35.2]] };
function figMap(mode) {
  const w = 560, h = 600;
  const { s: base, proj, path, close } = cbBase(w, h, () => C.land, 'cm' + mode);
  let s = base;
  Object.entries(RIV).forEach(([k, c]) => { s += `<path d="${line(path, c)}" fill="none" stroke="${C.river}" stroke-width="${k === 'shinano' || k === 'kiso' ? 2.6 : 1.6}"/>`; });
  const [sx, sy] = proj([138.08, 36.05]); s += `<ellipse cx="${r1(sx)}" cy="${r1(sy)}" rx="6" ry="4" fill="#cfe0ee" stroke="${C.river}"/>`;
  Object.values(MTS).flat().forEach(ll => { const [x, y] = proj(ll); s += tri(x, y); });
  const [fx, fy] = proj([138.73, 35.36]); s += `<path d="M${r1(fx - 11)} ${r1(fy + 8)} L${r1(fx)} ${r1(fy - 10)} L${r1(fx + 11)} ${r1(fy + 8)} Z" fill="#8a6d5a" stroke="#4f3b2e"/><path d="M${r1(fx - 4)} ${r1(fy - 4)} L${r1(fx)} ${r1(fy - 10)} L${r1(fx + 4)} ${r1(fy - 4)} Z" fill="#fff"/>`;
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  const B = (n, lo, la, sq) => badge(...proj([lo, la]), n, sq ? { square: true } : {});
  if (mode === 'label') {
    s += L('飛驒山脈', 137.45, 36.5, { size: 12, anchor: 'end' }) + L('木曽山脈', 137.95, 35.75, { size: 12, anchor: 'start' }) + L('赤石山脈', 138.32, 35.42, { size: 12, anchor: 'start' });
    s += L('日本アルプス', 137.95, 36.45, { size: 13, fill: '#7a3d1e' });
    s += L('富士山', 138.85, 35.42, { size: 12, anchor: 'start' }) + L('信濃川', 138.55, 37.25, { size: 13, fill: '#1f4f7a', anchor: 'end' }) + L('越後平野', 139.2, 37.75, { size: 12, anchor: 'start' });
    s += L('木曽川', 137.35, 35.62, { size: 11, fill: '#1f4f7a' }) + L('濃尾平野', 136.62, 35.2, { size: 12, anchor: 'end' }) + L('天竜川', 137.72, 35.15, { size: 11, fill: '#1f4f7a', anchor: 'end' }) + L('諏訪湖', 138.15, 36.07, { size: 11, fill: '#1f4f7a', anchor: 'start' });
    s += L('甲府盆地', 138.58, 35.68, { size: 11 }) + L('長野盆地', 138.25, 36.72, { size: 11, anchor: 'end' }) + L('能登半島', 136.85, 37.42, { size: 12 }) + L('富山湾', 137.3, 36.95, { size: 12, fill: '#1f4f7a' });
    s += L('伊勢湾', 136.72, 34.82, { size: 12, fill: '#1f4f7a', anchor: 'end' }) + L('渥美半島', 137.2, 34.58, { size: 11 }) + L('駿河湾', 138.58, 34.85, { size: 12, fill: '#1f4f7a' }) + L('佐渡島', 138.4, 38.28, { size: 12 }) + L('若狭湾', 135.85, 35.75, { size: 11, fill: '#1f4f7a' });
  } else {
    s += B('ア', 138.55, 37.25) + B('イ', 137.3, 35.6) + B('ウ', 137.72, 35.15) + B('A', 137.4, 36.5, 1) + B('B', 137.95, 35.85, 1) + B('C', 138.35, 35.4, 1) + B('D', 138.88, 35.5, 1) + B('E', 139.2, 37.75, 1) + B('F', 136.6, 35.18, 1) + B('G', 136.85, 37.42, 1);
  }
  return svg(w, h, s);
}
function figPrefs(mode) {
  const w = 540, h = 580;
  const COLS = { 新潟県: '#cfe0bf', 富山県: '#b9cfe3', 石川県: '#f2d58a', 福井県: '#e9c3a8', 山梨県: '#d6c9e6', 長野県: '#c6e0d6', 岐阜県: '#f0d0b8', 静岡県: '#f0b7a4', 愛知県: '#e8e09a' };
  const { s: base, proj, close } = cbBase(w, h, n => COLS[n], 'cp' + mode);
  let s = base + close;
  CB.forEach((n, i) => { const [x, y] = proj(CAP[n][1]); s += mode === 'label' ? txt(x, y - 8, n, { size: 13.5 }) + txt(x, y + 9, `（${CAP[n][0]}）`, { size: 11, weight: 400 }) : badge(x, y, i + 1, { r: 13, size: 16 }); });
  if (mode === 'label') { const R = (n, lo, la) => { const [x, y] = proj([lo, la]); return txt(x, y, n, { size: 15, fill: '#7a3d1e' }); }; s += R('北陸', 136.0, 36.75) + R('中央高地', 138.4, 36.62) + R('東海', 137.6, 34.62); }
  s += txt(w - 8, h - 10, '（　）は県庁所在地', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h, s);
}
const NORM = {
  kanazawa: ['金沢', '北陸', [4.0, 4.4, 7.4, 12.4, 17.6, 21.6, 25.8, 27.3, 23.6, 18.0, 12.3, 6.9], [256, 163, 157, 144, 139, 170, 233, 179, 232, 177, 251, 301]],
  matsumoto: ['松本', '中央高地', [-0.4, 0.4, 4.3, 10.4, 15.9, 19.7, 23.6, 24.7, 20.6, 14.0, 7.9, 2.4], [36, 44, 80, 75, 100, 126, 138, 92, 156, 102, 55, 40]],
  shizuoka: ['静岡', '東海', [6.9, 7.6, 10.6, 15.0, 19.0, 22.1, 25.8, 27.1, 24.6, 19.7, 14.6, 9.4], [80, 105, 207, 215, 208, 280, 298, 212, 271, 238, 133, 82]],
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
function ind(mode) {
  const rows = mode === 'q' ? [['X', P(8, 52, 11, 14, 15)], ['Y', P(9, 69, 7, 5, 10)], ['Z', P(17, 39, 17, 10, 17)]] : [['中京', P(9, 69, 7, 5, 10)], ['東海', P(8, 52, 11, 14, 15)], ['北陸', P(17, 39, 17, 10, 17)]];
  return bandRows(mode === 'q' ? '中部地方の工業地帯・地域の製造品出荷額の割合' : '中京工業地帯・東海工業地域・北陸工業地域の製造品出荷額の割合', rows, '2019年。工業統計をもとにしたおおよその割合', 'label');
}
function share(title, rows, note, hi, max = 60) {
  const w = 320, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 96, R = 290;
  let s = txt(w / 2, 14, title, { size: 16, noHalo: true });
  for (let v = 0; v <= max; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${n === hi ? '#b5513c' : '#9db7d0'}"/>` + txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, note, { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const NOTE = '2023年ごろ。農林水産省の統計をもとにしたおおよその値';
const NOTE24 = '2024年。農林水産省の統計をもとにしたおおよその値';
const BUDOU = [['山梨', 24], ['長野', 18], ['岡山', 9], ['山形', 9], ['福岡', 4]];
const MOMO = [['山梨', 32], ['福島', 22], ['長野', 10], ['山形', 8], ['和歌山', 7]];
const LETT = [['長野', 33], ['茨城', 16], ['群馬', 9], ['長崎', 6], ['兵庫', 5]];
const CHA = [['鹿児島', 40], ['静岡', 39], ['三重', 8], ['宮崎', 4], ['京都', 3]];
// 輪中の断面図
function waju(mode) {
  const w = 560, h = 230, g = 168;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  s += `<path d="M0 ${g - 30} L70 ${g - 30} L70 ${h} L0 ${h} Z" fill="#cfe0ee"/><path d="M490 ${g - 30} L560 ${g - 30} L560 ${h} L490 ${h} Z" fill="#cfe0ee"/>`;
  s += `<path d="M60 ${h} L60 ${g - 30} L80 ${g - 62} L102 ${g - 62} L132 ${g} L428 ${g} L458 ${g - 62} L480 ${g - 62} L500 ${g - 30} L500 ${h} Z" fill="#d9cdb6" stroke="#6b5a45" stroke-width="1.2"/>`;
  s += `<rect x="132" y="${g}" width="296" height="${h - g}" fill="#c8b99c"/>`;
  for (let x = 150; x < 260; x += 16) s += `<path d="M${x} ${g} l0 -10 M${x - 4} ${g - 6} l4 -4 l4 4" stroke="#5a8a3a" stroke-width="1.4" fill="none"/>`;
  s += `<path d="M300 ${g} L310 ${g - 26} L390 ${g - 26} L400 ${g} Z" fill="#d9cdb6" stroke="#6b5a45"/>`;
  s += `<rect x="318" y="${g - 52}" width="28" height="26" fill="#f6efe2" stroke="#444"/><path d="M314 ${g - 52} L332 ${g - 66} L350 ${g - 52} Z" fill="#8c5a3c" stroke="#444"/>`;
  s += `<path d="M360 ${g - 26} L360 ${g - 46} L388 ${g - 46} L388 ${g - 26}" fill="none" stroke="#6b5a45" stroke-width="1"/><rect x="358" y="${g - 74}" width="32" height="28" fill="#f6efe2" stroke="#444"/><path d="M354 ${g - 74} L374 ${g - 90} L394 ${g - 74} Z" fill="#8c5a3c" stroke="#444"/>`;
  s += `<line x1="0" y1="${g - 30}" x2="70" y2="${g - 30}" stroke="${C.river}" stroke-width="1.6"/><line x1="490" y1="${g - 30}" x2="560" y2="${g - 30}" stroke="${C.river}" stroke-width="1.6"/>`;
  if (mode === 'label') {
    s += txt(34, g - 4, '川', { size: 13, fill: '#1f4f7a' }) + txt(526, g - 4, '川', { size: 13, fill: '#1f4f7a' }) + txt(91, g - 74, '堤防', { size: 13 }) + txt(469, g - 74, '堤防', { size: 13 });
    s += txt(205, g - 22, '水田', { size: 12 }) + txt(332, g - 76, '家', { size: 12 }) + txt(410, g - 100, '水屋（ひなん用の建物）', { size: 12, anchor: 'start' });
    s += txt(280, 16, '輪中のしくみ（断面図）', { size: 14, noHalo: true }) + txt(280, h - 10, '川面より低い土地を、まわりを堤防で囲んで守る', { size: 11, weight: 400 });
  } else {
    s += txt(34, g - 4, '川', { size: 13, fill: '#1f4f7a' }) + txt(526, g - 4, '川', { size: 13, fill: '#1f4f7a' }) + badge(91, g - 80, 'A', { square: true }) + badge(410, g - 96, 'B', { square: true });
    s += txt(280, 16, '濃尾平野の南部に見られるしくみ（断面図）', { size: 14, noHalo: true });
  }
  return svg(w, h, s);
}
const figs = {
  cbMapLabel: figMap('label'), cbMapQ: figMap('q'), cbPrefLabel: figPrefs('label'), cbPrefQ: figPrefs('q'),
  cbIndLabel: ind('label'), cbIndQ: ind('q'), wajuLabel: waju('label'), wajuQ: waju('q'),
  budou: share('ぶどうの生産', BUDOU, NOTE, '山梨', 40), momo: share('ももの生産', MOMO, NOTE, '山梨', 40),
  lettuce: share('レタスの生産', LETT, NOTE, '長野', 40), cha: share('茶（荒茶）の生産', CHA, NOTE24, '静岡', 60),
  budouQ: share('果物 P の生産', BUDOU, NOTE, '山梨', 40), lettuceQ: share('野菜 Q の生産', LETT, NOTE, '長野', 40), chaQ: share('作物 R の生産', CHA, NOTE24, '静岡', 60),
};
['kanazawa', 'matsumoto', 'shizuoka'].forEach(k => { figs['cb_' + k] = climGraph(k, NORM[k][0], NORM[k][1]); });
['matsumoto', 'shizuoka', 'kanazawa'].forEach((k, i) => { figs['cbq_' + k] = climGraph(k, 'ABC'[i], ''); });
fs.writeFileSync('figs18.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

// 地理 第13講「日本の資源・エネルギーと産業」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import fs from 'fs';
let jt = JSON.parse(fs.readFileSync('data/japan.topojson'));
jt = tsimp.presimplify(jt); jt = tsimp.simplify(jt, tsimp.quantile(jt, 0.25));
const prefs = topojson.feature(jt, jt.objects.japan).features;

const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 13;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 16}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;

function jpMap(w, h, fill = () => '#f3f0e8', ext) {
  const mains = prefs.map(f => ({ ...f, geometry: { type: 'MultiPolygon', coordinates: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).filter(pp => { const c = d3.geoCentroid({ type: 'Polygon', coordinates: pp }); return c[1] > 30.5 && c[0] < 149.5; }) } }));
  const proj = d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], ext ? { type: 'MultiPoint', coordinates: ext } : { type: 'FeatureCollection', features: mains.filter(f => f.geometry.coordinates.length) });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="jc${w}${h}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#jc${w}${h})">`;
  mains.forEach(f => { s += `<path d="${ps(path, f)}" fill="${fill(f)}" stroke="#999" stroke-width="0.45"/>`; });
  s += '</g>';
  return { s, proj, path };
}

// 帯グラフ（横）
function bands(title, rows, note, opt = {}) {
  const w = opt.w || 560, L = opt.L || 96, R = w - 10, rowH = 40, top = 36, h = top + rows.length * rowH + 22;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, title, { size: 15, noHalo: true });
  rows.forEach(([lab, parts], i) => {
    const y = top + i * rowH; let x = L;
    s += txt(L - 8, y + 15, lab, { size: 13, anchor: 'end', noHalo: true });
    parts.forEach(([n, v, col, dark]) => {
      const ww = v / 100 * (R - L);
      s += `<rect x="${r1(x)}" y="${y}" width="${r1(ww)}" height="30" fill="${col}" stroke="${C.ink}" stroke-width="0.6"/>`;
      if (ww > 34) s += txt(x + ww / 2, y + 15, ww > 80 ? `${n} ${v}%` : `${v}%`, { size: ww > 80 ? 12 : 11, fill: dark ? '#fff' : C.ink, noHalo: true });
      x += ww;
    });
  });
  if (opt.legend) { let lx = L; opt.legend.forEach(([n, col]) => { s += `<rect x="${lx}" y="${h - 18}" width="12" height="10" fill="${col}" stroke="${C.ink}" stroke-width="0.5"/>` + txt(lx + 16, h - 13, n, { size: 11, anchor: 'start', noHalo: true }); lx += 18 + n.length * 12 + 12; }); }
  s += txt(w - 4, h - 4 + (opt.legend ? 16 : 0), note, { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h + (opt.legend ? 18 : 0), s);
}

// ---------- 1. 資源の輸入先 ----------
const G = ['#3c6e9a', '#7da7c9', '#b7cde3', '#e6e1d6'];
const IMP = [
  ['原油', [['サウジアラビア', 40], ['アラブ首長国連邦', 42], ['クウェート', 8], ['その他', 10]]],
  ['石炭', [['オーストラリア', 66], ['インドネシア', 13], ['ロシア', 6], ['その他', 15]]],
  ['鉄鉱石', [['オーストラリア', 62], ['ブラジル', 26], ['カナダ', 6], ['その他', 6]]],
  ['液化天然ガス', [['オーストラリア', 42], ['マレーシア', 16], ['ロシア', 9], ['その他', 33]]],
];
function importsFig(mode) {
  const rows = IMP.map(([n, parts], i) => [mode === 'label' ? n : 'アイウエ'[i], parts.map(([c, v], j) => [mode === 'label' || j > 0 ? c : (i === 0 ? c : c), v, G[j], j === 0])]);
  return bands(mode === 'label' ? '日本の主な資源の輸入先' : '日本の主な資源（ア〜エ）の輸入先', rows.map(([lab, parts]) => [lab, parts.map(([c, v, col, d]) => [c.length > 6 ? c.replace('アラブ首長国連邦', 'UAE') : c, v, col, d])]), '2023年ごろ。財務省「貿易統計」をもとにしたおおよその割合');
}
function selfSuff() {
  const rows = [['米', 99], ['野菜', 79], ['肉類', 53], ['果実', 38], ['小麦', 15], ['大豆', 7]];
  const w = 360, L = 60, R = 330, rowH = 30, top = 40, h = top + rows.length * rowH + 40;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '日本の主な食料の自給率', { size: 15, noHalo: true });
  for (let v = 0; v <= 100; v += 25) { const x = L + v / 100 * (R - L); s += `<line x1="${r1(x)}" y1="${top - 4}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#e1e5e8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${y + 5}" width="${r1(v / 100 * (R - L))}" height="${rowH - 10}" fill="${v > 50 ? '#3c7a5a' : '#b5513c'}"/>` + txt(L + v / 100 * (R - L) + 4, y + rowH / 2, v + '%', { size: 12, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, '2022年度。農林水産省の資料をもとにしたおおよその値（重量ベース）', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

// ---------- 2. 発電量の割合 ----------
const EC = { hy: ['水力', '#7da7c9'], th: ['火力', '#e9a98f'], nu: ['原子力', '#c9b3dc'], re: ['再生可能エネルギー（水力をのぞく）', '#a9cf98'] };
function powerFig(mode) {
  const D = [['1980年', [16, 69, 15, 0]], ['2010年', [8, 62, 29, 1]], ['2022年', [8, 73, 6, 13]]];
  const keys = ['hy', 'th', 'nu', 're'];
  const rows = D.map(([y, vs]) => [y, vs.map((v, i) => [mode === 'label' ? EC[keys[i]][0].replace('再生可能エネルギー（水力をのぞく）', '再エネ') : 'ABCD'[i], v, EC[keys[i]][1], false]).filter(p => p[1] > 0)]);
  const legend = keys.map((k, i) => [mode === 'label' ? EC[k][0] : 'ABCD'[i], EC[k][1]]);
  return bands('日本の発電量の割合の変化', rows, '資源エネルギー庁などの資料をもとにしたおおよその割合', { legend, L: 70 });
}
// ---------- 3. 発電所の分布（例） ----------
const PLANTS = {
  hy: [[137.66, 36.57], [139.25, 37.32], [137.6, 35.9], [140.0, 38.95], [133.95, 33.85], [138.05, 35.6]],
  th: [[139.8, 35.55], [140.05, 35.5], [139.7, 35.42], [136.85, 35.0], [136.9, 34.85], [135.4, 34.6], [135.25, 34.48], [130.85, 33.95], [132.5, 34.35], [140.95, 38.25], [141.5, 42.9]],
  nu: [[135.95, 35.7], [135.65, 35.55], [138.6, 37.42], [138.15, 34.62], [129.84, 33.52], [130.18, 31.83], [132.31, 33.49], [141.5, 38.4], [140.6, 36.45]],
};
function plantsFig(mode) {
  const w = 600, h = 600;
  const { s: base, proj } = jpMap(w, h);
  let s = base;
  const mk = (t, x, y) => t === 'hy' ? `<path d="M${r1(x)} ${r1(y - 8)} L${r1(x + 7)} ${r1(y + 6)} L${r1(x - 7)} ${r1(y + 6)} Z" fill="#3c6e9a" stroke="#fff"/>` : t === 'th' ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="6.5" fill="#b5513c" stroke="#fff"/>` : `<rect x="${r1(x - 6)}" y="${r1(y - 6)}" width="12" height="12" fill="#6b4c9a" stroke="#fff"/>`;
  Object.entries(PLANTS).forEach(([t, pts]) => pts.forEach(ll => { const [x, y] = proj(ll); s += mk(t, x, y); }));
  const lx = w - 260, ly = h - 100;
  s += `<rect x="${lx - 10}" y="${ly - 14}" width="260" height="96" fill="#fff" stroke="#999" rx="3"/>`;
  const L = mode === 'label' ? [['hy', '水力発電所（山地のダム）'], ['th', '火力発電所（大都市に近い海ぞい）'], ['nu', '原子力発電所（人口の少ない海ぞい）']] : [['hy', 'X'], ['th', 'Y'], ['nu', 'Z']];
  L.forEach(([t, n], i) => { s += mk(t, lx + 6, ly + 4 + i * 26) + txt(lx + 22, ly + 4 + i * 26, n, { size: 13, anchor: 'start', noHalo: true }); });
  s += txt(12, h - 12, '主な発電所の位置の例（おおまかな図）', { size: 11, weight: 400, anchor: 'start' });
  return svg(w, h, s);
}

// ---------- 4. 太平洋ベルトと工業地帯 ----------
const AREAS = [ // [名前, 経度, 緯度, ラベルのずれ, 種類(地帯/地域), 問題の記号]
  ['京浜工業地帯', 139.7, 35.5, [-4, 34, 'middle'], 1, 'ア'], ['中京工業地帯', 136.9, 35.05, [-6, 34, 'middle'], 1, 'イ'], ['阪神工業地帯', 135.35, 34.62, [-14, 30, 'end'], 1, 'ウ'], ['北九州工業地帯（地域）', 130.85, 33.88, [-6, -26, 'middle'], 1, 'エ'],
  ['京葉工業地域', 140.15, 35.55, [6, -22, 'middle'], 0, 'オ'], ['東海工業地域', 138.3, 34.85, [12, 28, 'start'], 0, 'カ'], ['瀬戸内工業地域', 133.3, 34.45, [-6, 32, 'middle'], 0, 'キ'], ['北関東工業地域', 139.4, 36.4, [-12, -14, 'end'], 0, 'ク'], ['北陸工業地域', 137.0, 36.75, [-16, -18, 'end'], 0, 'ケ'],
];
function beltFig(mode) {
  const w = 620, h = 460;
  const { s: base, proj, path } = jpMap(w, h, () => '#f3f0e8', [[129.3, 32.5], [141.6, 38.2]]);
  let s = base;
  const belt = [[141.2, 36.1], [140.2, 35.2], [138.8, 34.6], [136.9, 34.4], [135.3, 34.2], [133.5, 34.05], [131.5, 33.65], [130.2, 33.2], [129.9, 33.7], [131.0, 34.15], [133.2, 34.7], [135.3, 34.9], [136.9, 35.4], [138.6, 35.25], [139.6, 36.1], [140.7, 36.6], [141.2, 36.1]];
  let bp = { type: 'Polygon', coordinates: [belt] }; if (d3.geoArea(bp) > 2 * Math.PI) bp = { type: 'Polygon', coordinates: [belt.slice().reverse()] };
  s += `<path d="${ps(path, bp)}" fill="#f0cf72" fill-opacity="0.45" stroke="none"/>`;
  s += `<g clip-path="url(#jc${w}${h})">` + prefs.map(f => `<path d="${ps(path, f)}" fill="none" stroke="#999" stroke-width="0.45"/>`).join('') + '</g>';
  s += `<path d="${ps(path, bp)}" fill="none" stroke="#c99a1c" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  AREAS.forEach(([n, lo, la, [dx, dy, an], big, q]) => {
    const [x, y] = proj([lo, la]);
    s += big ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="11" fill="#b5513c" stroke="#fff" stroke-width="1.5"/>` : `<circle cx="${r1(x)}" cy="${r1(y)}" r="8" fill="#fff" stroke="#b5513c" stroke-width="3"/>`;
    s += mode === 'label' ? txt(x + dx, y + dy, n, { size: 13, anchor: an }) : badge(x + dx * 0.9 + (an === 'start' ? 12 : an === 'end' ? -12 : 0), y + dy * 0.8, q, { r: 12, size: 14 });
  });
  if (mode === 'label') { const [x, y] = proj([135.6, 33.3]); s += txt(x, y, '太平洋ベルト', { size: 18, fill: '#8a6a10' }); }
  else { const [x, y] = proj([135.6, 33.3]); s += badge(x, y, 'P', { square: true }); }
  const lx = 14, ly = 16;
  s += `<rect x="${lx - 6}" y="${ly - 10}" width="${mode === 'label' ? 160 : 120}" height="52" fill="#fff" stroke="#999" rx="3"/><circle cx="${lx + 6}" cy="${ly + 4}" r="8" fill="#b5513c"/>` + txt(lx + 20, ly + 4, mode === 'label' ? '工業地帯' : '大きい丸', { size: 12, anchor: 'start', noHalo: true }) + `<circle cx="${lx + 6}" cy="${ly + 26}" r="6" fill="#fff" stroke="#b5513c" stroke-width="3"/>` + txt(lx + 20, ly + 26, mode === 'label' ? '工業地域' : '小さい丸', { size: 12, anchor: 'start', noHalo: true });
  return svg(w, h, s);
}
function shipFig(mode) {
  const D = [['中京', 59], ['阪神', 34], ['瀬戸内', 31], ['北関東', 31], ['京浜', 24], ['東海', 17], ['北陸', 14], ['京葉', 13], ['北九州', 10]];
  const w = 360, L = 64, R = 320, rowH = 25, top = 38, h = top + D.length * rowH + 34;
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '主な工業地帯・地域の製造品出荷額', { size: 14, noHalo: true });
  for (let v = 0; v <= 60; v += 20) { const x = L + v / 60 * (R - L); s += `<line x1="${r1(x)}" y1="${top - 4}" x2="${r1(x)}" y2="${top + D.length * rowH}" stroke="#e1e5e8"/>` + txt(x, top + D.length * rowH + 11, v, { size: 11, weight: 400, noHalo: true }); }
  s += txt(R + 4, top + D.length * rowH + 11, '兆円', { size: 10, weight: 400, anchor: 'start', noHalo: true });
  D.forEach(([n, v], i) => { const y = top + i * rowH; s += txt(L - 6, y + rowH / 2, mode === 'label' || i > 0 ? n : 'Q', { size: 13, anchor: 'end', noHalo: true }) + `<rect x="${L}" y="${y + 4}" width="${r1(v / 60 * (R - L))}" height="${rowH - 8}" fill="${i === 0 ? '#b5513c' : '#9db7d0'}"/>` + txt(L + v / 60 * (R - L) + 4, y + rowH / 2, `約${v}`, { size: 11, anchor: 'start', noHalo: true }); });
  s += txt(w - 4, h - 6, '2019年。経済産業省「工業統計」をもとにしたおおよその値', { size: 9.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}

// ---------- 5. 産業別人口・漁業 ----------
function industryPop(mode) {
  const P = (a, b, c) => [[mode === 'label' ? '第一次' : 'X', a, '#a9cf98', false], [mode === 'label' ? '第二次' : 'Y', b, '#9dbcdc', false], [mode === 'label' ? '第三次' : 'Z', c, '#f0cf72', false]];
  return bands('日本の産業別人口の割合', [['1950年', P(48, 22, 30)], ['1980年', P(11, 34, 55)], ['2020年', P(3, 23, 74)]], '国勢調査をもとにしたおおよその割合');
}
const FISH = { 遠洋: [[1960, 90], [1970, 340], [1973, 400], [1980, 220], [1990, 150], [2000, 85], [2010, 48], [2020, 30]], 沖合: [[1960, 190], [1970, 330], [1980, 570], [1984, 700], [1990, 600], [2000, 260], [2010, 236], [2020, 200]], 沿岸: [[1960, 190], [1970, 190], [1980, 200], [1990, 200], [2000, 160], [2010, 130], [2020, 90]], 養殖: [[1960, 30], [1970, 55], [1980, 90], [1990, 130], [2000, 120], [2010, 110], [2020, 95]] };
const FC = { 遠洋: '#b5513c', 沖合: '#3c6e9a', 沿岸: '#3c7a5a', 養殖: '#c99a1c' };
function fishFig(mode) {
  const w = 520, h = 270, L = 50, R = 420, T = 34, B = 236;
  const X = y => L + (y - 1960) / 60 * (R - L), Y = v => B - v / 800 * (B - T);
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 14, '日本の漁業別の生産量の移り変わり', { size: 15, noHalo: true });
  for (let v = 0; v <= 800; v += 200) s += `<line x1="${L}" y1="${r1(Y(v))}" x2="${R}" y2="${r1(Y(v))}" stroke="#e1e5e8"/>` + txt(L - 6, Y(v), v, { size: 11, weight: 400, anchor: 'end', noHalo: true });
  s += txt(L - 6, T - 14, '万t', { size: 11, weight: 400, anchor: 'end', noHalo: true });
  for (let y = 1960; y <= 2020; y += 10) s += txt(X(y), B + 12, y, { size: 11, weight: 400, noHalo: true });
  const keys = ['遠洋', '沖合', '沿岸', '養殖'];
  keys.forEach((k, i) => {
    const d = FISH[k];
    s += `<polyline points="${d.map(([y, v]) => `${r1(X(y))},${r1(Y(v))}`).join(' ')}" fill="none" stroke="${FC[k]}" stroke-width="2.6" ${i % 2 ? 'stroke-dasharray="6 3"' : ''}/>`;
    const P = { 遠洋: [1976, 400, 'start'], 沖合: [1987, 700, 'start'], 沿岸: [1962, 215, 'start'], 養殖: [2004, 140, 'start'] }[k];
    const n = mode === 'label' ? (k === '養殖' ? '養殖業' : k + '漁業') : 'アイウエ'[i];
    s += txt(X(P[0]) + 4, Y(P[1]) - 4, n, { size: 13, anchor: P[2], fill: FC[k] });
  });
  s += txt(w - 4, h - 4, '農林水産省の資料をもとにしたおおよその値', { size: 10, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
// ---------- 6. 加工貿易 ----------
function kakoFig() {
  const w = 600, h = 130;
  let s = `<defs><marker id="kk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${C.ink}"/></marker></defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  const box = (x, a, b, col) => `<rect x="${x}" y="30" width="160" height="70" rx="6" fill="${col}" stroke="${C.ink}"/>` + txt(x + 80, 52, a, { size: 15, noHalo: true }) + txt(x + 80, 78, b, { size: 12, weight: 400, noHalo: true });
  s += box(10, '原料・燃料を輸入', '原油・鉄鉱石・石炭など', '#eef4f8') + box(220, '日本の工場で加工', '技術を生かして製品に', '#f5f2ea') + box(430, '工業製品を輸出', '自動車・機械・鉄鋼など', '#fbeee8');
  s += `<line x1="172" y1="65" x2="216" y2="65" stroke="${C.ink}" stroke-width="2.4" marker-end="url(#kk)"/><line x1="382" y1="65" x2="426" y2="65" stroke="${C.ink}" stroke-width="2.4" marker-end="url(#kk)"/>`;
  s += txt(w / 2, 14, '加工貿易のしくみ', { size: 15, noHalo: true });
  return svg(w, h, s);
}

const figs = {
  importsLabel: importsFig('label'), importsQ: importsFig('q'),
  selfSuff: selfSuff(),
  powerLabel: powerFig('label'), powerQ: powerFig('q'),
  plantsLabel: plantsFig('label'), plantsQ: plantsFig('q'),
  beltLabel: beltFig('label'), beltQ: beltFig('q'),
  shipLabel: shipFig('label'), shipQ: shipFig('q'),
  indPopLabel: industryPop('label'), indPopQ: industryPop('q'),
  fishLabel: fishFig('label'), fishQ: fishFig('q'),
  kako: kakoFig(),
};
fs.writeFileSync('figs13.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

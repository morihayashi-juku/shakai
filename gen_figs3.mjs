// 地理 第3講「世界各地の人々の生活と環境」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const t110 = require('world-atlas/countries-110m.json');
const land = topojson.feature(t110, t110.objects.land);
const countries = topojson.feature(t110, t110.objects.countries).features;
const wc = require('world-countries');
const iso3 = {}; wc.forEach(c => { iso3[c.ccn3] = c.cca3; });

const C = { sea: '#eef4f8', land: '#e2ddd0', line: '#555', grat: '#9fb3c2', ink: '#1d2a33' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 11;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 14}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;

// ---------- 1. 世界の気候帯 ----------
const ZONES = [
  ['熱帯', '#2f7d4f'], ['乾燥帯', '#f4dc8a'], ['温帯', '#e7a77a'],
  ['冷帯（亜寒帯）', '#7f8fc4'], ['寒帯', '#d6e2ec'], ['高山気候', 'stripe'],
];
// 雨温図の都市（番号は講座2の雨温図と同じ）
const CITIES = [
  ['シンガポール', 103.8, 1.35], ['カイロ', 31.2, 30.0], ['ローマ', 12.5, 41.9], ['東京', 139.7, 35.7],
  ['パリ', 2.35, 48.85], ['イルクーツク', 104.3, 52.3], ['ウトキアグヴィク', -156.8, 71.3], ['ラパス', -68.15, -16.5],
];
const png = fs.readFileSync('data/climate.png').toString('base64');
function figClimate(mode) {
  const w = 800, LT = 84, LB = -58, h = w * (LT - LB) / 360, legH = 44;
  const proj = d3.geoEquirectangular().rotate([-150, 0]).scale(w / (2 * Math.PI)).translate([w / 2, h * LT / (LT - LB)]);
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="cm${mode}"><rect width="${w}" height="${r1(h)}"/></clipPath>
    <pattern id="hs${mode}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#ece2d6"/><rect width="3" height="6" fill="#6e5442"/></pattern></defs>`;
  s += `<rect width="${w}" height="${r1(h)}" fill="${C.sea}"/>`;
  s += `<image href="data:image/png;base64,${png}" x="0" y="0" width="${w}" height="${r1(h)}" preserveAspectRatio="none" style="image-rendering:pixelated"/>`;
  s += `<g clip-path="url(#cm${mode})"><path d="${ps(path, land)}" fill="none" stroke="#333" stroke-width="0.7"/>`;
  const eq = { type: 'LineString', coordinates: Array.from({ length: 181 }, (_, i) => [-180 + i * 2, 0]) };
  s += `<path d="${ps(path, eq)}" fill="none" stroke="${C.ink}" stroke-width="1" stroke-dasharray="6 4"/></g>`;
  s += `<rect width="${w}" height="${r1(h)}" fill="none" stroke="${C.line}"/>`;
  const [ex, ey] = proj([-100, 0]); s += txt(ex, ey - 9, '赤道', { size: 13 });
  // 都市
  CITIES.forEach(([n, lo, la], i) => {
    const [x, y] = proj([lo, la]);
    s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="3.6" fill="#fff" stroke="${C.ink}" stroke-width="1.6"/>`;
    if (mode === 'label') {
      const off = [[0, 14], [-2, -13], [-6, -12], [16, 6], [-4, -12], [0, -13], [0, 13], [-14, 6]][i];
      s += txt(x + off[0], y + off[1], '①②③④⑤⑥⑦⑧'[i], { size: 15 });
    }
  });
  // 凡例
  const ly = h + 14, bw = w / 6;
  ZONES.forEach(([n, col], i) => {
    const x = i * bw + 6;
    const fill = col === 'stripe' ? `url(#hs${mode})` : col;
    s += `<rect x="${r1(x)}" y="${r1(ly)}" width="26" height="18" fill="${fill}" stroke="${C.ink}" stroke-width="0.8"/>`;
    s += txt(x + 32, ly + 9.5, mode === 'label' ? n : 'ABCDEF'[i], { size: mode === 'label' ? 14 : 16, anchor: 'start', noHalo: true });
  });
  return svg(w, r1(h + legH), s);
}

// ---------- 2. 雨温図 ----------
// 月平均気温（℃）と月降水量（mm）。各地の平年値をもとにした概略値
const GRAPHS = {
  singapore: ['シンガポール', '熱帯（熱帯雨林気候）', [26.6, 27.1, 27.6, 28.0, 28.3, 28.3, 27.9, 27.9, 27.6, 27.6, 27.0, 26.5], [243, 159, 186, 179, 172, 162, 159, 176, 170, 194, 256, 288]],
  cairo: ['カイロ', '乾燥帯（砂漠気候）', [14.0, 15.3, 17.6, 21.4, 24.7, 27.2, 28.0, 28.0, 26.3, 23.5, 19.1, 15.4], [5, 4, 4, 1, 0, 0, 0, 0, 0, 1, 3, 6]],
  rome: ['ローマ', '温帯（地中海性気候）', [7.5, 8.4, 10.9, 13.7, 18.0, 22.0, 24.8, 24.9, 21.4, 17.4, 12.4, 8.6], [69, 76, 59, 62, 48, 30, 16, 26, 67, 102, 107, 82]],
  tokyo: ['東京', '温帯（温暖湿潤気候）', [5.4, 6.1, 9.4, 14.3, 18.8, 21.9, 25.7, 26.9, 23.3, 18.0, 12.5, 7.7], [60, 57, 116, 134, 140, 168, 156, 155, 225, 235, 96, 58]],
  paris: ['パリ', '温帯（西岸海洋性気候）', [5.0, 5.6, 8.8, 11.5, 15.2, 18.3, 20.5, 20.3, 16.9, 13.0, 8.3, 5.5], [47, 41, 50, 52, 63, 50, 62, 53, 48, 62, 51, 58]],
  irkutsk: ['イルクーツク', '冷帯（亜寒帯）', [-17.8, -15.2, -6.9, 2.2, 9.4, 15.4, 18.3, 16.2, 9.6, 1.8, -8.0, -15.4], [12, 8, 10, 16, 34, 69, 105, 93, 52, 21, 15, 15]],
  barrow: ['ウトキアグヴィク', '寒帯（ツンドラ気候）', [-25.4, -26.9, -25.6, -17.7, -6.4, 1.9, 4.7, 3.6, -0.4, -8.8, -17.3, -23.6], [4, 4, 3, 4, 4, 9, 24, 25, 18, 11, 6, 4]],
  lapaz: ['ラパス', '高山気候', [8.6, 8.6, 8.5, 8.1, 6.8, 5.3, 4.9, 5.9, 7.1, 8.3, 8.9, 8.8], [130, 105, 73, 33, 11, 5, 7, 13, 30, 38, 51, 93]],
};
function climGraph(key, title, sub) {
  const [, , T, P] = GRAPHS[key];
  const w = 236, h = 224, L = 38, R = 194, top = sub ? 52 : 32, bot = h - 24;
  const H = bot - top;
  // 気温 -30〜30℃、降水量 0〜600mm（10℃＝100mm）
  const yT = v => bot - (v + 30) / 60 * H, yP = v => bot - v / 600 * H;
  const bwid = (R - L) / 12;
  let s = `<rect x="${L}" y="${top}" width="${R - L}" height="${H}" fill="#fff" stroke="${C.ink}" stroke-width="1"/>`;
  for (let v = -20; v <= 20; v += 10) s += `<line x1="${L}" y1="${r1(yT(v))}" x2="${R}" y2="${r1(yT(v))}" stroke="#c9d3da" stroke-width="${v === 0 ? 1 : 0.6}"/>`;
  P.forEach((p, i) => { s += `<rect x="${r1(L + i * bwid + 1.5)}" y="${r1(yP(p))}" width="${r1(bwid - 3)}" height="${r1(bot - yP(p))}" fill="#7da7c9" stroke="#3d6688" stroke-width="0.5"/>`; });
  const pts = T.map((v, i) => `${r1(L + (i + 0.5) * bwid)},${r1(yT(v))}`).join(' ');
  s += `<polyline points="${pts}" fill="none" stroke="#b33a2c" stroke-width="2.2"/>`;
  T.forEach((v, i) => { s += `<circle cx="${r1(L + (i + 0.5) * bwid)}" cy="${r1(yT(v))}" r="2.3" fill="#b33a2c"/>`; });
  for (let v = -30; v <= 30; v += 10) s += txt(L - 4, yT(v), String(v), { size: 12.5, weight: 400, anchor: 'end', noHalo: true });
  for (let v = 0; v <= 600; v += 100) s += txt(R + 4, yP(v), String(v), { size: 12.5, weight: 400, anchor: 'start', noHalo: true });
  s += txt(L - 4, top - 9, '℃', { size: 12.5, weight: 400, anchor: 'end', noHalo: true }) + txt(R + 4, top - 9, 'mm', { size: 12.5, weight: 400, anchor: 'start', noHalo: true });
  [1, 4, 7, 10].forEach(m => { s += txt(L + (m - 0.5) * bwid, bot + 11, String(m), { size: 12.5, weight: 400, noHalo: true }); });
  s += txt(R + 4, bot + 11, '月', { size: 12.5, weight: 400, anchor: 'start', noHalo: true });
  s += txt((L + R) / 2, 13, title, { size: 18, noHalo: true });
  if (sub) s += txt((L + R) / 2, 33, sub, { size: 13, weight: 400, noHalo: true });
  const avg = T.reduce((a, b) => a + b, 0) / 12, sum = P.reduce((a, b) => a + b, 0);
  return { svg: svg(w, h, s), avg: Math.round(avg * 10) / 10, sum: Math.round(sum) };
}

// ---------- 3. 宗教の分布 ----------
const REL = {
  isl: 'MAR DZA TUN LBY EGY SDN MRT MLI NER TCD SEN GMB GIN SLE BFA NGA CIV SOM DJI ESH SAU YEM OMN ARE QAT KWT IRQ IRN SYR JOR LBN PSE TUR AZE KAZ UZB TKM KGZ TJK AFG PAK BGD MYS IDN BRN ALB BIH',
  bud: 'THA MMR KHM LAO LKA MNG BTN VNM CHN JPN TWN',
  hin: 'IND NPL',
};
const RELSETS = Object.fromEntries(Object.entries(REL).map(([k, v]) => [k, new Set(v.split(' '))]));
function relOf(f) {
  const n = f.properties.name;
  if (['Somaliland', 'N. Cyprus', 'Kosovo'].includes(n)) return 'isl';
  const c = iso3[f.id];
  if (!c) return 'oth';
  for (const k of ['isl', 'bud', 'hin']) if (RELSETS[k].has(c)) return k;
  if (['ISR', 'PRK', 'ATA', 'ATF'].includes(c)) return 'oth';
  return 'chr';
}
const RELCOL = { chr: '#9dbcdc', isl: '#3c7a5a', bud: '#f0cf72', hin: 'stripe', oth: '#f4f4f4' };
const RELNAME = { chr: 'キリスト教', isl: 'イスラム教', bud: '仏教', hin: 'ヒンドゥー教', oth: 'その他' };
function figReligion(mode) {
  const w = 800, h = 370, legH = 40;
  const proj = d3.geoNaturalEarth1().rotate([-150, 0]).fitExtent([[6, 6], [w - 6, h - 6]], { type: 'Sphere' });
  const path = d3.geoPath(proj);
  let s = `<defs><pattern id="rh${mode}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#f3d6cc"/><rect width="2.6" height="6" fill="#b5513c"/></pattern></defs>`;
  s += `<path d="${ps(path, { type: 'Sphere' })}" fill="${C.sea}" stroke="${C.line}"/>`;
  for (const f of countries) {
    const r = relOf(f); if (f.properties.name === 'Antarctica') continue;
    s += `<path d="${ps(path, f)}" fill="${RELCOL[r] === 'stripe' ? `url(#rh${mode})` : RELCOL[r]}" stroke="#666" stroke-width="0.35"/>`;
  }
  const order = mode === 'label' ? ['chr', 'isl', 'bud', 'hin', 'oth'] : ['isl', 'hin', 'chr', 'bud', 'oth'];
  const bw = w / 5;
  order.forEach((k, i) => {
    const x = i * bw + 20, ly = h + 10;
    s += `<rect x="${x}" y="${ly}" width="26" height="18" fill="${RELCOL[k] === 'stripe' ? `url(#rh${mode})` : RELCOL[k]}" stroke="${C.ink}" stroke-width="0.8"/>`;
    s += txt(x + 32, ly + 9.5, mode === 'label' ? RELNAME[k] : (k === 'oth' ? 'その他' : 'ABCD'[i]), { size: mode === 'label' ? 14 : 16, anchor: 'start', noHalo: true });
  });
  s += txt(w - 8, h - 14, '国ごとに、信者がいちばん多い宗教で色分けした、おおまかな図', { size: 11, weight: 400, anchor: 'end' });
  return svg(w, h + legH, s);
}

// ---------- 4. 世界の住居 ----------
const K = C.ink;
const HOUSES = {
  takayuka: ['高床の家', '熱帯', `
    <line x1="10" y1="132" x2="210" y2="132" stroke="${K}" stroke-width="1.5"/>
    ${[50, 80, 140, 170].map(x => `<rect x="${x}" y="88" width="5" height="44" fill="#8a6a4a"/>`).join('')}
    <rect x="44" y="60" width="132" height="30" fill="#c9a77a" stroke="${K}"/>
    <path d="M30 62 L110 18 L190 62 Z" fill="#b9a15a" stroke="${K}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<line x1="${48 + i * 20}" y1="${56 - (i < 4 ? i * 7 : (6 - i) * 7)}" x2="${42 + i * 20}" y2="62" stroke="#7d6a2e"/>`).join('')}
    <rect x="98" y="66" width="20" height="24" fill="#6b4c2f"/>
    <path d="M100 132 L108 90" stroke="#8a6a4a" stroke-width="3"/><path d="M104 132 L112 90" stroke="#8a6a4a" stroke-width="3"/>
    ${[115, 123, 128].map(y => `<line x1="${100 + (132 - y) * 0.19}" y1="${y}" x2="${104 + (132 - y) * 0.19}" y2="${y}" stroke="#8a6a4a" stroke-width="2"/>`).join('')}`],
  renga: ['日干しれんがの家', '乾燥帯', `
    <path d="M10 132 L210 132" stroke="${K}" stroke-width="1.5"/>
    <path d="M10 132 Q40 126 60 130" fill="none" stroke="#c2a36a"/><path d="M160 131 Q185 125 210 130" fill="none" stroke="#c2a36a"/>
    <defs><clipPath id="rg"><rect x="40" y="58" width="140" height="74"/></clipPath></defs>
    <rect x="40" y="58" width="140" height="74" fill="#d9b682" stroke="${K}"/>
    <rect x="34" y="52" width="152" height="8" fill="#c9a26a" stroke="${K}"/>
    <g clip-path="url(#rg)">${[0, 1, 2, 3, 4, 5, 6].map(r => [-1, 0, 1, 2, 3, 4, 5].map(c => `<rect x="${40 + c * 24 + (r % 2) * 12}" y="${60 + r * 10}" width="24" height="10" fill="none" stroke="#b38d55" stroke-width="0.6"/>`).join('')).join('')}</g>
    <rect x="98" y="96" width="24" height="36" fill="#5d4127"/>
    <rect x="60" y="74" width="12" height="12" fill="#3c2b1a"/><rect x="148" y="74" width="12" height="12" fill="#3c2b1a"/>
    <rect x="34" y="40" width="0" height="0"/>`],
  ger: ['ゲル（移動式の住居）', '乾燥帯（モンゴル）', `
    <line x1="10" y1="132" x2="210" y2="132" stroke="${K}" stroke-width="1.5"/>
    <path d="M40 132 L40 82 L180 82 L180 132 Z" fill="#f5f2ea" stroke="${K}"/>
    <path d="M32 84 Q110 30 188 84 Z" fill="#ece6d8" stroke="${K}"/>
    <rect x="102" y="38" width="16" height="8" fill="#ece6d8" stroke="${K}"/>
    <line x1="40" y1="96" x2="180" y2="96" stroke="#9b3b2f" stroke-width="3"/><line x1="40" y1="118" x2="180" y2="118" stroke="#9b3b2f" stroke-width="3"/>
    <rect x="98" y="96" width="24" height="36" fill="#c24a33" stroke="${K}"/>
    <path d="M36 82 L60 60 M184 82 L160 60" stroke="#9b3b2f" stroke-width="2"/>`],
  ishi: ['白いかべの石造りの家', '温帯（地中海性気候）', `
    <line x1="10" y1="132" x2="210" y2="132" stroke="${K}" stroke-width="1.5"/>
    <rect x="44" y="62" width="132" height="70" fill="#fbfbf8" stroke="${K}"/>
    <path d="M36 64 L110 36 L184 64 Z" fill="#c8735a" stroke="${K}"/>
    ${[0, 1, 2, 3].map(i => `<line x1="${54 + i * 38}" y1="${60 - (i < 2 ? i * 10 : (3 - i) * 10) - 4}" x2="${50 + i * 38}" y2="64" stroke="#9c4f3b"/>`).join('')}
    <rect x="62" y="80" width="16" height="18" fill="#3c6e9a" stroke="${K}"/><rect x="142" y="80" width="16" height="18" fill="#3c6e9a" stroke="${K}"/>
    <path d="M98 132 L98 104 Q110 92 122 104 L122 132 Z" fill="#5a7da0" stroke="${K}"/>`],
  siberia: ['高床の建物', '冷帯（シベリア）', `
    <rect x="10" y="132" width="200" height="12" fill="#d7dee4"/>
    <line x1="10" y1="132" x2="210" y2="132" stroke="${K}" stroke-width="1.5"/>
    ${[34, 70, 106, 142, 178].map(x => `<rect x="${x}" y="108" width="7" height="24" fill="#8b8b8b" stroke="${K}" stroke-width="0.6"/>`).join('')}
    <rect x="26" y="26" width="168" height="84" fill="#e9e1cf" stroke="${K}"/>
    ${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5].map(c => `<rect x="${36 + c * 26}" y="${34 + r * 25}" width="14" height="14" fill="#7c94ad" stroke="${K}" stroke-width="0.6"/>`).join('')).join('')}
    <text x="110" y="141" font-size="10" text-anchor="middle" fill="${K}">永久凍土</text>`],
  igloo: ['イグルー', '寒帯（カナダ北部）', `
    <rect x="10" y="132" width="200" height="12" fill="#eef3f7"/>
    <line x1="10" y1="132" x2="210" y2="132" stroke="${K}" stroke-width="1.5"/>
    <path d="M44 132 A66 66 0 0 1 176 132 Z" fill="#f7fafc" stroke="${K}"/>
    ${[118, 104, 90, 78].map((y, i) => { const rr = Math.sqrt(66 * 66 - (132 - y) * (132 - y)); return `<path d="M${r1(110 - rr)} ${y} L${r1(110 + rr)} ${y}" stroke="#9fb3c2"/>`; }).join('')}
    <path d="M150 132 L150 112 A16 16 0 0 1 182 112 L182 132 Z" fill="#f7fafc" stroke="${K}"/>
    <path d="M158 132 L158 118 A8 8 0 0 1 174 118 L174 132 Z" fill="#3a4a58"/>`],
};
function house(key, mode, letter) {
  const [name, zone, body] = HOUSES[key];
  let s = `<rect x="0.5" y="0.5" width="219" height="${mode === 'label' ? 189 : 169}" rx="4" fill="#fff" stroke="#999"/>` + body;
  if (mode === 'label') s += txt(110, 158, name, { size: 15, noHalo: true }) + txt(110, 177, zone, { size: 12, weight: 400, noHalo: true });
  else s += badge(20, 20, letter, { r: 13, size: 16 });
  return svg(220, mode === 'label' ? 190 : 170, s);
}

const figs = { climateLabel: figClimate('label'), climateQ: figClimate('q'), religionLabel: figReligion('label'), religionQ: figReligion('q') };
const order = ['singapore', 'cairo', 'rome', 'tokyo', 'paris', 'irkutsk', 'barrow', 'lapaz'];
const stats = {};
order.forEach((k, i) => {
  const [name, zone] = GRAPHS[k];
  const g = climGraph(k, `${'①②③④⑤⑥⑦⑧'[i]} ${name}`, zone);
  figs['cg_' + k] = g.svg; stats[k] = [g.avg, g.sum];
});
// 問題用：都市名なし（ア〜カ）
const qOrder = ['irkutsk', 'singapore', 'paris', 'cairo', 'lapaz', 'rome'];
qOrder.forEach((k, i) => { figs['cgq_' + k] = climGraph(k, 'アイウエオカ'[i], '').svg; });
Object.keys(HOUSES).forEach(k => { figs['h_' + k] = house(k, 'label'); });
const hq = ['siberia', 'takayuka', 'ishi', 'ger', 'renga', 'igloo'];
hq.forEach((k, i) => { figs['hq_' + k] = house(k, 'q', 'アイウエオカ'[i]); });
fs.writeFileSync('figs3.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));
console.log(JSON.stringify(stats));

// 地理 第8講「南アメリカ州」の図
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import * as tsimp from 'topojson-simplify';
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
let t50 = require('world-atlas/countries-50m.json');
t50 = tsimp.presimplify(t50); t50 = tsimp.simplify(t50, tsimp.quantile(t50, 0.45));
const countries = topojson.feature(t50, t50.objects.countries).features;
const wc = require('world-countries');
const iso = {}; wc.forEach(c => { iso[c.ccn3] = c.cca3; });
const rivers = JSON.parse(fs.readFileSync('data/rivers50.geojson')).features;

const C = { sea: '#eef4f8', land: '#ece8de', line: '#555', ink: '#1d2a33', river: '#3f7fb5' };
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
const r1 = n => Math.round(n * 10) / 10;
const ps = (path, f) => { const d = path(f); return d ? d.replace(/(\d+\.\d)\d+/g, '$1') : ''; };
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.noHalo ? '' : halo}${o.rot ? ` transform="rotate(${o.rot} ${r1(x)} ${r1(y)})"` : ''}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 14;
  const shape = o.square
    ? `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`
    : `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>`;
  return shape + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 17}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const inBox = (f, [a, b, c, d]) => { const [[x0, y0], [x1, y1]] = d3.geoBounds(f); return !(x1 < a || x0 > c || y1 < b || y0 > d) || (x0 > x1); };
const SAM = new Set(wc.filter(c => c.subregion === 'South America').map(c => c.cca3));

const BOX = [-84, -56, -33, 13];
function saBase(w, h, id, fill) {
  const proj = d3.geoMercator().fitExtent([[4, 4], [w - 4, h - 4]], { type: 'MultiPoint', coordinates: [[BOX[0], BOX[1]], [BOX[2], BOX[3]]] });
  const path = d3.geoPath(proj);
  let s = `<defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="${C.sea}"/><g clip-path="url(#${id})">`;
  for (const f of countries) {
    if (!inBox(f, [BOX[0] - 15, BOX[1] - 10, BOX[2] + 10, BOX[3] + 15])) continue;
    s += `<path d="${ps(path, f)}" fill="${fill(f)}" stroke="#8a8a8a" stroke-width="0.5"/>`;
  }
  const eq = proj([0, 0])[1];
  return { s, proj, path, close: `<line x1="0" y1="${r1(eq)}" x2="${w}" y2="${r1(eq)}" stroke="${C.ink}" stroke-width="1.1" stroke-dasharray="7 5"/></g><rect width="${w}" height="${h}" fill="none" stroke="${C.line}"/>` + txt(w - 8, eq - 10, '赤道', { size: 14, anchor: 'end' }) };
}
const tri = (proj, [lo, la]) => { const [x, y] = proj([lo, la]); return `<path d="M${r1(x - 7)} ${r1(y + 6)} L${r1(x)} ${r1(y - 7)} L${r1(x + 7)} ${r1(y + 6)} Z" fill="#8a6d5a" stroke="#4f3b2e" stroke-width="0.8"/>`; };

// ---------- 1. 地形と国 ----------
const CNT = [['ブラジル', 'BRA', [-51, -10], 1], ['アルゼンチン', 'ARG', [-65, -35], 2], ['チリ', 'CHL', [-72.6, -27], 3], ['ペルー', 'PER', [-75.2, -9.5], 4], ['コロンビア', 'COL', [-73.5, 4], 5], ['ボリビア', 'BOL', [-64.8, -16.8], 6], ['ベネズエラ', 'VEN', [-66.5, 7.5], 7], ['エクアドル', 'ECU', [-78.6, -1.5], 8]];
function figMap(mode) {
  const w = 520, h = 640;
  const { s: base, proj, path, close } = saBase(w, h, 'sm' + mode, f => SAM.has(iso[f.id]) ? C.land : '#f6f5f1');
  let s = base;
  const RV = new Set(['Amazonas', 'Negro', 'Madeira', 'Paraná', 'Uruguay']);
  for (const f of rivers) if (RV.has(f.properties.name)) s += `<path d="${ps(path, f)}" fill="none" stroke="${C.river}" stroke-width="${f.properties.name === 'Amazonas' ? 2.8 : 1.6}"/>`;
  [[-78, 0], [-76.5, -6], [-74, -12.5], [-70, -17], [-68.5, -22], [-69.5, -28], [-70, -34], [-71.5, -40], [-72.5, -46]].forEach(p => { s += tri(proj, p); });
  s += close;
  const L = (n, lo, la, o = {}) => { const [x, y] = proj([lo, la]); return txt(x, y, n, o); };
  if (mode === 'label') {
    CNT.forEach(([n, , p]) => { s += L(n, p[0], p[1], { size: n === 'ブラジル' ? 20 : 13 }); });
    s += L('アマゾン川', -58, -1.6, { size: 15, fill: '#1f4f7a' });
    s += L('ラプラタ川', -54, -33.5, { size: 13, fill: '#1f4f7a', anchor: 'start' });
    s += L('アンデス山脈', -79.5, -21, { size: 14, rot: 80 });
    s += L('パンパ', -61.5, -37.5, { size: 15, fill: '#5a3a1c' });
    s += L('ブラジル高原', -47, -16.5, { size: 13 });
    s += L('太平洋', -80, -38, { size: 17, fill: '#1f4f7a' }) + L('大西洋', -38, -27, { size: 17, fill: '#1f4f7a' });
  } else {
    CNT.forEach(([, , p, k]) => { const [x, y] = proj(p); s += badge(x, y, k, { r: 12, size: 15 }); });
    s += badge(...proj([-58, -2.4]), 'ア') + badge(...proj([-57, -33.3]), 'イ') + badge(...proj([-80.5, -21]), 'A', { square: true }) + badge(...proj([-61.5, -37.5]), 'B', { square: true });
  }
  return svg(w, h, s);
}

// ---------- 2. 言語 ----------
function figLang(mode) {
  const w = 400, h = 490;
  const col = f => { const c = iso[f.id]; if (!SAM.has(c) && f.properties.name !== 'France') return '#f6f5f1'; if (c === 'BRA') return '#f0cf72'; if (['GUY', 'SUR', 'FRA', 'FLK'].includes(c) || f.properties.name === 'France') return '#e6e1d6'; return '#9dbcdc'; };
  const { s: base, proj, close } = saBase(w, h, 'sl' + mode, col);
  let s = base + close;
  const lg = (y, f, t) => `<rect x="${w - 180}" y="${y}" width="22" height="15" fill="${f}" stroke="${C.ink}" stroke-width="0.6"/>` + txt(w - 152, y + 8, t, { size: 14, anchor: 'start' });
  s += lg(h - 70, '#9dbcdc', mode === 'label' ? 'スペイン語' : 'P') + lg(h - 48, '#f0cf72', mode === 'label' ? 'ポルトガル語' : 'Q') + lg(h - 26, '#e6e1d6', 'その他（英語など）');
  return svg(w, h, s);
}

// ---------- 3. アンデスの土地利用 ----------
function figAndes(mode) {
  const w = 520, h = 340, base = 300, top = 30;
  const yA = m => base - m / 5000 * (base - top);
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>`;
  // 山の断面
  const pts = [[60, 0], [120, 600], [170, 1500], [215, 2600], [255, 3500], [290, 4300], [320, 4900], [350, 4300], [390, 3400], [440, 2300], [500, 1000], [520, 600]];
  s += `<path d="M60 ${base} ${pts.map(([x, m]) => `L${x} ${r1(yA(m))}`).join(' ')} L520 ${base} Z" fill="#e8dfcc" stroke="${C.ink}" stroke-width="1.2"/>`;
  for (const m of [1000, 2000, 3000, 4000]) s += `<line x1="56" y1="${r1(yA(m))}" x2="${w - 4}" y2="${r1(yA(m))}" stroke="#bbb" stroke-dasharray="3 3"/>` + txt(52, yA(m), `${m}m`, { size: 12, weight: 400, anchor: 'end', noHalo: true });
  s += txt(52, base, '0m', { size: 12, weight: 400, anchor: 'end', noHalo: true });
  const band = (m0, m1, label, q) => { const y = (yA(m0) + yA(m1)) / 2; return mode === 'label' ? txt(118, y, label, { size: 14, anchor: 'start' }) : badge(140, y, q, { r: 12, size: 15 }); };
  s += band(4000, 5000, '4000m以上：リャマ・アルパカの放牧', 'ア');
  s += band(3000, 4000, '3000〜4000m：じゃがいも', 'イ');
  s += band(2000, 3000, '2000〜3000m：とうもろこし', 'ウ');
  s += band(0, 2000, '低地：バナナ・さとうきびなど', 'エ');
  s += txt(w / 2, 14, 'アンデス山脈の標高と土地の利用（赤道近く・おおまかな図）', { size: 14, noHalo: true });
  return svg(w, h, s);
}

// ---------- 4. バイオエタノールの流れ ----------
function figBio() {
  const w = 580, h = 170;
  const box = (x, t1, t2) => `<rect x="${x}" y="48" width="150" height="68" rx="6" fill="#f5f2ea" stroke="${C.ink}"/>` + txt(x + 75, 72, t1, { size: 15, noHalo: true }) + txt(x + 75, 96, t2, { size: 12, weight: 400, noHalo: true });
  let s = `<defs><marker id="bioa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${C.ink}"/></marker></defs>`;
  s += box(6, 'さとうきび', '育つときCO₂を吸収') + box(215, 'バイオエタノール', '工場でつくる燃料') + box(424, '自動車の燃料', '燃やすとCO₂を出す');
  s += `<line x1="158" y1="82" x2="211" y2="82" stroke="${C.ink}" stroke-width="2" marker-end="url(#bioa)"/><line x1="367" y1="82" x2="420" y2="82" stroke="${C.ink}" stroke-width="2" marker-end="url(#bioa)"/>`;
  s += `<path d="M499 120 Q499 162 290 162 Q81 162 81 122" fill="none" stroke="#3c7a5a" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#bioa)"/>`;
  s += txt(290, 150, '出したCO₂を、次に育つさとうきびが吸収する', { size: 12, fill: '#2f5f45' });
  s += txt(w / 2, 18, 'バイオ燃料（バイオエタノール）', { size: 16, noHalo: true });
  return svg(w, h, s);
}

// ---------- 5. グラフ ----------
function share(title, rows, note, max = 60, hi = 'ブラジル') {
  const w = 320, rowH = 30, top = 40, h = top + rows.length * rowH + 30, L = 112, R = 290;
  let s = txt(w / 2, 14, title, { size: 17, noHalo: true });
  for (let v = 0; v <= max; v += 20) { const x = L + v / max * (R - L); s += `<line x1="${r1(x)}" y1="${top - 6}" x2="${r1(x)}" y2="${top + rows.length * rowH}" stroke="#d7dde2" stroke-width="0.8"/>` + txt(x, top + rows.length * rowH + 11, v + '%', { size: 11, weight: 400, noHalo: true }); }
  rows.forEach(([n, v], i) => {
    const y = top + i * rowH;
    s += txt(L - 8, y + rowH / 2, n, { size: 14, anchor: 'end', noHalo: true });
    s += `<rect x="${L}" y="${r1(y + 5)}" width="${r1(v / max * (R - L))}" height="${rowH - 10}" fill="${n === hi ? '#3c6e9a' : '#9db7d0'}"/>`;
    s += txt(L + v / max * (R - L) + 5, y + rowH / 2, `${v}%`, { size: 13, anchor: 'start', noHalo: true });
  });
  s += txt(w - 4, h - 6, note, { size: 10.5, weight: 400, anchor: 'end', noHalo: true });
  return svg(w, h, s);
}
const NOTE = '2022年。FAOSTATをもとにしたおおよその値';
const COFFEE = [['ブラジル', 30], ['ベトナム', 18], ['インドネシア', 8], ['コロンビア', 7], ['エチオピア', 5]];
const SUGAR = [['ブラジル', 38], ['インド', 23], ['中国', 5], ['タイ', 5], ['パキスタン', 5]];
const COPPER = [['チリ', 23], ['ペルー', 12], ['コンゴ民主', 11], ['中国', 8], ['アメリカ', 5]];
const figs = {
  saMapLabel: figMap('label'), saMapQ: figMap('q'),
  saLangLabel: figLang('label'), saLangQ: figLang('q'),
  andesLabel: figAndes('label'), andesQ: figAndes('q'),
  bioFlow: figBio(),
  shareCoffee: share('コーヒー豆の生産', COFFEE, NOTE), shareSugar: share('さとうきびの生産', SUGAR, NOTE),
  shareCopper: share('銅鉱の生産', COPPER, '2023年。USGSをもとにしたおおよその値', 60, 'チリ'),
  shareCoffeeQ: share('作物 X の生産', COFFEE, NOTE), shareCopperQ: share('鉱産資源 Y の生産', COPPER, '2023年。USGSをもとにしたおおよその値', 60, 'チリ'),
};
fs.writeFileSync('figs8.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(0)).join(' '));

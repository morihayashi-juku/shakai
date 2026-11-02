// 歴史 第1講「歴史のとらえ方」の図
import fs from 'fs';
const C = { ink: '#1d2a33' };
const r1 = n => Math.round(n * 10) / 10;
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"';
function txt(x, y, s, o = {}) {
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${o.size || 13}" font-weight="${o.weight || 700}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="middle" fill="${o.fill || C.ink}" ${o.halo ? halo : ''}>${s}</text>`;
}
function badge(x, y, s, o = {}) {
  const r = o.r || 12;
  return `<rect x="${r1(x - r)}" y="${r1(y - r)}" width="${2 * r}" height="${2 * r}" rx="2" fill="#fff" stroke="${C.ink}" stroke-width="1.4"/>` + `<text x="${r1(x)}" y="${r1(y + 0.5)}" font-size="${o.size || 15}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">${s}</text>`;
}
const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit">${body}</svg>`;
const arrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;

// 西暦と世紀のものさし
function seiki(mode) {
  const w = 720, h = 210, L = 40, R = 680, y0 = 112;
  const X = yr => L + (yr + 300) / 600 * (R - L);
  let s = `<defs>${arrowDefs('sa' + mode, '#555')}</defs><rect width="${w}" height="${h}" fill="#fff"/>`;
  const names = ['紀元前3世紀', '紀元前2世紀', '紀元前1世紀', '1世紀', '2世紀', '3世紀'];
  const qmap = { 1: 'A', 3: 'B', 5: 'C' };
  names.forEach((n, i) => {
    const x1 = X(-300 + i * 100), x2 = X(-200 + i * 100);
    s += `<rect x="${r1(x1 + 2)}" y="${y0 - 44}" width="${r1(x2 - x1 - 4)}" height="34" rx="4" fill="${i < 3 ? '#f3e3d6' : '#dbe8f3'}" stroke="#888"/>`;
    s += mode === 'q' && qmap[i] ? badge((x1 + x2) / 2, y0 - 27, qmap[i]) : txt((x1 + x2) / 2, y0 - 27, n, { size: 14 });
  });
  s += `<line x1="${L - 10}" y1="${y0}" x2="${R + 10}" y2="${y0}" stroke="#333" stroke-width="2"/>`;
  [-300, -200, -100, 0, 100, 200, 300].forEach(yr => { const x = X(yr); s += `<line x1="${r1(x)}" y1="${y0 - 6}" x2="${r1(x)}" y2="${y0 + 6}" stroke="#333" stroke-width="1.6"/>`; });
  const lab = { '-300': '前300年', '-200': '前200年', '-100': '前100年', '0': '', '100': '100年', '200': '200年', '300': '300年' };
  Object.entries(lab).forEach(([k, v]) => { if (v) s += txt(X(+k), y0 + 20, v, { size: 12.5, weight: 400 }); });
  const x0 = X(0);
  s += `<line x1="${r1(x0)}" y1="${y0 - 58}" x2="${r1(x0)}" y2="${y0 + 60}" stroke="#c0392b" stroke-width="2" stroke-dasharray="5 3"/>`;
  s += txt(x0 - 4, y0 + 20, '前1年', { size: 12, weight: 400, anchor: 'end' }) + txt(x0 + 4, y0 + 20, '1年', { size: 12, weight: 400, anchor: 'start' });
  s += txt(x0, y0 + 76, mode === 'label' ? 'イエス・キリストが生まれたと考えられていた年を「1年」とする（0年はない）' : '', { size: 12, fill: '#c0392b' });
  s += `<line x1="${r1(x0 - 20)}" y1="${y0 + 52}" x2="${L + 30}" y2="${y0 + 52}" stroke="#555" stroke-width="2" marker-end="url(#sa${mode})"/>` + txt(x0 - 150, y0 + 39, mode === 'label' ? '紀元前（B.C.）' : 'D', { size: 13 });
  s += `<line x1="${r1(x0 + 20)}" y1="${y0 + 52}" x2="${R - 30}" y2="${y0 + 52}" stroke="#555" stroke-width="2" marker-end="url(#sa${mode})"/>` + txt(x0 + 150, y0 + 39, mode === 'label' ? '紀元後（A.D.）' : 'E', { size: 13 });
  s += txt(w / 2, 18, mode === 'label' ? '西暦と世紀' : '西暦と世紀（A〜Cは世紀、D・Eはよび方）', { size: 15 });
  return svg(w, h, s);
}
// 時代区分の帯
const ERAS = [['旧石器', 1], ['縄文', 1], ['弥生', 1], ['古墳', 1], ['飛鳥', 1], ['奈良', 1], ['平安', 1], ['鎌倉', 1], ['室町', 1], ['安土桃山', 1], ['江戸', 1.1], ['明治', 1], ['大正', 1], ['昭和', 1.6], ['平成', 1], ['令和', 1]];
const BIG = [['原始', 0, 3], ['古代', 3, 7], ['中世', 7, 9], ['近世', 9, 11], ['近代', 11, 13.5], ['現代', 13.5, 16]];
function jidai(mode) {
  const w = 760, h = 230, L = 20, R = 740, top = 40, eh = 110, bh = 34;
  const tot = ERAS.reduce((a, e) => a + e[1], 0);
  const xs = [L]; ERAS.forEach(e => xs.push(xs[xs.length - 1] + e[1] / tot * (R - L)));
  const xAt = idx => { const i = Math.floor(idx), f = idx - i; return i >= ERAS.length ? R : xs[i] + f * (xs[i + 1] - xs[i]); };
  const cols = ['#e9e2d4', '#efe3c9', '#f2dcc0', '#ead2bd', '#e6cfd8', '#ddd4ea', '#d6dcef', '#d3e4ea', '#d4e6da', '#e3e8cf', '#efe8c6', '#f3dccc', '#f3d3cf', '#ecd5e0', '#dfe0ee', '#d9e9ec'];
  const qEra = { 5: 'ア', 7: 'イ', 10: 'ウ' };
  let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + txt(w / 2, 16, mode === 'label' ? '日本の時代区分' : '日本の時代区分（ア〜ウは時代名、A・Bは区分）', { size: 15 });
  ERAS.forEach(([n], i) => {
    const x1 = xs[i], x2 = xs[i + 1], cx = (x1 + x2) / 2;
    s += `<rect x="${r1(x1)}" y="${top}" width="${r1(x2 - x1)}" height="${eh}" fill="${cols[i]}" stroke="#777" stroke-width="0.8"/>`;
    if (mode === 'q' && qEra[i]) { s += badge(cx, top + eh / 2, qEra[i], { r: 11, size: 14 }); return; }
    const ch = [...n]; const st = 15.5, y1 = top + eh / 2 - (ch.length - 1) * st / 2;
    ch.forEach((c, k) => { s += txt(cx, y1 + k * st, c, { size: 14 }); });
  });
  const qBig = { 2: 'A', 3: 'B' };
  BIG.forEach(([n, a, b], i) => {
    const x1 = xAt(a), x2 = xAt(b);
    s += `<rect x="${r1(x1)}" y="${top + eh + 8}" width="${r1(x2 - x1)}" height="${bh}" fill="#fff" stroke="#8f4a2f" stroke-width="1.4"/>`;
    s += mode === 'q' && qBig[i] ? badge((x1 + x2) / 2, top + eh + 8 + bh / 2, qBig[i], { r: 11, size: 14 }) : txt((x1 + x2) / 2, top + eh + 8 + bh / 2, n, { size: 15, fill: '#8f4a2f' });
  });
  s += txt(w / 2, h - 18, mode === 'label' ? '※ 区分の切れ目には、いくつかの考え方がある。昭和は戦前が近代、戦後が現代。' : '', { size: 11, weight: 400 });
  return svg(w, h, s);
}
const figs = { seikiLabel: seiki('label'), seikiQ: seiki('q'), jidaiLabel: jidai('label'), jidaiQ: jidai('q') };
fs.writeFileSync('figs_h01.json', JSON.stringify(figs));
console.log(Object.entries(figs).map(([k, v]) => k + ':' + (v.length / 1024).toFixed(1)).join(' '));

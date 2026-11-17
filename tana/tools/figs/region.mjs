// 地図の図を作る：node region.mjs spec.json out.svg
// spec: {w,h, proj:{type:"mercator"|"equirect", rotate?, bbox?:[[lon,lat],[lon,lat]], sphere?},
//        res:"50m"|"110m", fill:{国名:色}, labels:[{lon,lat,t,kind:"tag"|"sea"|"dot"|"star"|"text",dx?,dy?}],
//        lines:[{c:[[lon,lat],...], color, w, dash}], graticule?:true}
import fs from "fs";
import * as topojson from "topojson-client";
import * as d3 from "d3-geo";

const [, , specFile, out] = process.argv;
const S = JSON.parse(fs.readFileSync(specFile, "utf8"));
const W = S.w || 720, H = S.h || 400, res = S.res || "50m";
const topo = JSON.parse(fs.readFileSync(`node_modules/world-atlas/countries-${res}.json`));
const countries = topojson.feature(topo, topo.objects.countries);
const borders = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b);
const land = topojson.feature(topo, topo.objects.land);

let proj = S.proj.type === "mercator" ? d3.geoMercator() : S.proj.type === "azeq" ? d3.geoAzimuthalEquidistant() : d3.geoEquirectangular();
if (S.proj.rotate) proj.rotate(S.proj.rotate);
if (S.proj.scale) proj.scale(S.proj.scale).translate(S.proj.translate);
else if (S.proj.bbox) {
  const [[a, b], [c, d]] = S.proj.bbox;
  proj.fitExtent([[2, 2], [W - 2, H - 2]], {type: "Polygon", coordinates: [[[a, b], [a, d], [c, d], [c, b], [a, b]]]});
} else proj.fitExtent([[4, 4], [W - 4, H - 4]], {type: "Sphere"});
proj.clipExtent([[0, 0], [W, H]]);
const path = d3.geoPath(proj), P = (lon, lat) => proj([lon, lat]);

let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Noto Sans CJK JP">`;
s += `<rect width="${W}" height="${H}" fill="#e8f2fb"/>`;
if (S.proj.sphere) s += `<path d="${path({type: "Sphere"})}" fill="#e8f2fb" stroke="#333" stroke-width="1.5"/>`;
if (S.graticule) s += `<path d="${path(d3.geoGraticule().step([30, 30])())}" fill="none" stroke="#9bb8d3" stroke-width="0.6"/>`;
s += `<path d="${path(land)}" fill="#f4ecd6"/>`;
for (const f of countries.features) {
  const c = (S.fill || {})[f.properties.name];
  if (c) s += `<path d="${path(f)}" fill="${c}"/>`;
}
if (S.borders !== false) s += `<path d="${path(borders)}" fill="none" stroke="#999" stroke-width="0.6"/>`;
s += `<path d="${path(land)}" fill="none" stroke="#555" stroke-width="0.8"/>`;
for (const L of S.lines || []) {
  s += `<path d="${path({type: "LineString", coordinates: L.c})}" fill="none" stroke="${L.color || "#1a5fd0"}" stroke-width="${L.w || 2.5}"${L.dash ? ` stroke-dasharray="${L.dash}"` : ""} stroke-linejoin="round"/>`;
}
for (const L of S.labels || []) {
  let [x, y] = P(L.lon, L.lat); x += L.dx || 0; y += L.dy || 0;
  const k = L.kind || "tag", r = L.r || 14;
  if (k === "tag" || k === "sea") {
    const col = k === "sea" ? "#1a5fd0" : "#111";
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${col}" stroke-width="1.6"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="bold" fill="${col}">${L.t}</text>`;
  } else if (k === "dot") {
    const [px, py] = P(L.lon, L.lat);
    s += `<circle cx="${px}" cy="${py}" r="5" fill="#d22" stroke="#fff" stroke-width="1.5"/>`;
    s += `<text x="${x}" y="${y}" font-size="16" font-weight="bold" fill="#d22" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3">${L.t}</text>`;
  } else if (k === "star") {
    s += `<text x="${x}" y="${y + 6}" text-anchor="middle" font-size="18" fill="#d22">★</text>`;
  } else {
    s += `<text x="${x}" y="${y}" font-size="${L.size || 14}" font-weight="bold" fill="${L.color || "#111"}" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3">${L.t}</text>`;
  }
}
s += `<rect width="${W}" height="${H}" fill="none" stroke="#333" stroke-width="1.5"/></svg>`;
fs.writeFileSync(out, s);

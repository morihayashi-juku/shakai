import fs from "fs";
import * as topojson from "topojson-client";
import * as d3 from "d3-geo";

const land110 = JSON.parse(fs.readFileSync("node_modules/world-atlas/land-110m.json"));
const land = topojson.feature(land110, land110.objects.land);

// ---------- 図1 世界地図（太平洋中心） ----------
{
  const W = 720, H = 380;
  const proj = d3.geoEquirectangular().rotate([-145, 0]).fitExtent([[4, 4], [W - 4, H - 4]], { type: "Sphere" });
  const path = d3.geoPath(proj);
  const P = (lon, lat) => proj([lon, lat]);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Noto Sans CJK JP">`;
  s += `<path d="${path({ type: "Sphere" })}" fill="#e8f2fb" stroke="#333" stroke-width="1.5"/>`;
  s += `<path d="${path(d3.geoGraticule().step([30, 30])())}" fill="none" stroke="#9bb8d3" stroke-width="0.6"/>`;
  s += `<path d="${path(land)}" fill="#f4ecd6" stroke="#555" stroke-width="0.8"/>`;
  // 赤道（線X）と本初子午線（線Y）
  s += `<path d="${path({ type: "LineString", coordinates: [[-34.9, 0], [0, 0], [90, 0], [180, 0], [-90, 0], [-35.1, 0]] })}" fill="none" stroke="#d22" stroke-width="2.2"/>`;
  s += `<path d="${path({ type: "LineString", coordinates: [[0, -89], [0, 89]] })}" fill="none" stroke="#1a5fd0" stroke-width="2.2" stroke-dasharray="7 4"/>`;
  const tag = (lon, lat, t, r = 14, fill = "#fff", col = "#111") => {
    const [x, y] = P(lon, lat);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${col}" stroke-width="1.6"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="17" font-weight="bold" fill="${col}">${t}</text>`;
  };
  // 大陸 A〜F
  s += tag(90, 50, "A");        // ユーラシア
  s += tag(20, 8, "B");         // アフリカ
  s += tag(-100, 45, "C");      // 北アメリカ
  s += tag(-60, -12, "D");      // 南アメリカ
  s += tag(134, -25, "E");      // オーストラリア
  s += tag(100, -78, "F");      // 南極
  // 海洋 ア〜ウ
  s += tag(-165, 22, "ア", 15, "#fff", "#1a5fd0");   // 太平洋
  s += tag(-15, -25, "イ", 15, "#fff", "#1a5fd0");    // 大西洋
  s += tag(78, -20, "ウ", 15, "#fff", "#1a5fd0");    // インド洋
  // 日本を★で
  {
    const [x, y] = P(138, 37);
    s += `<text x="${x}" y="${y + 6}" text-anchor="middle" font-size="18" fill="#d22">★</text>`;
  }
  s += `</svg>`;
  fs.writeFileSync("worldmap.svg", s);
}

// ---------- 図2 地球儀 ----------
{
  const W = 300, H = 300;
  const proj = d3.geoOrthographic().rotate([-20, -15]).fitExtent([[20, 20], [W - 20, H - 20]], { type: "Sphere" });
  const path = d3.geoPath(proj);
  const P = (lon, lat) => proj([lon, lat]);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Noto Sans CJK JP">`;
  s += `<path d="${path({ type: "Sphere" })}" fill="#e8f2fb" stroke="#333" stroke-width="1.5"/>`;
  s += `<path d="${path(land)}" fill="#f4ecd6" stroke="#888" stroke-width="0.5"/>`;
  s += `<path d="${path(d3.geoGraticule().step([30, 30])())}" fill="none" stroke="#6f8fb0" stroke-width="0.8"/>`;
  s += `<path d="${path({ type: "LineString", coordinates: [[-70, 0], [0, 0], [110, 0]] })}" fill="none" stroke="#d22" stroke-width="2.5"/>`;
  s += `<path d="${path({ type: "LineString", coordinates: [[0, -89.9], [0, 0], [0, 89.9]] })}" fill="none" stroke="#1a5fd0" stroke-width="2.5" stroke-dasharray="6 3"/>`;
  // 北極点
  const [nx, ny] = P(0, 90);
  s += `<circle cx="${nx}" cy="${ny}" r="4" fill="#111"/><text x="${nx + 8}" y="${ny - 4}" font-size="15" font-weight="bold">点Z</text>`;
  // 線ラベル
  const [ex, ey] = P(78, 0);
  s += `<rect x="${ex - 22}" y="${ey - 30}" width="42" height="20" fill="#fff" stroke="#d22"/><text x="${ex - 1}" y="${ey - 15}" text-anchor="middle" font-size="14" font-weight="bold" fill="#d22">線X</text>`;
  const [mx, my] = P(0, -45);
  s += `<rect x="${mx - 50}" y="${my - 14}" width="42" height="20" fill="#fff" stroke="#1a5fd0"/><text x="${mx - 29}" y="${my + 1}" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a5fd0">線Y</text>`;
  // 目盛り
  for (const lat of [30, 60]) { const [x, y] = P(-5, lat); s += `<text x="${x - 30}" y="${y + 4}" font-size="13" font-weight="bold" fill="#333">${lat}°</text>`; }
  for (const lon of [30, 60]) { const [x, y] = P(lon, -4); s += `<text x="${x - 6}" y="${y + 10}" font-size="13" font-weight="bold" fill="#333">${lon}°</text>`; }
  // 点P（北緯30度・東経60度）
  const [px, py] = P(60, 30);
  s += `<circle cx="${px}" cy="${py}" r="5" fill="#d22" stroke="#fff" stroke-width="1.5"/><text x="${px + 7}" y="${py - 5}" font-size="15" font-weight="bold" fill="#d22">P</text>`;
  s += `</svg>`;
  fs.writeFileSync("globe.svg", s);
}
console.log("ok");

// Gráfico: incidencia de la pobreza por región, 2024 (datos leídos de la lámina de la clase 4).
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const fs = require("fs"), path = require("path");
const data = [["Arica y Parinacota",21.4],["Tarapacá",20.8],["Antofagasta",16.4],["Atacama",18.6],["Coquimbo",20.7],["Valparaíso",17.8],["Metropolitana",13.3],["O'Higgins",17.9],["Maule",24.3],["Ñuble",23.9],["Biobío",19.3],["La Araucanía",28.6],["Los Ríos",22.3],["Los Lagos",16.5],["Aysén",14.3],["Magallanes",9.9]].sort((a,b)=>b[1]-a[1]);
const AVG = 17.3, MAX = 30, W = 936, LEFT = 170, RIGHT = 70, top = 30, rowH = 30, barH = 18;
const x = (v) => LEFT + (v / MAX) * (W - LEFT - RIGHT);
const H = top + data.length * rowH + 40;
const ink = "#1f2937", ink2 = "#52514e", muted = "#8a8983", grid = "#e6e5e0", blue = "#2a78d6";
const fmt = (v) => v.toFixed(1).replace(".", ",");
let svg = "";
for (const t of [0, 10, 20, 30]) svg += `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 8}" y2="${H - 34}" stroke="${grid}" stroke-width="1"/><text x="${x(t)}" y="${H - 14}" text-anchor="middle" font-size="14" fill="${muted}">${t} %</text>`;
data.forEach(([r, v], i) => {
  const y = top + i * rowH, hi = r === "La Araucanía", lo = r === "Magallanes";
  svg += `<text x="${LEFT - 12}" y="${y + barH / 2 + 5}" text-anchor="end" font-size="15" font-weight="${hi ? 800 : 500}" fill="${hi ? ink : ink2}">${r}</text>`;
  const w = x(v) - x(0);
  svg += `<path d="M${x(0)},${y} h${w - 4} a4,4 0 0 1 4,4 v${barH - 8} a4,4 0 0 1 -4,4 h-${w - 4} z" fill="${blue}"/>`;
  if (hi || lo) svg += `<text x="${x(v) + 8}" y="${y + barH / 2 + 5}" font-size="15" font-weight="800" fill="${ink}">${fmt(v)} %</text>`;
});
svg += `<line x1="${x(AVG)}" x2="${x(AVG)}" y1="${top - 14}" y2="${H - 34}" stroke="${ink}" stroke-width="2" stroke-dasharray="5 4"/>`;
svg += `<text x="${x(AVG) + 6}" y="${top - 16}" font-size="14" font-weight="800" fill="${ink}">Promedio nacional: 17,3 %</text>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Nunito; src: url("file://${path.resolve(__dirname, "fonts/Nunito.ttf")}"); font-weight: 200 1000; }
body{margin:0;font-family:Nunito,sans-serif;color:${ink}} #root{width:1000px;padding:28px 32px;box-sizing:border-box;background:#fff}
h1{font-size:26px;font-weight:800;margin:0 0 4px} .sub{color:${ink2};font-size:17px;margin:0 0 18px} .note{color:${muted};font-size:14px;margin-top:6px}
</style></head><body><div id="root"><h1>La Araucanía es la región con más pobreza del país</h1>
<p class="sub">Incidencia de la pobreza por región, 2024 (% de personas)</p>
<svg width="${W}" height="${H}" font-family="Nunito">${svg}</svg>
<p class="note">Fuente: lámina "Desarrollo territorial" de la clase 4 (Soto, s.f.-c). Valores por región: ${data.map(([r, v]) => `${r} ${fmt(v)}`).join(" · ")}.</p>
</div></body></html>`;
(async () => {
  const f = path.join(process.argv[2], "pobreza-regiones.html"); fs.writeFileSync(f, html);
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 800 } });
  await p.goto("file://" + f); await p.evaluate(() => document.fonts.ready);
  await p.locator("#root").screenshot({ path: f.replace(".html", ".png") }); await b.close(); console.log("ok");
})();

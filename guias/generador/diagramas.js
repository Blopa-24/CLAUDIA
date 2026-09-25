// Genera los diagramas de la guía como PNG (HTML/SVG -> captura con Chromium).
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const path = require("path");
const OUT = process.argv[2];

const C = {
  ink: "#1f2937", ink2: "#52514e", muted: "#8a8983", line: "#d9d8d3", surface: "#ffffff",
  blue: "#2a78d6", blueT: "#e9f1fb", orange: "#eb6834", orangeT: "#fdefe8",
  aqua: "#1baf7a", aquaT: "#e5f6ef", yellow: "#eda100", yellowT: "#fdf5e2",
  violet: "#4a3aa7", violetT: "#edebf8", magenta: "#e87ba4", magentaT: "#fcedf3",
};

const css = `
@font-face { font-family: Nunito; src: url("file://${path.resolve(__dirname, "fonts/Nunito.ttf")}"); font-weight: 200 1000; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Nunito, "DejaVu Sans", sans-serif; color: ${C.ink}; background: #fff; }
#root { width: 1000px; padding: 28px 32px; background: #fff; }
h1 { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
.sub { color: ${C.ink2}; font-size: 17px; margin-bottom: 22px; }
.note { color: ${C.muted}; font-size: 14px; margin-top: 16px; }
.card { border-radius: 18px; padding: 18px 20px; }
.tag { display: inline-block; font-size: 13px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; }
`;

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div id="root">${body}</div></body></html>`;

const D = {};

// 1. Mapa del curso
D["mapa-curso"] = page(`
<h1>El curso en una idea</h1>
<p class="sub">Tres preguntas que se cruzan todo el semestre</p>
<div style="display:flex;gap:14px;align-items:stretch">
  ${[
    [C.blue, C.blueT, "Eje A", "¿Cómo actúa el Estado?", "Políticas públicas: agenda, decisión, implementación y evaluación", "Clase 2 · Lahera"],
    [C.orange, C.orangeT, "Eje B", "¿Qué interculturalidad produce?", "¿Solo reconoce la diversidad o transforma las estructuras?", "Walsh"],
    [C.aqua, C.aquaT, "Eje C", "¿Qué pasa en La Araucanía?", "Demandas mapuche, Comisión para la Paz y casos locales", "Clases 1 y 4"],
  ].map(([c, t, tag, q, d, src], i) => `
    <div class="card" style="flex:1;background:${t};border:2px solid ${c}33;position:relative">
      <span class="tag" style="background:${c};color:#fff">${tag}</span>
      <div style="font-size:23px;font-weight:800;margin:12px 0 8px;line-height:1.2">${q}</div>
      <div style="font-size:16.5px;color:${C.ink2};line-height:1.35">${d}</div>
      <div style="font-size:14px;font-weight:700;color:${c};margin-top:12px">${src}</div>
    </div>${i < 2 ? `<div style="align-self:center;font-size:30px;color:${C.muted};font-weight:800">+</div>` : ""}`).join("")}
</div>
<div class="card" style="margin-top:16px;background:#f6f6f4;display:flex;gap:14px;align-items:center">
  <div style="font-size:34px;font-weight:800;color:${C.violet}">“</div>
  <div style="font-size:18px;line-height:1.4">Una política pública puede ser <b>técnicamente correcta</b>, pero poco eficiente si desconoce la <b>diversidad cultural y territorial</b> de la población.<span style="color:${C.muted};font-size:15px"> (Soto, s.f.-a)</span></div>
</div>`);

// 2. Ciclo de políticas públicas
(() => {
  const cx = 500, cy = 305, R = 255;
  const st = [
    ["Agenda", "¿El problema entra en la agenda?", C.blue],
    ["Formulación", "¿Qué alternativas hay?", C.orange],
    ["Toma de decisión", "¿Cuál se elige y quién decide?", C.violet],
    ["Implementación", "¿Cómo se ejecuta en terreno?", C.aqua],
    ["Evaluación", "¿Funcionó? ¿Qué se corrige?", C.yellow],
  ];
  const pts = st.map((_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  const arcs = pts.map((p, i) => {
    const q = pts[(i + 1) % 5];
    const a1 = Math.atan2(p[1] - cy, p[0] - cx) + 0.36, a2 = Math.atan2(q[1] - cy, q[0] - cx) - 0.36;
    const s = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)], e = [cx + R * Math.cos(a2), cy + R * Math.sin(a2)];
    return `<path d="M${s[0]},${s[1]} A${R},${R} 0 0 1 ${e[0]},${e[1]}" fill="none" stroke="${C.line}" stroke-width="5" marker-end="url(#arr)"/>`;
  }).join("");
  const nodes = pts.map(([x, y], i) => `
    <g><rect x="${x - 112}" y="${y - 40}" width="224" height="80" rx="20" fill="${st[i][2]}"/>
    <text x="${x}" y="${y - 6}" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">${i + 1}. ${st[i][0]}</text>
    <text x="${x}" y="${y + 20}" text-anchor="middle" font-size="13.5" font-weight="600" fill="#fff">${st[i][1]}</text></g>`).join("");
  D["ciclo-politicas"] = page(`
<h1>El ciclo de las políticas públicas</h1>
<p class="sub">Una herramienta para ordenar el análisis, no una receta que siempre se cumple en orden</p>
<svg width="936" height="575" viewBox="32 0 936 575" font-family="Nunito">
  <defs><marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.line}"/></marker></defs>
  ${arcs}
  <circle cx="${cx}" cy="${cy}" r="96" fill="#f6f6f4"/>
  <text x="${cx}" y="${cy - 28}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${C.muted}" letter-spacing="1">EN TODAS LAS ETAPAS</text>
  <text x="${cx}" y="${cy + 2}" text-anchor="middle" font-size="21" font-weight="800" fill="${C.ink}">Actores</text>
  <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-size="21" font-weight="800" fill="${C.ink}">Análisis</text>
  <text x="${cx}" y="${cy + 54}" text-anchor="middle" font-size="21" font-weight="800" fill="${C.ink}">Modelos</text>
  ${nodes}
</svg>
<p class="note">Basado en Howlett, Ramesh y Perl (2009), como se citó en Soto (s.f.-b). Lahera (2004) agrupa el proceso en cuatro momentos: origen, diseño, gestión y evaluación.</p>`);
})();

// 3. Tres miradas de interculturalidad
D["tres-miradas"] = page(`
<h1>Tres maneras de entender la interculturalidad</h1>
<p class="sub">Walsh (2009) las distingue según cuánto cambian las estructuras de poder</p>
<div style="display:flex;gap:14px;align-items:flex-end">
  ${[
    [C.blue, C.blueT, "Relacional", 250, "Hay contacto entre culturas", "Siempre ha existido: mestizaje, sincretismos.", "Su problema: esconde el poder y el conflicto."],
    [C.orange, C.orangeT, "Funcional", 330, "Se reconoce la diversidad y se incluye en lo que ya existe", "Promueve diálogo y tolerancia. Se hace desde arriba.", "Su problema: no toca las causas de la desigualdad y encaja con el modelo neoliberal."],
    [C.aqua, C.aquaT, "Crítica", 410, "Se transforman las estructuras que producen la desigualdad", "Se construye desde abajo, desde la gente, e interpela a toda la sociedad.", "Todavía no existe: es un proyecto por construir."],
  ].map(([c, t, name, h, big, d1, d2]) => `
    <div class="card" style="flex:1;height:${h}px;background:${t};border-top:8px solid ${c};display:flex;flex-direction:column">
      <span class="tag" style="background:${c};color:#fff;align-self:flex-start">${name}</span>
      <div style="font-size:20px;font-weight:800;margin:12px 0 10px;line-height:1.25">${big}</div>
      <div style="font-size:15.5px;color:${C.ink2};line-height:1.4">${d1}</div>
      <div style="font-size:15.5px;color:${C.ink};line-height:1.4;margin-top:auto;font-weight:700">${d2}</div>
    </div>`).join("")}
</div>
<div style="display:flex;align-items:center;gap:10px;margin-top:14px;color:${C.ink2};font-size:16px;font-weight:700">
  <div style="flex:1;height:4px;background:linear-gradient(90deg,${C.blue},${C.orange},${C.aqua});border-radius:4px"></div>
  <div>más transformación de las estructuras →</div>
</div>
<p class="note">Walsh (2009, sección 1); la perspectiva funcional sigue a Tubino (2005), como se citó en Walsh (2009).</p>`);

// 4. Línea de tiempo de la educación intercultural
D["linea-tiempo"] = page(`
<h1>La interculturalidad en la educación: un recorrido</h1>
<p class="sub">Según Walsh (2009), casi todo este camino fue funcional; la apuesta crítica aparece recién al final</p>
<div style="position:relative;padding-top:10px">
  <div style="position:absolute;left:20px;right:20px;top:58px;height:6px;background:${C.line};border-radius:3px"></div>
  <div style="display:flex;gap:12px;position:relative">
  ${[
    [C.blue, "1982", "EIB", "En México se cambia “bilingüe bicultural” por “intercultural bilingüe”."],
    [C.blue, "Años 80-90", "EIB oficial", "Se vuelve derecho y programa estatal: un “cuchillo de doble filo”."],
    [C.orange, "Años 90", "Re-formas", "Constituciones multiculturales. La interculturalidad queda como “eje transversal”, sin mayor cambio."],
    [C.orange, "Años 2000", "Desarrollo humano y cohesión social", "Un “interculturalismo funcional ya madurado”. Universidades interculturales en México (2003)."],
    [C.aqua, "2008-2009", "Ecuador y Bolivia", "Nuevas constituciones que apuntan a refundar y descolonizar la educación."],
  ].map(([c, y, t, d]) => `
    <div style="flex:1;text-align:center">
      <div style="font-size:18px;font-weight:800;color:${c};height:30px">${y}</div>
      <div style="width:26px;height:26px;border-radius:50%;background:${c};border:5px solid #fff;margin:6px auto 12px;box-shadow:0 0 0 2px ${c}"></div>
      <div class="card" style="background:#f6f6f4;padding:14px 12px;text-align:left;min-height:190px">
        <div style="font-size:17.5px;font-weight:800;margin-bottom:6px;line-height:1.2">${t}</div>
        <div style="font-size:14.5px;color:${C.ink2};line-height:1.4">${d}</div>
      </div>
    </div>`).join("")}
  </div>
</div>
<div style="display:flex;gap:22px;margin-top:14px;font-size:14.5px;color:${C.ink2};font-weight:700">
  <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${C.blue};margin-right:6px"></span>Origen de la EIB</span>
  <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${C.orange};margin-right:6px"></span>Etapas funcionales</span>
  <span><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${C.aqua};margin-right:6px"></span>Apuesta de refundación</span>
</div>
<p class="note">Walsh (2009, secciones 2.1, 2.2 y 2.3). Walsh advierte que los casos de Ecuador y Bolivia también tienen “problemas y contradicciones”.</p>`);

// 5. Matriz de la colonialidad
D["colonialidad"] = page(`
<h1>Las cuatro caras de la colonialidad</h1>
<p class="sub">La “matriz cuatri-dimensionada” con la que Walsh (2009) explica la diferencia colonial</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
  ${[
    [C.blue, C.blueT, "Del poder", "Clasifica a las personas por “raza” y las ordena en una jerarquía ligada al capitalismo.", "Quijano (2000)"],
    [C.orange, C.orangeT, "Del saber", "Solo el conocimiento europeo cuenta como “ciencia”; lo demás es “creencia”.", "Quijano (2000)"],
    [C.violet, C.violetT, "Del ser", "Niega la humanidad plena de los pueblos colonizados: la deshumanización racial.", "Maldonado-Torres (2007)"],
    [C.aqua, C.aquaT, "Cosmológica", "Separa ser humano y naturaleza, y trata como “primitiva” la relación espiritual con la tierra y los ancestros.", "Walsh (2009)"],
  ].map(([c, t, n, d, a]) => `
    <div class="card" style="background:${t};border-left:8px solid ${c}">
      <div style="font-size:14px;font-weight:800;color:${c};letter-spacing:.06em">COLONIALIDAD</div>
      <div style="font-size:24px;font-weight:800;margin:2px 0 8px">${n}</div>
      <div style="font-size:16.5px;line-height:1.4">${d}</div>
      <div style="font-size:14px;color:${C.muted};margin-top:8px;font-weight:700">${a}</div>
    </div>`).join("")}
</div>
<p class="note">Quijano (2000) y Maldonado-Torres (2007), como se citaron en Walsh (2009, sección 3).</p>`);

// 6. Comisión para la Paz y el Entendimiento
D["comision"] = page(`
<h1>Comisión para la Paz y el Entendimiento (2023)</h1>
<p class="sub">Una instancia de diálogo para identificar las causas del conflicto y buscar acuerdos de largo plazo</p>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">
  ${[
    [C.blue, "Justicia y reconocimiento", "Reconocimiento constitucional, pedido con fuerza desde 1989"],
    [C.orange, "Tierras", "De 10 millones a 500 mil hectáreas"],
    [C.violet, "Reparación a víctimas", "Inseguridad, miedo y pérdida de presencia del Estado"],
    [C.aqua, "Desarrollo territorial", "La Araucanía, la región más pobre del país"],
    [C.yellow, "Institucionalidad", "Acción dispersa: CONADI y varios ministerios"],
  ].map(([c, n, d], i) => `
    <div class="card" style="background:#f6f6f4;border-top:8px solid ${c};padding:16px 14px">
      <div style="width:40px;height:40px;border-radius:50%;background:${c};color:#fff;font-weight:800;font-size:21px;display:flex;align-items:center;justify-content:center">${i + 1}</div>
      <div style="font-size:18.5px;font-weight:800;margin:10px 0 6px;line-height:1.2">${n}</div>
      <div style="font-size:14.5px;color:${C.ink2};line-height:1.35">${d}</div>
    </div>`).join("")}
</div>
<div class="card" style="margin-top:14px;background:${C.violetT};display:flex;gap:18px;align-items:center">
  <div style="font-size:52px;font-weight:800;color:${C.violet};line-height:1">430</div>
  <div style="font-size:17px;line-height:1.4"><b>representantes en el mapa de actores</b>: sector público, comunidades mapuche, sector privado, sociedad civil, academia y organismos internacionales. Es un ejemplo de <b>gobernanza</b> (Mayntz, 2001).</div>
</div>
<p class="note">Soto (s.f.-c); Mayntz (2001), como se citó en Soto (s.f.-c).</p>`);

// 7. Números clave
D["numeros"] = page(`
<h1>Los números que tienes que saber</h1>
<p class="sub">Datos de la clase 4 que conviene citar en la prueba</p>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
  ${[
    ["1989", "Acuerdo de Nueva Imperial: desde ahí se impulsa el reconocimiento constitucional"],
    ["1997", "Punto de inflexión: el conflicto territorial aumenta y se intensifica"],
    ["2023", "Se crea la Comisión para la Paz y el Entendimiento"],
    ["430", "Representantes en el mapa de actores de la Comisión"],
    ["10 mill. → 500 mil", "Hectáreas mapuche antes y después de la “Pacificación”"],
    ["62 %", "Del presupuesto de CONADI se destina a comprar tierras"],
    ["28,6 %", "Pobreza en La Araucanía (2024), la más alta del país"],
    ["11", "Pueblos indígenas reconocidos por la Ley 19.253"],
  ].map(([n, d]) => `
    <div class="card" style="background:#f6f6f4;padding:16px">
      <div style="font-size:${n.length > 8 ? 22 : 36}px;font-weight:800;color:${C.ink};line-height:1.1;min-height:42px">${n}</div>
      <div style="font-size:14.5px;color:${C.ink2};margin-top:8px;line-height:1.35">${d}</div>
    </div>`).join("")}
</div>
<p class="note">Fuente: Soto (s.f.-c).</p>`);

// 8. Top-down y bottom-up
D["implementacion"] = page(`
<h1>Dos formas de mirar la implementación</h1>
<p class="sub">La diferencia está en desde dónde miras y qué consideras un problema</p>
<div style="display:flex;gap:16px">
  ${[
    [C.blue, C.blueT, "Top-down", "↓", "De arriba hacia abajo", "Autoridad que diseña", "Territorio", "¿Se está haciendo lo que se decidió?", "Objetivos · estándares · recursos · dirección política · comunicación jerárquica", "La desviación es un error que hay que corregir."],
    [C.aqua, C.aquaT, "Bottom-up", "↑", "De abajo hacia arriba", "Burócratas de calle y usuarios", "La política", "¿Cómo se adapta la política a la realidad local?", "Discrecionalidad · adaptación · contexto local · experiencia con los usuarios", "La desviación es una adaptación que hay que entender (Lipsky)."],
  ].map(([c, t, n, arrow, sub, from, to, q, els, dev]) => `
    <div class="card" style="flex:1;background:${t}">
      <span class="tag" style="background:${c};color:#fff">${n}</span>
      <div style="font-size:15px;color:${C.ink2};margin-top:6px;font-weight:700">${sub}</div>
      <div style="display:flex;align-items:center;gap:14px;margin:14px 0">
        <div style="font-size:64px;font-weight:800;color:${c};line-height:1">${arrow}</div>
        <div style="font-size:16px;line-height:1.5"><b>Parte en:</b> ${from}<br><b>Mira hacia:</b> ${to}</div>
      </div>
      <div style="font-size:20px;font-weight:800;line-height:1.25;margin-bottom:8px">${q}</div>
      <div style="font-size:15px;color:${C.ink2};line-height:1.4;margin-bottom:8px">${els}</div>
      <div style="font-size:15.5px;font-weight:700">${dev}</div>
    </div>`).join("")}
</div>
<p class="note">Soto (s.f.-b); Lipsky (1980), como se citó en Soto (s.f.-b).</p>`);

(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--allow-file-access-from-files"] }).catch(() => chromium.launch());
  const page_ = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 800 } });
  for (const [name, html] of Object.entries(D)) {
    const f = path.join(OUT, `${name}.html`);
    require("fs").writeFileSync(f, html);
    await page_.goto("file://" + f);
    await page_.evaluate(() => document.fonts.ready);
    await page_.locator("#root").screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log("ok", name);
  }
  await browser.close();
})();

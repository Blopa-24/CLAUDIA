# Generador de guías

Scripts que producen la guía en Word a partir del Markdown de `guias/`.

1. `node diagramas.js ../img` y `node grafico.js ../img` dibujan los diagramas y el gráfico en PNG (requieren Playwright con Chromium).
2. `node md2docx.js ../guia-01-gestion-publica-intercultural.md ../guia-01-gestion-publica-intercultural.docx` arma el Word (requiere `npm install docx marked`).

Marcas que entiende `md2docx.js` en el Markdown:

- `> [!TIP]`, `[!WARNING]`, `[!NOTE]`, `[!IMPORTANT]`, `[!TUTOR]`, `[!QUESTION]` y `[!EXAMPLE]`, seguidos de un título opcional: recuadros de color.
- `<!-- cards -->` antes de una tabla: cada columna se vuelve una tarjeta.
- `<!-- pagebreak -->`: salto de página.
- `![texto](img/x.png "80")`: imagen al 80 % del ancho.
- `# Parte N · Título`: banner de color de la parte.

La tipografía Nunito (licencia SIL Open Font) se usa solo en las imágenes.

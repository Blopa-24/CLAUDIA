---
name: markitdown
description: Convierte documentos a Markdown con markitdown de Microsoft (PDF, Word .docx, Excel .xlsx/.xls, PowerPoint .pptx, HTML, CSV, JSON, XML, EPUB, ZIP, imágenes y audio con metadatos). Úsala cuando el usuario quiera pasar un archivo a Markdown, extraer el texto de un documento para leerlo, resumirlo o analizarlo, o preparar documentos como entrada para un LLM. Triggers: "markitdown", "convertir a markdown", "pasar a .md", "extraer texto de", "convert to markdown", "document to markdown".
---

# markitdown

[markitdown](https://github.com/microsoft/markitdown) convierte muchos formatos de archivo a Markdown y conserva la estructura: títulos, listas, tablas y enlaces.

## 1. Asegurar la instalación

Antes de convertir, ejecuta el script de la skill. Si markitdown ya está instalado no hace nada; si no, lo instala:

```bash
bash .claude/skills/markitdown/scripts/ensure_markitdown.sh
```

Instala `markitdown[all]`, que incluye los conversores de PDF, DOCX, XLSX, PPTX y los demás formatos. El `markitdown` base solo trae HTML, CSV y texto, y con los otros formatos falla. El script también instala `cffi`: sin él, en contenedores Debian/Ubuntu markitdown falla al importar con `No module named '_cffi_backend'`.

## 2. Convertir

### Línea de comandos (lo más simple)

```bash
markitdown documento.pdf                  # imprime Markdown por stdout
markitdown documento.docx -o documento.md  # guarda en un archivo
cat archivo | markitdown -x pdf            # desde stdin: -x indica la extensión
```

### Varios archivos

```bash
for f in docs/*.{pdf,docx,xlsx,pptx}; do
  [ -e "$f" ] && markitdown "$f" -o "${f%.*}.md"
done
```

### Desde Python

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("informe.xlsx")   # también acepta URLs
print(result.text_content)
```

## 3. Qué esperar según el formato

| Formato | Resultado |
| --- | --- |
| DOCX | Títulos, párrafos, listas y tablas en Markdown |
| XLSX / XLS | Una sección `## <hoja>` por hoja, cada una con su tabla |
| PPTX | Una sección por diapositiva, con títulos, texto y notas |
| PDF | Solo texto: pierde casi todo el formato y no aplica OCR |
| HTML | Markdown limpio, sin scripts ni estilos |
| Imágenes / audio | Solo metadatos EXIF, salvo que se configure un LLM o la transcripción |

## Notas

- **PDF escaneado:** si el PDF es una imagen, markitdown no devuelve texto. En ese caso usa la skill `pdf`, que hace OCR.
- **Revisa siempre la salida de un PDF.** Con diapositivas exportadas a PDF y con texto justificado, markitdown suele convertir los párrafos en tablas falsas (`| El | Estado | no | ...`). También puede dejar basura como `(cid:2)`, números de página y encabezados repetidos. Si pasa, extrae con PyMuPDF (`pip install pymupdf`; `page.get_text("dict")` da el tamaño de letra de cada línea, útil para separar títulos, cuerpo y notas al pie). Las diapositivas conviene transcribirlas a mano, mirando cada lámina como imagen (`page.get_pixmap()`).
- **Archivos grandes:** redirige la salida a un `.md` y lee por partes. No vuelques un documento enorme en la conversación.
- **Documentos de Word/Excel/PowerPoint:** para *leer o resumir* un documento, markitdown es lo más rápido. Para *editar o crear* archivos de Office, usa las skills `docx`, `xlsx` o `pptx`.
- Las opciones `-d` (Azure Document Intelligence) y `--use-cu` requieren endpoints de Azure. No las uses salvo que el usuario las pida.

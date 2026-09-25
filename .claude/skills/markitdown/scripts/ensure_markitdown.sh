#!/usr/bin/env bash
# Instala markitdown con todos los conversores si no está disponible o está roto.
set -euo pipefail

if markitdown --version >/dev/null 2>&1 && python3 -c "import mammoth, pdfminer, openpyxl, pptx" >/dev/null 2>&1; then
  echo "markitdown listo: $(markitdown --version)"
  exit 0
fi

pip install -q 'markitdown[all]'
# En imágenes Debian/Ubuntu, el paquete cryptography del sistema necesita cffi;
# sin él markitdown falla al importar con "No module named '_cffi_backend'".
pip install -q cffi

markitdown --version

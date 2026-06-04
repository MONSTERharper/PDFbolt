#!/usr/bin/env bash
# Verify PDFbolt runtime dependencies before starting the JVM.
set -euo pipefail

log() { printf '[pdfbolt] %s\n' "$*"; }
warn() { printf '[pdfbolt] WARNING: %s\n' "$*" >&2; }
fail() { printf '[pdfbolt] ERROR: %s\n' "$*" >&2; exit 1; }

LO_CMD="${LIBREOFFICE_COMMAND:-soffice}"
GS_CMD="${GHOSTSCRIPT_COMMAND:-gs}"
VP_CMD="${VERAPDF_COMMAND:-verapdf}"
PDFA_VALIDATE="${PDFA_VALIDATE:-true}"

check_cmd() {
  local label="$1"
  local cmd="$2"
  shift 2
  if command -v "${cmd}" >/dev/null 2>&1; then
    if "${cmd}" "$@" >/dev/null 2>&1; then
      log "${label}: OK ($(command -v "${cmd}"))"
      return 0
    fi
    fail "${label}: '${cmd}' is on PATH but failed to run (${*})."
  fi
  fail "${label}: '${cmd}' not found on PATH. Rebuild the image or set the correct *_COMMAND in .env."
}

mkdir -p /tmp/.config /tmp/.cache
export HOME="${HOME:-/tmp}"

log "Checking runtime prerequisites…"
check_cmd "LibreOffice" "${LO_CMD}" --version
check_cmd "Ghostscript" "${GS_CMD}" --version

if command -v fc-list >/dev/null 2>&1; then
  FONT_COUNT="$(fc-list 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "${FONT_COUNT}" -gt 0 ]]; then
    log "Fontconfig: OK (${FONT_COUNT} fonts registered)"
  else
    warn "Fontconfig reports no fonts — PDF text replacement may fall back to embedded fonts only."
  fi
else
  warn "fc-list not available — font substitution may be limited."
fi

if [[ "${PDFA_VALIDATE}" == "true" ]] || [[ "${PDFA_VALIDATE}" == "1" ]]; then
  if command -v "${VP_CMD}" >/dev/null 2>&1; then
    log "veraPDF: OK ($(command -v "${VP_CMD}"))"
  else
    warn "veraPDF not on PATH (${VP_CMD}). pdf-to-pdfa will still run via Ghostscript but ISO validation will be skipped."
  fi
else
  log "veraPDF: skipped (PDFA_VALIDATE=${PDFA_VALIDATE})"
fi

PDF_DXF_PY="${PDF_DXF_PYTHON:-python3}"
PDF_DXF_SCRIPT="${PDF_DXF_SCRIPT:-/app/scripts/pdf_to_dxf.py}"
if [[ -f "${PDF_DXF_SCRIPT}" ]] && command -v "${PDF_DXF_PY}" >/dev/null 2>&1 \
    && "${PDF_DXF_PY}" -c "import ezdxf, fitz" >/dev/null 2>&1; then
  log "PDF to DXF: OK (${PDF_DXF_PY} + ${PDF_DXF_SCRIPT})"
else
  warn "PDF to DXF not ready — install Python 3, ezdxf, PyMuPDF, and pdf_to_dxf.py for pdf-to-dxf."
fi

JAVA_OPTS="${JAVA_OPTS:--Xms128m -Xmx512m}"
log "Starting PDFbolt (JAVA_OPTS=${JAVA_OPTS})…"
exec java ${JAVA_OPTS} -jar /app/app.jar

#!/usr/bin/env bash
# Install PDF → DXF runtime: Ghostscript + Python (ezdxf, PyMuPDF).
# Run from repo root: ./scripts/install-pdf-dxf-deps.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

log() { printf '==> %s\n' "$*"; }
warn() { printf 'warning: %s\n' "$*" >&2; }

PYTHON="${PDF_DXF_PYTHON:-python3}"
REQ="${REPO_ROOT}/scripts/requirements-dxf.txt"
SCRIPT="${REPO_ROOT}/scripts/pdf_to_dxf.py"

if ! command -v "${PYTHON}" >/dev/null 2>&1; then
  echo "Python 3 not found. Install Python 3.10+ and retry." >&2
  exit 1
fi

install_ghostscript() {
  if command -v gs >/dev/null 2>&1; then
    log "Ghostscript already installed: $(command -v gs)"
    gs --version | head -1
    return
  fi
  if command -v apt-get >/dev/null 2>&1; then
    log "Installing Ghostscript (apt)…"
    sudo apt-get update -qq
    sudo apt-get install -y --no-install-recommends ghostscript
  elif command -v dnf >/dev/null 2>&1; then
    log "Installing Ghostscript (dnf)…"
    sudo dnf install -y ghostscript
  elif command -v brew >/dev/null 2>&1; then
    log "Installing Ghostscript (Homebrew)…"
    brew install ghostscript
  else
    warn "Install Ghostscript manually (gs must be on PATH)."
    exit 1
  fi
}

install_ghostscript

log "Installing Python packages from requirements-dxf.txt…"
if "${PYTHON}" -m pip install --user -r "${REQ}" 2>/dev/null; then
  :
elif "${PYTHON}" -m pip install --break-system-packages -r "${REQ}" 2>/dev/null; then
  :
else
  sudo "${PYTHON}" -m pip install -r "${REQ}"
fi

chmod +x "${SCRIPT}"

log "Verify imports…"
"${PYTHON}" -c "import ezdxf, fitz; print('ezdxf + PyMuPDF OK')"

ENV_FILE="${REPO_ROOT}/.env"
EXAMPLE="${REPO_ROOT}/.env.example"
if [[ ! -f "${ENV_FILE}" && -f "${EXAMPLE}" ]]; then
  cp "${EXAMPLE}" "${ENV_FILE}"
  log "Created ${ENV_FILE} from .env.example"
fi

set_kv() {
  local key="$1"
  local value="$2"
  if [[ ! -f "${ENV_FILE}" ]]; then
    printf '%s=%s\n' "${key}" "${value}" >> "${ENV_FILE}.local"
    return
  fi
  if grep -q "^${key}=" "${ENV_FILE}" 2>/dev/null; then
    if [[ "$(uname)" == Darwin ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
    else
      sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
    fi
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${ENV_FILE}"
  fi
}

if [[ -f "${ENV_FILE}" ]]; then
  set_kv "PDF_DXF_PYTHON" "${PYTHON}"
  set_kv "PDF_DXF_SCRIPT" "scripts/pdf_to_dxf.py"
  set_kv "GHOSTSCRIPT_COMMAND" "$(command -v gs)"
  log "Updated ${ENV_FILE} (PDF_DXF_*, GHOSTSCRIPT_COMMAND)"
else
  warn "No .env — set PDF_DXF_SCRIPT=scripts/pdf_to_dxf.py and GHOSTSCRIPT_COMMAND=$(command -v gs)"
fi

log ""
log "PDF to DXF ready. Restart the API if it is already running."
log "  curl -s http://localhost:8080/api/health | jq .dependencies.pdfToDxf"

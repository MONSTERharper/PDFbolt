#!/usr/bin/env bash
# Merge AdSense settings into repo-root .env (for Docker --env-file).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-${REPO_ROOT}/.env}"
EXAMPLE="${REPO_ROOT}/.env.example"

log() { printf '==> %s\n' "$*"; }

if [[ ! -f "${ENV_FILE}" ]]; then
  if [[ -f "${EXAMPLE}" ]]; then
    cp "${EXAMPLE}" "${ENV_FILE}"
    log "Created ${ENV_FILE} from .env.example"
  else
    touch "${ENV_FILE}"
  fi
fi

set_kv() {
  local key="$1"
  local value="$2"
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

CLIENT="${ADSENSE_CLIENT:-ca-pub-3054286166063522}"
ENABLED="${ADSENSE_ENABLED:-true}"
ADS_TXT="${ADSENSE_ADS_TXT_LINE:-google.com, pub-3054286166063522, DIRECT, f08c47fec0942fa0}"

SLOT="${ADSENSE_BANNER_SLOT:-5459265290}"
if [[ -z "${SLOT}" && -t 0 ]]; then
  printf 'Paste AdSense banner slot ID (Ads → By ad unit → data-ad-slot), or Enter to skip: '
  read -r SLOT
fi
SLOT="$(echo "${SLOT}" | tr -d '[:space:]')"

set_kv "ADSENSE_ENABLED" "${ENABLED}"
set_kv "ADSENSE_CLIENT" "${CLIENT}"
set_kv "ADSENSE_BANNER_SLOT" "${SLOT}"
set_kv "ADSENSE_ADS_TXT_LINE" "${ADS_TXT}"

log "Updated ${ENV_FILE}"
log "  ADSENSE_ENABLED=${ENABLED}"
log "  ADSENSE_CLIENT=${CLIENT}"
log "  ADSENSE_BANNER_SLOT=${SLOT:-<empty — mocks until set>}"
log ""
log "Deploy:"
log "  sudo docker build -t pdfbolt:latest ."
log "  sudo docker stop pdfbolt 2>/dev/null; sudo docker rm pdfbolt 2>/dev/null"
log "  sudo docker run -d --restart always --env-file ${ENV_FILE} -p 8080:8080 --name pdfbolt pdfbolt:latest"
log ""
log "Verify:"
log "  curl -sS http://127.0.0.1:8080/ads.txt"
log "  curl -sS http://127.0.0.1:8080/api/public/ads-config"

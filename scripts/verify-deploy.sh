#!/usr/bin/env bash
# Pre-deploy verification: host build (optional) + Docker build + smoke test.
#
# EC2 Docker deploy (no Node/Maven on host):
#   ./scripts/verify-deploy.sh
#
# Full host + Docker check (dev machine with Node 20+ and Maven):
#   SKIP_HOST_BUILD=false ./scripts/verify-deploy.sh
#
# Docker image build only (skip smoke test):
#   RUN_SMOKE_TEST=false ./scripts/verify-deploy.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

RUN_DOCKER="${RUN_DOCKER:-auto}"
RUN_SMOKE_TEST="${RUN_SMOKE_TEST:-true}"
SKIP_HOST_BUILD="${SKIP_HOST_BUILD:-auto}"
IMAGE_TAG="${IMAGE_TAG:-pdfbolt:latest}"
SMOKE_PORT="${SMOKE_PORT:-18080}"

log() { printf '==> %s\n' "$*"; }
warn() { printf 'warning: %s\n' "$*" >&2; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

DOCKER=(docker)

has_cmd() { command -v "$1" >/dev/null 2>&1; }

if [[ "${RUN_DOCKER}" == "auto" ]]; then
  if has_cmd docker && docker info >/dev/null 2>&1; then
    RUN_DOCKER=true
  elif has_cmd docker && sudo docker info >/dev/null 2>&1; then
    DOCKER=(sudo docker)
    RUN_DOCKER=true
  else
    RUN_DOCKER=false
    log "Docker not found or daemon not running — skipping image build."
  fi
fi

if [[ "${SKIP_HOST_BUILD}" == "auto" ]]; then
  if [[ "${RUN_DOCKER}" == "true" ]]; then
    SKIP_HOST_BUILD=true
  else
    SKIP_HOST_BUILD=false
  fi
fi

if [[ "${SKIP_HOST_BUILD}" == "true" ]]; then
  if [[ "${RUN_DOCKER}" != "true" ]]; then
    fail "SKIP_HOST_BUILD=true requires Docker. Install Docker or set SKIP_HOST_BUILD=false with Node + Maven on PATH."
  fi
  log "Skipping host UI/JAR build (Docker image compiles frontend + backend)"
else
  has_cmd npm || fail "npm not found. Install Node 20+, or deploy with Docker only: ./scripts/verify-deploy.sh"
  has_cmd mvn || fail "mvn not found. Install Maven, or deploy with Docker only: ./scripts/verify-deploy.sh"

  log "Frontend tests"
  (cd new-ui && npm ci --silent && npm test -- --run)

  log "Frontend production build"
  (cd new-ui && npm run build)

  log "Verify static UI assets referenced by index.html"
  INDEX="${REPO_ROOT}/src/main/resources/static/app/index.html"
  [[ -f "${INDEX}" ]] || fail "Missing ${INDEX}"
  while IFS= read -r rel; do
    path="${REPO_ROOT}/src/main/resources/static/app/${rel#\/app\/}"
    [[ -f "${path}" ]] || fail "Missing built asset: ${path} (referenced in index.html)"
  done < <(grep -oE '/app/assets/[^"'\'' ]+' "${INDEX}" | sort -u)

  log "Backend tests"
  mvn -q test

  log "Backend package"
  mvn -q -DskipTests package
  JAR="${REPO_ROOT}/target/bolt-replacer-1.5.0.jar"
  [[ -f "${JAR}" ]] || fail "Expected ${JAR}"
  unzip -p "${JAR}" BOOT-INF/classes/pdfbolt-version.properties 2>/dev/null | grep -q 'version=1.5.0' \
    || fail "JAR pdfbolt-version.properties is not 1.5.0"

  log "AdSense endpoints in JAR"
  unzip -p "${JAR}" BOOT-INF/classes/com/pdfreplace/AdsTxtController.class >/dev/null 2>&1 \
    || unzip -l "${JAR}" | grep -q AdsTxtController \
    || fail "JAR missing AdsTxtController"
  unzip -p "${JAR}" BOOT-INF/classes/com/pdfreplace/AdsensePublicController.class >/dev/null 2>&1 \
    || unzip -l "${JAR}" | grep -q AdsensePublicController \
    || fail "JAR missing AdsensePublicController"
fi

log "Docker entrypoint present"
ENTRY="${REPO_ROOT}/scripts/docker-entrypoint.sh"
[[ -f "${ENTRY}" ]] || fail "Missing ${ENTRY}"
chmod +x "${ENTRY}"
[[ -f "${REPO_ROOT}/scripts/pdf_to_dxf.py" ]] || fail "Missing scripts/pdf_to_dxf.py"
[[ -f "${REPO_ROOT}/scripts/requirements-dxf.txt" ]] || fail "Missing scripts/requirements-dxf.txt"
CONFIGURE="${REPO_ROOT}/scripts/configure-adsense.sh"
[[ -f "${CONFIGURE}" ]] || fail "Missing ${CONFIGURE}"
chmod +x "${CONFIGURE}"

if [[ "${RUN_DOCKER}" == "true" ]]; then
  log "Docker build (${IMAGE_TAG}) — first build may take 15–25 minutes"
  "${DOCKER[@]}" build -t "${IMAGE_TAG}" .

  if [[ "${RUN_SMOKE_TEST}" == "true" ]]; then
    has_cmd curl || fail "curl required for smoke test (or set RUN_SMOKE_TEST=false)"

    log "Docker smoke test on port ${SMOKE_PORT}"
    CID=""
    cleanup() {
      if [[ -n "${CID}" ]]; then
        "${DOCKER[@]}" rm -f "${CID}" >/dev/null 2>&1 || true
      fi
    }
    trap cleanup EXIT

    CID="$("${DOCKER[@]}" run -d --rm -p "${SMOKE_PORT}:8080" \
      -e JAVA_OPTS=-Xms128m -Xmx384m \
      -e CONTACT_LOG_ONLY=true \
      -e ADSENSE_ENABLED=true \
      -e ADSENSE_CLIENT=ca-pub-3054286166063522 \
      -e ADSENSE_BANNER_SLOT=0000000000 \
      "${IMAGE_TAG}")"

    for i in $(seq 1 90); do
      if curl -fsS "http://127.0.0.1:${SMOKE_PORT}/api/health" 2>/dev/null | grep -q '"ready":true'; then
        log "Health check OK"
        curl -fsS "http://127.0.0.1:${SMOKE_PORT}/api/health" | grep -q '"version":"1.5.0"' \
          || fail "Health API version is not 1.5.0"
        curl -fsS "http://127.0.0.1:${SMOKE_PORT}/ads.txt" | grep -q 'pub-3054286166063522' \
          || fail "ads.txt missing publisher line"
        curl -fsS "http://127.0.0.1:${SMOKE_PORT}/api/public/ads-config" | grep -q '"enabled":true' \
          || fail "ads-config endpoint failed"
        break
      fi
      if [[ "${i}" -eq 90 ]]; then
        "${DOCKER[@]}" logs "${CID}" 2>&1 | tail -40
        fail "Container did not become healthy within 3 minutes"
      fi
      sleep 2
    done

    "${DOCKER[@]}" logs "${CID}" 2>&1 | grep -E 'LibreOffice: OK|Ghostscript: OK' \
      || fail "Container logs missing LibreOffice/Ghostscript OK"
    "${DOCKER[@]}" logs "${CID}" 2>&1 | grep -q 'PDF to DXF: OK' \
      || fail "Container logs missing PDF to DXF OK (check Python/ezdxf in image)"
    curl -fsS "http://127.0.0.1:${SMOKE_PORT}/api/health" | grep -q '"pdfToDxf":true' \
      || fail "Health API pdfToDxf is not true"
  else
    log "Skipping smoke test (RUN_SMOKE_TEST=false)"
  fi
else
  warn "Docker not available — host build checks only. Install Docker on EC2 for production deploy."
fi

log ""
log "All checks passed. Deploy with:"
log "  ./scripts/configure-adsense.sh   # paste AdSense banner slot into .env"
log "  cp .env.example .env   # edit SMTP_*, JAVA_OPTS"
log "  sudo docker build -t pdfbolt:1.5.0 -t pdfbolt:latest ."
log "  sudo docker run -d --restart always --env-file .env -p 8080:8080 --name pdfbolt pdfbolt:latest"

#!/usr/bin/env bash
# Pre-deploy verification: tests, UI build, JAR package, optional Docker build + smoke test.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

RUN_DOCKER="${RUN_DOCKER:-auto}"
IMAGE_TAG="${IMAGE_TAG:-pdfbolt:latest}"
SMOKE_PORT="${SMOKE_PORT:-18080}"

log() { printf '==> %s\n' "$*"; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

if [[ "${RUN_DOCKER}" == "auto" ]]; then
  if command -v docker >/dev/null 2>&1; then
    RUN_DOCKER=true
  else
    RUN_DOCKER=false
    log "Docker not found — skipping image build (set RUN_DOCKER=true on a machine with Docker)."
  fi
fi

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

log "Docker entrypoint present"
ENTRY="${REPO_ROOT}/scripts/docker-entrypoint.sh"
[[ -f "${ENTRY}" ]] || fail "Missing ${ENTRY}"
chmod +x "${ENTRY}"
CONFIGURE="${REPO_ROOT}/scripts/configure-adsense.sh"
[[ -f "${CONFIGURE}" ]] || fail "Missing ${CONFIGURE}"
chmod +x "${CONFIGURE}"

if [[ "${RUN_DOCKER}" == "true" ]]; then
  log "Docker build (${IMAGE_TAG})"
  docker build -t "${IMAGE_TAG}" .

  log "Docker smoke test on port ${SMOKE_PORT}"
  CID=""
  cleanup() {
    if [[ -n "${CID}" ]]; then
      docker rm -f "${CID}" >/dev/null 2>&1 || true
    fi
  }
  trap cleanup EXIT

  CID="$(docker run -d --rm -p "${SMOKE_PORT}:8080" \
    -e JAVA_OPTS=-Xms128m -Xmx384m \
    -e CONTACT_LOG_ONLY=true \
    -e ADSENSE_ENABLED=true \
    -e ADSENSE_CLIENT=ca-pub-3054286166063522 \
    -e ADSENSE_BANNER_SLOT=0000000000 \
    "${IMAGE_TAG}")"

  for i in $(seq 1 60); do
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
    if [[ "${i}" -eq 60 ]]; then
      docker logs "${CID}" 2>&1 | tail -40
      fail "Container did not become healthy within 60s"
    fi
    sleep 2
  done

  docker logs "${CID}" 2>&1 | grep -E 'LibreOffice: OK|Ghostscript: OK' \
    || fail "Container logs missing LibreOffice/Ghostscript OK"
  docker logs "${CID}" 2>&1 | grep -q 'PDF to DXF: OK' \
    || fail "Container logs missing PDF to DXF OK (check Python/ezdxf in image)"
  curl -fsS "http://127.0.0.1:${SMOKE_PORT}/api/health" | grep -q '"pdfToDxf":true' \
    || fail "Health API pdfToDxf is not true"
fi

log ""
log "All checks passed. Deploy with:"
log "  ./scripts/configure-adsense.sh   # paste AdSense banner slot into .env"
log "  cp .env.example .env   # edit SMTP_*, JAVA_OPTS"
log "  docker build -t pdfbolt:1.5.0 -t pdfbolt:latest ."
log "  docker run -d --restart always --env-file .env -p 8080:8080 --name pdfbolt pdfbolt:latest"

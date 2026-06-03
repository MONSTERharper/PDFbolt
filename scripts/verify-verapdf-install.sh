#!/usr/bin/env bash
# Pre-build check: same veraPDF install as Docker step 21 (run on EC2 before docker build).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

log() { printf '==> %s\n' "$*"; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

log "Checking veraPDF install files"
[[ -f scripts/install-verapdf.sh ]] || fail "missing scripts/install-verapdf.sh"
[[ -f scripts/verapdf-auto-install.xml ]] || fail "missing scripts/verapdf-auto-install.xml"
grep -q 'auto-install.xml' scripts/install-verapdf.sh || fail "install-verapdf.sh does not use auto-install.xml"
grep -q 'installSilent' scripts/install-verapdf.sh Dockerfile 2>/dev/null && fail "old -installSilent still present"
grep -q 'verapdf-auto-install.xml' Dockerfile || fail "Dockerfile must COPY verapdf-auto-install.xml"

log "Download URL"
curl -fsSI "https://software.verapdf.org/releases/1.28/verapdf-greenfield-1.28.2-installer.zip" | head -1 | grep -q '200' \
  || fail "veraPDF zip not reachable"

if command -v docker >/dev/null 2>&1; then
  log "Docker trial install (same as image build)"
  docker run --rm \
    -v "${REPO_ROOT}/scripts:/scripts:ro" \
    -e VERAPDF_VERSION=1.28.2 \
    -e TARGETARCH=amd64 \
    eclipse-temurin:17-jre \
    bash -c '
      set -e
      export DEBIAN_FRONTEND=noninteractive
      apt-get update -qq
      apt-get install -y -qq wget unzip ca-certificates
      cp /scripts/install-verapdf.sh /scripts/verapdf-auto-install.xml /tmp/
      chmod +x /tmp/install-verapdf.sh
      /tmp/install-verapdf.sh
      verapdf --version
    '
  log "veraPDF install trial OK"
else
  log "Docker not available — file/download checks only (OK to proceed with docker build on EC2)"
fi

log "All veraPDF pre-checks passed"

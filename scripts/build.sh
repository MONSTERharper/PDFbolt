#!/usr/bin/env bash
# Build PDFbolt: React UI → static/app, then Maven JAR.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

log() { printf '==> %s\n' "$*"; }

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required to build the UI. Install Node 20+ or set INSTALL_NODE=true in setup-host.sh" >&2
  exit 1
fi

if ! command -v mvn >/dev/null 2>&1; then
  echo "Maven is required. Install Maven or use the Docker workflow." >&2
  exit 1
fi

log "Building frontend (new-ui/)…"
cd new-ui
npm ci
npm run build
cd "${REPO_ROOT}"

log "Building backend JAR…"
mvn -q -DskipTests package

JAR="$(ls -1 target/bolt-replacer-*.jar 2>/dev/null | head -1)"
log "Built: ${JAR} ($(du -h "${JAR}" | cut -f1))"

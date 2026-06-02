#!/usr/bin/env bash
# Run PDFbolt from the built JAR. Load .env if present.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

PORT="${PORT:-8080}"
JAVA_OPTS="${JAVA_OPTS:--Xms128m -Xmx384m}"
LIBREOFFICE_COMMAND="${LIBREOFFICE_COMMAND:-soffice}"
export HOME="${HOME:-/tmp}"
export PORT LIBREOFFICE_COMMAND

JAR="$(ls -1 target/bolt-replacer-*.jar 2>/dev/null | head -1)"
if [[ -z "${JAR}" || ! -f "${JAR}" ]]; then
  echo "No JAR found. Run ./scripts/build.sh first." >&2
  exit 1
fi

if ! command -v "${LIBREOFFICE_COMMAND}" >/dev/null 2>&1; then
  echo "warning: ${LIBREOFFICE_COMMAND} not found — Office/HTML tools will fail until LibreOffice is installed." >&2
  echo "Run: sudo ./scripts/setup-host.sh" >&2
fi

echo "Starting PDFbolt on port ${PORT} (${JAR})"
exec java ${JAVA_OPTS} -jar "${JAR}"

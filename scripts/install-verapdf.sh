#!/bin/sh
# Install veraPDF CLI into /opt/verapdf (amd64 Docker images only).
set -eu

VERSION="${VERAPDF_VERSION:-1.28.2}"
MAJOR="${VERSION%.*}"
ARCH="${TARGETARCH:-amd64}"

if [ "${ARCH}" != "amd64" ]; then
  printf 'veraPDF: skipped on %s (Ghostscript-only PDF/A)\n' "${ARCH}"
  exit 0
fi

log() { printf '==> veraPDF: %s\n' "$*"; }

log "installing ${VERSION} for ${ARCH}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y --no-install-recommends wget unzip ca-certificates

ZIP="/tmp/verapdf.zip"
URL="https://software.verapdf.org/releases/${MAJOR}/verapdf-greenfield-${VERSION}-installer.zip"
wget -q "${URL}" -O "${ZIP}"

rm -rf /tmp/verapdf-install
unzip -q "${ZIP}" -d /tmp/verapdf-install
INSTALLER="$(find /tmp/verapdf-install -name '*-installer.jar' | head -1)"
if [ -z "${INSTALLER}" ]; then
  log "installer JAR not found after unzip"
  find /tmp/verapdf-install
  exit 1
fi

rm -rf /opt/verapdf
java -Djava.awt.headless=true -jar "${INSTALLER}" -dir /opt/verapdf -installType standard -installSilent

VERAPDF_BIN="$(find /opt/verapdf -type f -name verapdf 2>/dev/null | head -1)"
if [ -z "${VERAPDF_BIN}" ]; then
  log "verapdf binary not found under /opt/verapdf"
  find /opt/verapdf || true
  exit 1
fi

ln -sf "${VERAPDF_BIN}" /usr/local/bin/verapdf
verapdf --version

rm -rf "${ZIP}" /tmp/verapdf-install
apt-get purge -y wget unzip
apt-get autoremove -y
rm -rf /var/lib/apt/lists/*

log "OK ($(command -v verapdf))"

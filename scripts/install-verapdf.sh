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
INSTALLER="$(find /tmp/verapdf-install -type f \( \
  -name 'verapdf-izpack-installer*.jar' \
  -o -name 'verapdf-greenfield-*-installer.jar' \
  -o -name '*-installer.jar' \
  \) 2>/dev/null | head -1)"
if [ -z "${INSTALLER}" ]; then
  INSTALLER="$(find /tmp/verapdf-install -type f -name '*.jar' 2>/dev/null | head -1)"
fi
if [ -z "${INSTALLER}" ]; then
  log "installer JAR not found after unzip"
  find /tmp/verapdf-install
  exit 1
fi
log "using installer ${INSTALLER}"

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
AUTO_XML="/tmp/verapdf-auto-install.xml"
if [ -f "${SCRIPT_DIR}/verapdf-auto-install.xml" ]; then
  cp "${SCRIPT_DIR}/verapdf-auto-install.xml" "${AUTO_XML}"
else
  log "missing ${SCRIPT_DIR}/verapdf-auto-install.xml"
  exit 1
fi

rm -rf /opt/verapdf
INSTALL_ROOT="$(dirname "${INSTALLER}")"
INSTALL_JAR="$(basename "${INSTALLER}")"

# IzPack expects auto-install.xml beside the installer (see docs.verapdf.org/install)
cd "${INSTALL_ROOT}"
cp "${AUTO_XML}" ./auto-install.xml
chmod +x verapdf-install 2>/dev/null || true

if [ -f ./verapdf-install ]; then
  sh ./verapdf-install ./auto-install.xml
else
  java -Djava.awt.headless=true -jar "./${INSTALL_JAR}" ./auto-install.xml
fi

VERAPDF_BIN="$(find /opt/verapdf \( -type f -o -type l \) -name verapdf 2>/dev/null | head -1)"
if [ -z "${VERAPDF_BIN}" ]; then
  VERAPDF_BIN="$(find /opt/verapdf -type f -path '*/bin/*' \( -name verapdf -o -name 'verapdf-*' \) 2>/dev/null | head -1)"
fi
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

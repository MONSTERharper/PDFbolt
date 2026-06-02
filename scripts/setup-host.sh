#!/usr/bin/env bash
# PDFbolt — one-time (or idempotent) host setup for EC2 / VPS.
# Installs: JDK 17, Maven (optional), LibreOffice, fonts, 2 GB swap, build tools.
#
# Usage:
#   chmod +x scripts/setup-host.sh
#   sudo SWAP_SIZE_GB=2 scripts/setup-host.sh
#
# Without sudo (swap + apt only): run as root or with sudo.

set -euo pipefail

SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"
SWAP_FILE="${SWAP_FILE:-/swapfile}"
INSTALL_MAVEN="${INSTALL_MAVEN:-true}"
INSTALL_NODE="${INSTALL_NODE:-false}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '==> %s\n' "$*"; }
warn() { printf 'warning: %s\n' "$*" >&2; }

need_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    echo "Re-run with sudo for system packages and swap." >&2
    exit 1
  fi
}

detect_pkg_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    echo apt
  elif command -v dnf >/dev/null 2>&1; then
    echo dnf
  elif command -v yum >/dev/null 2>&1; then
    echo yum
  else
    echo unknown
  fi
}

setup_swap() {
  if swapon --show 2>/dev/null | grep -q "${SWAP_FILE}"; then
    log "Swap already active at ${SWAP_FILE}"
    return
  fi
  if [[ -f "${SWAP_FILE}" ]]; then
    log "Enabling existing ${SWAP_FILE}"
    chmod 600 "${SWAP_FILE}"
    mkswap "${SWAP_FILE}" >/dev/null 2>&1 || true
    swapon "${SWAP_FILE}" || warn "Could not enable swap"
  else
    log "Creating ${SWAP_SIZE_GB}G swap at ${SWAP_FILE}"
    if fallocate -l "${SWAP_SIZE_GB}G" "${SWAP_FILE}" 2>/dev/null; then
      :
    else
      dd if=/dev/zero of="${SWAP_FILE}" bs=1M count=$((SWAP_SIZE_GB * 1024)) status=progress
    fi
    chmod 600 "${SWAP_FILE}"
    mkswap "${SWAP_FILE}"
    swapon "${SWAP_FILE}"
  fi
  if ! grep -q "^${SWAP_FILE} " /etc/fstab 2>/dev/null; then
    echo "${SWAP_FILE} none swap sw 0 0" >> /etc/fstab
    log "Added ${SWAP_FILE} to /etc/fstab"
  fi
  if [[ ! -f /etc/sysctl.d/99-pdfbolt-swappiness.conf ]]; then
    echo 'vm.swappiness=10' > /etc/sysctl.d/99-pdfbolt-swappiness.conf
    sysctl -p /etc/sysctl.d/99-pdfbolt-swappiness.conf >/dev/null || true
  fi
  free -h || true
}

install_packages_apt() {
  log "Installing packages (Debian/Ubuntu)…"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y --no-install-recommends \
    openjdk-17-jre-headless \
    fontconfig \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-noto-core \
    fonts-freefont-ttf \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-core-nogui \
    ghostscript \
    curl \
    ca-certificates
  if [[ "${INSTALL_MAVEN}" == "true" ]] && ! command -v mvn >/dev/null 2>&1; then
    apt-get install -y maven
  fi
  if [[ "${INSTALL_NODE}" == "true" ]] && ! command -v node >/dev/null 2>&1; then
    apt-get install -y nodejs npm || warn "nodejs/npm not in repos — install Node 20+ manually for UI builds"
  fi
}

install_packages_dnf() {
  log "Installing packages (RHEL/Amazon Linux)…"
  dnf install -y \
    java-17-amazon-corretto-headless \
    fontconfig \
    dejavu-sans-fonts \
    liberation-fonts \
    google-noto-sans-fonts \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    ghostscript \
    curl \
    ca-certificates || {
      warn "Some font packages may differ on this AMI — continuing"
      dnf install -y java-17-amazon-corretto-headless libreoffice-core libreoffice-writer || true
    }
  if [[ "${INSTALL_MAVEN}" == "true" ]] && ! command -v mvn >/dev/null 2>&1; then
    dnf install -y maven || warn "Install Maven manually if not available"
  fi
}

verify_install() {
  log "Verification"
  java -version 2>&1 | head -1 || warn "Java 17 not found"
  if command -v mvn >/dev/null 2>&1; then
    mvn -version 2>&1 | head -1
  fi
  if command -v soffice >/dev/null 2>&1; then
    soffice --version | head -1
  else
    warn "soffice not on PATH — html-to-pdf and Office→PDF will fail"
    warn "Set LIBREOFFICE_COMMAND in .env to the full path, e.g. /usr/bin/soffice"
  fi
  swapon --show 2>/dev/null || true
  log "Done. Next: cp .env.example .env && ./scripts/build.sh && ./scripts/run.sh"
}

main() {
  need_root
  PM="$(detect_pkg_manager)"
  setup_swap
  case "${PM}" in
    apt) install_packages_apt ;;
    dnf|yum) install_packages_dnf ;;
    *)
      warn "Unknown package manager — install manually: Java 17, LibreOffice, fonts"
      ;;
  esac
  verify_install
}

main "$@"

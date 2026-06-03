#!/usr/bin/env bash
# Safe periodic cleanup for PDFbolt EC2 (cron). Prunes unused Docker data and trims logs.
# Aggressive image prune only when PRUNE_ALL_IMAGES=1 (e.g. monthly).
set -euo pipefail

LOG_TAG="pdfbolt-cleanup"
log() { logger -t "${LOG_TAG}" "$*" 2>/dev/null || printf '%s %s\n' "$(date -Is)" "$*"; }

if ! command -v docker >/dev/null 2>&1; then
  log "docker not found — skipping"
  exit 0
fi

DOCKER=(docker)
if ! docker info >/dev/null 2>&1; then
  DOCKER=(sudo docker)
fi

log "disk before: $(df -h / | awk 'NR==2 {print $3 " used, " $4 " free (" $5 ")"}')"

"${DOCKER[@]}" container prune -f >/dev/null 2>&1 || true

if [[ "${PRUNE_ALL_IMAGES:-0}" == "1" ]]; then
  log "pruning all unused images (PRUNE_ALL_IMAGES=1)"
  "${DOCKER[@]}" image prune -a -f >/dev/null 2>&1 || true
else
  "${DOCKER[@]}" image prune -f >/dev/null 2>&1 || true
fi

if command -v journalctl >/dev/null 2>&1; then
  journalctl --vacuum-size=100M >/dev/null 2>&1 || true
fi

log "disk after: $(df -h / | awk 'NR==2 {print $3 " used, " $4 " free (" $5 ")"}')"
"${DOCKER[@]}" system df 2>/dev/null | logger -t "${LOG_TAG}" 2>/dev/null || "${DOCKER[@]}" system df 2>/dev/null || true

log "done"

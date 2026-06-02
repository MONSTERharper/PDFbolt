#!/bin/sh
# Docker HEALTHCHECK (exec form — works on older daemons without CMD-SHELL).
set -eu
port="${PORT:-8080}"
curl -fsS "http://127.0.0.1:${port}/api/health" | grep -q '"ready":true'

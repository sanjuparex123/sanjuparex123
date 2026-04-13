#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_FILE="${1:-chat-app-download.zip}"

cd "$ROOT_DIR"

if [ ! -d "chat-app" ]; then
  echo "chat-app directory not found" >&2
  exit 1
fi

rm -f "$OUT_FILE"
zip -r "$OUT_FILE" chat-app >/dev/null

echo "Created $OUT_FILE"

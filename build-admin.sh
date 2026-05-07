#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_DIR="$ROOT_DIR/admin/frontend"

fail() {
  echo "Failed. $1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

require_file() {
  [ -f "$1" ] || fail "Missing file: $1"
}

echo "Checking admin production build..."

require_file "$ADMIN_DIR/package.json"
require_file "$ADMIN_DIR/package-lock.json"
require_command npm

echo "Building admin..."
cd "$ADMIN_DIR"
npm ci
npm run build

echo "Completed."

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_DIR="$ROOT_DIR/admin/frontend"
BACKEND_DIR="$ROOT_DIR/admin/backend"
BACKEND_ENV="$BACKEND_DIR/.env"
BACKEND_ENV_EXAMPLE="$BACKEND_DIR/.env.example"

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

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  local escaped_value

  escaped_value="$(printf '%s' "$value" | sed 's/[\/&]/\\&/g')"

  if grep -q -E "^${key}=" "$file"; then
    sed -i "s/^${key}=.*/${key}=\"${escaped_value}\"/" "$file"
  else
    printf '\n%s="%s"\n' "$key" "$value" >> "$file"
  fi
}

ensure_backend_env_config() {
  if [ ! -f "$BACKEND_ENV" ]; then
    if [ -f "$BACKEND_ENV_EXAMPLE" ]; then
      cp "$BACKEND_ENV_EXAMPLE" "$BACKEND_ENV"
    else
      touch "$BACKEND_ENV"
    fi
    echo "Created backend env file: $BACKEND_ENV"
  fi

  if ! grep -q -E "^CLOUDFLARE_ZONE_ID=" "$BACKEND_ENV"; then
    set_env_value "$BACKEND_ENV" "CLOUDFLARE_ZONE_ID" ""
    echo "Added CLOUDFLARE_ZONE_ID placeholder to backend env."
  fi

  if ! grep -q -E "^CLOUDFLARE_API_TOKEN=" "$BACKEND_ENV"; then
    set_env_value "$BACKEND_ENV" "CLOUDFLARE_API_TOKEN" ""
    echo "Added CLOUDFLARE_API_TOKEN placeholder to backend env."
  fi

  if ! grep -q -E "^CLOUDFLARE_STOREFRONT_URL=" "$BACKEND_ENV"; then
    set_env_value "$BACKEND_ENV" "CLOUDFLARE_STOREFRONT_URL" ""
    echo "Added CLOUDFLARE_STOREFRONT_URL placeholder to backend env."
  fi

  if ! grep -q -E "^CLOUDFLARE_PURGE_EVERYTHING=" "$BACKEND_ENV"; then
    set_env_value "$BACKEND_ENV" "CLOUDFLARE_PURGE_EVERYTHING" "true"
    echo "Added CLOUDFLARE_PURGE_EVERYTHING placeholder to backend env."
  fi
}

echo "Checking admin production build..."

require_file "$ADMIN_DIR/package.json"
require_file "$ADMIN_DIR/package-lock.json"
require_command npm

ensure_backend_env_config

echo "Building admin..."
cd "$ADMIN_DIR"
npm ci
npm run build

echo "Completed."

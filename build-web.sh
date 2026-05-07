#!/usr/bin/env bash
set -euo pipefail

PM2_APP_NAME="${PM2_APP_NAME:-planb-web}"
EXPECTED_WEBHOOK_URL="${EXPECTED_WEBHOOK_URL:-http://127.0.0.1:3002/api/revalidate}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$ROOT_DIR/web"
BACKEND_DIR="$ROOT_DIR/admin/backend"
WEB_ENV="$WEB_DIR/.env.production"
BACKEND_ENV="$BACKEND_DIR/.env"

fail() {
  echo "Failed. $1" >&2
  exit 1
}

read_env_value() {
  local file="$1"
  local key="$2"
  local line

  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  if [ -z "$line" ]; then
    return 0
  fi

  local value="${line#*=}"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "$value"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

require_file() {
  [ -f "$1" ] || fail "Missing file: $1"
}

require_env() {
  local file="$1"
  local key="$2"
  local value

  value="$(read_env_value "$file" "$key")"
  [ -n "$value" ] || fail "Missing $key in $file"
  printf '%s' "$value"
}

generate_token() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi

  od -An -N32 -tx1 /dev/urandom | tr -d ' \n'
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

ensure_revalidation_config() {
  local web_token
  local backend_token
  local backend_webhook_url

  web_token="$(read_env_value "$WEB_ENV" "NEXTJS_REVALIDATE_TOKEN")"
  backend_token="$(read_env_value "$BACKEND_ENV" "NEXTJS_REVALIDATE_TOKEN")"
  backend_webhook_url="$(read_env_value "$BACKEND_ENV" "NEXTJS_REVALIDATE_WEBHOOK_URL")"

  if [ -z "$web_token" ] && [ -z "$backend_token" ]; then
    web_token="$(generate_token)"
    backend_token="$web_token"
    set_env_value "$WEB_ENV" "NEXTJS_REVALIDATE_TOKEN" "$web_token"
    set_env_value "$BACKEND_ENV" "NEXTJS_REVALIDATE_TOKEN" "$backend_token"
    echo "Generated NEXTJS_REVALIDATE_TOKEN in web and backend env files."
  elif [ -z "$web_token" ]; then
    web_token="$backend_token"
    set_env_value "$WEB_ENV" "NEXTJS_REVALIDATE_TOKEN" "$web_token"
    echo "Copied NEXTJS_REVALIDATE_TOKEN from backend env to web env."
  elif [ -z "$backend_token" ]; then
    backend_token="$web_token"
    set_env_value "$BACKEND_ENV" "NEXTJS_REVALIDATE_TOKEN" "$backend_token"
    echo "Copied NEXTJS_REVALIDATE_TOKEN from web env to backend env."
  fi

  if [ -z "$backend_webhook_url" ]; then
    set_env_value "$BACKEND_ENV" "NEXTJS_REVALIDATE_WEBHOOK_URL" "$EXPECTED_WEBHOOK_URL"
    echo "Added NEXTJS_REVALIDATE_WEBHOOK_URL to backend env."
  fi
}

echo "Checking web production build..."

require_file "$WEB_DIR/package.json"
require_file "$WEB_ENV"
require_file "$BACKEND_ENV"
require_command corepack
require_command pm2

corepack pnpm --version >/dev/null 2>&1 || fail "pnpm is not available through corepack"

ensure_revalidation_config

web_api_url="$(require_env "$WEB_ENV" "NEXT_PUBLIC_VADMIN_API_URL")"
web_token="$(require_env "$WEB_ENV" "NEXTJS_REVALIDATE_TOKEN")"
backend_webhook_url="$(require_env "$BACKEND_ENV" "NEXTJS_REVALIDATE_WEBHOOK_URL")"
backend_token="$(require_env "$BACKEND_ENV" "NEXTJS_REVALIDATE_TOKEN")"

[ "$web_token" = "$backend_token" ] || fail "Revalidation tokens do not match between web and backend env files"
[ "$backend_webhook_url" = "$EXPECTED_WEBHOOK_URL" ] || fail "NEXTJS_REVALIDATE_WEBHOOK_URL must be $EXPECTED_WEBHOOK_URL"

case "$web_api_url" in
  https://soyplanb.com.ar/api) ;;
  *) fail "NEXT_PUBLIC_VADMIN_API_URL must be https://soyplanb.com.ar/api" ;;
esac

echo "Building web..."
cd "$WEB_DIR"
if ! corepack pnpm install --frozen-lockfile; then
  echo "pnpm lockfile is outdated. Updating install state with --no-frozen-lockfile..."
  corepack pnpm install --no-frozen-lockfile
fi
corepack pnpm build

echo "Restarting PM2 app: $PM2_APP_NAME"
pm2 restart "$PM2_APP_NAME"

echo "Completed."

#!/usr/bin/env bash
set -euo pipefail

PM2_APP_NAME="${PM2_APP_NAME:-nolita-web}"
EXPECTED_WEBHOOK_URL="${EXPECTED_WEBHOOK_URL:-http://127.0.0.1:3002/api/revalidate}"
EXPECTED_WEB_API_URL="${EXPECTED_WEB_API_URL:-https://nolita.com.ar/api}"

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

ensure_web_env_config() {
  if [ ! -f "$WEB_ENV" ]; then
    touch "$WEB_ENV"
    echo "Created web production env file: $WEB_ENV"
  fi

  if [ -z "$(read_env_value "$WEB_ENV" "COMPANY_NAME")" ]; then
    set_env_value "$WEB_ENV" "COMPANY_NAME" "Nolita"
    echo "Added COMPANY_NAME to web env."
  fi

  if [ -z "$(read_env_value "$WEB_ENV" "SITE_NAME")" ]; then
    set_env_value "$WEB_ENV" "SITE_NAME" "Nolita"
    echo "Added SITE_NAME to web env."
  fi

  if [ -z "$(read_env_value "$WEB_ENV" "NEXT_PUBLIC_VADMIN_API_URL")" ]; then
    set_env_value "$WEB_ENV" "NEXT_PUBLIC_VADMIN_API_URL" "$EXPECTED_WEB_API_URL"
    echo "Added NEXT_PUBLIC_VADMIN_API_URL to web env."
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

install_web_dependencies() {
  if [ -f "$WEB_DIR/package-lock.json" ]; then
    require_command npm
    npm ci
    return
  fi

  if [ -f "$WEB_DIR/pnpm-lock.yaml" ]; then
    require_command corepack
    corepack pnpm --version >/dev/null 2>&1 || fail "pnpm is not available through corepack"
    corepack pnpm install --frozen-lockfile
    return
  fi

  fail "Missing web lockfile: expected package-lock.json or pnpm-lock.yaml"
}

build_web() {
  if [ -f "$WEB_DIR/package-lock.json" ]; then
    npm run build
    return
  fi

  corepack pnpm build
}

echo "Checking web production build..."

require_file "$WEB_DIR/package.json"
require_file "$BACKEND_ENV"
require_command pm2

ensure_web_env_config
ensure_revalidation_config

web_api_url="$(require_env "$WEB_ENV" "NEXT_PUBLIC_VADMIN_API_URL")"
web_token="$(require_env "$WEB_ENV" "NEXTJS_REVALIDATE_TOKEN")"
backend_webhook_url="$(require_env "$BACKEND_ENV" "NEXTJS_REVALIDATE_WEBHOOK_URL")"
backend_token="$(require_env "$BACKEND_ENV" "NEXTJS_REVALIDATE_TOKEN")"

[ "$web_token" = "$backend_token" ] || fail "Revalidation tokens do not match between web and backend env files"
[ "$backend_webhook_url" = "$EXPECTED_WEBHOOK_URL" ] || fail "NEXTJS_REVALIDATE_WEBHOOK_URL must be $EXPECTED_WEBHOOK_URL"

case "$web_api_url" in
  "$EXPECTED_WEB_API_URL") ;;
  *) fail "NEXT_PUBLIC_VADMIN_API_URL must be $EXPECTED_WEB_API_URL" ;;
esac

echo "Building web..."
cd "$WEB_DIR"
install_web_dependencies
build_web

echo "Restarting PM2 app: $PM2_APP_NAME"
pm2 restart "$PM2_APP_NAME"

echo "Completed."

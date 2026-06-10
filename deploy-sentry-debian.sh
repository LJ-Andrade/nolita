#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/admin/backend"
ADMIN_DIR="$ROOT_DIR/admin/frontend"
WEB_DIR="$ROOT_DIR/web"

BACKEND_ENV="$BACKEND_DIR/.env"
BACKEND_ENV_EXAMPLE="$BACKEND_DIR/.env.example"
ADMIN_ENV="$ADMIN_DIR/.env.production.local"
WEB_ENV="$WEB_DIR/.env.production"

SENTRY_ENVIRONMENT="${SENTRY_ENVIRONMENT:-production}"
SENTRY_TRACES_SAMPLE_RATE="${SENTRY_TRACES_SAMPLE_RATE:-0}"
RELEASE_PREFIX="${RELEASE_PREFIX:-nolita}"
GIT_SHA="$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || true)"
DEFAULT_RELEASE="${RELEASE_PREFIX}@${GIT_SHA:-manual}"

RUN_INSTALL="${RUN_INSTALL:-0}"
RUN_BUILD="${RUN_BUILD:-0}"
TEST_BACKEND="${TEST_BACKEND:-0}"
CONFIGURE_SOURCE_MAPS="${CONFIGURE_SOURCE_MAPS:-0}"
ENVIRONMENT_PROVIDED=0
RUN_INSTALL_PROVIDED=0
RUN_BUILD_PROVIDED=0
TEST_BACKEND_PROVIDED=0
SOURCE_MAPS_PROVIDED=0
PM2_APP_NAME="${PM2_APP_NAME:-nolita-web}"

BACKEND_DSN="${SENTRY_LARAVEL_DSN:-}"
ADMIN_DSN="${VITE_SENTRY_DSN:-}"
WEB_DSN="${NEXT_PUBLIC_SENTRY_DSN:-}"
SENTRY_RELEASE="${SENTRY_RELEASE:-$DEFAULT_RELEASE}"
SENTRY_ORG="${SENTRY_ORG:-}"
SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN:-}"
ADMIN_SENTRY_PROJECT="${ADMIN_SENTRY_PROJECT:-nolita-admin-panel}"
WEB_SENTRY_PROJECT="${WEB_SENTRY_PROJECT:-nolita-storefront}"

usage() {
  cat <<'USAGE'
Usage: ./deploy-sentry-debian.sh [options]

Configures production Sentry variables for Laravel, Vite admin, and Next storefront.
Secrets are written only to server env files, never to tracked example files.

Options:
  --environment VALUE       Sentry environment. Default: production
  --release VALUE           Release value. Default: nolita@<git-sha>
  --backend-dsn VALUE       Laravel project DSN
  --admin-dsn VALUE         React/Vite admin project DSN
  --web-dsn VALUE           Next storefront project DSN
  --traces-sample-rate N    Default: 0
  --source-maps             Ask/configure Sentry source map upload values
  --sentry-org VALUE        Sentry org slug
  --sentry-auth-token VALUE Sentry auth token for source map uploads
  --run-install             Run composer/npm installs
  --run-build               Run admin and web builds, then restart PM2 web app
  --test-backend            Run php artisan sentry:test
  --pm2-app VALUE           PM2 app name for storefront. Default: nolita-web
  --yes                     Non-interactive; fail if required values are missing
  -h, --help                Show this help

Examples:
  ./deploy-sentry-debian.sh
  ./deploy-sentry-debian.sh --source-maps --run-install --run-build --test-backend
USAGE
}

YES=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --environment)
      SENTRY_ENVIRONMENT="$2"; ENVIRONMENT_PROVIDED=1; shift 2 ;;
    --release)
      SENTRY_RELEASE="$2"; shift 2 ;;
    --backend-dsn)
      BACKEND_DSN="$2"; shift 2 ;;
    --admin-dsn)
      ADMIN_DSN="$2"; shift 2 ;;
    --web-dsn)
      WEB_DSN="$2"; shift 2 ;;
    --traces-sample-rate)
      SENTRY_TRACES_SAMPLE_RATE="$2"; shift 2 ;;
    --source-maps)
      CONFIGURE_SOURCE_MAPS=1; SOURCE_MAPS_PROVIDED=1; shift ;;
    --sentry-org)
      SENTRY_ORG="$2"; shift 2 ;;
    --sentry-auth-token)
      SENTRY_AUTH_TOKEN="$2"; shift 2 ;;
    --run-install)
      RUN_INSTALL=1; RUN_INSTALL_PROVIDED=1; shift ;;
    --run-build)
      RUN_BUILD=1; RUN_BUILD_PROVIDED=1; shift ;;
    --test-backend)
      TEST_BACKEND=1; TEST_BACKEND_PROVIDED=1; shift ;;
    --pm2-app)
      PM2_APP_NAME="$2"; shift 2 ;;
    --yes)
      YES=1; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1 ;;
  esac
done

fail() {
  echo "Failed. $1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing command: $1"
}

read_env_value() {
  local file="$1"
  local key="$2"
  local line

  [ -f "$file" ] || return 0
  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  [ -n "$line" ] || return 0

  local value="${line#*=}"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "$value"
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  local escaped_value

  mkdir -p "$(dirname "$file")"
  touch "$file"

  escaped_value="$(printf '%s' "$value" | sed 's/[\/&]/\\&/g')"

  if grep -q -E "^${key}=" "$file"; then
    sed -i "s/^${key}=.*/${key}=\"${escaped_value}\"/" "$file"
  else
    printf '\n%s="%s"\n' "$key" "$value" >> "$file"
  fi
}

ask_value() {
  local label="$1"
  local current="$2"
  local value

  if [ "$YES" = "1" ]; then
    printf '%s' "$current"
    return
  fi

  if [ -n "$current" ]; then
    read -r -p "$label [keep current]: " value
  else
    read -r -p "$label: " value
  fi

  if [ -z "$value" ]; then
    printf '%s' "$current"
  else
    printf '%s' "$value"
  fi
}

ask_choice() {
  local label="$1"
  local default="$2"
  shift 2
  local choices=("$@")
  local value
  local index

  if [ "$YES" = "1" ]; then
    printf '%s' "$default"
    return
  fi

  echo "$label" >&2
  for index in "${!choices[@]}"; do
    local number=$((index + 1))
    local marker=""
    [ "${choices[$index]}" = "$default" ] && marker=" (default)"
    echo "  $number. ${choices[$index]}$marker" >&2
  done

  read -r -p "Choose an option: " value
  if [ -z "$value" ]; then
    printf '%s' "$default"
    return
  fi

  if [[ "$value" =~ ^[0-9]+$ ]] && [ "$value" -ge 1 ] && [ "$value" -le "${#choices[@]}" ]; then
    printf '%s' "${choices[$((value - 1))]}"
    return
  fi

  for index in "${!choices[@]}"; do
    if [ "$value" = "${choices[$index]}" ]; then
      printf '%s' "$value"
      return
    fi
  done

  echo "Invalid option '$value'. Using default: $default" >&2
  printf '%s' "$default"
}

ask_yes_no() {
  local label="$1"
  local default="$2"
  local suffix="y/N"
  local value

  if [ "$YES" = "1" ]; then
    printf '%s' "$default"
    return
  fi

  [ "$default" = "1" ] && suffix="Y/n"
  read -r -p "$label [$suffix]: " value

  if [ -z "$value" ]; then
    printf '%s' "$default"
    return
  fi

  case "${value,,}" in
    y|yes)
      printf '1' ;;
    *)
      printf '0' ;;
  esac
}

ensure_backend_env() {
  if [ ! -f "$BACKEND_ENV" ]; then
    if [ -f "$BACKEND_ENV_EXAMPLE" ]; then
      cp "$BACKEND_ENV_EXAMPLE" "$BACKEND_ENV"
    else
      touch "$BACKEND_ENV"
    fi
    echo "Created backend env: $BACKEND_ENV"
  fi
}

load_existing_values() {
  [ -n "$BACKEND_DSN" ] || BACKEND_DSN="$(read_env_value "$BACKEND_ENV" "SENTRY_LARAVEL_DSN")"
  [ -n "$ADMIN_DSN" ] || ADMIN_DSN="$(read_env_value "$ADMIN_ENV" "VITE_SENTRY_DSN")"
  [ -n "$WEB_DSN" ] || WEB_DSN="$(read_env_value "$WEB_ENV" "NEXT_PUBLIC_SENTRY_DSN")"
  [ -n "$SENTRY_ORG" ] || SENTRY_ORG="$(read_env_value "$WEB_ENV" "SENTRY_ORG")"
  [ -n "$SENTRY_AUTH_TOKEN" ] || SENTRY_AUTH_TOKEN="$(read_env_value "$WEB_ENV" "SENTRY_AUTH_TOKEN")"
}

configure_env_files() {
  BACKEND_DSN="$(ask_value "Laravel backend DSN (nolita-backend)" "$BACKEND_DSN")"
  ADMIN_DSN="$(ask_value "React admin DSN (nolita-admin)" "$ADMIN_DSN")"
  WEB_DSN="$(ask_value "Next storefront DSN (nolita-web)" "$WEB_DSN")"

  [ -n "$BACKEND_DSN" ] || fail "Missing Laravel backend DSN"
  [ -n "$ADMIN_DSN" ] || fail "Missing React admin DSN"
  [ -n "$WEB_DSN" ] || fail "Missing Next storefront DSN"

  set_env_value "$BACKEND_ENV" "SENTRY_LARAVEL_DSN" "$BACKEND_DSN"
  set_env_value "$BACKEND_ENV" "SENTRY_ENVIRONMENT" "$SENTRY_ENVIRONMENT"
  set_env_value "$BACKEND_ENV" "SENTRY_RELEASE" "$SENTRY_RELEASE-backend"
  set_env_value "$BACKEND_ENV" "SENTRY_TRACES_SAMPLE_RATE" "$SENTRY_TRACES_SAMPLE_RATE"
  set_env_value "$BACKEND_ENV" "SENTRY_SEND_DEFAULT_PII" "false"

  set_env_value "$ADMIN_ENV" "VITE_SENTRY_DSN" "$ADMIN_DSN"
  set_env_value "$ADMIN_ENV" "VITE_SENTRY_ENVIRONMENT" "$SENTRY_ENVIRONMENT"
  set_env_value "$ADMIN_ENV" "VITE_SENTRY_RELEASE" "$SENTRY_RELEASE-admin"
  set_env_value "$ADMIN_ENV" "VITE_SENTRY_TRACES_SAMPLE_RATE" "$SENTRY_TRACES_SAMPLE_RATE"

  set_env_value "$WEB_ENV" "NEXT_PUBLIC_SENTRY_DSN" "$WEB_DSN"
  set_env_value "$WEB_ENV" "SENTRY_ENVIRONMENT" "$SENTRY_ENVIRONMENT"
  set_env_value "$WEB_ENV" "SENTRY_RELEASE" "$SENTRY_RELEASE-web"
  set_env_value "$WEB_ENV" "SENTRY_TRACES_SAMPLE_RATE" "$SENTRY_TRACES_SAMPLE_RATE"

  if [ "$CONFIGURE_SOURCE_MAPS" = "1" ]; then
    SENTRY_ORG="$(ask_value "Sentry org slug" "$SENTRY_ORG")"
    SENTRY_AUTH_TOKEN="$(ask_value "Sentry auth token for source maps" "$SENTRY_AUTH_TOKEN")"
    [ -n "$SENTRY_ORG" ] || fail "Missing Sentry org slug"
    [ -n "$SENTRY_AUTH_TOKEN" ] || fail "Missing Sentry auth token"

    set_env_value "$ADMIN_ENV" "SENTRY_ORG" "$SENTRY_ORG"
    set_env_value "$ADMIN_ENV" "SENTRY_PROJECT" "$ADMIN_SENTRY_PROJECT"
    set_env_value "$ADMIN_ENV" "SENTRY_AUTH_TOKEN" "$SENTRY_AUTH_TOKEN"

    set_env_value "$WEB_ENV" "SENTRY_ORG" "$SENTRY_ORG"
    set_env_value "$WEB_ENV" "SENTRY_PROJECT" "$WEB_SENTRY_PROJECT"
    set_env_value "$WEB_ENV" "SENTRY_AUTH_TOKEN" "$SENTRY_AUTH_TOKEN"
  fi
}

export_env_file() {
  local file="$1"

  [ -f "$file" ] || return

  set -a
  # shellcheck disable=SC1090
  . "$file"
  set +a
}

install_backend() {
  require_command composer
  cd "$BACKEND_DIR"
  composer install --no-dev --optimize-autoloader
}

install_admin() {
  require_command npm
  cd "$ADMIN_DIR"
  npm ci
}

install_web() {
  require_command npm
  cd "$WEB_DIR"
  npm ci
}

cache_backend_config() {
  require_command php
  cd "$BACKEND_DIR"
  php artisan optimize:clear
  php artisan config:cache
}

build_admin() {
  require_command npm
  cd "$ADMIN_DIR"
  export_env_file "$ADMIN_ENV"
  npm run build
}

build_web() {
  require_command npm
  cd "$WEB_DIR"
  export_env_file "$WEB_ENV"
  npm run build
}

restart_web() {
  require_command pm2
  pm2 restart "$PM2_APP_NAME"
}

test_backend() {
  require_command php
  cd "$BACKEND_DIR"
  php artisan sentry:test
}

echo "Configuring Sentry for Debian production..."

if [ "$YES" != "1" ]; then
  if [ "$ENVIRONMENT_PROVIDED" = "0" ]; then
    SENTRY_ENVIRONMENT="$(ask_choice "Select Sentry environment" "$SENTRY_ENVIRONMENT" "development" "staging" "production")"
  fi
  if [ "$SOURCE_MAPS_PROVIDED" = "0" ]; then
    CONFIGURE_SOURCE_MAPS="$(ask_yes_no "Configure source map upload values?" "$CONFIGURE_SOURCE_MAPS")"
  fi
  if [ "$RUN_INSTALL_PROVIDED" = "0" ]; then
    RUN_INSTALL="$(ask_yes_no "Run composer/npm install steps?" "$RUN_INSTALL")"
  fi
  if [ "$RUN_BUILD_PROVIDED" = "0" ]; then
    RUN_BUILD="$(ask_yes_no "Run admin and storefront builds, then restart PM2?" "$RUN_BUILD")"
  fi
  if [ "$TEST_BACKEND_PROVIDED" = "0" ]; then
    TEST_BACKEND="$(ask_yes_no "Send a backend Sentry test event?" "$TEST_BACKEND")"
  fi
fi

ensure_backend_env
load_existing_values
configure_env_files

if [ "$RUN_INSTALL" = "1" ]; then
  echo "Installing backend dependencies..."
  install_backend
  echo "Installing admin dependencies..."
  install_admin
  echo "Installing web dependencies..."
  install_web
fi

echo "Refreshing Laravel config cache..."
cache_backend_config

if [ "$RUN_BUILD" = "1" ]; then
  echo "Building admin with Sentry environment..."
  build_admin
  echo "Building storefront with Sentry environment..."
  build_web
  echo "Restarting PM2 app: $PM2_APP_NAME"
  restart_web
fi

if [ "$TEST_BACKEND" = "1" ]; then
  echo "Sending backend Sentry test event..."
  test_backend
fi

echo ""
echo "Sentry production configuration completed."
echo "Backend env: admin/backend/.env"
echo "Admin env: admin/frontend/.env.production.local"
echo "Storefront env: web/.env.production"
echo ""
echo "If you did not use --run-build, rebuild admin and web before expecting frontend DSN changes to take effect."

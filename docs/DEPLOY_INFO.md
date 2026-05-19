# Production Deployment - nolita.com.ar

## Architecture

```
                    nginx (443)
                          │
           ┌──────────────┼──────────────┐
           │              │              │
      /vadmin/      /api/*          / (Next.js)
           │              │              │
           ▼              ▼              ▼
   admin/frontend/   localhost:8000  localhost:3002
      (static)     (Laravel API)   (Next.js)
                          │
                          ▼
                    MySQL (nolita)
```

## Ports

| Port | Service | Root |
|------|---------|------|
| 443 | Nginx (HTTPS) | Main entry point |
| 8000 | Laravel API | admin/backend/public |
| 3002 | Next.js | web/ |

## Domains

- **Frontend**: `https://nolita.com.ar`
- **Admin Panel**: `https://nolita.com.ar/vadmin`
- **API**: `https://nolita.com.ar/api`

## Nginx Configuration

### Server 443 - Main Entry

Routes:
- `/vadmin/*` → Static files from `admin/frontend/dist`
- `/api/*` → Proxy to Laravel on port 8000
- `/*` → Proxy to Next.js on port 3002

### Server 8000 - Laravel Backend (Nginx/PHP-FPM)

```nginx
server {
  listen 8000;
  server_name nolita.com.ar;
  root /home/nolita/htdocs/nolita.com.ar/nolita/admin/backend/public;
  index index.php;
  # ... (PHP-FPM configuration)
}
```

## Starting Services

### Laravel API
The API is served by Nginx on port 8000 using PHP-FPM. Ensure the permissions for `storage` and `bootstrap/cache` are correctly set.

### Next.js (PM2)
The storefront is managed by PM2 under the `nolita` user.

```bash
cd /home/nolita/htdocs/nolita.com.ar/nolita
./build-web.sh
```

`build-web.sh` prepares the storefront production environment, installs dependencies from the committed web lockfile, builds Next.js, and restarts the PM2 app.

If the PM2 app has not been created yet:

```bash
cd /home/nolita/htdocs/nolita.com.ar/nolita/web
pm2 start npm --name "nolita-web" -- run start -- -p 3002
```

## Admin Frontend

The admin frontend is a static Vite SPA. It must be built and then served by Nginx.

```bash
cd /home/nolita/htdocs/nolita.com.ar/nolita
./build-admin.sh
```

`build-admin.sh` creates `admin/backend/.env` from `admin/backend/.env.example` when it is missing and ensures Cloudflare cache purge placeholders exist. Fill `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` with the real production values before relying on automatic Cloudflare purges.

## Environment Variables

### Laravel (.env)
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://nolita.com.ar`

### Web Frontal (.env.production)
- `NEXT_PUBLIC_VADMIN_API_URL=<public-vadmin-api-url>`
- `NEXTJS_REVALIDATE_TOKEN=<shared-secret>`

`build-web.sh` creates `web/.env.production` when it is missing and seeds these safe defaults:

```bash
COMPANY_NAME="Nolita"
SITE_NAME="Nolita"
NEXT_PUBLIC_VADMIN_API_URL=
```

After the first run, edit `web/.env.production` and set `NEXT_PUBLIC_VADMIN_API_URL` to the public VADMIN API for the current environment, for example:

```bash
NEXT_PUBLIC_VADMIN_API_URL=https://nolita.com.ar/api
```

For online development or staging environments, use that environment's public API URL instead. The script does not hardcode one accepted domain.

The script also generates or syncs `NEXTJS_REVALIDATE_TOKEN` between `web/.env.production` and `admin/backend/.env`.

### Storefront Cache Revalidation
Because Nginx proxies public `/api/*` requests to Laravel, VADMIN should call the Next.js revalidation route directly through the local PM2 port:

```bash
NEXTJS_REVALIDATE_WEBHOOK_URL=http://127.0.0.1:3002/api/revalidate
NEXTJS_REVALIDATE_TOKEN=<same-shared-secret-as-web>
```

Set these variables in `admin/backend/.env`, then clear cached Laravel config after deploy.

When production traffic is routed through Cloudflare, also configure a Cloudflare API token with cache purge permission for the zone:

```bash
CLOUDFLARE_ZONE_ID=<cloudflare-zone-id>
CLOUDFLARE_API_TOKEN=<cloudflare-api-token-with-cache-purge>
```

VADMIN uses the same admin write revalidation flow to purge affected public storefront URLs from Cloudflare. Missing Cloudflare values or purge failures are logged but do not block admin saves.

### Storefront Dependency Install
The storefront currently commits `web/package-lock.json`, so `build-web.sh` uses `npm ci` for production installs.

The production server is Debian/Linux. Do not add platform-specific Windows packages, such as `*-win32-*`, as direct dependencies in `web/package.json`; npm will reject them during Linux installs. Platform binaries required by Next.js, Tailwind, or Lightning CSS must remain transitive optional dependencies.

If dependencies are installed manually with PNPM and the install stops with `ERR_PNPM_IGNORED_BUILDS` for `sharp`, approve the build script once:

```bash
cd /home/nolita/htdocs/nolita.com.ar/nolita/web
corepack pnpm approve-builds
```

Select `sharp`, confirm, then rerun `../build-web.sh`.

## Storage & Permissions

Laravel requires a symbolic link for the public storage and specific folder permissions for the web server to access images.

```bash
cd /home/nolita/htdocs/nolita.com.ar/nolita/admin/backend
php artisan storage:link

# Permissions (Traversable by Nginx)
chmod 755 /home/nolita /home/nolita/htdocs /home/nolita/htdocs/nolita.com.ar /home/nolita/htdocs/nolita.com.ar/nolita
chmod -R 755 storage bootstrap/cache public
```

## Notes

- Ports 3000 and 3001 are occupied by other services (user studiovimana).
- Next.js uses port 3002.
- Laravel uses port 8000.
- All technical assets (code, builds) are owned by the `nolita` user.

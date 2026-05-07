# Production Deployment - soyplanb.com.ar

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
                    MySQL (soyplanbdb)
```

## Ports

| Port | Service | Root |
|------|---------|------|
| 443 | Nginx (HTTPS) | Main entry point |
| 8000 | Laravel API | admin/backend/public |
| 3002 | Next.js | web/ |

## Domains

- **Frontend**: `https://soyplanb.com.ar`
- **Admin Panel**: `https://soyplanb.com.ar/vadmin`
- **API**: `https://soyplanb.com.ar/api`

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
  server_name soyplanb.com.ar;
  root /home/soyplanb/htdocs/soyplanb.com.ar/planb/admin/backend/public;
  index index.php;
  # ... (PHP-FPM configuration)
}
```

## Starting Services

### Laravel API
The API is served by Nginx on port 8000 using PHP-FPM. Ensure the permissions for `storage` and `bootstrap/cache` are correctly set.

### Next.js (PM2)
The storefront is managed by PM2 under the `soyplanb` user.

```bash
cd /home/soyplanb/htdocs/soyplanb.com.ar/planb/web
# Build
corepack pnpm build
# Start/Restart
pm2 restart planb-web
# If not started yet:
pm2 start npm --name "planb-web" -- run start -- -p 3002
```

## Admin Frontend

The admin frontend is a static Vite SPA. It must be built and then served by Nginx.

```bash
cd /home/soyplanb/htdocs/soyplanb.com.ar/planb/admin/frontend
corepack pnpm build
```

## Environment Variables

### Laravel (.env)
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://soyplanb.com.ar`

### Web Frontal (.env.production)
- `NEXT_PUBLIC_VADMIN_API_URL=https://soyplanb.com.ar/api`
- `NEXTJS_REVALIDATE_TOKEN=<shared-secret>`

### Storefront Cache Revalidation
Because Nginx proxies public `/api/*` requests to Laravel, VADMIN should call the Next.js revalidation route directly through the local PM2 port:

```bash
NEXTJS_REVALIDATE_WEBHOOK_URL=http://127.0.0.1:3002/api/revalidate
NEXTJS_REVALIDATE_TOKEN=<same-shared-secret-as-web>
```

Set these variables in `admin/backend/.env`, then clear cached Laravel config after deploy.

## Storage & Permissions

Laravel requires a symbolic link for the public storage and specific folder permissions for the web server to access images.

```bash
cd /home/soyplanb/htdocs/soyplanb.com.ar/planb/admin/backend
php artisan storage:link

# Permissions (Traversable by Nginx)
chmod 755 /home/soyplanb /home/soyplanb/htdocs /home/soyplanb/htdocs/soyplanb.com.ar /home/soyplanb/htdocs/soyplanb.com.ar/planb
chmod -R 755 storage bootstrap/cache public
```

## Notes

- Ports 3000 and 3001 are occupied by other services (user studiovimana).
- Next.js uses port 3002.
- Laravel uses port 8000.
- All technical assets (code, builds) are owned by the `soyplanb` user.

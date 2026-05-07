# Plan B Deployment

Production build helpers live in the repository root.

## Build Web Storefront

First time on the production server:

```bash
chmod +x build-web.sh build-admin.sh
```

```bash
./build-web.sh
```

The script checks:

- `web/.env.production` exists.
- `admin/backend/.env` exists.
- `NEXT_PUBLIC_VADMIN_API_URL` is `https://soyplanb.com.ar/api`.
- `NEXTJS_REVALIDATE_TOKEN` exists in both web and backend env files.
- Web and backend revalidation tokens match.
- `NEXTJS_REVALIDATE_WEBHOOK_URL` is `http://127.0.0.1:3002/api/revalidate`.
- `corepack`, `pnpm`, and `pm2` are available.

Then it runs:

```bash
cd web
corepack pnpm install --frozen-lockfile
corepack pnpm build
pm2 restart planb-web
```

Optional overrides:

```bash
PM2_APP_NAME=planb-web ./build-web.sh
EXPECTED_WEBHOOK_URL=http://127.0.0.1:3002/api/revalidate ./build-web.sh
```

## Build Admin Panel

```bash
./build-admin.sh
```

The script checks:

- `admin/frontend/package.json` exists.
- `admin/frontend/package-lock.json` exists.
- `npm` is available.

Then it runs:

```bash
cd admin/frontend
npm ci
npm run build
```

The admin panel is static. Nginx serves `admin/frontend/dist`, so PM2 is not restarted for admin builds.

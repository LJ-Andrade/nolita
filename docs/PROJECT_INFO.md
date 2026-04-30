# Plan B - Project Information

## Overview

Plan B is split into two main applications:

- `admin/`: VADMIN, the internal administration system.
- `web/`: Public e-commerce storefront.

VADMIN is the official backend provider for the whole project. The storefront must fetch data from VADMIN through `web/lib/vadmin`. Shopify code and environment variables are deprecated.

## Project Structure

```text
planb/
+-- admin/
|   +-- backend/      # Laravel API used by the admin panel and storefront
|   +-- frontend/     # React/Vite VADMIN panel
+-- web/              # Next.js 15 storefront
+-- docs/             # Project documentation, specs, roadmap, and dev log
```

## Applications

### VADMIN Backend

Path: `admin/backend`

Laravel API that owns the project data and business logic:

- Authentication and profile endpoints.
- Blog/content endpoints.
- Catalog endpoints for products, categories, tags, colors, sizes, variants, and coupons.
- Customer auth and order endpoints for the storefront.
- Database migrations, models, controllers, resources, seeders, and API routes.

Key files:

- `admin/backend/routes/api.php`
- `admin/backend/app/Http/Controllers/`
- `admin/backend/app/Models/`
- `admin/backend/app/Http/Resources/`
- `admin/backend/database/migrations/`

### VADMIN Panel

Path: `admin/frontend`

React/Vite administration panel used to manage VADMIN data:

- Dashboard and admin navigation.
- Blog/content management.
- Catalog management.
- Product categories, tags, colors, sizes, coupons, products, variants, media, and stock fields.
- RBAC, dark/light mode, internationalization, media upload, and activity logs.

Key files:

- `admin/frontend/src/App.jsx`
- `admin/frontend/src/views/`
- `admin/frontend/src/components/`
- `admin/frontend/src/i18n/locales/`

### Storefront

Path: `web`

Next.js 15 App Router storefront used by public customers:

- Product and collection pages.
- Cart and checkout.
- Customer login/register flows.
- Delivery and payment method selection.
- Maintenance page when the VADMIN API is unreachable.

Key files:

- `web/app/`
- `web/components/`
- `web/lib/vadmin/`
- `web/app/maintenance/page.tsx`
- `web/.env.local`

## Data Flow

```text
admin/frontend --REST--> admin/backend
web            --REST--> admin/backend
```

Rules:

- `admin/backend` is the source of truth.
- `admin/frontend` manages data through VADMIN API routes.
- `web` consumes VADMIN data through `web/lib/vadmin`.
- Maintenance mode redirects the storefront to `/maintenance` when the VADMIN API is unavailable.
- Do not add new Shopify dependencies, Shopify fetchers, or `SHOPIFY_*` environment variables.

## Environment

- Production server: VPS with Nginx.
- Production database: MySQL.
- Local backend database: SQLite when `APP_ENV=local`.

## Commands

### VADMIN Backend

```bash
cd admin/backend
composer install
php artisan migrate
php artisan cache:clear
php artisan route:clear
php artisan config:clear
php artisan tinker
```

### VADMIN Panel

```bash
cd admin/frontend
npm install
npm run dev
npm run build
```

### Storefront

```bash
cd web
npm install
npm run dev
npm run build
```

## Main API Areas

### Admin Auth

- `POST /api/login`
- `GET /api/user`
- `PUT /api/profile`

### Catalog

- `/api/products`
- `/api/product-categories`
- `/api/product-tags`
- `/api/product-colors`
- `/api/product-sizes`
- `/api/coupons`

### Public Storefront

- `/api/public/products`
- `/api/public/products/{slug}`
- `/api/public/product-tags`
- Customer auth endpoints.
- Cart/order checkout endpoints.

## Documentation Map

- `docs/SPECS.md`: technical specifications and approved contracts.
- `docs/ROADMAP.md`: completed, active, and upcoming work.
- `docs/DEVLOG.md`: execution checklist and historical implementation notes.
- `docs/PROJECT_INFO.md`: high-level architecture and project orientation.

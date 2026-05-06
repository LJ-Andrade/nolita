# Plan B Storefront

A high-performance, server-rendered Next.js 15 application designed for the Plan B wholesale storefront.

> [!IMPORTANT]
> **This project uses the VADMIN (Laravel) API as its official backend.**
> The original Shopify implementation has been removed/deprecated. Do not attempt to use Shopify environment variables or providers.

## Key Features

- **Next.js 15 App Router**: Using React Server Components and Server Actions.
- **VADMIN Integration**: Custom data provider in `lib/vadmin` connecting to a Laravel REST API.
- **Maintenance Mode**: Automatic redirection to a static maintenance page if the API or Database is unreachable.
- **B2B Focus**: Designed for wholesale customers with custom authentication and cart logic.

## Environment Variables

You must configure the following in your `.env` file:

```bash
# Official Backend URL
NEXT_PUBLIC_VADMIN_API_URL="http://localhost:8000/api"

# Site Settings
SITE_NAME="Plan B Store"
COMPANY_NAME="Plan B"
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Ensure the VADMIN (Laravel) backend is running at the URL specified in `NEXT_PUBLIC_VADMIN_API_URL`.

## Running Admin Frontend Tests

CRUD shared component tests live in `admin/frontend`.

Install dependencies from the admin frontend folder:

```bash
cd ../admin/frontend
npm install
```

Run the full test suite once:

```bash
npm run test:run
```

Run tests in watch mode:

```bash
npm run test
```

Run one test file:

```bash
npm run test:run -- src/components/bulk-actions-bar.test.jsx
```

Current CRUD shared tests cover:

- `src/components/bulk-actions-bar.test.jsx`
- `src/components/crud-pagination.test.jsx`
- `src/hooks/use-bulk-select.test.jsx`

These tests validate shared selection, pagination, and bulk action behavior before checking full CRUD pages manually.

## Architecture

- **Frontend**: Next.js 15 in the `/web` directory.
- **Backend Provider**: `lib/vadmin` contains all logic for products, categories, cart, and authentication.
- **Global Layout**: Located in `app/(store)/layout.tsx`, provides consistent Navigation, Page Headers, and Footers.
- **Maintenance**: `vadminFetch` utility in `lib/vadmin/index.ts` handles global error catching and redirection to `/maintenance`.

---
*Based on the Next.js Commerce template, migrated to VADMIN by the Plan B Dev Team.*

# Development Checklist (DEVLOG)

This document tracks execution steps. One task per logical unit.

## Phase 47: Nolita Project Rebrand and Home Direction
1. [x] `docs/SPECS.md`: Document Nolita brand, development API URL, and home top/hero direction.
2. [x] Environment and app config: Replace legacy brand development names, `planb.test`, and local database references with Nolita values.
3. [x] Storefront chrome: Replace legacy visible branding with Nolita fallbacks.
4. [x] `web/app/(store)/page.tsx` and navbar: Update home metadata, top bar, and hero composition to match the Nolita reference direction.
5. [ ] Validation: Run focused checks for the storefront and search for remaining project-owned legacy brand references.

## Phase 46: Product Media Integrity
1. [x] `docs/SPECS.md`: Document product media cleanup and unique media URL behavior.
2. [x] `admin/backend/app/Http/Controllers/ProductController.php` and `ProductResource.php`: Use unique filenames, scoped media updates, model-aware product deletion, and skip missing media URLs.
3. [x] `admin/backend/app/Console/Commands/CustomMigrate.php`: Clean product media files and records when resetting product data.
4. [x] Validation: Run focused backend syntax and route checks.

## Phase 45: Consolidated Statistics Index Migrations
1. [x] `docs/SPECS.md`: Document that sales statistics indexes live in base order migrations for fresh installs.
2. [x] `admin/backend/database/migrations/2026_04_15_000000_create_orders_table.php`: Add the order status/date statistics index to the base table migration.
3. [x] `admin/backend/database/migrations/2026_04_15_000001_create_order_items_table.php`: Add order/product lookup indexes to the base table migration.
4. [x] `admin/backend/database/migrations/2026_05_13_000001_add_statistics_indexes_to_orders_tables.php`: Remove the now-redundant additive migration.
5. [x] Validation: Run focused migration syntax and route checks.

## Phase 44: Admin User Role Restrictions
1. [x] `docs/SPECS.md`: Document Admin and Super Admin behavior for users, roles, and permissions.
2. [x] `admin/backend/app/Http/Controllers/UserController.php` and `routes/api.php`: Add assignable roles endpoint and enforce Super Admin modification restrictions.
3. [x] `admin/backend/database/seeders/RoleSeeder.php`: Stop assigning role-management permissions to Admin.
4. [x] `admin/frontend/src/App.jsx`, `app-sidebar.jsx`, and user views: Gate roles/permissions to Super Admin, use correct user permissions, and translate role labels.
5. [x] Validation: Run focused backend lint and admin frontend build/lint checks.

## Phase 43: Statistics Role Access Simplification
1. [x] `docs/SPECS.md`: Document role-based statistics access for Super Admin and Admin.
2. [x] `admin/backend/routes/api.php` and `StatisticsController.php`: Replace fine-grained statistics permission middleware with role authorization.
3. [x] `admin/frontend/src/App.jsx`, `app-sidebar.jsx`, and `Statistics.jsx`: Gate the section by role and show both tabs to authorized users.
4. [x] `admin/backend/database/seeders/*`: Stop assigning statistics access to Employee through seeded permissions.
5. [x] Validation: Run focused backend and admin frontend checks.

## Phase 42: Statistics UX and Permissions
1. [x] `docs/SPECS.md`: Document statistics permissions, category filters, CSV export, opportunities, cache, and sales comparison.
2. [x] `admin/backend/database/seeders/PermissionSeeder.php`: Add statistics permissions.
3. [x] `admin/backend/database/seeders/RoleSeeder.php`: Assign statistics permissions to roles.
4. [x] `admin/backend/app/Http/Controllers/Api/Admin/StatisticsController.php`: Add category filters, opportunities, cache, and sales comparison.
5. [x] `admin/frontend/src/views/statistics/*`: Add permissions, category filters, opportunities, empty-state actions, and CSV export.
6. [x] `admin/frontend/src/App.jsx` and `app-sidebar.jsx`: Switch statistics access to `view statistics`.
7. [x] Validation: Run focused backend and admin frontend checks.

## Phase 41: Admin Order Inline Status Editing
1. [x] `docs/SPECS.md`: Document inline status editing behavior for the admin orders list.
2. [x] `admin/frontend/src/views/orders/OrdersList.jsx`: Add an inline order status dropdown using the existing admin update endpoint.
3. [x] Validation: Run focused admin frontend checks.

## Phase 40: Sales Statistics Performance
1. [x] `docs/SPECS.md`: Document sales period filtering and database index requirements.
2. [x] `admin/backend/database/migrations/*_add_statistics_indexes_to_orders_tables.php`: Add indexes for sales statistics queries.
3. [x] `admin/backend/app/Http/Controllers/Api/Admin/StatisticsController.php`: Add `period` filtering with default `30d`.
4. [x] `admin/frontend/src/views/statistics/SalesStatistics.jsx`: Add period controls and send the selected period.
5. [x] Validation: Run focused backend and admin frontend checks.

## Phase 39: Sales Statistics Analytics
1. [x] `docs/SPECS.md`: Document sales analytics endpoint and UI behavior.
2. [x] `admin/backend/app/Http/Controllers/Api/Admin/StatisticsController.php`: Add sales analytics endpoint.
3. [x] `admin/backend/routes/api.php`: Register the admin sales statistics route.
4. [x] `admin/backend/database/seeders/OrderSeeder.php`: Create demo orders and order items.
5. [x] `admin/backend/database/seeders/DatabaseSeeder.php`: Run demo orders after products and favorites exist.
6. [x] `admin/frontend/src/views/statistics/SalesStatistics.jsx`: Render sales KPIs and ranked product table.
7. [x] `admin/frontend/src/views/statistics/Statistics.jsx`: Use the sales analytics component in the tab.
8. [x] Validation: Run focused backend and admin frontend checks.

## Phase 38: Storefront Mobile Catalog Filters
1. [x] `docs/SPECS.md`: Document mobile catalog filter drawer behavior.
2. [x] `web/components/catalog/filter-sidebar.tsx`: Allow the existing filter UI to render cleanly inside mobile surfaces.
3. [x] `web/components/catalog/mobile-filter-drawer.tsx`: Add a mobile-only filter drawer that reuses catalog categories and sizes.
4. [x] `web/components/catalog/sort-bar.tsx`: Add a mobile filter trigger next to catalog count/sort controls.
5. [x] `web/app/(store)/catalog/page.tsx`: Pass filter data into the mobile trigger while preserving the desktop sidebar.
6. [x] Validation: Run the storefront build.

## Phase 37: Favorites Statistics Analytics
1. [x] `docs/SPECS.md`: Document favorites analytics endpoint and UI behavior.
2. [x] `admin/backend/app/Models/Product.php`: Add the customer favorites relationship.
3. [x] `admin/backend/app/Http/Controllers/Api/Admin/StatisticsController.php`: Add favorites analytics endpoint.
4. [x] `admin/backend/routes/api.php`: Register the admin statistics route.
5. [x] `admin/backend/database/seeders/CustomerFavoriteSeeder.php`: Create demo customers and favorite assignments.
6. [x] `admin/backend/database/seeders/DatabaseSeeder.php`: Run the favorites seeder after products exist.
7. [x] `admin/frontend/src/views/statistics/FavoritesStatistics.jsx`: Render favorites KPIs and ranked product table.
8. [x] `admin/frontend/src/views/statistics/Statistics.jsx`: Use the favorites analytics component in the tab.
9. [x] Validation: Run focused backend and admin frontend checks.

## Phase 36: Admin Tabbed Section Standard
1. [x] `admin/frontend/src/components/admin-tabbed-section.jsx`: Extract reusable tabbed admin section component.
2. [x] `admin/frontend/src/views/statistics/Statistics.jsx`: Use the shared tabbed section component.
3. [x] `docs/standards/ADMIN_TABBED_SECTION_STANDARDS.md`: Document the reusable pattern.
4. [x] `docs/README.md`: Add the new standard to the documentation index.
5. [x] Validation: Run focused admin frontend checks.

## Phase 35: Admin Statistics Section
1. [x] `docs/SPECS.md`: Document the initial admin statistics section contract.
2. [x] `admin/frontend/src/views/statistics/Statistics.jsx`: Create the statistics view with breadcrumb, tabs, and placeholder cards.
3. [x] `admin/frontend/src/App.jsx`: Register the `/estadisticas` protected route.
4. [x] `admin/frontend/src/components/app-sidebar.jsx`: Add the "Estadísticas" sidebar item.
5. [x] Validation: Run focused admin frontend checks.

## Phase 34: Responsive Home Hero Image
1. [x] `docs/SPECS.md`: Document responsive hero image keys and admin layout behavior.
2. [x] `admin/backend/app/Http/Controllers/SiteContentController.php`: Save the mobile hero image with a fixed predictable filename.
3. [x] `admin/frontend/src/views/site/ContentSettings.jsx`: Add desktop/mobile hero uploads in one responsive row and persist both site content keys.
4. [x] `web/app/(store)/page.tsx`: Render the mobile hero image on small viewports with desktop fallback.
5. [x] Validation: Run focused backend syntax and frontend build checks.

## Phase 15: Storefront Mobile Navigation Responsiveness (Completed)
1. [x] `web/components/layout/navbar/mobile-menu.tsx`: Keep the mobile drawer white in all themes.
2. [x] `web/components/layout/navbar/mobile-menu.tsx`: Add the authenticated user links available from the desktop user menu.
3. [x] `web/components/layout/navbar/mobile-menu.tsx`: Add clear account action icons and preserve logout behavior.
4. [x] Validation: Run the storefront build.

## Phase 13: Agent and Documentation Organization (Completed)
- [x] `AGENTS.md`: Replace brittle orchestration rules with Codex-compatible workflow, documentation ownership, and project guardrails.
- [x] `docs/README.md`: Add documentation index and update rules.
- [x] `docs/SPECS.md`: Add documentation governance and document ownership section.

## Phase 14: Storefront Auth Pricing, Size Curves, Favorites, Logout, and Discounts (Completed)
1. [x] `docs/SPECS.md`: Define authenticated pricing and product discount behavior.
2. [x] `web/app/(store)/page.tsx`: Load customer session and favorites for featured product cards.
3. [x] `web/components/catalog/product-card.tsx`: Hide prices for guests and render discount pricing for customers.
4. [x] `web/components/product/product-description.tsx`: Hide prices for guests, render discount pricing, and add size curve action.
5. [x] `web/components/product/add-size-curve-button.tsx`: Add shared size curve button for product cards and detail page.
6. [x] `web/app/(store)/login/page.tsx`: Add password visibility toggle.
7. [x] `web/components/layout/navbar/*`: Clear and close cart UI during logout.
8. [x] `web/lib/vadmin/types.ts`: Add discount and compare-at pricing fields.
9. [x] `admin/backend/app/Http/Controllers/Api/CatalogController.php`: Return discounted price metadata.
10. [x] `admin/backend/app/Http/Controllers/Api/OrderController.php`: Use discounted effective price for cart and checkout totals.
11. [x] `web/components/cart/*` and checkout summary: Display discounted line prices when available.
12. [x] Validation: Run focused TypeScript/build and PHP syntax checks.

## Phase 2: Definition (Completed)
- [x] Create initial `SPECS.md` proposing the Data Contracts.
- [x] User approve Option B (Product Variants) and Professional eCommerce features.

## Phase 3: Planning (Next)
Once SPECS are approved, the actionable checklist will be expanded.

### Step 1: Backend Setup
- [x] Create `ProductCategory` Model, Migration, Factory, Setup Controller & Routes (Differentiating from Blog Category)
- [ ] Create `Color` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Size` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Tag` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Coupon` Model, Migration, Factory, Setup Controller & Routes
- [ ] Create `Product` Model, Migration, Factory, FormRequests, Resource, Controller & Routes
- [ ] Create `ProductVariant` Model, Migration, Factory, Setup Controller & Routes
- [ ] Setup relationships (Pivots/HasMany: `Product` HasMany `ProductVariant`, `ProductCategory` HasMany `Product` etc.)
- [ ] Implement Image handling (Spatie Media Library or basic Storage) for `Product` (thumb/gallery) and `ProductVariant` (image).

### Step 2: Frontend API Integration
- [x] Setup Axios service for `ProductCategory`
- [ ] Setup Axios service for Products

### Step 3: Admin UI Construction
- [ ] Build Taxonomy CRUD
  - [x] Product Categories CRUD
- [ ] Build Products CRUD
  - [ ] Product List Table (Pagination, Filters)
  - [ ] Product Form (Draft vs Published statuses, SEO fields)
  - [ ] Media Uploader Component (Thumb + Gallery)
  - [ ] Taxonomy selectors (Categories, Tags)
  - [ ] **Variant Manager Interface**: UI to generate and edit `ProductVariants` (assigning colors, sizes, SKUs, and stock).

## Phase 4: E-commerce Integration (Current)
- [x] `web`: Create Next.js Commerce application inside `web/` using Vercel template.
- [x] `admin/config/cors.php`: Configure CORS in VADMIN to allow requests from e-commerce domain.
- [x] `admin/database/migrations/xxxx_create_orders_table.php`: Create Orders migration in VADMIN.
- [x] `admin/database/migrations/xxxx_create_order_items_table.php`: Create OrderItems migration.
- [x] `admin/app/Models/Order.php`: Create Order Model in VADMIN.
- [x] `admin/app/Models/OrderItem.php`: Create OrderItem Model in VADMIN.
- [x] `admin/app/Http/Controllers/Api/OrderController.php`: Create REST endpoints for creating and viewing Orders.
- [x] `admin/app/Http/Controllers/Api/CustomerAuthController.php`: Create Auth endpoints for Customer Login & Register.
- [x] `admin/routes/api.php`: Register new API routes for auth, products, and orders.
- [ ] `web/lib/vadmin/index.ts`: Implement Next.js Commerce custom provider data fetching (Products, Collections).
- [ ] `web/lib/vadmin/auth.ts`: Implement Auth fetching logic (Login, Register).
- [ ] `web/components/cart/actions.ts`: Adapt cart logic to use VADMIN custom provider.
- [ ] `web/.env.local`: Add ENV variables pointing to VADMIN API.
- [x] `admin/frontend/src/components/dashboard-layout.jsx`: Implement Dark Mode switch in user dropdown.
- [x] `admin/backend/database/migrations/..._create_product_variants_table.php`: Add min_stock.
- [x] `admin/backend/app/Models/ProductVariant.php`: Update fillable and casts.
- [x] `admin/frontend/src/views/products/ProductForm.jsx`: Add min_stock fields to variants table.
- [x] `admin/frontend/src/i18n/locales/*.json`: Add translations for min/max stock.
- [x] `web` & `admin/frontend`: Update `baseline-browser-mapping` and clear Next.js cache.

## Phase 5: Maintenance Mode & Shopify Deprecation (Completed)
- [x] `web/app/maintenance/page.tsx`: Create a premium maintenance page.
- [x] `web/lib/vadmin/index.ts`: Update `vadminFetch` to detect connection errors and redirect to `/maintenance`.
- [x] `web/app/(store)`: Isolate store routes to prevent redirect loops on maintenance.
- [x] `web/lib/vadmin`: Complete migration of legacy Shopify references (getPage, sitemaps, OG images).
- [x] `docs/SPECS.md` & `web/README.md`: Document VADMIN as the official backend provider.
- [x] `web`: Validate project with `npm run build`.

## Phase 6: Aesthetic Refinement (In Progress)
- [ ] `web/app/globals.css`: Implement `--pb-radius` token and global styles for `img` and `button`.
- [ ] `web/components/grid/tile.tsx`: Standardize border radius for product tiles.
- [ ] `web/components/product/gallery.tsx`: Apply border radius to gallery images and thumbnail buttons.
- [x] `web/app/(store)/checkout`: Implement full checkout page with shipping/payment selection.
- [x] `web/components/checkout`: Create checkout UI components (Form, Summary, Method Selector).
- [x] `web/lib/vadmin/methods.ts`: Implement delivery/payment methods fetching.

## Phase 7: Catalog Size Curve Feature
- [x] `web/components/cart/cart-context.tsx`: Add `ADD_MULTIPLE_ITEMS` action and `addMultipleCartItems` to `useCart`.
- [x] `web/components/cart/actions.ts`: Create `addMultipleItems` server action for adding an array of items.
- [x] `web/components/catalog/product-card.tsx`: Add "Agregar curva de talle" button and connect it to `addMultipleItems` action.

## Phase 9: Customer Provinces & Localities (Completed)
- [x] Create `Province` Model, Migration, Controller & Routes
- [x] Create `Locality` Model, Migration, Controller & Routes
- [x] Add prov_id and loc_id columns to customers table (migration)
- [x] Update `Customer` model: add relationships and fillable
- [x] Update `CustomerRequest`: add validation for prov_id/loc_id
- [x] Update `CustomerController`: handle prov_id/loc_id in store/update
- [x] Update `CustomerResource`: include province and locality data
- [x] Create `ProvinceController` and `LocalityController` with index endpoints
- [x] Admin: Update CustomerForm.jsx with province/locality selects (cascading)
- [x] Admin: Update CustomersList.jsx if needed (not needed - list doesn't show location)
- [x] Web: Update profile-form.tsx with province/locality fields
- [x] Web: Update checkout-form.tsx with province/locality fields
- [x] Web: Update CustomerSession type in vadmin/auth.ts
- [x] Web: Add `/api/provinces` and `/api/localities` Next.js routes

## Phase 8: Checkout Summary and Cart Image Adjustments
- [ ] `admin/backend/app/Http/Controllers/Api/OrderController.php`: Update cart loading to include `colorImages`.
- [ ] `web/lib/vadmin/types.ts`: Update `CartItem` type.
- [ ] `web/components/checkout/order-summary.tsx`: Enhance UI (remove items, show variant options, use color image).
- [ ] `web/components/cart/modal.tsx`: Use color image based on selected variant.

## Phase 10: Category Image, Listed & Order Fields
- [x] `admin/backend/database/migrations/...create_categories_table.php`: Add `image`, `listed`, `order` columns.
- [x] `admin/backend/app/Models/Category.php`: Update fillable.
- [x] `admin/frontend/src/hooks/use-crud-form.js`: Add `pendingCover` state for image preview.
- [x] `admin/frontend/src/views/product-categories/CategoryForm.jsx`: Add ImageUpload, order input, listed checkbox.
- [x] `admin/frontend/src/views/product-categories/CategoriesList.jsx`: Add columns for image, order, listed.

## Phase 11: CORS & Network Fixes (Completed)
- [x] `admin/backend/config/cors.php`: Update `allowed_origins` and `allowed_origins_patterns` to allow local network IPs (172.x, 10.x).
- [x] `admin/backend/.env`: Add `SANCTUM_STATEFUL_DOMAINS` with the frontend origin.
- [x] `admin/frontend/src/components/ui/DeepSpaceBackground.jsx`: Fix z-index of stars and connections to be behind login card.
- [x] `admin/frontend/src/views/Login.jsx`: Remove borders from Card and Inputs for a minimalist look.
- [x] `admin/frontend/src/components/ui/DeepSpaceBackground.jsx`: Refactor with tunable constants (CONFIG), HEX color support, and configurable 2-color background gradient.

## Phase 12: CRUD Shared Component Tests (Completed)
- [x] `admin/frontend/src/components/bulk-actions-bar.jsx`: Fix selected count references in shared bulk action UI.
- [x] `admin/frontend/src/components/crud-pagination.jsx`: Fix numbered page click handler.
- [x] `admin/frontend/package.json`: Add Vitest test scripts and React Testing Library dependencies.
- [x] `admin/frontend/vite.config.js`: Add jsdom test environment configuration.
- [x] `admin/frontend/src/test/setup.js`: Add test environment setup for DOM APIs.
- [x] `admin/frontend/src/components/bulk-actions-bar.test.jsx`: Cover empty state, selected count, clear, and confirm delete behavior.
- [x] `admin/frontend/src/components/crud-pagination.test.jsx`: Cover hidden single-page state and page navigation.
- [x] `admin/frontend/src/hooks/use-bulk-select.test.jsx`: Cover single, all, and clear selection behavior.

## Phase 13: Admin Frontend Lint Cleanup (Completed)
- [x] `admin/frontend/eslint.config.js`: Configure Node globals for scripts/config files and keep lint focused on runtime errors.
- [x] `admin/frontend/src/components/*` and `admin/frontend/src/views/*`: Fix malformed identifiers reported by `no-undef`.
- [x] `admin/frontend/src/views/products/ProductForm.jsx`: Restore `applyToAllStock` variant bulk action.
- [x] `admin/frontend/src/views/*List.jsx`: Fix broken checkbox handlers generated as malformed function names.
- [x] `admin/frontend`: Validate `npm run lint`, `npm run test:run`, and `npm run build`.

## Phase 14: Content Settings Visual Alignment (Completed)
- [x] `admin/frontend/src/views/site/ContentSettings.jsx`: Align content settings cards, labels, descriptions, and input styling with standard CRUD cards.
- [x] `admin/frontend`: Validate `npm run lint` and `npm run build`.

## Phase 15: Notification Preferences Fix (Completed)
- [x] `admin/backend/app/Models/User.php`: Add notification type eligibility checks and default subscriptions to disabled.
- [x] `admin/backend/app/Models/User.php`: Pass role names as arrays to Spatie role checks so eligible notification types are visible.
- [x] `admin/backend/app/Models/User.php`: Keep in-app notification subscriptions enabled by default.
- [x] `admin/backend/app/Models/NotificationType.php`: Add `required_permission` to assignable notification type fields.
- [x] `admin/backend/app/Http/Controllers/Api/NotificationPreferenceController.php`: Return disabled defaults and create preferences with disabled channels before toggling.
- [x] `admin/backend/app/Models/UserNotificationPreference.php`: Align helper toggle defaults with explicit opt-in behavior.
- [x] `admin/backend/app/Services/NotificationService.php`: Pass role names as arrays when selecting notification subscribers.
- [x] `admin/backend/app/Services/NotificationService.php`: Always create in-app admin notifications for every eligible user and keep email controlled by user preference.
- [x] `admin/frontend/src/views/NotificationPreferences.jsx`: Align switch fallback state with backend disabled defaults.
- [x] `admin/frontend/src/views/NotificationPreferences.jsx`: Update local switch state using API channel field names.
- [x] `admin/backend/resources/views/emails/admin-notification.blade.php`: Remove internal notification type from user-facing emails.
- [x] `docs/SPECS.md`: Document notification preference visibility and explicit opt-in behavior.
- [x] `admin/backend/SYSTEM_SETUP.md`: Document queue worker setup for notification email delivery.
- [x] `admin/backend/SYSTEM_SETUP.md`: Clarify production runs on Debian and Windows is development-only.
- [x] `admin/backend/SYSTEM_SETUP.md`: Document notification type role visibility rules.
- [x] `admin/backend/NOTIFICATIONS.md`: Move notification behavior and role visibility documentation out of setup docs.
- [x] `admin/backend/SYSTEM_SETUP.md`: Keep notification setup documentation focused on startup, workers, and seed commands.
- [x] Validate backend routes/tests and admin frontend lint/build/test suite.

## Phase 16: Checkout Validation Fix (Completed)
- [x] `web/app/(store)/checkout/actions.ts`: Validate required checkout fields and send province/locality IDs with city derived from locality.
- [x] `web/components/checkout/checkout-form.tsx`: Require province and locality selects and include hidden city/locality name fields.
- [x] `admin/backend/app/Http/Controllers/Api/OrderController.php`: Validate province/locality, derive city server-side, and update customer only after successful order completion.
- [x] `docs/SPECS.md`: Document checkout validation and customer persistence behavior.

## Phase 17: Catalog Category Filtering Fix (Completed)
- [x] `docs/SPECS.md`: Document catalog category filtering contract.
- [x] `web/lib/vadmin/index.ts`: Pass category slug to VADMIN product catalog endpoint.
- [x] `web/app/(store)/catalog/page.tsx`: Remove permissive category fallback that displayed all products.

## Phase 18: User Menu Visual Refinement
- [x] `web/components/layout/navbar/user-menu.tsx`: Remove border from UserMenu button and placeholder.
- [x] `web/components/layout/navbar/user-menu.tsx`: Remove ring from UserMenu dropdown and enhance shadow (`shadow-2xl`).

## Phase 19: Logo Refinement
- [x] `web/components/layout/navbar/index.tsx`: Remove isologo (icon) from header.
- [x] `web/components/layout/footer.tsx`: Remove isologo (icon) from footer.

## Phase 20: Home UI Alignment
- [x] `web/app/(store)/page.tsx`: Update "Nuevos ingresos" section background to match store background.

## Phase 21: Business Content Storage
- [x] `docs/SPECS.md`: Document public business contact/social fields as `site_contents`.
- [x] `admin/backend/database/seeders/BusinessSettingsSeeder.php`: Remove public contact/social keys from system settings seed data.
- [x] `admin/backend/database/seeders/SiteContentSeeder.php`: Seed public business contact/social keys in `site_contents`.
- [x] `admin/backend/database/seeders/DatabaseSeeder.php`: Register `SiteContentSeeder`.
- [x] `admin/backend/app/Models/SiteContent.php`: Add helpers for business content keys.
- [x] `admin/backend/app/Http/Controllers/SystemSettingsController.php`: Serve public business info from `site_contents`.
- [x] `admin/frontend/src/views/settings/BusinessInfoSettings.jsx`: Read and write business fields through `/site-content`.
- [x] Validate backend and frontend.

## Phase 22: Storefront Cache Revalidation
- [x] `docs/SPECS.md`: Document webhook, tags, and admin-triggered revalidation contract.
- [x] `web/lib/constants.ts`: Add storefront cache tags for site content and shop configuration.
- [x] `web/lib/vadmin/index.ts`: Tag cached VADMIN fetches and implement revalidation.
- [x] `web/app/api/revalidate/route.ts`: Return a NextResponse from the revalidation handler.
- [x] `web/.env.example`: Document shared revalidation token.
- [x] `admin/backend/app/Services/StorefrontRevalidationService.php`: Add resilient webhook client.
- [x] `admin/backend/app/Http/Controllers/ProductController.php`: Trigger product cache revalidation after catalog writes.
- [x] `admin/backend/app/Http/Controllers/ProductCategoryController.php`: Trigger collection cache revalidation after category writes.
- [x] `admin/backend/app/Http/Controllers/SiteContentController.php`: Trigger site content cache revalidation after content writes.
- [x] `admin/backend/app/Http/Controllers/ShopConfigurationController.php`: Trigger shop configuration cache revalidation after configuration writes.
- [x] `admin/backend/.env.example`: Document Next.js revalidation variables.
- [x] `docs/DEPLOY_INFO.md`: Document production revalidation environment variables and local Next.js webhook URL.
- [x] Validate TypeScript build and PHP syntax.

## Phase 23: Storefront Revalidation Coverage
- [x] `web/lib/constants.ts`: Add checkout method cache tag.
- [x] `web/lib/vadmin/index.ts`: Allow checkout method tag in revalidation endpoint.
- [x] `admin/backend/app/Services/StorefrontRevalidationService.php`: Add checkout method tag constant.
- [x] `admin/backend/app/Http/Controllers/ProductSizeController.php`: Trigger catalog revalidation after size writes.
- [x] `admin/backend/app/Http/Controllers/ProductColorController.php`: Trigger catalog revalidation after color writes.
- [x] `admin/backend/app/Http/Controllers/ProductTagController.php`: Trigger catalog revalidation after product tag writes.
- [x] `admin/backend/app/Http/Controllers/PaymentMethodController.php`: Trigger checkout revalidation after payment method writes.
- [x] `admin/backend/app/Http/Controllers/DeliveryMethodController.php`: Trigger checkout revalidation after delivery method writes.
- [x] Validate TypeScript build and PHP syntax.

## Phase 24: Production Build Scripts
- [x] `build-web.sh`: Add production web build script with env, token, webhook, dependency, build, and PM2 checks.
- [x] `build-admin.sh`: Add production admin panel build script.
- [x] `README.md`: Document production build script usage.

## Phase 25: Admin Data Exports
- [x] `docs/SPECS.md`: Document backend-owned export package strategy and orders export contract.
- [x] `admin/backend/composer.json`: Add Laravel Excel and Laravel DomPDF dependencies.
- [x] `admin/backend/app/Support/Exports/OrderExportQuery.php`: Centralize reusable order export filters.
- [x] `admin/backend/app/Exports/OrdersExport.php`: Create XLSX/CSV order export.
- [x] `admin/backend/resources/views/exports/orders.blade.php`: Create PDF order export template.
- [x] `admin/backend/app/Http/Controllers/Api/Admin/OrderExportController.php`: Create export endpoint.
- [x] `admin/backend/routes/api.php`: Register authenticated order export route.
- [x] `admin/frontend/src/views/orders/OrdersList.jsx`: Add authenticated export menu using current filters.
- [x] Validate backend syntax and admin frontend build.
- [x] `admin/backend/app/Support/Exports/OrderDocumentData.php`: Normalize single-order export data.
- [x] `admin/backend/app/Exports/OrderDocumentExport.php`: Create XLSX single-order export with header and item detail.
- [x] `admin/backend/resources/views/exports/order.blade.php`: Create no-image PDF/XLSX order document template.
- [x] `admin/backend/app/Http/Controllers/Api/Admin/OrderDocumentExportController.php`: Create single-order export endpoint.
- [x] `admin/frontend/src/views/orders/OrderDetails.jsx`: Add separate PDF and XLSX backend export buttons.
- [x] Validate single-order export syntax, routes, and admin frontend build.
- [x] `admin/backend/app/Support/Localization/Translator.php`: Add shared Spanish labels and value translations.
- [x] `admin/backend/resources/views/exports/order.blade.php`: Apply Spanish labels to order PDF/XLS document.
- [x] `admin/backend/app/Support/Exports/OrderDocumentData.php`: Add translated status and payment labels to document data.

## Phase 26: Admin Login Local Network CORS Fix
- [x] `admin/frontend/src/lib/axios.js`: Register `192.168.56.1` as a known local admin host.
- [x] `admin/backend/config/cors.php`: Allow `http://192.168.56.1:5173` as a local Vite origin.

## Phase 27: Storefront Home Product Sections
1. [x] `docs/SPECS.md`: Document reusable home product section behavior.
2. [x] `web/lib/vadmin/index.ts`: Allow storefront product fetching by featured flag.
3. [x] `web/components/home/product-section.tsx`: Create reusable home product grid section.
4. [x] `web/app/(store)/page.tsx`: Add untitled featured products section above "Nuevos ingresos".
5. [x] Validate the web build.

## Phase 28: Product Detail Related Products
1. [x] `docs/SPECS.md`: Document product detail related products behavior.
2. [x] `admin/backend/app/Http/Controllers/Api/CatalogController.php`: Expose product category metadata in the storefront catalog contract.
3. [x] `web/lib/vadmin/types.ts`: Add product category metadata to the storefront product type.
4. [x] `web/app/(store)/product/[handle]/page.tsx`: Render same-category related products above the footer.
5. [x] Validate the web build.

## Phase 29: Related Products Fallback Fill
1. [x] `docs/SPECS.md`: Document fallback behavior for related products.
2. [x] `web/app/(store)/product/[handle]/page.tsx`: Fill related products with random catalog items when same-category products are fewer than four.
3. [x] Validate the web build.

## Phase 30: Admin Product Order Inline Editing
1. [x] `docs/SPECS.md`: Document explicit product order save behavior.
2. [x] `admin/frontend/src/views/products/ProductsList.jsx`: Copy category order inline editing flow to products.
3. [x] Validate the admin frontend build and lint.

## Phase 31: CRUD Inline Order Editor Component
1. [x] `admin/frontend/src/components/crud-inline-order-editor.jsx`: Create reusable CRUD inline order editor.
2. [x] `admin/frontend/src/views/products/ProductsList.jsx`: Use shared inline order editor.
3. [x] `admin/frontend/src/views/product-categories/CategoriesList.jsx`: Use shared inline order editor.
4. [x] `docs/standards/CRUD_STANDARDS.md`: Document inline order editing standard.
5. [x] Validate the admin frontend build and lint.

## Phase 32: Storefront Footer Categories
1. [x] `docs/SPECS.md`: Document dynamic footer category links.
2. [x] `web/components/layout/footer.tsx`: Render all listed VADMIN categories in the footer and increase logo/social spacing.
3. [x] Validate the web build.

## Phase 33: Storefront Spanish Routes and Footer Category Filtering
1. [x] `docs/SPECS.md`: Document Spanish storefront routes and footer category rules.
2. [x] `web/components/layout/footer.tsx`: Show only categories with products and link them to catalog filters.
3. [x] `web/app/(store)`: Add Spanish route aliases for catalog, product, auth, checkout, and search.
4. [x] `web/next.config.ts`: Redirect legacy English paths to Spanish storefront paths.
5. [x] Update internal storefront links to Spanish routes.
6. [x] Validate the web build.

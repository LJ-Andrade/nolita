# Development Checklist (DEVLOG)

This document tracks execution steps. One task per logical unit.

## Phase 2: Definition (Completed)
- [x] Review initial requirements / `augusta-specs.txt`.
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

# Project Roadmap

## Completed

### Foundation
- [x] Fix sidebar floating links on collapsed sidebar
- [x] Add user dropdown in the top-right of the sidebar with avatar and logout/profile actions
- [x] Move activity log under the `System` parent menu
- [x] Add dashboard quick links for product, category, tag, coupon, color, and size creation
- [x] Create `web/` Next.js Commerce application
- [x] Configure VADMIN CORS for the e-commerce domain
- [x] Document VADMIN as the official backend provider in `docs/SPECS.md` and `web/README.md`
- [x] Validate the project with `npm run build`

### Products & Inventory
- [x] Integrate single image uploads per Product Color
- [x] Implement minimum and maximum stock levels per variant
- [x] Add `min_stock` to product variants database and UI
- [x] Update translations for min/max stock fields
- [x] Create `Color` model, migration, factory, setup controller, and routes
- [x] Create `Size` model, migration, factory, setup controller, and routes
- [x] Create `Tag` model, migration, factory, setup controller, and routes
- [x] Create `Coupon` model, migration, factory, setup controller, and routes
- [x] Create `Product` model, migration, factory, form requests, resource, controller, and routes
- [x] Create `ProductVariant` model, migration, factory, setup controller, and routes
- [x] Set up relationships between products, variants, categories, tags, colors, and sizes
- [x] Implement image handling for `Product` and `ProductVariant`

### Admin UI
- [x] Add dark mode switch in the user dropdown
- [x] Build Product Categories CRUD
- [x] Update baseline browser mapping and clear Next.js cache
- [x] Build products CRUD
- [x] Add products list table with pagination and filters
- [x] Add product form with draft/published states and SEO fields
- [x] Add media uploader for thumbnails and gallery
- [x] Add taxonomy selectors for categories and tags
- [x] Add variant manager UI for colors, sizes, SKUs, and stock
- [x] Create coupons module CRUD in backend and frontend

### Orders & Checkout
- [x] Create orders migration in VADMIN
- [x] Create order items migration in VADMIN
- [x] Create `Order` model in VADMIN
- [x] Create `OrderItem` model in VADMIN
- [x] Create REST endpoints for order creation and viewing
- [x] Create customer auth endpoints for login and register
- [x] Register new API routes for auth, products, and orders
- [x] Build checkout page with shipping and payment selection
- [x] Create checkout UI components
- [x] Implement delivery and payment methods fetching

### Maintenance & Migration
- [x] Create maintenance page in `web/app/maintenance/page.tsx`
- [x] Update `vadminFetch` to redirect to `/maintenance` on API connection failures
- [x] Isolate store routes to prevent maintenance redirect loops
- [x] Remove legacy Shopify references from `lib/vadmin`

## In Progress

### Frontend API Integration
- [ ] Implement `web/lib/vadmin/index.ts` for products and collections fetching
- [ ] Implement `web/lib/vadmin/auth.ts` for login and register flows
- [ ] Adapt `web/components/cart/actions.ts` to use VADMIN provider data
- [ ] Add `web/.env.local` variables for VADMIN API

### Orders Admin
- [ ] Create Vadmin views to list and manage orders
- [ ] Implement order detail view with payment, shipping, and customer status tracking

## Next Up

### Core Business Data
- [ ] Add favorites table for customers with `customer_id`, `product_id`, and timestamp
- [ ] Add admin listing for customer favorites

### Design System
- [ ] Add `--pb-radius` token and global media/button styles in `web/app/globals.css`
- [ ] Standardize border radius in product tiles
- [ ] Apply border radius to gallery images and thumbnail buttons

### Planned Enhancements
- [ ] Add coupon bulk delete endpoint and advanced filtering if the module expands
- [ ] Add stock alerts when variants go below `min_stock`

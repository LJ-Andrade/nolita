# Technical Specifications

## 0. Documentation Governance

### 0.1 Source of Truth

`docs/SPECS.md` defines intended product and technical behavior. It must describe what the system should do, not the step-by-step execution history.

### 0.2 Document Ownership

- `docs/PROJECT_INFO.md`: Stable architecture, commands, applications, and environment facts.
- `docs/SPECS.md`: Intended behavior, data contracts, workflow rules, and technical requirements.
- `docs/ROADMAP.md`: High-level project status.
- `docs/DEVLOG.md`: Active plans, per-file checklists, and implementation notes.
- `docs/DEPLOY_INFO.md`: Deployment and operations notes.
- `docs/standards/`: Reusable implementation standards.

### 0.3 Agent Workflow

For new or complex behavior, update this specification first, then track execution in `docs/DEVLOG.md`. For small fixes, update documentation only when the fix changes behavior, workflow, or project knowledge.

## 1. E-commerce Web Integration

### Overview

A new e-commerce project built with Next.js Commerce template. It resides in the `web` folder.
It communicates strictly via REST API with the existing VADMIN backend (Laravel).

### Windows Local Network Setup

- The repository root must include a Windows PowerShell setup script for development-machine deployments.
- The script must accept an explicit LAN host/IP and generate the matching admin frontend API URL.
- The script must support a direct API URL override and default to the local VADMIN API configured for the project, `http://nolita.test/api/`.
- The script must write Vite local environment overrides for the admin frontend so both dev and production-mode builds can target the same VADMIN API.
- The admin Vite dev server must support proxying `/api` to the local HTTP VADMIN backend so LAN clients do not need custom local DNS or certificates.
- The script must update the Laravel backend environment with `APP_URL`, `FRONTEND_URL`, and `SANCTUM_STATEFUL_DOMAINS` values that match the selected host.
- The script must avoid hardcoding one developer machine IP as source truth; the selected host must come from a parameter or local IPv4 auto-detection.
- The authenticated admin Axios client must prefer `VITE_API_URL` before hostname fallback mappings.

### Requirements

1. **Authentication:** Uses customers from VADMIN. Registering creates a record in the `customers` table of VADMIN.
2. **Products:** Products are created in VADMIN and queried via REST API by the Next.js e-commerce.
3. **Catalog Category Filtering:** The catalog must send the selected category slug to VADMIN through `GET /api/catalog/products?category={slug}` and must not show unrelated products when a category is active.
4. **Orders:** Create new models and tables in VADMIN for storing Customer Orders and their complete details.
5. **CORS:** Ensure CORS is configured properly in VADMIN to allow requests from the Web frontend.

### Storefront Home Sections

- The storefront brand for this project is Nolita.
- The home top bar must use a centered `NOLITA` wordmark, a compact retail/wholesale control on the right, and the cart action.
- The home top navigation must place the Nolita logo on the left.
- The home hero must render only the configured imagery, without text over the image.
- The home content after the hero must render the complete catalog grid using the same product cards as `/catalogo`.
- The home catalog grid must render the same editorial floating category, size, and sort filters as `/catalogo`.
- The category controls immediately below the home hero must show only VADMIN listed categories, ordered by their `order` value, and must not render an all-categories option.
- The home catalog grid must respect the active retail/wholesale storefront mode and VADMIN catalog visibility rules.
- Catalog product grids must render four product cards per row on desktop viewports.
- The home hero uses site content keys for responsive imagery:
  - `home_hero_banner`: required desktop/background image.
  - `home_hero_banner_mobile`: optional mobile image.
- Hero banner uploads must use unique storage filenames and may also include a cache-busting version query so the admin preview and storefront request the newly uploaded file immediately.
- The announcement bar above the home hero must use mode-specific VADMIN site content:
  - `home_top_text_retail`: text shown in retail mode.
  - `home_top_text_wholesale`: text shown in wholesale mode.
- The announcement bar text must update immediately when the storefront retail/wholesale control changes mode.
- `home_top_text` is a legacy fallback only and must not be the primary admin editing target.
- When `home_hero_banner_mobile` is present, the storefront must render it on small viewports and switch to `home_hero_banner` on medium and larger viewports.
- When `home_hero_banner_mobile` is missing, the storefront must fall back to the desktop hero image on all viewport sizes.
- The admin content editor must show desktop and mobile hero uploads in the same row on large screens, with the mobile upload in a narrower column, and stack them on smaller admin viewports.

### Storefront Product Detail

- Product detail pages must display a "Productos relacionados" section above the footer when same-category products exist.
- Related products are fetched from VADMIN using the current product category slug first, exclude the current product, and display four products whenever the catalog has enough other products.
- If fewer than four same-category products are available, the storefront fills the remaining slots with random products from any category, without duplicates.
- The catalog product contract must expose the product category slug and title so the storefront can request same-category related products.
- Product detail pages must use an editorial desktop layout with product media on the left and a sticky purchase panel on the right.
- On desktop, product media must render as a two-column image grid, not the thumbnail carousel. Clicking any image opens a full-screen image modal.
- On mobile, product media must render as a swipeable gallery with snap scrolling and pagination dots.
- Product media and catalog product card images must use a 5:7 portrait ratio, matching product uploads prepared at approximately 500 x 700 pixels.
- The purchase panel must follow the reference structure: title, price, description, color/size selectors, quantity control, add-to-cart action, and share action.
- The product detail add-to-cart button must render black when enabled and gray when disabled.
- Product rich text descriptions must preserve basic formatting from the admin editor with neutral storefront typography. Bold text must remain black/foreground, and the description block must not add lateral padding inside the product purchase panel.

### Storefront Footer

- The storefront navbar and footer must use the Nolita logo image asset from `web/public/logo-black.png` instead of text-only branding.
- The storefront favicon must use the Nolita favicon image asset from `web/public/favicon.png`.
- The storefront footer must follow the compact Nolita reference layout: logo on the left, terms link, business email, business phone, centered social icon row, copyright, and developer credit.
- The storefront footer must not render category columns, customer care columns, newsletter signup, or descriptive copy unless a future approved design asks for them.

### Storefront Spanish Routes

- Public storefront links must use Spanish route slugs:
  - `/catalogo` for catalog.
  - `/catalogo?categoria={slug}` for category filters.
  - `/producto/{handle}` for product detail.
  - `/registro` for customer registration.
  - `/ingreso` for customer login.
  - `/finalizar-compra` for checkout.
  - `/finalizar-compra/exito` for checkout success.
  - `/buscar` for search.
- Legacy English routes must remain available through redirects for compatibility.

### Storefront Catalog Filters

- Catalog filters must render as a floating bottom control bar over the catalog experience on desktop and mobile.
- The floating catalog filter bar must be hidden at the very top of the page and fade in progressively as the user scrolls down, so it does not interfere with the home hero.
- When the footer enters the viewport, the floating catalog filter bar must move upward and remain above the footer instead of covering footer content.
- The floating bar must expose category, color, and size dropdowns styled with the Nolita editorial visual direction.
- The "Filtrar" action must live on the right side of the sticky product grid header, render without a leading icon, and open the catalog ordering dropdown.
- The product grid header must show product count, active filter chips, and the right-aligned "Filtrar" action; it must not duplicate category, color, or size controls.
- The product grid header may remain sticky below the storefront navbar so active filters stay visible during catalog scrolling.
- Filter pills and dropdown panels may use soft rounded corners even when product cards and general storefront buttons remain square.
- Category, color, and size dropdowns must remain available without leaving the catalog page and must continue to update URL search params so filtered catalog URLs remain shareable.
- The catalog page must show a top category navigation row using VADMIN categories that currently have published products.
- The catalog sort control must render as an editorial dropdown on the right side of the product controls, with options for featured, newest, discount, and price ordering.
- Active filters and "Limpiar todo" behavior must stay consistent across the floating filter controls and the catalog product grid.
- Catalog filter accents, active category states, product count text, and sort/filter submenu active items must use `#C51162`.
- Floating filter buttons and the "Filtrar" sort button must use a 2px border radius.
- Open floating filter panels and the "Filtrar" sort menu must close when the user clicks outside them.

### Storefront Product Cards and Cart Chrome

- Product cards must not show a "Nuevo" badge.
- Product cards must place the favorite heart action at the top-left of the product image.
- The storefront navbar must expose the customer account action immediately to the left of the cart action on desktop and mobile.
- On mobile, the retail/wholesale mode control must render as a full-width bar above the navbar, with two equal-width buttons. The mobile navbar itself must not contain the mode control.
- The selected retail/wholesale mode control must show a small green status dot inside the active option on desktop and mobile.
- Changing the retail/wholesale mode must update client-rendered prices immediately without refreshing the current route. Do not call `router.refresh()`, `window.location.reload()`, navigation redirects, or any equivalent page reload as part of the mode switch, because route refreshes cause visible storefront image/layout flashes. The mode cookie must still be persisted so future page loads and server actions use the selected mode.
- The cart sidebar must use a black background with light text and controls that preserve readable contrast.
- The cart summary must hide the discounts row when the current cart discount total is zero.
- The cart sidebar must not open automatically when the storefront loads or refreshes with an existing cart. It may open after an explicit cart action or a new add-to-cart quantity increase.

### Admin Product Categories

- The product category form must keep category image support available in code and API compatibility, but the admin image upload control is hidden from the interface until explicitly re-enabled.

### Admin Product Ordering

- Product order edits in the admin product list must use explicit inline editing. Typing in the order input must not send API requests until the user confirms with Enter or the save check action.

### Product Media

- Product cover, gallery, and color images are managed through Spatie Media Library on the public disk.
- Product cover and gallery uploads in the admin product form must be cropped to a 5:7 portrait ratio and exported at approximately 500 x 700 pixels before upload.
- Product media filenames must be unique per upload so browsers and CDNs do not reuse stale images after product edits or database resets.
- Deleting one product or bulk deleting products must delete the related media records and stored product media files through model-aware deletion.
- Product gallery order updates must only affect media records owned by the product being updated.
- Product data resets through the custom migrate command must delete product media records and the `storage/app/public/products` directory to prevent reused product IDs from inheriting stale images.

### Admin Order Management

- The admin orders list must allow changing an order status directly from the status column, using the same inline dropdown interaction pattern as product status changes.
- Inline order status changes must use the existing VADMIN admin order update endpoint and support only `pending`, `processing`, `completed`, and `cancelled`.
- After a successful inline status change, the list should show the updated status without requiring the admin to open the order detail page.

### Admin User Role Management

- `Super Admin` users can view and manage all admin modules, users, roles, and permissions.
- `Admin` users can view the users section when they have `users.view`.
- `Admin` users must not access the roles or permissions sections.
- `Admin` users must not modify, delete, bulk-delete, or update avatars for users with the `Super Admin` role.
- The user create/edit form must expose only assignable roles for the acting user. For `Admin`, `Super Admin` must not be returned as an assignable role.
- The admin UI must display role labels in Spanish in the users list and user create/edit form.

> [!IMPORTANT]
> **OFFICIAL BACKEND: VADMIN**
> This project is 100% migrated to the **VADMIN** (Laravel) backend.
>
> - **DO NOT USE Shopify**: All `lib/shopify` references and `SHOPIFY_*` environment variables are legacy/deprecated and will be removed.
> - **Primary Provider**: Use `lib/vadmin` for all data fetching.
> - **API URL**: Set via `NEXT_PUBLIC_VADMIN_API_URL`.
> - **Nolita development API URL**: `http://nolita.test/api`.

### Architecture

- **Web App:** Next.js Commerce in `/web` directory.

### UI Customization

1. **Dark Mode:** The admin panel supports dark and light themes.
2. **Toggle:** A theme toggle (Switch) must be available in the user dropdown menu for quick access.
3. **Persistence:** Theme selection must persist across sessions using LocalStorage.

### Inventory Management

1. **Stock Levels:** Products must support minimum and maximum stock levels per variant.
2. **Alerts:** (Future) System should flag variants when stock is below `min_stock`.

---

## 2. Product Tags Enhancement

### 2.1 Overview

**Objective:** Align the Product Tags section with the Product Categories implementation to provide a consistent user experience, including bulk operations, advanced filtering, and standardized UI components.

### 2.2 Backend Changes

- **`bulkDelete(Request $request)`**: Implemented in `ProductTagController`.
- **API Routes**: `POST /api/product-tags/bulk-delete`.
- **Enhanced `index()`**: Added advanced filters (ID, Name).

---

## 3. Coupon Module

### 3.1 Data Contract (API)

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/api/coupons`             | List all coupons (paginated)     |
| GET    | `/api/coupons?all=1`       | List all coupons (no pagination) |
| GET    | `/api/coupons/{id}`        | Get single coupon                |
| POST   | `/api/coupons`             | Create coupon                    |
| PUT    | `/api/coupons/{id}`        | Update coupon                    |
| DELETE | `/api/coupons/{id}`        | Delete coupon                    |
| POST   | `/api/coupons/bulk-delete` | Bulk delete coupons              |

### 3.2 Request/Response Example (Create)

```json
{
  "code": "DESCUENTO20",
  "discount_type": "percentage",
  "amount": 20,
  "expires_at": "2026-12-31 23:59:59",
  "active": true
}
```

---

## 4. Maintenance Mode

### 4.1 Overview

**Objective:** Provide a graceful "Under Maintenance" state when the backend API is unreachable, preventing the application from displaying raw fetch errors to users.

### 4.2 Implementation

- **Connection Detection**: `vadminFetch` utility monitors for `TypeError: fetch failed` and specifically checks `ECONNREFUSED` in the error cause.
- **Automatic Redirection**: Upon detecting a connection failure, the application performs a server-side redirection to the `/maintenance` route.
- **Maintenance Page**: A standalone, static page located at `web/app/maintenance/page.tsx` that displays a premium maintenance message and branding. It must not perform any API calls to avoid infinite loops.

---

## 4.5 Error Monitoring

### 4.5.1 Overview

The system must report important production errors to Sentry across the VADMIN backend, admin frontend, and public storefront without changing user-facing recovery flows.

### 4.5.2 Scope

- VADMIN Laravel must report unhandled exceptions and critical API failures through the official Laravel Sentry SDK.
- The Next.js storefront must report server, edge, request, and client rendering errors through the official Next.js Sentry SDK.
- The React/Vite admin frontend must report uncaught browser errors, unhandled promise rejections, and React render failures through the official React Sentry SDK.
- Monitoring must be disabled when no Sentry DSN is configured, so local development and tests do not send events accidentally.
- Sentry must not replace existing user-facing error handling. The storefront maintenance redirect must continue to redirect users to `/maintenance` when VADMIN is unavailable.
- Session Replay, user feedback widgets, logs, and high-volume performance tracing are out of initial scope unless explicitly enabled later.
- Default PII collection must remain disabled. User identity may be added later only after a privacy review.
- Production builds should support source map upload through `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` values supplied by the deployment environment. Auth tokens must not be committed.
- The repository root provides `setup-sentry.ps1` to configure local Sentry DSNs for all three applications without committing secrets.
- The repository root provides `deploy-sentry-debian.sh` to configure production Sentry environment values on Debian and optionally run install, build, source map upload, PM2 restart, and backend test steps.

### 4.5.3 Environment Variables

- Backend:
  - `SENTRY_LARAVEL_DSN`
  - `SENTRY_ENVIRONMENT`
  - `SENTRY_RELEASE`
  - `SENTRY_TRACES_SAMPLE_RATE`
- Admin frontend:
  - `VITE_SENTRY_DSN`
  - `VITE_SENTRY_ENVIRONMENT`
  - `VITE_SENTRY_RELEASE`
  - `VITE_SENTRY_TRACES_SAMPLE_RATE`
- Storefront:
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `SENTRY_ENVIRONMENT`
  - `SENTRY_RELEASE`
  - `SENTRY_TRACES_SAMPLE_RATE`
  - `SENTRY_AUTH_TOKEN` for source map upload during build.

---

## 5. Design System

### 5.1 Design Tokens

- **`--pb-radius`**: `12px` (Default border radius for interactive elements and media).

### 5.2 UI Rules

1. **Buttons**: Storefront buttons must use square corners.
2. **Images**: Storefront product images and UI media should use square corners.
3. **Cards**: Product cards and similar storefront containers should use square corners for a modern, angular look.

### 5.3 Layout Standards (Admin)

1.  **Alignment**: All administrative views must be **LEFT-ALIGNED**. Do not center main content containers.
2.  **Width Management**:
    - **Lists/Tables**: Occupy full available width.
    - **Forms/Settings**: Use `max-w-4xl` (settings) or `max-w-2xl` (simple forms) to maintain readability.
3.  **Components**:
    - **PageHeader**: Mandatory for all views.
    - **Glassmorphism**: Use `glass-panel` for dropdowns and floating elements.
4.  **Dropdowns**: Standardized with `py-3` for items and `bg-primary/10` for hover states.
5.  **User Menu**: Dropdown must have no border (`ring-0`) and a prominent shadow (`shadow-2xl`) for a floating look. The trigger button should also be borderless with a clean white background.

> [!TIP]
> For more details, refer to:
>
> - [CRUD_STANDARDS.md](file:///e:/Vimana/nolita/nolita-repo/docs/standards/CRUD_STANDARDS.md)
> - [AUTH_UI_STANDARDS.md](file:///e:/Vimana/nolita/nolita-repo/docs/standards/AUTH_UI_STANDARDS.md)

---

## 6. Checkout Process

### 6.1 Overview

A multi-step checkout process implemented in the frontend to collect shipping and payment information before finalizing the order.

### 6.2 Retail and Wholesale Storefront Modes

The storefront supports public retail and wholesale modes for both guest and authenticated customers. Users can see prices, switch mode, add products to cart, and complete checkout without logging in.

- `retail` mode uses `sale_price`.
- `wholesale` mode uses `wholesale_price`.
- A product is visible in the retail catalog only when `sale_price > 0`.
- A product is visible in the wholesale catalog only when `wholesale_price > 0` and `hide_on_wholesale = false`.
- `hide_on_wholesale` only hides products from the wholesale catalog. It must not remove an already-added cart line by itself.
- When the user changes cart mode, cart lines must be recalculated using the new mode.
- If a cart line's product has price `0` or missing for the new mode, that line must be removed from the cart.
- If a product is hidden from wholesale by `hide_on_wholesale` but has `wholesale_price > 0`, an existing cart line remains in the cart and recalculates to wholesale price.
- Wholesale minimum quantity and minimum amount restrictions apply only in `wholesale` mode.
- Retail checkout must not be blocked by wholesale minimum restrictions.

The catalog API product contract must expose enough pricing metadata for the storefront to render and recalculate mode-aware prices:

- `salePrice`: current retail base price.
- `wholesalePrice`: current wholesale base price, nullable or zero when unavailable.
- `hideOnWholesale`: whether the product is hidden from the wholesale catalog.
- `priceRange` and `compareAtPriceRange`: active response price range for the requested mode when a mode is provided.
- `discount` and `hasDiscount`: discount metadata for retail `sale_price`.

### 6.3 Product Discounts

VADMIN product `discount` is a percentage applied to `sale_price`. The storefront must display discounted products with the original price struck through, the discounted final price, and a discount indicator. Cart and checkout calculations must use the discounted final unit price.

The catalog API product contract must expose enough pricing metadata for the storefront:

- `priceRange.minVariantPrice` and `priceRange.maxVariantPrice`: discounted final price.
- `compareAtPriceRange.minVariantPrice` and `compareAtPriceRange.maxVariantPrice`: original `sale_price` when a discount applies.
- `discount`: discount percentage.
- `hasDiscount`: whether the product has an active discount.

The checkout backend must recalculate item `unit_price` and `subtotal` from current VADMIN product pricing before completing the order, so frontend totals and persisted order totals stay aligned.

### 6.2 Data Flow

1. **Redirection**: The cart modal "Finalizar Pedido" redirects to `/checkout`.
2. **Authentication**: Authentication is optional. Guest checkout must create an order without creating a customer.
3. **Methods**: Shipping and payment methods are fetched from VADMIN.
4. **Completion**: The `completeOrder` action sends collected data, cart lines, and active price mode to VADMIN checkout.
5. **API Routing**: The storefront posts to the public VADMIN `POST /api/checkout` endpoint for both guests and authenticated customers. When an `auth_token` cookie is present, the storefront forwards it as a Bearer header so VADMIN can associate the order with the customer via the Sanctum `customer` guard. A missing or expired token must not block checkout; the order is persisted as a guest order in that case.
6. **Customer Resolution (Backend)**: `OrderController::checkout` must resolve the customer via `auth('customer')->user()` so the public route can still link orders to authenticated customers when a valid Bearer token is sent.
7. **Summary UI**:
   - Shows detailed item options (Size, Color).
   - Dynamically loads the specific color image if the selected variant has a color match.
   - Allows removing items directly from the summary.
   - Redirects to the home page when the cart becomes empty while the user is on checkout, whether the last item is removed from the checkout summary or the cart sidebar.

### 6.3 Validation and Customer Persistence

- Checkout requires name, email, phone, WhatsApp, CUIT, address, postal code, province, locality, delivery method, and payment method.
- The web checkout payload sends `province_id`, `locality_id`, and `city`; `city` is derived from the selected locality.
- VADMIN accepts `province_id` and `locality_id`, verifies that the locality belongs to the selected province, and derives `city` from locality when needed.
- Orders store the full submitted checkout form in `orders.customer_data` JSON for export and administrative review.
- Authenticated checkout may associate `orders.customer_id` with the customer and update customer shipping/contact fields only after the order is successfully completed.
- Guest checkout stores `customer_id = null`, persists `customer_data`, creates the order, and triggers the same admin notification flow as authenticated checkout.
- Stock is reduced only when the order is completed, inside the checkout transaction. Adding products to cart must not reduce stock for guest or authenticated carts.
- Checkout must fail with a clear message if stock is no longer available at completion time.

---

## 9. Customer Addresses: Provinces and Localities

### 9.1 Overview

**Objective:** Add geographic data (province and locality) to Customer model, with two new related models: Province and Locality.

### 9.2 Backend Changes

#### Models

- `Province`: id, name, code (ISO), timestamps
- `Locality`: id, name, province_id (FK), timestamps

#### Customer Update

- Add `prov_id` (FK to provinces) nullable
- Add `loc_id` (FK to localities) nullable
- Relationships: Customer belongsTo Province, Customer belongsTo Locality

#### Data Contract (API)

| Method | Endpoint                        | Description                                 |
| ------ | ------------------------------- | ------------------------------------------- |
| GET    | `/api/provinces`                | List all provinces                          |
| GET    | `/api/localities?province_id=X` | List localities by province                 |
| GET    | `/api/customers`                | List customers (includes province/locality) |
| POST   | `/api/customers`                | Create customer with prov_id/loc_id         |
| PUT    | `/api/customers/{id}`           | Update customer with prov_id/loc_id         |

### 9.3 Frontend Changes

- Admin: CustomerForm adds province/locality selects (cascading)
- Web: profile-form and checkout-form add province/locality fields
- Types: CustomerSession updated with prov_id, loc_id

---

## 8. Catalog: Add Size Curve (Curva de Talle)

### 7.1 Overview

**Objective:** Allow users to add a complete "size curve" (one item of every available variant) directly from the product card in the catalog.

### 7.2 Implementation

- **UI:** A button "Agregar curva de talle" appears below the "Ver Producto" button on product card hover.
- **Action:** Triggers a server action `addMultipleItems` sending an array of available variant IDs.
- **State:** Updates optimistic cart state via `ADD_MULTIPLE_ITEMS` action in the cart context.

---

## 10. Admin Notification Preferences

### 10.1 Overview

Users can configure which administrative notification types they want to receive.

### 10.2 Requirements

1. **Visibility:** Users only see notification types allowed by their role and optional required permission.
2. **Explicit email opt-in:** Email notifications are disabled by default until the user enables them.
3. **Admin notifications:** In-app admin notifications are created for every eligible user individually.
4. **API Contract:**

| Method | Endpoint                                                    | Description                                                     |
| ------ | ----------------------------------------------------------- | --------------------------------------------------------------- |
| GET    | `/api/notification-preferences`                             | List available notification types with current user preferences |
| POST   | `/api/notification-preferences/{notificationTypeId}/toggle` | Toggle one channel (`email` or `browser`)                       |
| PUT    | `/api/notification-preferences`                             | Bulk update notification channel preferences                    |

---

## 11. Public Business Content Storage

### 11.1 Overview

Public business contact fields must be managed as site content, not system settings.

### 11.2 Storage Contract

- `system_settings` remains reserved for operational configuration such as `site_url`, `mail_to_address`, `business_name`, language, and skin settings.
- `site_contents` owns public contact and social fields:
  - `business_phone`
  - `business_email`
  - `business_address`
  - `business_hours`
  - `business_whatsapp`
  - `business_facebook`
  - `business_instagram`
  - `business_linkedin`
  - `business_youtube`
  - `business_tiktok`
- These records use `section = business`.

### 11.3 API Contract

- Admin business info editor reads and writes through `/api/site-content`.
- `/api/public/business-info` remains available for compatibility, but its data source is `site_contents`.
- `/api/system-settings` must not create or seed public business contact/social keys.

---

## 12. Storefront Cache Revalidation

### 12.1 Overview

Admin changes that affect the public storefront must invalidate the Next.js cache immediately, without requiring a manual rebuild.

### 12.2 Web Contract

- `POST /api/revalidate` accepts a shared token and a list of tags.
- Valid tags:
  - `products`
  - `collections`
  - `site-content`
  - `shop-configuration`
  - `checkout-methods`
- The route revalidates matching cache tags and core storefront paths (`/`, `/catalog`, `/search`).
- Invalid or missing tokens must return `401`.

### 12.3 VADMIN Contract

- VADMIN sends a revalidation webhook after successful admin writes for:
  - products and product variants
  - product sizes, colors, and tags
  - product categories
  - payment and delivery methods
  - site content
  - shop configuration
- Webhook configuration comes from:
  - `NEXTJS_REVALIDATE_WEBHOOK_URL`
  - `NEXTJS_REVALIDATE_TOKEN`
- Missing webhook configuration must not block admin writes.
- When Cloudflare credentials are configured, the same VADMIN revalidation flow must purge the affected public storefront URLs from Cloudflare after admin writes.
- Cloudflare purge configuration comes from:
  - `CLOUDFLARE_ZONE_ID`
  - `CLOUDFLARE_API_TOKEN`
- Missing Cloudflare configuration or purge failures must not block admin writes.

---

## 13. System Data Exports

### 13.1 Overview

Administrative data exports must be generated by VADMIN, not by the React frontend. The frontend only requests an export with the active filters and downloads the generated response.

### 13.2 Package Strategy

- Spreadsheet exports use `maatwebsite/excel`.
- PDF exports use `barryvdh/laravel-dompdf`.
- Do not add a second PDF package unless DomPDF cannot satisfy a documented PDF layout requirement.

### 13.3 Initial Scope

The first implementation covers admin order exports.

### 13.4 API Contract

| Method | Endpoint                                       | Description                    |
| ------ | ---------------------------------------------- | ------------------------------ |
| GET    | `/api/admin/orders/export?format=xlsx`         | Export filtered orders as XLSX |
| GET    | `/api/admin/orders/export?format=csv`          | Export filtered orders as CSV  |
| GET    | `/api/admin/orders/export?format=pdf`          | Export filtered orders as PDF  |
| GET    | `/api/admin/orders/{order}/export?format=xls`  | Export one order as XLS        |
| GET    | `/api/admin/orders/{order}/export?format=xlsx` | Export one order as XLSX       |
| GET    | `/api/admin/orders/{order}/export?format=pdf`  | Export one order as PDF        |

Supported filters must match the admin orders list where applicable:

- `search`: order ID, customer name, or customer email.

### 13.5 Backend Rules

- Exports require authenticated admin access and `view orders` permission.
- Export logic lives in dedicated export/service classes, not in React.
- XLSX and CSV responses are generated through Laravel Excel.
- PDF responses are generated from Blade templates through DomPDF.
- Single-order PDF and XLSX exports must include a complete header with order data, customer data, shipping data, and billing/payment data before item rows.
- Single-order PDF exports must not include images.
- Export documents must display all user-facing labels in Spanish while keeping code identifiers in English.
- Shared backend translations and formatting helpers live under `App\Support\Localization`.
- Large exports should later move to queued jobs and stored files.

### 13.6 Frontend Rules

- The orders list displays export actions for XLSX, CSV, and PDF.
- The order detail page displays separate buttons for XLSX and PDF exports.
- Export requests include the current search filter.
- Downloads use authenticated Axios requests with `blob` response type.

---

## 14. Admin Statistics Section

### 14.1 Overview

VADMIN must include an administrative statistics section for future business metrics.

### 14.2 Frontend Rules

- The admin sidebar must expose a top-level "Estadísticas" menu item.
- The statistics route is `/estadisticas`.
- The statistics section is available to users with the `Super Admin` or `Admin` role.
- Users with the `Employee` role must not see or access the statistics section.
- The statistics view must use the shared `PageHeader` breadcrumb pattern.
- Statistics categories must be switchable through tabs.
- Initial tabs:
  - `Favoritos`: favorites analytics summary and product ranking.
  - `Ventas`: sales analytics summary and product ranking.
- Both statistics tabs must be visible to authorized statistics users.
- Ranking tables must support CSV export from the currently visible dataset.
- Empty states should guide the admin toward the next useful action.

### 14.3 Favorites Analytics Contract

- Admin favorites analytics are exposed through `GET /api/admin/statistics/favorites`.
- The endpoint requires authenticated admin access with the `Super Admin` or `Admin` role.
- The endpoint accepts an optional `category_id` query parameter.
- The response must include:
  - `summary.total_favorites`: total customer favorite records.
  - `summary.unique_products`: number of distinct products favorited at least once.
  - `summary.customers_with_favorites`: number of customers with at least one favorite.
  - `products`: products ordered by favorite count descending.
  - `opportunities`: high-favorite products with low stock.
  - `categories`: category filter options.
- Each product row must include product ID, name, slug, category name, status, total stock, and favorite count.
- The admin UI must show KPI cards and a table ordered by most favorited products.
- The admin UI must show opportunity cards for products with many favorites and low stock.
- Demo seed data may create additional customers and customer favorite assignments for local analytics testing.

### 14.4 Sales Analytics Contract

- Admin sales analytics are exposed through `GET /api/admin/statistics/sales`.
- The endpoint requires authenticated admin access with the `Super Admin` or `Admin` role.
- Sales totals must use `completed` orders only.
- The endpoint accepts a `period` query parameter with allowed values `7d`, `30d`, `90d`, and `all`; default is `30d`.
- The endpoint accepts an optional `category_id` query parameter.
- Period filtering applies to completed order `created_at` timestamps.
- Sales responses may be cached for a short period by resolved period and category.
- The response must include:
  - `period`: the resolved period key.
  - `summary.total_revenue`: sum of completed order totals.
  - `summary.orders_count`: count of completed orders.
  - `summary.average_order_value`: completed revenue divided by completed order count.
  - `summary.units_sold`: sum of item quantities in completed orders.
  - `comparison`: percentage changes against the previous equivalent period when the period is not `all`.
  - `products`: products ordered by sold units descending.
  - `opportunities`: high-selling products with low stock.
  - `categories`: category filter options.
- Each product row must include product ID, name, category name, units sold, revenue, total stock, and current status.
- The admin UI must show KPI cards and a table ordered by most sold products.
- The admin UI must expose period controls and default to the last 30 days.
- The admin UI must expose a category filter.
- The admin UI must show opportunity cards for best-selling products with low stock.
- The database must index sales statistics access paths, including order status/date and order item order/product lookups, directly in the base order table migrations for fresh installs.
- Demo seed data may create completed, processing, pending, and cancelled orders for local analytics testing, but only completed orders should affect sales totals.

# Technical Specifications

## 1. E-commerce Web Integration

### Overview
A new e-commerce project built with Next.js Commerce template. It resides in the `web` folder. 
It communicates strictly via REST API with the existing VADMIN backend (Laravel).

### Requirements
1. **Authentication:** Uses customers from VADMIN. Registering creates a record in the `customers` table of VADMIN.
2. **Products:** Products are created in VADMIN and queried via REST API by the Next.js e-commerce.
3. **Catalog Category Filtering:** The catalog must send the selected category slug to VADMIN through `GET /api/catalog/products?category={slug}` and must not show unrelated products when a category is active.
4. **Orders:** Create new models and tables in VADMIN for storing Customer Orders and their complete details.
5. **CORS:** Ensure CORS is configured properly in VADMIN to allow requests from the Web frontend.

> [!IMPORTANT]
> **OFFICIAL BACKEND: VADMIN**
> This project is 100% migrated to the **VADMIN** (Laravel) backend.
> - **DO NOT USE Shopify**: All `lib/shopify` references and `SHOPIFY_*` environment variables are legacy/deprecated and will be removed.
> - **Primary Provider**: Use `lib/vadmin` for all data fetching.
> - **API URL**: Set via `NEXT_PUBLIC_VADMIN_API_URL`.

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/coupons` | List all coupons (paginated) |
| GET | `/api/coupons?all=1` | List all coupons (no pagination) |
| GET | `/api/coupons/{id}` | Get single coupon |
| POST | `/api/coupons` | Create coupon |
| PUT | `/api/coupons/{id}` | Update coupon |
| DELETE | `/api/coupons/{id}` | Delete coupon |
| POST | `/api/coupons/bulk-delete` | Bulk delete coupons |

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

## 5. Design System

### 5.1 Design Tokens
- **`--pb-radius`**: `12px` (Default border radius for interactive elements and media).

### 5.2 UI Rules
1. **Buttons**: All buttons must have a consistent border radius defined by `--pb-radius`.
2. **Images**: Product images and UI media should use `--pb-radius` for a cohesive look.
3. **Cards**: Product cards and similar containers should align with the global radius.

### 5.3 Layout Standards (Admin)
1.  **Alignment**: All administrative views must be **LEFT-ALIGNED**. Do not center main content containers.
2.  **Width Management**:
    - **Lists/Tables**: Occupy full available width.
    - **Forms/Settings**: Use `max-w-4xl` (settings) or `max-w-2xl` (simple forms) to maintain readability.
3.  **Components**:
    - **PageHeader**: Mandatory for all views.
    - **Glassmorphism**: Use `glass-panel` for dropdowns and floating elements.
4.  **Dropdowns**: Standardized with `py-3` for items and `bg-primary/10` for hover states.
6. **User Menu**: Dropdown must have no border (`ring-0`) and a prominent shadow (`shadow-2xl`) for a floating look. The trigger button should also be borderless with a clean white background.

> [!TIP]
> For more details, refer to:
> - [CRUD_STANDARDS.md](file:///e:/Vimana/planb/planb/docs/standards/CRUD_STANDARDS.md)
> - [AUTH_UI_STANDARDS.md](file:///e:/Vimana/planb/planb/docs/standards/AUTH_UI_STANDARDS.md)

---

## 6. Checkout Process

### 6.1 Overview
A multi-step checkout process implemented in the frontend to collect shipping and payment information before finalizing the order.

### 6.2 Data Flow
1. **Redirection**: The cart modal "Finalizar Pedido" redirects to `/checkout`.
2. **Authentication**: Users must be authenticated to access the checkout.
3. **Methods**: Shipping and payment methods are fetched from VADMIN.
4. **Completion**: The `completeOrder` action sends collected data to `customer/cart/checkout`.
5. **Summary UI**: 
   - Shows detailed item options (Size, Color).
   - Dynamically loads the specific color image if the selected variant has a color match.
   - Allows removing items directly from the summary.

### 6.3 Validation and Customer Persistence
- Checkout requires name, email, phone, address, postal code, province, locality, delivery method, and payment method.
- The web checkout payload sends `province_id`, `locality_id`, and `city`; `city` is derived from the selected locality.
- VADMIN accepts `province_id` and `locality_id`, verifies that the locality belongs to the selected province, and derives `city` from locality when needed.
- Customer shipping/contact fields are updated only after the order is successfully completed.

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
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/provinces` | List all provinces |
| GET | `/api/localities?province_id=X` | List localities by province |
| GET | `/api/customers` | List customers (includes province/locality) |
| POST | `/api/customers` | Create customer with prov_id/loc_id |
| PUT | `/api/customers/{id}` | Update customer with prov_id/loc_id |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notification-preferences` | List available notification types with current user preferences |
| POST | `/api/notification-preferences/{notificationTypeId}/toggle` | Toggle one channel (`email` or `browser`) |
| PUT | `/api/notification-preferences` | Bulk update notification channel preferences |

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

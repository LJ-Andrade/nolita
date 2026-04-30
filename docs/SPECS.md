# Technical Specifications

## 1. E-commerce Web Integration

### Overview
A new e-commerce project built with Next.js Commerce template. It resides in the `web` folder. 
It communicates strictly via REST API with the existing VADMIN backend (Laravel).

### Requirements
1. **Authentication:** Uses customers from VADMIN. Registering creates a record in the `customers` table of VADMIN.
2. **Products:** Products are created in VADMIN and queried via REST API by the Next.js e-commerce.
3. **Orders:** Create new models and tables in VADMIN for storing Customer Orders and their complete details.
4. **CORS:** Ensure CORS is configured properly in VADMIN to allow requests from the Web frontend.

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

> [!TIP]
> For more details, refer to [CRUD_STANDARDS.md](file:///e:/Vimana/planb/planb/docs/standards/CRUD_STANDARDS.md).

---

## 6. Checkout Process

### 6.1 Overview
A multi-step checkout process implemented in the frontend to collect shipping and payment information before finalizing the order.

### 6.2 Data Flow
1. **Redirection**: The cart modal "Finalizar Pedido" redirects to `/checkout`.
2. **Authentication**: Users must be authenticated to access the checkout.
3. **Methods**: Shipping and payment methods are fetched from VADMIN.
4. **Completion**: The `completeOrder` action sends collected data to `customer/cart/checkout`.

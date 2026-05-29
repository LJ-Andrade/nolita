# UI/UX Standards for CRUD Modules

This document defines the standardized structure and design patterns for all CRUD (Create, Read, Update, Delete) modules in the system.

## Overview

All CRUD modules must follow a consistent layout to ensure uniform user experience across the application. This standard applies to: Products, Categories, Tags, and any future modules.

---

## 1. List View (Index/List Page)

### Structure

```
┌─────────────────────────────────────────────────┐
│ PageHeader                                      │
│ ├── Title: "Module Name" (plural)              │
│ └── Breadcrumbs: [Parent] > [Current]          │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Card                                            │
│ ├── CardHeader                                  │
│ │   └── [Action Buttons - LEFT aligned]        │
│ │       └── "Create New" button                │
│ └── CardContent                                 │
│     ├── Filters/Collapsible search             │
│     ├── Data Table                             │
│     │   ├── Checkboxes for bulk selection      │
│     │   ├── Sortable columns                   │
│     │   └── Action buttons per row             │
│     └── Pagination                             │
└─────────────────────────────────────────────────┘
│ BulkActionsBar (floating, when items selected) │
└─────────────────────────────────────────────────┘
```

### Key Requirements

- **PageHeader**: Must use `<PageHeader>` component with breadcrumbs
- **Breadcrumbs format**: `[Parent Module] > [Current Module]`
- **CardHeader**: Contains ONLY action buttons, aligned to the **LEFT**
- **CardTitle**: Should be empty or minimal in list views (title is in PageHeader)
- **Action Buttons**: Primary action (Create) goes in CardHeader, not PageHeader
- **Table**: Must include bulk selection checkboxes, sorting, and row actions
- **Filters**: Collapsible advanced filters section
- **BulkActionsBar**: Floating bar appears when items are selected

### Example: Tags List

```jsx
<PageHeader
  title="Etiquetas"
  breadcrumbs={[
    { label: "Productos", href: "/products" },
    { label: "Etiquetas" },
  ]}
/>

<Card>
  <CardHeader className="flex flex-row items-center justify-start gap-2">
    <Can permission="manage product tags">
      <Button asChild>
        <Link to="/product-tags/create">
          <Plus className="mr-2 h-4 w-4" /> Crear Etiqueta
        </Link>
      </Button>
    </Can>
  </CardHeader>
  <CardContent>
    {/* Table and filters */}
  </CardContent>
</Card>
```

---

## 2. Create/Edit Form View

### Structure

```
┌─────────────────────────────────────────────────┐
│ PageHeader                                      │
│ ├── Title:                                       │
│ │   Create: "Create [Module Name]"             │
│ │   Edit: "Editing [module name] \"[name]\""   │
│ └── Breadcrumbs: [Parent] > [Module] > [Action]│
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Card (max-w-2xl for single-column forms)       │
│ ├── CardHeader                                  │
│ │   └── CardTitle (SAME as PageHeader title)   │
│ └── CardContent                                 │
│     ├── Form Fields                            │
│     └── Action Buttons (RIGHT aligned)         │
│         ├── Cancel (outline)                   │
│         └── Save (primary)                     │
└─────────────────────────────────────────────────┘
```

### ⚠️ IMPORTANT: Title in Both Places

**The title MUST appear in BOTH locations:**

1. **PageHeader** - For breadcrumbs context
2. **CardHeader > CardTitle** - For visual clarity in the form card

Both should show the EXACT same text:

- Create mode: `"Crear [Módulo]"` (e.g., "Crear Etiqueta")
- Edit mode: `"Editando [módulo] \"[nombre]\""` (e.g., "Editando etiqueta \"Electrónica\"")

### Key Requirements

- **PageHeader**:
  - Create: Use translated title (e.g., `t('module.create_title')`)
  - Edit: Dynamic title with entity name: `"Editing [module] \"${name}\""`
  - Breadcrumbs: `[Parent] > [Module List] > [Create/Edit]`

- **Card**:
  - Use `max-w-2xl` class to limit width for single-column forms
  - **CardHeader MUST contain CardTitle** (same text as PageHeader title)
  - This provides visual consistency and clarity for the user
- **Form Layout**:
  - Fields organized logically in sections if needed
  - Use grid for side-by-side fields: `grid grid-cols-1 md:grid-cols-2 gap-4`
- **Action Buttons**:
  - Located at the **bottom** of the form
  - Aligned to the **RIGHT**
  - Order: Cancel (outline/secondary) | Save (primary)
  - Cancel button uses `type="button"` to prevent form submission

### Example: Tag Form (Edit)

```jsx
{
  id ? (
    <PageHeader
      title={`Editando etiqueta "${tagName}"`}
      breadcrumbs={[
        { label: "Productos", href: "/products" },
        { label: "Etiquetas", href: "/product-tags" },
        { label: "Editar" },
      ]}
    />
  ) : (
    <PageHeader
      title="Crear Etiqueta"
      breadcrumbs={[
        { label: "Productos", href: "/products" },
        { label: "Etiquetas", href: "/product-tags" },
        { label: "Crear" },
      ]}
    />
  );
}

<Card className="max-w-2xl">
  <CardHeader>
    <CardTitle>
      {id
        ? `${t("product_tags.editing") || "Editando etiqueta"} "${entityName}"`
        : t("product_tags.create_title")}
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Form fields */}

    <div className="flex gap-2 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/product-tags")}
      >
        <X className="mr-2 h-4 w-4" />
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Guardar
      </Button>
    </div>
  </CardContent>
</Card>;
```

---

## 3. Settings & Preference Views (Single Page Config)

### Structure

```

┌─────────────────────────────────────────────────┐
│ PageHeader │
│ ├── Title: "Configuration Name" │
│ └── Breadcrumbs: [Parent] > [Current] │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ Container (max-w-4xl, LEFT aligned) │
│ └── Card │
│ ├── CardHeader │
│ │ ├── CardTitle │
│ │ └── CardDescription │
│ └── CardContent │
│ └── Settings / Toggles / Form │
└─────────────────────────────────────────────────┘

```

### Key Requirements

- **Alignment**: Must be aligned to the **LEFT**. Do not use `mx-auto` for centering the main container.
- **Width**: Use `max-w-4xl` to ensure the content doesn't feel lost on large screens while maintaining readability.
- **PageHeader**: Essential for context and breadcrumbs.
- **Consistency**: Use standard `Card` and `Separator` components.

### Example: Notification Preferences

```jsx
<div className="space-y-6 max-w-4xl">
  <PageHeader
    title="Preferencias de Notificaciones"
    breadcrumbs={[
      { label: "PERFIL" },
      { label: "Preferencias de Notificaciones" },
    ]}
  />
  <Card>
    <CardHeader>
      <CardTitle>Preferencias de Notificaciones</CardTitle>
      <CardDescription>Configura tus alertas.</CardDescription>
    </CardHeader>
    <CardContent>{/* Content */}</CardContent>
  </Card>
</div>
```

---

## 4. Component Standards

### Required Imports

```jsx
// Layout
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Table
import { AdminTableShell } from "@/components/admin-table-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Form
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Selection
import { Checkbox } from "@/components/ui/checkbox";
import { useBulkSelect } from "@/hooks/use-bulk-select";
import { BulkActionsBar } from "@/components/bulk-actions-bar";

// Icons
import { Plus, Edit, Trash2, X, Save, Loader2 } from "lucide-react";

// Utilities
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
```

### Button Styling

- **Primary Actions** (Create, Save): Default button style
- **Secondary Actions** (Cancel): `variant="outline"`
- **Destructive Actions** (Delete): `variant="ghost"` with `className="text-red-500"`
- **Icon Usage**: All action buttons should have icons (from lucide-react)

### Table Shell

CRUD list tables must use the shared table frame so every list has the same radius, background, and horizontal scrolling behavior.

Required behavior:

- Standard list modules should render data through `CrudTable`; it already includes `AdminTableShell`.
- Custom list tables must wrap the top-level `<Table>` with `AdminTableShell`.
- Nested detail tables may use a local frame only when they are visually subordinate to a row expansion or form section.
- Row striping is controlled globally by `TableBody`; do not add per-screen stripe classes unless the table has a special state.
- Tables should not render visible borders or row dividers; the header cells carry the darker header background.
- Table shell and stripe colors must be changed in `admin/frontend/src/skins.css`, not inside individual list views.
- Tables with row actions must make the action header and action cell sticky with `data-sticky="right"`.
- Sticky action columns must live inside `AdminTableShell`; do not rely on page-level horizontal scrolling for list actions.
- Collapsed row action dropdown triggers must use a minimum `h-10 w-10` touch target and a `ChevronDown` icon sized `h-5 w-5`.
- `DropdownMenuItem` icons are intentionally larger on mobile and return to compact sizing from the `sm` breakpoint.

Editable skin variables:

- `--admin-table-bg`
- `--admin-table-border-color`
- `--admin-table-border-width`
- `--admin-table-radius`
- `--admin-table-header-bg`
- `--admin-table-row-bg`
- `--admin-table-row-stripe-bg`
- `--admin-table-row-hover-bg`

Example for custom tables:

```jsx
<AdminTableShell>
  <Table>
    <TableHeader>{/* headings */}</TableHeader>
    <TableBody>{/* rows */}</TableBody>
  </Table>
</AdminTableShell>
```

### Inline Order Editing

CRUD list tables that expose an `order` field must use `CrudInlineOrderEditor` from `admin/frontend/src/components/crud-inline-order-editor.jsx`.

Required behavior:

- Display the current order as compact clickable text.
- Enter edit mode only after the user clicks the order value.
- Do not send API requests while typing.
- Save only when the user presses Enter or the save check action.
- Cancel with Escape.
- Show a spinner while saving and a green check after a successful save.
- Refresh the list after the save request completes.

Example:

```jsx
<CrudInlineOrderEditor
  value={item.order}
  onSave={async (order) => {
    await axiosClient.patch(`/items/${item.id}/quick-update`, { order });
    fetchItems();
  }}
/>
```

### Form Handling

- Use `react-hook-form` with `zodResolver` for validation
- Use `zod` schemas for form validation
- Input, textarea, and select colors must come from `admin/frontend/src/skins.css` variables.
- Handle errors with toast notifications
- Show loading states on submit buttons

Editable form control skin variables:

- `--admin-input-bg`
- `--admin-input-text`
- `--admin-input-placeholder`
- `--admin-input-border-color`
- `--admin-input-focus-border-color`

---

## 4. Breadcrumb Standards

### Format by Module Type

**Child of Products:**

- List: `Productos > [Module]`
- Create: `Productos > [Module] > Crear`
- Edit: `Productos > [Module] > Editar`

**Standalone Modules:**

- List: `[Module]`
- Create: `[Module] > Crear`
- Edit: `[Module] > Editar`

### Breadcrumb Labels

- Use UPPERCASE for parent section: `"PRODUCTOS"`
- Use Title Case for modules: `"Categorías"`, `"Etiquetas"`
- Use verbs for actions: `"Crear"`, `"Editar"`

---

## 5. Title Standards

### List View

- Simple plural: `"Etiquetas"`, `"Productos"`, `"Categorías"`

### Create View

- Use translation key: `t('module.create_title')` → `"Crear Etiqueta"`

### Edit View

- Dynamic with entity name: `"Editing [module] \"${name}\""`
- Examples:
  - `"Editando etiqueta \"Electrónica\""`
  - `"Editando producto \"iPhone 15\""`
  - `"Editando categoría \"Ropa\""`

---

## 6. State Management

### List View State

```jsx
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [meta, setMeta] = useState({});
const [page, setPage] = useState(1);
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("id");
const [sortDir, setSortDir] = useState("desc");

// Selection
const {
  selectedIds,
  isAllSelected,
  toggleSelect,
  toggleSelectAll,
  clearSelection,
} = useBulkSelect(items);
```

### Form View State

```jsx
const [loading, setLoading] = useState(false);
const [fetching, setFetching] = useState(false);
const [entityName, setEntityName] = useState(""); // For edit mode title

// Form
const form = useForm({ resolver: zodResolver(schema) });
```

---

## 7. File Naming Conventions

### Views Folder Structure

```
views/
├── products/
│   ├── ProductsList.jsx      # List view
│   └── ProductForm.jsx       # Create/Edit view
├── product-tags/
│   ├── TagsList.jsx
│   └── TagForm.jsx
└── product-categories/
    ├── CategoriesList.jsx
    └── CategoryForm.jsx
```

### Naming Rules

- **List**: `[PluralModuleName]List.jsx` (e.g., `ProductsList.jsx`)
- **Form**: `[SingularModuleName]Form.jsx` (e.g., `ProductForm.jsx`)
- Use PascalCase for component files
- Match route names in kebab-case (e.g., `/product-tags`)

---

## 8. Translation Keys

### Standard Structure

```json
{
  "module_name": {
    "title": "Module Title",
    "create": "Create Module",
    "create_title": "Create Module",
    "edit_title": "Edit Module",
    "name": "Name",
    "manage": "Manage Modules",
    "create_button": "Create",
    "update_button": "Update",
    "delete_success": "Module deleted successfully",
    "update_success": "Module updated successfully",
    "create_success": "Module created successfully"
  }
}
```

---

## 9. Responsive Considerations

### Mobile (< 768px)

- Tables should be horizontally scrollable: `overflow-x-auto`
- Filters collapse into single column
- Action buttons in dropdown menu (not visible inline)
- Row action dropdown triggers must remain at least 40 x 40 and action menu icons must be large enough for touch input
- Row actions must remain sticky on the right while the table is horizontally scrolled
- BulkActionsBar sticks to bottom of viewport

### Desktop (≥ 768px)

- Full table with all columns visible
- Inline action buttons (Edit/Delete)
- Row actions may remain sticky during horizontal overflow and should visually return to the normal table edge when scrolled fully right
- Filters in multi-column grid
- BulkActionsBar floating above content

---

## 10. Checklist for New CRUD Modules

Before submitting a new CRUD module, verify:

### List View

- [ ] PageHeader with correct breadcrumbs
- [ ] CardHeader with action button(s) aligned LEFT
- [ ] Empty CardHeader (no title)
- [ ] Collapsible filters section
- [ ] Data table with sortable columns
- [ ] Data table uses `CrudTable` or wraps the top-level custom `<Table>` in `AdminTableShell`
- [ ] Row action header and cells use `data-sticky="right"` when the list has actions
- [ ] Collapsed/mobile row action dropdown trigger uses `h-10 w-10` with a `h-5 w-5` chevron
- [ ] Order fields use `CrudInlineOrderEditor` when inline ordering is available
- [ ] Bulk selection checkboxes
- [ ] BulkActionsBar implementation
- [ ] Pagination
- [ ] Responsive design

### Form View

- [ ] PageHeader with dynamic title (shows name in edit mode)
- [ ] Breadcrumbs: Parent > Module > Action
- [ ] Card with `max-w-2xl` class
- [ ] **CardHeader with CardTitle (same text as PageHeader)** ⚠️
- [ ] Form fields properly organized
- [ ] Validation with Zod schema
- [ ] Action buttons at bottom, RIGHT aligned
- [ ] Cancel button with `type="button"`
- [ ] Loading states on buttons
- [ ] Success/error toast notifications

### Code Quality

- [ ] All imports present
- [ ] Translation keys in es.json and en.json
- [ ] Permission checks with `<Can>` component
- [ ] Error handling for API calls
- [ ] Loading states implemented

---

## Reference Implementations

These modules follow this standard perfectly:

- ✅ **Product Tags**: `views/product-tags/TagsList.jsx` & `TagForm.jsx`
- ✅ **Product Categories**: `views/product-categories/CategoriesList.jsx` & `CategoryForm.jsx`
- ✅ **Products**: `views/products/ProductsList.jsx` & `ProductForm.jsx`

Use these as templates when creating new modules.

---

## Last Updated

Date: 2026-05-29
Version: 1.4
Author: Development Team

### Changes in v1.4:

- Standardized sticky row action columns for horizontally scrollable admin list tables.
- Required larger collapsed action dropdown triggers and mobile menu icons for touch usability.
- Clarified that custom list tables must use `AdminTableShell` with `data-sticky="right"` action columns.

### Changes in v1.3:

- Added `AdminTableShell` as the standard visual frame for CRUD list tables.
- Documented editable table shell and stripe variables in `admin/frontend/src/skins.css`.
- Clarified that custom list tables must use the shared shell while nested detail tables may keep local framing.

### Changes in v1.2:

- Added `CrudInlineOrderEditor` as the standard component for editable order fields in CRUD lists.
- Documented explicit save behavior for order edits.

### Changes in v1.1:

- Added explicit requirement for CardTitle in form views (must match PageHeader title)
- Updated all examples to show CardTitle usage
- Updated checklist to require CardHeader with CardTitle

### Changes in v1.0:

- Initial CRUD standards documentation
- Defined List View and Form View patterns
- Created useCrudList and useCrudForm hooks
- Created CrudTable and CrudPagination components

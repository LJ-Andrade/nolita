# Admin Tabbed Section Standards

This document defines the reusable pattern for administrative pages that show related content areas through tabs.

## Overview

Use `AdminTabbedSection` when a VADMIN page needs:

- A shared `PageHeader` with breadcrumbs.
- A compact tab list below the header.
- One active content card at a time.
- Future-friendly sections where data contracts may be added later.

This pattern is intended for overview, analytics, reporting, and grouped configuration pages. CRUD list and form pages should continue to follow `CRUD_STANDARDS.md`.

---

## Component

Location:

```jsx
admin/frontend/src/components/admin-tabbed-section.jsx
```

Required import:

```jsx
import { AdminTabbedSection } from "@/components/admin-tabbed-section";
```

## Props

| Prop | Type | Required | Purpose |
| --- | --- | --- | --- |
| `title` | `string` | Yes | Page title passed to `PageHeader`. |
| `breadcrumbs` | `array` | No | Base breadcrumbs. The active tab label is appended automatically. |
| `tabs` | `array` | Yes | Tab configuration and content. |
| `defaultTabId` | `string` | No | Initial active tab. Defaults to the first tab. |
| `tabListLabel` | `string` | No | Accessible label for the tab list. |

Tab shape:

```jsx
{
  id: "sales",
  label: "Ventas",
  title: "Ventas",
  description: "Espacio reservado para futuras estadísticas de ventas.",
  icon: ShoppingBag,
  content: <SalesContent />,
}
```

## Layout Rules

- Keep the page left-aligned.
- Use concise tab labels.
- Use lucide icons when an appropriate icon exists.
- Put the active tab label in the breadcrumb by passing only base breadcrumbs to the component.
- Keep each tab content inside the component-owned `Card`; do not wrap tab content in another page-level card.
- Placeholder sections may use dashed empty states until backend contracts are defined.

## Accessibility Rules

- `AdminTabbedSection` owns `role="tablist"`, `role="tab"`, and `role="tabpanel"` wiring.
- `tabListLabel` must describe the tab group, for example `"Categorías de estadísticas"`.
- Tab IDs must be stable and unique within the page.

## Example

```jsx
import { BarChart3, Heart, ShoppingBag } from "lucide-react";
import { AdminTabbedSection } from "@/components/admin-tabbed-section";

function EmptyStatisticCard() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6">
      <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
    </div>
  );
}

const tabs = [
  {
    id: "favorites",
    label: "Favoritos",
    title: "Favoritos",
    description: "Espacio reservado para futuras estadísticas de favoritos.",
    icon: Heart,
    content: <EmptyStatisticCard />,
  },
  {
    id: "sales",
    label: "Ventas",
    title: "Ventas",
    description: "Espacio reservado para futuras estadísticas de ventas.",
    icon: ShoppingBag,
    content: <EmptyStatisticCard />,
  },
];

export default function Statistics() {
  return (
    <AdminTabbedSection
      title="Estadísticas"
      breadcrumbs={[{ label: "ESTADÍSTICAS" }]}
      tabs={tabs}
      tabListLabel="Categorías de estadísticas"
    />
  );
}
```

---

## Reference Implementations

- `admin/frontend/src/views/statistics/Statistics.jsx`

---

## Last Updated

Date: 2026-05-13
Version: 1.0
Author: Development Team

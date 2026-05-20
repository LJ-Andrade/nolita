# Documentation Index

This directory is the operational memory for the project. Keep each document focused so agents and humans can find the right source quickly.

## Core Documents

| File | Purpose | Update When |
| --- | --- | --- |
| `PROJECT_INFO.md` | Stable overview of architecture, applications, commands, and environment facts. | Architecture, app ownership, commands, or environment facts change. |
| `SPECS.md` | Source of truth for intended product and technical behavior. | New behavior is planned or existing behavior changes. |
| `ROADMAP.md` | High-level project status and future work. | Work moves between completed, in progress, next up, or planned. |
| `DEVLOG.md` | Active execution plans, per-file checklists, and completed implementation notes. | Multi-file work starts or progresses. |
| `DEPLOY_INFO.md` | Deployment, server, release, and operations notes. | Deployment process or production infrastructure changes. |
| `standards/` | Reusable implementation standards. | A standard pattern is introduced or revised. |

## Standards

| File | Purpose |
| --- | --- |
| `standards/AUTH_UI_STANDARDS.md` | Authentication page layout and visual rules. |
| `standards/CRUD_STANDARDS.md` | CRUD list, form, table, and action patterns. |
| `standards/FILE_HANDLING_STANDARDS.md` | File upload and handling rules. |
| `standards/ADMIN_TABBED_SECTION_STANDARDS.md` | Admin pages with breadcrumbs, tabs, and active content cards. |
| `standards/SENTRY_IMPLEMENTATION_STANDARDS.md` | Sentry setup standard for Laravel, React/Vite, and Next.js projects. |

## Agent Update Rules

1. Update `SPECS.md` before implementing new or complex behavior.
2. Add a checklist to `DEVLOG.md` before multi-file execution.
3. Update `ROADMAP.md` only for status-level changes.
4. Update `PROJECT_INFO.md` only for stable facts.
5. Keep deployment details in `DEPLOY_INFO.md`.
6. Keep reusable patterns in `standards/`.

## Current Architecture Facts

- VADMIN is the official backend provider.
- Storefront data fetching must use `web/lib/vadmin`.
- Shopify code and `SHOPIFY_*` environment variables are deprecated.
- Maintenance redirection on API failure is handled by `vadminFetch`.

# Sentry Implementation Standards

Use this guide to replicate the Sentry setup in a similar Laravel API, React/Vite admin panel, and Next.js storefront repository.

## Goal

Sentry must capture important runtime errors that break backend, admin, or storefront behavior. The default setup prioritizes unhandled exceptions and critical frontend failures. Performance tracing, profiling, replays, and personally identifiable information are disabled by default unless the project explicitly opts in.

## Project Model

Create one Sentry project per runtime:

| Runtime | Suggested Sentry project slug | SDK |
| --- | --- | --- |
| Laravel API | `project-backend` | Laravel |
| React/Vite admin | `project-admin-panel` | React |
| Next.js storefront | `project-storefront` | Next.js |

Use the same Sentry projects across environments. Separate local, staging, and production data with the Sentry environment value.

Expected environments:

- `development`
- `staging`
- `production`

## Sentry Dashboard Setup

1. Create the three Sentry projects.
2. Copy each project DSN from Project Settings > Client Keys / DSN.
3. Configure issue alerts for the desired environments.
4. Connect Discord, email, or any other notification integration from Sentry Settings > Integrations.
5. If source maps are required, create an auth token from Settings > Developer Settings > Auth Tokens.

Recommended auth token scopes for source map upload:

- `org:read`
- `project:read`
- `project:releases`
- `project:write`

Never expose `SENTRY_AUTH_TOKEN` in public frontend runtime code. It is a build/deploy secret only.

## Environment Variables

### Laravel API

```env
SENTRY_LARAVEL_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=
SENTRY_TRACES_SAMPLE_RATE=0
SENTRY_SEND_DEFAULT_PII=false
```

### React/Vite Admin

```env
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_RELEASE=
VITE_SENTRY_TRACES_SAMPLE_RATE=0
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

Only `VITE_*` values are exposed to browser runtime. `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are used by the build plugin for source map upload.

### Next.js Storefront

```env
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=
SENTRY_TRACES_SAMPLE_RATE=0
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

Only `NEXT_PUBLIC_*` values are exposed to browser runtime. `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are build/deploy values.

## Laravel Implementation

Install the SDK:

```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn="<backend-dsn>"
```

Wire exception handling in `bootstrap/app.php`:

```php
use Illuminate\Foundation\Configuration\Exceptions;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withExceptions(function (Exceptions $exceptions) {
        Integration::handles($exceptions);
    })
    ->create();
```

Keep `config/sentry.php` committed when the project uses published Sentry configuration. Keep real DSNs only in environment files.

Validation:

```bash
php artisan config:clear
php artisan sentry:test
```

## React/Vite Implementation

Install the SDK and build plugin:

```bash
npm install @sentry/react @sentry/vite-plugin
```

Create `src/instrument.js` and import it before rendering React:

```js
import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0),
  });
}

if (import.meta.env.DEV) {
  window.__testSentryAdmin = () => {
    Sentry.captureException(new Error("Sentry admin test error"));
  };
}

export { Sentry };
```

In `src/main.jsx`, import instrumentation first and connect React error hooks when supported:

```jsx
import "./instrument";
import { Sentry } from "./instrument";

createRoot(document.getElementById("root"), {
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
  onUncaughtError: Sentry.reactErrorHandler(),
}).render(<App />);
```

In `vite.config.js`, enable source map upload only when all build secrets are present:

```js
import { sentryVitePlugin } from "@sentry/vite-plugin";

const hasSentrySourceMaps =
  Boolean(process.env.SENTRY_AUTH_TOKEN) &&
  Boolean(process.env.SENTRY_ORG) &&
  Boolean(process.env.SENTRY_PROJECT);

export default defineConfig({
  build: {
    sourcemap: hasSentrySourceMaps,
  },
  plugins: [
    react(),
    hasSentrySourceMaps &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: process.env.VITE_SENTRY_RELEASE },
        sourcemaps: {
          assets: "./dist/**",
          filesToDeleteAfterUpload: "./dist/**/*.map",
        },
      }),
  ].filter(Boolean),
});
```

Validation:

```bash
npm run lint
npm run build
```

In development, test from the browser console:

```js
window.__testSentryAdmin()
```

## Next.js Implementation

Install the SDK:

```bash
npm install @sentry/nextjs
```

Wrap `next.config.ts`:

```ts
import { withSentryConfig } from "@sentry/nextjs";

const hasSentrySourceMaps =
  Boolean(process.env.SENTRY_AUTH_TOKEN) &&
  Boolean(process.env.SENTRY_ORG) &&
  Boolean(process.env.SENTRY_PROJECT);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !hasSentrySourceMaps,
  sourcemaps: {
    deleteSourcemapsAfterUpload: hasSentrySourceMaps,
  },
});
```

Create `instrumentation.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
```

Create `instrumentation-client.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
  });
}

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  Object.assign(window, {
    __testSentryWeb: () => {
      if (!dsn) {
        console.warn("NEXT_PUBLIC_SENTRY_DSN is not configured.");
        return null;
      }

      return Sentry.captureException(new Error("Sentry storefront client test error"));
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

Create `sentry.server.config.ts` and `sentry.edge.config.ts`. For Next.js versions where Sentry's automatic server integrations conflict with instrumentation hooks, disable default integrations explicitly:

```ts
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
    defaultIntegrations: false,
    integrations: [],
  });
}
```

Create a global error boundary at `app/global-error.tsx`:

```tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={500} />
      </body>
    </html>
  );
}
```

Optional development-only server test route:

```ts
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const eventId = Sentry.captureException(new Error("Sentry storefront server test error"));
  await Sentry.flush(2000);

  return NextResponse.json({ eventId });
}
```

Validation:

```bash
npx tsc --noEmit
npm run build
npm run dev
```

In development, test from the browser console:

```js
window.__testSentryWeb()
```

In production, do not expose test helpers. To test a real browser error manually from the console:

```js
setTimeout(() => {
  throw new Error("Sentry storefront frontend production test error");
}, 0);
```

## Setup Scripts

For repositories with the same three-runtime architecture, provide a root setup script for local development and a Debian deployment script for production.

Recommended root scripts:

- `setup-sentry.ps1`: interactive Windows/local setup for `.env` files.
- `deploy-sentry-debian.sh`: interactive Debian production setup for env files, optional installs, builds, PM2 restart, and backend test event.

The scripts should:

1. Ask for environment.
2. Ask for backend, admin, and storefront DSNs.
3. Ask whether source map upload should be configured.
4. Write only untracked env files.
5. Never write secrets to `.env.example`.
6. Clear/cache Laravel config after backend env updates.
7. Optionally run install/build/test steps.

## Alerts

Recommended alert rule:

- Source: all critical application projects.
- Environment: `production`.
- Trigger: a new issue is created.
- Action: notify the configured Discord channel and email recipients.

For development tests, either include `development` in a temporary alert or test directly from the Sentry issue dashboard.

## Release and Source Maps

Use a release value that can be traced back to a deploy:

```env
SENTRY_RELEASE=project@<git-sha>-web
```

Upload source maps only during CI or deployment. Delete source maps after upload when the public build should not expose them.

## Privacy Defaults

Required defaults:

- `sendDefaultPii: false`
- `SENTRY_SEND_DEFAULT_PII=false`
- `SENTRY_TRACES_SAMPLE_RATE=0`
- no replay session capture by default
- no auth tokens in client-visible environment variables

## Implementation Checklist

1. Create Sentry projects and DSNs.
2. Add Laravel Sentry SDK and exception integration.
3. Add React/Vite Sentry SDK, instrumentation file, React error hooks, and optional source map plugin.
4. Add Next.js Sentry SDK, instrumentation files, server/edge/client config, global error boundary, and optional development test route.
5. Add env examples without real secrets.
6. Add local and production setup scripts if the repository has multiple runtimes.
7. Configure Sentry alerts for production.
8. Validate backend, admin, and storefront builds.
9. Send one controlled test event per runtime.
10. Confirm events appear in the expected Sentry project and environment.

## Common Failure Modes

### Frontend test helper is missing

`window.__testSentryWeb()` and `window.__testSentryAdmin()` should exist only in development. In production, use a real browser console throw or a temporary controlled error.

### Events are visible in Issues but alerts do not fire

Check the alert environment filter, project selection, trigger condition, and Discord integration channel.

### Laravel events do not arrive after env changes

Run:

```bash
php artisan optimize:clear
php artisan config:cache
```

### Next.js development crashes in instrumentation

If the error mentions a read-only `logger` property on instrumentation, disable automatic Sentry server integrations in `sentry.server.config.ts` and `sentry.edge.config.ts`:

```ts
defaultIntegrations: false,
integrations: [],
```

### Source maps do not upload

Verify:

- `SENTRY_AUTH_TOKEN` is available only during build.
- `SENTRY_ORG` matches the organization slug.
- `SENTRY_PROJECT` matches the project slug.
- The build creates source maps.
- The Sentry token has release and project write permissions.

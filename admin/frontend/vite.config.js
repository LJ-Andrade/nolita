import path from "path"
import { sentryVitePlugin } from "@sentry/vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// When VITE_HMR_HOST is set (production server behind reverse proxy),
// HMR connects via WSS through the proxy on port 443.
// When running locally, this variable is not set and Vite uses its
// default behavior (localhost), so no custom HMR config is needed.
const hmrHost = process.env.VITE_HMR_HOST;
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://nolita.test';
const shouldUploadSentrySourcemaps = Boolean(
	process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
);

export default defineConfig({
	base: '/vadmin/',
	build: {
		sourcemap: shouldUploadSentrySourcemaps,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "0.0.0.0",
		port: 5173,
		strictPort: true,
		hmr: hmrHost
			? { host: hmrHost, protocol: "wss", clientPort: 443 }
			: true, // default: connect to localhost (local dev)
		proxy: {
			'/api': {
				target: apiProxyTarget,
				changeOrigin: true,
				secure: false,
			},
			'/storage': {
				target: apiProxyTarget,
				changeOrigin: true,
				secure: false,
			},
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './src/test/setup.js',
	},
	plugins: [
		react(),
		sentryVitePlugin({
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
			authToken: process.env.SENTRY_AUTH_TOKEN,
			disable: !shouldUploadSentrySourcemaps,
			silent: !process.env.CI,
			release: {
				name: process.env.VITE_SENTRY_RELEASE || process.env.SENTRY_RELEASE,
			},
			sourcemaps: {
				filesToDeleteAfterUpload: ['./dist/**/*.map'],
			},
		}),
		// Redirect /vadmin (no trailing slash) → /vadmin/ so both URLs work
		{
			name: 'redirect-base',
			configureServer(server) {
				server.middlewares.use((req, _res, next) => {
					if (req.url === '/vadmin') {
						req.url = '/vadmin/';
					}
					next();
				});
			},
		},
	],
})


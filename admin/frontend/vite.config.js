import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// When VITE_HMR_HOST is set (production server behind reverse proxy),
// HMR connects via WSS through the proxy on port 443.
// When running locally, this variable is not set and Vite uses its
// default behavior (localhost), so no custom HMR config is needed.
const hmrHost = process.env.VITE_HMR_HOST;

export default defineConfig({
	base: '/vadmin/',
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
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './src/test/setup.js',
	},
	plugins: [
		react(),
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


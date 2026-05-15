import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = dirname(fileURLToPath(import.meta.url));
const vadminApiEndpoint = process.env.NEXT_PUBLIC_VADMIN_API_URL;

if (!vadminApiEndpoint) {
  throw new Error("NEXT_PUBLIC_VADMIN_API_URL is required.");
}

const vadminOrigin = new URL(vadminApiEndpoint).origin;

export default {
  cacheComponents: true,
  turbopack: {
    root: appRoot,
  },
  async redirects() {
    return [
      {
        source: "/catalog",
        destination: "/catalogo",
        permanent: false,
      },
      {
        source: "/product/:handle",
        destination: "/producto/:handle",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/registro",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/ingreso",
        permanent: false,
      },
      {
        source: "/checkout",
        destination: "/finalizar-compra",
        permanent: false,
      },
      {
        source: "/checkout/success",
        destination: "/finalizar-compra/exito",
        permanent: false,
      },
      {
        source: "/search/:collection",
        destination: "/catalogo?categoria=:collection",
        permanent: false,
      },
      {
        source: "/search",
        destination: "/buscar",
        permanent: false,
      },
      {
        source: "/profile",
        destination: "/perfil",
        permanent: false,
      },
      {
        source: "/categories",
        destination: "/catalogo",
        permanent: false,
      },
      {
        source: "/categorias",
        destination: "/catalogo",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/vadmin-storage/:path*",
        destination: `${vadminOrigin}/storage/:path*`,
      },
    ];
  },
  experimental: {
    inlineCss: true,
  },
  allowedDevOrigins: ["192.168.1.36", "192.168.56.1"],

  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.1.36",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "192.168.56.1",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nolita.test",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "nolita.studiovimana.com.ar",
        pathname: "/storage/**",
      }
    ],
  },
};

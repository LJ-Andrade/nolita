export default {
  cacheComponents: true,
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
        protocol: "http",
        hostname: "soyplanb.com.ar",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "soyplanb.com.ar",
        pathname: "/storage/**",
      }
    ],
  },
};

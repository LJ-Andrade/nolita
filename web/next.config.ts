export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  allowedDevOrigins: ["192.168.1.36"],

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
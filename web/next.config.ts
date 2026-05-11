export default {
  cacheComponents: true,
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

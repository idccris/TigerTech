import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://store.bblcdn.com https://cdn.shopify.com https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://*.g.doubleclick.net https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://ssl.gstatic.com https://www.gstatic.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://tagmanager.google.com https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://tagmanager.google.com https://www.googleadservices.com https://www.google.com",
      "connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://*.g.doubleclick.net https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://ad.doubleclick.net",
      "frame-src https://www.googletagmanager.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { "/api/admin/catalogo-pdf": ["./assets/machine-catalogs/*.pdf"] },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "store.bblcdn.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
    localPatterns: [
      {
        pathname: "/tiger-tech-logo.png",
      },
      {
        pathname: "/api/products/image",
      },
      {
        pathname: "/api/conteudos/image",
      },
      {
        pathname: "/products/filaments/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const scriptSrc = process.env.NODE_ENV === "development"
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tuzgyvduqottmttlfjhf.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
  },
  // A Vercel possui seu próprio adaptador de output. O modo standalone é
  // mantido apenas para a imagem Docker, que consome `.next/standalone`.
  output: process.env.VERCEL ? undefined : "standalone",
  // Evita warning de lockfiles múltiplos durante o build definindo explicitamente a raiz do Turbopack
  turbopack: { root: process.cwd() },
};

export default nextConfig;

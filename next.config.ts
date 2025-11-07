import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tuzgyvduqottmttlfjhf.supabase.co',
        pathname: '/storage/v1/**'
      }
    ]
  },
  // Não exportar páginas /admin como estáticas - forçar SSR
  output: 'standalone',
  // Evita warning de lockfiles múltiplos durante o build definindo explicitamente a raiz do Turbopack
  // @ts-ignore Campo não tipado oficialmente
  turbopack: { root: __dirname },
};

export default nextConfig;

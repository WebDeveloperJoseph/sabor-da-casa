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
};

export default nextConfig;

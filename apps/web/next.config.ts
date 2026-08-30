import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@school-result/shared'],
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${process.env.API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

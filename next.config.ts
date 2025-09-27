import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript build errors for development
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable Next.js hot reload, handled by nodemon
  reactStrictMode: false,
  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack's hot module replacement
      config.watchOptions = {
        ignored: ['**/*'], // Ignore all file changes
      };
    }
    return config;
  },
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

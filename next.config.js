const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Turbopack configuration (empty to acknowledge Next.js 16 default)
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        crypto: false,
        path: false,
      };
    }
    return config;
  },
  output: 'export',
  trailingSlash: true,
  images: {
    // 静的エクスポートのため最適化サーバーは使わず、CMSの画像APIで縮小する
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
};

module.exports = nextConfig;

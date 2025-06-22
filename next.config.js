const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    unoptimized: true,
  },
  // エクスポート時に静的に出せないページを除外する
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId },
  ) {
    const pathMap = {
      ...defaultPathMap,
    };
    delete pathMap['/admin/posts/new'];
    delete pathMap['/sitemap.xml'];
    delete pathMap['/feed.xml'];

    return pathMap;
  },
};

module.exports = nextConfig;

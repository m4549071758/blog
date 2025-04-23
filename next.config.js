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

  // 管理者ページを静的エクスポート対象から除外
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId },
  ) {
    // defaultPathMapからadmin関連のパスを除外
    const filteredPathMap = {};

    Object.entries(defaultPathMap).forEach(([path, config]) => {
      if (!path.startsWith('/admin')) {
        filteredPathMap[path] = config;
      }
    });

    return filteredPathMap;
  },
};

module.exports = nextConfig;

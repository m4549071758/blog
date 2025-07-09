module.exports = {
  apps: [
    {
      name: 'blog',
      script: 'npx',
      args: 'next start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};

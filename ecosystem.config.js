module.exports = {
  apps: [
    {
      name: 'zhaoming-brake',
      script: 'server.js',
      cwd: '/www/wwwroot/zhaoming-brake',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:./prod.db',
        NEXTAUTH_SECRET: 'change-this-secret-in-production',
        NEXT_PUBLIC_SITE_URL: 'https://your-domain.com',
      },
    },
  ],
};

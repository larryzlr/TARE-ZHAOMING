const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@vercel/blob"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
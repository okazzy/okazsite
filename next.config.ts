import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:locale/privacy-policy',
        destination: '/:locale/privacy',
        permanent: true,
      },
      {
        source: '/:locale/terms-of-service',
        destination: '/:locale/terms',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

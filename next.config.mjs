import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.wixstatic.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  },
  async headers() {
    // En-têtes de sécurité appliqués à toutes les routes.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' }
        ]
      }
    ];
  },
  async redirects() {
    // Redirections 301 depuis les anciennes URLs Wix (préservation SEO).
    return [
      { source: '/about', destination: '/a-propos', permanent: true },
      { source: '/blog', destination: '/actualites', permanent: true },
      { source: '/donate/qasr-al-yahud/baptismalsiteredemption', destination: '/mission', permanent: true },
      { source: '/donate/old-city-jerusalem', destination: '/mission', permanent: true },
      { source: '/donate/old-city-jerusalem-1', destination: '/mission', permanent: true },
      { source: '/donate/jerusalem-and-surrounding', destination: '/mission', permanent: true },
      { source: '/donate/:path*', destination: '/mission', permanent: true }
    ];
  }
};

export default withNextIntl(nextConfig);

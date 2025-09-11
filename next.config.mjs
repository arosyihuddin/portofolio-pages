/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Canonicalize www to apex
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'www.arosyihuddin.my.id' },
        ],
        destination: 'https://arosyihuddin.my.id/:path*',
        permanent: true,
      },
      // Redirect old domains to new domain (if they are mapped to this project)
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'arosyihuddin.site' },
        ],
        destination: 'https://arosyihuddin.my.id/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'rosyihuddin.tech' },
        ],
        destination: 'https://arosyihuddin.my.id/:path*',
        permanent: true,
      },
      // Normalize /index.html to /
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */

// Backend API base. Server-side only (used by the rewrite below), so it does NOT
// need the NEXT_PUBLIC_ prefix. Set API_BACKEND_URL in Vercel project settings.
const BACKEND_URL = process.env.API_BACKEND_URL || 'http://63.141.242.203:6001';

const nextConfig = {
  transpilePackages: ['minimal-shared'],

  // Proxy /api/proxy/* through Next.js to the backend. The browser only ever
  // calls the same (HTTPS) origin, so there's no mixed-content block on Vercel
  // and no CORS needed — Next forwards the request server-side to the HTTP API.
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

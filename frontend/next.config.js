/** @type {import('next').NextConfig} */
const backend = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000';

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async rewrites() {
    return [
      { source: '/favicon.ico', destination: '/favicon.png' },
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/socket.io', destination: `${backend}/socket.io` },
      { source: '/socket.io/:path*', destination: `${backend}/socket.io/:path*` },
    ];
  },
};

module.exports = nextConfig;

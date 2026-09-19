/** @type {import('next').NextConfig} */
// Always proxy internally. Using the public site URL here caused a 508 loop
// and made login hang until the client timed out.
const backend = 'http://127.0.0.1:4000';

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

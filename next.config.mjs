/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CUSTOM_FILE_API_KEY: process.env.CUSTOM_FILE_API_KEY,
    CUSTOM_FILE_API_PATH: process.env.CUSTOM_FILE_API_PATH,
  },
  async rewrites() {
    return [
      {
        source: '/:path*', // Match all routes
        destination: '/',  // Redirect them to the SPA entry point
      },
    ];
  },
};

export default nextConfig;
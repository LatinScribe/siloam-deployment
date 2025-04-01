//import { API_URL } from './utils/dataInterface';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*', // Match all routes
        destination: '/',  // Redirect them to the SPA entry point
      },
    ];
  },
  env: {
    CUSTOM_FILE_API_KEY: process.env.CUSTOM_FILE_API_KEY,
    CUSTOM_FILE_API_PATH: process.env.CUSTOM_FILE_API_PATH,
    CUSTOM_FILE_OUTPUT_PATH: process.env.CUSTOM_FILE_OUTPUT_PATH,
    API_URL: process.env.API_URL,
    SERVER_URL: process.env.SERVER_URL,
  },
  // Removed deprecated experimental block
};

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other existing configurations...
  typescript: {
    // ⚠️ WARNING:
    // Setting this to true allows production builds to successfully complete
    // even if your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
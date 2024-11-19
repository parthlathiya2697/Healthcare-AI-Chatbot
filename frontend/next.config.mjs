/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other existing configurations...
  typescript: {
    // ⚠️ WARNING:
    // Setting this to true allows production builds to successfully complete
    // even if your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
},
};

export default nextConfig;
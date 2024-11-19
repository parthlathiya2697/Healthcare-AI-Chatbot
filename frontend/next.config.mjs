/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;

// next.config.js
module.exports = {
    // Other existing configurations...
    typescript: {
      // ⚠️ WARNING:
      // Setting this to true allows production builds to successfully complete
      // even if your project has type errors.
      ignoreBuildErrors: true,
    },
  };
  
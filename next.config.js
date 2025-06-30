/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/learning-app', // Change this to your IIS sub-application path
  output: 'export',
  typescript: {
    // Allow production builds to complete even with type errors (optional)
    ignoreBuildErrors: false,
  },
  // Optional: Configure image domains if needed
  images: {
    domains: ['https://enterprisedemo.instancy.com/'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
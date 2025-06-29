/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/learning-app', // Change this to your IIS sub-application path
  output: 'export',
  async headers() {
    return [
      {
        source: '/tavus/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
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
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false, // Ensures consistent URL structure without trailing slashes

  // Skip trailing slash redirect for middleware compatibility
  skipTrailingSlashRedirect: false,

  // Prevent duplicate pages with different casing
  // This helps with canonical URLs
  async redirects() {
    return [];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'output',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  /* config options here */
};

export default nextConfig;

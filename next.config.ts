import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "backapi.hemmx.org",
      },
    ],
  },
};

export default nextConfig;

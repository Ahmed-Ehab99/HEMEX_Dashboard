import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backapi.hemmx.org",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;

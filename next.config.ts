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
    domains: ["backapi.hemmx.org", "localhost"],
  },
};

export default nextConfig;

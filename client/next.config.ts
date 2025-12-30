import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@hugeicons/react"],
  images: {
    formats: ["image/webp", "image/avif"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_API_URL ||
      process.env.API_BASE_URL ||
      "https://kisansetu-1-bmg9.onrender.com";

    const cleanUrl = backendUrl.replace(/\/+$/, "").replace(/\/api$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${cleanUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

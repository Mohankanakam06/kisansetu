import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    let rawUrl = (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://kisansetu-1-bmg9.onrender.com"
    ).trim();

    // Strip leading/trailing quotes if passed from dashboard
    rawUrl = rawUrl.replace(/^["']|["']$/g, "").trim();

    // Fallback if empty
    if (!rawUrl) {
      rawUrl = "https://kisansetu-1-bmg9.onrender.com";
    }

    // Ensure scheme starts with http:// or https://
    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      rawUrl = `https://${rawUrl}`;
    }

    const cleanUrl = rawUrl.replace(/\/+$/, "").replace(/\/api$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${cleanUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

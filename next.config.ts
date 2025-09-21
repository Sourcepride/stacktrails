import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const backendURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8082";
const IsDEV = backendURL.startsWith("http://localhost");

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8082/:path*", // backend
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: IsDEV ? "http" : "https",
        hostname: new URL(backendURL).hostname, // ✅ only your backend
      },
    ],
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.lottie$/,
      type: "asset/resource", // tells Next.js to emit the file and return a URL
    });

    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

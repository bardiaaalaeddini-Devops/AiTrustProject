import type { NextConfig } from "next";

/**
 * Security headers reduce the risk of leaking study URL parameters
 * through cross-origin referrer headers and prevent content sniffing.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" }
        ]
      }
    ];
  }
};

export default nextConfig;

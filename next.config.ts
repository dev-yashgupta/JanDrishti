import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

// Enable standalone output only when building for Docker/production.
// "next start" (local dev) does NOT work with output: standalone.
const isDocker = process.env.BUILD_TARGET === "docker";

const nextConfig: NextConfig = {
  ...(isDocker ? { output: "standalone" } : {}),

  // Proxy /api/* and /uploads/* to the FastAPI backend.
  // Works in both "next dev" and "next start" modes.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;

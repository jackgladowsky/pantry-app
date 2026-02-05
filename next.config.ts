import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // For Docker deployment
  allowedDevOrigins: [
    "100.75.103.81",
    "192.168.4.72",
    "localhost",
  ],
};

export default nextConfig;

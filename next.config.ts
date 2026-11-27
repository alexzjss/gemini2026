import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Os protótipos em /design são só referência visual e não entram no bundle.
  experimental: { optimizePackageImports: ["@mui/material", "@mui/icons-material"] },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ui5/webcomponents",
    "@ui5/webcomponents-react",
    "@ui5/webcomponents-fiori",
    "@ui5/webcomponents-icons",
  ],
  experimental: {
    // esmExternals: "loose",
  },
};

export default nextConfig;

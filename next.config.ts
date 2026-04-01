import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Đã tắt để dự án News AI chạy động tốt hơn
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
};

export default nextConfig;

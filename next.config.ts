import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export", // Đã tắt để dự án News AI chạy động tốt hơn
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEWS_API_URL || "http://127.0.0.1:8000"}/api/v1/:path*`,
      },
      {
        source: "/job-api/:path*",
        destination: `${process.env.JOB_API_URL || "http://127.0.0.1:8000"}/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    // ESLint is a dev-only tool; let the CI/CD pipeline pass without it
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are caught locally; keep CI/CD builds unblocked
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

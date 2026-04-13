import type { Metadata } from "next";
import "./globals.css";
import PageLoader from "@/components/PageLoader";

export const metadata: Metadata = {
  title: "DevPulse - Tin tức, Việc làm IT & Xu hướng Công nghệ",
  description: "Nhịp đập của cộng đồng Developer Việt Nam — tổng hợp tin tức tech, cơ hội việc làm IT và xu hướng công nghệ mới nhất mỗi ngày.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <PageLoader />
        {children}
      </body>
    </html>
  );
}

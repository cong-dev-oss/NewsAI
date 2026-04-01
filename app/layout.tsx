import type { Metadata } from "next";
import "./globals.css";
import PageLoader from "@/components/PageLoader";

export const metadata: Metadata = {
  title: "NewsHub - Tin tức nhanh, chính xác, đáng tin cậy",
  description: "Đọc báo online với giao diện sạch sẽ, tươi sáng. Cập nhật tin tức mới nhất về thế giới, kinh tế, công nghệ, thể thao và nhiều chủ đề khác.",
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

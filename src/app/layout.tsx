import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "룸 대관 서비스",
  description: "룸 A, B, C 예약 시스템",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

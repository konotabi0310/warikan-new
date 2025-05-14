import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import MobileNav from "@/components/ui/MobileNav"; // 👈 追加

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ラクワリ",
  description: "カップルのための費用管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <div className="pb-16"> {/* 👈 ナビゲーションの高さ分だけ下に余白 */}
            {children}
          </div>
          <MobileNav /> {/* 👈 モバイル下部ナビ */}
        </UserProvider>
      </body>
    </html>
  );
}
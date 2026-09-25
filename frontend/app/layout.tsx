import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

// next/font only accepts literals here, so the Japanese fallback stack is
// repeated rather than shared. Japanese glyphs are not in the `latin` subset,
// so naming real Japanese system faces keeps Windows off MS PGothic.
const notoSansJP = Noto_Sans_JP({
  display: "swap",
  fallback: [
    "Hiragino Sans",
    "Hiragino Kaku Gothic ProN",
    "Yu Gothic Medium",
    "Yu Gothic",
    "Meiryo",
    "system-ui",
    "sans-serif",
  ],
  subsets: ["latin"],
  variable: "--font-jp",
  weight: ["400", "500", "700"],
});

// Numerals only: times, durations and day numbers, where tabular figures matter.
const inter = Inter({
  display: "swap",
  fallback: [
    "Hiragino Sans",
    "Hiragino Kaku Gothic ProN",
    "Yu Gothic Medium",
    "Yu Gothic",
    "Meiryo",
    "system-ui",
    "sans-serif",
  ],
  subsets: ["latin"],
  variable: "--font-num",
});

export const metadata: Metadata = {
  title: "シフト希望",
  description: "シフト希望入力モックアプリ",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1017" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${inter.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

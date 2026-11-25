import type { Metadata } from "next";
import localFont from "next/font/local";
import BottomNavigation from "@/components/home/BottomNavigation";
import "./globals.css";

// Use local copies of Geist to avoid build-time network requests
const geistSans = localFont({
  src: [{ path: "../public/fonts/GeistVF.woff2", weight: "100 900" }],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ormakoodu – Malayalam Family Calendar",
  description:
    "A premium, minimal Malayalam family calendar experience by Ormakoodu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ml"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to Google Fonts for Noto Sans Malayalam (loads at runtime) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}

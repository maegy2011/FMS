import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/navigation";
import { LoadingOverlay } from "@/components/loading-overlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "نظام إدارة الجهات والإيرادات",
  description: "نظام متكامل لإدارة الجهات والإيرادات المالية",
  keywords: ["إدارة الجهات", "الإيرادات", "نظام مالي", "Next.js", "TypeScript"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Navigation />
        <LoadingOverlay />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

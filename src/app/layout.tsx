import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "نظام الإدارة المالية | FMS",
  description: "نظام إدارة مالية متكامل مع تصميم إسلامي أندلسي حديث",
  keywords: ["نظام مالي", "محاسبة", "إدارة", "FMS", "إسلامي", "أندلسي"],
  authors: [{ name: "فريق نظام الإدارة المالية" }],
  openGraph: {
    title: "نظام الإدارة المالية | FMS",
    description: "نظام إدارة مالية متكامل مع تصميم إسلامي أندلسي حديث",
    url: "https://fms-system.com",
    siteName: "نظام الإدارة المالية",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "نظام الإدارة المالية | FMS",
    description: "نظام إدارة مالية متكامل مع تصميم إسلامي أندلسي حديث",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.className} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

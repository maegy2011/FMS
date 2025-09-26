import type { Metadata } from "next";
import { Cairo, Tajawal, Amiri, Markazi_Text } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const markazi = Markazi_Text({
  variable: "--font-markazi",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "نظام الإدارة المالية | FMS",
  description: "نظام متكامل لإدارة الشؤون المالية بتصميم عربي إسلامي حديث",
  keywords: ["نظام إدارة مالية", "محاسبة", "مالية", "عربي", "إسلامي"],
  authors: [{ name: "فريق FMS" }],
  openGraph: {
    title: "نظام الإدارة المالية | FMS",
    description: "نظام متكامل لإدارة الشؤون المالية بتصميم عربي إسلامي حديث",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "نظام الإدارة المالية | FMS",
    description: "نظام متكامل لإدارة الشؤون المالية بتصميم عربي إسلامي حديث",
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
        className={`${cairo.variable} ${tajawal.variable} ${amiri.variable} ${markazi.variable} font-sans antialiased bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

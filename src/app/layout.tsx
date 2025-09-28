import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

// Arabic font for better RTL support
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "نظام الإدارة المالية | FMS",
  description: "نظام إدارة مالية متكامل مع تصميم أندلسي إسلامي حديث",
  keywords: ["نظام مالي", "إدارة مالية", "FMS", "أندلسي", "إسلامي", "حكومي"],
  authors: [{ name: "FMS Team" }],
  openGraph: {
    title: "نظام الإدارة المالية | FMS",
    description: "نظام إدارة مالية متكامل مع تصميم أندلسي إسلامي حديث",
    url: "https://fms.example.com",
    siteName: "FMS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "نظام الإدارة المالية | FMS",
    description: "نظام إدارة مالية متكامل مع تصميم أندلسي إسلامي حديث",
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
        className={`${cairo.variable} font-sans antialiased bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950 dark:to-amber-950 text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";

const mainFont = Rubik({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "منصة الاستاذ اكرم مسلم",
  description:
    "منصة الاستاذ اكرم مسلم المتخصصه في علوم الاحياء وكل ما يتعلق بالماده وتقديم كورسات وشروحات تجعل الماده بسيطه للطلاب",
  verification: {
    google: "O-cKdqwjHYrbVVVuet0Rqjses6YJqDGw_8-wJ8V0wZA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${mainFont.className} antialiased`}>
        <QueryProvider>
          <Navbar />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/main-layout";
import { Providers } from "@/providers/query-provider";
import { Toaster } from "react-hot-toast";

const mainfont = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "أكرم مسلم | لوحة التحكم",
  description: "لوحة تحكم للأدمن أكرم مسلم",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${mainfont.className} antialiased`}>
        <Providers>
          <MainLayout>
            {children}
            <Toaster position="bottom-center" />
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}

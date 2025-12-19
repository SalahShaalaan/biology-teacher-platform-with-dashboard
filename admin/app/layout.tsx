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
  title: "أستاذ أكرم مسلم | لوحة التحكم",
  description: "لوحة تحكم للأدمن أكرم مسلم",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body
        className={`${mainfont.className} bg-gray-50 dark:bg-[#191919] antialiased`}
      >
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

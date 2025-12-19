"use client";

import React, { useEffect } from "react";
import { Topbar } from "./top-bar";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { MainSidebar } from "./sidebar";
import { useAuth } from "@/components/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !token && pathname !== "/login") {
      router.push("/login");
    }
  }, [isLoading, token, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#191919]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If on login page, render children without sidebar/topbar layout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Ensure we don't render protected content while redirecting
  if (!token && pathname !== "/login") {
     return null;
  }

  // If authenticated, render full layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#191919]">
      <SidebarProvider>
        <Sidebar
          side="right"
          variant="inset"
          collapsible="icon"
          className="h-auto border-none shadow-none"
        >
          <MainSidebar />
        </Sidebar>
        <SidebarInset className="bg-white dark:bg-[#191919]">
          <div className="space-y-6 p-4 sm:p-6">
            <Topbar />
            <main className="pb-6">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

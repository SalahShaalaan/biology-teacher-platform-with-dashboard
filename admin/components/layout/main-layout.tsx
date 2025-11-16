"use client";

import React from "react";
import { Topbar } from "./top-bar";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { MainSidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider>
        <Sidebar
          side="right"
          variant="inset"
          collapsible="icon"
          className="h-auto border-none shadow-none"
        >
          <MainSidebar />
        </Sidebar>
        <SidebarInset className="bg-white">
          <div className="space-y-6 p-4 sm:p-6">
            <Topbar />
            <main className="pb-6">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

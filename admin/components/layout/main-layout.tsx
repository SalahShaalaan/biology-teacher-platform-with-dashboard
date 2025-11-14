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
    <SidebarProvider className="min-h-[calc(100svh-32px)] sm:min-h-[calc(100svh-48px)] overflow-hidden bg-gray-100">
      <Sidebar
        side="right"
        variant="inset"
        collapsible="icon"
        className="top-4 bottom-4 right-4 sm:top-6 sm:bottom-6 sm:right-6 h-auto w-60"
      >
        <MainSidebar />
      </Sidebar>
      <SidebarInset className="min-h-full space-y-6 p-4 sm:p-6 md:peer-data-[state=collapsed]:mr-[calc(theme(spacing.16)+theme(spacing.6))]">
        <Topbar />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import { LogOut } from "lucide-react";

export function Topbar() {
  const { logout } = useAuth();

  return (
    <header>
      <div className="bg-gray-50 dark:bg-[#191919] border border-gray-700 rounded-3xl h-16 lg:h-20 flex items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger
            className="rounded-full border border-gray-200"
            aria-label="Toggle sidebar"
          />
          <div className="hidden md:block min-w-0">
            <p className="text-slate-300 text-xs leading-none">مرحباً،</p>
            <p className="text-slate-300 font-semibold text-sm truncate">
أكرم مسلم              <span aria-hidden className="ms-1">
                👋
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button variant="ghost" size="icon" onClick={() => logout()} title="تسجيل الخروج" className="hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            <LogOut className="h-5 w-5 text-red-500" />
          </Button>

          {/* Admin Avatar */}
          <div
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm"
            aria-label="Admin profile"
          >
            <Image
              src="/icon.png"
              width={48}
              height={48}
              alt="user image"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

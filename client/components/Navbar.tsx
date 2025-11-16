"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "الرئيسية" },
    { href: "/questions-section", label: "قسم الاسئله" },
    { href: "/blogs", label: "الشروحات النظرية" },
    { href: "/results", label: "نتائج الامتحانات" },
  ];

  return (
    <nav className="relative z-50 bg-white/95 ">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-right">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 logo-font">
                الأستاذ أكـرم مسلم
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 space-x-reverse">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-emerald-500 transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Student Portal Button */}
          <div className="hidden lg:block">
            <Link href="/student-portal">
              <Button className="bg-[#295638] cursor-pointer hover:bg-emerald-700 text-white px-6 py-2.5 rounded-none hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                بوابة الطالب
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              ) : (
                <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium text-lg">{item.label}</span>
                </Link>
              ))}
              <Link className="pt-4 px-4" href="/student-portal">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  بوابة الطالب
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

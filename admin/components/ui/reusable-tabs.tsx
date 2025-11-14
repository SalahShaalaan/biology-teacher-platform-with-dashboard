"use client";

import { memo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
}

interface ReusableTabsProps {
  activeTab: string;
  tabItems: TabItem[];
  onTabChange: (key: string) => void;
  className?: string;
}

const ReusableTabs = memo(function ReusableTabs({
  activeTab,
  tabItems,
  onTabChange,
  className,
}: ReusableTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className={cn("w-full", className)}
    >
      <TabsList className="bg-transparent p-0 h-auto border-b border-gray-200 justify-end shadow-none rounded-none">
        {tabItems.map((item) => (
          <TabsTrigger
            key={item.key}
            value={item.key}
            className={cn(
              "bg-transparent border-b-2 border-transparent rounded-none px-4 py-2.5 transition-all duration-200 capitalize",
              "text-sm text-gray-500 font-medium",
              "data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#DBA32C] data-[state=active]:border-b-[#DBA32C]",
              "hover:text-[#DBA32C]"
            )}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
});

export default ReusableTabs;

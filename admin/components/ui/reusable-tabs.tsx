import { memo, useMemo } from "react";
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
  maxVisibleTabs?: number;
}

const ReusableTabs = memo(function ReusableTabs({
  activeTab,
  tabItems,
  onTabChange,
  className,
  maxVisibleTabs = 5,
}: ReusableTabsProps) {
  const { visibleTabs, hiddenTabs } = useMemo(() => {
    if (tabItems.length <= maxVisibleTabs) {
      return { visibleTabs: tabItems, hiddenTabs: [] };
    }
    return {
      visibleTabs: tabItems.slice(0, maxVisibleTabs),
      hiddenTabs: tabItems.slice(maxVisibleTabs),
    };
  }, [tabItems, maxVisibleTabs]);

  const isHiddenTabActive = useMemo(
    () => hiddenTabs.some((tab) => tab.key === activeTab),
    [hiddenTabs, activeTab]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className={cn("w-full", className)}
    >
      <TabsList className="bg-transparent p-0 h-auto border-b border-gray-200 justify-start w-full flex-wrap shadow-none rounded-none">
        {visibleTabs.map((item) => (
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

        {hiddenTabs.length > 0 && (
          <div className="relative inline-flex items-center group">
            <select
              value={isHiddenTabActive ? activeTab : "more"}
              onChange={(e) => {
                if (e.target.value !== "more") {
                  onTabChange(e.target.value);
                }
              }}
              className={cn(
                "appearance-none bg-transparent border-b-2 border-transparent rounded-none pl-9 pr-4 py-2.5 transition-all duration-200 capitalize",
                "text-sm text-gray-500 font-medium group-hover:text-[#DBA32C] focus:outline-none focus-visible:ring-0 focus-visible:border-[#DBA32C] cursor-pointer",
                isHiddenTabActive && "text-[#DBA32C] border-b-[#DBA32C]"
              )}
            >
              <option value="more" disabled className="bg-[#202124] text-gray-500">
                المزيد
              </option>
              {hiddenTabs.map((item) => (
                <option
                  key={item.key}
                  value={item.key}
                  className="bg-[#202124] text-gray-200"
                >
                  {item.label}
                </option>
              ))}
            </select>
            <div
              className={cn(
                "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200",
                "group-hover:text-[#DBA32C]",
                isHiddenTabActive && "text-[#DBA32C]"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        )}
      </TabsList>
    </Tabs>
  );
});

export default ReusableTabs;

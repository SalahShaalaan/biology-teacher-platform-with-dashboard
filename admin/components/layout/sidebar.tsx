"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { topNavItems, NavItem } from "./nav-items";

const NavMenuItem = ({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) => {
  const isActive = pathname === item.href;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="text-gray-600 data-[active=true]:bg-white data-[active=true]:text-gray-900 data-[active=true]:font-semibold data-[active=true]:shadow-sm justify-end pr-4 text-right group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:[&>svg]:size-5 group-data-[collapsible=icon]:[&>svg]:mx-auto"
      >
        <Link href={item.href} className="flex w-full items-center gap-3">
          <span className="font-normal text-sm">{item.label}</span>
          <Image src={item.icon} width={18} height={18} alt="icon" />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="flex items-center justify-center p-4">
        <h1>أكرم مسلم</h1>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {topNavItems.map((item) => (
                <NavMenuItem key={item.label} item={item} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-auto bg-gray-200" />
      </SidebarContent>
    </>
  );
}

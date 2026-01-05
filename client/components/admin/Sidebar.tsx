"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavItems } from "./AdminNav";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { useBranding } from "@/components/providers/BrandingProvider";
import Image from "next/image";

const NavContent = ({
  pathname,
  isCollapsed,
}: {
  pathname: string;
  isCollapsed: boolean;
}) => (
  <div className="flex flex-col gap-2 py-2">
    {adminNavItems.map((item) => {
      const Icon = item.icon;
      const isActive =
        pathname === item.href || pathname.startsWith(`${item.href}/`);

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground",
            isCollapsed && "justify-center px-0",
          )}
          title={isCollapsed ? item.title : undefined}
        >
          <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          {!isCollapsed && <span>{item.title}</span>}
        </Link>
      );
    })}
  </div>
);

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { brandName, logo } = useBranding();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[240px] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border"
          >
            <div className="flex h-14 items-center gap-2 border-b px-4 border-sidebar-border">
              {logo ? (
                <Image
                  src={logo}
                  alt={brandName}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="font-bold">{brandName}</span>
              )}
            </div>
            <ScrollArea className="h-[calc(100vh-64px)] px-2">
              <NavContent pathname={pathname} isCollapsed={false} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-3 border-sidebar-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              {logo ? (
                <Image
                  src={logo}
                  alt={brandName}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="font-bold truncate">{brandName}</span>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="ml-auto h-8 w-8"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2">
          <NavContent pathname={pathname} isCollapsed={isCollapsed} />
        </ScrollArea>
      </div>
    </>
  );
}

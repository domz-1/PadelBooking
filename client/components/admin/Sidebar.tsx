"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavItems, NavItem } from "./AdminNav";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PanelLeftClose, PanelLeftOpen, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useBranding } from "@/components/providers/BrandingProvider";
import Image from "next/image";

const NavItemComponent = ({
  item,
  pathname,
  isCollapsed,
  depth = 0,
}: {
  item: NavItem;
  pathname: string;
  isCollapsed: boolean;
  depth?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));
  const hasChildren = item.children && item.children.length > 0;

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="flex flex-col">
      <Link
        href={item.href}
        onClick={toggleOpen}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground",
          isCollapsed && "justify-center px-0",
          depth > 0 && "ml-4"
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        {!isCollapsed && <span className="flex-1">{item.title}</span>}
        {!isCollapsed && hasChildren && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        )}
      </Link>
      {!isCollapsed && hasChildren && isOpen && (
        <div className="mt-1 flex flex-col gap-1">
          {item.children?.map((child) => (
            <NavItemComponent
              key={child.title + child.href}
              item={child}
              pathname={pathname}
              isCollapsed={isCollapsed}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const NavContent = ({
  pathname,
  isCollapsed,
}: {
  pathname: string;
  isCollapsed: boolean;
}) => (
  <div className="flex flex-col gap-2 py-4">
    {adminNavItems.map((item) => (
      <NavItemComponent
        key={item.title + item.href}
        item={item}
        pathname={pathname}
        isCollapsed={isCollapsed}
      />
    ))}
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
            className="w-[280px] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border"
          >
            <div className="flex h-14 items-center gap-2 border-b px-4 border-sidebar-border">
              {logo ? (
                <Image
                  src={logo}
                  alt={brandName}
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                  unoptimized
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

      <div
        className={cn(
          "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-[70px]" : "w-[260px]",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 border-sidebar-border">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              {logo ? (
                <Image
                  src={logo}
                  alt={brandName}
                  width={35}
                  height={35}
                  className="h-9 w-auto"
                  unoptimized
                />
              ) : (
                <span className="font-bold truncate text-lg">{brandName}</span>
              )}
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn("h-8 w-8", isCollapsed ? "mx-auto" : "ml-auto")}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <NavContent pathname={pathname} isCollapsed={isCollapsed} />
        </ScrollArea>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Menu,
  ShieldPlus,
  Moon,
  Sun,
  ShoppingCart,
  Home,
  Calendar,
  GraduationCap,
  Store as StoreIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useBranding } from "@/components/providers/BrandingProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/bookings", label: "Schedule", icon: Calendar },
  { href: "/academy", label: "Academy", icon: GraduationCap },
  { href: "/store", label: "Store", icon: StoreIcon, badge: "NEW" },
];

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { brandName, logo } = useBranding();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth")) return null;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
    setIsMobileMenuOpen(false);
  };

  const handleMobileNav = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl flex items-center gap-2 hover:opacity-80 transition-opacity">
            {logo && logo.length > 0 ? (
              <Image
                src={logo}
                alt={brandName}
                width={40}
                height={40}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            ) : (
              <span className="text-primary">{brandName}</span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <DesktopNavLinks pathname={pathname} />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-[10px] font-bold animate-in zoom-in">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                title="Admin Dashboard"
              >
                <Button variant="ghost" size="icon" className="text-primary rounded-full hover:bg-primary/10">
                  <ShieldPlus className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-primary/10 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-in fade-in-0 zoom-in-95">
                  <div className="flex items-center justify-start gap-2 p-2 border-b mb-1">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col space-y-0.5 leading-none">
                      <p className="font-medium text-sm text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-bookings")} className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" /> My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")} className="cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild size="sm" className="font-semibold">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="font-semibold shadow-sm hover:shadow-md transition-all">
                  <Link href="/auth/register">Join Now</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
              <div className="flex flex-col h-full mt-6">
                <div className="flex items-center gap-2 mb-8 px-2">
                  {logo ? (
                    <div className="relative h-8 w-24">
                      <Image
                        src={logo}
                        alt={brandName}
                        fill
                        className="object-contain object-left"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-lg text-primary">{brandName}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <Button
                      key={item.href}
                      variant={pathname === item.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 px-4 h-12 text-base font-medium",
                        pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => handleMobileNav(item.href)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[10px] bg-primary/20 text-primary border-none">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                <hr className="my-6 border-border" />

                {isAuthenticated ? (
                  <div className="flex flex-col space-y-1">
                    <div className="px-4 py-2 border rounded-lg bg-card/50 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium truncate">{user?.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-4" onClick={() => handleMobileNav("/profile")}>
                      <User className="h-4 w-4" /> Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-4" onClick={() => handleMobileNav("/my-bookings")}>
                      <Calendar className="h-4 w-4" /> My Bookings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-4" onClick={() => handleMobileNav("/orders")}>
                      <ShoppingCart className="h-4 w-4" /> My Orders
                    </Button>
                    {user?.role === "admin" && (
                      <Button variant="ghost" className="w-full justify-start gap-3 h-10 px-4 text-primary" onClick={() => handleMobileNav("/admin/dashboard")}>
                        <ShieldPlus className="h-4 w-4" /> Admin Dashboard
                      </Button>
                    )}

                    <div className="mt-auto pt-4">
                      <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 px-2">
                    <Button variant="outline" size="lg" onClick={() => handleMobileNav("/auth/login")} className="w-full">
                      Login
                    </Button>
                    <Button size="lg" onClick={() => handleMobileNav("/auth/register")} className="w-full shadow-md">
                      Join Now
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

const DesktopNavLinks = ({ pathname }: { pathname: string }) => (
  <>
    {NAV_ITEMS.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "text-sm font-medium transition-all hover:text-primary relative py-1",
          pathname === item.href ? "text-primary" : "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-1.5">
          {item.label}
          {item.badge && (
            <Badge variant="secondary" className="px-1.5 py-0 text-[9px] h-4 bg-primary/10 text-primary border-none">
              {item.badge}
            </Badge>
          )}
        </span>
        {pathname === item.href && (
          <span className="absolute -bottom-5 left-0 w-full h-[2px] bg-primary rounded-t-full animate-in zoom-in-50 duration-300" />
        )}
      </Link>
    ))}
  </>
);

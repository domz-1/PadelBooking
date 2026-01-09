"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Menu, ShieldPlus, Moon, Sun, ShoppingCart } from "lucide-react";
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

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { brandName, logo } = useBranding();

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth")) return null;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
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
              brandName
            )}
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-primary text-[10px] font-bold">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated &&
              useAuthStore.getState().user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  title="Admin Dashboard"
                >
                  <Button variant="ghost" size="icon" className="text-primary">
                    <ShieldPlus className="h-5 w-5" />
                  </Button>
                </Link>
              )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-primary/10">
                    <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                      {useAuthStore.getState().user?.name?.charAt(0) || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-bookings")}>
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Join Now</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-12">
                <NavLinks />
                <hr className="border-border" />
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link href="/my-bookings" className="text-sm font-medium">My Bookings</Link>
                    <Link href="/orders" className="text-sm font-medium">My Orders</Link>
                    <Button variant="destructive" size="sm" onClick={handleLogout} className="mt-4">
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth/register">Register</Link>
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

const NavLinks = () => (
  <>
    <Link
      href="/"
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      Home
    </Link>
    <Link
      href="/bookings"
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      Schedule
    </Link>
    <Link
      href="/academy"
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
    >
      Academy
    </Link>
    <Link
      href="/store"
      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
    >
      Store
      <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] bg-primary/20 text-primary border-none">NEW</Badge>
    </Link>
  </>
);

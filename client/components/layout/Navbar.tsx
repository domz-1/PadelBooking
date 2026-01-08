"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/hooks/use-auth-store";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Menu, ShieldPlus, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { useBranding } from "@/components/providers/BrandingProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { brandName, logo } = useBranding();

  // Don't show navbar on auth pages
  if (pathname.startsWith("/auth")) return null;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <nav className="border-b bg-card dark:bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
            {isAuthenticated &&
              useAuthStore.getState().user?.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <ShieldPlus className="mr-2 h-4 w-4" />
                </Link>
              )}
          </div>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/my-bookings")}>
                  My Bookings
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
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks />
                {isAuthenticated &&
                  useAuthStore.getState().user?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="text-sm font-medium text-brand-600"
                    >
                      <ShieldPlus className="mr-2 h-4 w-4" />
                    </Link>
                  )}
                {!isAuthenticated && (
                  <>
                    <Link href="/auth/login" className="text-sm font-medium">
                      Login
                    </Link>
                    <Link href="/auth/register" className="text-sm font-medium">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Toaster />
    </nav>
  );
}

const NavLinks = () => (
  <>
    <Link
      href="/"
      className="text-sm font-medium hover:text-brand-600 transition-colors"
    >
      Home
    </Link>
    <Link
      href="/bookings"
      className="text-sm font-medium hover:text-brand-600 transition-colors"
    >
      Schedule
    </Link>
    <Link
      href="/matches"
      className="text-sm font-medium hover:text-brand-600 transition-colors"
    >
      Matches
    </Link>
  </>
);

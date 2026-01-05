import {
  LucideIcon,
  LayoutDashboard,
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  Tag,
  Trophy,
  Megaphone,
  Building,
  Palette,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Branches",
    href: "/admin/branches",
    icon: Building,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "Booking Logs",
    href: "/admin/booking-logs",
    icon: CalendarDays,
  },
  {
    title: "Venues",
    href: "/admin/venues",
    icon: MapPin,
  },
  {
    title: "Store",
    href: "/admin/store",
    icon: ShoppingBag,
  },
  {
    title: "Offers",
    href: "/admin/offers",
    icon: Tag,
  },
  {
    title: "Sponsors",
    href: "/admin/sponsors",
    icon: Megaphone,
  },
  {
    title: "Matches",
    href: "/admin/matches",
    icon: Trophy,
  },
  {
    title: "Sports",
    href: "/admin/sports",
    icon: Trophy,
  },
  {
    title: "Coaches",
    href: "/admin/coaches",
    icon: Megaphone,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Palette,
  },
  {
    title: "Booking Statuses",
    href: "/admin/booking-statuses",
    icon: CalendarDays,
  },
  {
    title: "Branding",
    href: "/admin/settings/branding",
    icon: Palette,
  },
];

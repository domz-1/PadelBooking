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
     title: "Branding",
     href: "/admin/settings/branding",
     icon: Palette,
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
    title: "Booking Logs",
    href: "/admin/booking-logs",
    icon: CalendarDays,
  },
  {
    title: "Booking Statuses",
    href: "/admin/booking-statuses",
    icon: CalendarDays,
  },
  {
    title: "Venues",
    href: "/admin/venues",
    icon: MapPin,
  },

  {
    title: "Sponsors",
    href: "/admin/sponsors",
    icon: Megaphone,
  },
 
  {
    title: "Coaches",
    href: "/admin/coaches",
    icon: Megaphone,
  },
];

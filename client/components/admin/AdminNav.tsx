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
  children?: NavItem[];
}

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Branding",
    href: "/admin/settings/branding",
    icon: Palette,
  },
  {
    title: "Store",
    href: "/admin/store",
    icon: ShoppingBag,
    children: [
      {
        title: "Orders",
        href: "/admin/store?tab=orders",
        icon: ShoppingBag,
      },
      {
        title: "Products",
        href: "/admin/store?tab=products",
        icon: Tag,
      },
      {
        title: "Categories",
        href: "/admin/store?tab=categories",
        icon: Tag,
      }
    ]
  },
  {
    title: "Facilities",
    href: "/admin/branches",
    icon: Building,
    children: [
      {
        title: "Branches",
        href: "/admin/branches",
        icon: Building,
      },
      {
        title: "Venues",
        href: "/admin/venues",
        icon: MapPin,
      },
    ]
  },
  {
    title: "Bookings",
    href: "/admin/booking-logs",
    icon: CalendarDays,
    children: [
      {
        title: "Logs",
        href: "/admin/booking-logs",
        icon: CalendarDays,
      },
      {
        title: "Statuses",
        href: "/admin/booking-statuses",
        icon: Tag,
      }
    ]
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Sponsors",
    href: "/admin/sponsors",
    icon: Megaphone,
  },
  {
    title: "Academy",
    href: "/admin/coaches",
    icon: Trophy,
    children: [
      {
        title: "Coaches",
        href: "/admin/coaches",
        icon: Users,
      },
      {
        title: "Packages",
        href: "/admin/academy-packages",
        icon: Tag,
      },
    ]
  },
];

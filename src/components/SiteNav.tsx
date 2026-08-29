"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Tractor, Truck } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/buyer", label: "Buyer Portal", icon: ShoppingCart },
  { href: "/farmer", label: "Farmer Listing", icon: Tractor },
  { href: "/orders", label: "Orders & Logistics", icon: Truck },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
              isActive
                ? "bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-inset ring-emerald-600/10"
                : "text-soil-600 hover:bg-soil-100 hover:text-soil-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

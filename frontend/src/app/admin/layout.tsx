"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  PanelBottom,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  RotateCcw,
  FileText,
  Truck,
  Upload,
  CreditCard,
} from "lucide-react";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAuthStore } from "@/store/useAuthStore";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Shipping Rates", href: "/admin/shipping", icon: Truck },
  { label: "CSV Imports", href: "/admin/imports", icon: Upload },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Homepage Design", href: "/admin/homepage", icon: ImageIcon },
  { label: "Header Nav", href: "/admin/header", icon: Menu },
  { label: "Footer", href: "/admin/footer", icon: PanelBottom },
  { label: "About Page", href: "/admin/about", icon: Info },
  { label: "Contact Page", href: "/admin/contact", icon: Mail },
  { label: "Size Guide", href: "/admin/size-guide", icon: Ruler },
  { label: "Returns & Exchanges", href: "/admin/returns", icon: RotateCcw },
  { label: "Privacy Policy", href: "/admin/privacy", icon: ShieldCheck },
  { label: "Terms of Service", href: "/admin/terms", icon: FileText },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (pathname === "/admin/login") return <>{children}</>;

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-[#0A2540] p-6 text-white">
        <p className="mb-8 font-serif text-lg">EcoSmok Admin</p>
        <nav className="flex-1 space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/10 hover:text-white ${
                pathname === item.href ? "bg-white/10 text-white" : "text-white/80"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/10 pt-4">
          {user && <p className="truncate text-xs text-white/50">{user.email}</p>}
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white/90"
          >
            <Home className="h-3.5 w-3.5" /> Back to storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white/90"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}

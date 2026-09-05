"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export interface HeaderNavLink {
  label: string;
  href: string;
  children?: HeaderNavLink[];
}

const DEFAULT_NAV_LINKS: HeaderNavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/collections/all" },
  { label: "Disposable Vapes", href: "/collections/disposable-vapes" },
  { label: "E-Liquids", href: "/collections/e-liquids" },
  { label: "Pod Kits", href: "/collections/pod-kits" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Rewards", href: "/account" },
  { label: "Track Order", href: "/track-order" },
];

export default function Header({ navLinks = DEFAULT_NAV_LINKS }: { navLinks?: HeaderNavLink[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = 0; // wire up to a wishlist store when that module is built
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-[#0A2540]" />
        </button>

        <Link href="/" className="font-serif text-xl tracking-wide text-[#0A2540]">
          ECOSMOK
        </Link>

        <nav className="hidden gap-7 lg:flex">
          {navLinks.map((link) => (
            <div key={link.href} className="group relative">
              <Link
                href={link.href}
                className="text-sm text-neutral-700 transition-colors hover:text-[#0A2540]"
              >
                {link.label}
              </Link>
              {link.children?.length ? (
                <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-64 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 opacity-0 shadow-xl transition-all group-hover:visible group-hover:mt-3 group-hover:opacity-100">
                  {link.children.map((child) => (
                    <Link key={child.href} href={child.href} className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#0A2540]">
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button onClick={() => setIsSearchOpen((o) => !o)} aria-label="Search">
            <Search className="h-5 w-5 text-[#0A2540]" />
          </button>

          <Link href="/wishlist" className="relative" aria-label="Wishlist">
            <Heart className="h-5 w-5 text-[#0A2540]" />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C5DC3B] text-[10px] font-semibold text-[#0A2540]">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href={user ? "/account" : "/account/login"}
            aria-label={user ? "My account" : "Log in"}
            className="hidden items-center gap-1.5 sm:flex"
          >
            <User className="h-5 w-5 text-[#0A2540]" />
            {user && <span className="text-sm text-neutral-700">{user.name.split(" ")[0]}</span>}
          </Link>

          <button onClick={openCart} className="relative" aria-label="Open cart">
            <ShoppingBag className="h-5 w-5 text-[#0A2540]" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#0A2540] text-[10px] font-semibold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable search bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-neutral-100"
          >
            <form
              action="/collections/all"
              className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3"
            >
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vapes, e-liquids, flavours…"
                className="flex-1 bg-transparent text-sm outline-none"
                autoFocus
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white p-6 shadow-xl lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-serif text-lg text-[#0A2540]">Menu</span>
                <button onClick={() => setIsDrawerOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-sm text-neutral-700 hover:text-[#0A2540]"
                    >
                      {link.label}
                    </Link>
                    {link.children?.map((child) => (
                      <Link key={child.href} href={child.href} onClick={() => setIsDrawerOpen(false)} className="ml-4 mt-2 block text-xs text-neutral-500">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

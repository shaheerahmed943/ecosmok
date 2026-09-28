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

export interface HeaderMegaMenuColumn {
  title: string;
  links: HeaderNavLink[];
}

const DEFAULT_NAV_LINKS: HeaderNavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/collections/all" },
  { label: "Prefilled Kits", href: "/collections/disposable-vape-alternatives" },
  { label: "E-Liquids", href: "/collections/e-liquids" },
  { label: "Vaping Kits", href: "/collections/vaping-kits" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Rewards", href: "/account" },
  { label: "Track Order", href: "/track-order" },
];

const DEFAULT_MEGA_MENU: HeaderMegaMenuColumn[] = [
  {
    title: "Shop by Brand",
    links: ["Elfliq by Elf Bar", "Bar Juice 5000", "Elux Liquid", "SKE Crystal", "Hayati", "IVG", "Lost Mary", "Hangsen", "A-Steam", "Nasty Juice"].map((label) => ({ label, href: `/collections/all?search=${encodeURIComponent(label)}` })),
  },
  {
    title: "Shop By Bestsellers",
    links: ["Elux Legend", "Hayati", "Elfliq", "IVG Salt", "Bar Juice 5000", "SKE Crystal", "Fruity Vapes", "Nasty Salt"].map((label) => ({ label, href: `/collections/all?search=${encodeURIComponent(label)}` })),
  },
  {
    title: "Shop By Flavour",
    links: ["Blueberry", "Grape", "Gummy Bear", "Lemon & Lime", "Lemonade", "Mango", "Menthol", "Pineapple", "Strawberry", "Watermelon"].map((label) => ({ label, href: `/collections/all?search=${encodeURIComponent(label)}` })),
  },
  {
    title: "Shop By Offers",
    links: [
      { label: "Bundle Deal: 3 Free", href: "/pages/vape-deals" },
      { label: "Best Sellers", href: "/collections/all?sortBy=best_selling" },
    ],
  },
];

export default function Header({ navLinks = DEFAULT_NAV_LINKS, megaMenu = DEFAULT_MEGA_MENU }: { navLinks?: HeaderNavLink[]; megaMenu?: HeaderMegaMenuColumn[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const visibleMegaMenu = megaMenu.length ? megaMenu : DEFAULT_MEGA_MENU;

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
              {link.label.toLowerCase() === "shop" ? (
                <div className="invisible absolute left-1/2 top-full z-50 w-screen -translate-x-[35%] border-t border-neutral-100 bg-white opacity-0 shadow-[0_16px_35px_rgba(10,37,64,0.12)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8 px-4 py-7">
                    {visibleMegaMenu.map((column) => (
                      <div key={column.title}>
                        <h3 className="border-b border-neutral-200 pb-3 text-sm font-semibold text-[#111]">
                          {column.title}
                        </h3>
                        <div className="mt-4 space-y-3">
                          {column.links.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block text-sm text-neutral-500 transition-colors hover:text-[#0A2540]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : link.children?.length ? (
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
                    {link.label.toLowerCase() === "shop" && (
                      <div className="mt-4 space-y-5 border-t border-neutral-100 pt-4">
                        {visibleMegaMenu.map((column) => (
                          <div key={column.title}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#0A2540]">
                              {column.title}
                            </p>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                              {column.links.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setIsDrawerOpen(false)}
                                  className="text-xs text-neutral-500 hover:text-[#0A2540]"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

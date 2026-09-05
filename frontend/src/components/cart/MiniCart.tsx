"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function MiniCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } =
    useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeCart}
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-neutral-200 p-5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-[#0A2540]">
                <ShoppingBag className="h-5 w-5" /> Your Bag ({itemCount()})
              </h2>
              <button onClick={closeCart} aria-label="Close cart">
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500">
                  <ShoppingBag className="mb-3 h-10 w-10 text-neutral-300" />
                  <p>Your bag is empty.</p>
                  <Link
                    href="/collections/all"
                    onClick={closeCart}
                    className="mt-4 text-sm font-medium text-[#0A2540] underline"
                  >
                    Continue shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4">
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F5F2EC]">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#0A2540]">{item.title}</p>
                          <p className="text-xs text-neutral-500">
                            {item.color} · {item.size}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center rounded-md border border-neutral-300">
                            <button
                              onClick={() =>
                                updateQuantity(item.variantId, item.quantity - 1)
                              }
                              className="p-1.5 text-neutral-600"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.variantId, item.quantity + 1)
                              }
                              className="p-1.5 text-neutral-600"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="text-sm font-semibold text-[#0A2540]">
                            Rs. {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label="Remove item"
                        className="self-start text-neutral-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-neutral-200 p-5">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold text-[#0A2540]">
                    Rs. {subtotal().toLocaleString()}
                  </span>
                </div>
                <p className="mb-4 text-xs text-neutral-500">
                  Shipping and any applicable discounts are calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full rounded-lg bg-[#0A2540] py-3.5 text-center font-medium text-white transition-transform hover:scale-[1.01]"
                >
                  Proceed to Checkout
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Ruler, ShieldCheck, Star, ZoomIn } from "lucide-react";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  fabricOption: string | null;
  variantPrice: number;
  stockQuantity: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  imageUrls: string[];
}

export interface ProductDetailProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  fabricDetails: string | null;
  careInstructions: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
}

export default function ProductDetail(product: ProductDetailProps) {
  const sizes = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.size))),
    [product.variants],
  );
  const colors = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color))),
    [product.variants],
  );

  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isCareOpen, setIsCareOpen] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [liveAvailability, setLiveAvailability] = useState<{
    available: boolean;
    stockQuantity: number;
    price: number | null;
  } | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  const activeVariant = useMemo(
    () =>
      product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor,
      ) ?? null,
    [product.variants, selectedSize, selectedColor],
  );

  const displayPrice = liveAvailability?.price ?? activeVariant?.variantPrice ?? 0;
  const displayStock = liveAvailability?.stockQuantity ?? activeVariant?.stockQuantity ?? 0;

  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : null;

  /** Re-fetch live stock/price whenever the variant selection changes. */
  async function refreshAvailability(variantId: string) {
    setIsCheckingStock(true);
    try {
      const availability = await api.getVariantAvailability(variantId);
      setLiveAvailability(availability as typeof liveAvailability);
    } catch {
      // Non-fatal: fall back to the last-known variant data already shown.
    } finally {
      setIsCheckingStock(false);
    }
  }

  function handleSizeChange(size: string) {
    setSelectedSize(size);
    const match = product.variants.find((v) => v.size === size && v.color === selectedColor);
    if (match) refreshAvailability(match.id);
  }

  function handleColorChange(color: string) {
    setSelectedColor(color);
    const match = product.variants.find((v) => v.size === selectedSize && v.color === color);
    if (match) refreshAvailability(match.id);
  }

  function handleAddToCart() {
    if (!activeVariant || displayStock <= 0) return;
    addItem({
      productId: product.id,
      variantId: activeVariant.id,
      title: product.title,
      slug: product.slug,
      imageUrl: product.images[0]?.url ?? "/placeholder-product.jpg",
      size: activeVariant.size,
      color: activeVariant.color,
      unitPrice: displayPrice,
      quantity,
      stockQuantity: displayStock,
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-16">
      {/* --------------------------------------------------------------- */}
      {/* Image Gallery                                                    */}
      {/* --------------------------------------------------------------- */}
      <div>
        <div
          className="group relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#F5F2EC]"
          onClick={() => setIsZoomed(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImageIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative h-full w-full"
            >
              <Image
                src={product.images[activeImageIdx]?.url ?? "/placeholder-product.jpg"}
                alt={product.images[activeImageIdx]?.altText ?? product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-4 right-4 rounded-full bg-white/90 p-2 shadow-md">
            <ZoomIn className="h-4 w-4 text-[#0A2540]" />
          </div>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto">
          {product.images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveImageIdx(idx)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                idx === activeImageIdx ? "border-[#0A2540]" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Details & Purchase Panel                                         */}
      {/* --------------------------------------------------------------- */}
      <div>
        <h1 className="font-serif text-3xl text-[#0A2540]">{product.title}</h1>

        {averageRating && (
          <div className="mt-2 flex items-center gap-1 text-sm text-neutral-600">
            <Star className="h-4 w-4 fill-[#C5DC3B] text-[#C5DC3B]" />
            {averageRating.toFixed(1)} · {product.reviews.length} reviews
          </div>
        )}

        <p className="mt-4 text-2xl font-semibold text-[#0A2540]">
          Rs. {displayPrice.toLocaleString()}
          {isCheckingStock && <span className="ml-2 text-sm text-neutral-400">updating…</span>}
        </p>

        <p className="mt-4 leading-relaxed text-neutral-700">{product.description}</p>

        {/* Color selector */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-neutral-800">Color: {selectedColor}</p>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  color === selectedColor
                    ? "border-[#0A2540] bg-[#0A2540] text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-[#0A2540]"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Size selector */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-800">Size: {selectedSize}</p>
            <button className="flex items-center gap-1 text-xs text-neutral-500 underline">
              <Ruler className="h-3 w-3" /> Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = product.variants.find(
                (v) => v.size === size && v.color === selectedColor,
              );
              const outOfStock = !variant || variant.stockQuantity === 0;
              return (
                <button
                  key={size}
                  disabled={outOfStock}
                  onClick={() => handleSizeChange(size)}
                  className={`min-w-[3rem] rounded-lg border px-3 py-2 text-sm transition-colors ${
                    size === selectedSize
                      ? "border-[#0A2540] bg-[#0A2540] text-white"
                      : outOfStock
                        ? "cursor-not-allowed border-neutral-200 text-neutral-300 line-through"
                        : "border-neutral-300 text-neutral-700 hover:border-[#0A2540]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity + Add to Cart */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex items-center rounded-lg border border-neutral-300">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-3 text-neutral-600 hover:text-[#0A2540]"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(displayStock, q + 1))}
              className="p-3 text-neutral-600 hover:text-[#0A2540]"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={displayStock <= 0}
            className="flex-1 rounded-lg bg-[#0A2540] py-3.5 font-medium text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {displayStock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>

        {displayStock > 0 && displayStock <= 5 && (
          <p className="mt-2 text-xs text-red-600">Only {displayStock} left in this size/color.</p>
        )}

        {/* Care instructions accordion */}
        {product.careInstructions && (
          <div className="mt-8 border-t border-neutral-200 pt-4">
            <button
              onClick={() => setIsCareOpen((o) => !o)}
              className="flex w-full items-center justify-between text-left font-medium text-[#0A2540]"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Care Instructions
              </span>
              <span>{isCareOpen ? "−" : "+"}</span>
            </button>
            <AnimatePresence>
              {isCareOpen && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden pt-3 text-sm text-neutral-600"
                >
                  {product.careInstructions}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {product.fabricDetails && (
          <div className="mt-3 border-t border-neutral-200 pt-4 text-sm text-neutral-600">
            <strong className="text-[#0A2540]">Fabric:</strong> {product.fabricDetails}
          </div>
        )}
      </div>

      {/* Fullscreen zoom overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative h-[85vh] w-[85vw] max-w-3xl">
              <Image
                src={product.images[activeImageIdx]?.url ?? "/placeholder-product.jpg"}
                alt={product.title}
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

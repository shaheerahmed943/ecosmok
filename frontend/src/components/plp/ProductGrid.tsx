"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export interface PLPProduct {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  images: { url: string; altText: string | null }[];
  variants: {
    id: string;
    size: string;
    color: string;
    variantPrice: number;
    stockQuantity: number;
  }[];
}

export default function ProductGrid({ products }: { products: PLPProduct[] }) {
  const addItem = useCartStore((s) => s.addItem);

  function quickAdd(product: PLPProduct) {
    const variant = product.variants.find((v) => v.stockQuantity > 0);
    if (!variant) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      slug: product.slug,
      imageUrl: product.images[0]?.url ?? "/placeholder-product.jpg",
      size: variant.size,
      color: variant.color,
      unitPrice: variant.variantPrice,
      quantity: 1,
      stockQuantity: variant.stockQuantity,
    });
  }

  if (products.length === 0) {
    return <p className="py-16 text-center text-neutral-500">No products match these filters.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const inStock = product.variants.some((v) => v.stockQuantity > 0);
        return (
          <div key={product.id} className="group">
            <Link href={`/products/${product.slug}`}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#F5F2EC]">
                <Image
                  src={product.images[0]?.url ?? "/placeholder-product.jpg"}
                  alt={product.images[0]?.altText ?? product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
            <div className="mt-3 flex items-start justify-between gap-2">
              <div>
                <Link href={`/products/${product.slug}`}>
                  <p className="line-clamp-2 text-sm font-medium text-[#0A2540]">{product.title}</p>
                </Link>
                <p className="mt-1 text-sm text-neutral-600">
                  Rs. {product.basePrice.toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => quickAdd(product)}
              disabled={!inStock}
              className="mt-2 w-full rounded-md border border-[#0A2540] py-2 text-xs font-medium text-[#0A2540] transition-colors hover:bg-[#0A2540] hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300"
            >
              {inStock ? "Quick Add" : "Out of Stock"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

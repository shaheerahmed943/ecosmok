"use client";

import Image from "next/image";
import Link from "next/link";
import { PLPProduct } from "@/components/plp/ProductGrid";

export default function NewArrivalsSlider({ products }: { products: PLPProduct[] }) {
  if (!products.length) return null;

  return (
    <section className="bg-[#F5F2EC] py-14">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 font-serif text-2xl text-[#0A2540]">New Arrivals</h2>
        <div className="flex gap-5 overflow-x-auto pb-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group w-48 shrink-0"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white">
                <Image
                  src={product.images[0]?.url ?? "/placeholder-product.jpg"}
                  alt={product.images[0]?.altText ?? product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-[#0A2540]">
                {product.title}
              </p>
              <p className="text-sm text-neutral-600">Rs. {product.basePrice.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

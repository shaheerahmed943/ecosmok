"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PLPProduct } from "@/components/plp/ProductGrid";

export interface HomepageWidgetCard {
  heading: string;
  imageUrl: string;
  link: string;
}

export interface HomepageWidgetTab {
  label: string;
  type: "cards" | "collection";
  collectionSlug?: string;
  cards?: HomepageWidgetCard[];
  products?: PLPProduct[];
}

export interface HomepageWidgetData {
  id: string;
  title: string;
  tabs: HomepageWidgetTab[];
}

function ProductCard({ product }: { product: PLPProduct }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block min-w-[230px] flex-1">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#F5F2EC]">
        <Image
          src={product.images[0]?.url ?? "/placeholder-product.jpg"}
          alt={product.images[0]?.altText ?? product.title}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-[#111]">{product.title}</p>
      <p className="mt-1 text-sm text-neutral-600">Rs. {product.basePrice.toLocaleString()}</p>
    </Link>
  );
}

function TabContent({ tab }: { tab: HomepageWidgetTab }) {
  const items = tab.type === "cards" ? tab.cards ?? [] : tab.products ?? [];
  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tab.type === "cards"
          ? (tab.cards ?? []).map((card, index) => (
              <Link
                key={`${card.heading}-${index}`}
                href={card.link || "/collections/all"}
                className="group relative min-w-[220px] flex-1 overflow-hidden rounded-xl bg-[#F2F2F2] sm:min-w-[260px]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={card.imageUrl || "/placeholder-product.jpg"}
                    alt={card.heading}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="absolute left-5 top-5 text-xl font-bold uppercase text-[#111]">
                  {card.heading}
                </span>
              </Link>
            ))
          : (tab.products ?? []).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {items.length > 4 && (
        <>
          <button
            type="button"
            aria-label="Previous items"
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 shadow-md md:block"
            onClick={(event) => {
              const track = event.currentTarget.parentElement?.querySelector(".overflow-x-auto");
              track?.scrollBy({ left: -320, behavior: "smooth" });
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next items"
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white p-2 shadow-md md:block"
            onClick={(event) => {
              const track = event.currentTarget.parentElement?.querySelector(".overflow-x-auto");
              track?.scrollBy({ left: 320, behavior: "smooth" });
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

export default function HomepageWidgets({ widgets }: { widgets: HomepageWidgetData[] }) {
  return (
    <div>
      {widgets.map((widget) => (
        <HomepageWidget key={widget.id} widget={widget} />
      ))}
    </div>
  );
}

function HomepageWidget({ widget }: { widget: HomepageWidgetData }) {
  const [activeTab, setActiveTab] = useState(0);
  const tab = widget.tabs[activeTab] ?? widget.tabs[0];
  if (!tab) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-[#111]">{widget.title}</h2>
      <div className="mb-7 flex gap-8 border-b border-neutral-200">
        {widget.tabs.map((item, index) => (
          <button
            key={`${item.label}-${index}`}
            type="button"
            onClick={() => setActiveTab(index)}
            className={`border-b-2 pb-4 text-lg transition-colors ${
              index === activeTab
                ? "border-[#111] font-semibold text-[#111]"
                : "border-transparent text-neutral-500 hover:text-[#111]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <TabContent tab={tab} />
    </section>
  );
}

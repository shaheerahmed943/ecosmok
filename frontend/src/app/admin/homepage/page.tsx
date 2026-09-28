"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface HeroSlide {
  imageUrl: string;
  heading: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface FabricTile {
  name: string;
  imageUrl: string;
  link: string;
}

interface HomepageWidgetCard {
  heading: string;
  imageUrl: string;
  link: string;
}

interface HomepageWidgetTab {
  label: string;
  type: "cards" | "collection";
  collectionSlug?: string;
  cards?: HomepageWidgetCard[];
}

interface HomepageWidget {
  id: string;
  title: string;
  tabs: HomepageWidgetTab[];
}

interface HomepageContent {
  heroSlides: HeroSlide[];
  fabricTiles: FabricTile[];
  homeWidgets?: HomepageWidget[];
  promoBanner?: { text: string; link?: string; isActive: boolean };
  featuredCollectionTitle?: string;
  featuredCollectionSlug?: string;
}

interface CategoryOption {
  name: string;
  slug: string;
  isActive: boolean;
}

export default function AdminHomepagePage() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .adminGetHomepageContent()
      .then((data) => {
        const loaded = data as HomepageContent;
        setContent({
          ...loaded,
          homeWidgets: loaded.homeWidgets?.length ? loaded.homeWidgets : [{
            id: "homepage-widget-1",
            title: "Shop by Category",
            tabs: [
              {
                label: "Categories",
                type: "cards",
                cards: loaded.fabricTiles.map((tile) => ({ heading: tile.name, imageUrl: tile.imageUrl, link: tile.link })),
              },
              { label: "Best Seller", type: "collection", collectionSlug: "all" },
              { label: "New", type: "collection", collectionSlug: "all" },
            ],
          }],
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
    api.adminGetCategories()
      .then((data) => setCategories(data as CategoryOption[]))
      .catch(() => setCategories([]));
  }, []);

  function updateSlide(idx: number, field: keyof HeroSlide, value: string) {
    setContent((c) =>
      c
        ? {
            ...c,
            heroSlides: c.heroSlides.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
          }
        : c,
    );
  }

  function updateTile(idx: number, field: keyof FabricTile, value: string) {
    setContent((c) =>
      c
        ? {
            ...c,
            fabricTiles: c.fabricTiles.map((t, i) => (i === idx ? { ...t, [field]: value } : t)),
          }
        : c,
    );
  }

  function updateWidget(widgetIdx: number, field: "title", value: string) {
    setContent((c) => c ? {
      ...c,
      homeWidgets: (c.homeWidgets ?? []).map((widget, index) => index === widgetIdx ? { ...widget, [field]: value } : widget),
    } : c);
  }

  function updateWidgetTab(widgetIdx: number, tabIdx: number, field: keyof HomepageWidgetTab, value: string) {
    setContent((c) => c ? {
      ...c,
      homeWidgets: (c.homeWidgets ?? []).map((widget, index) => index !== widgetIdx ? widget : {
        ...widget,
        tabs: widget.tabs.map((tab, tabIndex) => tabIndex === tabIdx ? { ...tab, [field]: value } : tab),
      }),
    } : c);
  }

  function updateWidgetCard(widgetIdx: number, tabIdx: number, cardIdx: number, field: keyof HomepageWidgetCard, value: string) {
    setContent((c) => c ? {
      ...c,
      homeWidgets: (c.homeWidgets ?? []).map((widget, index) => index !== widgetIdx ? widget : {
        ...widget,
        tabs: widget.tabs.map((tab, tabIndex) => tabIndex !== tabIdx ? tab : {
          ...tab,
          cards: (tab.cards ?? []).map((card, index) => index === cardIdx ? { ...card, [field]: value } : card),
        }),
      }),
    } : c);
  }

  async function handleSave() {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.adminUpdateHomepageContent(content);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !content) {
    return <p className="text-sm text-neutral-500">Loading…</p>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Homepage Design</h1>

      {/* Hero slides */}
      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Hero Banner Slider</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Full-width slides shown at the top of the homepage.
        </p>

        <div className="space-y-6">
          {content.heroSlides.map((slide, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Slide {idx + 1}</span>
                {content.heroSlides.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setContent((c) =>
                        c ? { ...c, heroSlides: c.heroSlides.filter((_, i) => i !== idx) } : c,
                      )
                    }
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <ImageUploadField
                  url={slide.imageUrl}
                  onChange={(url) => updateSlide(idx, "imageUrl", url)}
                />
                <input
                  placeholder="Heading"
                  value={slide.heading}
                  onChange={(e) => updateSlide(idx, "heading", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
                />
                <input
                  placeholder="Subheading"
                  value={slide.subheading ?? ""}
                  onChange={(e) => updateSlide(idx, "subheading", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Button text (e.g. Shop Now)"
                    value={slide.ctaText ?? ""}
                    onChange={(e) => updateSlide(idx, "ctaText", e.target.value)}
                    className="rounded-lg border border-neutral-300 p-2.5 text-sm"
                  />
                  <input
                    placeholder="Button link (e.g. /collections/all)"
                    value={slide.ctaLink ?? ""}
                    onChange={(e) => updateSlide(idx, "ctaLink", e.target.value)}
                    className="rounded-lg border border-neutral-300 p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setContent((c) =>
              c
                ? {
                    ...c,
                    heroSlides: [
                      ...c.heroSlides,
                      { imageUrl: "", heading: "", subheading: "", ctaText: "", ctaLink: "" },
                    ],
                  }
                : c,
            )
          }
          className="mt-4 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add slide
        </button>
      </section>

      {/* Reusable homepage widgets */}
      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Homepage Tab Widgets</h2>
        <p className="mb-5 text-xs text-neutral-500">
          Add as many widgets as needed. Each widget has custom cards, best sellers, and new/collection tabs.
        </p>

        <div className="space-y-8">
          {(content.homeWidgets ?? []).map((widget, widgetIdx) => (
            <div key={widget.id} className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-4 flex items-center gap-3">
                <input
                  value={widget.title}
                  onChange={(e) => updateWidget(widgetIdx, "title", e.target.value)}
                  placeholder="Widget heading"
                  className="flex-1 rounded-lg border border-neutral-300 p-2.5 text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setContent((c) => c ? { ...c, homeWidgets: (c.homeWidgets ?? []).filter((_, i) => i !== widgetIdx) } : c)}
                  className="text-neutral-400 hover:text-red-500"
                  aria-label="Remove widget"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                {widget.tabs.slice(0, 3).map((tab, tabIdx) => (
                  <div key={tabIdx} className="rounded-lg bg-neutral-50 p-4">
                    <div className="mb-3 grid gap-3 sm:grid-cols-2">
                      <input
                        value={tab.label}
                        onChange={(e) => updateWidgetTab(widgetIdx, tabIdx, "label", e.target.value)}
                        placeholder="Tab label"
                        className="rounded-lg border border-neutral-300 p-2 text-sm"
                      />
                      {tab.type === "collection" && (
                        <input
                          value={tab.collectionSlug ?? "all"}
                          onChange={(e) => updateWidgetTab(widgetIdx, tabIdx, "collectionSlug", e.target.value)}
                          placeholder="Collection slug e.g. vaping-kits"
                          className="rounded-lg border border-neutral-300 p-2 text-sm"
                        />
                      )}
                    </div>

                    {tab.type === "cards" && (
                      <div className="space-y-3">
                        {(tab.cards ?? []).map((card, cardIdx) => (
                          <div key={cardIdx} className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3">
                            <div className="flex-1 space-y-2">
                              <ImageUploadField url={card.imageUrl} onChange={(url) => updateWidgetCard(widgetIdx, tabIdx, cardIdx, "imageUrl", url)} />
                              <input
                                value={card.heading}
                                onChange={(e) => updateWidgetCard(widgetIdx, tabIdx, cardIdx, "heading", e.target.value)}
                                placeholder="Card heading"
                                className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                              />
                              <input
                                value={card.link}
                                onChange={(e) => updateWidgetCard(widgetIdx, tabIdx, cardIdx, "link", e.target.value)}
                                placeholder="Card link e.g. /collections/all?search=Hayati"
                                className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setContent((c) => c ? { ...c, homeWidgets: (c.homeWidgets ?? []).map((item, i) => i !== widgetIdx ? item : { ...item, tabs: item.tabs.map((currentTab, j) => j !== tabIdx ? currentTab : { ...currentTab, cards: (currentTab.cards ?? []).filter((_, k) => k !== cardIdx) }) }) } : c)}
                              className="text-neutral-400 hover:text-red-500"
                              aria-label="Remove card"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setContent((c) => c ? { ...c, homeWidgets: (c.homeWidgets ?? []).map((item, i) => i !== widgetIdx ? item : { ...item, tabs: item.tabs.map((currentTab, j) => j !== tabIdx ? currentTab : { ...currentTab, cards: [...(currentTab.cards ?? []), { heading: "", imageUrl: "", link: "" }] }) }) } : c)}
                          className="flex items-center gap-1 text-sm text-[#0A2540] underline"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add card
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setContent((c) => c ? { ...c, homeWidgets: [...(c.homeWidgets ?? []), { id: `homepage-widget-${Date.now()}`, title: "New Widget", tabs: [{ label: "Categories", type: "cards", cards: [] }, { label: "Best Seller", type: "collection", collectionSlug: "all" }, { label: "New", type: "collection", collectionSlug: "all" }] }] } : c)}
          className="mt-5 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add widget
        </button>
      </section>

      {/* Promo banner + featured collection title */}
      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Promo Banner & Section Titles</h2>
        <div className="space-y-3">
          <input
            placeholder="Featured collection section title"
            value={content.featuredCollectionTitle ?? ""}
            onChange={(e) => setContent((c) => (c ? { ...c, featuredCollectionTitle: e.target.value } : c))}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <select
            value={content.featuredCollectionSlug ?? "vaping-kits"}
            onChange={(e) => setContent((c) => (c ? { ...c, featuredCollectionSlug: e.target.value } : c))}
            className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-sm"
          >
            <option value="">All products</option>
            {categories.filter((category) => category.isActive).map((category) => (
              <option key={category.slug} value={category.slug}>{category.name}</option>
            ))}
          </select>
          <input
            placeholder="Promo banner text (e.g. Free shipping above Rs. 8,000)"
            value={content.promoBanner?.text ?? ""}
            onChange={(e) =>
              setContent((c) =>
                c
                  ? {
                      ...c,
                      promoBanner: {
                        text: e.target.value,
                        isActive: c.promoBanner?.isActive ?? true,
                        link: c.promoBanner?.link,
                      },
                    }
                  : c,
              )
            }
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={content.promoBanner?.isActive ?? false}
              onChange={(e) =>
                setContent((c) =>
                  c
                    ? {
                        ...c,
                        promoBanner: {
                          text: c.promoBanner?.text ?? "",
                          isActive: e.target.checked,
                          link: c.promoBanner?.link,
                        },
                      }
                    : c,
                )
              }
            />
            Show promo banner
          </label>
        </div>
      </section>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-600">Saved! Changes are live.</p>}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 rounded-lg bg-[#0A2540] px-8 py-3.5 font-medium text-white disabled:bg-neutral-300"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Homepage
      </button>
    </div>
  );
}

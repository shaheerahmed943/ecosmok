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

interface HomepageContent {
  heroSlides: HeroSlide[];
  fabricTiles: FabricTile[];
  promoBanner?: { text: string; link?: string; isActive: boolean };
  featuredCollectionTitle?: string;
}

export default function AdminHomepagePage() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .adminGetHomepageContent()
      .then((data) => setContent(data as HomepageContent))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
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

      {/* Fabric tiles */}
      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Fabric Filter Tiles</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Clickable tiles (e.g. Lawn, Chiffon, Organza) shown below the hero.
        </p>

        <div className="space-y-4">
          {content.fabricTiles.map((tile, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3">
              <div className="flex-1 space-y-2">
                <ImageUploadField url={tile.imageUrl} onChange={(url) => updateTile(idx, "imageUrl", url)} />
                <input
                  placeholder="Tile name (e.g. Lawn)"
                  value={tile.name}
                  onChange={(e) => updateTile(idx, "name", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                />
                <input
                  placeholder="Link (e.g. /collections/all?fabric=Lawn)"
                  value={tile.link}
                  onChange={(e) => updateTile(idx, "link", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setContent((c) =>
                    c ? { ...c, fabricTiles: c.fabricTiles.filter((_, i) => i !== idx) } : c,
                  )
                }
                className="text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setContent((c) =>
              c ? { ...c, fabricTiles: [...c.fabricTiles, { name: "", imageUrl: "", link: "" }] } : c,
            )
          }
          className="mt-4 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add tile
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

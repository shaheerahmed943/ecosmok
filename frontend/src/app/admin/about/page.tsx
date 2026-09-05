"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface AboutValue {
  title: string;
  description: string;
}

interface AboutContent {
  heroImageUrl: string;
  heroSubheading: string;
  heading: string;
  paragraphs: string[];
  storyImageUrl: string;
  values: AboutValue[];
  galleryImages: string[];
}

export default function AdminAboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .adminGetAboutContent()
      .then((data) => setContent(data as AboutContent))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
  }, []);

  function updateParagraph(idx: number, value: string) {
    setContent((c) =>
      c ? { ...c, paragraphs: c.paragraphs.map((p, i) => (i === idx ? value : p)) } : c,
    );
  }

  function updateValue(idx: number, field: keyof AboutValue, value: string) {
    setContent((c) =>
      c ? { ...c, values: c.values.map((v, i) => (i === idx ? { ...v, [field]: value } : v)) } : c,
    );
  }

  function updateGalleryImage(idx: number, value: string) {
    setContent((c) =>
      c ? { ...c, galleryImages: c.galleryImages.map((g, i) => (i === idx ? value : g)) } : c,
    );
  }

  async function handleSave() {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.adminUpdateAboutContent(content);
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
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">About Page</h1>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Hero Section</h2>
        <div className="space-y-3">
          <ImageUploadField
            url={content.heroImageUrl}
            onChange={(url) => setContent((c) => (c ? { ...c, heroImageUrl: url } : c))}
          />
          <input
            placeholder="Heading"
            value={content.heading}
            onChange={(e) => setContent((c) => (c ? { ...c, heading: e.target.value } : c))}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <input
            placeholder="Hero subheading"
            value={content.heroSubheading}
            onChange={(e) => setContent((c) => (c ? { ...c, heroSubheading: e.target.value } : c))}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Our Story</h2>
        <div className="space-y-3">
          <ImageUploadField
            url={content.storyImageUrl}
            onChange={(url) => setContent((c) => (c ? { ...c, storyImageUrl: url } : c))}
          />

          {content.paragraphs.map((paragraph, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <textarea
                placeholder={`Paragraph ${idx + 1}`}
                value={paragraph}
                onChange={(e) => updateParagraph(idx, e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
              />
              {content.paragraphs.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setContent((c) =>
                      c ? { ...c, paragraphs: c.paragraphs.filter((_, i) => i !== idx) } : c,
                    )
                  }
                  className="mt-2 text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setContent((c) => (c ? { ...c, paragraphs: [...c.paragraphs, ""] } : c))
            }
            className="flex items-center gap-1 text-sm text-[#0A2540] underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add paragraph
          </button>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Values ("What Sets Us Apart")</h2>
        <p className="mb-4 text-xs text-neutral-500">The 4-card feature grid shown below the story section.</p>
        <div className="space-y-3">
          {content.values.map((value, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
              <div className="flex-1 space-y-2">
                <input
                  placeholder="Title (e.g. Handpicked Fabrics)"
                  value={value.title}
                  onChange={(e) => updateValue(idx, "title", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                />
                <textarea
                  placeholder="Description"
                  value={value.description}
                  onChange={(e) => updateValue(idx, "description", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setContent((c) => (c ? { ...c, values: c.values.filter((_, i) => i !== idx) } : c))
                }
                className="text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setContent((c) =>
                c ? { ...c, values: [...c.values, { title: "", description: "" }] } : c,
              )
            }
            className="flex items-center gap-1 text-sm text-[#0A2540] underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add value
          </button>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Gallery ("From the Atelier")</h2>
        <p className="mb-4 text-xs text-neutral-500">A small image grid shown at the bottom of the page.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {content.galleryImages.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3">
              <div className="flex-1">
                <ImageUploadField url={url} onChange={(v) => updateGalleryImage(idx, v)} />
              </div>
              <button
                type="button"
                onClick={() =>
                  setContent((c) =>
                    c ? { ...c, galleryImages: c.galleryImages.filter((_, i) => i !== idx) } : c,
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
            setContent((c) => (c ? { ...c, galleryImages: [...c.galleryImages, ""] } : c))
          }
          className="mt-4 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add image
        </button>
      </section>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-600">Saved! Changes are live.</p>}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 rounded-lg bg-[#0A2540] px-8 py-3.5 font-medium text-white disabled:bg-neutral-300"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save About Page
      </button>
    </div>
  );
}

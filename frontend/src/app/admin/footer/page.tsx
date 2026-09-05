"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterContent {
  tagline: string;
  phone: string;
  email: string;
  address: string;
  instagramUrl?: string;
  facebookUrl?: string;
  columns: FooterColumn[];
  copyrightText: string;
}

export default function AdminFooterPage() {
  const [content, setContent] = useState<FooterContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .adminGetFooterContent()
      .then((data) => setContent(data as FooterContent))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
  }, []);

  function update(field: keyof FooterContent, value: string) {
    setContent((c) => (c ? { ...c, [field]: value } : c));
  }

  function updateColumnTitle(colIdx: number, value: string) {
    setContent((c) =>
      c ? { ...c, columns: c.columns.map((col, i) => (i === colIdx ? { ...col, title: value } : col)) } : c,
    );
  }

  function updateLink(colIdx: number, linkIdx: number, field: keyof FooterLink, value: string) {
    setContent((c) =>
      c
        ? {
            ...c,
            columns: c.columns.map((col, i) =>
              i === colIdx
                ? { ...col, links: col.links.map((l, j) => (j === linkIdx ? { ...l, [field]: value } : l)) }
                : col,
            ),
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
      await api.adminUpdateFooterContent(content);
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
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Footer</h1>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Brand & Contact</h2>
        <div className="space-y-3">
          <textarea
            placeholder="Tagline"
            value={content.tagline}
            onChange={(e) => update("tagline", e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Phone"
              value={content.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="rounded-lg border border-neutral-300 p-2.5 text-sm"
            />
            <input
              placeholder="Email"
              value={content.email}
              onChange={(e) => update("email", e.target.value)}
              className="rounded-lg border border-neutral-300 p-2.5 text-sm"
            />
            <input
              placeholder="Address"
              value={content.address}
              onChange={(e) => update("address", e.target.value)}
              className="rounded-lg border border-neutral-300 p-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Instagram URL"
              value={content.instagramUrl ?? ""}
              onChange={(e) => update("instagramUrl", e.target.value)}
              className="rounded-lg border border-neutral-300 p-2.5 text-sm"
            />
            <input
              placeholder="Facebook URL"
              value={content.facebookUrl ?? ""}
              onChange={(e) => update("facebookUrl", e.target.value)}
              className="rounded-lg border border-neutral-300 p-2.5 text-sm"
            />
          </div>
          <input
            placeholder="Copyright text (e.g. Boutique Commerce. All rights reserved.)"
            value={content.copyrightText}
            onChange={(e) => update("copyrightText", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Link Columns</h2>
        <p className="mb-4 text-xs text-neutral-500">The three link columns shown above the contact block.</p>

        <div className="space-y-6">
          {content.columns.map((col, colIdx) => (
            <div key={colIdx} className="rounded-lg border border-neutral-200 p-4">
              <input
                placeholder="Column title (e.g. Shop)"
                value={col.title}
                onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                className="mb-3 w-full rounded-lg border border-neutral-300 p-2 text-sm font-medium"
              />
              <div className="space-y-2">
                {col.links.map((link, linkIdx) => (
                  <div key={linkIdx} className="flex items-center gap-2">
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <input
                        placeholder="Label"
                        value={link.label}
                        onChange={(e) => updateLink(colIdx, linkIdx, "label", e.target.value)}
                        className="rounded-lg border border-neutral-300 p-2 text-sm"
                      />
                      <input
                        placeholder="Link"
                        value={link.href}
                        onChange={(e) => updateLink(colIdx, linkIdx, "href", e.target.value)}
                        className="rounded-lg border border-neutral-300 p-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setContent((c) =>
                          c
                            ? {
                                ...c,
                                columns: c.columns.map((column, i) =>
                                  i === colIdx
                                    ? { ...column, links: column.links.filter((_, j) => j !== linkIdx) }
                                    : column,
                                ),
                              }
                            : c,
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
                    c
                      ? {
                          ...c,
                          columns: c.columns.map((column, i) =>
                            i === colIdx
                              ? { ...column, links: [...column.links, { label: "", href: "" }] }
                              : column,
                          ),
                        }
                      : c,
                  )
                }
                className="mt-3 flex items-center gap-1 text-xs text-[#0A2540] underline"
              >
                <Plus className="h-3 w-3" /> Add link
              </button>
            </div>
          ))}
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
        Save Footer
      </button>
    </div>
  );
}

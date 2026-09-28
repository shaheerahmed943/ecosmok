"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface HeaderNavLink {
  label: string;
  href: string;
}

interface HeaderMegaMenuColumn {
  title: string;
  links: HeaderNavLink[];
}

interface HeaderContent {
  navLinks: HeaderNavLink[];
  megaMenu: HeaderMegaMenuColumn[];
}

const EMPTY_MEGA_MENU: HeaderMegaMenuColumn[] = [
  { title: "Shop by Brand", links: [] },
  { title: "Shop By Bestsellers", links: [] },
  { title: "Shop By Flavour", links: [] },
  { title: "Shop By Offers", links: [] },
];

export default function AdminHeaderPage() {
  const [content, setContent] = useState<HeaderContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .adminGetHeaderContent()
      .then((data) => {
        const header = data as Partial<HeaderContent>;
        setContent({
          navLinks: header.navLinks ?? [],
          megaMenu: header.megaMenu ?? EMPTY_MEGA_MENU,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
  }, []);

  function updateLink(idx: number, field: keyof HeaderNavLink, value: string) {
    setContent((c) =>
      c ? { ...c, navLinks: c.navLinks.map((l, i) => (i === idx ? { ...l, [field]: value } : l)) } : c,
    );
  }

  function updateMegaColumn(columnIdx: number, field: "title", value: string) {
    setContent((c) => c ? {
      ...c,
      megaMenu: c.megaMenu.map((column, idx) => idx === columnIdx ? { ...column, [field]: value } : column),
    } : c);
  }

  function updateMegaLink(columnIdx: number, linkIdx: number, field: keyof HeaderNavLink, value: string) {
    setContent((c) => c ? {
      ...c,
      megaMenu: c.megaMenu.map((column, idx) => idx === columnIdx
        ? { ...column, links: column.links.map((link, linkIndex) => linkIndex === linkIdx ? { ...link, [field]: value } : link) }
        : column),
    } : c);
  }

  async function handleSave() {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.adminUpdateHeaderContent(content);
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
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Header Navigation</h1>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Nav Links</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Links shown in the top navigation bar and mobile menu, in order.
        </p>

        <div className="space-y-3">
          {content.navLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <input
                  placeholder="Label (e.g. Shop)"
                  value={link.label}
                  onChange={(e) => updateLink(idx, "label", e.target.value)}
                  className="rounded-lg border border-neutral-300 p-2 text-sm"
                />
                <input
                  placeholder="Link (e.g. /collections/all)"
                  value={link.href}
                  onChange={(e) => updateLink(idx, "href", e.target.value)}
                  className="rounded-lg border border-neutral-300 p-2 text-sm"
                />
              </div>
              {content.navLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setContent((c) =>
                      c ? { ...c, navLinks: c.navLinks.filter((_, i) => i !== idx) } : c,
                    )
                  }
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setContent((c) => (c ? { ...c, navLinks: [...c.navLinks, { label: "", href: "" }] } : c))
          }
          className="mt-4 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add link
        </button>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Shop Mega Menu</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Manage the four columns shown when customers hover over Shop.
        </p>

        <div className="grid gap-5 lg:grid-cols-2">
          {content.megaMenu.map((column, columnIdx) => (
            <div key={columnIdx} className="rounded-lg border border-neutral-200 p-4">
              <input
                value={column.title}
                onChange={(e) => updateMegaColumn(columnIdx, "title", e.target.value)}
                placeholder="Column title"
                className="mb-3 w-full rounded-lg border border-neutral-300 p-2 text-sm font-medium"
              />
              <div className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <div key={linkIdx} className="flex items-center gap-2">
                    <input
                      value={link.label}
                      onChange={(e) => updateMegaLink(columnIdx, linkIdx, "label", e.target.value)}
                      placeholder="Label"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-300 p-2 text-sm"
                    />
                    <input
                      value={link.href}
                      onChange={(e) => updateMegaLink(columnIdx, linkIdx, "href", e.target.value)}
                      placeholder="/collections/all"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-300 p-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setContent((c) => c ? {
                        ...c,
                        megaMenu: c.megaMenu.map((item, idx) => idx === columnIdx ? { ...item, links: item.links.filter((_, i) => i !== linkIdx) } : item),
                      } : c)}
                      className="text-neutral-400 hover:text-red-500"
                      aria-label="Remove mega menu link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setContent((c) => c ? {
                  ...c,
                  megaMenu: c.megaMenu.map((item, idx) => idx === columnIdx ? { ...item, links: [...item.links, { label: "", href: "/collections/all" }] } : item),
                } : c)}
                className="mt-3 flex items-center gap-1 text-sm text-[#0A2540] underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add menu item
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
        Save Header
      </button>
    </div>
  );
}

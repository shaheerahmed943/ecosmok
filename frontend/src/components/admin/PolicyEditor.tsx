"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

export interface PolicySection {
  heading: string;
  body: string;
}

export interface PolicyContent {
  heading: string;
  intro: string;
  sections: PolicySection[];
}

export default function PolicyEditor({
  pageTitle,
  load,
  save,
}: {
  pageTitle: string;
  load: () => Promise<unknown>;
  save: (payload: PolicyContent) => Promise<unknown>;
}) {
  const [content, setContent] = useState<PolicyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    load()
      .then((data) => setContent(data as PolicyContent))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSection(idx: number, field: keyof PolicySection, value: string) {
    setContent((c) =>
      c ? { ...c, sections: c.sections.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) } : c,
    );
  }

  async function handleSave() {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await save(content);
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
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">{pageTitle}</h1>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Page Header</h2>
        <div className="space-y-3">
          <input
            placeholder="Heading"
            value={content.heading}
            onChange={(e) => setContent((c) => (c ? { ...c, heading: e.target.value } : c))}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <textarea
            placeholder="Intro text"
            value={content.intro}
            onChange={(e) => setContent((c) => (c ? { ...c, intro: e.target.value } : c))}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-1 font-semibold text-[#0A2540]">Sections</h2>
        <p className="mb-4 text-xs text-neutral-500">Each section renders as a heading and a paragraph, in order.</p>

        <div className="space-y-4">
          {content.sections.map((section, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Section {idx + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setContent((c) => (c ? { ...c, sections: c.sections.filter((_, i) => i !== idx) } : c))
                  }
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  placeholder="Section heading"
                  value={section.heading}
                  onChange={(e) => updateSection(idx, "heading", e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
                />
                <textarea
                  placeholder="Section body"
                  value={section.body}
                  onChange={(e) => updateSection(idx, "body", e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setContent((c) =>
              c ? { ...c, sections: [...c.sections, { heading: "", body: "" }] } : c,
            )
          }
          className="mt-4 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add section
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
        Save {pageTitle}
      </button>
    </div>
  );
}

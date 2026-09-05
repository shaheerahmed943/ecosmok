"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface ContactContent {
  heading: string;
  intro: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  imageUrl: string;
}

export default function AdminContactPage() {
  const [content, setContent] = useState<ContactContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .adminGetContactContent()
      .then((data) => setContent(data as ContactContent))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."))
      .finally(() => setIsLoading(false));
  }, []);

  function update(field: keyof ContactContent, value: string) {
    setContent((c) => (c ? { ...c, [field]: value } : c));
  }

  async function handleSave() {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.adminUpdateContactContent(content);
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
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Contact Page</h1>

      <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Page Content</h2>
        <div className="space-y-3">
          <input
            placeholder="Heading"
            value={content.heading}
            onChange={(e) => update("heading", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <textarea
            placeholder="Intro text"
            value={content.intro}
            onChange={(e) => update("intro", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <input
            placeholder="Phone (e.g. +92 300 0000000)"
            value={content.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <input
            placeholder="Email"
            value={content.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <input
            placeholder="Address"
            value={content.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <input
            placeholder="Hours (e.g. Mon – Sat, 11am – 8pm)"
            value={content.hours}
            onChange={(e) => update("hours", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
          <ImageUploadField url={content.imageUrl} onChange={(url) => update("imageUrl", url)} />
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
        Save Contact Page
      </button>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import { api } from "@/lib/api";

export default function ImageUploadField({
  url,
  onChange,
}: {
  url: string;
  onChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await api.adminUploadImage(file);
      onChange(result.url);
    } catch {
      // Non-fatal — user can still paste a URL manually.
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      {url ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-200">
          <Image src={url} alt="" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-300">
          <Upload className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <input
          placeholder="Image URL"
          value={url}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 p-2 text-sm"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1 text-xs text-[#0A2540] underline"
        >
          {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Upload instead
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { api } from "@/lib/api";

const imports = [
  { type: "products" as const, title: "Products", columns: "Handle, Title, Body (HTML), Type, Tags, Variant SKU, Variant Price, Variant Inventory Qty, Option1 Value, Option2 Value, Image Src (optional)" },
  { type: "categories" as const, title: "Collections", columns: "name, slug, description, imageUrl, parentSlug, isActive, sortOrder" },
  { type: "users" as const, title: "Customers", columns: "name, email, password, phone" },
];

export default function ImportsPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  async function upload(type: (typeof imports)[number]["type"], file?: File) {
    if (!file) return;
    setBusy(type); setMessage(null);
    try { const result = await api.adminImportCsv(type, file); setMessage(`${result.imported} ${type} imported successfully.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Import failed."); }
    finally { setBusy(null); }
  }
  return <div className="max-w-4xl space-y-8">
    <header><h1 className="font-serif text-3xl text-[#0A2540]">CSV Imports</h1><p className="mt-2 text-sm text-neutral-500">Upload a standard product CSV to add or update products. Image URLs are optional, and rows with the same Handle become variants.</p></header>
    {message && <p className="rounded-lg bg-[#F5F2EC] p-3 text-sm text-[#0A2540]">{message}</p>}
    <div className="grid gap-5 md:grid-cols-3">
      {imports.map((item) => <section key={item.type} className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-medium text-[#0A2540]">{item.title}</h2><p className="mt-3 text-xs leading-5 text-neutral-500">CSV columns: {item.columns}</p>
        <label className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0A2540] px-3 py-2.5 text-sm text-white hover:bg-[#12395d]">
          <FileUp className="h-4 w-4" /> {busy === item.type ? "Importing..." : "Choose CSV"}
          <input type="file" accept=".csv,text/csv" className="hidden" disabled={Boolean(busy)} onChange={(e) => upload(item.type, e.target.files?.[0])} />
        </label>
      </section>)}
    </div>
  </div>;
}
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FABRICS = ["Fruity", "Dessert", "Menthol", "Tobacco"];
const TYPES = [
  { label: "Disposable Vapes", value: "DISPOSABLE" },
  { label: "Pod Systems", value: "POD_SYSTEM" },
  { label: "E-Liquids", value: "E_LIQUID" },
  { label: "Hardware", value: "HARDWARE" },
];
const SIZES = ["STANDARD", "TWO_ML", "TEN_ML", "THIRTY_ML", "FIFTY_ML", "FOUR_PACK"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Featured", value: "featured" },
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggleParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    if (next.length) params.set(key, next.join(","));
    else params.delete(key);

    router.push(`?${params.toString()}`);
  }

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    router.push(`?${params.toString()}`);
  }

  const activeFabrics = searchParams.get("fabric")?.split(",").filter(Boolean) ?? [];
  const activeTypes = searchParams.get("type")?.split(",").filter(Boolean) ?? [];
  const activeSizes = searchParams.get("size")?.split(",").filter(Boolean) ?? [];

  return (
    <aside className="w-full shrink-0 space-y-8 lg:w-56">
      <div>
        <p className="mb-3 text-sm font-semibold text-[#0A2540]">Sort By</p>
        <select
          onChange={(e) => setSort(e.target.value)}
          defaultValue={searchParams.get("sortBy") ?? "newest"}
          className="w-full rounded-md border border-neutral-300 p-2 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-[#0A2540]">Flavour profile</p>
        <div className="space-y-2">
          {FABRICS.map((fabric) => (
            <label key={fabric} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={activeFabrics.includes(fabric)}
                onChange={() => toggleParam("fabric", fabric)}
              />
              {fabric}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-[#0A2540]">Type</p>
        <div className="space-y-2">
          {TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={activeTypes.includes(type.value)}
                onChange={() => toggleParam("type", type.value)}
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-[#0A2540]">Capacity / pack</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleParam("size", size)}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                activeSizes.includes(size)
                  ? "border-[#0A2540] bg-[#0A2540] text-white"
                  : "border-neutral-300 text-neutral-700"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

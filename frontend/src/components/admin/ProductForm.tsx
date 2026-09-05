"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
}

interface VariantRow {
  id?: string;
  size: string;
  color: string;
  fabricOption: string;
  variantPrice: string;
  stockQuantity: string;
}

interface ImageRow {
  url: string;
  isUploading?: boolean;
}

interface ProductFormProps {
  /** When provided, the form loads the existing product and switches to edit mode. */
  productId?: string;
}

const SIZES = ["STANDARD", "TWO_ML", "TEN_ML", "THIRTY_ML", "FIFTY_ML", "ONE_HUNDRED_ML", "FOUR_PACK"];
const TYPES = ["DISPOSABLE", "POD_SYSTEM", "E_LIQUID", "HARDWARE", "ACCESSORY"];
const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED", "OUT_OF_STOCK"];
const VAPE_TAGS = ["Nicotine Salt", "Freebase", "Fruity", "Dessert", "Menthol", "Tobacco", "Starter Kit"];

function emptyVariant(): VariantRow {
  return { size: "STANDARD", color: "", fabricOption: "", variantPrice: "", stockQuantity: "" };
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(productId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fabricDetails, setFabricDetails] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [nicotineStrength, setNicotineStrength] = useState("");
  const [flavour, setFlavour] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [puffCount, setPuffCount] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [coilResistance, setCoilResistance] = useState("");
  const [pgVgRatio, setPgVgRatio] = useState("");
  const [isNicotineFree, setIsNicotineFree] = useState(false);
  const [basePrice, setBasePrice] = useState("");
  const [type, setType] = useState(TYPES[1]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [categoryId, setCategoryId] = useState("");
  const [fabricTags, setFabricTags] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const [images, setImages] = useState<ImageRow[]>([{ url: "" }]);
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);

  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .adminGetCategories()
      .then((data) => {
        const cats = data as Category[];
        setCategories(cats);
        if (cats.length && !categoryId) setCategoryId(cats[0].id);
      })
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load existing product data when editing.
  useEffect(() => {
    if (!productId) return;
    setIsLoadingProduct(true);
    api
      .adminGetProduct(productId)
      .then((data: any) => {
        setTitle(data.title);
        setDescription(data.description);
        setFabricDetails(data.fabricDetails ?? "");
        setCareInstructions(data.careInstructions ?? "");
        setNicotineStrength(data.nicotineStrength ?? "");
        setFlavour(data.flavour ?? "");
        setDeviceType(data.deviceType ?? "");
        setCapacity(data.capacity ?? "");
        setPuffCount(data.puffCount ? String(data.puffCount) : "");
        setBatteryCapacity(data.batteryCapacity ?? "");
        setCoilResistance(data.coilResistance ?? "");
        setPgVgRatio(data.pgVgRatio ?? "");
        setIsNicotineFree(Boolean(data.isNicotineFree));
        setBasePrice(String(data.basePrice));
        setType(data.type);
        setStatus(data.status);
        setCategoryId(data.categoryId);
        setFabricTags(data.fabricTags ?? []);
        setIsFeatured(data.isFeatured);
        setImages(
          data.images?.length ? data.images.map((img: any) => ({ url: img.url })) : [{ url: "" }],
        );
        setVariants(
          data.variants?.length
            ? data.variants.map((v: any) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                fabricOption: v.fabricOption ?? "",
                variantPrice: String(v.variantPrice),
                stockQuantity: String(v.stockQuantity),
              }))
            : [emptyVariant()],
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load product."))
      .finally(() => setIsLoadingProduct(false));
  }, [productId]);

  function toggleFabricTag(tag: string) {
    setFabricTags((tags) => (tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]));
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setIsCreatingCategory(true);
    try {
      const created = (await api.adminCreateCategory(name)) as Category;
      setCategories((cats) => [...cats, created]);
      setCategoryId(created.id);
      setNewCategoryName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setIsCreatingCategory(false);
    }
  }

  function updateVariant(idx: number, field: keyof VariantRow, value: string) {
    setVariants((rows) => rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function updateImage(idx: number, value: string) {
    setImages((rows) => rows.map((row, i) => (i === idx ? { ...row, url: value } : row)));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    setError(null);
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => api.adminUploadImage(file)),
      );
      setImages((rows) => {
        const withoutEmpty = rows.filter((r) => r.url.trim());
        return [...withoutEmpty, ...uploads.map((u) => ({ url: u.url }))];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const cleanImages = images.filter((i) => i.url.trim());
    const cleanVariants = variants
      .filter((v) => v.color.trim() && v.variantPrice)
      .map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        fabricOption: v.fabricOption || undefined,
        variantPrice: Number(v.variantPrice),
        stockQuantity: Number(v.stockQuantity) || 0,
      }));

    if (!title || !description || !basePrice || !categoryId) {
      setError("Please fill in title, description, base price, and category.");
      return;
    }
    if (cleanImages.length === 0) {
      setError("Add at least one image.");
      return;
    }
    if (cleanVariants.length === 0) {
      setError("Add at least one variant row with color and price.");
      return;
    }

    const payload = {
      title,
      description,
      fabricDetails: fabricDetails || undefined,
      careInstructions: careInstructions || undefined,
      nicotineStrength: nicotineStrength || undefined,
      flavour: flavour || undefined,
      deviceType: deviceType || undefined,
      capacity: capacity || undefined,
      puffCount: puffCount ? Number(puffCount) : undefined,
      batteryCapacity: batteryCapacity || undefined,
      coilResistance: coilResistance || undefined,
      pgVgRatio: pgVgRatio || undefined,
      isNicotineFree,
      basePrice: Number(basePrice),
      type,
      status,
      categoryId,
      fabricTags,
      isFeatured,
      images: cleanImages,
      variants: cleanVariants,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && productId) {
        await api.adminUpdateProduct(productId, payload);
      } else {
        await api.adminCreateProduct(payload);
      }
      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingProduct) {
    return <p className="text-sm text-neutral-500">Loading product…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Basic details */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Product Details</h2>
        <div className="space-y-4">
          <input
            required
            placeholder="Product Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-3"
          />
          <textarea
            required
            rows={3}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-3"
          />
          <input
            placeholder="Product details (e.g. 50/50 VG/PG, rechargeable device)"
            value={fabricDetails}
            onChange={(e) => setFabricDetails(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-3"
          />
          <input
            placeholder="Care Instructions"
            value={careInstructions}
            onChange={(e) => setCareInstructions(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-3"
          />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <input placeholder="Nicotine strength (e.g. 20mg)" value={nicotineStrength} onChange={(e) => setNicotineStrength(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
            <input placeholder="Flavour profile" value={flavour} onChange={(e) => setFlavour(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
            <input placeholder="Device type" value={deviceType} onChange={(e) => setDeviceType(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
            <input placeholder="Capacity (e.g. 2ml)" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
            <input placeholder="Puff count" type="number" min="0" value={puffCount} onChange={(e) => setPuffCount(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
            <input placeholder="Battery (mAh)" value={batteryCapacity} onChange={(e) => setBatteryCapacity(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
            <input placeholder="Coil resistance" value={coilResistance} onChange={(e) => setCoilResistance(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
            <input placeholder="VG/PG ratio" value={pgVgRatio} onChange={(e) => setPgVgRatio(e.target.value)} className="rounded-lg border border-neutral-300 p-3" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              required
              type="number"
              min="0"
              placeholder="Base Price (Rs.)"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="rounded-lg border border-neutral-300 p-3"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-neutral-300 p-3"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-neutral-300 p-3"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 p-3"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-amber-600">No categories yet — create one below.</p>
          )}

          <div className="flex gap-2">
            <input
              placeholder="New category name (e.g. Unstitched Suits)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 rounded-lg border border-neutral-300 p-2.5 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
              className="flex items-center gap-1 rounded-lg border border-[#0A2540] px-4 text-sm text-[#0A2540] disabled:opacity-40"
            >
              {isCreatingCategory ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add Category
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm text-neutral-600">Product Tags</p>
            <div className="flex flex-wrap gap-2">
              {VAPE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleFabricTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    fabricTags.includes(tag)
                      ? "border-[#0A2540] bg-[#0A2540] text-white"
                      : "border-neutral-300 text-neutral-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Feature on homepage
          </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={isNicotineFree} onChange={(e) => setIsNicotineFree(e.target.checked)} />
              Nicotine-free product
            </label>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Images</h2>

        <div className="mb-4 flex flex-wrap gap-3">
          {images
            .filter((i) => i.url.trim())
            .map((img, idx) => (
              <div key={idx} className="group relative h-24 w-20 overflow-hidden rounded-lg border border-neutral-200">
                <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setImages((rows) => rows.filter((r) => r.url !== img.url))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-[#0A2540]/90 py-0.5 text-center text-[9px] text-white">
                    Primary
                  </span>
                )}
              </div>
            ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-[#0A2540] hover:text-[#0A2540]"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            <span className="text-[10px]">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <p className="mb-2 text-xs text-neutral-500">
          Or paste a hosted image URL directly:
        </p>
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                placeholder="https://…"
                value={img.url}
                onChange={(e) => updateImage(idx, e.target.value)}
                className="flex-1 rounded-lg border border-neutral-300 p-2.5 text-sm"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => setImages((rows) => rows.filter((_, i) => i !== idx))}
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
          onClick={() => setImages((rows) => [...rows, { url: "" }])}
          className="mt-3 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add another URL field
        </button>
      </section>

      {/* Variant matrix */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-[#0A2540]">Variant Matrix</h2>
        <p className="mb-3 text-xs text-neutral-500">
          One row per pack/capacity and colour option. SKU is auto-generated.
        </p>

        <div className="space-y-3">
          {variants.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center gap-2">
              <select
                value={row.size}
                onChange={(e) => updateVariant(idx, "size", e.target.value)}
                className="col-span-2 rounded-lg border border-neutral-300 p-2 text-sm"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                placeholder="Colour / edition"
                value={row.color}
                onChange={(e) => updateVariant(idx, "color", e.target.value)}
                className="col-span-3 rounded-lg border border-neutral-300 p-2 text-sm"
              />
              <input
                placeholder="Pack or bottle option"
                value={row.fabricOption}
                onChange={(e) => updateVariant(idx, "fabricOption", e.target.value)}
                className="col-span-3 rounded-lg border border-neutral-300 p-2 text-sm"
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={row.variantPrice}
                onChange={(e) => updateVariant(idx, "variantPrice", e.target.value)}
                className="col-span-2 rounded-lg border border-neutral-300 p-2 text-sm"
              />
              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={row.stockQuantity}
                onChange={(e) => updateVariant(idx, "stockQuantity", e.target.value)}
                className="col-span-1 rounded-lg border border-neutral-300 p-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setVariants((rows) => rows.filter((_, i) => i !== idx))}
                disabled={variants.length === 1}
                className="col-span-1 text-neutral-400 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setVariants((rows) => [...rows, emptyVariant()])}
          className="mt-3 flex items-center gap-1 text-sm text-[#0A2540] underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add variant row
        </button>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-600">
          Product {isEditMode ? "updated" : "created"}! Redirecting…
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-lg bg-[#0A2540] px-8 py-3.5 font-medium text-white disabled:bg-neutral-300"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEditMode ? "Save Changes" : "Publish Product"}
      </button>
    </form>
  );
}

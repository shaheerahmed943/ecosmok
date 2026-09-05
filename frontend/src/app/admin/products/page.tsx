"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  status: string;
  basePrice: number;
  categoryName: string;
  imageUrl: string | null;
  totalStock: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const result = (await api.adminListProducts()) as { data: AdminProduct[] };
      setProducts(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[#0A2540]">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-[#0A2540] px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-16 text-center text-neutral-500">
          No products yet.{" "}
          <Link href="/admin/products/new" className="text-[#0A2540] underline">
            Add your first product
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="flex items-center gap-3 p-4">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-neutral-100">
                      {p.imageUrl && (
                        <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                      )}
                    </div>
                    <span className="font-medium text-[#0A2540]">{p.title}</span>
                  </td>
                  <td className="p-4 text-neutral-600">{p.categoryName}</td>
                  <td className="p-4 text-neutral-600">Rs. {p.basePrice.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={p.totalStock <= 5 ? "text-red-600" : "text-neutral-600"}>
                      {p.totalStock}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-neutral-400 hover:text-[#0A2540]"
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="text-neutral-400 hover:text-red-500"
                        aria-label={`Delete ${p.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Edit Product</h1>
      <ProductForm productId={params.id} />
    </div>
  );
}

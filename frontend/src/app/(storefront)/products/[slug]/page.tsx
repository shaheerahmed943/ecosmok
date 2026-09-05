import ProductDetail from "@/components/pdp/ProductDetail";
import { api } from "@/lib/api";

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const product = (await api.getProduct(params.slug)) as Parameters<
      typeof ProductDetail
    >[0] & { reviews?: unknown[] };

    return <ProductDetail {...product} reviews={(product as any).reviews ?? []} />;
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl text-[#0A2540]">Product not found</h1>
        <p className="mt-2 text-neutral-600">
          Make sure the backend API is running and this slug exists in the database
          (seed data first — see README).
        </p>
      </main>
    );
  }
}

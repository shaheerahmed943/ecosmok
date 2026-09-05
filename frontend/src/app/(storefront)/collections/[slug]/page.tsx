import ProductGrid, { PLPProduct } from "@/components/plp/ProductGrid";
import FilterSidebar from "@/components/plp/FilterSidebar";
import { api } from "@/lib/api";

interface PLPPageProps {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}

const CATEGORY_TITLES: Record<string, string> = {
  all: "All Products",
  stitched: "Stitched",
  unstitched: "Unstitched",
  "boutique-exclusive": "Boutique Exclusive",
};

export default async function CollectionPage({ params, searchParams }: PLPPageProps) {
  const query = new URLSearchParams();
  if (params.slug !== "all") query.set("category", params.slug);
  if (searchParams.fabric) query.set("fabric", searchParams.fabric);
  if (searchParams.type) query.set("type", searchParams.type);
  if (searchParams.size) query.set("size", searchParams.size);
  if (searchParams.sortBy) query.set("sortBy", searchParams.sortBy);

  let products: PLPProduct[] = [];
  try {
    const result = (await api.listProducts(query.toString())) as { data: PLPProduct[] };
    products = result.data;
  } catch {
    products = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 font-serif text-3xl text-[#0A2540]">
        {CATEGORY_TITLES[params.slug] ?? params.slug}
      </h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterSidebar />
        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}

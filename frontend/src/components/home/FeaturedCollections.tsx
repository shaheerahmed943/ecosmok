import ProductGrid, { PLPProduct } from "@/components/plp/ProductGrid";

export default function FeaturedCollections({
  title,
  products,
}: {
  title: string;
  products: PLPProduct[];
}) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="mb-6 text-center font-serif text-2xl text-[#0A2540]">{title}</h2>
      <ProductGrid products={products} />
    </section>
  );
}

import HeroCarousel, { HeroSlide } from "@/components/home/HeroCarousel";
import HomepageWidgets, { HomepageWidgetData, HomepageWidgetTab } from "@/components/home/HomepageWidgets";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivalsSlider from "@/components/home/NewArrivalsSlider";
import { PLPProduct } from "@/components/plp/ProductGrid";
import { api } from "@/lib/api";

interface HomepageContent {
  heroSlides: HeroSlide[];
  fabricTiles?: { name: string; imageUrl: string; link: string }[];
  homeWidgets?: HomepageWidgetData[];
  promoBanner?: { text: string; link?: string; isActive: boolean };
  featuredCollectionTitle?: string;
  featuredCollectionSlug?: string;
}

export default async function HomePage() {
  const [content, newArrivalsResult] = await Promise.allSettled([
    api.getHomepageContent() as Promise<HomepageContent>,
    api.listProducts("sortBy=newest&pageSize=10") as Promise<{ data: PLPProduct[] }>,
  ]);

  const homepage =
    content.status === "fulfilled"
      ? content.value
      : { heroSlides: [], fabricTiles: [], promoBanner: undefined, featuredCollectionTitle: "Boutique Favourites" };

  const featuredCollectionSlug = homepage.featuredCollectionSlug ?? "vaping-kits";
  const featuredProducts = await api
    .listProducts(`category=${encodeURIComponent(featuredCollectionSlug)}&pageSize=8&sortBy=featured`)
    .then((result) => (result as { data: PLPProduct[] }).data)
    .catch(() => []);
  const newArrivals = newArrivalsResult.status === "fulfilled" ? newArrivalsResult.value.data : [];
  const rawContent = content.status === "fulfilled" ? content.value : homepage;
  const widgets = rawContent.homeWidgets?.length
    ? rawContent.homeWidgets
    : rawContent.fabricTiles?.length
      ? [{
          id: "legacy-fabric-tiles",
          title: "Shop by Category",
          tabs: [
            {
              label: "Categories",
              type: "cards" as const,
              cards: rawContent.fabricTiles.map((tile) => ({
                heading: tile.name,
                imageUrl: tile.imageUrl,
                link: tile.link,
              })),
            },
            { label: "Best Seller", type: "collection" as const, collectionSlug: "all" },
            { label: "New", type: "collection" as const, collectionSlug: "all" },
          ],
        }]
      : [];

  const hydratedWidgets = await Promise.all(
    widgets.map(async (widget) => ({
      ...widget,
      tabs: await Promise.all(
        widget.tabs.map(async (tab: HomepageWidgetTab) => {
          if (tab.type !== "collection") return tab;
          try {
            const query = tab.collectionSlug && tab.collectionSlug !== "all"
              ? `category=${encodeURIComponent(tab.collectionSlug)}&pageSize=12`
              : "pageSize=12&sortBy=newest";
            const result = (await api.listProducts(query)) as { data: HomepageWidgetTab["products"] };
            return { ...tab, products: result.data ?? [] };
          } catch {
            return { ...tab, products: [] };
          }
        }),
      ),
    })),
  );

  return (
    <div>
      {homepage.promoBanner?.isActive && homepage.promoBanner.text && (
        <div className="bg-[#0A2540] py-2 text-center text-xs text-white">
          {homepage.promoBanner.text}
        </div>
      )}

      <HeroCarousel slides={homepage.heroSlides} />
      <HomepageWidgets widgets={hydratedWidgets} />
      <FeaturedCollections
        title={homepage.featuredCollectionTitle ?? "Boutique Favourites"}
        products={featuredProducts}
      />
      <NewArrivalsSlider products={newArrivals} />
    </div>
  );
}

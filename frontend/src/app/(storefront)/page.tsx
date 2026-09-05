import HeroCarousel, { HeroSlide } from "@/components/home/HeroCarousel";
import FabricFilterTiles, { FabricTile } from "@/components/home/FabricFilterTiles";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivalsSlider from "@/components/home/NewArrivalsSlider";
import { PLPProduct } from "@/components/plp/ProductGrid";
import { api } from "@/lib/api";

interface HomepageContent {
  heroSlides: HeroSlide[];
  fabricTiles: FabricTile[];
  promoBanner?: { text: string; link?: string; isActive: boolean };
  featuredCollectionTitle?: string;
}

export default async function HomePage() {
  const [content, featuredResult, newArrivalsResult] = await Promise.allSettled([
    api.getHomepageContent() as Promise<HomepageContent>,
    api.listProducts("sortBy=featured&pageSize=8") as Promise<{ data: PLPProduct[] }>,
    api.listProducts("sortBy=newest&pageSize=10") as Promise<{ data: PLPProduct[] }>,
  ]);

  const homepage =
    content.status === "fulfilled"
      ? content.value
      : { heroSlides: [], fabricTiles: [], promoBanner: undefined, featuredCollectionTitle: "Boutique Favourites" };

  const featuredProducts = featuredResult.status === "fulfilled" ? featuredResult.value.data : [];
  const newArrivals = newArrivalsResult.status === "fulfilled" ? newArrivalsResult.value.data : [];

  return (
    <div>
      {homepage.promoBanner?.isActive && homepage.promoBanner.text && (
        <div className="bg-[#0A2540] py-2 text-center text-xs text-white">
          {homepage.promoBanner.text}
        </div>
      )}

      <HeroCarousel slides={homepage.heroSlides} />
      <FabricFilterTiles tiles={homepage.fabricTiles} />
      <FeaturedCollections
        title={homepage.featuredCollectionTitle ?? "Boutique Favourites"}
        products={featuredProducts}
      />
      <NewArrivalsSlider products={newArrivals} />
    </div>
  );
}

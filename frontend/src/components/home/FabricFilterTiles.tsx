import Image from "next/image";
import Link from "next/link";

export interface FabricTile {
  name: string;
  imageUrl: string;
  link: string;
}

export default function FabricFilterTiles({ tiles }: { tiles: FabricTile[] }) {
  if (!tiles.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <h2 className="mb-6 text-center font-serif text-2xl text-[#0A2540]">Shop by Fabric</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.name}
            href={tile.link}
            className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-[#F5F2EC]"
          >
            <Image
              src={tile.imageUrl}
              alt={tile.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-4 left-4 font-serif text-lg text-white">
              {tile.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

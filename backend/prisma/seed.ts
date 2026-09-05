import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = "admin@ecosmok.co.uk";
const DEFAULT_ADMIN_PASSWORD = "Admin@12345";

interface SeedVariant {
  size: "S" | "M" | "L" | "XL";
  color: string;
  price: number;
  stock: number;
}

interface SeedProduct {
  title: string;
  slug: string;
  description: string;
  fabricDetails: string;
  careInstructions: string;
  basePrice: number;
  type: "STITCHED" | "UNSTITCHED" | "READY_TO_WEAR" | "BOUTIQUE_EXCLUSIVE";
  categorySlug: "unstitched" | "stitched" | "boutique-exclusive";
  fabricTags: string[];
  isFeatured: boolean;
  images: string[];
  variants: SeedVariant[];
}

interface VapeSeedProduct {
  title: string;
  slug: string;
  description: string;
  type: "DISPOSABLE" | "POD_SYSTEM" | "E_LIQUID" | "HARDWARE" | "ACCESSORY";
  categorySlug: string;
  flavour?: string;
  nicotineStrength?: string;
  deviceType?: string;
  capacity?: string;
  puffCount?: number;
  batteryCapacity?: string;
  basePrice: number;
  tags: string[];
  image: string;
  variants: { size: "STANDARD" | "TWO_ML" | "TEN_ML" | "FIFTY_ML"; colour: string; stock: number }[];
}

const VAPE_CATEGORIES = [
  { name: "Prefilled Kits", slug: "disposable-vape-alternatives", sortOrder: 1 },
  { name: "E-Liquids", slug: "e-liquids", sortOrder: 2 },
  { name: "Vaping Kits", slug: "vaping-kits", sortOrder: 3 },
  { name: "Vape Kit Bundles", slug: "vape-kit-bundles", sortOrder: 4 },
  { name: "Pods & Coils", slug: "pods-coils", sortOrder: 5 },
  { name: "Nicotine Pouches", slug: "nicotine-pouches", sortOrder: 6 },
  { name: "Accessories", slug: "accessories", sortOrder: 7 },
];

const VAPE_PRODUCTS: VapeSeedProduct[] = [
  {
    title: "Hayati Pro Max Plus 6000 Prefilled Pod Kit",
    slug: "hayati-pro-max-plus-6000-prefilled-pod-kit",
    description: "A rechargeable prefilled pod kit with a generous puff count and bold flavour range.",
    type: "DISPOSABLE",
    categorySlug: "disposable-vape-alternatives",
    flavour: "Mixed fruit",
    nicotineStrength: "20mg",
    capacity: "2ml + 10ml",
    puffCount: 6000,
    basePrice: 6.99,
    tags: ["Fruity", "Nicotine Salt", "Prefilled"],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900",
    variants: [{ size: "STANDARD", colour: "Mixed fruit", stock: 30 }],
  },
  {
    title: "Vaporesso XROS 6 Pod Vape Kit",
    slug: "vaporesso-xros-6-pod-vape-kit",
    description: "A compact refillable pod system with adjustable airflow and reliable everyday battery life.",
    type: "POD_SYSTEM",
    categorySlug: "vaping-kits",
    deviceType: "Refillable pod system",
    capacity: "2ml",
    batteryCapacity: "1000mAh",
    basePrice: 24.99,
    tags: ["Starter Kit", "Refillable", "Hardware"],
    image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=900",
    variants: [{ size: "STANDARD", colour: "Black", stock: 18 }, { size: "STANDARD", colour: "Silver", stock: 12 }],
  },
  {
    title: "Elfliq Nic Salt E-Liquid 10ml",
    slug: "elfliq-nic-salt-e-liquid-10ml",
    description: "Smooth 50/50 nic salt e-liquid in a choice of familiar fruit and menthol flavours.",
    type: "E_LIQUID",
    categorySlug: "e-liquids",
    flavour: "Fruit and menthol range",
    nicotineStrength: "10mg / 20mg",
    capacity: "10ml",
    basePrice: 3.99,
    tags: ["Nicotine Salt", "Fruity", "Menthol"],
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900",
    variants: [{ size: "TEN_ML", colour: "Blue Razz", stock: 45 }, { size: "TEN_ML", colour: "Strawberry Kiwi", stock: 40 }],
  },
  {
    title: "Replacement Pods 2 Pack",
    slug: "replacement-pods-2-pack",
    description: "Replacement refillable pods for compatible pod systems, designed for a clean and consistent draw.",
    type: "ACCESSORY",
    categorySlug: "pods-coils",
    capacity: "2ml",
    basePrice: 7.99,
    tags: ["Replacement Pods", "Accessories"],
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=900",
    variants: [{ size: "TWO_ML", colour: "2 pack", stock: 35 }],
  },
];

const SEED_PRODUCTS: SeedProduct[] = [
  {
    title: "Maroon Embroidered Chiffon Suit",
    slug: "maroon-embroidered-chiffon-suit",
    description:
      "A hand-embroidered chiffon 3-piece suit with delicate thread work, perfect for festive occasions.",
    fabricDetails: "Pure Chiffon shirt & dupatta, Raw Silk trouser.",
    careInstructions: "Dry clean only. Store away from direct sunlight.",
    basePrice: 8500,
    type: "UNSTITCHED",
    categorySlug: "unstitched",
    fabricTags: ["Chiffon"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
      "https://images.unsplash.com/photo-1622461962346-a4d6c6ffade5?w=800",
    ],
    variants: [
      { size: "S", color: "Maroon", price: 8500, stock: 4 },
      { size: "M", color: "Maroon", price: 8500, stock: 6 },
      { size: "L", color: "Maroon", price: 8500, stock: 2 },
      { size: "XL", color: "Maroon", price: 8900, stock: 0 },
    ],
  },
  {
    title: "Emerald Zari Lawn Suit",
    slug: "emerald-zari-lawn-suit",
    description:
      "An unstitched 3-piece lawn suit with zari-woven borders and a matching printed dupatta — a warm-weather festive staple.",
    fabricDetails: "Pure Lawn shirt & trouser, Chiffon dupatta.",
    careInstructions: "Hand wash separately in cold water.",
    basePrice: 6200,
    type: "UNSTITCHED",
    categorySlug: "unstitched",
    fabricTags: ["Lawn"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1777972094693-9084fc20d5b3?w=800",
      "https://images.unsplash.com/photo-1758551038941-a67e29026bff?w=800",
    ],
    variants: [
      { size: "S", color: "Emerald", price: 6200, stock: 8 },
      { size: "M", color: "Emerald", price: 6200, stock: 10 },
      { size: "L", color: "Emerald", price: 6200, stock: 5 },
    ],
  },
  {
    title: "Ivory Organza Unstitched Set",
    slug: "ivory-organza-unstitched-set",
    description:
      "A luminous ivory organza set with subtle self-thread work, designed to be tailored to your own silhouette.",
    fabricDetails: "Pure Organza shirt & dupatta, Silk trouser lining.",
    careInstructions: "Dry clean only.",
    basePrice: 9800,
    type: "UNSTITCHED",
    categorySlug: "unstitched",
    fabricTags: ["Organza"],
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1777972094693-9084fc20d5b3?w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
    ],
    variants: [
      { size: "S", color: "Ivory", price: 9800, stock: 3 },
      { size: "M", color: "Ivory", price: 9800, stock: 5 },
      { size: "L", color: "Ivory", price: 9800, stock: 0 },
    ],
  },
  {
    title: "Sandstone Velvet Shawl Suit",
    slug: "sandstone-velvet-shawl-suit",
    description:
      "A winter-weight unstitched suit in brushed velvet with a matching heavy shawl, warm and richly textured.",
    fabricDetails: "Velvet shirt, Cotton trouser, Velvet shawl.",
    careInstructions: "Dry clean only. Do not wring.",
    basePrice: 11500,
    type: "UNSTITCHED",
    categorySlug: "unstitched",
    fabricTags: ["Velvet"],
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1758551038941-a67e29026bff?w=800",
      "https://images.unsplash.com/photo-1622461962346-a4d6c6ffade5?w=800",
    ],
    variants: [
      { size: "M", color: "Sandstone", price: 11500, stock: 4 },
      { size: "L", color: "Sandstone", price: 11500, stock: 3 },
    ],
  },
  {
    title: "Powder Blue Stitched Lawn 2-Piece",
    slug: "powder-blue-stitched-lawn-2-piece",
    description:
      "A ready-to-wear lawn 2-piece in powder blue with printed detailing — stitched to standard sizing and ready to ship.",
    fabricDetails: "Pure Lawn shirt & trouser.",
    careInstructions: "Machine wash cold, hang dry.",
    basePrice: 7200,
    type: "STITCHED",
    categorySlug: "stitched",
    fabricTags: ["Lawn"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1741847639057-b51a25d42892?w=800",
      "https://images.unsplash.com/photo-1646926896399-34fbea23ac06?w=800",
    ],
    variants: [
      { size: "S", color: "Powder Blue", price: 7200, stock: 6 },
      { size: "M", color: "Powder Blue", price: 7200, stock: 9 },
      { size: "L", color: "Powder Blue", price: 7200, stock: 4 },
      { size: "XL", color: "Powder Blue", price: 7500, stock: 2 },
    ],
  },
  {
    title: "Teal Pinstripe Tailored Suit",
    slug: "teal-pinstripe-tailored-suit",
    description:
      "A sharply tailored pinstripe 2-piece for the boutique that wants structure — fully stitched and finished.",
    fabricDetails: "Cotton-blend suiting fabric.",
    careInstructions: "Dry clean recommended.",
    basePrice: 12800,
    type: "STITCHED",
    categorySlug: "stitched",
    fabricTags: ["Cotton"],
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1771072426488-87e6bbcc0cf7?w=800",
      "https://images.unsplash.com/photo-1646926896399-34fbea23ac06?w=800",
    ],
    variants: [
      { size: "S", color: "Teal", price: 12800, stock: 3 },
      { size: "M", color: "Teal", price: 12800, stock: 5 },
      { size: "L", color: "Teal", price: 12800, stock: 2 },
    ],
  },
  {
    title: "Blush Pink Stitched Chiffon Gown",
    slug: "blush-pink-stitched-chiffon-gown",
    description:
      "A flowing, fully stitched chiffon gown in blush pink — occasion-ready straight off the rack.",
    fabricDetails: "Chiffon over Silk lining.",
    careInstructions: "Dry clean only.",
    basePrice: 14200,
    type: "STITCHED",
    categorySlug: "stitched",
    fabricTags: ["Chiffon"],
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1646926896399-34fbea23ac06?w=800",
      "https://images.unsplash.com/photo-1741847639057-b51a25d42892?w=800",
    ],
    variants: [
      { size: "S", color: "Blush Pink", price: 14200, stock: 2 },
      { size: "M", color: "Blush Pink", price: 14200, stock: 3 },
      { size: "L", color: "Blush Pink", price: 14200, stock: 0 },
    ],
  },
  {
    title: "Gold Hand-Embellished Bridal Gown",
    slug: "gold-hand-embellished-bridal-gown",
    description:
      "Our signature boutique-exclusive piece — hand-embellished with gold thread and dabka work for the bride who wants to be remembered.",
    fabricDetails: "Silk base with hand-embellished bodice.",
    careInstructions: "Dry clean only. Professional handling recommended.",
    basePrice: 45000,
    type: "BOUTIQUE_EXCLUSIVE",
    categorySlug: "boutique-exclusive",
    fabricTags: ["Silk"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1742891601435-39de27531cc7?w=800",
      "https://images.unsplash.com/photo-1567567557645-8450247d194a?w=800",
    ],
    variants: [
      { size: "S", color: "Gold", price: 45000, stock: 1 },
      { size: "M", color: "Gold", price: 45000, stock: 2 },
      { size: "L", color: "Gold", price: 47000, stock: 1 },
    ],
  },
  {
    title: "Royal Wedding Ensemble",
    slug: "royal-wedding-ensemble",
    description:
      "A boutique-exclusive velvet ensemble with heirloom-inspired detailing, made to order for wedding events.",
    fabricDetails: "Velvet with hand-finished embellishment.",
    careInstructions: "Dry clean only.",
    basePrice: 38500,
    type: "BOUTIQUE_EXCLUSIVE",
    categorySlug: "boutique-exclusive",
    fabricTags: ["Velvet"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1756376748107-12c98ec6b969?w=800",
      "https://images.unsplash.com/photo-1567567557645-8450247d194a?w=800",
    ],
    variants: [
      { size: "M", color: "Royal Maroon", price: 38500, stock: 1 },
      { size: "L", color: "Royal Maroon", price: 38500, stock: 2 },
    ],
  },
  {
    title: "Ivory Organza Showcase Gown",
    slug: "ivory-organza-showcase-gown",
    description:
      "A boutique-exclusive organza gown with layered draping, made in limited numbers each season.",
    fabricDetails: "Layered Organza over Silk lining.",
    careInstructions: "Dry clean only. Store on a padded hanger.",
    basePrice: 32000,
    type: "BOUTIQUE_EXCLUSIVE",
    categorySlug: "boutique-exclusive",
    fabricTags: ["Organza"],
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?w=800",
      "https://images.unsplash.com/photo-1742891601435-39de27531cc7?w=800",
    ],
    variants: [
      { size: "S", color: "Ivory", price: 32000, stock: 1 },
      { size: "M", color: "Ivory", price: 32000, stock: 1 },
    ],
  },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {},
    create: {
      name: "Admin",
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Keep the seed safe to rerun while removing the old apparel catalogue from
  // the storefront without deleting products referenced by historical orders.
  await prisma.product.updateMany({ where: { status: "ACTIVE" }, data: { status: "ARCHIVED" } });

  const vapeCategories = Object.fromEntries(
    await Promise.all(
      VAPE_CATEGORIES.map(async (category) => [
        category.slug,
        await prisma.category.upsert({
          where: { slug: category.slug },
          update: { name: category.name, sortOrder: category.sortOrder, isActive: true },
          create: category,
        }),
      ]),
    ),
  ) as Record<string, { id: string }>;

  for (const seedProduct of VAPE_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: seedProduct.slug },
      update: {
        title: seedProduct.title,
        description: seedProduct.description,
        basePrice: seedProduct.basePrice,
        status: "ACTIVE",
        type: seedProduct.type,
        fabricTags: seedProduct.tags,
        productKind: "VAPE",
        flavour: seedProduct.flavour,
        nicotineStrength: seedProduct.nicotineStrength,
        deviceType: seedProduct.deviceType,
        capacity: seedProduct.capacity,
        puffCount: seedProduct.puffCount,
        batteryCapacity: seedProduct.batteryCapacity,
        categoryId: vapeCategories[seedProduct.categorySlug].id,
      },
      create: {
        title: seedProduct.title,
        slug: seedProduct.slug,
        description: seedProduct.description,
        basePrice: seedProduct.basePrice,
        status: "ACTIVE",
        type: seedProduct.type,
        isFeatured: true,
        fabricTags: seedProduct.tags,
        productKind: "VAPE",
        flavour: seedProduct.flavour,
        nicotineStrength: seedProduct.nicotineStrength,
        deviceType: seedProduct.deviceType,
        capacity: seedProduct.capacity,
        puffCount: seedProduct.puffCount,
        batteryCapacity: seedProduct.batteryCapacity,
        categoryId: vapeCategories[seedProduct.categorySlug].id,
        images: {
          create: [{ url: seedProduct.image, altText: seedProduct.title, isPrimary: true, sortOrder: 0 }],
        },
        variants: {
          create: seedProduct.variants.map((variant, index) => ({
            sku: `${seedProduct.slug.toUpperCase()}-${index + 1}`,
            size: variant.size,
            color: variant.colour,
            variantPrice: seedProduct.basePrice,
            stockQuantity: variant.stock,
          })),
        },
      },
    });
    console.log("Seeded vape product:", product.title);
  }

  const categories = {
    unstitched: await prisma.category.upsert({
      where: { slug: "unstitched" },
      update: {},
      create: { name: "Unstitched", slug: "unstitched", sortOrder: 1 },
    }),
    stitched: await prisma.category.upsert({
      where: { slug: "stitched" },
      update: {},
      create: { name: "Stitched", slug: "stitched", sortOrder: 2 },
    }),
    "boutique-exclusive": await prisma.category.upsert({
      where: { slug: "boutique-exclusive" },
      update: {},
      create: { name: "Boutique Exclusive", slug: "boutique-exclusive", sortOrder: 3 },
    }),
  };

  // Legacy apparel seed retained for reference but intentionally disabled.
  if (false) for (const seedProduct of SEED_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: seedProduct.slug },
      update: {},
      create: {
        title: seedProduct.title,
        slug: seedProduct.slug,
        description: seedProduct.description,
        fabricDetails: seedProduct.fabricDetails,
        careInstructions: seedProduct.careInstructions,
        basePrice: seedProduct.basePrice,
        status: "ACTIVE",
        type: seedProduct.type,
        isFeatured: seedProduct.isFeatured,
        fabricTags: seedProduct.fabricTags,
        categoryId: categories[seedProduct.categorySlug].id,
        images: {
          create: seedProduct.images.map((url, idx) => ({
            url,
            altText: `${seedProduct.title} — image ${idx + 1}`,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
        variants: {
          create: seedProduct.variants.map((v, idx) => ({
            sku: `${seedProduct.slug.toUpperCase()}-${v.size}-${idx + 1}`,
            size: v.size,
            color: v.color,
            variantPrice: v.price,
            stockQuantity: v.stock,
          })),
        },
      },
    });
    console.log("Seeded product:", product.title);
  }

  await prisma.shippingRate.upsert({
    where: { city: "Karachi" },
    update: {},
    create: { city: "Karachi", fee: 200, etaDays: 2 },
  });
  await prisma.shippingRate.upsert({
    where: { city: "Lahore" },
    update: {},
    create: { city: "Lahore", fee: 250, etaDays: 3 },
  });
  await prisma.shippingRate.upsert({
    where: { city: "Hyderabad" },
    update: {},
    create: { city: "Hyderabad", fee: 200, etaDays: 2 },
  });

  await prisma.siteContent.upsert({
    where: { key: "header" },
    update: {
      data: {
        navLinks: [
          { label: "Home", href: "/" },
          { label: "Shop", href: "/collections/new-prefilled-kits" },
          { label: "Vape Kits", href: "/collections/vaping-kits" },
          { label: "E-Liquids", href: "/collections/e-liquids" },
          { label: "Prefilled Kits", href: "/collections/disposable-vape-alternatives" },
          { label: "Deals", href: "/vape-deals" },
          { label: "Blogs", href: "/blogs/news" },
          { label: "Track Order", href: "/track-order" },
        ],
      },
    },
    create: {
      key: "header",
      data: {
        navLinks: [
          { label: "Home", href: "/" },
          { label: "Shop", href: "/collections/new-prefilled-kits" },
          { label: "Vape Kits", href: "/collections/vaping-kits" },
          { label: "E-Liquids", href: "/collections/e-liquids" },
          { label: "Prefilled Kits", href: "/collections/disposable-vape-alternatives" },
          { label: "Deals", href: "/vape-deals" },
          { label: "Blogs", href: "/blogs/news" },
          { label: "Track Order", href: "/track-order" },
        ],
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { key: "footer" },
    update: {
      data: {
        tagline: "Your local-feel UK vape store online: kits, e-liquids, pods, coils, accessories and value bundles.",
        phone: "+44 7443 176197",
        email: "hello@ecosmok.co.uk",
        address: "United Kingdom",
        columns: [
          { title: "Shop", links: [{ label: "Vape Kits", href: "/collections/vaping-kits" }, { label: "E-Liquids", href: "/collections/e-liquids" }, { label: "Pods & Coils", href: "/collections/pods-coils" }, { label: "Accessories", href: "/collections/accessories" }] },
          { title: "Support", links: [{ label: "Customer Support", href: "/contact" }, { label: "Age Verification", href: "/age-verification" }, { label: "Track Order", href: "/track-order" }, { label: "FAQs", href: "/faq" }] },
          { title: "Learn", links: [{ label: "Blogs", href: "/blogs/news" }, { label: "Vaping Knowledge", href: "/vaping-knowledge" }, { label: "Vape Deals", href: "/vape-deals" }, { label: "About Us", href: "/about" }] },
        ],
        copyrightText: "EcoSmok. All rights reserved. 18+ only. Vape responsibly.",
      },
    },
    create: {
      key: "footer",
      data: {
        tagline: "Your local-feel UK vape store online: kits, e-liquids, pods, coils, accessories and value bundles.",
        phone: "+44 7443 176197",
        email: "hello@ecosmok.co.uk",
        address: "United Kingdom",
        columns: [],
        copyrightText: "EcoSmok. All rights reserved. 18+ only. Vape responsibly.",
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { key: "homepage" },
    update: {
      data: {
        heroSlides: [
          { imageUrl: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600", heading: "Vape Kits & Pod Systems", subheading: "Trusted devices from Vaporesso, OXVA, Uwell and more.", ctaText: "Shop Vape Kits", ctaLink: "/collections/vaping-kits" },
          { imageUrl: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=1600", heading: "Prefilled Kits & Big Puffs", subheading: "Easy, satisfying vaping from leading UK brands.", ctaText: "Shop Prefilled Kits", ctaLink: "/collections/disposable-vape-alternatives" },
          { imageUrl: "https://images.unsplash.com/photo-1519666213639-7e4a7a4a1b11?w=1600", heading: "Premium E-Liquids", subheading: "Nic salts, shortfills and 50/50 blends in every flavour.", ctaText: "Shop E-Liquids", ctaLink: "/collections/e-liquids" },
        ],
        fabricTiles: [
          { name: "Nic Salts", imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", link: "/collections/nic-salts" },
          { name: "Prefilled Kits", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600", link: "/collections/prefilled-pods" },
          { name: "Vape Kits", imageUrl: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=600", link: "/collections/vaping-kits" },
          { name: "Pods & Coils", imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600", link: "/collections/pods-coils" },
        ],
        promoBanner: { text: "Free UK delivery available | Subscribe and get 10% off your first order", link: "/vape-deals", isActive: true },
        featuredCollectionTitle: "Vape Kit Bundles",
      },
    },
    create: {
      key: "homepage",
      data: {
        heroSlides: [],
        fabricTiles: [],
        promoBanner: { text: "Free UK delivery available | Subscribe and get 10% off your first order", link: "/vape-deals", isActive: true },
        featuredCollectionTitle: "Vape Kit Bundles",
      },
    },
  });

  console.log(`\nAdmin login → email: ${DEFAULT_ADMIN_EMAIL}  password: ${DEFAULT_ADMIN_PASSWORD}`);
  console.log("Change this password after first login in a real deployment.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

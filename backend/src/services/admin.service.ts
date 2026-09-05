import { prisma } from "../config/db";
import { OrderStatus, ProductType, SizeLabel } from "../types";

// -------------------------------------------------------------------------
// Categories
// -------------------------------------------------------------------------

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { children: true },
  });
}

export async function createCategory(name: string, parentId?: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return prisma.category.create({ data: { name, slug, parentId } });
}

// -------------------------------------------------------------------------
// Products (admin sees every status; storefront only sees ACTIVE)
// -------------------------------------------------------------------------

export interface AdminVariantInput {
  sku?: string;
  size: SizeLabel;
  color: string;
  fabricOption?: string;
  variantPrice: number;
  stockQuantity: number;
}

export interface AdminImageInput {
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface AdminProductInput {
  title: string;
  slug?: string;
  description: string;
  fabricDetails?: string;
  careInstructions?: string;
  basePrice: number;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";
  type: ProductType;
  isFeatured: boolean;
  fabricTags: string[];
  productKind?: string;
  nicotineStrength?: string;
  flavour?: string;
  deviceType?: string;
  capacity?: string;
  puffCount?: number;
  batteryCapacity?: string;
  coilResistance?: string;
  pgVgRatio?: string;
  isNicotineFree?: boolean;
  ageRestricted?: boolean;
  categoryId: string;
  images: AdminImageInput[];
  variants: AdminVariantInput[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(input: AdminProductInput) {
  if (!input.variants?.length) {
    throw new Error("At least one variant (size, color, price, stock) is required.");
  }
  if (!input.images?.length) {
    throw new Error("At least one product image is required.");
  }

  const baseSlug = input.slug ? slugify(input.slug) : slugify(input.title);
  // Ensure slug uniqueness by appending a short suffix if it already exists.
  const existing = await prisma.product.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

  const skuBase = baseSlug.toUpperCase().slice(0, 12);

  return prisma.product.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      fabricDetails: input.fabricDetails,
      careInstructions: input.careInstructions,
      basePrice: input.basePrice,
      status: input.status ?? "ACTIVE",
      type: input.type,
      isFeatured: input.isFeatured,
      fabricTags: input.fabricTags,
      productKind: input.productKind ?? "VAPE",
      nicotineStrength: input.nicotineStrength,
      flavour: input.flavour,
      deviceType: input.deviceType,
      capacity: input.capacity,
      puffCount: input.puffCount,
      batteryCapacity: input.batteryCapacity,
      coilResistance: input.coilResistance,
      pgVgRatio: input.pgVgRatio,
      isNicotineFree: input.isNicotineFree ?? false,
      ageRestricted: input.ageRestricted ?? true,
      categoryId: input.categoryId,
      images: {
        create: input.images.map((img, idx) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary ?? idx === 0,
          sortOrder: idx,
        })),
      },
      variants: {
        create: input.variants.map((v, idx) => ({
          sku: v.sku ?? `${skuBase}-${v.size}-${idx + 1}`,
          size: v.size,
          color: v.color,
          fabricOption: v.fabricOption,
          variantPrice: v.variantPrice,
          stockQuantity: v.stockQuantity,
        })),
      },
    },
    include: { images: true, variants: true },
  });
}

export async function getProductByIdAdmin(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { orderBy: { sortOrder: "asc" } }, variants: true },
  });
  if (!product) return null;

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    fabricDetails: product.fabricDetails,
    careInstructions: product.careInstructions,
    basePrice: Number(product.basePrice),
    status: product.status,
    type: product.type,
    isFeatured: product.isFeatured,
    fabricTags: product.fabricTags,
    productKind: product.productKind,
    nicotineStrength: product.nicotineStrength,
    flavour: product.flavour,
    deviceType: product.deviceType,
    capacity: product.capacity,
    puffCount: product.puffCount,
    batteryCapacity: product.batteryCapacity,
    coilResistance: product.coilResistance,
    pgVgRatio: product.pgVgRatio,
    isNicotineFree: product.isNicotineFree,
    ageRestricted: product.ageRestricted,
    categoryId: product.categoryId,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      fabricOption: v.fabricOption,
      variantPrice: Number(v.variantPrice),
      stockQuantity: v.stockQuantity,
    })),
  };
}

/**
 * Full product edit: updates scalar fields, replaces the image set, and
 * reconciles variants (update existing by id, create new ones without an
 * id, delete ones present in DB but missing from the submitted list).
 */
export async function updateProduct(productId: string, input: Omit<AdminProductInput, "variants"> & {
  variants: (AdminVariantInput & { id?: string })[];
}) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        title: input.title,
        description: input.description,
        fabricDetails: input.fabricDetails,
        careInstructions: input.careInstructions,
        basePrice: input.basePrice,
        status: input.status ?? "ACTIVE",
        type: input.type,
        isFeatured: input.isFeatured,
        fabricTags: input.fabricTags,
        productKind: input.productKind ?? "VAPE",
        nicotineStrength: input.nicotineStrength,
        flavour: input.flavour,
        deviceType: input.deviceType,
        capacity: input.capacity,
        puffCount: input.puffCount,
        batteryCapacity: input.batteryCapacity,
        coilResistance: input.coilResistance,
        pgVgRatio: input.pgVgRatio,
        isNicotineFree: input.isNicotineFree ?? false,
        ageRestricted: input.ageRestricted ?? true,
        categoryId: input.categoryId,
      },
    });

    // --- Images: simplest correct approach is replace-all ---------------
    await tx.productImage.deleteMany({ where: { productId } });
    await tx.productImage.createMany({
      data: input.images.map((img, idx) => ({
        productId,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary ?? idx === 0,
        sortOrder: idx,
      })),
    });

    // --- Variants: reconcile by id --------------------------------------
    const existingVariants = await tx.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });
    const existingIds = new Set(existingVariants.map((v) => v.id));
    const submittedIds = new Set(input.variants.filter((v) => v.id).map((v) => v.id));

    const toDelete = [...existingIds].filter((id) => !submittedIds.has(id));
    if (toDelete.length) {
      await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
    }

    const skuBase = updated.slug.toUpperCase().slice(0, 12);
    for (const [idx, v] of input.variants.entries()) {
      if (v.id && existingIds.has(v.id)) {
        await tx.productVariant.update({
          where: { id: v.id },
          data: {
            size: v.size,
            color: v.color,
            fabricOption: v.fabricOption,
            variantPrice: v.variantPrice,
            stockQuantity: v.stockQuantity,
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId,
            sku: v.sku ?? `${skuBase}-${v.size}-${idx + 1}-${Date.now().toString(36).slice(-4)}`,
            size: v.size,
            color: v.color,
            fabricOption: v.fabricOption,
            variantPrice: v.variantPrice,
            stockQuantity: v.stockQuantity,
          },
        });
      }
    }

    return updated;
  });
}

export async function listProductsAdmin(page = 1, pageSize = 20) {
  const [totalItems, products] = await prisma.$transaction([
    prisma.product.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return {
    data: products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      basePrice: Number(p.basePrice),
      categoryName: p.category.name,
      imageUrl: p.images[0]?.url ?? null,
      totalStock: p.variants.reduce((sum, v) => sum + v.stockQuantity, 0),
      variants: p.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        variantPrice: Number(v.variantPrice),
        stockQuantity: v.stockQuantity,
      })),
    })),
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize) || 1,
  };
}

export async function updateVariantStock(
  variantId: string,
  stockQuantity: number,
  variantPrice?: number,
) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      stockQuantity,
      ...(variantPrice != null ? { variantPrice } : {}),
    },
  });
}

export async function deleteProduct(productId: string) {
  return prisma.product.delete({ where: { id: productId } });
}

// -------------------------------------------------------------------------
// Dashboard KPIs
// -------------------------------------------------------------------------

export async function getDashboardStats() {
  const [orderAgg, orderCount, statusBreakdown, lowStockVariants] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.productVariant.count({ where: { isActive: true, stockQuantity: { lte: 5 } } }),
  ]);

  const totalRevenue = Number(orderAgg._sum.totalAmount ?? 0);
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" }, createdAt: { gte: thirtyDaysAgo } },
    select: { totalAmount: true },
  });

  return {
    totalRevenue,
    totalOrders: orderCount,
    averageOrderValue,
    revenueLast30Days: recentOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
    ordersLast30Days: recentOrders.length,
    lowStockVariants,
    statusBreakdown: statusBreakdown.map((s) => ({ status: s.status, count: s._count.status })),
  };
}

// -------------------------------------------------------------------------
// Orders
// -------------------------------------------------------------------------

export async function listOrdersAdmin(page = 1, pageSize = 20, status?: OrderStatus) {
  const where = status ? { status } : {};

  const [totalItems, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { items: true },
    }),
  ]);

  return {
    data: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      shippingCity: o.shippingCity,
      createdAt: o.createdAt,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    })),
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize) || 1,
  };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.order.update({ where: { id: orderId }, data: { status } });
}

// -------------------------------------------------------------------------
// Shipping rate matrix
// -------------------------------------------------------------------------

export async function listShippingRates() {
  return prisma.shippingRate.findMany({ orderBy: { city: "asc" } });
}

export async function upsertShippingRate(city: string, fee: number, etaDays: number) {
  return prisma.shippingRate.upsert({
    where: { city },
    update: { fee, etaDays },
    create: { city, fee, etaDays },
  });
}

// -------------------------------------------------------------------------
// Homepage content (admin-managed hero slider, category tiles, promo banner)
// -------------------------------------------------------------------------

const HOMEPAGE_KEY = "homepage";

export interface HeroSlide {
  imageUrl: string;
  heading: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface FabricTile {
  name: string;
  imageUrl: string;
  link: string;
}

export interface HomepageContent {
  heroSlides: HeroSlide[];
  fabricTiles: FabricTile[];
  promoBanner?: { text: string; link?: string; isActive: boolean };
  featuredCollectionTitle?: string;
}

const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroSlides: [
    {
      imageUrl: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600",
      heading: "Vape Kits & Pod Systems",
      subheading: "Trusted devices from Vaporesso, OXVA, Uwell and more.",
      ctaText: "Shop Vape Kits",
      ctaLink: "/collections/vaping-kits",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=1600",
      heading: "Prefilled Kits & Big Puffs",
      subheading: "Easy, satisfying vaping from leading UK brands.",
      ctaText: "Shop Prefilled Kits",
      ctaLink: "/collections/disposable-vape-alternatives",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1519666213639-7e4a7a4a1b11?w=1600",
      heading: "Premium E-Liquids",
      subheading: "Nic salts, shortfills and 50/50 blends in every flavour.",
      ctaText: "Shop E-Liquids",
      ctaLink: "/collections/e-liquids",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=1600",
      heading: "Bundle Deals",
      subheading: "More value with curated vape kits, pods and e-liquid bundles.",
      ctaText: "View Vape Deals",
      ctaLink: "/pages/vape-deals",
    },
  ],
  fabricTiles: [
    { name: "Nic Salts", imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", link: "/collections/nic-salts" },
    { name: "Prefilled Kits", imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600", link: "/collections/prefilled-pods" },
    { name: "Vape Kits", imageUrl: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=600", link: "/collections/vaping-kits" },
    { name: "Pods & Coils", imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600", link: "/collections/pods-coils" },
  ],
  promoBanner: { text: "Free UK delivery available | Subscribe and get 10% off your first order", link: "/pages/vape-deals", isActive: true },
  featuredCollectionTitle: "Vape Kit Bundles",
};

async function getContentByKey<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.siteContent.findUnique({ where: { key } });
  return (row?.data as unknown as T) ?? fallback;
}

async function updateContentByKey<T>(key: string, data: T): Promise<T> {
  const row = await prisma.siteContent.upsert({
    where: { key },
    update: { data: data as object },
    create: { key, data: data as object },
  });
  return row.data as unknown as T;
}

export async function getHomepageContent(): Promise<HomepageContent> {
  return getContentByKey(HOMEPAGE_KEY, DEFAULT_HOMEPAGE_CONTENT);
}

export async function updateHomepageContent(content: HomepageContent) {
  return updateContentByKey(HOMEPAGE_KEY, content);
}

// -------------------------------------------------------------------------
// About page content (admin-managed)
// -------------------------------------------------------------------------

export interface AboutValue {
  title: string;
  description: string;
}

export interface AboutContent {
  heroImageUrl: string;
  heroSubheading: string;
  heading: string;
  paragraphs: string[];
  storyImageUrl: string;
  values: AboutValue[];
  galleryImages: string[];
}

const DEFAULT_ABOUT_CONTENT: AboutContent = {
  heroImageUrl: "https://images.unsplash.com/photo-1753162657535-0710ef1888df?w=1800",
  heroSubheading: "Elevated stitched & unstitched apparel, made with intention.",
  heading: "About Us",
  paragraphs: [
    "We curate boutique stitched and unstitched apparel, working with skilled artisans and fine fabrics — Lawn, Chiffon, Organza, and Velvet — to bring you considered, elevated pieces for everyday wear and special occasions.",
    "Every order is quality-checked before dispatch, and our styling desk (say hello to Aanya, our AI stylist, in the bottom-right corner) is always on hand to help you find the right piece.",
  ],
  storyImageUrl: "https://images.unsplash.com/photo-1753164597544-a2736833357e?w=1200",
  values: [
    {
      title: "Handpicked Fabrics",
      description: "Every bolt of Lawn, Chiffon, Organza, and Velvet is sourced and inspected before it reaches the cutting table.",
    },
    {
      title: "Artisan Craftsmanship",
      description: "Hand-embroidery and finishing work is done by skilled karigars we've worked with for years.",
    },
    {
      title: "Quality Checked",
      description: "Every piece is inspected for stitching, fit, and finish before it's packed for dispatch.",
    },
    {
      title: "Nationwide Delivery",
      description: "From Karachi to every corner of the country, tracked and on time.",
    },
  ],
  galleryImages: [
    "https://images.unsplash.com/photo-1622461962346-a4d6c6ffade5?w=800",
    "https://images.unsplash.com/photo-1753162658216-13e9cb395982?w=800",
    "https://images.unsplash.com/photo-1753162658596-2ccba5e4246a?w=800",
    "https://images.unsplash.com/photo-1761090617068-f1b3257d27ad?w=800",
  ],
};

export const getAboutContent = () => getContentByKey("about", DEFAULT_ABOUT_CONTENT);
export const updateAboutContent = (content: AboutContent) => updateContentByKey("about", content);

// -------------------------------------------------------------------------
// Contact page content (admin-managed)
// -------------------------------------------------------------------------

export interface ContactContent {
  heading: string;
  intro: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  imageUrl: string;
}

const DEFAULT_CONTACT_CONTENT: ContactContent = {
  heading: "Need help choosing a vape?",
  intro:
    "Our UK support team can help with orders, device compatibility, flavours and getting started.",
  phone: "+44 7443 176197",
  email: "hello@ecosmok.co.uk",
  address: "United Kingdom",
  hours: "Mon – Fri, 9am – 5pm",
  imageUrl: "https://images.unsplash.com/photo-1759893362613-8bb8bb057af1?w=1200",
};

export const getContactContent = () => getContentByKey("contact", DEFAULT_CONTACT_CONTENT);
export const updateContactContent = (content: ContactContent) => updateContentByKey("contact", content);

// -------------------------------------------------------------------------
// Footer content (admin-managed)
// -------------------------------------------------------------------------

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  tagline: string;
  phone: string;
  email: string;
  address: string;
  instagramUrl?: string;
  facebookUrl?: string;
  columns: FooterColumn[];
  copyrightText: string;
}

const DEFAULT_FOOTER_CONTENT: FooterContent = {
  tagline:
    "Your local-feel UK vape store online: kits, e-liquids, pods, coils, accessories and value bundles.",
  phone: "+44 7443 176197",
  email: "hello@ecosmok.co.uk",
  address: "United Kingdom",
  instagramUrl: "",
  facebookUrl: "",
  columns: [
    {
      title: "Shop",
      links: [
        { label: "Nic Salts", href: "/collections/nic-salts" },
        { label: "Prefilled Kits", href: "/collections/disposable-vape-alternatives" },
        { label: "Prefilled Pods", href: "/collections/prefilled-pods" },
        { label: "Vape Kits", href: "/collections/vaping-kits" },
        { label: "E-Liquids", href: "/collections/e-liquids" },
        { label: "Pods & Coils", href: "/collections/pods-coils" },
        { label: "Accessories", href: "/collections/accessories" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { label: "Track Order", href: "/track-order" },
        { label: "Customer Support", href: "/contact" },
        { label: "Age Verification", href: "/age-verification" },
        { label: "Returns & Exchanges", href: "/returns" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Blogs", href: "/blogs/news" },
        { label: "Vaping FAQs", href: "/faq" },
        { label: "Vaping Knowledge", href: "/vaping-knowledge" },
        { label: "Brands", href: "/brands" },
        { label: "About Us", href: "/about" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ],
  copyrightText: "EcoSmok. All rights reserved. 18+ only. Vape responsibly.",
};

export const getFooterContent = () => getContentByKey("footer", DEFAULT_FOOTER_CONTENT);
export const updateFooterContent = (content: FooterContent) => updateContentByKey("footer", content);

// -------------------------------------------------------------------------
// Header nav content (admin-managed)
// -------------------------------------------------------------------------

export interface HeaderNavLink {
  label: string;
  href: string;
}

export interface HeaderContent {
  navLinks: HeaderNavLink[];
}

const DEFAULT_HEADER_CONTENT: HeaderContent = {
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/collections/new-prefilled-kits" },
    { label: "Vape Kits", href: "/collections/vaping-kits" },
    { label: "E-Liquids", href: "/collections/e-liquids" },
    { label: "Prefilled Kits", href: "/collections/disposable-vape-alternatives" },
    { label: "Deals", href: "/pages/vape-deals" },
    { label: "Blogs", href: "/blogs/news" },
    { label: "Track Order", href: "/track-order" },
  ],
};

export const getHeaderContent = () => getContentByKey("header", DEFAULT_HEADER_CONTENT);
export const updateHeaderContent = (content: HeaderContent) => updateContentByKey("header", content);

// -------------------------------------------------------------------------
// Policy pages (admin-managed): Privacy Policy, Terms of Service,
// Returns & Exchanges — all share the same heading/intro/sections shape.
// -------------------------------------------------------------------------

export interface PolicySection {
  heading: string;
  body: string;
}

export interface PolicyContent {
  heading: string;
  intro: string;
  sections: PolicySection[];
}

const DEFAULT_PRIVACY_CONTENT: PolicyContent = {
  heading: "Privacy Policy",
  intro:
    "We respect your privacy. This page explains what information we collect when you shop with us and how it's used.",
  sections: [
    {
      heading: "Information We Collect",
      body: "When you place an order or create an account, we collect your name, phone number, email, shipping address, and order details. We do not store your payment card details on our servers.",
    },
    {
      heading: "How We Use Your Information",
      body: "Your information is used to process orders, arrange delivery, send order updates, and respond to customer service requests. We do not sell your personal information to third parties.",
    },
    {
      heading: "Cookies",
      body: "We use cookies to keep your cart and session working correctly across pages. You can disable cookies in your browser, but some site features may not work as expected.",
    },
    {
      heading: "Contact Us",
      body: "If you have questions about how your data is handled, reach out via our Contact page and we'll be happy to help.",
    },
  ],
};

const DEFAULT_TERMS_CONTENT: PolicyContent = {
  heading: "Terms of Service",
  intro: "By placing an order with us, you agree to the following terms.",
  sections: [
    {
      heading: "Orders & Payment",
      body: "All prices are listed in PKR and are subject to change without notice. Orders are confirmed once payment is received or, for Cash on Delivery orders, once the order is placed.",
    },
    {
      heading: "Product Accuracy",
      body: "We make every effort to display our products' colors and details as accurately as possible. Slight variation in fabric color may occur due to screen settings and dye lots.",
    },
    {
      heading: "Shipping",
      body: "Delivery timelines are estimates and may vary based on your city and courier availability. See our Size Guide and Returns page for more on order handling.",
    },
    {
      heading: "Limitation of Liability",
      body: "We are not liable for delays or issues caused by circumstances beyond our reasonable control, including courier delays or incorrect shipping information provided at checkout.",
    },
  ],
};

const DEFAULT_RETURNS_CONTENT: PolicyContent = {
  heading: "Returns & Exchanges",
  intro:
    "We want you to love what you ordered. If something isn't right, here's how returns and exchanges work.",
  sections: [
    {
      heading: "Return Window",
      body: "Unworn, unwashed items with tags attached can be returned within 7 days of delivery for store credit or exchange.",
    },
    {
      heading: "Non-Returnable Items",
      body: "Unstitched fabric that has been cut, and made-to-order or boutique-exclusive pieces, cannot be returned unless the item arrived damaged or defective.",
    },
    {
      heading: "How to Start a Return",
      body: "Contact us via the Contact page with your order number and reason for return. Our team will confirm pickup or drop-off details.",
    },
    {
      heading: "Refunds",
      body: "Approved returns are processed as store credit within 5-7 business days. Cash refunds are only issued for orders paid online, minus any shipping fees already incurred.",
    },
  ],
};

export const getPrivacyContent = () => getContentByKey("privacy", DEFAULT_PRIVACY_CONTENT);
export const updatePrivacyContent = (content: PolicyContent) => updateContentByKey("privacy", content);

export const getTermsContent = () => getContentByKey("terms", DEFAULT_TERMS_CONTENT);
export const updateTermsContent = (content: PolicyContent) => updateContentByKey("terms", content);

export const getReturnsContent = () => getContentByKey("returns", DEFAULT_RETURNS_CONTENT);
export const updateReturnsContent = (content: PolicyContent) => updateContentByKey("returns", content);

// -------------------------------------------------------------------------
// Size Guide (admin-managed): intro/sections plus a measurement chart.
// -------------------------------------------------------------------------

export interface SizeChartRow {
  size: string;
  chest: string;
  waist: string;
  hips: string;
  length: string;
}

export interface SizeGuideContent {
  heading: string;
  intro: string;
  sizeChart: SizeChartRow[];
  sections: PolicySection[];
}

const DEFAULT_SIZE_GUIDE_CONTENT: SizeGuideContent = {
  heading: "Size Guide",
  intro: "All measurements are in inches. If you're between sizes, we recommend sizing up for a relaxed fit.",
  sizeChart: [
    { size: "S", chest: "36", waist: "30", hips: "38", length: "40" },
    { size: "M", chest: "38", waist: "32", hips: "40", length: "41" },
    { size: "L", chest: "40", waist: "34", hips: "42", length: "42" },
    { size: "XL", chest: "42", waist: "36", hips: "44", length: "43" },
  ],
  sections: [
    {
      heading: "How to Measure",
      body: "Chest: measure around the fullest part of your chest. Waist: measure around your natural waistline. Hips: measure around the fullest part of your hips. Length: measure from shoulder to hem.",
    },
    {
      heading: "Custom Sizing",
      body: "Ordering an unstitched suit and want it tailored to your exact measurements? Mention it in your order notes at checkout or reach out via our Contact page.",
    },
  ],
};

export const getSizeGuideContent = () => getContentByKey("size-guide", DEFAULT_SIZE_GUIDE_CONTENT);
export const updateSizeGuideContent = (content: SizeGuideContent) =>
  updateContentByKey("size-guide", content);

import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import {
  PaginatedResult,
  ProductDTO,
  ProductQueryFilters,
} from "../types";

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

/**
 * Builds a Prisma `where` clause from the public-facing filter object.
 * Kept isolated from the controller so unit tests can exercise filter
 * logic without spinning up an HTTP layer.
 */
function buildWhereClause(filters: ProductQueryFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (filters.categorySlug) {
    where.category = {
      OR: [
        { slug: filters.categorySlug },
        { parent: { slug: filters.categorySlug } },
      ],
    };
  }

  if (filters.subcategorySlug) {
    where.category = { slug: filters.subcategorySlug };
  }

  if (filters.fabric?.length) {
    where.fabricTags = { hasSome: filters.fabric };
  }

  if (filters.type?.length) {
    where.type = { in: filters.type };
  }

  if (filters.size?.length) {
    where.variants = {
      some: { size: { in: filters.size }, isActive: true, stockQuantity: { gt: 0 } },
    };
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.basePrice = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { fabricTags: { hasSome: [filters.search] } },
    ];
  }

  return where;
}

function buildOrderBy(
  sortBy: ProductQueryFilters["sortBy"],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sortBy) {
    case "price_asc":
      return [{ basePrice: "asc" }];
    case "price_desc":
      return [{ basePrice: "desc" }];
    case "featured":
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
    case "best_selling":
      // Proxy for best-selling: highest order-item count. A dedicated
      // materialized view (`product_sales_stats`) is recommended at scale.
      return [{ orderItems: { _count: "desc" } }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

function toProductDTO(
  product: Prisma.ProductGetPayload<{
    include: { images: true; variants: true; reviews: { select: { rating: true } } };
  }>,
): ProductDTO {
  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : undefined;

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
    images: product.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      fabricOption: v.fabricOption,
      variantPrice: Number(v.variantPrice),
      stockQuantity: v.stockQuantity,
      isActive: v.isActive,
    })),
    averageRating,
    reviewCount,
  };
}

export async function queryProducts(
  filters: ProductQueryFilters,
): Promise<PaginatedResult<ProductDTO>> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, filters.pageSize ?? DEFAULT_PAGE_SIZE);

  const where = buildWhereClause(filters);
  const orderBy = buildOrderBy(filters.sortBy);

  const [totalItems, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: true,
        variants: true,
        reviews: { select: { rating: true } },
      },
    }),
  ]);

  return {
    data: products.map(toProductDTO),
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize) || 1,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: true,
      variants: true,
      reviews: { select: { rating: true } },
    },
  });

  return product ? toProductDTO(product) : null;
}

/**
 * Returns live stock + resolved price for a specific variant selection.
 * Used by the PDP variant selector to instantly reflect availability.
 */
export async function getVariantAvailability(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant || !variant.isActive) {
    return { available: false, stockQuantity: 0, price: null };
  }

  return {
    available: variant.stockQuantity > 0,
    stockQuantity: variant.stockQuantity,
    price: Number(variant.variantPrice),
  };
}

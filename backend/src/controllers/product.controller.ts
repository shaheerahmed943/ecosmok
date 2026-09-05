import { Request, Response, NextFunction } from "express";
import {
  getProductBySlug,
  getVariantAvailability,
  queryProducts,
} from "../services/product.service";
import { ProductQueryFilters, SizeLabel, ProductType } from "../types";

const VALID_SIZES: SizeLabel[] = ["XS", "S", "M", "L", "XL", "XXL", "CUSTOM"];
const VALID_TYPES: ProductType[] = [
  "STITCHED",
  "UNSTITCHED",
  "READY_TO_WEAR",
  "BOUTIQUE_EXCLUSIVE",
];

function parseCsvParam<T extends string>(value: unknown, allowed: readonly T[]): T[] | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  const parts = value.split(",").filter((v): v is T => allowed.includes(v as T));
  return parts.length ? parts : undefined;
}

function parseNumberParam(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * GET /api/products
 * Query params: category, subcategory, fabric, type, size, minPrice,
 * maxPrice, search, sortBy, page, pageSize
 */
export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: ProductQueryFilters = {
      categorySlug: typeof req.query.category === "string" ? req.query.category : undefined,
      subcategorySlug:
        typeof req.query.subcategory === "string" ? req.query.subcategory : undefined,
      fabric: parseCsvParam(req.query.fabric, [] as string[]) ??
        (typeof req.query.fabric === "string" ? req.query.fabric.split(",") : undefined),
      type: parseCsvParam(req.query.type, VALID_TYPES),
      size: parseCsvParam(req.query.size, VALID_SIZES),
      minPrice: parseNumberParam(req.query.minPrice),
      maxPrice: parseNumberParam(req.query.maxPrice),
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      sortBy: (req.query.sortBy as ProductQueryFilters["sortBy"]) ?? "newest",
      page: parseNumberParam(req.query.page) ?? 1,
      pageSize: parseNumberParam(req.query.pageSize) ?? 24,
    };

    const result = await queryProducts(filters);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:slug
 */
export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/variants/:variantId/availability
 * Backs the instant price/stock update on variant selection in the PDP.
 */
export async function checkVariantAvailability(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const availability = await getVariantAvailability(req.params.variantId);
    res.status(200).json(availability);
  } catch (err) {
    next(err);
  }
}

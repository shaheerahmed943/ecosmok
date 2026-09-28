import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { prisma } from "../config/db";

type CsvRow = Record<string, string>;

function rowsFrom(file: Express.Multer.File | undefined): CsvRow[] {
  if (!file) throw new Error("Please choose a CSV file.");
  const rows = parse(file.buffer.toString("utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as CsvRow[];
  if (!rows.length) throw new Error("The CSV file has no data rows.");
  return rows;
}

function required(row: CsvRow, key: string, rowNumber: number) {
  const value = row[key]?.trim();
  if (!value) throw new Error(`Row ${rowNumber}: ${key} is required.`);
  return value;
}

function booleanValue(value: string | undefined, fallback = false) {
  if (!value) return fallback;
  return ["true", "1", "yes", "y"].includes(value.toLowerCase());
}

function numberValue(row: CsvRow, key: string, rowNumber: number) {
  const value = Number(required(row, key, rowNumber));
  if (!Number.isFinite(value)) throw new Error(`Row ${rowNumber}: ${key} must be a number.`);
  return value;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function firstValue(row: CsvRow, ...keys: string[]) {
  return keys.map((key) => row[key]?.trim()).find(Boolean) || "";
}

function productType(value: string) {
  const normalized = value.toUpperCase().replace(/[ -]+/g, "_");
  const allowed = ["STITCHED", "UNSTITCHED", "READY_TO_WEAR", "BOUTIQUE_EXCLUSIVE", "DISPOSABLE", "POD_SYSTEM", "E_LIQUID", "HARDWARE", "ACCESSORY"];
  return (allowed.includes(normalized) ? normalized : "UNSTITCHED") as never;
}

function productStatus(value: string) {
  const normalized = value.toUpperCase().replace(/[ -]+/g, "_");
  const allowed = ["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"];
  return (allowed.includes(normalized) ? normalized : "ACTIVE") as never;
}

function sizeValue(value: string) {
  const normalized = value.toUpperCase().replace(/[ -]+/g, "_");
  const allowed = ["XS", "S", "M", "L", "XL", "XXL", "CUSTOM", "STANDARD", "TWO_ML", "TEN_ML", "THIRTY_ML", "FIFTY_ML", "ONE_HUNDRED_ML", "FOUR_PACK"];
  return (allowed.includes(normalized) ? normalized : "STANDARD") as never;
}

export async function importCategories(file: Express.Multer.File) {
  const rows = rowsFrom(file);
  let imported = 0;
  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    const name = required(row, "name", rowNumber);
    const slug = slugify(row.slug || name);
    const parentSlug = row.parentSlug?.trim();
    const parent = parentSlug ? await prisma.category.findUnique({ where: { slug: parentSlug } }) : null;
    await prisma.category.upsert({
      where: { slug },
      update: { name, description: row.description || null, imageUrl: row.imageUrl || null, isActive: booleanValue(row.isActive, true), sortOrder: Number(row.sortOrder || 0), parentId: parent?.id ?? null },
      create: { name, slug, description: row.description || null, imageUrl: row.imageUrl || null, isActive: booleanValue(row.isActive, true), sortOrder: Number(row.sortOrder || 0), parentId: parent?.id ?? null },
    });
    imported++;
  }
  return { imported };
}

export async function importUsers(file: Express.Multer.File) {
  const rows = rowsFrom(file);
  let imported = 0;
  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    const email = required(row, "email", rowNumber).toLowerCase();
    const password = required(row, "password", rowNumber);
    if (password.length < 8) throw new Error(`Row ${rowNumber}: password must be at least 8 characters.`);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: { name: required(row, "name", rowNumber), phone: row.phone || null, passwordHash },
      create: { name: required(row, "name", rowNumber), email, phone: row.phone || null, passwordHash, role: "CUSTOMER" },
    });
    imported++;
  }
  return { imported };
}

export async function importProducts(file: Express.Multer.File) {
  const rows = rowsFrom(file);
  const grouped = new Map<string, CsvRow[]>();
  rows.forEach((row) => {
    const key = firstValue(row, "slug", "Handle");
    if (!key) throw new Error("Each product row needs a slug or Handle.");
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  });
  let imported = 0;
  for (const [slug, productRows] of grouped) {
    const first = productRows[0];
    const categoryName = firstValue(first, "categorySlug", "Product Category", "Type", "Vendor") || "Imported";
    const categorySlug = slugify(categoryName) || "imported";
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { name: categoryName, slug: categorySlug },
    });
    const title = firstValue(first, "title", "Title") || slug;
    const basePrice = Number(firstValue(first, "basePrice", "Variant Price", "variantPrice") || 0);
    if (!Number.isFinite(basePrice)) throw new Error(`Product ${slug}: price must be a number.`);
    const variants = productRows.map((row, index) => {
      const price = Number(firstValue(row, "variantPrice", "Variant Price", "basePrice") || basePrice);
      const stock = Number(firstValue(row, "stockQuantity", "Variant Inventory Qty") || 0);
      if (!Number.isFinite(price) || !Number.isFinite(stock)) throw new Error(`Product ${slug}: price and inventory must be numbers.`);
      return {
        sku: firstValue(row, "variantSku", "Variant SKU") || `${slugify(slug).toUpperCase()}-${index + 1}`,
        size: sizeValue(firstValue(row, "size", "Option1 Value")),
        color: firstValue(row, "color", "Option2 Value") || "Default",
        variantPrice: price,
        stockQuantity: stock,
      };
    });
    const images = [...new Set(productRows.map((row) => firstValue(row, "imageUrl", "Image Src")).filter(Boolean))].map((url, index) => ({ url, isPrimary: index === 0 }));
    const status = firstValue(first, "status", "Status") || (firstValue(first, "Published").toLowerCase() === "false" ? "DRAFT" : "ACTIVE");
    await prisma.product.upsert({
      where: { slug: slugify(slug) },
      update: { title, description: firstValue(first, "description", "Body (HTML)"), basePrice, categoryId: category.id, fabricTags: firstValue(first, "fabricTags", "Tags").split(/[|,]/).map((tag) => tag.trim()).filter(Boolean), images: { deleteMany: {}, create: images }, variants: { deleteMany: {}, create: variants } },
      create: { title, slug: slugify(slug), description: firstValue(first, "description", "Body (HTML)"), basePrice, categoryId: category.id, status: productStatus(status), type: productType(firstValue(first, "type", "Type")), isFeatured: booleanValue(first.isFeatured), fabricTags: firstValue(first, "fabricTags", "Tags").split(/[|,]/).map((tag) => tag.trim()).filter(Boolean), images: { create: images }, variants: { create: variants } },
    });
    imported++;
  }
  return { imported };
}
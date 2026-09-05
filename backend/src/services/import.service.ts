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
    const key = required(row, "slug", 2);
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  });
  let imported = 0;
  for (const [slug, productRows] of grouped) {
    const first = productRows[0];
    const categorySlug = required(first, "categorySlug", 2);
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) throw new Error(`Product ${slug}: categorySlug '${categorySlug}' was not found.`);
    const variants = productRows.map((row, index) => ({
      sku: row.variantSku || `${slugify(slug).toUpperCase()}-${index + 1}`,
      size: required(row, "size", 2) as never,
      color: required(row, "color", 2),
      variantPrice: numberValue(row, "variantPrice", 2),
      stockQuantity: numberValue(row, "stockQuantity", 2),
    }));
    const images = [...new Set(productRows.map((row) => row.imageUrl).filter(Boolean))].map((url, index) => ({ url, isPrimary: index === 0 }));
    if (!images.length) throw new Error(`Product ${slug}: imageUrl is required.`);
    await prisma.product.upsert({
      where: { slug },
      update: { title: required(first, "title", 2), description: first.description || "", basePrice: numberValue(first, "basePrice", 2), categoryId: category.id, fabricTags: (first.fabricTags || "").split("|").filter(Boolean), images: { deleteMany: {}, create: images }, variants: { deleteMany: {}, create: variants } },
      create: { title: required(first, "title", 2), slug, description: first.description || "", basePrice: numberValue(first, "basePrice", 2), categoryId: category.id, status: (first.status || "ACTIVE") as never, type: (first.type || "UNSTITCHED") as never, isFeatured: booleanValue(first.isFeatured), fabricTags: (first.fabricTags || "").split("|").filter(Boolean), images: { create: images }, variants: { create: variants } },
    });
    imported++;
  }
  return { imported };
}
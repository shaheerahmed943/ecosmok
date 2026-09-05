import OpenAI from "openai";
import { prisma } from "../config/db";
import { AIChatMessage, AIChatResponse, AIProductCard } from "../types";

const STOREFRONT_URL = process.env.STOREFRONT_URL ?? "https://shop.example.com";

// Constructed lazily (on first chat request) rather than at module load, so
// a missing/placeholder OPENAI_API_KEY only breaks the AI stylist endpoint
// instead of crashing the whole API process on startup.
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("AI stylist is not configured: OPENAI_API_KEY is missing.");
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const SYSTEM_PROMPT = `You are "Aanya", the personal boutique stylist for an
elevated Pakistani apparel store specializing in stitched and unstitched
suits (Lawn, Chiffon, Organza, Velvet). Speak warmly and knowledgeably, the
way a boutique sales consultant would.

Rules:
- Only recommend products from the CATALOG CONTEXT block you are given.
  Never invent products, prices, or SKUs.
- If nothing in the catalog context matches, say so honestly and suggest
  the closest alternative from what IS available.
- Keep replies concise (2-4 sentences) and end with a light styling tip
  when relevant (e.g. pairing, occasion, fabric care).
- Do not repeat prices/SKUs verbatim in your prose reply if product cards
  will already display them — just reference the piece by name.
- Reply in Markdown. Do not output JSON in the "reply" field.`;

interface CatalogMatch {
  productId: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  size?: string;
  color?: string;
  inStock?: boolean;
}

/**
 * Extracts loose search signals (color, fabric, size, garment type) from the
 * user's free-text message and queries the live catalog for matches. This
 * is intentionally simple keyword matching — swap in an embeddings-based
 * retrieval step for higher recall at scale.
 */
async function retrieveCatalogContext(userMessage: string): Promise<CatalogMatch[]> {
  const lower = userMessage.toLowerCase();

  const knownSizes = ["xs", "s", "m", "l", "xl", "xxl"];
  const matchedSize = knownSizes.find((s) => new RegExp(`\\b${s}\\b`).test(lower));

  const knownFabrics = ["lawn", "chiffon", "organza", "velvet", "silk", "cotton"];
  const matchedFabrics = knownFabrics.filter((f) => lower.includes(f));

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { title: { contains: userMessage, mode: "insensitive" } },
        ...matchedFabrics.map((f) => ({ fabricTags: { has: f } })),
        matchedFabrics.length === 0
          ? { description: { contains: userMessage, mode: "insensitive" } }
          : {},
      ],
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: matchedSize
          ? { size: matchedSize.toUpperCase() as never }
          : undefined,
        take: 3,
      },
    },
    take: 6,
  });

  return products.map((p) => {
    const variant = p.variants[0];
    return {
      productId: p.id,
      title: p.title,
      slug: p.slug,
      price: variant ? Number(variant.variantPrice) : Number(p.basePrice),
      imageUrl: p.images[0]?.url ?? "/placeholder-product.jpg",
      size: variant?.size,
      color: variant?.color,
      inStock: variant ? variant.stockQuantity > 0 : undefined,
    };
  });
}

function toProductCards(matches: CatalogMatch[]): AIProductCard[] {
  return matches.map((m) => ({
    productId: m.productId,
    title: m.title,
    slug: m.slug,
    price: m.price,
    imageUrl: m.imageUrl,
    checkoutUrl: `${STOREFRONT_URL}/products/${m.slug}`,
    matchedVariant:
      m.size && m.color
        ? { size: m.size as never, color: m.color, inStock: Boolean(m.inStock) }
        : undefined,
  }));
}

export async function generateStylistReply(
  history: AIChatMessage[],
  userMessage: string,
): Promise<AIChatResponse> {
  const catalogMatches = await retrieveCatalogContext(userMessage);

  const catalogContextBlock =
    catalogMatches.length > 0
      ? catalogMatches
          .map(
            (m, i) =>
              `${i + 1}. ${m.title} — Rs. ${m.price}${m.color ? ` — ${m.color}` : ""}${
                m.size ? `, size ${m.size}` : ""
              }${m.inStock === false ? " (out of stock)" : ""}`,
          )
          .join("\n")
      : "No matching products were found in the catalog for this query.";

  const completion = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    temperature: 0.6,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `CATALOG CONTEXT (live database results for this query):\n${catalogContextBlock}`,
      },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ],
  });

  const reply = completion.choices[0]?.message?.content ?? "";

  return {
    reply,
    productCards: toProductCards(catalogMatches),
  };
}

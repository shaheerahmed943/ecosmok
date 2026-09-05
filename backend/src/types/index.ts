// =========================================================================
// Shared domain types. Mirrors Prisma models but decoupled for API contracts
// so the frontend can import this file (or a copy) without pulling in
// @prisma/client on the client bundle.
// =========================================================================

export type UserRole = "ADMIN" | "CUSTOMER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface HomepageBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface HomepageFabricTile {
  id: string;
  label: string;
  imageUrl: string;
  link: string;
}

export interface HomepageContent {
  banners: HomepageBanner[];
  fabricTiles: HomepageFabricTile[];
  featuredCollectionTitle: string;
  featuredCategorySlug: string | null;
  newArrivalsTitle: string;
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";
export type ProductType =
  | "STITCHED"
  | "UNSTITCHED"
  | "READY_TO_WEAR"
  | "BOUTIQUE_EXCLUSIVE"
  | "DISPOSABLE"
  | "POD_SYSTEM"
  | "E_LIQUID"
  | "HARDWARE"
  | "ACCESSORY";
export type SizeLabel =
  | "XS" | "S" | "M" | "L" | "XL" | "XXL" | "CUSTOM"
  | "STANDARD" | "TWO_ML" | "TEN_ML" | "THIRTY_ML" | "FIFTY_ML"
  | "ONE_HUNDRED_ML" | "FOUR_PACK";
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";
export type PaymentMethod = "COD" | "CARD" | "BANK_TRANSFER";
export type DiscountType = "PERCENTAGE" | "FLAT";

export interface ProductImageDTO {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariantDTO {
  id: string;
  sku: string;
  size: SizeLabel;
  color: string;
  fabricOption: string | null;
  variantPrice: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface ProductDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  fabricDetails: string | null;
  careInstructions: string | null;
  basePrice: number;
  status: ProductStatus;
  type: ProductType;
  isFeatured: boolean;
  fabricTags: string[];
  productKind: string;
  nicotineStrength: string | null;
  flavour: string | null;
  deviceType: string | null;
  capacity: string | null;
  puffCount: number | null;
  batteryCapacity: string | null;
  coilResistance: string | null;
  pgVgRatio: string | null;
  isNicotineFree: boolean;
  ageRestricted: boolean;
  categoryId: string;
  images: ProductImageDTO[];
  variants: ProductVariantDTO[];
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductQueryFilters {
  categorySlug?: string;
  subcategorySlug?: string;
  fabric?: string[];
  type?: ProductType[];
  size?: SizeLabel[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "best_selling" | "featured";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CartLineItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ShippingQuoteRequest {
  city: string;
  subtotal: number;
}

export interface ShippingQuoteResponse {
  city: string;
  fee: number;
  etaDays: number;
  freeShippingApplied: boolean;
}

export interface CheckoutRequest {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  isGuestCheckout: boolean;
  shippingAddress: string;
  shippingCity: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  items: CartLineItem[];
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  estimatedDelivery: string;
}

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIProductCard {
  productId: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  checkoutUrl: string;
  matchedVariant?: {
    size: SizeLabel;
    color: string;
    inStock: boolean;
  };
}

export interface AIChatResponse {
  reply: string; // markdown text
  productCards: AIProductCard[];
}

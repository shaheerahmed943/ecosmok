import { prisma } from "../config/db";
import { calculateShipping } from "./shipping.service";
import { CheckoutRequest, CheckoutResponse } from "../types";

export class CheckoutError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = "CheckoutError";
  }
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `BQ-${year}-${random}`;
}

/**
 * Validates line items against live stock, applies an optional coupon,
 * calculates city-based shipping, and persists the order + order items
 * inside a single transaction so stock and totals never drift.
 */
export async function processCodCheckout(
  payload: CheckoutRequest,
  userId?: string,
): Promise<CheckoutResponse> {
  if (!payload.items.length) {
    throw new CheckoutError("Cart is empty.");
  }

  return prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const resolvedItems: {
      productId: string;
      variantId: string;
      quantity: number;
      unitPrice: number;
    }[] = [];

    for (const item of payload.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant || !variant.isActive) {
        throw new CheckoutError(`Variant ${item.variantId} is not available.`);
      }
      if (variant.stockQuantity < item.quantity) {
        throw new CheckoutError(
          `Insufficient stock for "${variant.product.title}" (${variant.color}, ${variant.size}). Only ${variant.stockQuantity} left.`,
        );
      }

      const unitPrice = Number(variant.variantPrice);
      subtotal += unitPrice * item.quantity;

      resolvedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
      });
    }

    // --- Coupon validation -----------------------------------------------
    let discountAmount = 0;
    let couponId: string | undefined;

    if (payload.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: payload.couponCode } });

      if (!coupon || !coupon.isActive) {
        throw new CheckoutError("Invalid or expired coupon code.");
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new CheckoutError("This coupon has expired.");
      }
      if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
        throw new CheckoutError("This coupon has reached its usage limit.");
      }
      if (subtotal < Number(coupon.minOrderAmount)) {
        throw new CheckoutError(
          `Minimum order amount for this coupon is Rs. ${coupon.minOrderAmount}.`,
        );
      }

      discountAmount =
        coupon.discountType === "PERCENTAGE"
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
      discountAmount = Math.min(discountAmount, subtotal);
      couponId = coupon.id;

      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    // --- Shipping ----------------------------------------------------------
    const shippingQuote = await calculateShipping({
      city: payload.shippingCity,
      subtotal: subtotal - discountAmount,
    });

    const totalAmount = subtotal - discountAmount + shippingQuote.fee;

    // --- Persist order -------------------------------------------------
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        isGuestCheckout: !userId,
        userId,
        status: "PENDING",
        shippingAddress: payload.shippingAddress,
        shippingCity: payload.shippingCity,
        shippingFee: shippingQuote.fee,
        subtotal,
        discountAmount,
        totalAmount,
        paymentMethod: payload.paymentMethod,
        couponId,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });

    // --- Decrement stock -------------------------------------------------
    for (const item of resolvedItems) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + shippingQuote.etaDays);

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      shippingFee: Number(order.shippingFee),
      estimatedDelivery: etaDate.toISOString().split("T")[0],
    };
  });
}

export async function trackOrder(orderNumber: string, phone: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!order || order.customerPhone !== phone) {
    throw new CheckoutError("No matching order found for that Order ID and phone number.", 404);
  }

  return order;
}

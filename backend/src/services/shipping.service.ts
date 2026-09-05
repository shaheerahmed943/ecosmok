import { prisma } from "../config/db";
import { ShippingQuoteRequest, ShippingQuoteResponse } from "../types";

const FALLBACK_FEE = 250; // PKR flat fee for cities not in the rate matrix
const FALLBACK_ETA_DAYS = 5;
const FREE_SHIPPING_THRESHOLD = 8000; // PKR

/**
 * Resolves the shipping fee for a given city using the admin-managed
 * ShippingRate matrix, with graceful fallback for unmapped cities and
 * automatic free-shipping above a configurable order threshold.
 */
export async function calculateShipping(
  request: ShippingQuoteRequest,
): Promise<ShippingQuoteResponse> {
  const normalizedCity = request.city.trim();

  const rate = await prisma.shippingRate.findFirst({
    where: {
      city: { equals: normalizedCity, mode: "insensitive" },
      isActive: true,
    },
  });

  const baseFee = rate ? Number(rate.fee) : FALLBACK_FEE;
  const etaDays = rate ? rate.etaDays : FALLBACK_ETA_DAYS;
  const freeShippingApplied = request.subtotal >= FREE_SHIPPING_THRESHOLD;

  return {
    city: normalizedCity,
    fee: freeShippingApplied ? 0 : baseFee,
    etaDays,
    freeShippingApplied,
  };
}

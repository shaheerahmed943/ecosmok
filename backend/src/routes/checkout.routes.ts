import { Router, Request, Response, NextFunction } from "express";
import { calculateShipping } from "../services/shipping.service";
import { CheckoutError, processCodCheckout, trackOrder } from "../services/checkout.service";
import { createPaymentSession } from "../services/payment.service";
import { CheckoutRequest } from "../types";
import { optionalAuth, AuthenticatedRequest } from "../middleware/jwtAuth";

const router = Router();

/**
 * POST /api/checkout/shipping-quote
 * Body: { city: string, subtotal: number }
 */
router.post("/shipping-quote", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, subtotal } = req.body as { city?: string; subtotal?: number };

    if (!city || typeof subtotal !== "number") {
      return res.status(400).json({ error: "city and subtotal are required." });
    }

    const quote = await calculateShipping({ city, subtotal });
    res.status(200).json(quote);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/checkout
 * Cash-on-Delivery checkout. Validates stock + coupon inside a DB
 * transaction and returns the created order summary.
 */
router.post("/", optionalAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const payload = req.body as CheckoutRequest;

    if (!payload.customerName || !payload.customerPhone || !payload.shippingCity) {
      return res.status(400).json({ error: "Missing required customer or shipping details." });
    }

    const result = await processCodCheckout(payload, req.userId);
    if (payload.paymentMethod === "CARD") {
      const payment = await createPaymentSession(
        result.orderId,
        `${process.env.STOREFRONT_URL ?? "http://localhost:3000"}/order-confirmation?orderNumber=${result.orderNumber}`,
        `${process.env.STOREFRONT_URL ?? "http://localhost:3000"}/checkout?payment=cancelled`,
      );
      return res.status(201).json({ ...result, ...payment });
    }
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

/**
 * GET /api/checkout/track?orderNumber=BQ-2026-000123&phone=03001234567
 */
router.get("/track", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderNumber, phone } = req.query as { orderNumber?: string; phone?: string };

    if (!orderNumber || !phone) {
      return res.status(400).json({ error: "orderNumber and phone are required." });
    }

    const order = await trackOrder(orderNumber, phone);
    res.status(200).json(order);
  } catch (err) {
    if (err instanceof CheckoutError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

export default router;

import dotenv from "dotenv";
import path from "path";

// Resolve configuration from the backend package even when started from the repo root.
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import productRoutes from "./routes/product.routes";
import checkoutRoutes from "./routes/checkout.routes";
import aiRoutes from "./routes/ai.routes";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import homepageRoutes from "./routes/homepage.routes";
import contentRoutes from "./routes/content.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { UPLOADS_DISK_PATH, UPLOADS_PUBLIC_PATH } from "./middleware/upload";
import { handleStripeWebhook } from "./services/payment.service";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet({ crossOriginResourcePolicy: false })); // allow <img> to load /uploads cross-origin
app.use(
  cors({
    origin: process.env.STOREFRONT_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.post("/api/checkout/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") return res.status(400).send("Missing Stripe signature.");
    res.status(200).json(await handleStripeWebhook(req.body as Buffer, signature));
  } catch (err) {
    res.status(400).send(err instanceof Error ? err.message : "Webhook failed.");
  }
});
app.use(express.json({ limit: "2mb" }));

// Serve uploaded product images statically, e.g. http://localhost:4000/uploads/xyz.jpg
app.use(UPLOADS_PUBLIC_PATH, express.static(UPLOADS_DISK_PATH));

// AI chat is the most expensive route — rate-limit it separately.
const aiLimiter = rateLimit({ windowMs: 60_000, max: 20 });
// Auth endpoints get their own limiter to slow down credential stuffing.
const authLimiter = rateLimit({ windowMs: 60_000, max: 15 });

app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/content", contentRoutes);

app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`EcoSmok API listening on port ${PORT}`);
});

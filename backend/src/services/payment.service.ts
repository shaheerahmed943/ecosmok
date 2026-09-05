import Stripe from "stripe";
import { prisma } from "../config/db";

const SECRET_KEY = "stripe_secret_key";
const WEBHOOK_KEY = "stripe_webhook_secret";

async function setting(key: string) {
  const value = await prisma.storeSetting.findUnique({ where: { key } });
  return typeof value?.value === "string" ? value.value : null;
}

export async function getStripeSettings() {
  return { secretKey: Boolean(await setting(SECRET_KEY)), webhookSecret: Boolean(await setting(WEBHOOK_KEY)), configured: Boolean(process.env.STRIPE_SECRET_KEY || await setting(SECRET_KEY)) };
}

export async function saveStripeSettings(secretKey: string, webhookSecret: string) {
  if (secretKey && !secretKey.startsWith("sk_")) throw new Error("Stripe secret key must start with sk_.");
  await prisma.storeSetting.upsert({ where: { key: SECRET_KEY }, update: { value: secretKey }, create: { key: SECRET_KEY, value: secretKey } });
  await prisma.storeSetting.upsert({ where: { key: WEBHOOK_KEY }, update: { value: webhookSecret }, create: { key: WEBHOOK_KEY, value: webhookSecret } });
  return getStripeSettings();
}

async function stripeClient() {
  const key = (await setting(SECRET_KEY)) || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured. Add the secret key in Admin > Payments.");
  return new Stripe(key);
}

export async function createPaymentSession(orderId: string, successUrl: string, cancelUrl: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: true } } } });
  if (!order) throw new Error("Order not found.");
  const stripe = await stripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customerEmail || undefined,
    line_items: order.items.map((item) => ({ price_data: { currency: "pkr", product_data: { name: item.product.title }, unit_amount: Math.round(Number(item.unitPrice) * 100) }, quantity: item.quantity })),
    shipping_options: Number(order.shippingFee) > 0 ? [{ shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: Math.round(Number(order.shippingFee) * 100), currency: "pkr" }, display_name: "Shipping" } }] : undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
  });
  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  return { checkoutUrl: session.url };
}

export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const stripe = await stripeClient();
  const secret = await setting(WEBHOOK_KEY);
  if (!secret) throw new Error("Stripe webhook secret is not configured.");
  const event = stripe.webhooks.constructEvent(payload, signature, secret);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.orderId) await prisma.order.update({ where: { id: session.metadata.orderId }, data: { paymentStatus: "PAID", status: "PROCESSING" } });
  }
  return { received: true };
}
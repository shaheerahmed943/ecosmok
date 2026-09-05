"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, Tag, UserCheck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from the logged-in account, if any.
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customerName: f.customerName || user.name,
        customerEmail: f.customerEmail || user.email,
        customerPhone: f.customerPhone || user.phone || "",
      }));
    }
  }, [user]);

  // Re-quote shipping whenever the city changes (debounced).
  useEffect(() => {
    if (!form.shippingCity) {
      setShippingFee(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsQuoting(true);
      try {
        const quote = (await api.getShippingQuote(form.shippingCity, subtotal())) as {
          fee: number;
        };
        setShippingFee(quote.fee);
      } catch {
        setShippingFee(null);
      } finally {
        setIsQuoting(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.shippingCity, subtotal]);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.customerName || !form.customerPhone || !form.shippingAddress || !form.shippingCity) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = (await api.checkout({
        ...form,
        paymentMethod,
        couponCode: couponCode || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      })) as { orderNumber: string; checkoutUrl?: string };

      const checkoutUrl = result.checkoutUrl;
      if (paymentMethod === "CARD" && checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      clearCart();
      router.push(`/order-confirmation?orderNumber=${result.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const total = subtotal() + (shippingFee ?? 0);

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid max-w-5xl gap-10 px-4 py-10 lg:grid-cols-2">
      <div>
        {user ? (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-[#F5F2EC] p-3 text-sm text-neutral-700">
            <UserCheck className="h-4 w-4 text-[#0A2540]" />
            Checking out as <strong>{user.name}</strong> — this order will be saved to your account.
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm text-neutral-600">
            <span>Checking out as guest.</span>
            <Link href="/account/login" className="font-medium text-[#0A2540] underline">
              Log in for faster checkout
            </Link>
          </div>
        )}

        <div className="space-y-4">
          <input
            required
            placeholder="Full Name"
            className="w-full rounded-lg border border-neutral-300 p-3"
            value={form.customerName}
            onChange={(e) => updateField("customerName", e.target.value)}
          />
          <input
            type="tel"
            required
            placeholder="Phone Number"
            className="w-full rounded-lg border border-neutral-300 p-3"
            value={form.customerPhone}
            onChange={(e) => updateField("customerPhone", e.target.value)}
          />
          <input
            type="email"
            placeholder="Email (optional)"
            className="w-full rounded-lg border border-neutral-300 p-3"
            value={form.customerEmail}
            onChange={(e) => updateField("customerEmail", e.target.value)}
          />
          <textarea
            required
            placeholder="Shipping Address"
            rows={3}
            className="w-full rounded-lg border border-neutral-300 p-3"
            value={form.shippingAddress}
            onChange={(e) => updateField("shippingAddress", e.target.value)}
          />
          <input
            required
            placeholder="City"
            className="w-full rounded-lg border border-neutral-300 p-3"
            value={form.shippingCity}
            onChange={(e) => updateField("shippingCity", e.target.value)}
          />

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                placeholder="Promo code"
                className="w-full rounded-lg border border-neutral-300 p-3 pl-9"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-[#F5F2EC] p-3 text-sm text-neutral-600"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#0A2540]" /> Payment method</div><div className="flex gap-4"><label><input type="radio" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} /> <span className="ml-1">Cash on Delivery</span></label><label><input type="radio" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} /> <span className="ml-1">Card via Stripe</span></label></div></div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A2540] py-3.5 font-medium text-white disabled:bg-neutral-300"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {paymentMethod === "CARD" ? "Pay securely with Stripe" : "Place Order (COD)"}
          </button>
        </div>
      </div>

      {/* Order summary */}
      <div className="h-fit rounded-xl border border-neutral-200 p-6">
        <h3 className="mb-4 font-serif text-lg text-[#0A2540]">Order Summary</h3>
        <ul className="mb-4 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between text-neutral-600">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>Rs. {(item.unitPrice * item.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Subtotal</span>
            <span>Rs. {subtotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Shipping</span>
            <span>
              {isQuoting ? "Calculating…" : shippingFee != null ? `Rs. ${shippingFee}` : "Enter city"}
            </span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-[#0A2540]">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </form>
  );
}

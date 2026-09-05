"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const STEPS = ["PENDING", "PROCESSING", "DISPATCHED", "DELIVERED"] as const;

interface OrderResult {
  orderNumber: string;
  status: (typeof STEPS)[number] | "CANCELLED" | "RETURNED";
  totalAmount: number;
  shippingCity: string;
  createdAt: string;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setIsLoading(true);
    try {
      const result = (await api.trackOrder(orderNumber, phone)) as OrderResult;
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found.");
    } finally {
      setIsLoading(false);
    }
  }

  const currentStepIdx = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-serif text-3xl text-[#0A2540]">Track Your Order</h1>
      <p className="mt-2 text-neutral-600">
        Enter your Order ID and the phone number used at checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row">
        <input
          required
          placeholder="Order ID (e.g. BQ-2026-000123)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 p-3"
        />
        <input
          required
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 p-3"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#0A2540] px-6 py-3 font-medium text-white disabled:bg-neutral-300"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Track
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {order && (
        <div className="mt-10 rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-neutral-500">Order</p>
          <p className="font-serif text-xl text-[#0A2540]">{order.orderNumber}</p>

          {order.status === "CANCELLED" || order.status === "RETURNED" ? (
            <p className="mt-4 text-sm font-medium text-red-600">
              This order was {order.status.toLowerCase()}.
            </p>
          ) : (
            <div className="mt-8 flex items-center justify-between">
              {STEPS.map((step, idx) => (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {idx > 0 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          idx <= currentStepIdx ? "bg-[#0A2540]" : "bg-neutral-200"
                        }`}
                      />
                    )}
                    {idx <= currentStepIdx ? (
                      <CheckCircle2 className="h-6 w-6 shrink-0 text-[#0A2540]" />
                    ) : (
                      <Circle className="h-6 w-6 shrink-0 text-neutral-300" />
                    )}
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 ${
                          idx < currentStepIdx ? "bg-[#0A2540]" : "bg-neutral-200"
                        }`}
                      />
                    )}
                  </div>
                  <p className="mt-2 text-center text-xs capitalize text-neutral-600">
                    {step.toLowerCase()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-neutral-200 pt-4 text-sm text-neutral-600">
            <span>Shipping to {order.shippingCity}</span>
            <span className="font-semibold text-[#0A2540]">
              Rs. {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

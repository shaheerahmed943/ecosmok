"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#C5DC3B]" />
      <h1 className="font-serif text-2xl text-[#0A2540]">Order Placed!</h1>
      <p className="mt-2 text-neutral-600">
        Your order <strong>{orderNumber}</strong> has been received and will be
        processed shortly. You&apos;ll pay via Cash on Delivery.
      </p>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

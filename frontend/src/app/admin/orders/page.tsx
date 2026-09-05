"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
  shippingCity: string;
  createdAt: string;
  itemCount: number;
}

const STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  DISPATCHED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-neutral-200 text-neutral-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const result = (await api.adminListOrders()) as { data: AdminOrder[] };
      setOrders(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdatingId(orderId);
    try {
      await api.adminUpdateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Orders</h1>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-16 text-center text-neutral-500">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr>
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">City</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                  <td className="p-4 font-medium text-[#0A2540]">{o.orderNumber}</td>
                  <td className="p-4 text-neutral-600">
                    {o.customerName}
                    <br />
                    <span className="text-xs text-neutral-400">{o.customerPhone}</span>
                  </td>
                  <td className="p-4 text-neutral-600">{o.shippingCity}</td>
                  <td className="p-4 text-neutral-600">{o.itemCount}</td>
                  <td className="p-4 font-medium text-neutral-700">
                    Rs. {o.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${
                        STATUS_COLORS[o.status] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

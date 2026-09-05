"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, DollarSign, Package, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  statusBreakdown: { status: string; count: number }[];
  lowStockVariants: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .adminGetDashboard()
      .then((data) => setStats(data as DashboardStats))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load stats."));
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Dashboard</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error} — check that the backend is running and NEXT_PUBLIC_ADMIN_KEY matches
          ADMIN_API_KEY in backend/.env.
        </p>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<DollarSign className="h-5 w-5" />}
              label="Total Revenue"
              value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
            />
            <KpiCard
              icon={<ShoppingBag className="h-5 w-5" />}
              label="Total Orders"
              value={stats.totalOrders.toString()}
            />
            <KpiCard
              icon={<Package className="h-5 w-5" />}
              label="Avg. Order Value"
              value={`Rs. ${Math.round(stats.averageOrderValue).toLocaleString()}`}
            />
            <KpiCard
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Low Stock Variants"
              value={stats.lowStockVariants.toString()}
              accent={stats.lowStockVariants > 0}
            />
          </div>

          <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
            <p className="mb-4 text-sm font-semibold text-[#0A2540]">Orders by Status</p>
            <div className="flex flex-wrap gap-4">
              {stats.statusBreakdown.map((s) => (
                <div key={s.status} className="rounded-lg bg-[#F5F2EC] px-4 py-2 text-sm">
                  <span className="font-medium text-[#0A2540]">{s.status}</span>
                  <span className="ml-2 text-neutral-500">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div
        className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${
          accent ? "bg-red-100 text-red-600" : "bg-[#0A2540]/10 text-[#0A2540]"
        }`}
      >
        {icon}
      </div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#0A2540]">{value}</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";

interface ShippingRate {
  city: string;
  fee: number;
  etaDays: number;
}

export default function AdminShippingPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCity, setNewCity] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newEta, setNewEta] = useState("3");
  const [isSaving, setIsSaving] = useState(false);

  async function loadRates() {
    setIsLoading(true);
    try {
      const data = (await api.adminGetShippingRates()) as ShippingRate[];
      setRates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipping rates.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRates();
  }, []);

  async function handleUpdateRate(city: string, fee: number, etaDays: number) {
    try {
      await api.adminUpsertShippingRate(city, fee, etaDays);
      setRates((prev) => prev.map((r) => (r.city === city ? { city, fee, etaDays } : r)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update rate.");
    }
  }

  async function handleAddRate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCity.trim() || !newFee) return;

    setIsSaving(true);
    try {
      await api.adminUpsertShippingRate(newCity.trim(), Number(newFee), Number(newEta) || 3);
      setNewCity("");
      setNewFee("");
      setNewEta("3");
      await loadRates();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add rate.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-[#0A2540]">Shipping Rate Matrix</h1>
      <p className="mb-6 max-w-xl text-sm text-neutral-600">
        Set a delivery fee and ETA per city. Cities not listed here fall back
        to the default fee configured in the checkout service.
      </p>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <form
        onSubmit={handleAddRate}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <div>
          <label className="mb-1 block text-xs text-neutral-500">City</label>
          <input
            required
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="e.g. Islamabad"
            className="rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Fee (Rs.)</label>
          <input
            required
            type="number"
            min="0"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            className="w-28 rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">ETA (days)</label>
          <input
            type="number"
            min="1"
            value={newEta}
            onChange={(e) => setNewEta(e.target.value)}
            className="w-24 rounded-lg border border-neutral-300 p-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1 rounded-lg bg-[#0A2540] px-4 py-2.5 text-sm font-medium text-white disabled:bg-neutral-300"
        >
          <Plus className="h-4 w-4" /> Add / Update
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr>
                <th className="p-4 font-medium">City</th>
                <th className="p-4 font-medium">Fee (Rs.)</th>
                <th className="p-4 font-medium">ETA (days)</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.city} className="border-b border-neutral-100 last:border-0">
                  <td className="p-4 font-medium text-[#0A2540]">{r.city}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      defaultValue={r.fee}
                      onBlur={(e) => handleUpdateRate(r.city, Number(e.target.value), r.etaDays)}
                      className="w-24 rounded-md border border-neutral-300 p-1.5"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      defaultValue={r.etaDays}
                      onBlur={(e) => handleUpdateRate(r.city, r.fee, Number(e.target.value))}
                      className="w-20 rounded-md border border-neutral-300 p-1.5"
                    />
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

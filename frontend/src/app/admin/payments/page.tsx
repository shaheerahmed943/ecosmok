"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { api } from "@/lib/api";

export default function PaymentsPage() {
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [configured, setConfigured] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { api.adminGetStripeSettings().then((settings) => setConfigured(Boolean((settings as { configured: boolean }).configured))).catch(() => undefined); }, []);
  async function save(e: React.FormEvent) { e.preventDefault(); setMessage(""); try { await api.adminSaveStripeSettings(secretKey, webhookSecret); setConfigured(true); setSecretKey(""); setWebhookSecret(""); setMessage("Stripe settings saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save settings."); } }
  return <div className="max-w-2xl space-y-8"><header><h1 className="font-serif text-3xl text-[#0A2540]">Payments</h1><p className="mt-2 text-sm text-neutral-500">Connect Stripe Checkout without storing card details in the store.</p></header>
    <form onSubmit={save} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6"><div className="flex items-center gap-2 text-sm text-neutral-600">{configured && <CheckCircle2 className="h-4 w-4 text-emerald-600" />} {configured ? "Stripe is configured" : "Stripe is not configured"}</div>
      <input required type="password" placeholder="Stripe secret key (sk_test_... or sk_live_...)" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-3" />
      <input required type="password" placeholder="Stripe webhook signing secret (whsec_...)" value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} className="w-full rounded-lg border border-neutral-300 p-3" />
      <p className="text-xs text-neutral-500">Set the Stripe webhook endpoint to <code>/api/checkout/stripe/webhook</code> and listen for checkout.session.completed.</p>
      {message && <p className="text-sm text-[#0A2540]">{message}</p>}<button className="flex items-center gap-2 rounded-lg bg-[#0A2540] px-4 py-3 text-sm font-medium text-white"><Save className="h-4 w-4" /> Save Stripe settings</button>
    </form></div>;
}
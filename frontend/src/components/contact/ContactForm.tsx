"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Wire this up to a /api/contact endpoint or a transactional email
    // provider (e.g. Resend, Brevo) when ready — kept as a UI-only stub here.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-[#F5F2EC] p-6 text-center text-[#0A2540]">
        Thanks for reaching out — we&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input required placeholder="Full Name" className="w-full rounded-lg border border-neutral-300 p-3" />
      <input required type="email" placeholder="Email" className="w-full rounded-lg border border-neutral-300 p-3" />
      <textarea required rows={5} placeholder="Your message" className="w-full rounded-lg border border-neutral-300 p-3" />
      <button type="submit" className="w-full rounded-lg bg-[#0A2540] py-3.5 font-medium text-white">
        Send Message
      </button>
    </form>
  );
}

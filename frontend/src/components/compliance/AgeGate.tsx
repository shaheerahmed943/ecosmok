"use client";

import { useEffect, useState } from "react";

const AGE_GATE_KEY = "ecosmok-age-confirmed";

export default function AgeGate() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(localStorage.getItem(AGE_GATE_KEY) !== "true");
  }, []);

  function confirmAge() {
    localStorage.setItem(AGE_GATE_KEY, "true");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#07131f]/95 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0A2540]">ECOSMOK</p>
        <h2 className="mt-4 font-serif text-3xl text-[#0A2540]">Are you 18 or over?</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          This website sells age-restricted vaping products. You must be 18 or over to enter.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={confirmAge} className="flex-1 rounded-lg bg-[#0A2540] px-4 py-3 text-sm font-semibold text-white">
            Yes, enter store
          </button>
          <a href="https://www.google.com" className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-700">
            Leave
          </a>
        </div>
        <p className="mt-5 text-xs text-neutral-400">Please vape responsibly. Keep products away from children.</p>
      </div>
    </div>
  );
}

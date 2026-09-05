"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";

interface ProductCard {
  productId: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  checkoutUrl: string;
  matchedVariant?: { size: string; color: string; inStock: boolean };
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  productCards?: ProductCard[];
}

const GREETING: ChatTurn = {
  role: "assistant",
  content:
    "Assalam-o-Alaikum! I'm Aanya, your personal boutique stylist. Tell me what you're looking for — colors, fabric, occasion, size — and I'll find pieces for you. ✨",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, isSending]);

  async function handleSend() {
    const message = input.trim();
    if (!message || isSending) return;

    const nextTurns: ChatTurn[] = [...turns, { role: "user", content: message }];
    setTurns(nextTurns);
    setInput("");
    setIsSending(true);

    try {
      const history = nextTurns
        .slice(0, -1)
        .map((t) => ({ role: t.role, content: t.content }));

      const response = (await api.aiChat(message, history)) as {
        reply: string;
        productCards: ProductCard[];
      };

      setTurns((prev) => [
        ...prev,
        { role: "assistant", content: response.reply, productCards: response.productCards },
      ]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble reaching the styling desk right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A2540] text-white shadow-xl transition-transform hover:scale-105"
        aria-label="Open boutique stylist chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:w-96"
          >
            <header className="flex items-center gap-2 bg-[#0A2540] p-4 text-white">
              <Sparkles className="h-4 w-4 text-[#C5DC3B]" />
              <div>
                <p className="text-sm font-semibold">Aanya · Boutique Stylist</p>
                <p className="text-xs text-white/70">Usually replies instantly</p>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {turns.map((turn, idx) => (
                <div key={idx} className={turn.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      turn.role === "user"
                        ? "bg-[#0A2540] text-white"
                        : "bg-[#F5F2EC] text-neutral-800"
                    }`}
                  >
                    {turn.content}
                  </div>

                  {turn.productCards && turn.productCards.length > 0 && (
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                      {turn.productCards.map((card) => (
                        <Link
                          key={card.productId}
                          href={`/products/${card.slug}`}
                          className="w-32 shrink-0 rounded-xl border border-neutral-200 p-2 text-left transition-shadow hover:shadow-md"
                        >
                          <div className="relative mb-2 h-32 w-full overflow-hidden rounded-lg bg-neutral-100">
                            <Image src={card.imageUrl} alt={card.title} fill className="object-cover" />
                          </div>
                          <p className="line-clamp-2 text-xs font-medium text-[#0A2540]">
                            {card.title}
                          </p>
                          <p className="text-xs font-semibold text-neutral-700">
                            Rs. {card.price.toLocaleString()}
                          </p>
                          {card.matchedVariant && !card.matchedVariant.inStock && (
                            <p className="text-[10px] text-red-500">Out of stock</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aanya is styling a reply…
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-neutral-200 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="e.g. maroon chiffon suit, size L"
                className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-[#0A2540]"
              />
              <button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A2540] text-white disabled:bg-neutral-300"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

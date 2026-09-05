import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  slug: string;
  imageUrl: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (newItem) => {
        const existing = get().items.find((i) => i.variantId === newItem.variantId);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === newItem.variantId
                ? {
                    ...i,
                    quantity: Math.min(
                      i.quantity + newItem.quantity,
                      i.stockQuantity,
                    ),
                  }
                : i,
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...get().items, newItem], isOpen: true });
        }
      },

      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      updateQuantity: (variantId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stockQuantity)) }
              : i,
          ),
        }),

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "ecosmoke-cart" },
  ),
);

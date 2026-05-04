import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart shape: items: [{ menuItemId, name, price, quantity, image? }]
// Persisted to localStorage so a page refresh doesn't drop the customer's selection.
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],

      add: (item, qty = 1) => set((state) => {
        const idx = state.items.findIndex((i) => i.menuItemId === item.menuItemId);
        if (idx >= 0) {
          const next = state.items.slice();
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
          return { items: next };
        }
        return {
          items: [
            ...state.items,
            {
              menuItemId: item.menuItemId || item._id,
              name: item.name,
              price: item.price,
              image: item.image,
              quantity: qty,
            },
          ],
        };
      }),

      remove: (menuItemId) => set((state) => ({
        items: state.items.filter((i) => i.menuItemId !== menuItemId),
      })),

      setQuantity: (menuItemId, quantity) => set((state) => {
        if (quantity <= 0) return { items: state.items.filter((i) => i.menuItemId !== menuItemId) };
        return {
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        };
      }),

      clear: () => set({ items: [] }),

      // Selectors
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'rss-cart-v1' }
  )
);

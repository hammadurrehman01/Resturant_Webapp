import { create } from 'zustand';

// Cross-component UI flags (cart drawer, chat widget). Kept separate from cart
// state so persisting the cart doesn't also persist "drawer was open".
export const useUI = create((set) => ({
  cartOpen: false,
  chatOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  closeChat: () => set({ chatOpen: false }),
}));

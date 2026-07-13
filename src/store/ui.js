import { create } from 'zustand';

// Cross-component UI flags (cart drawer, chat widget, item details modal).
export const useUI = create((set) => ({
  cartOpen: false,
  chatOpen: false,
  activeItem: null,
  activeItemType: null, // 'item' or 'deal'
  
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  closeChat: () => set({ chatOpen: false }),
  
  openItemModal: (item, type = 'item') => set({ activeItem: item, activeItemType: type }),
  closeItemModal: () => set({ activeItem: null, activeItemType: null }),
}));

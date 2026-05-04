import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/cart.js';
import { useUI } from '../../store/ui.js';
import useRestaurant from '../../hooks/useRestaurant.js';
import { formatMoney } from '../../lib/format.js';

export default function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const { restaurant } = useRestaurant();
  const navigate = useNavigate();

  // Close on escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close]);

  const currency = restaurant?.currency || 'PKR';
  const deliveryFee = restaurant?.deliveryFee || 0;
  const taxAmount = ((restaurant?.taxPercent || 0) * subtotal) / 100;
  const total = subtotal + deliveryFee + taxAmount;

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-label="Cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <div className="text-base font-semibold">Your cart ({items.length})</div>
          <button
            onClick={close}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
            aria-label="Close cart"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="py-16 text-center text-sm text-stone-500">
              Your cart is empty. Browse the menu to add items.
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.menuItemId} className="flex items-start gap-3 rounded-lg border border-stone-200 p-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-stone-900">{it.name}</div>
                    <div className="text-xs text-stone-500">{formatMoney(it.price, currency)}</div>
                    <div className="mt-2 inline-flex items-center rounded-md border border-stone-300">
                      <button
                        type="button"
                        className="px-2 py-1 text-stone-600 hover:bg-stone-50"
                        onClick={() => setQuantity(it.menuItemId, it.quantity - 1)}
                        aria-label="Decrease"
                      >−</button>
                      <span className="px-3 text-sm">{it.quantity}</span>
                      <button
                        type="button"
                        className="px-2 py-1 text-stone-600 hover:bg-stone-50"
                        onClick={() => setQuantity(it.menuItemId, it.quantity + 1)}
                        aria-label="Increase"
                      >+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatMoney(it.price * it.quantity, currency)}</div>
                    <button
                      onClick={() => remove(it.menuItemId)}
                      className="mt-2 text-xs text-stone-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 px-4 py-3">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-stone-600">Subtotal</dt><dd>{formatMoney(subtotal, currency)}</dd></div>
              {deliveryFee > 0 && (
                <div className="flex justify-between"><dt className="text-stone-600">Delivery</dt><dd>{formatMoney(deliveryFee, currency)}</dd></div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between"><dt className="text-stone-600">Tax</dt><dd>{formatMoney(taxAmount, currency)}</dd></div>
              )}
              <div className="mt-1 flex justify-between border-t border-stone-200 pt-2 text-base font-semibold">
                <dt>Total</dt><dd>{formatMoney(total, currency)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => { close(); navigate('/order'); }}
              className="btn-primary mt-3 w-full"
            >
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

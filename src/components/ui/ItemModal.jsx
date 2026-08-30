import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../store/cart.js';
import { formatMoney } from '../../lib/format.js';
import { cldImg } from '../../lib/image.js';

/**
 * ItemModal — shown when a customer clicks any food item (menu item, trending, running, or deal).
 *
 * Props:
 *   item          – the item object (menu item, trending item, deal, etc.)
 *   type          – 'menuItem' | 'trending' | 'running' | 'deal'
 *   currency      – currency string (default 'PKR')
 *   onClose       – callback to close the modal
 */
export default function ItemModal({ item, type = 'menuItem', currency = 'PKR', onClose }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const backdropRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Resolve fields that differ between item types
  const name =
    type === 'deal' ? item.title :
    item.name || item.title || '';

  const nameUrdu =
    type === 'menuItem' ? item.nameUrdu : null;

  const description =
    item.description || '';

  const image =
    item.image || null;

  // For deals use item.price; for trending items use linked menuItemId price if available
  const linkedMenuItem =
    (type === 'trending' || type === 'running') && item.menuItemId && typeof item.menuItemId === 'object'
      ? item.menuItemId
      : null;

  const price =
    type === 'deal' ? item.price :
    type === 'trending' || type === 'running' ? (linkedMenuItem?.price ?? item.price ?? null) :
    item.price ?? null;

  const originalPrice =
    type === 'deal' ? item.originalPrice : null;

  const tags = item.tags || [];

  const discountLabel =
    type === 'deal' && item.discountType && item.discountValue
      ? item.discountType === 'percentage'
        ? `${item.discountValue}% OFF`
        : `${formatMoney(item.discountValue, currency)} OFF`
      : null;

  const canAddToCart =
    type === 'menuItem' ||
    type === 'deal' ||
    !!linkedMenuItem;

  const cartItem =
    type === 'menuItem' ? item :
    type === 'deal' ? { ...item, name: item.title } :
    linkedMenuItem || null;

  const handleAddToCart = () => {
    if (!cartItem) return;
    for (let i = 0; i < qty; i++) {
      add({ ...cartItem, specialInstructions: note || undefined });
    }
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1200);
  };

  // Close if clicking the backdrop
  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${name}`}
    >
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 grid h-8 w-8 place-items-center rounded-full bg-stone-900/60 text-white backdrop-blur-sm hover:bg-stone-900 transition"
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero image */}
        {image ? (
          <div className="relative h-56 sm:h-64 w-full overflow-hidden">
            <img src={cldImg(image, 700)} alt={name} className="h-full w-full object-cover" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Discount badge over image */}
            {discountLabel && (
              <div className="absolute left-4 bottom-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-black text-white shadow-lg">
                {discountLabel}
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-brand-900 via-stone-950 to-stone-900 flex items-center justify-center">
            <span className="text-7xl" role="img" aria-label="food">
              {type === 'deal' ? '🎁' : '🍗'}
            </span>
            {discountLabel && (
              <div className="absolute left-4 bottom-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-black text-white shadow-lg">
                {discountLabel}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">

          {/* Name and tags row */}
          <div>
            <div className="flex flex-wrap gap-1 mb-2">
              {type === 'deal' && (
                <span className="rounded bg-brand-50 border border-brand-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-brand-600">
                  LIMITED TIME DEAL
                </span>
              )}
              {(type === 'trending') && (
                <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-600">
                  🔥 TRENDING
                </span>
              )}
              {(type === 'running') && (
                <span className="rounded bg-green-50 border border-green-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-green-600">
                  ⭐ RUNNING NOW
                </span>
              )}
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded bg-stone-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-stone-500">
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="font-sans text-xl font-black tracking-tight text-stone-900 uppercase leading-tight">
              {name}
            </h2>

            {nameUrdu && (
              <div className="mt-1 text-right text-sm font-semibold text-stone-400" dir="rtl">
                {nameUrdu}
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-stone-600 leading-relaxed">
              {description}
            </p>
          )}

          {/* Price row */}
          {price != null && price > 0 && (
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-brand-600">
                {formatMoney(price * qty, currency)}
              </span>
              {originalPrice > 0 && (
                <span className="text-sm font-bold text-stone-400 line-through">
                  {formatMoney(originalPrice, currency)}
                </span>
              )}
              {originalPrice > 0 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-700">
                  Save {formatMoney(originalPrice - price, currency)}
                </span>
              )}
            </div>
          )}

          {/* Quantity picker */}
          {canAddToCart && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-stone-700 hover:bg-white hover:shadow-sm transition font-black text-lg"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-sm font-black text-stone-900">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-stone-700 hover:bg-white hover:shadow-sm transition font-black text-lg"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <span className="text-xs font-bold text-stone-400 tracking-wide">
                QTY
              </span>
            </div>
          )}

          {/* Special instructions */}
          {canAddToCart && (
            <div className="space-y-1.5">
              <label
                htmlFor="item-modal-instructions"
                className="block text-[10px] font-black uppercase tracking-widest text-stone-500"
              >
                Special Instructions <span className="text-stone-400 font-semibold normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                id="item-modal-instructions"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. No onions, extra spicy, less salt…"
                rows={2}
                maxLength={200}
                className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
              <div className="text-right text-[9px] text-stone-400 font-semibold">
                {note.length}/200
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50 py-3 text-xs font-black tracking-widest text-stone-700 hover:bg-stone-100 transition"
            >
              CLOSE
            </button>

            {canAddToCart ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={justAdded}
                className={`flex-[2] inline-flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black tracking-widest text-white transition-all duration-200 ${
                  justAdded
                    ? 'bg-green-500 scale-95'
                    : 'bg-brand-600 hover:bg-brand-500 hover:scale-[1.02] shadow-md shadow-brand-500/25'
                }`}
              >
                {justAdded ? (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                    </svg>
                    ADDED TO CART!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.4A2 2 0 0 0 9.4 18h8.5a2 2 0 0 0 2-1.6L21 8H6" />
                      <circle cx="9" cy="21" r="1.5" />
                      <circle cx="18" cy="21" r="1.5" />
                    </svg>
                    ADD TO CART
                  </>
                )}
              </button>
            ) : (
              <a
                href="/menu"
                className="flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-xs font-black tracking-widest text-white hover:bg-stone-800 transition"
              >
                VIEW FULL MENU →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { formatMoney } from '../../lib/format.js';
import { cldImg } from '../../lib/image.js';
import ItemModal from '../ui/ItemModal.jsx';

export default function DealCard({ deal, currency = 'PKR' }) {
  const [modalOpen, setModalOpen] = useState(false);

  const discount =
    deal.discountType === 'percentage'
      ? `${deal.discountValue}% OFF`
      : `${formatMoney(deal.discountValue, currency)} OFF`;

  // Remaining time label
  let timeLabel = null;
  if (deal.endDate) {
    const diff = new Date(deal.endDate) - Date.now();
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days > 0) timeLabel = `${days}d left`;
      else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        timeLabel = hours > 0 ? `${hours}h left` : 'Ends soon';
      }
    }
  }

  return (
    <>
      <article
        className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-brand-50 via-white to-amber-50 shadow-sm transition hover:shadow-md cursor-pointer"
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}
        aria-label={`View deal: ${deal.title}`}
      >
        {/* Discount badge */}
        <div className="absolute right-3 top-3 z-10 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
          {discount}
        </div>

        {deal.image ? (
          <div className="relative overflow-hidden h-40">
            <img
              src={cldImg(deal.image, 400)}
              alt={deal.title}
              className="h-full w-full object-cover transition group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-lg">
                VIEW DEAL
              </span>
            </div>
          </div>
        ) : (
          <div className="grid h-40 w-full place-items-center bg-gradient-to-br from-brand-100 to-amber-100 relative overflow-hidden">
            <svg className="h-12 w-12 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-lg">
                VIEW DEAL
              </span>
            </div>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-base font-semibold text-stone-900">{deal.title}</h3>
          {deal.description && (
            <p className="mt-1 line-clamp-2 text-sm text-stone-600">{deal.description}</p>
          )}
          
          {deal.price > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xl font-bold text-brand-600">{formatMoney(deal.price, currency)}</span>
              <span className="text-xs font-medium text-stone-400">Limited time deal</span>
            </div>
          )}

          {timeLabel && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              {timeLabel}
            </div>
          )}
        </div>
      </article>

      {/* Deal Detail Modal */}
      {modalOpen && (
        <ItemModal
          item={deal}
          type="deal"
          currency={currency}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

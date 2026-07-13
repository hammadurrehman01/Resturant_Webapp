import { useState } from 'react';
import { useCart } from '../../store/cart.js';
import { formatMoney } from '../../lib/format.js';
import ItemModal from '../ui/ItemModal.jsx';

export default function FeaturedItemCard({ item, currency = 'PKR', badge }) {
  const add = useCart((s) => s.add);
  const [justAdded, setJustAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const linkedItem = item.menuItemId && typeof item.menuItemId === 'object' ? item.menuItemId : null;
  const itemType = badge === 'Trending' ? 'trending' : 'running';

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!linkedItem) return;
    add(linkedItem);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const BADGE_STYLES = {
    Trending: 'bg-gold-400 text-stone-950 font-black',
    Running:  'bg-brand-600 text-white font-black',
  };

  return (
    <>
      <article
        className="card-premium group relative flex flex-col border border-stone-200 cursor-pointer"
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}
        aria-label={`View details for ${item.title}`}
      >
        {/* Badge */}
        {badge && (
          <div className={`absolute left-3 top-3 z-10 rounded px-2.5 py-0.5 text-[9px] uppercase tracking-widest shadow-lg ${BADGE_STYLES[badge] || 'bg-brand-600 text-white'}`}>
            {badge}
          </div>
        )}

        {/* Image */}
        {item.image ? (
          <div className="relative overflow-hidden h-52">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Hover hint */}
            <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-lg">
                TAP TO ORDER
              </span>
            </div>
          </div>
        ) : (
          <div className="h-52 w-full bg-stone-100 flex items-center justify-center relative group-hover:bg-stone-200 transition-colors">
            <div className="text-5xl animate-float">🍗</div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-lg">
                TAP TO ORDER
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col p-5 bg-white">
          <h3 className="text-base font-black text-stone-900 leading-snug tracking-tight uppercase">{item.title}</h3>
          {item.description && (
            <p className="mt-2 line-clamp-2 text-xs text-stone-500 leading-relaxed">{item.description}</p>
          )}

          <div className="mt-5 flex items-center justify-between gap-2 border-t border-stone-100 pt-4">
            {item.price > 0 ? (
              <span className="text-lg font-black text-brand-600">
                {formatMoney(item.price, currency)}
              </span>
            ) : (
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Special</span>
            )}

            {linkedItem ? (
              <button
                onClick={handleQuickAdd}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[10px] font-black tracking-widest uppercase transition-all duration-200 ${
                  justAdded
                    ? 'bg-green-500 text-white scale-95'
                    : 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-105'
                }`}
                aria-label={justAdded ? 'Added' : `Add ${item.title} to cart`}
              >
                {justAdded ? (
                  <>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                    </svg>
                    ADDED
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                    ADD TO CART
                  </>
                )}
              </button>
            ) : (
              <span className="text-[10px] font-bold text-stone-400 tracking-wider">VIEW ON MENU</span>
            )}
          </div>
        </div>
      </article>

      {/* Detail Modal */}
      {modalOpen && (
        <ItemModal
          item={item}
          type={itemType}
          currency={currency}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

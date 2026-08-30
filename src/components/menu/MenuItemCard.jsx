import { useState } from 'react';
import { useCart } from '../../store/cart.js';
import { formatMoney } from '../../lib/format.js';
import { cldImg } from '../../lib/image.js';
import ItemModal from '../ui/ItemModal.jsx';

export default function MenuItemCard({ item, currency = 'PKR' }) {
  const add = useCart((s) => s.add);
  const [justAdded, setJustAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    add(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1300);
  };

  return (
    <>
      <article
        className="card-premium group flex flex-col border border-stone-200 cursor-pointer"
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}
        aria-label={`View details for ${item.name}`}
      >
        {/* Image */}
        {item.image ? (
          <div className="relative overflow-hidden h-44">
            <img
              src={cldImg(item.image, 400)}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Quick-view hint on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-lg">
                TAP TO ORDER
              </span>
            </div>
          </div>
        ) : (
          <div className="h-44 w-full bg-stone-100 flex items-center justify-center relative group-hover:bg-stone-200 transition-colors">
            <span className="text-4xl opacity-50">🍗</span>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-white/90 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-stone-900 shadow-lg">
                TAP TO ORDER
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 bg-white justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-tight leading-tight">{item.name}</h3>
              <span className="shrink-0 text-sm font-black text-brand-600 whitespace-nowrap">
                {formatMoney(item.price, currency)}
              </span>
            </div>
            
            {item.nameUrdu && (
              <div className="urdu mt-1 text-right text-xs font-semibold text-stone-400" dir="rtl">{item.nameUrdu}</div>
            )}

            {item.description && (
              <p className="mt-2 line-clamp-2 text-xs text-stone-500 leading-relaxed">{item.description}</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
            <div className="flex flex-wrap gap-1 min-w-0">
              {item.tags?.slice(0, 1).map((tag) => (
                <span key={tag} className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-stone-500">
                  {tag}
                </span>
              ))}
            </div>
            
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`shrink-0 inline-flex items-center gap-1 rounded px-3 py-2 text-[9px] font-black tracking-widest uppercase transition-all duration-200 ${
                justAdded
                  ? 'bg-green-500 text-white scale-95'
                  : 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-105'
              }`}
              aria-label={justAdded ? 'Added' : `Add ${item.name} to cart`}
            >
              {justAdded ? (
                <>
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                  </svg>
                  ADDED
                </>
              ) : (
                <>
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                  </svg>
                  ADD
                </>
              )}
            </button>
          </div>
        </div>
      </article>

      {/* Detail Modal */}
      {modalOpen && (
        <ItemModal
          item={item}
          type="menuItem"
          currency={currency}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

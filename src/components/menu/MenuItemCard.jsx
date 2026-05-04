import { useState } from 'react';
import { useCart } from '../../store/cart.js';
import { useUI } from '../../store/ui.js';
import { formatMoney } from '../../lib/format.js';

export default function MenuItemCard({ item, currency = 'PKR' }) {
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    add(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="grid h-40 w-full place-items-center bg-stone-100 text-stone-400">
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18v14H3z M3 15l4-4 4 4 4-4 6 6" />
          </svg>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-stone-900">{item.name}</h3>
            {item.nameUrdu && (
              <div className="urdu mt-0.5 text-sm text-stone-500" dir="rtl">{item.nameUrdu}</div>
            )}
          </div>
          <div className="shrink-0 text-right text-sm font-semibold text-brand-700">
            {formatMoney(item.price, currency)}
          </div>
        </div>
        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm text-stone-600">{item.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="ml-auto inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {justAdded ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                </svg>
                Added
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

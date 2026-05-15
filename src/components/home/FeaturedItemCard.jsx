import { formatMoney } from '../../lib/format.js';

export default function FeaturedItemCard({ item, currency = 'PKR', badge }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      {badge && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-brand-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          {badge}
        </div>
      )}
      
      {item.image ? (
        <img
          src={item.image}
          alt={item.title}
          className="h-48 w-full object-cover transition group-hover:scale-[1.03]"
          loading="lazy"
        />
      ) : (
        <div className="grid h-48 w-full place-items-center bg-stone-100">
           <svg className="h-12 w-12 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18v14H3z M3 15l4-4 4 4 4-4 6 6" />
          </svg>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-stone-900">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-600">{item.description}</p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          {item.price > 0 ? (
            <span className="text-lg font-bold text-brand-600">
              {formatMoney(item.price, currency)}
            </span>
          ) : (
            <span className="text-sm font-medium text-stone-400 italic">Special Feature</span>
          )}
          
          <button className="rounded-lg bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-stone-800">
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

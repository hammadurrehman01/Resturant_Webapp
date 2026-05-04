import { useMemo, useState } from 'react';
import useMenu from '../hooks/useMenu.js';
import useRestaurant from '../hooks/useRestaurant.js';
import MenuItemCard from '../components/menu/MenuItemCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function MenuPage() {
  const { menu, loading, error } = useMenu();
  const { restaurant } = useRestaurant();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    if (!menu) return [];
    const q = query.trim().toLowerCase();
    return menu
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((it) => {
          if (activeCategory !== 'all' && String(cat._id) !== activeCategory) return false;
          if (!q) return true;
          return (
            it.name.toLowerCase().includes(q) ||
            (it.description || '').toLowerCase().includes(q) ||
            (it.tags || []).some((t) => t.toLowerCase().includes(q)) ||
            (it.nameUrdu && it.nameUrdu.includes(query))
          );
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [menu, query, activeCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Menu</h1>
        <div className="relative w-full max-w-xs">
          <input
            type="search"
            placeholder="Search dishes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-9"
          />
          <svg className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
          </svg>
        </div>
      </div>

      {menu && menu.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <CategoryPill
            active={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
          >
            All
          </CategoryPill>
          {menu.map((cat) => (
            <CategoryPill
              key={cat._id || 'other'}
              active={activeCategory === String(cat._id)}
              onClick={() => setActiveCategory(String(cat._id))}
            >
              {cat.name}
            </CategoryPill>
          ))}
        </div>
      )}

      {loading && <div className="flex justify-center py-16"><Spinner /></div>}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load the menu: {error.message}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white py-16 text-center text-sm text-stone-500">
          No items match your search.
        </div>
      )}

      <div className="space-y-10">
        {filtered.map((cat) => (
          <section key={cat._id || 'other'}>
            <h2 className="mb-4 text-lg font-semibold text-stone-900">{cat.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => (
                <MenuItemCard key={item._id} item={item} currency={restaurant?.currency} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CategoryPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
      }`}
    >
      {children}
    </button>
  );
}

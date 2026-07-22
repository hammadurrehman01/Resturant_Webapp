import { useMemo, useState } from 'react';
import useMenu from '../hooks/useMenu.js';
import useRestaurant from '../hooks/useRestaurant.js';
import useTrending from '../hooks/useTrending.js';
import MenuItemCard from '../components/menu/MenuItemCard.jsx';
import FeaturedItemCard from '../components/home/FeaturedItemCard.jsx';
import { SkeletonMenuItemCard } from '../components/ui/Skeleton.jsx';

const CATEGORY_EMOJIS = {
  Biryani: '🍛',
  BBQ: '🍖',
  Drinks: '🥤',
  Desserts: '🍰',
  Burgers: '🍔',
  Pizza: '🍕',
  Karahi: '🥘',
  Kebabs: '🔥',
  Salads: '🥗',
  Soup: '🍜',
  Breakfast: '🍳',
  Snacks: '🥙',
};

function getEmoji(name = '') {
  const key = Object.keys(CATEGORY_EMOJIS).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return key ? CATEGORY_EMOJIS[key] : '🍽️';
}

export default function MenuPage() {
  const { menu, loading, error } = useMenu();
  const { restaurant } = useRestaurant();
  const { items: trending, loading: trendingLoading } = useTrending();
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
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-10">

      {/* ---- Page header ---- */}
      <div className="rounded-2xl bg-stone-950 border border-stone-900 px-8 py-12 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded bg-brand-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow mb-4">
            🍽️ OUR KITCHEN
          </div>
          <h1 className="font-sans text-4xl font-black uppercase tracking-tight text-white">OUR MENU</h1>
          <p className="mt-2 text-stone-400 text-xs tracking-wider max-w-md uppercase">
            EXPLORE THE FULL RANGE OF CRISPY BITES & SIGNATURE MEAL COMBOS
          </p>
        </div>
      </div>

      {/* ---- Trending on menu page ---- */}
      {trendingLoading ? null : trending && trending.length > 0 ? (
        <section>
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 border border-gold-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gold-600 mb-2">
              🔥 TOP CHOICES
            </div>
            <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-stone-900">TODAY'S TRENDING DISHES</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.slice(0, 3).map((item) => (
              <FeaturedItemCard key={item._id} item={item} currency={restaurant?.currency} badge="Trending" />
            ))}
          </div>
        </section>
      ) : null}

      {/* ---- Search + Category filter ---- */}
      <div className="sticky top-[72px] z-20 -mx-4 bg-stone-50/95 backdrop-blur-md px-4 py-3.5 border-b border-stone-200/60">
        <div className="flex flex-wrap items-center gap-3 max-w-6xl mx-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="SEARCH MENU ITEMS..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-10 font-bold uppercase tracking-widest text-xs"
            />
          </div>

          {/* Category pills */}
          {menu && menu.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <CategoryPill
                active={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                emoji="🍽️"
              >
                ALL
              </CategoryPill>
              {menu.map((cat) => (
                <CategoryPill
                  key={cat._id || 'other'}
                  active={activeCategory === String(cat._id)}
                  onClick={() => setActiveCategory(String(cat._id))}
                  emoji={getEmoji(cat.name)}
                >
                  {cat.name.toUpperCase()}
                </CategoryPill>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- States ---- */}
      {loading && <SkeletonMenuItemCard count={8} />}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 font-bold">
          COULDN'T LOAD MENU: {error.message}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-20 text-center">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-sm font-black text-stone-500 uppercase">NO DISHES MATCH YOUR SEARCH.</p>
          <button
            onClick={() => { setQuery(''); setActiveCategory('all'); }}
            className="btn-secondary mt-4 text-xs font-black uppercase tracking-widest"
          >
            CLEAR FILTERS
          </button>
        </div>
      )}

      {/* ---- Menu categories ---- */}
      <div className="space-y-12">
        {filtered.map((cat) => (
          <section key={cat._id || 'other'}>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-2xl">{getEmoji(cat.name)}</span>
              <div>
                <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">{cat.name}</h2>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{cat.items.length} ITEM{cat.items.length !== 1 ? 'S' : ''}</p>
              </div>
            </div>
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

function CategoryPill({ active, onClick, children, emoji }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[10px] font-black tracking-widest transition-all duration-200 ${active
          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
          : 'border border-stone-200 bg-white text-stone-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600'
        }`}
    >
      <span>{emoji}</span>
      {children}
    </button>
  );
}

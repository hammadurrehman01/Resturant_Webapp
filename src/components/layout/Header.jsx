import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../store/cart.js';
import { useUI } from '../../store/ui.js';
import useRestaurant from '../../hooks/useRestaurant.js';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About' },
  { to: '/track', label: 'Track' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const count = useCart((s) => s.count());
  const openCart = useUI((s) => s.openCart);
  const { restaurant } = useRestaurant();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-bold text-white">
            {(restaurant?.name?.[0] || 'R').toUpperCase()}
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {restaurant?.name || 'Restaurant'}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 sm:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-700 hover:bg-stone-100'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="relative ml-auto inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 sm:ml-2"
          aria-label="Open cart"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.4A2 2 0 0 0 9.4 18h8.5a2 2 0 0 0 2-1.6L21 8H6" />
            <circle cx="9" cy="21" r="1.5" />
            <circle cx="18" cy="21" r="1.5" />
          </svg>
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="absolute -right-2 -top-2 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-stone-700 hover:bg-stone-100'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

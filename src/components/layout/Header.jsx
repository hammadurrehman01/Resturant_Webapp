import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../store/cart.js';
import { useUI } from '../../store/ui.js';
import useRestaurant from '../../hooks/useRestaurant.js';

const NAV = [
    { to: '/', label: 'HOME', end: true },
    { to: '/menu', label: 'OUR MENU' },
    { to: '/about', label: 'ABOUT US' },
    { to: '/track', label: 'TRACK ORDER' },
    { to: '/contact', label: 'CONTACT' },
];

export default function Header() {
    const count = useCart((s) => s.count());
    const openCart = useUI((s) => s.openCart);
    const { restaurant, loading } = useRestaurant();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-stone-950 border-b border-stone-900 shadow-lg">
            <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-4 sm:px-6 py-3.5">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 font-bold text-white text-lg shadow-md shadow-brand-500/20 transition-transform duration-200 group-hover:scale-105">
                        {loading ? (
                            <div className="h-5 w-5 bg-stone-800/80 rounded animate-pulse" />
                        ) : (
                            (restaurant?.name?.[0] || '').toUpperCase()
                        )}
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400 border-2 border-stone-950" title="Open now" />
                    </div>
                    <div>
                        {loading ? (
                            <div className="space-y-1.5 py-0.5">
                                <div className="h-4 w-28 bg-stone-800 rounded animate-pulse" />
                                <div className="h-2.5 w-20 bg-stone-900 rounded animate-pulse" />
                            </div>
                        ) : (
                            <>
                                <div className="text-base font-extrabold tracking-wider text-white leading-tight uppercase font-sans">
                                    {restaurant?.name}
                                </div>
                                {restaurant?.slogan && (
                                    <div className="text-[10px] font-bold text-gold-400 uppercase tracking-widest leading-none">
                                        {restaurant.slogan}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="ml-auto hidden items-center gap-2 sm:flex">
                    {NAV.map((n) => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.end}
                            className={({ isActive }) =>
                                `px-3.5 py-2 text-xs font-black tracking-widest transition-all duration-200 ${isActive
                                    ? 'text-gold-400 border-b-2 border-gold-400'
                                    : 'text-stone-300 hover:text-white'
                                }`
                            }
                        >
                            {n.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Cart button */}
                <button
                    type="button"
                    onClick={openCart}
                    className="relative ml-2 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-black tracking-widest text-white shadow-md shadow-brand-500/20 transition-all duration-200 hover:bg-brand-500 hover:scale-105"
                    aria-label="Open cart"
                >
                    <svg className="h-4.5 w-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 12.4A2 2 0 0 0 9.4 18h8.5a2 2 0 0 0 2-1.6L21 8H6" />
                        <circle cx="9" cy="21" r="1.5" />
                        <circle cx="18" cy="21" r="1.5" />
                    </svg>
                    <span className="hidden sm:inline">CART</span>
                    {count > 0 && (
                        <span className="absolute -right-2 -top-2 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-gold-400 px-1 text-[10px] font-black text-stone-950 shadow">
                            {count}
                        </span>
                    )}
                </button>

                {/* Mobile menu toggle */}
                <button
                    type="button"
                    onClick={() => setMobileOpen((v) => !v)}
                    className="ml-1 grid h-9 w-9 place-items-center rounded-xl text-stone-400 hover:bg-stone-900 sm:hidden transition"
                    aria-label="Toggle menu"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {mobileOpen
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        }
                    </svg>
                </button>
            </div>

            {/* Mobile nav */}
            {mobileOpen && (
                <div className="border-t border-stone-900 bg-stone-950 px-4 pb-4 sm:hidden">
                    <nav className="mt-2 flex flex-col gap-0.5">
                        {NAV.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                end={n.end}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `rounded-xl px-4 py-3 text-xs font-black tracking-widest transition ${isActive ? 'bg-stone-900 text-gold-400' : 'text-stone-300 hover:bg-stone-900'
                                    }`
                                }
                            >
                                {n.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}

import { Link } from 'react-router-dom';
import useRestaurant from '../../hooks/useRestaurant.js';

const LINKS = [
    { to: '/menu', label: 'Our Menu' },
    { to: '/order', label: 'Place an Order' },
    { to: '/track', label: 'Track My Order' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
];

export default function Footer() {
    const { restaurant } = useRestaurant();
    const year = new Date().getFullYear();

    return (
        <footer className="mt-20 bg-gradient-to-b from-stone-900 to-stone-950 text-stone-300">
            <div className="mx-auto max-w-[1380px] px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-3">
                {/* Brand */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white text-lg shadow-lg shadow-brand-700/40">
                            {restaurant?.logo ? (
                                <img src={restaurant.logo} alt={restaurant?.name || 'Logo'} className="h-full w-full object-cover" />
                            ) : (
                                (restaurant?.name?.[0] || 'R').toUpperCase()
                            )}
                        </div>
                        <div>
                            <div className="text-base font-bold text-white">{restaurant?.name || 'Restaurant'}</div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider">{restaurant?.slogan || 'Fine Dining & Delivery'}</div>
                        </div>
                    </div>
                    {restaurant?.description && (
                        <p className="text-sm leading-relaxed text-stone-400 max-w-xs">{restaurant.description}</p>
                    )}
                    <div className="mt-5 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-medium text-green-400">Open for delivery</span>
                    </div>
                </div>

                {/* Contact info */}
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Find Us</div>
                    {restaurant?.address && (
                        <p className="text-sm text-stone-400 leading-relaxed mb-3">
                            {[restaurant.address.line1, restaurant.address.city, restaurant.address.country].filter(Boolean).join(', ')}
                        </p>
                    )}
                    {restaurant?.contact?.phone && (
                        <a href={`tel:${restaurant.contact.phone}`} className="flex items-center gap-2 text-sm text-stone-400 hover:text-brand-400 transition mb-2">
                            <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 6a2 2 0 0 1 2-2z" />
                            </svg>
                            {restaurant.contact.phone}
                        </a>
                    )}
                    {restaurant?.contact?.email && (
                        <a href={`mailto:${restaurant.contact.email}`} className="flex items-center gap-2 text-sm text-stone-400 hover:text-brand-400 transition">
                            <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z M4 6l8 7 8-7" />
                            </svg>
                            {restaurant.contact.email}
                        </a>
                    )}
                </div>

                {/* Quick links */}
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Quick Links</div>
                    <ul className="space-y-2">
                        {LINKS.map((l) => (
                            <li key={l.to}>
                                <Link
                                    to={l.to}
                                    className="text-sm text-stone-400 hover:text-brand-400 transition flex items-center gap-2 group"
                                >
                                    <span className="h-px w-3 bg-stone-700 group-hover:w-5 group-hover:bg-brand-500 transition-all duration-200" />
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-stone-800">
                <div className="mx-auto max-w-[1380px] px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
                    <span>© {year} {restaurant?.name || 'Restaurant'}. All rights reserved.</span>
                    <span className="text-stone-700">Made with ❤️ for food lovers</span>
                </div>
            </div>
        </footer>
    );
}

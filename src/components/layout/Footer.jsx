import { Link } from 'react-router-dom';
import useRestaurant from '../../hooks/useRestaurant.js';

export default function Footer() {
  const { restaurant } = useRestaurant();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-lg font-semibold">{restaurant?.name || 'Restaurant'}</div>
          {restaurant?.description && (
            <p className="mt-2 text-sm text-stone-600">{restaurant.description}</p>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-stone-900">Visit</div>
          {restaurant?.address && (
            <p className="mt-2 text-sm text-stone-600">
              {[restaurant.address.line1, restaurant.address.city, restaurant.address.country]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          {restaurant?.contact?.phone && (
            <p className="mt-1 text-sm text-stone-600">Phone: {restaurant.contact.phone}</p>
          )}
          {restaurant?.contact?.email && (
            <p className="mt-1 text-sm text-stone-600">Email: {restaurant.contact.email}</p>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-stone-900">Quick links</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/menu" className="text-stone-600 hover:text-brand-600">Menu</Link></li>
            <li><Link to="/order" className="text-stone-600 hover:text-brand-600">Order</Link></li>
            <li><Link to="/track" className="text-stone-600 hover:text-brand-600">Track Order</Link></li>
            <li><Link to="/contact" className="text-stone-600 hover:text-brand-600">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-stone-500">
          © {year} {restaurant?.name || 'Restaurant'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import useRestaurant from '../hooks/useRestaurant.js';
import useMenu from '../hooks/useMenu.js';
import useDeals from '../hooks/useDeals.js';
import MenuItemCard from '../components/menu/MenuItemCard.jsx';
import DealCard from '../components/deals/DealCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function HomePage() {
  const { restaurant } = useRestaurant();
  const { menu, loading } = useMenu();
  const { deals, loading: dealsLoading } = useDeals();

  // "Featured" = first 4 items across all categories (cheap heuristic for the
  // homepage hero strip; admin can later tag items as featured if desired).
  const featured = (menu || []).flatMap((c) => c.items).slice(0, 4);

  return (
    <div className="space-y-12">
      <section className="grid gap-6 rounded-3xl bg-gradient-to-br from-brand-50 via-white to-stone-50 p-8 sm:grid-cols-2 sm:p-12">
        <div className="flex flex-col justify-center">
          <span className="inline-block w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
            Now delivering
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Fresh, fast, made to order at {restaurant?.name || 'our kitchen'}.
          </h1>
          <p className="mt-3 max-w-prose text-stone-600">
            {restaurant?.description ||
              'Authentic flavors, hot from the kitchen to your door. Browse the menu, place an order, or chat with us in Urdu.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/menu" className="btn-primary">View menu</Link>
            <Link to="/track" className="btn-secondary">Track an order</Link>
          </div>
        </div>
        <div className="hidden sm:flex sm:items-center sm:justify-center">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-24 rounded-2xl ${
                  ['bg-brand-100', 'bg-amber-100', 'bg-orange-100', 'bg-yellow-100'][i]
                } shadow-inner`}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Deals ---- */}
      {dealsLoading ? (
        <section>
          <div className="flex justify-center py-6"><Spinner /></div>
        </section>
      ) : deals && deals.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">🔥 Hot Deals</h2>
              <p className="mt-0.5 text-sm text-stone-500">Limited-time offers you don't want to miss</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal._id} deal={deal} currency={restaurant?.currency} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Popular right now</h2>
          <Link to="/menu" className="text-sm font-medium text-brand-700 hover:text-brand-800">See all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white py-12 text-center text-sm text-stone-500">
            Menu coming soon.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <MenuItemCard key={item._id} item={item} currency={restaurant?.currency} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-3">
        <Feature title="Order in any language" body="Chat with our assistant in English, Urdu, or Roman Urdu — pick what feels natural." />
        <Feature title="Track every step" body="Get real-time updates from kitchen to door with your order number." />
        <Feature title="Hot, fresh, fast" body="Made to order, packed with care, delivered while it's still steaming." />
      </section>
    </div>
  );
}

function Feature({ title, body }) {
  return (
    <div>
      <div className="text-sm font-semibold text-stone-900">{title}</div>
      <p className="mt-1 text-sm text-stone-600">{body}</p>
    </div>
  );
}


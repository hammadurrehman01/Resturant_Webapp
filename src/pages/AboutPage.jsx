import useRestaurant from '../hooks/useRestaurant.js';
import Spinner from '../components/ui/Spinner.jsx';

const DAY_LABELS = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function AboutPage() {
  const { restaurant, loading } = useRestaurant();

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!restaurant) return <div className="text-stone-600">Restaurant info unavailable.</div>;

  // Sort opening hours by canonical week order so display is consistent regardless of admin entry order.
  const hours = (restaurant.openingHours || [])
    .slice()
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <header className="md:col-span-3">
        <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
        {restaurant.description && (
          <p className="mt-2 max-w-prose text-stone-600">{restaurant.description}</p>
        )}
      </header>

      <div className="card md:col-span-1">
        <h2 className="text-base font-semibold">Hours</h2>
        {hours.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">Hours not yet published.</p>
        ) : (
          <dl className="mt-3 space-y-1.5 text-sm">
            {hours.map((h) => (
              <div key={h.day} className="flex justify-between">
                <dt className="text-stone-700">{DAY_LABELS[h.day]}</dt>
                <dd className={h.closed ? 'text-stone-400' : 'text-stone-900'}>
                  {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="card md:col-span-1">
        <h2 className="text-base font-semibold">Visit us</h2>
        {restaurant.address ? (
          <address className="mt-3 not-italic text-sm leading-relaxed text-stone-700">
            {restaurant.address.line1 && <div>{restaurant.address.line1}</div>}
            {restaurant.address.line2 && <div>{restaurant.address.line2}</div>}
            <div>
              {[restaurant.address.city, restaurant.address.postalCode].filter(Boolean).join(' ')}
            </div>
            <div>{restaurant.address.country}</div>
          </address>
        ) : (
          <p className="mt-2 text-sm text-stone-500">Address coming soon.</p>
        )}
      </div>

      <div className="card md:col-span-1">
        <h2 className="text-base font-semibold">Reach us</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
          {restaurant.contact?.phone && <li>Phone: <a className="text-brand-700 hover:underline" href={`tel:${restaurant.contact.phone}`}>{restaurant.contact.phone}</a></li>}
          {restaurant.contact?.whatsapp && <li>WhatsApp: {restaurant.contact.whatsapp}</li>}
          {restaurant.contact?.email && <li>Email: <a className="text-brand-700 hover:underline" href={`mailto:${restaurant.contact.email}`}>{restaurant.contact.email}</a></li>}
        </ul>
      </div>
    </div>
  );
}

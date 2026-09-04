import useRestaurant from '../hooks/useRestaurant.js';
import { SkeletonAboutPage } from '../components/ui/Skeleton.jsx';

const DAY_LABELS = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_SHORT = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

const TODAY_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];

// Converts a 24-hour "HH:MM" string to a 12-hour "h:MM AM/PM" label.
function to12h(t) {
  if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return t || '';
  const [h, m] = t.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export default function AboutPage() {
  const { restaurant, loading } = useRestaurant();

  if (loading) return <SkeletonAboutPage />;
  if (!restaurant) return <div className="text-stone-500 py-10 text-center">Restaurant info unavailable.</div>;

  const hours = (restaurant.openingHours || [])
    .slice()
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  const todayHours = hours.find((h) => h.day === TODAY_KEY);

  // Prefer the exact pin the admin dropped on the map; fall back to a text
  // address search so the button still works before a pin is set.
  const hasLocation =
    restaurant.location &&
    typeof restaurant.location.lat === 'number' &&
    typeof restaurant.location.lng === 'number';
  const addressQuery = restaurant.address
    ? [restaurant.address.line1, restaurant.address.city, restaurant.address.country].filter(Boolean).join(', ')
    : '';
  const mapHref = hasLocation
    ? `https://www.google.com/maps/search/?api=1&query=${restaurant.location.lat},${restaurant.location.lng}`
    : addressQuery
      ? `https://maps.google.com/?q=${encodeURIComponent(addressQuery)}`
      : '';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-12">

      {/* ---- Hero ---- */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient px-8 py-14 text-white sm:px-14">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="relative">
          <div className="section-badge mb-4 border-brand-400/30 bg-brand-500/20 text-brand-200">
            🏠 Our Story
          </div>
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-300">
              {restaurant.description}
            </p>
          )}
          {todayHours && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 text-sm text-green-300">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              {todayHours.closed
                ? 'Closed today'
                : `Open today: ${to12h(todayHours.open)} – ${to12h(todayHours.close)}`}
            </div>
          )}
        </div>
      </div>

      {/* ---- Story + Values ---- */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { emoji: '👨‍🍳', title: 'Authentic Recipes', body: 'Every dish is prepared following generations-old recipes, ensuring the most authentic flavors on every plate.' },
          { emoji: '🌿', title: 'Fresh Ingredients', body: 'We source only the freshest, finest-quality ingredients daily — because great food starts with great produce.' },
          { emoji: '❤️', title: 'Made with Love', body: 'Our kitchen team puts heart and soul into every dish, turning each meal into a memorable experience.' },
        ].map((v) => (
          <div key={v.title} className="card-premium p-6 text-center">
            <div className="mb-3 text-4xl">{v.emoji}</div>
            <h3 className="text-base font-bold text-stone-900 mb-2">{v.title}</h3>
            <p className="text-sm text-stone-500 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      {/* ---- Info Cards ---- */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* Opening Hours */}
        <div className="card md:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🕐</span>
            <h2 className="text-base font-bold text-stone-900">Opening Hours</h2>
          </div>
          {hours.length === 0 ? (
            <p className="text-sm text-stone-400">Hours not yet published.</p>
          ) : (
            <dl className="space-y-2">
              {hours.map((h) => {
                const isToday = h.day === TODAY_KEY;
                return (
                  <div
                    key={h.day}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${isToday ? 'bg-brand-50 border border-brand-100' : ''
                      }`}
                  >
                    <dt className={`font-medium ${isToday ? 'text-brand-800' : 'text-stone-600'}`}>
                      {DAY_LABELS[h.day]}
                      {isToday && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-brand-600">Today</span>}
                    </dt>
                    <dd className={h.closed ? 'text-stone-400 italic text-xs' : isToday ? 'font-semibold text-brand-700' : 'text-stone-800 text-xs'}>
                      {h.closed ? 'Closed' : `${to12h(h.open)} – ${to12h(h.close)}`}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>

        {/* Location */}
        <div className="card md:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h2 className="text-base font-bold text-stone-900">Visit Us</h2>
          </div>
          {(restaurant.address || hasLocation) ? (
            <>
              {restaurant.address && (
                <address className="not-italic text-sm leading-relaxed text-stone-600 space-y-1">
                  {restaurant.address.line1 && <div className="font-medium text-stone-800">{restaurant.address.line1}</div>}
                  {restaurant.address.line2 && <div>{restaurant.address.line2}</div>}
                  <div>{[restaurant.address.city, restaurant.address.postalCode].filter(Boolean).join(' ')}</div>
                  <div>{restaurant.address.country}</div>
                </address>
              )}
              {mapHref && (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
                >
                  View on Maps →
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-stone-400">Address coming soon.</p>
          )}
        </div>

        {/* Contact */}
        <div className="card md:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">📞</span>
            <h2 className="text-base font-bold text-stone-900">Reach Us</h2>
          </div>
          <ul className="space-y-3">
            {restaurant.contact?.phone && (
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 text-sm">📱</span>
                <a className="text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline" href={`tel:${restaurant.contact.phone}`}>
                  {restaurant.contact.phone}
                </a>
              </li>
            )}
            {restaurant.contact?.whatsapp && (
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-50 text-green-600 text-sm">💬</span>
                <a
                  className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
                  href={`https://wa.me/${restaurant.contact.whatsapp.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  WhatsApp: {restaurant.contact.whatsapp}
                </a>
              </li>
            )}
            {restaurant.contact?.email && (
              <li className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 text-sm">✉️</span>
                <a className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline" href={`mailto:${restaurant.contact.email}`}>
                  {restaurant.contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

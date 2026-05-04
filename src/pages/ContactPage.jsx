import useRestaurant from '../hooks/useRestaurant.js';
import { useUI } from '../store/ui.js';
import Spinner from '../components/ui/Spinner.jsx';

export default function ContactPage() {
  const { restaurant, loading } = useRestaurant();
  const toggleChat = useUI((s) => s.toggleChat);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Get in touch</h1>
        <p className="mt-2 text-stone-600">
          We'd love to hear from you. Call us, email, or just say hi to our chatbot — we speak English, Roman Urdu, and اردو.
        </p>
        <button onClick={toggleChat} className="btn-primary mt-6">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0 1 18 0c0 4.97-4.03 9-9 9-1.5 0-2.92-.37-4.16-1.02L3 21l1.07-4.84A8.96 8.96 0 0 1 3 12z" />
          </svg>
          Open chat
        </button>
      </div>

      <div className="card space-y-3">
        {restaurant?.contact?.phone && (
          <ContactRow
            icon="phone"
            label="Phone"
            value={restaurant.contact.phone}
            href={`tel:${restaurant.contact.phone}`}
          />
        )}
        {restaurant?.contact?.whatsapp && (
          <ContactRow icon="whatsapp" label="WhatsApp" value={restaurant.contact.whatsapp} />
        )}
        {restaurant?.contact?.email && (
          <ContactRow
            icon="email"
            label="Email"
            value={restaurant.contact.email}
            href={`mailto:${restaurant.contact.email}`}
          />
        )}
        {restaurant?.address && (
          <ContactRow
            icon="pin"
            label="Address"
            value={[
              restaurant.address.line1,
              restaurant.address.city,
              restaurant.address.country,
            ].filter(Boolean).join(', ')}
          />
        )}
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, href }) {
  const Body = href ? (
    <a href={href} className="text-brand-700 hover:underline">{value}</a>
  ) : (
    <span className="text-stone-800">{value}</span>
  );
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
        <Icon name={icon} />
      </span>
      <div>
        <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
        <div className="text-sm">{Body}</div>
      </div>
    </div>
  );
}

function Icon({ name }) {
  const common = { className: 'h-4 w-4', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
  if (name === 'phone') {
    return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M5 4h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>;
  }
  if (name === 'email') {
    return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z M4 6l8 7 8-7" /></svg>;
  }
  if (name === 'pin') {
    return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>;
  }
  return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
}

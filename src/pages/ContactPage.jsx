import useRestaurant from '../hooks/useRestaurant.js';
import { useUI } from '../store/ui.js';
import Spinner from '../components/ui/Spinner.jsx';

const CONTACT_ITEMS = (restaurant, toggleChat) => [
  restaurant?.contact?.phone && {
    emoji: '📱',
    label: 'Phone',
    value: restaurant.contact.phone,
    href: `tel:${restaurant.contact.phone}`,
    color: 'brand',
    hint: 'Tap to call us directly',
  },
  restaurant?.contact?.whatsapp && {
    emoji: '💬',
    label: 'WhatsApp',
    value: restaurant.contact.whatsapp,
    href: `https://wa.me/${restaurant.contact.whatsapp.replace(/\D/g, '')}`,
    color: 'green',
    hint: 'Chat with us on WhatsApp',
    external: true,
  },
  restaurant?.contact?.email && {
    emoji: '✉️',
    label: 'Email',
    value: restaurant.contact.email,
    href: `mailto:${restaurant.contact.email}`,
    color: 'blue',
    hint: 'Send us an email anytime',
  },
  restaurant?.address && {
    emoji: '📍',
    label: 'Address',
    value: [restaurant.address.line1, restaurant.address.city, restaurant.address.country].filter(Boolean).join(', '),
    href: `https://maps.google.com/?q=${encodeURIComponent([restaurant.address.line1, restaurant.address.city, restaurant.address.country].filter(Boolean).join(', '))}`,
    color: 'amber',
    hint: 'View on Google Maps',
    external: true,
  },
].filter(Boolean);

const COLOR_MAP = {
  brand: { bg: 'bg-brand-50', icon: 'text-brand-600', link: 'text-brand-700 hover:text-brand-800', ring: 'ring-brand-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', link: 'text-green-700 hover:text-green-800', ring: 'ring-green-100' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', link: 'text-blue-700 hover:text-blue-800', ring: 'ring-blue-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', link: 'text-amber-700 hover:text-amber-800', ring: 'ring-amber-100' },
};

export default function ContactPage() {
  const { restaurant, loading } = useRestaurant();
  const toggleChat = useUI((s) => s.toggleChat);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const items = CONTACT_ITEMS(restaurant, toggleChat);

  return (
    <div className="space-y-10">

      {/* ---- Hero ---- */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient px-8 py-14 text-white sm:px-14">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="relative grid gap-6 sm:grid-cols-2 items-center">
          <div>
            <div className="section-badge mb-4 border-brand-400/30 bg-brand-500/20 text-brand-200">
              📞 Get in Touch
            </div>
            <h1 className="font-serif text-4xl font-bold">We'd Love to Hear From You</h1>
            <p className="mt-4 text-stone-300 leading-relaxed max-w-md">
              Whether you have a question, feedback, or just want to say hello — we're always happy to chat.
              We speak English, Roman Urdu, and <span className="urdu">اردو</span>.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={toggleChat}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-5xl group-hover:scale-110 transition-transform duration-300">🤖</div>
              <div>
                <div className="text-sm font-bold text-white">Chat Assistant</div>
                <div className="text-xs text-stone-400 mt-0.5">Available 24/7</div>
              </div>
              <span className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-bold text-white shadow">
                Start Chatting →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ---- Contact cards ---- */}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const c = COLOR_MAP[item.color];
          return (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              className={`group card-premium flex items-start gap-4 p-6 ring-1 ring-transparent hover:ring-2 ${c.ring} transition-all duration-300`}
            >
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${c.bg} text-2xl`}>
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">{item.label}</div>
                <div className={`text-sm font-semibold truncate ${c.link} transition`}>{item.value}</div>
                <div className="text-xs text-stone-400 mt-1">{item.hint}</div>
              </div>
              <svg className={`h-5 w-5 mt-1 ${c.icon} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          );
        })}
      </div>

      {/* ---- Chat CTA ---- */}
      <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-amber-50 p-8 text-center">
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Prefer to Chat?</h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto mb-6">
          Our AI assistant can help you browse the menu, place an order, or answer any questions — in English, Urdu, or Roman Urdu!
        </p>
        <button onClick={toggleChat} className="btn-primary">
          Open Chat Assistant
        </button>
      </div>
    </div>
  );
}

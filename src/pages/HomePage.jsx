import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useRestaurant from '../hooks/useRestaurant.js';
import useMenu from '../hooks/useMenu.js';
import useDeals from '../hooks/useDeals.js';
import useTrending from '../hooks/useTrending.js';
import useRunning from '../hooks/useRunning.js';
import MenuItemCard from '../components/menu/MenuItemCard.jsx';
import DealCard from '../components/deals/DealCard.jsx';
import FeaturedItemCard from '../components/home/FeaturedItemCard.jsx';
import ReviewsSection from '../components/reviews/ReviewsSection.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ItemModal from '../components/ui/ItemModal.jsx';

// ---- REALISTIC CUSTOM SVG FOOD ICONS ----
const BurgerIcon = () => (
  <svg className="w-16 h-16 text-amber-500 hover:scale-110 transition-transform duration-300" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Upper Bun */}
    <path d="M12 28C12 18 20 12 32 12C44 12 52 18 52 28H12Z" fill="#F4A261" />
    {/* Upper Bun Shadow/Texture */}
    <path d="M22 18C22 18 25 15 32 15C39 15 42 18 42 18" stroke="#E76F51" strokeWidth="2" strokeLinecap="round" />
    {/* Sesame seeds */}
    <circle cx="20" cy="22" r="1" fill="#FFFFFF" />
    <circle cx="32" cy="18" r="1" fill="#FFFFFF" />
    <circle cx="44" cy="22" r="1" fill="#FFFFFF" />
    <circle cx="28" cy="23" r="1" fill="#FFFFFF" />
    <circle cx="36" cy="23" r="1" fill="#FFFFFF" />
    {/* Lettuce */}
    <path d="M10 32C10 32 14 28 18 30C22 32 26 28 30 30C34 32 38 28 42 30C46 32 50 28 54 30" stroke="#2A9D8F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Melted Cheese */}
    <path d="M11 32H53L48 38L32 41L16 38L11 32Z" fill="#E9C46A" />
    {/* Patty */}
    <rect x="12" y="38" width="40" height="6" rx="3" fill="#6B4D3C" />
    {/* Tomato Slices */}
    <rect x="16" y="35" width="10" height="3" rx="1.5" fill="#E76F51" />
    <rect x="38" y="35" width="10" height="3" rx="1.5" fill="#E76F51" />
    {/* Lower Bun */}
    <path d="M14 44C14 48 20 52 32 52C44 52 50 48 50 44H14Z" fill="#F4A261" />
  </svg>
);

const ChickenIcon = () => (
  <svg className="w-16 h-16 text-amber-600 hover:scale-110 transition-transform duration-300" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Crispy Chicken Drumstick */}
    {/* Bone */}
    <path d="M48 48C52 48 54 45 52 41L45 34L40 39L41 45C39 48 41 52 44 52" fill="#E5E5E5" />
    <circle cx="50" cy="50" r="4" fill="#E5E5E5" />
    <circle cx="44" cy="53" r="4" fill="#E5E5E5" />
    {/* Golden Crispy Meat */}
    <path d="M12 28C10 38 18 46 28 44L42 30L34 16C24 14 14 18 12 28Z" fill="#D4A373" />
    <path d="M15 25C13 32 18 39 26 38L37 27L31 18C23 16 17 19 15 25Z" fill="#E6CCB2" />
    {/* Crunch texture bumps */}
    <circle cx="20" cy="24" r="1.5" fill="#B7B7A4" />
    <circle cx="28" cy="20" r="1.5" fill="#B7B7A4" />
    <circle cx="16" cy="32" r="2" fill="#B7B7A4" />
    <circle cx="24" cy="34" r="1.5" fill="#B7B7A4" />
    <circle cx="32" cy="28" r="2.5" fill="#B7B7A4" />
  </svg>
);

const FriesIcon = () => (
  <svg className="w-16 h-16 text-red-500 hover:scale-110 transition-transform duration-300" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* French Fries box and golden sticks */}
    {/* Fries */}
    <rect x="18" y="10" width="4" height="24" rx="2" fill="#FFC300" />
    <rect x="24" y="8" width="4" height="26" rx="2" fill="#FFC300" />
    <rect x="30" y="12" width="4" height="22" rx="2" fill="#FFC300" />
    <rect x="36" y="6" width="4" height="28" rx="2" fill="#FFD60A" />
    <rect x="42" y="11" width="4" height="23" rx="2" fill="#FFC300" />
    {/* Diagonal tilted fries */}
    <rect x="14" y="14" width="4" height="22" rx="2" transform="rotate(-15 14 14)" fill="#FFC300" />
    <rect x="46" y="12" width="4" height="22" rx="2" transform="rotate(15 46 12)" fill="#FFD60A" />
    {/* Red Box cup */}
    <path d="M14 30L18 54H46L50 30H14Z" fill="#C30C15" />
    {/* Yellow brand shape on box */}
    <path d="M22 34C32 40 32 40 42 34L40 50H24L22 34Z" fill="#FFC300" rx="4" />
  </svg>
);

const SodaIcon = () => (
  <svg className="w-16 h-16 text-blue-500 hover:scale-110 transition-transform duration-300" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft drink cup with straw */}
    {/* Straw */}
    <rect x="36" y="4" width="4" height="22" rx="1" transform="rotate(20 36 4)" fill="#FFC300" />
    <rect x="38" y="4" width="4" height="6" rx="1" transform="rotate(20 38 4)" fill="#C30C15" />
    {/* Cup Lid */}
    <ellipse cx="32" cy="20" rx="18" ry="4" fill="#E5E5E5" />
    {/* Cup Body */}
    <path d="M16 20L20 52H44L48 20H16Z" fill="#C30C15" />
    {/* Center white strip */}
    <path d="M17.5 32H46.5L45 44H19L17.5 32Z" fill="#FFFFFF" />
    {/* Star badge in middle */}
    <path d="M32 34L33.5 37.5L37 37.5L34 39.5L35.5 43L32 41L28.5 43L30 39.5L27 37.5L30.5 37.5L32 34Z" fill="#C30C15" />
  </svg>
);

const FEATURES = [
  {
    icon: <ChickenIcon />,
    title: 'THE CRISPIEST TASTE',
    body: 'Freshly prepared daily with our secret coating recipe to give you the perfect golden crunch.',
  },
  {
    icon: <FriesIcon />,
    title: 'HOT & FAST DELIVERY',
    body: 'Delivered steaming hot directly from our kitchen to your doorstep in minutes.',
  },
  {
    icon: <SodaIcon />,
    title: 'ORDER IN URDU OR ENGLISH',
    body: 'Talk to our AI assistant in Urdu or English to customize your perfect meal pack.',
  },
];

export default function HomePage() {
  const { restaurant } = useRestaurant();
  const { menu, loading } = useMenu();
  const { deals, loading: dealsLoading } = useDeals();
  const { items: trending, loading: trendingLoading } = useTrending();
  const { items: running, loading: runningLoading } = useRunning();

  const featured = (menu || []).flatMap((c) => c.items).slice(0, 8);

  // ---- DEAL MODAL ----
  const [selectedDeal, setSelectedDeal] = useState(null);

  // ---- CAROUSEL SLIDER CONTROLS ----
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayRef = useRef(null);

  const startAutoplay = () => {
    stopAutoplay();
    if (deals && deals.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % deals.length);
      }, 4000);
    }
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  useEffect(() => {
    if (deals && deals.length > 0) {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [deals]);

  const handlePrevSlide = () => {
    stopAutoplay();
    setCurrentSlide((prev) => (prev - 1 + deals.length) % deals.length);
    startAutoplay();
  };

  const handleNextSlide = () => {
    stopAutoplay();
    setCurrentSlide((prev) => (prev + 1) % deals.length);
    startAutoplay();
  };

  return (
    <div className="space-y-16">

      {/* ---- HERO ---- */}
      <section className="relative overflow-hidden rounded-3xl bg-stone-950 text-white shadow-2xl border border-stone-900">
        {/* Glowing background shapes */}
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-72 w-72 rounded-full bg-gold-500/5 blur-3xl" />

        <div className="relative grid gap-8 px-6 py-16 sm:grid-cols-2 sm:px-12 sm:py-24">
          <div className="flex flex-col justify-center space-y-6">
            
            {/* Hot & Fresh + Contact Us details */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-brand-600 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow">
                🔥 HOT & FRESH
              </span>
              <a
                href={`tel:${restaurant?.contact?.phone || '111-666-111'}`}
                className="inline-flex items-center gap-1 bg-stone-900 border border-stone-800 rounded px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gold-400 hover:text-white transition"
              >
                📞 HELPLINE: {restaurant?.contact?.phone || '111-666-111'}
              </a>
            </div>
            
            <h1 className="font-sans text-4xl font-black leading-none tracking-tight sm:text-6xl uppercase">
              CRISPY. GOLDEN.<br />
              <span className="text-gold-400">PERFECTION.</span>
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-stone-300">
              {restaurant?.description ||
                'Indulge in Karachi\'s finest golden-fried crispy chicken and mouth-watering signature burgers. Freshly seasoned and cooked to order.'}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-xs font-black tracking-widest text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-500 hover:-translate-y-0.5"
              >
                ORDER ONLINE
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-stone-800 bg-stone-900 px-6 py-3 text-xs font-black tracking-widest text-white transition hover:bg-stone-800 hover:-translate-y-0.5"
              >
                CONTACT US
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 border-t border-stone-900 pt-6">
              {[
                { label: 'DELICIOUS FLAVORS', value: '100%' },
                { label: 'HAPPY CUSTOMERS', value: '20,000+' },
                { label: 'AVG DELIVERY TIME', value: '30 MIN' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-lg font-black text-gold-400 leading-none">{s.value}</div>
                  <div className="text-[9px] font-bold text-stone-400 tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual food graphics with realistic custom SVG illustrations */}
          <div className="hidden sm:flex sm:items-center sm:justify-center relative">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              {[
                { component: <BurgerIcon />, bg: 'from-stone-900 to-stone-800', label: 'BURGERS' },
                { component: <ChickenIcon />, bg: 'from-stone-900 to-stone-850', label: 'CRISPY PIECES' },
                { component: <FriesIcon />, bg: 'from-stone-900 to-stone-850', label: 'SIDES' },
                { component: <SodaIcon />, bg: 'from-stone-900 to-stone-800', label: 'DRINKS' }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} p-6 border border-stone-800 shadow-xl transition-all duration-300 hover:scale-105 hover:border-gold-500/40`}
                  style={{ animation: 'float 3s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                >
                  {item.component}
                  <div className="text-[10px] font-black text-stone-400 tracking-widest mt-3 uppercase">{item.label}</div>
                </div>
              ))}
            </div>
            {/* Ambient golden halo */}
            <div className="absolute inset-0 -z-10 bg-gold-500/5 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ---- DEALS SLIDER CAROUSEL ---- */}
      {dealsLoading ? (
        <section className="flex justify-center py-8"><Spinner /></section>
      ) : deals && deals.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-600">
                ⚡ UNBEATABLE COMBOS
              </div>
              <h2 className="font-sans text-3xl font-extrabold tracking-tight text-stone-900 uppercase mt-2">HOT DEALS</h2>
              <div className="h-1 w-12 bg-brand-600 mt-2" />
            </div>

            {/* Slider Navigation Arrows */}
            {deals.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-700 shadow-sm transition"
                  aria-label="Previous Deal"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300 text-stone-700 shadow-sm transition"
                  aria-label="Next Deal"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* Slider Layout */}
          <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="w-full shrink-0 px-4 py-8 sm:p-12 cursor-pointer"
                  onClick={() => setSelectedDeal(deal)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedDeal(deal)}
                  aria-label={`View deal: ${deal.title}`}
                >
                  <div className="grid gap-6 md:grid-cols-2 items-center">
                    {/* Deal Graphic/Image */}
                    {deal.image ? (
                      <div className="relative overflow-hidden rounded-2xl h-64 md:h-80 shadow-md">
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-4 left-4 rounded bg-brand-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow">
                          SAVE BIG
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 md:h-80 rounded-2xl bg-gradient-to-br from-brand-900 to-stone-950 flex flex-col items-center justify-center text-white border border-stone-900 p-6">
                        <span className="text-6xl animate-pulse">🍗</span>
                        <div className="text-gold-400 font-black tracking-widest text-sm uppercase mt-4">EXCLUSIVE BUNDLE</div>
                      </div>
                    )}

                    {/* Deal Details */}
                    <div className="flex flex-col space-y-4">
                      <span className="text-xs font-black text-brand-600 tracking-widest uppercase">LIMITED TIME DEAL</span>
                      <h3 className="font-sans text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight leading-snug">
                        {deal.title}
                      </h3>
                      {deal.description && (
                        <p className="text-sm text-stone-600 leading-relaxed max-w-md">{deal.description}</p>
                      )}
                      
                      {/* Price Section */}
                      <div className="flex items-center gap-4 pt-2">
                        <span className="text-3xl font-black text-brand-600">
                          {deal.price ? `${restaurant?.currency || 'PKR'} ${deal.price}` : 'Special Offer'}
                        </span>
                        {deal.originalPrice > 0 && (
                          <span className="text-base font-bold text-stone-400 line-through">
                            {restaurant?.currency || 'PKR'} {deal.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* CTA Links */}
                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); }}
                          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3.5 text-xs font-black tracking-widest text-white transition hover:bg-brand-500 hover:scale-105"
                        >
                          ORDER NOW
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Dots */}
            {deals.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {deals.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { stopAutoplay(); setCurrentSlide(idx); startAutoplay(); }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-6 bg-brand-600' : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* ---- TRENDING ---- */}
      {trendingLoading ? (
        <section className="flex justify-center py-8"><Spinner /></section>
      ) : trending && trending.length > 0 ? (
        <section>
          <div className="mb-6">
            <div className="inline-flex items-center gap-1 rounded-full bg-gold-50 border border-gold-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gold-600">
              🔥 MOST POPULAR
            </div>
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-stone-900 uppercase mt-2">TRENDING NOW</h2>
            <div className="h-1 w-12 bg-brand-600 mt-2" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((item) => (
              <FeaturedItemCard key={item._id} item={item} currency={restaurant?.currency} badge="Trending" />
            ))}
          </div>
        </section>
      ) : null}

      {/* ---- RUNNING ---- */}
      {runningLoading ? (
        <section className="flex justify-center py-8"><Spinner /></section>
      ) : running && running.length > 0 ? (
        <section>
          <div className="mb-6">
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-600">
              ⭐ FRESH IN KITCHEN
            </div>
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-stone-900 uppercase mt-2">CURRENTLY RUNNING</h2>
            <div className="h-1 w-12 bg-brand-600 mt-2" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {running.map((item) => (
              <FeaturedItemCard key={item._id} item={item} currency={restaurant?.currency} badge="Running" />
            ))}
          </div>
        </section>
      ) : null}

      {/* ---- OUR MENU ---- */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-brand-600">
              🍽️ FULL SPREAD
            </div>
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-stone-900 uppercase mt-2">OUR MENU</h2>
            <div className="h-1 w-12 bg-brand-600 mt-2" />
          </div>
          <Link to="/menu" className="inline-flex items-center justify-center rounded-xl bg-stone-900 hover:bg-stone-850 text-white px-5 py-2.5 text-xs font-black tracking-widest transition">
            VIEW FULL MENU →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-sm text-stone-500 font-semibold">Our menu is coming soon — check back shortly!</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <MenuItemCard key={item._id} item={item} currency={restaurant?.currency} />
            ))}
          </div>
        )}
      </section>

      {/* ---- REVIEWS ---- */}
      <ReviewsSection />

      {/* ---- DEAL DETAIL MODAL ---- */}
      {selectedDeal && (
        <ItemModal
          item={selectedDeal}
          type="deal"
          currency={restaurant?.currency}
          onClose={() => setSelectedDeal(null)}
        />
      )}

      {/* ---- FEATURES ---- */}
      <section className="overflow-hidden rounded-3xl bg-stone-950 p-8 sm:p-12 text-white border border-stone-900">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-stone-800 bg-stone-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-stone-400">
            WHY KABABJEES
          </div>
          <h2 className="font-sans text-3xl font-extrabold text-white mt-3 uppercase tracking-tight">THE KABABJEES PROMISE</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-stone-900 bg-stone-900/40 p-6 text-center transition-all duration-300 hover:border-gold-500/30 hover:bg-stone-900"
            >
              <div className="mb-4 flex justify-center">{f.icon}</div>
              <div className="mb-2 text-xs font-black text-white tracking-widest">{f.title}</div>
              <p className="text-xs text-stone-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

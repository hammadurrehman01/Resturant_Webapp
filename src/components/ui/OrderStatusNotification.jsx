import { useEffect, useState } from 'react';
import useSocket from '../../hooks/useSocket.js';

const STATUS_META = {
  pending:     { label: 'Order Received',     emoji: '📥', cls: 'border-amber-400   bg-amber-50   text-amber-900'   },
  accepted:    { label: 'Order Accepted',     emoji: '👨‍🍳', cls: 'border-blue-400    bg-blue-50    text-blue-900'    },
  confirmed:   { label: 'Order Confirmed',    emoji: '✅', cls: 'border-green-400   bg-green-50   text-green-900'   },
  preparing:   { label: 'Being Prepared',     emoji: '🍳', cls: 'border-indigo-400  bg-indigo-50  text-indigo-900'  },
  ready:       { label: 'Ready!',             emoji: '🍽️', cls: 'border-teal-400    bg-teal-50    text-teal-900'    },
  dispatched:  { label: 'Out for Delivery',   emoji: '🛵', cls: 'border-orange-400  bg-orange-50  text-orange-900'  },
  out_for_delivery: { label: 'On the Way!',  emoji: '🛵', cls: 'border-orange-400  bg-orange-50  text-orange-900'  },
  delivered:   { label: 'Delivered! Enjoy!',  emoji: '🎉', cls: 'border-green-500   bg-green-50   text-green-900'   },
  cancelled:   { label: 'Order Cancelled',    emoji: '❌', cls: 'border-red-400     bg-red-50     text-red-900'     },
};

// Read saved order numbers from localStorage
function getSavedOrders() {
  try {
    const raw = localStorage.getItem('rss_placed_orders');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Shared AudioContext for customer pings
let _pingCtx = null;
function getPingCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!_pingCtx) _pingCtx = new Ctx();
  if (_pingCtx.state === 'suspended') _pingCtx.resume();
  return _pingCtx;
}

/**
 * Soft 2-note rising ping for the customer notification.
 * Quieter and shorter than the admin chime — informative, not alarming.
 */
function playPing() {
  try {
    const ctx = getPingCtx();
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.5, ctx.currentTime);
    master.connect(ctx.destination);

    const ping = (freq, delay) => {
      const t   = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.4, t + 0.008);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(env);
      env.connect(master);
      osc.start(t);
      osc.stop(t + 0.6);
    };

    ping(523.25, 0.00);  // C5
    ping(659.25, 0.12);  // E5
  } catch (e) {
    console.warn('[ping] audio error:', e.message);
  }
}

export default function OrderStatusNotification() {
  const { joinOrderRoom, orderUpdate, connected } = useSocket();
  const [toast, setToast] = useState(null);

  // Join all saved order rooms whenever we get connected (or on mount if already connected)
  useEffect(() => {
    if (!connected) return;
    const orders = getSavedOrders();
    orders.forEach((num) => {
      joinOrderRoom(num);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // Also join whenever new orders are placed
  useEffect(() => {
    const handler = () => {
      const orders = getSavedOrders();
      orders.forEach((num) => joinOrderRoom(num));
    };
    window.addEventListener('order_placed_sync', handler);
    return () => window.removeEventListener('order_placed_sync', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show toast when a status update arrives
  useEffect(() => {
    if (!orderUpdate) return;

    const meta = STATUS_META[orderUpdate.status] || {
      label: orderUpdate.status,
      emoji: '🔔',
      cls: 'border-stone-400 bg-stone-50 text-stone-900',
    };

    playPing();
    setToast({ ...orderUpdate, meta });

    const timer = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(timer);
  }, [orderUpdate]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-full max-w-sm px-4 sm:px-0 animate-slide-up">
      <div className={`rounded-2xl border-2 p-4 shadow-2xl bg-white ${toast.meta.cls} flex gap-3`}>
        <span className="text-3xl shrink-0" role="img" aria-label="status">
          {toast.meta.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-black tracking-widest uppercase text-stone-500">
              ORDER UPDATE
            </span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-stone-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] font-bold text-stone-500 mt-0.5">
            Order <span className="font-extrabold text-stone-800">{toast.orderNumber}</span>
          </p>
          <p className="text-sm font-black text-stone-900 mt-1">
            {toast.meta.label}
          </p>
          {toast.note && (
            <p className="text-[11px] italic text-stone-500 mt-1.5 border-l-2 border-current/30 pl-2 leading-snug">
              "{toast.note}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

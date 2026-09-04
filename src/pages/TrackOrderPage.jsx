import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { trackOrder } from '../api/endpoints.js';
import { formatMoney, humanStatus, statusBadgeClass } from '../lib/format.js';
import Spinner from '../components/ui/Spinner.jsx';
import useRestaurant from '../hooks/useRestaurant.js';

const DELIVERY_TIMELINE = [
  { key: 'pending',          label: 'Pending',        emoji: '⏳', desc: 'Order placed, waiting for confirmation' },
  { key: 'confirmed',        label: 'Confirmed',      emoji: '✅', desc: 'Order confirmed by the kitchen' },
  { key: 'preparing',        label: 'Preparing',      emoji: '👨‍🍳', desc: 'Your food is being prepared' },
  { key: 'ready',            label: 'Ready',          emoji: '🍽️', desc: 'Order is ready for delivery' },
  { key: 'out_for_delivery', label: 'On the Way',     emoji: '🛵', desc: 'Your order is out for delivery' },
  { key: 'delivered',        label: 'Delivered',      emoji: '🎉', desc: 'Enjoy your meal!' },
];

// Pickup ("receive") orders skip the delivery leg entirely.
const PICKUP_TIMELINE = [
  { key: 'pending',   label: 'Pending',    emoji: '⏳', desc: 'Order placed, waiting for confirmation' },
  { key: 'confirmed', label: 'Confirmed',  emoji: '✅', desc: 'Order confirmed by the kitchen' },
  { key: 'preparing', label: 'Preparing',  emoji: '👨‍🍳', desc: 'Your food is being prepared' },
  { key: 'ready',     label: 'Ready',      emoji: '🍽️', desc: 'Ready for pickup at the restaurant' },
  { key: 'delivered', label: 'Picked Up',  emoji: '🎉', desc: 'Order collected — enjoy your meal!' },
];

import useSocket from '../hooks/useSocket.js';

export default function TrackOrderPage() {
  const { restaurant } = useRestaurant();
  const { orderNumber: paramOrderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(paramOrderNumber || '');
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  // Load the customer's recently placed orders (saved at checkout) so they can
  // track one with a single tap even if they didn't note the order number.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rss_order_history');
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const trackFromHistory = (h) => {
    setOrderNumber(h.orderNumber);
    setPhone(h.phone || '');
    setError(null);
    lookup(h.orderNumber, h.phone || '');
  };

  const { joinOrderRoom, orderUpdate } = useSocket();

  // Listen to live socket updates for this order
  useEffect(() => {
    if (order?.orderNumber) {
      joinOrderRoom(order.orderNumber);
    }
  }, [order?.orderNumber]);

  useEffect(() => {
    if (orderUpdate && order && orderUpdate.orderNumber === order.orderNumber) {
      setOrder((prev) => {
        // Prevent duplicate updates
        if (prev.status === orderUpdate.status) return prev;
        return {
          ...prev,
          status: orderUpdate.status,
          statusHistory: [
            ...(prev.statusHistory || []),
            { status: orderUpdate.status, at: orderUpdate.updatedAt, note: orderUpdate.note },
          ],
        };
      });
    }
  }, [orderUpdate, order]);

  useEffect(() => {
    if (paramOrderNumber && initialPhone) {
      lookup(paramOrderNumber, initialPhone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(num, ph) {
    setLoading(true);
    setError(null);
    try {
      const o = await trackOrder(num, ph);
      setOrder(o);
    } catch (err) {
      setError(err.message || 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const submit = (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    lookup(orderNumber.trim(), phone.trim());
  };

  const currency = restaurant?.currency || 'PKR';
  const TIMELINE = order?.orderType === 'pickup' ? PICKUP_TIMELINE : DELIVERY_TIMELINE;
  const currentStep = order?.status === 'cancelled' ? -1 : TIMELINE.findIndex((s) => s.key === order?.status);

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      {/* ---- Header ---- */}
      <div className="relative overflow-hidden rounded-3xl hero-gradient px-8 py-10 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-600/20 blur-2xl" />
        <div className="relative">
          <div className="section-badge mb-3 border-brand-400/30 bg-brand-500/20 text-brand-200">
            📦 Live Tracking
          </div>
          <h1 className="font-serif text-3xl font-bold">Track Your Order</h1>
          <p className="mt-2 text-sm text-stone-400">
            Enter your order number and phone to see real-time updates
          </p>
        </div>
      </div>

      {/* ---- Search form ---- */}
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-base font-bold text-stone-900">Order Lookup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Order Number</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. 20260504-00001"
              className="input font-mono"
              required
            />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              className="input"
              required
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching…
            </span>
          ) : (
            '🔍 Track Order'
          )}
        </button>
      </form>

      {/* ---- Recent orders (from this device) ---- */}
      {history.length > 0 && (
        <div className="card space-y-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">Your recent orders</h2>
            <p className="text-xs text-stone-500">Placed from this device — tap to track without typing the number.</p>
          </div>
          <ul className="divide-y divide-stone-100">
            {history.map((h) => (
              <li key={h.orderNumber} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold text-stone-900">{h.orderNumber}</div>
                  <div className="text-xs text-stone-500">
                    {h.placedAt ? new Date(h.placedAt).toLocaleString() : null}
                    {h.total != null && <> · {formatMoney(h.total, h.currency || currency)}</>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => trackFromHistory(h)}
                  className="btn-secondary shrink-0"
                >
                  Track →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---- Error ---- */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span className="text-xl">❌</span>
          {error}
        </div>
      )}

      {/* ---- Result ---- */}
      {order && (
        <div className="space-y-5 animate-fade-in-up">

          {/* Order header */}
          <div className="card flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Order Number</div>
              <div className="font-mono text-2xl font-bold text-stone-900 mt-0.5">{order.orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Status</div>
              <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${statusBadgeClass(order.status)}`}>
                {humanStatus(order.status)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="card">
              <h2 className="text-sm font-bold text-stone-900 mb-6">
                {order.orderType === 'pickup' ? 'Pickup Progress' : 'Delivery Progress'}
              </h2>
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-stone-100" />

                <ol className="space-y-5">
                  {TIMELINE.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    const idle = i > currentStep;
                    return (
                      <li key={step.key} className="relative flex items-start gap-4 pl-12">
                        {/* Circle indicator */}
                        <div className={`absolute left-0 grid h-10 w-10 place-items-center rounded-full text-lg transition-all duration-300 ${
                          active ? 'timeline-step-active ring-4 ring-brand-100 scale-110' :
                          done ? 'timeline-step-done' :
                          'timeline-step-idle'
                        }`}>
                          {done ? '✓' : step.emoji}
                        </div>

                        {/* Content */}
                        <div className={`pb-5 ${idle ? 'opacity-40' : ''}`}>
                          <div className={`text-sm font-bold ${active ? 'text-brand-700' : done ? 'text-stone-700' : 'text-stone-500'}`}>
                            {step.label}
                            {active && (
                              <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                            )}
                          </div>
                          <div className="text-xs text-stone-400 mt-0.5">{step.desc}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}

          {/* Cancelled state */}
          {order.status === 'cancelled' && (
            <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-6">
              <span className="text-4xl">❌</span>
              <div>
                <div className="font-bold text-red-800">Order Cancelled</div>
                <div className="text-sm text-red-600 mt-0.5">This order has been cancelled. Please contact us if you have questions.</div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card">
            <h2 className="text-sm font-bold text-stone-900 mb-4">🍽️ Order Items</h2>
            <ul className="divide-y divide-stone-100">
              {(order.items || []).map((it, i) => (
                <li key={i} className="flex justify-between py-3 text-sm">
                  <span className="font-medium text-stone-800">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-xs font-bold mr-2">
                      {it.quantity}×
                    </span>
                    {it.name}
                  </span>
                </li>
              ))}
            </ul>
            {order.totals && (
              <div className="mt-4 border-t border-stone-100 pt-4 flex justify-between">
                <span className="text-sm font-bold text-stone-900">Total</span>
                <span className="text-sm font-bold text-brand-700">{formatMoney(order.totals.total, currency)}</span>
              </div>
            )}
          </div>

          {/* History */}
          {order.statusHistory?.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-bold text-stone-900 mb-4">📋 Status History</h2>
              <ol className="space-y-3">
                {order.statusHistory.map((h, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <span className="font-semibold text-stone-800">{humanStatus(h.status)}</span>
                      {h.note && <span className="text-stone-500"> — {h.note}</span>}
                    </div>
                    <span className="text-xs text-stone-400 whitespace-nowrap">{new Date(h.at).toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

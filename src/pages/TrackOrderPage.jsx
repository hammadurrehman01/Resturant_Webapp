import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { trackOrder } from '../api/endpoints.js';
import { formatMoney, humanStatus, statusBadgeClass } from '../lib/format.js';
import Spinner from '../components/ui/Spinner.jsx';
import useRestaurant from '../hooks/useRestaurant.js';

const TIMELINE = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

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

  // If we arrive with both ?phone and a path order number, fetch immediately.
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
  const currentStep = order?.status === 'cancelled' ? -1 : TIMELINE.indexOf(order?.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track your order</h1>
        <p className="mt-1 text-sm text-stone-600">
          Enter your order number and the phone number you used at checkout.
        </p>
      </div>

      <form onSubmit={submit} className="card grid gap-3 sm:grid-cols-[1fr,1fr,auto]">
        <div>
          <label className="label">Order number</label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="20260504-00001"
            className="input font-mono"
            required
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            className="input"
            required
          />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner className="!h-4 !w-4" /> : 'Track'}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {order && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-stone-500">Order</div>
                <div className="font-mono text-lg font-semibold">{order.orderNumber}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                {humanStatus(order.status)}
              </span>
            </div>

            {order.status !== 'cancelled' && (
              <ol className="mt-6 grid grid-cols-6 gap-1">
                {TIMELINE.map((s, i) => (
                  <li key={s} className="flex flex-col items-center gap-1">
                    <div className={`h-2 w-full rounded-full ${i <= currentStep ? 'bg-brand-600' : 'bg-stone-200'}`} />
                    <span className={`text-[10px] sm:text-xs ${i <= currentStep ? 'text-stone-700' : 'text-stone-400'}`}>
                      {humanStatus(s)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="card">
            <h2 className="text-base font-semibold">Items</h2>
            <ul className="mt-3 divide-y divide-stone-200">
              {(order.items || []).map((it, i) => (
                <li key={i} className="flex justify-between py-2 text-sm">
                  <span>{it.quantity} × {it.name}</span>
                </li>
              ))}
            </ul>
            {order.totals && (
              <div className="mt-3 border-t border-stone-200 pt-3 text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(order.totals.total, currency)}</span>
                </div>
              </div>
            )}
          </div>

          {order.statusHistory?.length > 0 && (
            <div className="card">
              <h2 className="text-base font-semibold">History</h2>
              <ol className="mt-3 space-y-2 text-sm">
                {order.statusHistory.map((h, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-stone-700">
                    <span>{humanStatus(h.status)}{h.note ? ` — ${h.note}` : ''}</span>
                    <span className="text-xs text-stone-500">{new Date(h.at).toLocaleString()}</span>
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

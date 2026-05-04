import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/cart.js';
import useRestaurant from '../hooks/useRestaurant.js';
import { placeOrder } from '../api/endpoints.js';
import { formatMoney } from '../lib/format.js';
import Spinner from '../components/ui/Spinner.jsx';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on delivery' },
  { value: 'card', label: 'Card (on delivery)' },
];

export default function OrderPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const { restaurant } = useRestaurant();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [placed, setPlaced] = useState(null);

  const currency = restaurant?.currency || 'PKR';
  const deliveryFee = restaurant?.deliveryFee || 0;
  const taxAmount = ((restaurant?.taxPercent || 0) * subtotal) / 100;
  const total = subtotal + deliveryFee + taxAmount;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder({
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          notes: form.notes.trim() || undefined,
        },
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        paymentMethod: form.paymentMethod,
        source: 'web',
      });
      setPlaced({ ...order, customerPhone: form.phone.trim() });
      clear();
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-600 text-white">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Order placed!</h1>
          <p className="mt-1 text-sm text-stone-600">
            Order number <span className="font-mono font-semibold">{placed.orderNumber}</span>.
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Total: <span className="font-semibold">{formatMoney(placed.totals.total, currency)}</span>
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(`/track/${placed.orderNumber}?phone=${encodeURIComponent(placed.customerPhone)}`)}
              className="btn-primary"
            >
              Track this order
            </button>
            <Link to="/menu" className="btn-secondary">Order again</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-stone-600">Browse the menu to add some delicious items.</p>
        <Link to="/menu" className="btn-primary mt-6">View menu</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <form onSubmit={submit} className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <fieldset className="card space-y-4">
          <legend className="text-base font-semibold">Delivery details</legend>
          <Field label="Full name" required>
            <input type="text" required value={form.name} onChange={update('name')} className="input" minLength={2} maxLength={120} />
          </Field>
          <Field label="Phone" required>
            <input type="tel" required value={form.phone} onChange={update('phone')} className="input" minLength={5} maxLength={30} placeholder="+92 300 1234567" />
          </Field>
          <Field label="Address" required>
            <textarea required rows={3} value={form.address} onChange={update('address')} className="input" minLength={3} maxLength={500} />
          </Field>
          <Field label="Order notes">
            <textarea rows={2} value={form.notes} onChange={update('notes')} className="input" maxLength={500} placeholder="e.g. spicy, no onions" />
          </Field>
        </fieldset>

        <fieldset className="card space-y-2">
          <legend className="text-base font-semibold">Payment</legend>
          {PAYMENT_METHODS.map((m) => (
            <label key={m.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                value={m.value}
                checked={form.paymentMethod === m.value}
                onChange={update('paymentMethod')}
              />
              {m.label}
            </label>
          ))}
        </fieldset>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Link to="/menu" className="btn-secondary">Continue shopping</Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? <><Spinner className="!h-4 !w-4" /> Placing…</> : `Place order — ${formatMoney(total, currency)}`}
          </button>
        </div>
      </form>

      <aside className="md:col-span-1">
        <div className="card sticky top-24">
          <h2 className="text-base font-semibold">Your order</h2>
          <ul className="mt-3 divide-y divide-stone-200">
            {items.map((it) => (
              <li key={it.menuItemId} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-stone-500">{formatMoney(it.price, currency)} each</div>
                    <div className="mt-1 inline-flex items-center rounded-md border border-stone-300">
                      <button type="button" className="px-2 py-0.5 text-stone-600 hover:bg-stone-50" onClick={() => setQuantity(it.menuItemId, it.quantity - 1)}>−</button>
                      <span className="px-2 text-sm">{it.quantity}</span>
                      <button type="button" className="px-2 py-0.5 text-stone-600 hover:bg-stone-50" onClick={() => setQuantity(it.menuItemId, it.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatMoney(it.price * it.quantity, currency)}</div>
                    <button type="button" onClick={() => remove(it.menuItemId)} className="mt-1 text-xs text-stone-500 hover:text-red-600">Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-stone-200 pt-3 text-sm">
            <Row label="Subtotal" value={formatMoney(subtotal, currency)} />
            {deliveryFee > 0 && <Row label="Delivery" value={formatMoney(deliveryFee, currency)} />}
            {taxAmount > 0 && <Row label={`Tax (${restaurant.taxPercent}%)`} value={formatMoney(taxAmount, currency)} />}
            <Row label="Total" value={formatMoney(total, currency)} bold />
          </dl>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'border-t border-stone-200 pt-1.5 text-base font-semibold' : 'text-stone-700'}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

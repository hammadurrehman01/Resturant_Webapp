import { useState } from 'react';
import { submitReview } from '../../api/endpoints.js';

export default function ReviewForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ userName: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitReview(form);
      onSaved?.();
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-stone-900">Share your experience</h3>
      
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Your Name</label>
        <input
          required
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
          className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              className={`text-2xl transition ${star <= form.rating ? 'text-amber-400' : 'text-stone-200'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Your Review</label>
        <textarea
          required
          rows={3}
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="w-full rounded-xl border border-stone-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
          placeholder="How was the food and service?"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-stone-200 px-6 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </button>
        )}
      </div>
      <p className="text-center text-[10px] text-stone-400">
        Note: Your review will be visible once approved by our team.
      </p>
    </form>
  );
}

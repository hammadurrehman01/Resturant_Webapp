import { useState } from 'react';
import { submitReview } from '../../api/endpoints.js';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

export default function ReviewForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ userName: '', rating: 5, comment: '' });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const displayRating = hoveredStar || form.rating;

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await submitReview(form);
      onSaved?.();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-stone-200 bg-white p-7 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl shadow-md shadow-brand-500/30">
          ✍️
        </div>
        <div>
          <h3 className="text-lg font-bold text-stone-900">Share Your Experience</h3>
          <p className="text-xs text-stone-500">Your review helps others discover great food</p>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="label">Your Name</label>
        <input
          required
          value={form.userName}
          onChange={(e) => setForm({ ...form, userName: e.target.value })}
          className="input"
          placeholder="e.g. Ahmed Khan"
          maxLength={100}
        />
      </div>

      {/* Interactive Stars */}
      <div>
        <label className="label">Your Rating</label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setForm({ ...form, rating: star })}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className={`text-3xl transition-all duration-100 hover:scale-110 ${
                star <= displayRating ? 'text-amber-400 drop-shadow-sm' : 'text-stone-200'
              }`}
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
          {displayRating > 0 && (
            <span className="ml-2 text-sm font-semibold text-stone-600">{STAR_LABELS[displayRating]}</span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="label">Your Review</label>
        <textarea
          required
          rows={4}
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="input resize-none"
          placeholder="How was the food, service, and overall experience? We'd love to hear from you!"
          maxLength={1000}
        />
        <div className="mt-1 text-right text-[10px] text-stone-400">{form.comment.length}/1000</div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex-1 justify-center"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting…
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary px-5">
            Cancel
          </button>
        )}
      </div>

      <p className="text-center text-[10px] text-stone-400">
        🔍 Your review will be visible after moderation by our team.
      </p>
    </form>
  );
}

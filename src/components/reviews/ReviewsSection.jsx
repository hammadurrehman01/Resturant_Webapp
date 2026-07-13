import { useState } from 'react';
import useReviews from '../../hooks/useReviews.js';
import ReviewForm from './ReviewForm.jsx';
import Spinner from '../ui/Spinner.jsx';

const PREVIEW_COUNT = 5;

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-current' : 'text-stone-200 fill-current'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initials = review.userName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const AVATAR_COLORS = [
    'from-brand-500 to-brand-700',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-teal-500 to-cyan-600',
  ];
  const colorIdx = review.userName.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <article className="flex flex-col rounded-2xl border border-stone-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-brand-100">
      <StarRating rating={review.rating} />

      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-stone-600 italic">
        "{review.comment}"
      </blockquote>

      <div className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4">
        {review.userImage ? (
          <img src={review.userImage} alt={review.userName} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-100" />
        ) : (
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} text-sm font-bold text-white`}>
            {initials}
          </div>
        )}
        <div>
          <div className="text-sm font-bold text-stone-900">{review.userName}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Verified Customer
          </div>
        </div>
      </div>
    </article>
  );
}

function AllReviewsModal({ reviews, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-stone-100 bg-white px-6 py-4 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-stone-900">All Customer Reviews</h2>
            <p className="text-sm text-stone-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-stone-500 hover:bg-stone-100 transition"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const { reviews, loading } = useReviews();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (loading && !reviews) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const preview = (reviews || []).slice(0, PREVIEW_COUNT);
  const hasMore = (reviews || []).length > PREVIEW_COUNT;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-badge mb-3">⭐ Reviews</div>
          <h2 className="section-title">What our customers say</h2>
          <p className="section-subtitle">Real feedback from food lovers across the city</p>
        </div>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-secondary gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Write a Review
          </button>
        )}
      </div>

      {/* Review form */}
      {showForm ? (
        <div className="mx-auto max-w-xl animate-fade-in-up">
          <ReviewForm
            onCancel={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              setSubmitted(true);
            }}
          />
        </div>
      ) : submitted ? (
        <div className="animate-scale-in rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-10 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-100 text-4xl shadow-inner">
            ✅
          </div>
          <h3 className="text-xl font-bold text-green-900">Thank you for your review!</h3>
          <p className="mt-2 text-sm text-green-700 max-w-sm mx-auto">
            Your review has been submitted and is now <strong>pending moderation</strong>. Our team will review it shortly before it goes live.
          </p>
        </div>
      ) : (
        <>
          {/* Review cards */}
          {preview.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-16 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm font-medium text-stone-500">No reviews yet. Be the first to share your experience!</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-xs">
                Write a Review
              </button>
            </div>
          )}

          {/* See all */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(true)}
                className="btn-secondary"
              >
                See All {reviews.length} Reviews →
              </button>
            </div>
          )}
        </>
      )}

      {/* All reviews modal */}
      {showAll && (
        <AllReviewsModal reviews={reviews || []} onClose={() => setShowAll(false)} />
      )}
    </section>
  );
}

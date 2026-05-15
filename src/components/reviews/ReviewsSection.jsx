import { useState } from 'react';
import useReviews from '../../hooks/useReviews.js';
import ReviewForm from './ReviewForm.jsx';
import Spinner from '../ui/Spinner.jsx';

export default function ReviewsSection() {
  const { reviews, loading } = useReviews();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (loading && !reviews) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">What our customers say</h2>
          <p className="mt-1 text-sm text-stone-500">Real feedback from real food lovers</p>
        </div>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Write a review →
          </button>
        )}
      </div>

      {showForm ? (
        <div className="mx-auto max-w-xl">
          <ReviewForm
            onCancel={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              setSubmitted(true);
            }}
          />
        </div>
      ) : submitted ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-green-900">Thank you for your feedback!</h3>
          <p className="mt-1 text-sm text-green-700">Your review has been submitted for moderation.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews?.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review._id}
                className="flex flex-col rounded-2xl border border-stone-100 bg-stone-50 p-6 transition hover:border-brand-200 hover:bg-white hover:shadow-md"
              >
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? '' : 'opacity-20'}>★</span>
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm italic text-stone-700">"{review.comment}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-stone-200 pt-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 font-bold text-brand-700 uppercase">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900">{review.userName}</div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider">Verified Customer</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 py-12 text-center">
              <p className="text-sm text-stone-500">No featured reviews yet. Be the first to share your thoughts!</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 btn-secondary text-xs"
              >
                Write a review
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

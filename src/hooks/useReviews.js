import { useEffect, useState } from 'react';
import { fetchReviews } from '../api/endpoints.js';

export default function useReviews() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchReviews()
      .then((d) => !cancelled && setReviews(d))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { reviews, loading, error };
}

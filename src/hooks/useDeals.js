import { useEffect, useState } from 'react';
import { fetchDeals } from '../api/endpoints.js';

export default function useDeals() {
  const [deals, setDeals] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDeals()
      .then((d) => !cancelled && setDeals(d))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { deals, loading, error };
}

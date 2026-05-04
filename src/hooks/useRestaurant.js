import { useEffect, useState } from 'react';
import { fetchRestaurant } from '../api/endpoints.js';

// Module-level cache so navigating between pages doesn't re-fetch the restaurant
// profile on every mount. Lives for the page session.
let cachedRestaurant = null;
let inflight = null;

export default function useRestaurant() {
  const [restaurant, setRestaurant] = useState(cachedRestaurant);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!cachedRestaurant);

  useEffect(() => {
    if (cachedRestaurant) return;
    let cancelled = false;
    if (!inflight) inflight = fetchRestaurant();
    inflight
      .then((r) => {
        cachedRestaurant = r;
        if (!cancelled) setRestaurant(r);
      })
      .catch((err) => {
        inflight = null;
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { restaurant, loading, error };
}

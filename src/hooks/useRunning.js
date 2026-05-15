import { useEffect, useState } from 'react';
import { fetchRunning } from '../api/endpoints.js';

export default function useRunning() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchRunning()
      .then((d) => !cancelled && setItems(d))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}

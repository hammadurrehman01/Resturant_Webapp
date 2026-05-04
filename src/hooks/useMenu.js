import { useEffect, useState } from 'react';
import { fetchMenu } from '../api/endpoints.js';

export default function useMenu() {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMenu()
      .then((m) => !cancelled && setMenu(m))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return { menu, loading, error };
}

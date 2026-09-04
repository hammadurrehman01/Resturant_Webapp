import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets the window scroll position to the top whenever the route changes,
// so navigating to a new page always lands at the top instead of keeping
// the previous page's scroll offset.
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

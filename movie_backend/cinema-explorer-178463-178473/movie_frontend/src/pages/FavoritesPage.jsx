import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../services/backend';

/**
 * PUBLIC_INTERFACE
 * FavoritesPage
 * Displays a list of favorite movies for the authenticated user.
 */
export default function FavoritesPage() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', favorites: [] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setState({ loading: false, error: '', favorites: [] });
        return;
      }
      setState({ loading: true, error: '', favorites: [] });
      const { data, error } = await getFavorites(user.id);
      if (!mounted) return;
      if (error) {
        setState({ loading: false, error: error.message || 'Failed to load favorites.', favorites: [] });
      } else {
        setState({ loading: false, error: '', favorites: data?.data || [] });
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return <div className="max-w-6xl mx-auto px-4 py-10"><p className="text-secondary">Sign in to view your Favorites.</p></div>;
  }

  if (state.loading) {
    return <div className="max-w-6xl mx-auto px-4 py-10"><p className="text-secondary">Loading favorites...</p></div>;
  }

  if (state.error) {
    return <div className="max-w-6xl mx-auto px-4 py-10"><p className="text-error">Error: {state.error}</p></div>;
  }

  if (!state.favorites.length) {
    return <div className="max-w-6xl mx-auto px-4 py-10"><p className="text-secondary">No favorites yet.</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h3 className="text-2xl font-semibold text-text">My Favorites</h3>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {state.favorites.map((f) => (
          <div key={f.id} className="card-surface overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
              {f.poster_url ? (
                <img
                  src={f.poster_url}
                  alt={f.title}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span className="text-secondary text-sm">No Poster</span>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-text font-semibold truncate">{f.title}</h4>
              <p className="text-secondary text-sm mt-1">Saved on {new Date(f.created_at || Date.now()).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { getTrending } from '../services/tmdb';
import { fetchSavedMovies } from '../services/backend';
import MovieCard from './MovieCard';

/**
 * PUBLIC_INTERFACE
 * TrendingMovies
 * Fetches and renders trending movies from TMDB or saved movies from backend.
 * Props:
 *  - period: 'day' | 'week' (default 'day')
 *  - useBackend: boolean (default false) if true, fetch from /api/movies
 */
export default function TrendingMovies({ period = 'day', useBackend = false }) {
  const [state, setState] = useState({ loading: true, error: '', movies: [] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setState({ loading: true, error: '', movies: [] });
      let data, error;
      if (useBackend) {
        const res = await fetchSavedMovies();
        data = res?.data?.data || [];
        error = res?.error;
      } else {
        const res = await getTrending(period);
        data = res?.data || [];
        error = res?.error;
      }
      if (!mounted) return;
      if (error) {
        setState({
          loading: false,
          error: error.message || 'Failed to load movies.',
          movies: [],
        });
      } else {
        // Backend 'movies' table might store rows without TMDB fields; normalize minimally
        const normalized = Array.isArray(data) ? data.map((m) => ({
          id: m.id || m.movie_id || m.tmdb_id || m.uuid || Math.random(),
          title: m.title || m.name || m.original_title || 'Untitled',
          poster_path: m.poster_path || m.poster_url || '',
          release_date: m.release_date || m.year || '',
          vote_average: m.vote_average || m.rating || null,
          ...m,
        })) : [];
        setState({ loading: false, error: '', movies: useBackend ? normalized : data });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [period, useBackend]);

  if (state.loading) {
    return <p className="text-secondary mt-4">Loading movies...</p>;
  }

  if (state.error) {
    return <p className="text-error mt-4">Error: {state.error}</p>;
  }

  if (!state.movies.length) {
    return <p className="text-secondary mt-4">No movies found.</p>;
  }

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {state.movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}

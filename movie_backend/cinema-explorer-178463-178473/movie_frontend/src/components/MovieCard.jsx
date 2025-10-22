import React, { useState } from 'react';
import { getPosterUrl } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';
import { createFavorite } from '../services/backend';

/**
 * PUBLIC_INTERFACE
 * MovieCard
 * Displays a movie poster, title, release year, and vote average.
 * Props:
 *  - movie: TMDB Movie object
 */
export default function MovieCard({ movie }) {
  const title = movie?.title || movie?.name || 'Untitled';
  const year = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = typeof movie?.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A';
  const poster = movie?.poster_url || getPosterUrl(movie?.poster_path, 'w342');
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const onSaveFavorite = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const payload = {
        user_id: user.id,
        movie_id: movie?.id || movie?.movie_id || '',
        title,
        poster_url: poster || '',
      };
      const { error } = await createFavorite(payload);
      if (error) {
        // eslint-disable-next-line no-alert
        alert(`Failed to save favorite: ${error.message}`);
      } else {
        // eslint-disable-next-line no-alert
        alert('Saved to Favorites!');
      }
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(`Error saving favorite: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className="h-56 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="text-secondary text-sm">No Poster</span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-text font-semibold truncate">{title}</h4>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-secondary">{year}</span>
          <span className="font-medium text-text">⭐ {rating}</span>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className={`btn-primary ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!user || saving}
            onClick={user ? onSaveFavorite : undefined}
            title={!user ? 'Sign in to save favorites' : (saving ? 'Saving...' : 'Save to Favorites')}
          >
            {saving ? 'Saving...' : 'Save to Favorites'}
          </button>
        </div>
      </div>
    </div>
  );
}

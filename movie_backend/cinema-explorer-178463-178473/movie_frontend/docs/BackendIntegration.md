# Backend Integration

The React frontend communicates with the Flask backend for:
- Fetching saved movies from Supabase (`GET /api/movies`)
- Creating attendance records (`POST /api/register`)
- Managing favorites (`POST /api/favorites`, `GET /api/favorites/{user_id}`)

## Environment

- `REACT_APP_BACKEND_URL` (e.g., `http://localhost:3001`): Base URL for the Flask backend
- `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY`: Supabase client configuration (Auth)
- `REACT_APP_TMDB_API_KEY`: TMDB v4 token (for TMDB features)

Create a `.env.local` at `movie_frontend/` or use `.env.example` as a template.

## API Client

The frontend uses `src/services/backend.js` which:
- Resolves the backend base URL from `REACT_APP_BACKEND_URL` or falls back to `http://localhost:3001`
- Exposes:
  - `fetchSavedMovies({ page, limit })`
  - `createAttendance({ user_id, email })`
  - `createFavorite({ user_id, movie_id, title, poster_url })`
  - `getFavorites(userId)`

## UI Integration

- TrendingMovies component supports a `useBackend` prop to fetch from `/api/movies`.
- MovieCard includes an "Save to Favorites" button when authenticated to post to `/api/favorites`.
- FavoritesPage renders `/api/favorites/{user_id}` results for the logged-in user.
- RegisterPage posts to `/api/register` with user_id and email.

If tables are missing in Supabase, the UI shows empty states; the backend returns helpful messages.

# Cinema Explorer - Flask Backend Setup

This backend provides REST endpoints for saved movies, favorites, and attendance, backed by Supabase.

## Prerequisites
- Python 3.10+
- A Supabase project
- Environment configured via `.env` (see `.env.example`)

## Environment Variables
Copy `.env.example` to `.env` and fill the values.

- SUPABASE_URL: your Supabase project URL
- SUPABASE_SERVICE_ROLE_KEY: service role key (used by backend for writes; never expose to frontend)
- SUPABASE_ANON_KEY: optional anon key (not required here)
- FRONTEND_ORIGIN: CORS allowlist for frontend (e.g., http://localhost:3000)
- SITE_URL: optional; used by docs or future features
- FLASK_ENV: development
- PORT: container/environment-defined port (default 3001 in this project)

## Install Dependencies
Python dependencies are listed in `requirements.txt`. Ensure `supabase` is installed.

## Run
The environment starts the Flask app on port 3001 in the workspace. To run locally:
```
export $(cat .env | xargs)  # load env (bash)
python run.py
```

Docs available at: `/docs` (Swagger UI)

## Endpoints

Base URL: `http://localhost:3001`

- GET `/api/movies`
  - Query params: `page` (default 1), `limit` (default 20)
  - Returns saved movies from Supabase `movies` table.
  - If table is missing, returns an empty list with a helpful message.

- POST `/api/register`
  - Body: `{ "user_id": "uuid", "email": "user@example.com" }`
  - Inserts into `attendance` with `timestamp` set server-side.
  - Response: inserted row.

- POST `/api/favorites`
  - Body: `{ "user_id": "uuid", "movie_id": "123", "title": "Movie", "poster_url": "https://..." }`
  - Inserts into `favorites` with `created_at` server-side.
  - Response: inserted row.

- GET `/api/favorites/{user_id}`
  - Returns favorites for the specified user, ordered by `created_at DESC`.

### Error Handling
- Validation errors: 400 JSON body `{ "error": "message" }`
- Server/Supabase errors: 500 JSON body with a non-sensitive message.

### Auth Tokens
The API accepts an Authorization: Bearer token header for future verification, but JWT validation is not enforced for Day 4. Do not send the service role key to the frontend.

## Data Flow
Frontend (React) → Flask Backend → Supabase Tables:
- `movies` (optional / saved movies)
- `favorites` (id, user_id, movie_id, title, poster_url, created_at)
- `attendance` (id, user_id, email, timestamp)

If any table is missing, the backend returns a graceful response with guidance.


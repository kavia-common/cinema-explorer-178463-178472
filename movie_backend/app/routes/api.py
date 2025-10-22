from flask import request
from flask_smorest import Blueprint
from flask.views import MethodView
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from ...supabase_client import get_supabase

blp = Blueprint(
    "API",
    "api",
    url_prefix="/api",
    description="Endpoints for movies (saved), favorites, and attendance integrated with Supabase.",
)

def _json_error(message: str, status: int = 400, details: Optional[dict] = None):
    payload = {"error": message}
    if details:
        payload["details"] = details
    return payload, status

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _require_supabase() -> Tuple[Any, Optional[Tuple[dict, int]]]:
    """Ensure Supabase client is available and required env vars exist."""
    try:
        client = get_supabase()
        return client, None
    except Exception:
        # Avoid leaking secrets. Provide actionable message.
        return None, _json_error(
            "Supabase is not configured on the backend. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the backend environment.",
            500,
        )

def _validate_json(required_fields: List[str]) -> Tuple[Optional[Dict[str, Any]], Optional[Tuple[dict, int]]]:
    if not request.is_json:
        return None, _json_error("Request must be application/json", 400)
    data = request.get_json(silent=True) or {}
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return None, _json_error(f"Missing required fields: {', '.join(missing)}", 400)
    return data, None


@blp.route("/movies")
class Movies(MethodView):
    """Fetch saved movies from Supabase 'movies' table. If table does not exist, returns an empty list."""

    # PUBLIC_INTERFACE
    def get(self):
        """
        Get saved movies.

        query:
          - page (int, optional): page number (default 1)
          - limit (int, optional): page size (default 20)

        Returns:
          - 200: JSON object with data and pagination metadata
          - 500: if Supabase misconfigured or other server error
        """
        page = max(1, int(request.args.get("page", 1) or 1))
        limit = min(100, max(1, int(request.args.get("limit", 20) or 20)))
        start = (page - 1) * limit
        end = start + limit - 1

        client, err = _require_supabase()
        if err:
            return err

        try:
            # Count total if supported by table
            res = client.table("movies").select("*", count="exact").range(start, end).execute()
            rows = res.data or []
            total = res.count or 0
            total_pages = (total + limit - 1) // limit if total else 0
            meta = {
                "total": total,
                "total_pages": total_pages,
                "first_page": 1,
                "last_page": total_pages or 1,
                "page": page,
                "previous_page": max(1, page - 1) if page > 1 else None,
                "next_page": page + 1 if total_pages and page < total_pages else None,
            }
            return {"data": rows, "meta": meta}, 200
        except Exception as e:
            # If table doesn't exist or any other error, return empty with helpful message.
            # eslint-disable-next-line no-console in Python equivalent:
            print("GET /api/movies error:", str(e))
            return {"data": [], "message": "Table 'movies' not found or no records yet."}, 200


@blp.route("/register")
class Register(MethodView):
    """Create an attendance record into Supabase 'attendance' table."""

    # PUBLIC_INTERFACE
    def post(self):
        """
        Register attendance.

        Body (application/json):
          - user_id (string, required)
          - email (string, required)

        The backend sets:
          - timestamp (ISO-8601, server time)

        Returns:
          - 201: JSON object with inserted record
          - 400: validation error
          - 500: server or Supabase error
        """
        data, err = _validate_json(["user_id", "email"])
        if err:
            return err

        client, err = _require_supabase()
        if err:
            return err

        payload = {
            "user_id": data["user_id"],
            "email": data["email"],
            "timestamp": _now_iso(),
        }
        try:
            res = client.table("attendance").insert(payload).execute()
            rows = res.data or []
            return {"data": rows[0] if rows else payload}, 201
        except Exception as e:
            print("POST /api/register error:", str(e))
            return _json_error("Failed to register attendance. Ensure 'attendance' table exists.", 500)


@blp.route("/favorites")
class FavoritesCreate(MethodView):
    """Insert a favorite movie record into Supabase 'favorites' table."""

    # PUBLIC_INTERFACE
    def post(self):
        """
        Add favorite movie.

        Body (application/json):
          - user_id (string, required)
          - movie_id (string|number, required)
          - title (string, required)
          - poster_url (string, required)

        Backend sets:
          - created_at (ISO-8601, server time)

        Returns:
          - 201: inserted favorite
          - 400: validation error
          - 500: server or Supabase error
        """
        data, err = _validate_json(["user_id", "movie_id", "title", "poster_url"])
        if err:
            return err

        client, err = _require_supabase()
        if err:
            return err

        payload = {
            "user_id": data["user_id"],
            "movie_id": str(data["movie_id"]),
            "title": str(data["title"]),
            "poster_url": str(data["poster_url"]),
            "created_at": _now_iso(),
        }
        try:
            res = client.table("favorites").insert(payload).execute()
            rows = res.data or []
            return {"data": rows[0] if rows else payload}, 201
        except Exception as e:
            print("POST /api/favorites error:", str(e))
            return _json_error("Failed to save favorite. Ensure 'favorites' table exists.", 500)


@blp.route("/favorites/<string:user_id>")
class FavoritesList(MethodView):
    """List favorites for a given user_id."""

    # PUBLIC_INTERFACE
    def get(self, user_id: str):
        """
        Get favorites for a user.

        Params:
          - user_id (path): Supabase auth user ID

        Returns:
          - 200: array of favorites ordered by created_at desc
          - 500: server or Supabase error
        """
        client, err = _require_supabase()
        if err:
            return err

        try:
            res = (
                client.table("favorites")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return {"data": res.data or []}, 200
        except Exception as e:
            print("GET /api/favorites/<user_id> error:", str(e))
            return _json_error("Failed to fetch favorites. Ensure 'favorites' table exists.", 500)

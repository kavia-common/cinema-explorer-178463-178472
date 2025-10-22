import os
from typing import Optional

try:
    # The official Supabase Python client
    from supabase import create_client, Client
except Exception:  # pragma: no cover - handled gracefully if package missing
    create_client = None  # type: ignore
    Client = object  # type: ignore


# Cache for the singleton client instance
_client: Optional["Client"] = None


# PUBLIC_INTERFACE
def get_supabase() -> "Client":
    """Return a lazily initialized Supabase client.

    This function creates the client on first use using environment variables:
    SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_KEY.
    It does not perform any network calls at import time. Subsequent calls
    return the cached instance.

    Raises:
        RuntimeError: If required environment variables are missing or if the
                      Supabase client library is not installed.

    Returns:
        Client: An instance of the Supabase client.
    """
    global _client

    if _client is not None:
        return _client

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise RuntimeError(
            "Supabase env vars not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )

    if create_client is None:
        raise RuntimeError(
            "Supabase Python client not installed. Please add 'supabase' to requirements."
        )

    _client = create_client(supabase_url, supabase_key)
    return _client

import os

def load_environment(app):
    """
    Load Supabase and site-related configuration from environment variables.
    """
    app.config['SUPABASE_URL'] = os.getenv('SUPABASE_URL', '')
    # Prefer service role for backend operations; fall back to SUPABASE_KEY for backward compatibility
    app.config['SUPABASE_SERVICE_ROLE_KEY'] = os.getenv('SUPABASE_SERVICE_ROLE_KEY', os.getenv('SUPABASE_KEY', ''))
    app.config['SUPABASE_ANON_KEY'] = os.getenv('SUPABASE_ANON_KEY', '')
    app.config['SITE_URL'] = os.getenv('SITE_URL', '')
    app.config['FRONTEND_ORIGIN'] = os.getenv('FRONTEND_ORIGIN', '*')

def _create_supabase(url: str, key: str):
    try:
        # Requires: pip install supabase
        from supabase import create_client
        return create_client(url, key)
    except Exception:
        return None

def get_supabase_client():
    """
    Lazily create a Supabase client, if the Python package is installed.
    Returns the client instance or None if not available.
    Uses the service role key for privileged backend writes.
    """
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY')
    if not url or not key:
        return None
    return _create_supabase(url, key)

import os

def load_environment(app):
    """
    Load Supabase and site-related configuration from environment variables.
    """
    app.config['SUPABASE_URL'] = os.getenv('SUPABASE_URL', '')
    app.config['SUPABASE_KEY'] = os.getenv('SUPABASE_KEY', '')
    app.config['SITE_URL'] = os.getenv('SITE_URL', '')

def get_supabase_client():
    """
    Lazily create a Supabase client, if the Python package is installed.
    Returns the client instance or None if not available.
    """
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY')
    if not url or not key:
        return None
    try:
        # Requires: pip install supabase
        from supabase import create_client
    except Exception:
        return None
    return create_client(url, key)

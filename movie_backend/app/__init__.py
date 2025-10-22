from flask import Flask
from flask_cors import CORS
from flask_smorest import Api
from .routes.health import blp as health_blp
from .config import load_environment
import os

# Import API routes blueprint (movies, favorites, attendance)
try:
    from .routes.api import blp as api_blp
except Exception:
    api_blp = None  # Will be None before routes are added

app = Flask(__name__)
app.url_map.strict_slashes = False

# Load environment-based configuration (Supabase URL/Key, FRONTEND_ORIGIN, etc.)
load_environment(app)

# Configure CORS; default to "*" if FRONTEND_ORIGIN not provided (Day 4 leniency)
frontend_origin = os.getenv("FRONTEND_ORIGIN", "*") or "*"
CORS(app, resources={r"/*": {"origins": frontend_origin}})

# OpenAPI / Swagger UI configuration
app.config["API_TITLE"] = "Cinema Explorer Backend API"
app.config["API_VERSION"] = "v1"
app.config["OPENAPI_VERSION"] = "3.0.3"
app.config['OPENAPI_URL_PREFIX'] = '/docs'
app.config["OPENAPI_SWAGGER_UI_PATH"] = ""
app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

api = Api(app)

# Register blueprints
api.register_blueprint(health_blp)
if api_blp is not None:
    api.register_blueprint(api_blp)

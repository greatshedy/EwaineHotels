from pathlib import Path
from pydantic_settings import BaseSettings, SettingsError


class Settings(BaseSettings):
    astra_db_token: str
    astra_db_api_endpoint: str
    astra_db_keyspace: str = "default_keyspace"

    jwt_secret: str
    jwt_expiry_hours: int = 24

    admin_email: str
    admin_password: str

    cors_origins: str = "http://localhost:5173"
    flask_env: str = "development"

    model_config = {
        "env_file": str(Path(__file__).parent / ".env"),
        "env_file_encoding": "utf-8",
    }


settings = Settings()

REQUIRED_IN_PRODUCTION = ["astra_db_token", "astra_db_api_endpoint", "jwt_secret", "admin_email", "admin_password"]
if settings.flask_env == "production":
    missing = [k for k in REQUIRED_IN_PRODUCTION if not getattr(settings, k, None)]
    if missing:
        raise SettingsError(f"Missing required env vars in production: {', '.join(missing)}")

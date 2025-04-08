from authx import AuthX, AuthXConfig
from datetime import timedelta

config = AuthXConfig()
config.JWT_SECRET_KEY = "secret"
config.JWT_ACCESS_COOKIE_NAME = "techno"
config.JWT_TOKEN_LOCATION = ["cookies"]
config.JWT_COOKIE_CSRF_PROTECT = False
config.JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=3650)

security = AuthX(config=config)
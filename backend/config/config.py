import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'campusride-secret-key-12345')
    # Use absolute path for sqlite database to avoid confusion when running from different working dirs
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{os.path.join(BASE_DIR, "campusride.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session config
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    # In a real environment, set to True if HTTPS is used
    SESSION_COOKIE_SECURE = False

from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager
from database import db
from config.config import Config
from models.models import User
from routes.auth import auth_bp
from routes.api import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ]
    )
    
    # Initialize DB
    db.init_app(app)
    
    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
        
    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication credentials are required'}), 401

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Root routes
    @app.route('/')
    def root():
        return jsonify({
            'name': 'CampusRide API',
            'version': '1.0.0',
            'status': 'healthy'
        }), 200

    # Error Handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    # Ensure tables exist
    with app.app_context():
        db.create_all()
        try:
            if User.query.first() is None:
                print("No users found in SQLite database. Executing automatic seeding...")
                from seed import seed_db
                seed_db(drop_tables=False)
        except Exception as e:
            print(f"Error checking/seeding database at startup: {e}")
        
    return app

app = create_app()

if __name__ == '__main__':
    # Run the server on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
    # Dev reload check comment

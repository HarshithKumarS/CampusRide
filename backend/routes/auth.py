from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from database import db
from models.models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'student')  # 'student', 'driver', 'admin'
    phone = data.get('phone')
    roll_number = data.get('roll_number')
    gender = data.get('gender', 'female')  # 'male', 'female'
    is_staff = data.get('is_staff', False)
    
    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
        
    user = User(
        email=email, 
        name=name, 
        role=role, 
        phone=phone, 
        roll_number=roll_number,
        gender=gender,
        is_staff=is_staff
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully', 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
        
    login_user(user, remember=True)
    return jsonify({'message': 'Logged in successfully', 'user': user.to_dict()}), 200

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
def me():
    if not current_user.is_authenticated:
        return jsonify({'authenticated': False}), 200
    return jsonify({'authenticated': True, 'user': current_user.to_dict()}), 200

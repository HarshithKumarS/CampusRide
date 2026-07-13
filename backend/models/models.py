from datetime import datetime
from database import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'driver', 'admin'
    phone = db.Column(db.String(20), nullable=True)
    roll_number = db.Column(db.String(50), nullable=True)  # Roll number / license
    gender = db.Column(db.String(10), nullable=True, default='female')  # 'male', 'female'
    is_staff = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    reservations = db.relationship('Reservation', backref='student', lazy=True, cascade="all, delete-orphan")
    buses = db.relationship('Bus', backref='driver', lazy=True)
    temp_assignments = db.relationship('TemporaryAssignment', backref='driver', lazy=True)
    alternate_requests = db.relationship('AlternateBusRequest', backref='student', lazy=True, cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'phone': self.phone,
            'roll_number': self.roll_number,
            'gender': self.gender,
            'is_staff': self.is_staff,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Bus(db.Model):
    __tablename__ = 'buses'
    
    id = db.Column(db.Integer, primary_key=True)
    bus_number = db.Column(db.String(20), unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False, default=65)  # Updated to 65 (13 rows * 5)
    plate_number = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active')
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    reservations = db.relationship('Reservation', backref='bus', lazy=True)
    active_journeys = db.relationship('ActiveJourney', backref='bus', lazy=True, cascade="all, delete-orphan")
    temp_assignments = db.relationship('TemporaryAssignment', backref='bus', lazy=True, cascade="all, delete-orphan")
    alternate_original = db.relationship('AlternateBusRequest', foreign_keys='AlternateBusRequest.original_bus_id', backref='original_bus', lazy=True)
    alternate_requested = db.relationship('AlternateBusRequest', foreign_keys='AlternateBusRequest.requested_bus_id', backref='requested_bus', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'bus_number': self.bus_number,
            'capacity': self.capacity,
            'plate_number': self.plate_number,
            'status': self.status,
            'driver_id': self.driver_id,
            'driver_name': self.driver.name if self.driver else None
        }

class Route(db.Model):
    __tablename__ = 'routes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_location = db.Column(db.String(100), nullable=False)
    end_location = db.Column(db.String(100), nullable=False)
    schedule_time = db.Column(db.String(50), nullable=False)
    stops = db.Column(db.Text, nullable=False)
    
    # Relationships
    reservations = db.relationship('Reservation', backref='route', lazy=True)
    active_journeys = db.relationship('ActiveJourney', backref='route', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'start_location': self.start_location,
            'end_location': self.end_location,
            'schedule_time': self.schedule_time,
            'stops': [s.strip() for s in self.stops.split(',')] if self.stops else []
        }

class Reservation(db.Model):
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    seat_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='active')  # 'active', 'cancelled'
    booking_date = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'bus_id': self.bus_id,
            'bus_number': self.bus.bus_number if self.bus else None,
            'route_id': self.route_id,
            'route_name': self.route.name if self.route else None,
            'seat_number': self.seat_number,
            'status': self.status,
            'booking_date': self.booking_date,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Announcement(db.Model):
    __tablename__ = 'announcements'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    target_role = db.Column(db.String(20), nullable=False, default='all')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    author = db.relationship('User', foreign_keys=[author_id])

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'target_role': self.target_role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'author_name': self.author.name if self.author else 'Admin'
        }

class ActiveJourney(db.Model):
    __tablename__ = 'active_journeys'
    
    id = db.Column(db.Integer, primary_key=True)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='scheduled')
    current_stop = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'bus_id': self.bus_id,
            'bus_number': self.bus.bus_number if self.bus else None,
            'route_id': self.route_id,
            'route_name': self.route.name if self.route else None,
            'status': self.status,
            'current_stop': self.current_stop,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class TemporaryAssignment(db.Model):
    __tablename__ = 'temporary_assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    booking_date = db.Column(db.String(20), nullable=False)
    reason = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'bus_id': self.bus_id,
            'bus_number': self.bus.bus_number if self.bus else None,
            'driver_id': self.driver_id,
            'driver_name': self.driver.name if self.driver else None,
            'booking_date': self.booking_date,
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AlternateBusRequest(db.Model):
    __tablename__ = 'alternate_bus_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    requested_bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    booking_date = db.Column(db.String(20), nullable=False)
    reason = db.Column(db.String(250), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # 'pending', 'approved', 'rejected'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else None,
            'original_bus_id': self.original_bus_id,
            'original_bus_number': self.original_bus.bus_number if self.original_bus else None,
            'requested_bus_id': self.requested_bus_id,
            'requested_bus_number': self.requested_bus.bus_number if self.requested_bus else None,
            'booking_date': self.booking_date,
            'reason': self.reason,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

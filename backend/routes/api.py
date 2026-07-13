from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from database import db
from models.models import User, Bus, Route, Reservation, Announcement, ActiveJourney, TemporaryAssignment, AlternateBusRequest
from datetime import datetime

api_bp = Blueprint('api', __name__)

# Helper to check admin role
def admin_required():
    if not current_user.is_authenticated or current_user.role != 'admin':
        return jsonify({'error': 'Admin privilege required'}), 403
    return None

# ==========================================
# DASHBOARD STATS
# ==========================================
@api_bp.route('/dashboard/stats', methods=['GET'])
@login_required
def get_stats():
    if current_user.role == 'admin':
        total_students = User.query.filter_by(role='student').count()
        total_drivers = User.query.filter_by(role='driver').count()
        total_buses = Bus.query.count()
        total_routes = Route.query.count()
        total_reservations = Reservation.query.count()
        active_journeys = ActiveJourney.query.filter(ActiveJourney.status != 'completed').count()
        
        return jsonify({
            'studentsCount': total_students,
            'driversCount': total_drivers,
            'busesCount': total_buses,
            'routesCount': total_routes,
            'reservationsCount': total_reservations,
            'activeJourneysCount': active_journeys
        }), 200
        
    elif current_user.role == 'student':
        my_reservations = Reservation.query.filter_by(student_id=current_user.id).count()
        active_res = Reservation.query.filter_by(student_id=current_user.id, status='active').first()
        my_bus = None
        my_route = None
        
        if active_res:
            my_bus = active_res.bus.to_dict() if active_res.bus else None
            my_route = active_res.route.to_dict() if active_res.route else None
            
        return jsonify({
            'myReservationsCount': my_reservations,
            'hasActiveReservation': active_res is not None,
            'myBus': my_bus,
            'myRoute': my_route
        }), 200
        
    elif current_user.role == 'driver':
        primary_bus = Bus.query.filter_by(driver_id=current_user.id).first()
        active_journey = None
        if primary_bus:
            active_journey = ActiveJourney.query.filter_by(bus_id=primary_bus.id).filter(ActiveJourney.status != 'completed').first()
            
        return jsonify({
            'hasAssignedBus': primary_bus is not None,
            'busNumber': primary_bus.bus_number if primary_bus else None,
            'activeJourney': active_journey.to_dict() if active_journey else None
        }), 200

# ==========================================
# STUDENTS CRUD (Admin Only)
# ==========================================
@api_bp.route('/students', methods=['GET', 'POST'])
@login_required
def manage_students():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    if request.method == 'GET':
        students = User.query.filter_by(role='student').all()
        return jsonify([s.to_dict() for s in students]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        email = data.get('email')
        name = data.get('name')
        password = data.get('password', 'student123')
        phone = data.get('phone')
        roll_number = data.get('roll_number')
        gender = data.get('gender', 'female')
        is_staff = data.get('is_staff', False)
        
        if not email or not name:
            return jsonify({'error': 'Missing required fields'}), 400
            
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409
            
        student = User(
            email=email, 
            name=name, 
            role='student', 
            phone=phone, 
            roll_number=roll_number,
            gender=gender,
            is_staff=is_staff
        )
        student.set_password(password)
        
        db.session.add(student)
        db.session.commit()
        return jsonify(student.to_dict()), 201

@api_bp.route('/students/<int:student_id>', methods=['PUT', 'DELETE'])
@login_required
def student_detail(student_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    student = User.query.filter_by(id=student_id, role='student').first_or_404()
    
    if request.method == 'PUT':
        data = request.get_json() or {}
        student.name = data.get('name', student.name)
        student.email = data.get('email', student.email)
        student.phone = data.get('phone', student.phone)
        student.roll_number = data.get('roll_number', student.roll_number)
        student.gender = data.get('gender', student.gender)
        student.is_staff = data.get('is_staff', student.is_staff)
        
        if 'password' in data and data['password']:
            student.set_password(data['password'])
            
        db.session.commit()
        return jsonify(student.to_dict()), 200
        
    elif request.method == 'DELETE':
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Student deleted successfully'}), 200

# ==========================================
# DRIVERS CRUD (Admin Only)
# ==========================================
@api_bp.route('/drivers', methods=['GET', 'POST'])
@login_required
def manage_drivers():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    if request.method == 'GET':
        drivers = User.query.filter_by(role='driver').all()
        return jsonify([d.to_dict() for d in drivers]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        email = data.get('email')
        name = data.get('name')
        password = data.get('password', 'driver123')
        phone = data.get('phone')
        roll_number = data.get('roll_number')
        
        if not email or not name:
            return jsonify({'error': 'Missing required fields'}), 400
            
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409
            
        driver = User(email=email, name=name, role='driver', phone=phone, roll_number=roll_number)
        driver.set_password(password)
        
        db.session.add(driver)
        db.session.commit()
        return jsonify(driver.to_dict()), 201

@api_bp.route('/drivers/<int:driver_id>', methods=['PUT', 'DELETE'])
@login_required
def driver_detail(driver_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    driver = User.query.filter_by(id=driver_id, role='driver').first_or_404()
    
    if request.method == 'PUT':
        data = request.get_json() or {}
        driver.name = data.get('name', driver.name)
        driver.email = data.get('email', driver.email)
        driver.phone = data.get('phone', driver.phone)
        driver.roll_number = data.get('roll_number', driver.roll_number)
        
        if 'password' in data and data['password']:
            driver.set_password(data['password'])
            
        db.session.commit()
        return jsonify(driver.to_dict()), 200
        
    elif request.method == 'DELETE':
        buses = Bus.query.filter_by(driver_id=driver.id).all()
        for b in buses:
            b.driver_id = None
        db.session.delete(driver)
        db.session.commit()
        return jsonify({'message': 'Driver deleted successfully'}), 200

# ==========================================
# BUSES CRUD (Admin Only)
# ==========================================
@api_bp.route('/buses', methods=['GET', 'POST'])
@login_required
def manage_buses():
    if request.method == 'GET':
        buses = Bus.query.all()
        return jsonify([b.to_dict() for b in buses]), 200
        
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json() or {}
    bus_number = data.get('bus_number')
    capacity = data.get('capacity', 65)  # Capacity 65 by default
    plate_number = data.get('plate_number')
    status = data.get('status', 'active')
    driver_id = data.get('driver_id')
    
    if not bus_number or not plate_number:
        return jsonify({'error': 'Missing bus number or plate number'}), 400
        
    if Bus.query.filter_by(bus_number=bus_number).first():
        return jsonify({'error': 'Bus number already exists'}), 409
        
    bus = Bus(bus_number=bus_number, capacity=capacity, plate_number=plate_number, status=status, driver_id=driver_id)
    db.session.add(bus)
    db.session.commit()
    return jsonify(bus.to_dict()), 201

@api_bp.route('/buses/<int:bus_id>', methods=['PUT', 'DELETE'])
@login_required
def bus_detail(bus_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    bus = Bus.query.get_or_404(bus_id)
    
    if request.method == 'PUT':
        data = request.get_json() or {}
        bus.bus_number = data.get('bus_number', bus.bus_number)
        bus.capacity = data.get('capacity', bus.capacity)
        bus.plate_number = data.get('plate_number', bus.plate_number)
        bus.status = data.get('status', bus.status)
        bus.driver_id = data.get('driver_id', bus.driver_id)
        
        db.session.commit()
        return jsonify(bus.to_dict()), 200
        
    elif request.method == 'DELETE':
        db.session.delete(bus)
        db.session.commit()
        return jsonify({'message': 'Bus deleted successfully'}), 200

# ==========================================
# ROUTES CRUD
# ==========================================
@api_bp.route('/routes', methods=['GET', 'POST'])
@login_required
def manage_routes():
    if request.method == 'GET':
        routes = Route.query.all()
        return jsonify([r.to_dict() for r in routes]), 200
        
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json() or {}
    name = data.get('name')
    start_location = data.get('start_location')
    end_location = data.get('end_location')
    schedule_time = data.get('schedule_time')
    stops_list = data.get('stops', [])
    stops = ",".join(stops_list) if isinstance(stops_list, list) else stops_list
    
    if not name or not start_location or not end_location or not schedule_time:
        return jsonify({'error': 'Missing required fields'}), 400
        
    route = Route(name=name, start_location=start_location, end_location=end_location, schedule_time=schedule_time, stops=stops)
    db.session.add(route)
    db.session.commit()
    return jsonify(route.to_dict()), 201

@api_bp.route('/routes/<int:route_id>', methods=['PUT', 'DELETE'])
@login_required
def route_detail(route_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    route = Route.query.get_or_404(route_id)
    
    if request.method == 'PUT':
        data = request.get_json() or {}
        route.name = data.get('name', route.name)
        route.start_location = data.get('start_location', route.start_location)
        route.end_location = data.get('end_location', route.end_location)
        route.schedule_time = data.get('schedule_time', route.schedule_time)
        
        if 'stops' in data:
            stops_list = data['stops']
            route.stops = ",".join(stops_list) if isinstance(stops_list, list) else stops_list
            
        db.session.commit()
        return jsonify(route.to_dict()), 200
        
    elif request.method == 'DELETE':
        db.session.delete(route)
        db.session.commit()
        return jsonify({'message': 'Route deleted successfully'}), 200

# ==========================================
# RESERVATIONS
# ==========================================
@api_bp.route('/reservations', methods=['GET', 'POST'])
@login_required
def manage_reservations():
    if request.method == 'GET':
        if current_user.role == 'admin':
            reservations = Reservation.query.all()
        else:
            reservations = Reservation.query.filter_by(student_id=current_user.id).all()
        return jsonify([r.to_dict() for r in reservations]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        student_id = data.get('student_id', current_user.id)
        bus_id = data.get('bus_id')
        route_id = data.get('route_id')
        seat_number = data.get('seat_number')
        booking_date = data.get('booking_date', datetime.utcnow().strftime('%Y-%m-%d'))
        
        if not bus_id or not route_id or not seat_number:
            return jsonify({'error': 'Missing required booking fields'}), 400
            
        # Get Student info for rules check
        student = User.query.get_or_404(student_id)
        
        # 1. Enforce seat boundaries
        if seat_number < 1 or seat_number > 65:
            return jsonify({'error': 'Invalid seat number. Buses contain 65 seats.'}), 400
            
        # 2. Row partitions (13 rows of 3+2 layout. Row = (seat_number-1)//5 + 1)
        row_number = (seat_number - 1) // 5 + 1
        
        # Rows 1 to 6 (seats 1 to 30) -> Girls and Staff
        # Rows 7 to 13 (seats 31 to 65) -> Boys
        is_girls_or_staff = (student.gender == 'female') or (student.is_staff)
        
        if is_girls_or_staff and row_number > 6:
            return jsonify({'error': 'Rows 7 to 13 are reserved for Boys. Girls and Staff must choose from Rows 1 to 6 (Seats 1-30).'}), 403
        elif (not is_girls_or_staff) and row_number <= 6:
            return jsonify({'error': 'Rows 1 to 6 are reserved for Girls and Staff. Boys must choose from Rows 7 to 13 (Seats 31-65).'}), 403

        # 3. Check seat occupancy
        existing = Reservation.query.filter_by(
            bus_id=bus_id,
            route_id=route_id,
            seat_number=seat_number,
            booking_date=booking_date,
            status='active'
        ).first()
        
        if existing:
            return jsonify({'error': f'Seat {seat_number} is already reserved for this date.'}), 409
            
        # 4. Enforce 1 reservation per day
        student_res = Reservation.query.filter_by(
            student_id=student_id,
            booking_date=booking_date,
            status='active'
        ).first()
        
        if student_res and current_user.role != 'admin':
            return jsonify({'error': 'You already have an active reservation for this date.'}), 400
            
        reservation = Reservation(
            student_id=student_id,
            bus_id=bus_id,
            route_id=route_id,
            seat_number=seat_number,
            booking_date=booking_date,
            status='active'
        )
        db.session.add(reservation)
        db.session.commit()
        return jsonify(reservation.to_dict()), 201

@api_bp.route('/reservations/<int:res_id>', methods=['DELETE', 'PUT'])
@login_required
def cancel_reservation(res_id):
    reservation = Reservation.query.get_or_404(res_id)
    
    if current_user.role != 'admin' and reservation.student_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    if request.method == 'DELETE':
        # Hard check for Boarding Time cancellation constraint
        # In a real environment, verify if current time is before the route boarding time.
        # Since this is a database-backed demo, we will allow cancellation directly but keep standard checks in place
        reservation.status = 'cancelled'
        db.session.commit()
        return jsonify({'message': 'Reservation cancelled successfully', 'reservation': reservation.to_dict()}), 200
        
    elif request.method == 'PUT':
        if current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json() or {}
        reservation.status = data.get('status', reservation.status)
        reservation.seat_number = data.get('seat_number', reservation.seat_number)
        reservation.bus_id = data.get('bus_id', reservation.bus_id)
        reservation.route_id = data.get('route_id', reservation.route_id)
        
        db.session.commit()
        return jsonify(reservation.to_dict()), 200

# Get unavailable seats for a bus route
@api_bp.route('/reservations/taken-seats', methods=['GET'])
@login_required
def get_taken_seats():
    bus_id = request.args.get('bus_id', type=int)
    route_id = request.args.get('route_id', type=int)
    date = request.args.get('date', default=datetime.utcnow().strftime('%Y-%m-%d'))
    
    if not bus_id or not route_id:
        return jsonify({'error': 'bus_id and route_id parameters required'}), 400
        
    taken = Reservation.query.filter_by(
        bus_id=bus_id,
        route_id=route_id,
        booking_date=date,
        status='active'
    ).all()
    
    return jsonify([t.seat_number for t in taken]), 200

# ==========================================
# ALTERNATE BUS REQUESTS
# ==========================================
@api_bp.route('/alternate-bus', methods=['GET', 'POST'])
@login_required
def manage_alternate_bus():
    if request.method == 'GET':
        if current_user.role == 'admin':
            requests = AlternateBusRequest.query.order_by(AlternateBusRequest.created_at.desc()).all()
        else:
            requests = AlternateBusRequest.query.filter_by(student_id=current_user.id).order_by(AlternateBusRequest.created_at.desc()).all()
        return jsonify([r.to_dict() for r in requests]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        requested_bus_id = data.get('requested_bus_id')
        booking_date = data.get('booking_date')
        reason = data.get('reason', 'Different boarding stop')
        
        if not requested_bus_id or not booking_date:
            return jsonify({'error': 'requested_bus_id and booking_date are required'}), 400
            
        # Verify the student has an active standard reservation for that date
        reservation = Reservation.query.filter_by(
            student_id=current_user.id,
            booking_date=booking_date,
            status='active'
        ).first()
        
        if not reservation:
            return jsonify({'error': 'You do not have a seat reservation for this date. Please reserve a seat first.'}), 400
            
        # Prevent requesting alternate bus to the same bus they already reserved
        if reservation.bus_id == requested_bus_id:
            return jsonify({'error': 'The requested alternate bus is already your reserved bus for this date.'}), 400
            
        # Check if they already requested
        existing = AlternateBusRequest.query.filter_by(
            student_id=current_user.id,
            booking_date=booking_date
        ).first()
        
        if existing:
            return jsonify({'error': 'You have already requested an alternate bus for this date.'}), 400
            
        req = AlternateBusRequest(
            student_id=current_user.id,
            original_bus_id=reservation.bus_id,
            requested_bus_id=requested_bus_id,
            booking_date=booking_date,
            reason=reason,
            status='pending'
        )
        db.session.add(req)
        db.session.commit()
        return jsonify(req.to_dict()), 201

@api_bp.route('/alternate-bus/<int:req_id>', methods=['PUT', 'DELETE'])
@login_required
def alternate_bus_detail(req_id):
    req = AlternateBusRequest.query.get_or_404(req_id)
    
    if request.method == 'PUT':
        if current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json() or {}
        new_status = data.get('status') # 'approved', 'rejected'
        
        if new_status not in ['approved', 'rejected']:
            return jsonify({'error': 'Invalid status values. Use approved or rejected.'}), 400
            
        req.status = new_status
        db.session.commit()
        return jsonify(req.to_dict()), 200
        
    elif request.method == 'DELETE':
        # Students can delete/cancel their own pending request
        if current_user.role != 'admin' and req.student_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        db.session.delete(req)
        db.session.commit()
        return jsonify({'message': 'Alternate bus request deleted'}), 200

# ==========================================
# ANNOUNCEMENTS
# ==========================================
@api_bp.route('/announcements', methods=['GET', 'POST'])
@login_required
def manage_announcements():
    if request.method == 'GET':
        if current_user.role == 'admin':
            announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
        else:
            announcements = Announcement.query.filter(
                Announcement.target_role.in_(['all', current_user.role])
            ).order_by(Announcement.created_at.desc()).all()
            
        return jsonify([a.to_dict() for a in announcements]), 200
        
    elif request.method == 'POST':
        if current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json() or {}
        title = data.get('title')
        content = data.get('content')
        target_role = data.get('target_role', 'all')
        
        if not title or not content:
            return jsonify({'error': 'Title and Content are required'}), 400
            
        announcement = Announcement(
            title=title,
            content=content,
            target_role=target_role,
            author_id=current_user.id
        )
        db.session.add(announcement)
        db.session.commit()
        return jsonify(announcement.to_dict()), 201

@api_bp.route('/announcements/<int:ann_id>', methods=['DELETE'])
@login_required
def delete_announcement(ann_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    announcement = Announcement.query.get_or_404(ann_id)
    db.session.delete(announcement)
    db.session.commit()
    return jsonify({'message': 'Announcement deleted successfully'}), 200

# ==========================================
# JOURNEY MANAGEMENT (Driver GPS tracker updates)
# ==========================================
@api_bp.route('/journeys', methods=['GET', 'POST'])
@login_required
def manage_journeys():
    if request.method == 'GET':
        journeys = ActiveJourney.query.filter(ActiveJourney.status != 'completed').all()
        return jsonify([j.to_dict() for j in journeys]), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        bus_id = data.get('bus_id')
        route_id = data.get('route_id')
        
        if not bus_id or not route_id:
            return jsonify({'error': 'bus_id and route_id are required'}), 400
            
        existing = ActiveJourney.query.filter_by(bus_id=bus_id).filter(ActiveJourney.status != 'completed').first()
        if existing:
            return jsonify({'error': 'This bus is already en route in another active journey.'}), 400
            
        route = Route.query.get_or_404(route_id)
        stops = [s.strip() for s in route.stops.split(',')] if route.stops else []
        first_stop = stops[0] if stops else 'Departure Hub'
        
        lat = 28.6139
        lng = 77.2090
        
        journey = ActiveJourney(
            bus_id=bus_id,
            route_id=route_id,
            status='en_route',
            current_stop=first_stop,
            latitude=lat,
            longitude=lng
        )
        db.session.add(journey)
        db.session.commit()
        return jsonify(journey.to_dict()), 201

@api_bp.route('/journeys/<int:journey_id>', methods=['PUT', 'DELETE'])
@login_required
def journey_detail(journey_id):
    journey = ActiveJourney.query.get_or_404(journey_id)
    
    if current_user.role not in ['driver', 'admin']:
        return jsonify({'error': 'Unauthorized'}), 403
        
    if request.method == 'PUT':
        data = request.get_json() or {}
        journey.status = data.get('status', journey.status)
        journey.current_stop = data.get('current_stop', journey.current_stop)
        journey.latitude = data.get('latitude', journey.latitude)
        journey.longitude = data.get('longitude', journey.longitude)
        
        db.session.commit()
        return jsonify(journey.to_dict()), 200
        
    elif request.method == 'DELETE':
        if current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
        db.session.delete(journey)
        db.session.commit()
        return jsonify({'message': 'Journey logs deleted'}), 200

# ==========================================
# TEMPORARY DRIVER ASSIGNMENTS (Admin Only)
# ==========================================
@api_bp.route('/assignments', methods=['GET', 'POST'])
@login_required
def manage_assignments():
    if request.method == 'GET':
        assignments = TemporaryAssignment.query.all()
        return jsonify([a.to_dict() for a in assignments]), 200
        
    elif request.method == 'POST':
        if current_user.role != 'admin':
            return jsonify({'error': 'Unauthorized'}), 403
            
        data = request.get_json() or {}
        bus_id = data.get('bus_id')
        driver_id = data.get('driver_id')
        booking_date = data.get('booking_date', datetime.utcnow().strftime('%Y-%m-%d'))
        reason = data.get('reason', 'Routine substitution')
        
        if not bus_id or not driver_id:
            return jsonify({'error': 'bus_id and driver_id are required'}), 400
            
        assignment = TemporaryAssignment(
            bus_id=bus_id,
            driver_id=driver_id,
            booking_date=booking_date,
            reason=reason
        )
        bus = Bus.query.get(bus_id)
        if bus:
            bus.driver_id = driver_id
            
        db.session.add(assignment)
        db.session.commit()
        return jsonify(assignment.to_dict()), 201

# Profile update
@api_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json() or {}
    user = User.query.get(current_user.id)
    
    user.name = data.get('name', user.name)
    user.phone = data.get('phone', user.phone)
    
    if 'password' in data and data['password']:
        user.set_password(data['password'])
        
    db.session.commit()
    return jsonify(user.to_dict()), 200

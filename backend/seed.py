from app import app
from database import db
from models.models import User, Bus, Route, Announcement, ActiveJourney

def seed_db():
    print("Seeding database with updated rules...")
    
    # 1. Clear existing tables
    db.drop_all()
    db.create_all()
    
    # 2. Create standard users
    admin = User(
        email="admin@campusride.col",
        name="Administrator",
        role="admin",
        phone="+15550100",
        roll_number="ADM-001"
    )
    admin.set_password("admin123")
    db.session.add(admin)
    
    driver1 = User(
        email="driver1@campusride.col",
        name="John Doe",
        role="driver",
        phone="+15550201",
        roll_number="LIC-8827-01"
    )
    driver1.set_password("driver123")
    db.session.add(driver1)

    driver2 = User(
        email="driver2@campusride.col",
        name="James Smith",
        role="driver",
        phone="+15550202",
        roll_number="LIC-9918-02"
    )
    driver2.set_password("driver123")
    db.session.add(driver2)
    
    # Alice Cooper: Female Student
    student1 = User(
        email="student@campusride.col",
        name="Alice Cooper",
        role="student",
        phone="+15550301",
        roll_number="STU-2026-0042",
        gender="female",
        is_staff=False
    )
    student1.set_password("student123")
    db.session.add(student1)

    # Bob: Male Student
    student2 = User(
        email="bob@campusride.col",
        name="Bob Marley",
        role="student",
        phone="+15550302",
        roll_number="STU-2026-0043",
        gender="male",
        is_staff=False
    )
    student2.set_password("bob123")
    db.session.add(student2)

    # Professor: Staff member (Male but is_staff=True, so has access to girls/staff rows)
    student3 = User(
        email="prof@campusride.col",
        name="Professor Higgins",
        role="student",
        phone="+15550303",
        roll_number="STF-2026-0099",
        gender="male",
        is_staff=True
    )
    student3.set_password("prof123")
    db.session.add(student3)
    
    db.session.commit()
    print("Users created: admin, driver1, driver2, Alice (female), Bob (male), Prof (staff)")
    
    # 3. Create Routes
    route_a = Route(
        name="Route A - North Campus Express",
        start_location="Central Station Metro",
        end_location="North Campus Gate 4",
        schedule_time="08:00 AM",
        stops="Central Metro, Sector 12 Hub, Sector 15 Cross, Engineering Block, North Campus Gate 4"
    )
    db.session.add(route_a)

    route_b = Route(
        name="Route B - South Campus Commuter",
        start_location="Downtown Residency",
        end_location="South Campus Main Gate",
        schedule_time="08:30 AM",
        stops="Downtown Residency, West Park, Lakeview Complex, Medical Block, South Campus Main Gate"
    )
    db.session.add(route_b)

    route_c = Route(
        name="Route C - Main Campus Loop",
        start_location="Hostel Block A",
        end_location="Administration Building",
        schedule_time="09:00 AM",
        stops="Hostel Block A, Girls Hostel, Central Library, Sports Arena, Administration Building"
    )
    db.session.add(route_c)
    
    db.session.commit()
    print("Routes created")
    
    # 4. Create Buses with 65 Capacity
    bus1 = Bus(
        bus_number="B01",
        capacity=65,
        plate_number="DL-1Y-7829",
        status="active",
        driver_id=driver1.id
    )
    db.session.add(bus1)

    bus2 = Bus(
        bus_number="B02",
        capacity=65,
        plate_number="DL-1Y-3928",
        status="active",
        driver_id=driver2.id
    )
    db.session.add(bus2)

    bus3 = Bus(
        bus_number="B03",
        capacity=65,
        plate_number="DL-1Y-9021",
        status="maintenance",
        driver_id=None
    )
    db.session.add(bus3)
    
    db.session.commit()
    print("Buses created with capacity=65")
    
    # 5. Create Announcements
    ann1 = Announcement(
        title="Welcome to CampusRide 2026!",
        content="CampusRide is now active. Enforced rules: Rows 1 to 6 (Seats 1-30) are strictly for Girls and Staff. Rows 7 to 13 (Seats 31-65) are for Boys.",
        target_role="all",
        author_id=admin.id
    )
    db.session.add(ann1)
    
    db.session.commit()
    print("Announcements seeded")
    
    # 6. Seed active journey simulator
    journey = ActiveJourney(
        bus_id=bus1.id,
        route_id=route_a.id,
        status="en_route",
        current_stop="Sector 12 Hub",
        latitude=28.6200,
        longitude=77.2150
    )
    db.session.add(journey)
    db.session.commit()
    print("Active journeys seeded")
    
    print("Database seeded successfully with updated rules!")

if __name__ == '__main__':
    with app.app_context():
        seed_db()

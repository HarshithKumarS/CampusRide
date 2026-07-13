import requests
import time

def test_full_integration():
    url = "http://localhost:5000/api"
    session = requests.Session()
    
    print("\n--- 1. Login as Admin ---")
    res = session.post(f"{url}/auth/login", json={"email": "admin@campusride.col", "password": "admin123"})
    print("Admin login:", res.status_code, res.json().get('message'))
    
    print("\n--- 2. Fetch KPI Stats ---")
    res = session.get(f"{url}/dashboard/stats")
    print("KPIs:", res.json())
    
    print("\n--- 3. Fetch Students List ---")
    res = session.get(f"{url}/students")
    students = res.json()
    print(f"Students in DB: {len(students)}")
    for s in students:
        print(f" - {s['name']} ({s['gender']}, Staff: {s['is_staff']})")
        
    print("\n--- 4. Register a New Student via Admin ---")
    new_student_payload = {
        "name": "Integration Tester",
        "email": "tester@campusride.col",
        "password": "tester123",
        "phone": "+15559999",
        "roll_number": "STU-2026-9999",
        "gender": "male",
        "is_staff": False
    }
    res = session.post(f"{url}/students", json=new_student_payload)
    print("Student register status:", res.status_code)
    if res.status_code == 201:
        print("Registered student data:", res.json())
        tester_id = res.json()['id']
    else:
        print("Registration failed:", res.text)
        return
        
    print("\n--- 5. Log Out Admin ---")
    session.post(f"{url}/auth/logout")
    
    print("\n--- 6. Log In as Female Student (Alice) ---")
    res = session.post(f"{url}/auth/login", json={"email": "student@campusride.col", "password": "student123"})
    print("Alice login:", res.status_code, res.json()['user']['name'])
    
    print("\n--- 7. Fetch Seating Mapping and Choose Seat (Alice) ---")
    # Let's see what seats are taken for Bus B01, Route A (id: 1, 1) on tomorrow's date
    tomorrow = "2026-07-15"
    res = session.get(f"{url}/reservations/taken-seats", params={"bus_id": 1, "route_id": 1, "date": tomorrow})
    print("Taken seats for Bus 1, Route 1:", res.json())
    
    # Alice reserves seat 5 (Row 1, reserved for Girls & Staff)
    res = session.post(f"{url}/reservations", json={
        "bus_id": 1,
        "route_id": 1,
        "seat_number": 5,
        "booking_date": tomorrow
    })
    print("Alice booking seat 5 status:", res.status_code)
    if res.status_code == 201:
        print("Reservation successful:", res.json())
    else:
        print("Reservation failed:", res.json())
        
    # Alice tries to reserve seat 40 (Row 8, reserved for Boys) -> Should fail!
    res = session.post(f"{url}/reservations", json={
        "bus_id": 1,
        "route_id": 1,
        "seat_number": 40,
        "booking_date": tomorrow
    })
    print("Alice booking boys seat 40 status:", res.status_code)
    print("Error response (expected 403):", res.json())
    
    print("\n--- 8. Submit Alternate Bus Request (Alice) ---")
    # Alice requests alternate Bus B02 (id: 2)
    res = session.post(f"{url}/alternate-bus", json={
        "requested_bus_id": 2,
        "booking_date": tomorrow,
        "reason": "Commuting from alternate station today"
    })
    print("Alternate request status:", res.status_code)
    if res.status_code == 201:
        req_data = res.json()
        print("Alternate request created:", req_data)
        req_id = req_data['id']
    else:
        print("Alternate request failed:", res.json())
        return
        
    print("\n--- 9. Log Out Alice ---")
    session.post(f"{url}/auth/logout")
    
    print("\n--- 10. Log In as Admin to Approve Request ---")
    session.post(f"{url}/auth/login", json={"email": "admin@campusride.col", "password": "admin123"})
    
    # Approve alternate request
    res = session.put(f"{url}/alternate-bus/{req_id}", json={"status": "approved"})
    print("Admin approve request status:", res.status_code)
    print("Approved request details:", res.json())
    
    # Cleanup: Delete the registered student Tester to reset database state
    print("\n--- 11. Cleanup test student ---")
    res = session.delete(f"{url}/students/{tester_id}")
    print("Deleted test student status:", res.status_code)
    
    print("\n--- Integration Verification Complete! ---")

if __name__ == '__main__':
    test_full_integration()

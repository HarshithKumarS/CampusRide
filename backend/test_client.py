import requests

def test_login():
    url = "http://localhost:5000/api"
    session = requests.Session()
    
    # 1. Test unauthenticated /me
    res = session.get(f"{url}/auth/me")
    print("Unauth /me:", res.json())
    
    # 2. Login as admin
    payload = {"email": "admin@campusride.col", "password": "admin123"}
    res = session.post(f"{url}/auth/login", json=payload)
    print("Login:", res.status_code, res.json())
    print("Cookies after login:", session.cookies.get_dict())
    
    # 3. Test authenticated /me
    res = session.get(f"{url}/auth/me")
    print("Auth /me:", res.json())
    
    # 4. Test admin stats
    res = session.get(f"{url}/dashboard/stats")
    print("Dashboard stats:", res.status_code, res.json())
    
    # 5. Test students list
    res = session.get(f"{url}/students")
    print("Students list:", res.status_code, len(res.json()), "students loaded.")

if __name__ == '__main__':
    # Start the Flask app first or make sure it's running
    import sys
    import threading
    import time
    from app import app
    
    # Run server in background thread
    server = threading.Thread(target=lambda: app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False))
    server.daemon = True
    server.start()
    
    time.sleep(1) # wait for server to start
    test_login()

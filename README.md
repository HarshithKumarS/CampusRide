# CampusRide – College Bus Tracking and Seat Reservation System

CampusRide is a complete, production-quality university shuttle tracking and seat reservation system. It includes a Python Flask API backend connected to an SQLite database, and a React + TypeScript + Vite + Tailwind CSS v4 frontend.

---

## Technical Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, React Router, Axios, Lucide Icons, Framer Motion
- **Backend**: Python Flask, Flask-SQLAlchemy, Flask-Login, Flask-CORS
- **Database**: SQLite

---

## Directory Structure

```
CampusRide/
├── frontend/             # React SPA + Tailwind v4
│   ├── src/
│   │   ├── context/      # Authentication and Theme state
│   │   ├── layouts/      # Dashboard and Public layouts
│   │   ├── pages/        # Home, About, Contact, Login, and Role-specific views
│   │   ├── services/     # Axios client configuration
│   │   └── index.css     # Tailwind CSS & keyframe animations
├── backend/              # Flask Backend Service
│   ├── config/           # Database configuration
│   ├── database/         # SQLite database session builder
│   ├── models/           # SQLAlchemy schemas (User, Bus, Route, Reservation, Announcements)
│   ├── routes/           # API Endpoints (Auth, CRUD, Reservations, Tracking)
│   └── seed.py           # Seed script to reset database and load test accounts
```

---

## Setup & Running Guide

### 1. Run the Backend Service
From the workspace root, navigate to the `backend/` folder:

```bash
cd backend
```

Create a virtual environment and activate it:
* **Windows (PowerShell)**:
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
* **macOS / Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

Install dependencies:
```bash
pip install -r requirements.txt
```

Reset and seed the SQLite database:
```bash
python seed.py
```

Run the development server (runs on `http://127.0.0.1:5000`):
```bash
python app.py
```

---

### 2. Run the Frontend App
Open a new terminal session, navigate to the `frontend/` folder:

```bash
cd frontend
```

Install packages:
```bash
npm install
```

Start the Vite development server (runs on `http://localhost:5173`):
```bash
npm run dev
```

---

## Demo Credentials (Pre-seeded)

Use these pre-configured user credentials to log in to the role panels:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Student** | `student@campusride.col` | `student123` |
| **Driver** | `driver1@campusride.col` | `driver123` |
| **Admin** | `admin@campusride.col` | `admin123` |

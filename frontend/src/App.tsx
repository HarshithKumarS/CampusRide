import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentMyBus from './pages/student/MyBus';
import StudentReserveSeat from './pages/student/ReserveSeat';
import StudentTrackBus from './pages/student/TrackBus';
import StudentBookingHistory from './pages/student/BookingHistory';
import StudentAnnouncements from './pages/student/Announcements';
import StudentProfile from './pages/student/Profile';
import StudentAlternateBus from './pages/student/AlternateBus';

// Driver Pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverJourney from './pages/driver/Journey';
import DriverProfile from './pages/driver/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminDrivers from './pages/admin/Drivers';
import AdminBuses from './pages/admin/Buses';
import AdminRoutes from './pages/admin/Routes';
import AdminReservations from './pages/admin/Reservations';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminReports from './pages/admin/Reports';

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: ('student' | 'driver' | 'admin')[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
            </Route>

            {/* Student Dashboard Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="my-bus" element={<StudentMyBus />} />
              <Route path="reserve-seat" element={<StudentReserveSeat />} />
              <Route path="track-bus" element={<StudentTrackBus />} />
              <Route path="alternate-bus" element={<StudentAlternateBus />} />
              <Route path="booking-history" element={<StudentBookingHistory />} />
              <Route path="announcements" element={<StudentAnnouncements />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* Driver Dashboard Routes */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="journey" element={<DriverJourney />} />
              <Route path="profile" element={<DriverProfile />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="drivers" element={<AdminDrivers />} />
              <Route path="buses" element={<AdminBuses />} />
              <Route path="routes" element={<AdminRoutes />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

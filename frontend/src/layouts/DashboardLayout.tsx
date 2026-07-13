import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Menu, X, Sun, Moon, LogOut, LayoutDashboard, Bus, 
  Ticket, MapPin, History, Megaphone, User as UserIcon, 
  Users, UserCheck, Route as RouteIcon, 
  CalendarDays, FileSpreadsheet, ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Sidebar Links based on Role
  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Bus', path: '/student/my-bus', icon: Bus },
    { name: 'Reserve Seat', path: '/student/reserve-seat', icon: Ticket },
    { name: 'Track Bus', path: '/student/track-bus', icon: MapPin },
    { name: 'Temp Assignment', path: '/student/alternate-bus', icon: ArrowRightLeft },
    { name: 'Booking History', path: '/student/booking-history', icon: History },
    { name: 'Announcements', path: '/student/announcements', icon: Megaphone },
    { name: 'Profile', path: '/student/profile', icon: UserIcon },
  ];

  const driverLinks = [
    { name: 'Dashboard', path: '/driver/dashboard', icon: LayoutDashboard },
    { name: 'Journey Management', path: '/driver/journey', icon: RouteIcon },
    { name: 'Profile', path: '/driver/profile', icon: UserIcon },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Drivers', path: '/admin/drivers', icon: UserCheck },
    { name: 'Buses', path: '/admin/buses', icon: Bus },
    { name: 'Routes', path: '/admin/routes', icon: RouteIcon },
    { name: 'Reservations', path: '/admin/reservations', icon: CalendarDays },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Reports', path: '/admin/reports', icon: FileSpreadsheet },
  ];

  const getLinksByRole = () => {
    switch (user.role) {
      case 'student': return studentLinks;
      case 'driver': return driverLinks;
      case 'admin': return adminLinks;
      default: return [];
    }
  };

  const links = getLinksByRole();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Bus className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary dark:text-blue-400">CampusRide</span>
        </Link>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* User Info Capsule */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold truncate leading-4">{user.name}</h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-500'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Theme & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${theme === 'dark' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden md:flex md:flex-shrink-0 md:w-64">
        <div className="w-full">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex flex-col flex-1 w-full max-w-xs"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 md:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-400 capitalize">{user.role} Dashboard</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Views Wrapper */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

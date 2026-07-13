import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bus, Ticket, MapPin, Megaphone, CalendarDays, ArrowRight } from 'lucide-react';

interface Stats {
  myReservationsCount: number;
  hasActiveReservation: boolean;
  myBus: any;
  myRoute: any;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  author_name: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, annRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/announcements')
        ]);
        setStats(statsRes.data);
        setAnnouncements(annRes.data.slice(0, 3)); // Only show top 3
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back! Manage your reservations and track your campus ride.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">My Reservations</span>
            <h3 className="text-3xl font-bold">{stats?.myReservationsCount || 0}</h3>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Reservation Status</span>
            <h3 className="text-lg font-bold">
              {stats?.hasActiveReservation ? 'Active Reservation' : 'No Active Booking'}
            </h3>
          </div>
          <div className={`p-3 rounded-2xl ${stats?.hasActiveReservation ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Ticket className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Bus</span>
            <h3 className="text-lg font-bold">{stats?.myBus?.bus_number || 'None'}</h3>
          </div>
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Bus className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Active Reservation or Booking CTA (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold">Active Commute Details</h3>
            
            {stats?.hasActiveReservation ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Bus Assigned</span>
                    <p className="font-semibold">{stats.myBus?.bus_number} ({stats.myBus?.plate_number})</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Route Name</span>
                    <p className="font-semibold">{stats.myRoute?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Scheduled Time</span>
                    <p className="font-semibold">{stats.myRoute?.schedule_time}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Driver Contact</span>
                    <p className="font-semibold">{stats.myBus?.driver_name || 'TBD'}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/student/track-bus"
                    className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center text-sm shadow-md shadow-blue-500/10"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Track Live Bus
                  </Link>
                  <Link
                    to="/student/my-bus"
                    className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-sm border border-slate-200 dark:border-slate-750"
                  >
                    Bus Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-slate-500 dark:text-slate-400">
                  You have not reserved a seat for today's commute. Book in advance to secure your seat.
                </p>
                <Link
                  to="/student/reserve-seat"
                  className="inline-flex items-center px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all text-sm group"
                >
                  Reserve a Seat Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Announcements (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center">
                <Megaphone className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Announcements
              </h3>
              <Link to="/student/announcements" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-850">
              {announcements.length > 0 ? (
                announcements.map((ann, i) => (
                  <div key={ann.id} className={`${i > 0 ? 'pt-4' : ''} space-y-1`}>
                    <h4 className="font-semibold text-sm leading-snug">{ann.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <span className="block text-[10px] text-slate-400 pt-1">
                      By {ann.author_name} • {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                  No active announcements for students.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

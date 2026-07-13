import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, UserCheck, Bus, Route as RouteIcon, CalendarDays, Navigation } from 'lucide-react';

interface Stats {
  studentsCount: number;
  driversCount: number;
  busesCount: number;
  routesCount: number;
  reservationsCount: number;
  activeJourneysCount: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching admin dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const kpis = [
    { name: 'Total Students', value: stats?.studentsCount || 0, icon: Users, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
    { name: 'Active Drivers', value: stats?.driversCount || 0, icon: UserCheck, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
    { name: 'Total Buses', value: stats?.busesCount || 0, icon: Bus, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' },
    { name: 'Total Routes', value: stats?.routesCount || 0, icon: RouteIcon, color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400' },
    { name: 'Active Bookings', value: stats?.reservationsCount || 0, icon: CalendarDays, color: 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
    { name: 'Active Journeys', value: stats?.activeJourneysCount || 0, icon: Navigation, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Operations Command</h1>
        <p className="text-slate-500 dark:text-slate-400">High-level metric command console overseeing buses, routes, bookings, and alerts.</p>
      </div>

      {/* Grid of KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.name} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.name}</span>
                <h3 className="text-3xl font-extrabold">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick overview layout info */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xl font-bold">Transit Command Summary</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Use the navigation links in the sidebar to add new buses, trace schedules, allocate temporary substitute drivers on route blockades, or broadcast announcements targeting specific user segments. Live GPS coordinates of drivers en route are updated on active passenger terminals in real-time.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

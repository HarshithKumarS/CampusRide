import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bus, MapPin, Route as RouteIcon, ArrowRight } from 'lucide-react';

interface DriverStats {
  hasAssignedBus: boolean;
  busNumber: string | null;
  activeJourney: any | null;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching driver stats', err);
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Driver Hub</h1>
        <p className="text-slate-500 dark:text-slate-400">View your assigned vehicle status and update your active coordinates on route.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Bus</span>
            <h3 className="text-2xl font-bold">{stats?.hasAssignedBus ? `Bus ${stats.busNumber}` : 'No Bus Assigned'}</h3>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Bus className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase">Current Status</span>
            <h3 className="text-lg font-bold">
              {stats?.activeJourney ? 'En Route (Active)' : 'Idle / Off Duty'}
            </h3>
          </div>
          <div className={`p-3 rounded-2xl ${stats?.activeJourney ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <MapPin className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-xl font-bold">Shift Dispatch Command</h3>

        {stats?.hasAssignedBus ? (
          stats.activeJourney ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-md text-green-700 dark:text-green-400 flex items-center">
                    <RouteIcon className="h-5 w-5 mr-2" />
                    Active Commute Running
                  </h4>
                  <span className="text-xs text-slate-400">ID: Journey #{stats.activeJourney.id}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Route Name</span>
                    <span className="font-semibold">{stats.activeJourney.route_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Last Registered Stop</span>
                    <span className="font-semibold">{stats.activeJourney.current_stop || 'Departure Hub'}</span>
                  </div>
                </div>
              </div>
              
              <Link
                to="/driver/journey"
                className="inline-flex items-center px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 text-sm group"
              >
                Manage Journey Status
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You are currently clocked in and assigned to <strong>Bus {stats.busNumber}</strong>, but you have not initialized an active journey route logs yet.
              </p>
              <Link
                to="/driver/journey"
                className="inline-flex items-center px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 text-sm"
              >
                Initialize Journey Dispatch
              </Link>
            </div>
          )
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 space-y-2">
            <p>You have not been assigned to a shuttle bus by the transport administrator.</p>
            <span className="text-xs text-slate-450 block">Please contact the admin desk to register your vehicle details.</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;

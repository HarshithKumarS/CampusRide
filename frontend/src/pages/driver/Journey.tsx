import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Navigation, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface Route {
  id: number;
  name: string;
  schedule_time: string;
  stops: string[];
}

interface ActiveJourneyType {
  id: number;
  bus_id: number;
  bus_number: string;
  route_id: number;
  route_name: string;
  status: string;
  current_stop: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

const Journey: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [assignedBus, setAssignedBus] = useState<any>(null);
  const [activeJourney, setActiveJourney] = useState<ActiveJourneyType | null>(null);
  
  // Form input
  const [selectedRouteId, setSelectedRouteId] = useState<number | ''>('');
  const [selectedStop, setSelectedStop] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchJourneyState = async () => {
    try {
      const [routesRes, statsRes] = await Promise.all([
        api.get('/routes'),
        api.get('/dashboard/stats')
      ]);
      setRoutes(routesRes.data);
      
      if (statsRes.data.hasAssignedBus) {
        // Query detailed bus object
        const busesRes = await api.get('/buses');
        const bus = busesRes.data.find((b: any) => b.bus_number === statsRes.data.busNumber);
        setAssignedBus(bus);
        setActiveJourney(statsRes.data.activeJourney);
        if (statsRes.data.activeJourney) {
          setSelectedStop(statsRes.data.activeJourney.current_stop || '');
        }
      }
    } catch (err) {
      console.error('Error fetching driver state', err);
      setError('Failed to fetch dispatcher telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneyState();
  }, []);

  const handleStartJourney = async () => {
    if (!assignedBus || !selectedRouteId) {
      setError('Please select a route to start the commute.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await api.post('/journeys', {
        bus_id: assignedBus.id,
        route_id: selectedRouteId
      });
      setActiveJourney(res.data);
      setSelectedStop(res.data.current_stop || '');
      setSuccess('Journey started successfully! Student tracking is now active.');
      fetchJourneyState();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start journey.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStop = async () => {
    if (!activeJourney || !selectedStop) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Mock coordinate movement near Delhi NCR college campuses
    const mockLat = activeJourney.latitude + (Math.random() - 0.5) * 0.01;
    const mockLng = activeJourney.longitude + (Math.random() - 0.5) * 0.01;

    try {
      const res = await api.put(`/journeys/${activeJourney.id}`, {
        current_stop: selectedStop,
        latitude: mockLat,
        longitude: mockLng
      });
      setActiveJourney(res.data);
      setSuccess(`Coordinates updated at: ${selectedStop}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update coordinates.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteJourney = async () => {
    if (!activeJourney) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.put(`/journeys/${activeJourney.id}`, {
        status: 'completed'
      });
      setActiveJourney(null);
      setSelectedRouteId('');
      setSelectedStop('');
      setSuccess('Journey logs completed successfully and saved.');
      fetchJourneyState();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete journey.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRouteObj = activeJourney
    ? routes.find(r => r.id === activeJourney.route_id)
    : routes.find(r => r.id === selectedRouteId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!assignedBus) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center py-20 space-y-4">
        <AlertCircle className="h-16 w-16 mx-auto text-amber-500" />
        <h3 className="text-xl font-bold">No Bus Assigned</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          You cannot manage commute journeys because you are not registered/assigned to a bus in the database. Please request an administrator to allocate a bus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Journey Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Initialize live route tracking and log stopping checkpoints during your commute.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-sm flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 mr-1" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main interactive tracking panel */}
        <div className="lg:col-span-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {activeJourney ? (
              // Journey en-route manager
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-6 w-6 text-blue-600 animate-pulse" />
                    <h3 className="text-xl font-bold">Live Transit Dispatch</h3>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 animate-pulse">
                    En Route
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-slate-450 block text-xs uppercase font-bold">Active Vehicle</span>
                    <span className="font-semibold text-md">Bus {activeJourney.bus_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-xs uppercase font-bold">Route Name</span>
                    <span className="font-semibold text-md">{activeJourney.route_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-xs uppercase font-bold">Latitude Coordinates</span>
                    <span className="font-mono font-medium">{activeJourney.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-xs uppercase font-bold">Longitude Coordinates</span>
                    <span className="font-mono font-medium">{activeJourney.longitude.toFixed(6)}</span>
                  </div>
                </div>

                {/* Stop progression updating Form */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-sm">Log Current Checkpoint</h4>
                  <div className="flex gap-4">
                    <select
                      value={selectedStop}
                      onChange={(e) => setSelectedStop(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Select StopReached --</option>
                      {selectedRouteObj?.stops.map((stop: string) => (
                        <option key={stop} value={stop}>{stop}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={handleUpdateStop}
                      disabled={submitting || !selectedStop}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors cursor-pointer"
                    >
                      Log Checkpoint
                    </button>
                  </div>
                </div>

                {/* Terminate button */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={handleCompleteJourney}
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-black text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    Complete / Terminate Route
                  </button>
                </div>
              </div>
            ) : (
              // Journey initializer
              <div className="space-y-6">
                <h3 className="text-xl font-bold pb-4 border-b border-slate-100 dark:border-slate-800">Initialize Commute Shift</h3>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center space-x-3 text-xs text-blue-700 dark:text-blue-300">
                    <HelpCircle className="h-5 w-5 flex-shrink-0" />
                    <span>Select the campus shuttle route you are departing on. Your current vehicle registration is auto-selected.</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Shuttle Route</label>
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Choose Route --</option>
                      {routes.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.schedule_time})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleStartJourney}
                  disabled={submitting || !selectedRouteId}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  Start Active Commute Tracking
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right side: Route preview details (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold">Vehicle Details</h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-400">Assigned Bus:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Bus {assignedBus.bus_number}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-400">Plates Registration:</span>
                <span className="font-semibold">{assignedBus.plate_number}</span>
              </div>
              <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
                <span className="text-slate-400">Seating Cap limit:</span>
                <span className="font-semibold">{assignedBus.capacity} passengers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Check:</span>
                <span className="font-bold text-green-600 capitalize">{assignedBus.status}</span>
              </div>
            </div>

            {selectedRouteObj && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs">Route Stops Checklist</h4>
                <div className="space-y-2 text-xs">
                  {selectedRouteObj.stops.map((stop: string, idx: number) => (
                    <div key={stop} className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[9px] text-slate-500">
                        {idx + 1}
                      </span>
                      <span className="text-slate-650 dark:text-slate-350">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Journey;
